import St from 'gi://St';
import { gettext as _ } from 'resource:///org/gnome/shell/extensions/extension.js';

import { TodoApplet } from './main.js';
import * as Misc from './../../utils/misc.js';
import { unreachable } from './../../utils/misc.js';
import * as P from './../../utils/markup/parser.js';
import { get_iso_date } from './../../utils/time.js';
import { Markup } from './../../utils/markup/renderer.js';
import { EditorView } from './../../utils/markup/editor.js';
import { Entry } from './../../utils/entry.js';
import { ButtonBox, Button, CheckBox } from './../../utils/button.js';

export class Task {
    text: string;
    ast: P.AstMeta;

    constructor (text: string, ast: P.AstMeta) {
        this.text = text;
        this.ast = ast;
    }

    satisfies_filter (filter: P.AstFilter): boolean {
        const config = this.ast.config;

        if (config.hide) {
            if (filter.tag === 'AstFilterAny' || filter.tag === 'AstFilterHide') return true;
            if (! (filter.tag === 'AstFilterAnd' && filter.op1.tag === 'AstFilterHide')) return false;
        }

        return this.#satisfies_filter(filter);
    }

    #satisfies_filter (filter: P.AstFilter): boolean {
        const config = this.ast.config;

        switch (filter.tag) {
        case 'AstFilterAny':      return true;
        case 'AstFilterNot':      return !this.#satisfies_filter(filter.op);
        case 'AstFilterOr':       return this.#satisfies_filter(filter.op1) || this.#satisfies_filter(filter.op2);
        case 'AstFilterAnd':      return this.#satisfies_filter(filter.op1) && this.#satisfies_filter(filter.op2);
        case 'AstFilterDue':      return !!config.due;
        case 'AstFilterDone':     return !!config.done;
        case 'AstFilterPin':      return !!config.pin;
        case 'AstFilterHide':     return !!config.hide;
        case 'AstFilterTrack':    return (filter.id > -1) ? (filter.id === config.track) : (config.track !== undefined);
        case 'AstFilterFuzzy':    return Misc.fuzzy_search(filter.needle, this.text) !== null;
        case 'AstFilterString':   return this.text.indexOf(filter.needle) !== -1;
        case 'AstFilterTag':      return !!config.tags && ((filter.text === '@') ? (config.tags.size > 0) : config.tags.has(filter.text));
        case 'AstFilterPriority': return !!config.priority && (filter.priority ? (config.priority === filter.priority) : (config.priority > 0));
        default: unreachable(filter);
        }
    }

    serialize_header () {
        const config = this.ast.config;

        const body_start = this.ast.children.at(0)?.start ?? 0;
        const body_end   = this.ast.children.at(-1)?.end ?? 0;
        const body_text  = this.text.substring(body_start, body_end);

        // Estimate length of header if it were on 1 line:
        let header_len = 2; // +2 for the brackets.
        if (config.priority)  header_len += 2;
        if (config.done)      header_len += 2;
        if (config.pin)       header_len += 4;
        if (config.hide)      header_len += 5;
        if (config.due)       header_len += 15;
        if (config.created)   header_len += 19;
        if (config.completed) header_len += 21;
        if (config.track !== undefined) header_len += 8;
        if (config.tags)      for (const tag of config.tags) header_len += tag.length + 1;

        const idx = body_text.indexOf('\n');
        const is_single_line = idx === -1 || idx === body_text.length - 1;

        let new_header: string;

        if (is_single_line && header_len < 30 && (body_text.length + header_len) <= 120) {
            new_header = this.#serialize_header_style1();
        } else if (header_len < 80) {
            new_header = this.#serialize_header_style2();
        } else {
            new_header = this.#serialize_header_style3();
        }

        { // Adjust ast node offsets now that the header changed:
            const adjust = new_header.length - body_start;
            for (const node of P.iter(this.ast.children)) { node.start += adjust; node.end += adjust; }
            this.ast.end += adjust;
        }

        this.text = new_header + body_text;
    }

    // [x @foo] Lorem impsum.
    #serialize_header_style1 (): string {
        let result = '[';
        const config = this.ast.config;

        if (config.done)      result += 'x ';
        if (config.priority)  result += '#' + config.priority + ' ';
        if (config.due)       result += 'due:' + config.due + ' ';
        if (config.created)   result += 'created:' + config.created + ' ';
        if (config.completed) result += 'completed:' + config.completed + ' ';
        if (config.pin)       result += 'pin ';
        if (config.hide)      result += 'hide ';
        if (config.track !== undefined) result += 'track:' + config.track + ' ';
        if (config.tags)      for (const tag of config.tags) result += tag + ' ';

        return result.trimRight() + '] ';
    }

    // [x @foo]
    //   Lorem impsum.
    #serialize_header_style2 (): string {
        return this.#serialize_header_style1() + '\n  ';
    }

    // [ x
    //   @foo
    // ]
    //   Lorem impsum.
    #serialize_header_style3 (): string {
        let result = '[ ';
        const config = this.ast.config;

        if (config.done)      result += 'x\n  ';
        if (config.priority)  result += '#' + config.priority + '\n  ';
        if (config.due)       result += 'due:' + config.due + '\n  ';
        if (config.created)   result += 'created:' + config.created + '\n  ';
        if (config.completed) result += 'completed:' + config.completed + '\n  ';
        if (config.pin)       result += 'pin\n  ';
        if (config.hide)      result += 'hide\n  ';
        if (config.track !== undefined) result += 'track:' + config.track + '\n  ';
        if (config.tags)      for (const [tag, idx] of Misc.iter_set(config.tags)) result += tag + ' ' + ((idx+1)%6 ? '' : '\n  ');

        if (result.at(-1) !== '\n') result += '\n';
        return result + ']\n  ';
    }
}

