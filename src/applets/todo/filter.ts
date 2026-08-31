import St from 'gi://St';
import Clutter from 'gi://Clutter';
import { gettext as _ } from 'resource:///org/gnome/shell/extensions/extension.js';

import { TodoApplet } from './main.js';
import { compare_tasks } from './sort.js';
import * as Fs from './../../utils/fs.js';
import { ext } from './../../extension.js';
import { Task, TaskCard } from './task.js';
import * as Misc from './../../utils/misc.js';
import { Entry } from './../../utils/entry.js';
import * as P from './../../utils/markup/parser.js';
import { show_info_popup } from './../../utils/popup.js';
import { ScrollBox, LazyScrollBox } from './../../utils/scroll.js';
import { Button, CheckBox, ButtonBox } from './../../utils/button.js';

export class FilterGroup {
    title = '';
    filters = ''; // Comma separated list of filters.
}

export class KanbanView {
    actor: St.BoxLayout;

    constructor (applet: TodoApplet) {
        this.actor = new St.BoxLayout({ vertical: true, x_expand: true, style_class: 'cronomix-spacing' });

        //
        // Header
        //
        const header = new St.BoxLayout();
        this.actor.add_child(header);

        const add_note_button = new Button({ parent: header, icon: 'cronomix-plus-symbolic', label: _('Add Note'), style_class: 'cronomix-touch-button bg' });
        Misc.focus_when_mapped(add_note_button.actor);

        header.add_child(new St.Widget({ x_expand: true, style: 'min-width: 20px;' }));

        const button_box      = new ButtonBox(header, false);
        const search_button   = button_box.add({ icon: 'cronomix-search-symbolic' });
        const sort_button     = button_box.add({ icon: 'cronomix-sort-ascending-symbolic' });
        const boards_button   = button_box.add({ icon: 'cronomix-filter-symbolic' });
        const eximport_button = button_box.add({ icon: 'cronomix-import-export-symbolic' });
        const settings_button = button_box.add({ icon: 'cronomix-wrench-symbolic' });

        //
        // Project selector with autocomplete
        //
        const projects = new Set<string>();
        for (const task of applet.tasks) {
            for (const tag of task.ast.config.tags ?? []) {
                projects.add(tag);
            }
        }

        const project_box = new St.BoxLayout({ vertical: true, style_class: 'cronomix-spacing' });
        this.actor.add_child(project_box);

        const project_label = new St.Label({ text: _('Projects'), style: 'font-weight: bold;', style_class: 'cronomix-box' });
        project_box.add_child(project_label);

        const project_entry = new Entry(_('Type to filter projects...'));
        project_box.add_child(project_entry.actor);
        project_entry.actor.visible = projects.size > 0;

        const suggestions_scroll = new ScrollBox(false);
        project_box.add_child(suggestions_scroll.actor);
        suggestions_scroll.actor.visible = projects.size > 0;

        const suggestion_box = new St.BoxLayout({ style_class: 'cronomix-spacing cronomix-project-suggestions' });
        suggestions_scroll.box.add_child(suggestion_box);

        const project_list = Array.from(projects).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

        const render_suggestions = () => {
            const needle = project_entry.entry.text.toLowerCase();
            suggestion_box.destroy_all_children();

            const all_button = new Button({ parent: suggestion_box, label: _('All'), style_class: 'cronomix-project-button' });
            if (!applet.project_filter) all_button.actor.add_style_pseudo_class('checked');
            all_button.subscribe('left_click', () => { applet.project_filter = ''; applet.show_main_view(); });

            for (const project of project_list) {
                if (needle && !project.toLowerCase().includes(needle)) continue;
                const button = new Button({ parent: suggestion_box, label: project, style_class: 'cronomix-project-button' });
                if (applet.project_filter === project) button.actor.add_style_pseudo_class('checked');
                button.subscribe('left_click', () => { applet.project_filter = project; applet.show_main_view(); });
            }
        };

        project_entry.entry.clutter_text.connect('text-changed', () => render_suggestions());
        render_suggestions();

        project_entry.entry.clutter_text.connect('captured-event', (_: unknown, event: Clutter.Event) => {
            if (event.type() !== Clutter.EventType.KEY_PRESS) return Clutter.EVENT_PROPAGATE;
            if (event.get_key_symbol() === Clutter.KEY_Return || event.get_key_symbol() === Clutter.KEY_KP_Enter) {
                const text = project_entry.entry.text.trim();
                applet.project_filter = text;
                applet.show_main_view();
                return Clutter.EVENT_STOP;
            }
            return Clutter.EVENT_PROPAGATE;
        });

        //
        // columns
        //
        const columns_scroll = new ScrollBox(false);
        this.actor.add_child(columns_scroll.actor);
        columns_scroll.actor.visible = applet.tasks.length > 0;

        const selected_project = applet.project_filter.startsWith('@') ? applet.project_filter : `@${applet.project_filter}`;
        const project_filter = applet.project_filter ? `${selected_project} & !hide` : '';
        const current_filter = applet.storage.read.active_filter.value;
        const filters = applet.storage.read.filters.value[current_filter]?.filters?.replaceAll('\n', '')?.split(',');
        const columns = new Array<KanbanColumn>();

        // Make columns:
        const raw_filters = project_filter ? [project_filter] : filters ?? ['* & !hide'];
        for (const filter of raw_filters) {
            const filter_node = new P.Parser(filter).try_parse_filter();

            if (filter_node) {
                const column = new KanbanColumn(applet, filter_node, !!filters);
                columns_scroll.box.add_child(column.actor);
                columns.push(column);
            }
        }

        // Move tasks into corresponding columns:
        for (const task of applet.tasks) {
            for (const column of columns) {
                if (task.satisfies_filter(column.filter)) {
                    column.tasks.push(task);
                    break;
                }
            }
        }

        { // Sort and make task card widgets to the columns:
            const gen = function * (tasks: Task[]) {
                for (const [, task] of tasks.entries()) {
                    const card = new TaskCard(applet, task);
                    yield card.actor;
                }
            };

            const sort = applet.storage.read.sort.value;
            for (const column of columns) {
                column.tasks.sort((a, b) => compare_tasks(sort, a, b));
                column.tasks_scroll.set_children(column.tasks.length, gen(column.tasks));
            }
        }

        sort_button.subscribe('left_click', () => applet.show_sort_view());
        settings_button.subscribe('left_click', () => applet.show_settings());
        search_button.subscribe('left_click', () => applet.show_search_view());
        add_note_button.subscribe('left_click', () => applet.show_project_selector());
        eximport_button.subscribe('left_click', () => applet.show_eximport_view());
        boards_button.subscribe('left_click', () => applet.show_filter_view());
    }

