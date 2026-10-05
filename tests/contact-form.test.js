/**
 * Contact form → POST /api/public/contact-inquiries.
 *
 * Drives the real form-handler.js against the mini DOM, so what is asserted
 * here is what a visitor on contact.html gets.
 */
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { mountForm, portalApi } = require('./helpers/form-harness');

const VALID = {
    full_name: 'Jordan Blake',
    email: 'Jordan.Blake@Example.com',
    phone: '604-555-0142',
    subject: 'Admissions',
    message: 'I would like to know more about the hospitality diploma intakes.',
    company_website: '',
};

function mount(options = {}) {
    // `fields` is spread last so a test overriding one field keeps the rest.
    return mountForm({ ...options, type: 'contact', fields: { ...VALID, ...(options.fields || {}) } });
}

test('a valid message posts to the contact-inquiries endpoint with mapped fields', async (t) => {
    const page = mount();
    t.after(page.restore);

    await page.submit();

    assert.equal(page.fetchStub.calls.length, 1);
    const call = page.fetchStub.calls[0];
    assert.equal(call.url, `${portalApi.DEFAULT_API_BASE}/public/contact-inquiries`);
    assert.equal(call.options.method, 'POST');
    assert.equal(call.options.headers['Content-Type'], 'application/json');
    assert.deepEqual(Object.keys(call.body).sort(), [
        'company_website', 'email', 'full_name', 'locale', 'message', 'phone', 'source_page', 'subject',
    ]);
    assert.equal(call.body.full_name, 'Jordan Blake');
    assert.equal(call.body.email, 'jordan.blake@example.com');
    assert.equal(call.body.subject, 'Admissions');
    assert.equal(call.body.locale, 'en');
});

test('success shows the thank-you state and clears the message from the page', async (t) => {
    const page = mount();
    t.after(page.restore);

    await page.submit();

    // The form is replaced by the page's own thank-you panel.
    assert.equal(page.form.children.length, 1);
    const panel = page.form.children[0];
    assert.equal(panel.getAttribute('role'), 'status');
    assert.equal(panel.getAttribute('aria-live'), 'polite');
    assert.equal(panel.focusCount, 1);
});

test('a validation error is caught before any request is made', async (t) => {
    const page = mount({ fields: { email: 'not-an-email' } });
    t.after(page.restore);

    await page.submit();

    assert.equal(page.fetchStub.calls.length, 0, 'must not post an address the backend would reject');
    assert.match(page.status.textContent, /valid email/i);
    assert.ok(page.status.classList.contains('is-error'));
    assert.equal(page.form.elements.email.getAttribute('aria-invalid'), 'true');
    assert.equal(page.form.elements.email.focusCount, 1, 'focus moves to the field at fault');
});

test('a missing message is reported without losing what was typed', async (t) => {
    const page = mount({ fields: { message: '   ' } });
    t.after(page.restore);

    await page.submit();

    assert.equal(page.fetchStub.calls.length, 0);
    assert.match(page.status.textContent, /message/i);
    assert.equal(page.form.elements.full_name.value, 'Jordan Blake');
});

test('a backend 422 shows guidance, never the backend detail string', async (t) => {
    const page = mount({
        response: { status: 422, body: { detail: [{ loc: ['body', 'message'], msg: 'String should have at least 1 character' }] } },
    });
    t.after(page.restore);

    await page.submit();

    assert.ok(page.status.classList.contains('is-error'));
    assert.equal(page.status.textContent, portalApi.copy('invalid', 'en'));
    assert.doesNotMatch(page.status.textContent, /String should have/);
    assert.doesNotMatch(page.status.textContent, /loc|body|detail/i);
});

test('a rate limit is explained as a wait, not a failure', async (t) => {
    const page = mount({ response: { status: 429, body: { detail: 'Too many messages from this connection; please try again later.' } } });
    t.after(page.restore);

    await page.submit();

    assert.equal(page.status.textContent, portalApi.copy('rate_limited', 'en'));
    assert.ok(page.status.classList.contains('is-error'));
});

test('a 500 shows the server message and keeps every field intact', async (t) => {
    const page = mount({ response: { status: 500, body: {} } });
    t.after(page.restore);

    await page.submit();

    assert.equal(page.status.textContent, portalApi.copy('server', 'en'));
    assert.equal(page.form.elements.message.value, VALID.message, 'the visitor must not have to retype');
    assert.equal(page.form.elements.full_name.value, VALID.full_name);
    assert.ok(page.form.children.length > 1, 'the form is not replaced by a success panel');
});

test('a network failure is reported as unreachable, not as success', async (t) => {
    const page = mount({ response: { networkError: true } });
    t.after(page.restore);

    await page.submit();

    assert.equal(page.status.textContent, portalApi.copy('network', 'en'));
    assert.ok(page.status.classList.contains('is-error'));
    assert.equal(page.status.classList.contains('is-success'), false);
    assert.equal(page.form.elements.message.value, VALID.message);
});

test('a double-click cannot create two inquiries', async (t) => {
    let resolveResponse;
    const page = mount({
        responses: [() => new Promise((resolve) => {
            resolveResponse = () => resolve({ ok: true, status: 201, json: () => Promise.resolve({ status: 'received' }) });
        })],
    });
    t.after(page.restore);

    page.form.submit();
    page.form.submit();
    page.form.submit();
    assert.equal(page.fetchStub.calls.length, 1, 'three clicks, one request');

    resolveResponse();
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(page.fetchStub.calls.length, 1);
});

test('the submit button reports its busy state while the request is open', async (t) => {
    let resolveResponse;
    const page = mount({
        responses: [() => new Promise((resolve) => {
            resolveResponse = () => resolve({ ok: true, status: 201, json: () => Promise.resolve({ status: 'received' }) });
        })],
    });
    t.after(page.restore);

    page.form.submit();
    assert.equal(page.submitButton.disabled, true);
    assert.equal(page.submitButton.getAttribute('aria-busy'), 'true');

    resolveResponse();
    await new Promise((resolve) => setImmediate(resolve));
});

test('the pending state is released after a failure so a retry is possible', async (t) => {
    const page = mount({ responses: [{ status: 500, body: {} }, { status: 201, body: { status: 'received' } }] });
    t.after(page.restore);

    await page.submit();
    assert.equal(page.submitButton.disabled, false);
    assert.equal(page.submitButton.getAttribute('aria-busy'), 'false');

    await page.submit();
    assert.equal(page.fetchStub.calls.length, 2, 'the retry reaches the portal');
});

test('a honeypot value still rides along for the backend to judge', async (t) => {
    const page = mount({ fields: { company_website: 'https://spam.example' } });
    t.after(page.restore);

    await page.submit();

    assert.equal(page.fetchStub.calls[0].body.company_website, 'https://spam.example');
});
