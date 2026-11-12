/**
 * The smallest DOM the public form handler actually uses.
 *
 * The marketing site has no bundler and no browser-test dependency, so rather
 * than adding one, these tests run form-handler.js against a hand-built
 * document that implements exactly the surface it touches: attribute
 * selectors, form.elements, classList, and submit dispatch. Anything the
 * handler starts using that is not modelled here fails loudly rather than
 * silently passing.
 */
'use strict';

/** Matches the selector shapes used by the handler: `tag`, `[attr]`,
 * `[attr="value"]`, `tag[attr="value"]`, and comma-separated lists of those. */
function matches(element, selector) {
    return String(selector).split(',').map((part) => part.trim()).filter(Boolean).some((part) => {
        const tagMatch = part.match(/^([a-zA-Z-]*)/);
        const tag = tagMatch ? tagMatch[1] : '';
        if (tag && element.tagName !== tag.toUpperCase()) return false;
        const attrs = [...part.matchAll(/\[([a-zA-Z-]+)(?:=(?:"([^"]*)"|'([^']*)'))?\]/g)];
        if (!tag && !attrs.length) return false;
        return attrs.every(([, name, dq, sq]) => {
            const expected = dq !== undefined ? dq : sq;
            if (!element.hasAttribute(name)) return false;
            return expected === undefined || element.getAttribute(name) === expected;
        });
    });
}

class ClassList {
    constructor() { this.set = new Set(); }
    add(name) { this.set.add(name); }
    remove(name) { this.set.delete(name); }
    contains(name) { return this.set.has(name); }
    toggle(name, force) {
        if (force === undefined) return this.set.has(name) ? (this.set.delete(name), false) : (this.set.add(name), true);
        if (force) this.set.add(name); else this.set.delete(name);
        return Boolean(force);
    }
    get value() { return [...this.set].join(' '); }
}

class Element {
    constructor(tagName) {
        this.tagName = String(tagName).toUpperCase();
        this.attributes = new Map();
        this.children = [];
        this.parentElement = null;
        this.classList = new ClassList();
        this.style = { cssText: '' };
        this.listeners = new Map();
        this.textContent = '';
        this.innerHTML = '';
        this.disabled = false;
        this.focusCount = 0;
    }

    set className(value) {
        this.classList.set = new Set(String(value).split(/\s+/).filter(Boolean));
    }

    get className() { return this.classList.value; }

    setAttribute(name, value) { this.attributes.set(name, String(value)); }
    getAttribute(name) { return this.attributes.has(name) ? this.attributes.get(name) : null; }
    removeAttribute(name) { this.attributes.delete(name); }
    hasAttribute(name) { return this.attributes.has(name); }

    append(...nodes) { nodes.forEach((node) => this.appendChild(node)); }

    appendChild(node) {
        node.parentElement = this;
        this.children.push(node);
        return node;
    }

    replaceChildren(...nodes) {
        this.children = [];
        nodes.forEach((node) => this.appendChild(node));
    }

    focus() { this.focusCount += 1; }

    /** Depth-first, document order — the same order a browser returns. */
    descendants() {
        return this.children.flatMap((child) => [child, ...child.descendants()]);
    }

    querySelector(selector) {
        return this.descendants().find((node) => matches(node, selector)) || null;
    }

    querySelectorAll(selector) {
        return this.descendants().filter((node) => matches(node, selector));
    }

    addEventListener(type, handler) {
        if (!this.listeners.has(type)) this.listeners.set(type, []);
        this.listeners.get(type).push(handler);
    }

    dispatchEvent(event) {
        const handlers = this.listeners.get(event.type) || [];
        handlers.forEach((handler) => handler(event));
        return event;
    }
}

class FormElement extends Element {
    constructor() {
        super('form');
        this.tagName = 'FORM';
        this.dataset = {};
        this.elements = {};
    }

    /** Register a control under `name`, the way the parser populates
     * form.elements from name attributes. */
    addField(name, options = {}) {
        const field = new Element(options.tag || 'input');
        field.type = options.type || 'text';
        field.value = options.value !== undefined ? options.value : '';
        field.checked = Boolean(options.checked);
        field.setAttribute('name', name);
        this.elements[name] = field;
        this.appendChild(field);
        return field;
    }

    reset() {
        Object.values(this.elements).forEach((field) => {
            field.value = '';
            field.checked = false;
        });
        this.wasReset = true;
    }

    submit() {
        let defaultPrevented = false;
        return this.dispatchEvent({
            type: 'submit',
            preventDefault() { defaultPrevented = true; },
            stopImmediatePropagation() {},
            get defaultPrevented() { return defaultPrevented; },
        });
    }
}

function createDocument() {
    const root = new Element('body');
    return {
        readyState: 'complete',
        body: root,
        documentElement: root,
        createElement: (tag) => new Element(tag),
        querySelector: (selector) => root.querySelector(selector),
        querySelectorAll: (selector) => root.querySelectorAll(selector),
        addEventListener: () => {},
        get root() { return root; },
    };
}

module.exports = { Element, FormElement, ClassList, createDocument, matches };
