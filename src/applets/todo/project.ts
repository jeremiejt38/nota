import St from 'gi://St';
import Clutter from 'gi://Clutter';
import { gettext as _ } from 'resource:///org/gnome/shell/extensions/extension.js';

import { TodoApplet } from './main.js';
import * as Misc from './../../utils/misc.js';
import { Entry } from './../../utils/entry.js';
import { ScrollBox } from './../../utils/scroll.js';
import { Button, ButtonBox } from './../../utils/button.js';

export class ProjectSelector {
    actor: St.BoxLayout;

    #applet: TodoApplet;
    #entry: Entry;
    #scroll: ScrollBox;
    #suggestion_box: St.BoxLayout;
    #confirm_box: St.BoxLayout;
    #confirm_label: St.Label;
    #pending_project = '';
    #project_list: string[];

    constructor (applet: TodoApplet) {
        this.#applet = applet;

        this.actor = new St.BoxLayout({ vertical: true, x_expand: true, style_class: 'cronomix-spacing' });

        //
        // Header
        //
        const header = new St.BoxLayout({ style_class: 'cronomix-box' });
        this.actor.add_child(header);

        const title = new St.Label({ text: _('Select a project'), style: 'font-weight: bold;' });
        header.add_child(title);
        header.add_child(new St.Widget({ x_expand: true }));

        const close_button = new Button({ parent: header, icon: 'cronomix-close-symbolic', style_class: 'cronomix-floating-button' });
        close_button.subscribe('left_click', () => this.cancel());

        //
        // Search entry
        //
        this.#entry = new Entry(_('Type a project name...'));
        this.actor.add_child(this.#entry.actor);
        Misc.focus_when_mapped(this.#entry.entry);

        //
        // Suggestion list
        //
        this.#scroll = new ScrollBox(true);
        this.actor.add_child(this.#scroll.actor);
        this.#scroll.actor.y_expand = true;

        this.#suggestion_box = new St.BoxLayout({ vertical: true, x_expand: true, style_class: 'cronomix-spacing cronomix-project-suggestions' });
        this.#scroll.box.add_child(this.#suggestion_box);

        //
        // New-project confirmation
        //
        this.#confirm_box = new St.BoxLayout({ vertical: true, visible: false, style_class: 'cronomix-group cronomix-spacing' });
        this.actor.add_child(this.#confirm_box);

        this.#confirm_label = new St.Label({ style_class: 'cronomix-box', x_expand: true });
        this.#confirm_box.add_child(this.#confirm_label);

        const confirm_buttons = new ButtonBox(this.#confirm_box);
        const ok_button = confirm_buttons.add({ label: _('OK'), wide: true, style_class: 'cronomix-touch-button' });
        const cancel_button = confirm_buttons.add({ label: _('Cancel'), wide: true, style_class: 'cronomix-touch-button' });
        ok_button.subscribe('left_click', () => this.#open_editor(this.#pending_project));
        cancel_button.subscribe('left_click', () => this.#hide_confirm());

        //
        // Build the project list
        //
        const projects = new Set<string>();
        for (const task of applet.tasks) {
            for (const tag of task.ast.config.tags ?? []) {
                if (tag.startsWith('@')) {
                    projects.add(tag);
                } else {
                    projects.add('@' + tag);
                }
            }
        }

        this.#project_list = Array.from(projects).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

        this.#entry.entry.clutter_text.connect('text-changed', () => this.#on_text_changed());
        this.#entry.entry.clutter_text.connect('captured-event', (_: unknown, event: Clutter.Event) => this.#on_entry_event(event));

        this.#render();
    }

    destroy () {
        this.actor.destroy();
    }

    cancel () {
        this.#applet.show_main_view();
    }

    #on_text_changed () {
        this.#hide_confirm();
        this.#render();
    }

    #on_entry_event (event: Clutter.Event) {
        if (event.type() !== Clutter.EventType.KEY_PRESS) return Clutter.EVENT_PROPAGATE;

        const symbol = event.get_key_symbol();

        if (symbol === Clutter.KEY_Escape) {
            if (this.#confirm_box.visible) {
                this.#hide_confirm();
            } else {
                this.cancel();
            }
            return Clutter.EVENT_STOP;
        }

        if (symbol === Clutter.KEY_Return || symbol === Clutter.KEY_KP_Enter) {
            const text = this.#entry.entry.text.trim();

            if (this.#confirm_box.visible) {
                this.#open_editor(this.#pending_project);
                return Clutter.EVENT_STOP;
            }

            const existing = this.#find_exact_match(text);
            if (existing) {
                this.#open_editor(existing);
            } else if (text) {
                this.#pending_project = text;
                this.#confirm_label.set_text(_('Do you want to create the new project ') + '“' + text + '” ?');
                this.#confirm_box.show();
                this.#scroll.actor.hide();
            } else {
                this.#open_editor('');
            }
            return Clutter.EVENT_STOP;
        }

        return Clutter.EVENT_PROPAGATE;
    }

    #find_exact_match (text: string): string | null {
        if (! text) return null;
        const needle = text.toLowerCase();
        for (const project of this.#project_list) {
            const name = project.startsWith('@') ? project.slice(1) : project;
            if (name.toLowerCase() === needle) return project;
        }
        return null;
    }

    #hide_confirm () {
        this.#confirm_box.hide();
        this.#scroll.actor.show();
        this.#pending_project = '';
    }

    #open_editor (project: string) {
        const tag = project ? (project.startsWith('@') ? project : '@' + project.replace(/\s+/g, '-')) : '';
        this.#applet.show_task_editor(undefined, tag);
    }

    #render () {
        this.#suggestion_box.destroy_all_children();

        const needle = this.#entry.entry.text.toLowerCase().trim();

        //
        // Always offer an option with no project.
        //
        const none_button = new Button({ parent: this.#suggestion_box, label: _('No project'), style_class: 'cronomix-project-button' });
        none_button.subscribe('left_click', () => this.#open_editor(''));

        let matches = 0;

        for (const project of this.#project_list) {
            const name = project.startsWith('@') ? project.slice(1) : project;
            if (needle && ! name.toLowerCase().includes(needle)) continue;

            matches++;
            const button = new Button({ parent: this.#suggestion_box, label: project, style_class: 'cronomix-project-button' });
            button.subscribe('left_click', () => this.#open_editor(project));
        }

        if (needle && matches === 0) {
            const hint = new St.Label({ text: _('Press Enter to create') + ' @' + needle, style_class: 'cronomix-note-hint cronomix-box' });
            this.#suggestion_box.add_child(hint);
        }
    }
}