export class TaskCard extends Misc.Card {
    constructor (applet: TodoApplet, task: Task, body?: St.Widget) {
        super();

        const config = task.ast.config;

        this.left_header_box.add_style_class_name('cronomix-spacing');

        const checkbox        = new CheckBox({ parent: this.left_header_box, checked: !!config.done });
        const delete_button   = new Button({ parent: this.autohide_box, icon: 'cronomix-trash-symbolic' , style_class: 'cronomix-floating-button'});
        const edit_button     = new Button({ parent: this.autohide_box, icon: 'cronomix-edit-symbolic', style_class: 'cronomix-floating-button' });
        const pin_button      = new Button({ parent: config.pin ? this.header : this.autohide_box, icon: 'cronomix-pin-symbolic' , style_class: 'cronomix-floating-button'});
        const priority_button = !config.priority ? null : new Button({ parent: this.header, label: '#' + config.priority, style_class: 'cronomix-floating-button cronomix-red' });
        const hide_button     = !config.hide ? null : new Button({ parent: this.header, icon: 'cronomix-hidden-symbolic', style_class: 'cronomix-floating-button' });

        let tag_box = new St.BoxLayout({ style_class: 'cronomix-spacing' });
        this.actor.insert_child_above(tag_box, this.header);

        const due_button = !config.due ? null : new Button({ parent: tag_box, label: _('Due') + ' ' + config.due, style_class: 'cronomix-tag-button cronomix-red' });

        if (config.created) {
            const button = new Button({ parent: tag_box, label: _('Created') + ' ' + config.created, style_class: 'cronomix-tag-button cronomix-green' });
            button.actor.reactive = false;
        }

        if (config.completed) {
            const button = new Button({ parent: tag_box, label: _('Completed') + ' ' + config.completed, style_class: 'cronomix-tag-button cronomix-green' });
            button.actor.reactive = false;
        }

        const old_box = tag_box;
        tag_box = new St.BoxLayout({ style_class: 'cronomix-spacing' });
        this.actor.insert_child_above(tag_box, old_box);

        if (config.tags) {
            for (const tag of config.tags) {
                const button = new Button({ parent: tag_box, label: tag, style_class: 'cronomix-tag-button cronomix-yellow' });
                button.subscribe('left_click', () => applet.show_search_view(tag));
                if (tag_box.get_n_children() === 5) {
                    const old_box = tag_box;
                    tag_box = new St.BoxLayout({ style_class: 'cronomix-spacing' });
                    this.actor.insert_child_above(tag_box, old_box);
                }
            }
        }

        if (body) {
            this.actor.add_child(body);
        } else {
            const markup = new Markup(task.text, task.ast.children);
            this.actor.add_child(markup.actor);
            markup.on_tag_clicked = node => applet.show_search_view(task.text.substring(node.start, node.end));
        }

        edit_button.subscribe('left_click', () => applet.show_task_editor(task));
        delete_button.subscribe('left_click', () => applet.show_search_view(task));
        priority_button?.subscribe('left_click', () => applet.show_search_view('#' + config.priority));
        due_button?.subscribe('left_click', () => applet.show_search_view('due'));
        hide_button?.subscribe('left_click', () => applet.show_search_view('hide'));
        pin_button.subscribe('left_click', () => {
            task.ast.config.pin = !task.ast.config.pin;
            task.serialize_header();
            applet.flush_tasks();
            applet.show_main_view();
        });
        checkbox.subscribe('left_click', () => {
            task.ast.config.done = !task.ast.config.done;
            if (task.ast.config.done) {
                task.ast.config.completed = get_iso_date();
            } else {
                delete task.ast.config.completed;
            }
            task.serialize_header();
            applet.flush_tasks();
            applet.show_main_view();
        });

    }
}

export class TaskEditor extends EditorView {
    #task?: Task|null;
    #applet: TodoApplet;
    #tags: Set<string> | null = null;
    #priority_buttons: Map<number, Button>|null = null;