    destroy () {
        this.actor.destroy();
    }
}

class KanbanColumn {
    filter: P.AstFilter;
    actor: St.BoxLayout;
    tasks = new Array<Task>();
    tasks_scroll: LazyScrollBox;

    constructor (applet: TodoApplet, filter: P.AstFilter, show_filter_header = true) {
        this.filter = filter;
        this.actor = new St.BoxLayout({ vertical: true, x_expand: true, style_class: 'cronomix-spacing' });

        if (show_filter_header) {
            const header = new St.Label({ y_align: Clutter.ActorAlign.CENTER, text: P.filter_to_string(filter), style: 'min-width: 300px; font-weight: bold;', style_class: 'cronomix-box' });
            this.actor.add_child(header);
        }

        this.tasks_scroll = new LazyScrollBox(applet.ext.storage.read.lazy_list_page_size.value);
        this.actor.add_child(this.tasks_scroll.actor);
    }
}

export class FilterView {
    actor: St.BoxLayout;

    #applet: TodoApplet;
    #cards_scroll: ScrollBox;
    #cards = Array<FilterCard>();
    #active_filter?: FilterCard | null;

    constructor (applet: TodoApplet) {
        this.#applet = applet;
        this.actor = new St.BoxLayout({ x_expand: true, vertical: true, style_class: 'cronomix-spacing' });

        this.#cards_scroll = new ScrollBox();
        this.actor.add_child(this.#cards_scroll.actor);
        for (const filter of applet.storage.read.filters.value) this.#add_card(filter);
        this.#cards_scroll.actor.visible = this.#cards_scroll.box.get_n_children() > 0;

        const buttons = new St.BoxLayout({ style_class: 'cronomix-spacing' });
        this.actor.add_child(buttons);

        const button_box  = new ButtonBox(buttons);
        const button_ok   = button_box.add({ wide: true, label: _('Ok') });
        const button_add  = button_box.add({ wide: true, label: _('Add Filter') });
        const button_help = new Button({ parent: buttons, icon: 'cronomix-question-symbolic' });

        Misc.focus_when_mapped(this.#cards_scroll.actor.visible ? button_ok.actor : button_add.actor);

        const help_msg =
            _('## Filter Groups') + '\n\n' +
            _('Each filter in a group creates a column of tasks in the main view.') + '\n' +
            _('If no group is selected, a group with 1 ``* & !hide`` filter is created.') + '\n' +
            _('Tasks go into the first column from the left whose filter they pass.') + '\n' +
            _('Hidden tasks only pass filters of the form ``hide`` or ``hide & expr``.') + '\n' +
            (Fs.read_entire_file(ext.path + '/data/docs/filters') ?? '');

        button_add.subscribe('left_click', () => this.#add_card(new FilterGroup()));
        button_help.subscribe('left_click', () => show_info_popup(button_help, help_msg));
        button_ok.subscribe('left_click', () => { this.#store_filters(); applet.show_main_view(); });
    }

    destroy () {
        this.actor.destroy();
    }

    #store_filters () {
        let active_filter = -1;
        const filters = new Array<FilterGroup>();

        for (const [idx, card] of this.#cards.entries()) {
            if (card.checkbox.checked) active_filter = idx;
            filters.push({ title: card.title.entry.text, filters: card.filters.entry.text })
        }

        this.#applet.storage.modify('filters', x => x.value = filters);
        this.#applet.storage.modify('active_filter', x => x.value = active_filter);
    }

    #add_card (group: Immutable<FilterGroup>) {
        const card = new FilterCard(group);
        this.#cards_scroll.box.add_child(card.actor);
        this.#cards_scroll.actor.visible = true;
        this.#cards.push(card);
        this.#check(card);

        if (this.#applet.storage.read.active_filter.value === this.#cards.length - 1) {
            this.#active_filter = card;
            card.checkbox.checked = true;
        }

        card.filters.entry.clutter_text.connect('text-changed', () => {
            this.#check(card);
        });
        card.delete_button.subscribe('left_click', () => {
            Misc.array_remove(this.#cards, card);
            card.actor.destroy();
            this.#cards_scroll.actor.visible = this.#cards_scroll.box.get_n_children() > 0;
        });
        card.checkbox.subscribe('left_click', () => {
            if (card.checkbox.checked) {
                if (this.#active_filter) this.#active_filter.checkbox.checked = false;
                this.#active_filter = card;
            } else {
                this.#active_filter = null;
            }
        });
    }

    #check (card: FilterCard) {
        const filters = card.filters.entry.text.replaceAll('\n', '').split(',');

        for (const filter of filters) {
            const parser = new P.Parser(filter);

            if (parser.try_parse_filter()) {
                card.filters.actor.remove_style_class_name('cronomix-red');
            } else {
                card.filters.actor.add_style_class_name('cronomix-red');
                break;
            }
        }
    }
}

class FilterCard extends Misc.Card {
    title: Entry;
    filters: Entry;
    checkbox: CheckBox;
    delete_button: Button;

    constructor (filter: Immutable<FilterGroup>) {
        super();

        this.checkbox = new CheckBox({ parent: this.left_header_box });
        this.delete_button = new Button({ parent: this.autohide_box, icon: 'cronomix-trash-symbolic', style_class: 'cronomix-floating-button' });

        this.title = new Entry(_('Title'));
        this.actor.add_child(this.title.actor);
        this.title.set_text(filter.title);

        this.filters = new Entry(_('Comma separated list of filters.'));
        this.actor.add_child(this.filters.actor);
        this.filters.set_text(filter.filters);
    }
}
