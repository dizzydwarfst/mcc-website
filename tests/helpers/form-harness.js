/**
 * Loads the real form-handler.js against the mini DOM.
 *
 * form-handler.js is a browser IIFE, so it is evaluated in a `vm` context whose
 * globals are the test document and a window carrying the real portal-api.js
 * module. Nothing about the handler is stubbed — the tests exercise the code
 * that ships.
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const { FormElement, createDocument } = require('./mini-dom');

const ROOT = path.join(__dirname, '..', '..');
const HANDLER_SOURCE = fs.readFileSync(path.join(ROOT, 'form-handler.js'), 'utf8');
const portalApi = require(path.join(ROOT, 'portal-api.js'));

/** A fetch stub that records calls and answers from a queue of responses. */
function createFetchStub(responses) {
    const queue = [...responses];
    const calls = [];
    const stub = (url, options) => {
        calls.push({ url, options, body: options && options.body ? JSON.parse(options.body) : null });
        const next = queue.length > 1 ? queue.shift() : queue[0];
        if (!next) return Promise.reject(new Error('No response queued'));
        if (typeof next === 'function') return next();
        if (next.networkError) return Promise.reject(new TypeError('Failed to fetch'));
        return Promise.resolve({
            ok: next.status >= 200 && next.status < 300,
            status: next.status,
            json: () => (next.json === undefined
                ? Promise.resolve(next.body || {})
                : next.json()),
        });
    };
    stub.calls = calls;
    return stub;
}

/**
 * Build a contact or newsletter form, bind the real handler to it, and hand
 * back the pieces a test needs to drive and inspect it.
 */
function mountForm({ type, fields, response, responses }) {
    const document = createDocument();
    const form = new FormElement();
    form.dataset.formType = type;
    form.setAttribute('data-form-type', type);

    Object.entries(fields || {}).forEach(([name, value]) => {
        form.addField(name, { value });
    });

    const submitButton = form.appendChild(document.createElement('button'));
    submitButton.setAttribute('type', 'submit');
    submitButton.innerHTML = 'Send Message';

    const status = document.createElement('p');
    status.setAttribute('data-form-status', '');
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');

    // The newsletter subscribe bar keeps its status line beside the form, the
    // contact form keeps it inside — cover both placements.
    const container = document.createElement('div');
    document.body.appendChild(container);
    container.appendChild(form);
    if (type === 'newsletter') container.appendChild(status);
    else form.appendChild(status);

    const fetchStub = createFetchStub(responses || [response || { status: 201, body: { status: 'received' } }]);
    const previousFetch = globalThis.fetch;
    globalThis.fetch = fetchStub;

    const window = { MCCPortalApi: portalApi, location: { pathname: '/contact', search: '' } };
    const logs = [];
    const context = vm.createContext({
        window,
        document,
        console: {
            error: (...args) => logs.push(['error', ...args]),
            warn: (...args) => logs.push(['warn', ...args]),
            log: () => {},
        },
        setTimeout,
        clearTimeout,
        AbortController,
        Promise,
        JSON,
        String,
        Boolean,
        Object,
    });
    vm.runInContext(HANDLER_SOURCE, context, { filename: 'form-handler.js' });

    return {
        form,
        status,
        submitButton,
        fetchStub,
        logs,
        restore: () => { globalThis.fetch = previousFetch; },
        /** Dispatch submit and settle every microtask the handler queued. */
        async submit() {
            form.submit();
            await drain();
        },
        /** Two submits in the same tick — the double-click a visitor makes. */
        async doubleSubmit() {
            form.submit();
            form.submit();
            await drain();
        },
    };
}

async function drain() {
    for (let i = 0; i < 12; i += 1) await Promise.resolve();
    await new Promise((resolve) => setImmediate(resolve));
    for (let i = 0; i < 12; i += 1) await Promise.resolve();
}

module.exports = { mountForm, createFetchStub, portalApi, drain };
