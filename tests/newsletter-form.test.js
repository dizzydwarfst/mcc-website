/**
 * Newsletter subscribe → POST /api/public/newsletter-subscriptions.
 *
 * The portal answers new, repeat and reactivated subscriptions with the same
 * 201 body on purpose — telling them apart would turn the endpoint into an
 * address-enumeration oracle. So the site's job is one friendly confirmation
 * that is true in all three cases, which is what these tests pin down.
 */
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { mountForm, portalApi } = require('./helpers/form-harness');

const SUBSCRIBED = { status: 201, body: { status: 'subscribed', message: "Thanks! You're on the list." } };

function mount(options = {}) {
    // `fields` is spread last so a test overriding one field keeps the rest.
    return mountForm({
        ...options,
        type: 'newsletter',
        fields: { email: 'Reader@Example.com', company_website: '', ...(options.fields || {}) },
    });
}

test('a new subscriber posts a trimmed, lowercased address', async (t) => {
    const page = mount({ fields: { email: '  Reader@Example.COM  ' }, response: SUBSCRIBED });
    t.after(page.restore);

    await page.submit();

    assert.equal(page.fetchStub.calls.length, 1);
    const call = page.fetchStub.calls[0];
    assert.equal(call.url, `${portalApi.DEFAULT_API_BASE}/public/newsletter-subscriptions`);
    assert.equal(call.body.email, 'reader@example.com');
    assert.deepEqual(Object.keys(call.body).sort(), ['company_website', 'email', 'locale', 'source_page']);
});

test('capitalisation never makes a second subscriber', () => {
    const a = portalApi.buildNewsletterSubscription({ email: 'Reader@Example.com' });
    const b = portalApi.buildNewsletterSubscription({ email: 'reader@example.com  ' });
    const c = portalApi.buildNewsletterSubscription({ email: ' READER@EXAMPLE.COM' });
    assert.equal(a.email, b.email);
    assert.equal(b.email, c.email);
});

test('a new subscription shows the success confirmation', async (t) => {
    const page = mount({ response: SUBSCRIBED });
    t.after(page.restore);

    await page.submit();

    assert.equal(page.status.textContent, portalApi.copy('newsletter_success', 'en'));
    assert.ok(page.status.classList.contains('is-success'));
    assert.equal(page.status.classList.contains('is-error'), false);
});

test('an existing active subscriber is not shown an error state', async (t) => {
    // Same 201 the backend returns for a repeat subscription.
    const page = mount({ response: SUBSCRIBED });
    t.after(page.restore);

    await page.submit();

    assert.ok(page.status.classList.contains('is-success'));
    assert.equal(page.status.classList.contains('is-error'), false);
    assert.doesNotMatch(page.status.textContent, /error|failed|sorry/i);
});

test('a reactivated subscriber gets the normal confirmation', async (t) => {
    const page = mount({ response: SUBSCRIBED });
    t.after(page.restore);

    await page.submit();

    assert.equal(page.status.textContent, portalApi.copy('newsletter_success', 'en'));
    assert.ok(page.status.classList.contains('is-success'));
});

test('the field is cleared on success so a second click cannot resend it', async (t) => {
    const page = mount({ response: SUBSCRIBED });
    t.after(page.restore);

    await page.submit();

    assert.equal(page.form.elements.email.value, '');
});

test('an invalid address is rejected before any request', async (t) => {
    const page = mount({ fields: { email: 'reader@' }, response: SUBSCRIBED });
    t.after(page.restore);

    await page.submit();

    assert.equal(page.fetchStub.calls.length, 0);
    assert.match(page.status.textContent, /valid email/i);
    assert.ok(page.status.classList.contains('is-error'));
    assert.equal(page.form.elements.email.getAttribute('aria-invalid'), 'true');
});

test('an empty address asks for one rather than posting nothing', async (t) => {
    const page = mount({ fields: { email: '   ' }, response: SUBSCRIBED });
    t.after(page.restore);

    await page.submit();

    assert.equal(page.fetchStub.calls.length, 0);
    assert.match(page.status.textContent, /email/i);
});

test('a rate limit keeps the address in the field', async (t) => {
    const page = mount({ fields: { email: 'reader@example.com' }, response: { status: 429, body: { detail: 'Too many subscription attempts' } } });
    t.after(page.restore);

    await page.submit();

    assert.equal(page.status.textContent, portalApi.copy('rate_limited', 'en'));
    assert.equal(page.form.elements.email.value, 'reader@example.com', 'nothing to retype on retry');
});

test('a server failure is never shown as success', async (t) => {
    const page = mount({ response: { status: 503, body: {} } });
    t.after(page.restore);

    await page.submit();

    assert.equal(page.status.textContent, portalApi.copy('server', 'en'));
    assert.ok(page.status.classList.contains('is-error'));
    assert.equal(page.status.classList.contains('is-success'), false);
    assert.notEqual(page.form.elements.email.value, '', 'the form is not reset on failure');
});

test('a network failure asks the visitor to retry', async (t) => {
    const page = mount({ response: { networkError: true } });
    t.after(page.restore);

    await page.submit();

    assert.equal(page.status.textContent, portalApi.copy('network', 'en'));
    assert.ok(page.status.classList.contains('is-error'));
});

test('a 400 from the backend maps to form guidance, not a raw error', async (t) => {
    const page = mount({ response: { status: 400, body: { detail: 'Request body must be valid JSON' } } });
    t.after(page.restore);

    await page.submit();

    assert.equal(page.status.textContent, portalApi.copy('invalid', 'en'));
    assert.doesNotMatch(page.status.textContent, /JSON|body/i);
});

test('a double-click cannot create two subscriptions', async (t) => {
    let resolveResponse;
    const page = mount({
        responses: [() => new Promise((resolve) => {
            resolveResponse = () => resolve({ ok: true, status: 201, json: () => Promise.resolve({ status: 'subscribed' }) });
        })],
    });
    t.after(page.restore);

    page.form.submit();
    page.form.submit();
    assert.equal(page.fetchStub.calls.length, 1, 'two clicks, one subscription');

    resolveResponse();
    await new Promise((resolve) => setImmediate(resolve));
});