    constructor (applet: TodoApplet, task?: Task) {
        super((text, ast, body) => {
            if (ast.indent > 0) return null
            const task = new Task(text, ast);
            const card = new TaskCard(this.#applet, task, body);
            return card.actor;
        });

        Misc.focus_when_mapped(this.main_view.entry.entry);

        this.#applet = applet;
        if (task) this.#task = task;

        const initial_priority = task?.ast.config.priority ?? 2;
        const initial_due = task?.ast.config.due ?? '';
        let initial_text = task?.text ?? `[created:${get_iso_date()} #${initial_priority}] `;
        if (initial_due && !initial_text.includes(`due:${initial_due}`)) {
            initial_text = initial_text.replace(/\[([^\]]+)\]/, `[due:${initial_due} $1]`);
        }
        this.main_view.entry.set_text(initial_text, false);

        this.main_view.get_completions = ref => {
            if (! this.#tags) {
                this.#tags = new Set<string>();

                for (const task of this.#applet.tasks) {
                    for (const tag of task.ast.config.tags ?? []) {
                        this.#tags.add(tag);
                    }
                }
            }

            const needle = ref.toLowerCase();
            const result = [];
            for (const tag of this.#tags) {
                if (tag.toLowerCase().includes(needle) && (tag.length > ref.length || tag.toLowerCase() !== needle)) {
                    result.push(tag);
                }
            }
            return result.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
        };

        this.main_view.on_save = () => this.#on_ok_pressed();

        const meta_box = new St.BoxLayout({ vertical: true, style_class: 'cronomix-spacing' });
        this.main_view.left_box.insert_child_at_index(meta_box, 0);

        const hint = new St.Label({ text: _('Tip: type @project to tag a note. Press Enter to save, Shift+Enter for a new line.'), style_class: 'cronomix-note-hint' });
        meta_box.add_child(hint);

        const priority_box = new St.BoxLayout({ style_class: 'cronomix-button-box' });
        meta_box.add_child(priority_box);

        const priority_buttons = new Map<number, Button>();
        const add_priority_button = (label: string, value: number) => {
            const button = new Button({ parent: priority_box, label, wide: true, style_class: 'cronomix-priority-button' });
            priority_buttons.set(value, button);
            button.subscribe('left_click', () => this.#set_priority(value));
        };
        add_priority_button(_('Low'), 3);
        add_priority_button(_('Normal'), 2);
        add_priority_button(_('High'), 1);
        this.#priority_buttons = priority_buttons;
        this.#update_priority_buttons(this.#priority_buttons, initial_priority);

        const due_box = new St.BoxLayout({ style_class: 'cronomix-spacing' });
        meta_box.add_child(due_box);

        const due_entry = new Entry(_('Due date (YYYY-MM-DD)'));
        due_box.add_child(due_entry.actor);
        if (initial_due) due_entry.set_text(initial_due, false);

        const due_button = new Button({ parent: due_box, label: _('Set due date'), style_class: 'cronomix-touch-button' });
        due_button.subscribe('left_click', () => {
            const date = due_entry.entry.text.trim();
            if (!date) return;
            this.#set_due(date);
        });

        const button_box    = new ButtonBox(this.main_view.left_box);
        const button_ok     = button_box.add({ wide: true, label: _('Ok'), style_class: 'cronomix-touch-button' });
        const button_cancel = button_box.add({ wide: true, label: _('Cancel'), style_class: 'cronomix-touch-button' });

        button_ok.subscribe('left_click', () => this.#on_ok_pressed());
        button_cancel.subscribe('left_click', () => this.#applet.show_main_view());
    }

    destroy () {
        this.actor.destroy();
    }

    #update_priority_buttons (buttons: Map<number, Button>, active: number) {
        for (const [value, button] of buttons) {
            if (value === active) {
                button.actor.add_style_pseudo_class('checked');
            } else {
                button.actor.remove_style_pseudo_class('checked');
            }
        }
    }

    #set_priority (priority: number) {
        const entry = this.main_view.entry.entry;
        let text = entry.text;
        text = text.replace(/\[([^[\]]*?)\s+#\d\b\s*/, '[$1 ');
        text = text.replace(/\[([^\]]+?)\s*\]/, (_match, inner) => `[${inner.trim()} #${priority}]`);
        this.main_view.entry.set_text(text, false);
        if (this.#priority_buttons) this.#update_priority_buttons(this.#priority_buttons, priority);
    }

    #set_due (date: string) {
        const entry = this.main_view.entry.entry;
        let text = entry.text;
        text = text.replace(/\[([^[\]]*?)\s+due:\S+\s*/, '[$1 ');
        text = text.replace(/\[([^\]]+?)\s*\]/, (_match, inner) => `[${inner.trim()} due:${date}]`);
        this.main_view.entry.set_text(text, false);
    }

    #on_ok_pressed () {
        const parser = new P.Parser(this.main_view.entry.entry.text);

        for (const [block_text, block_ast] of parser.parse_blocks_split()) {
            if (block_ast.tag !== 'AstMeta') {
                this.#applet.non_tasks.push(block_text);
            } else if (this.#task) {
                this.#task.text = block_text;
                this.#task.ast  = block_ast;
                this.#task      = null;
            } else {
                this.#applet.tasks.push(new Task(block_text, block_ast));
            }
        }

        if (this.#task) {
            Misc.array_remove(this.#applet.tasks, this.#task);
        }

        this.#applet.flush_tasks();
        this.#applet.show_main_view();
    }
}
