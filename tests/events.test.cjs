const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../events.js'), 'utf8');
const sample = {
    id: 'event-1', slug: 'november-session', title: 'November session',
    status: 'published', featured: true, show_on_events_page: true,
    start_at: '2036-11-28T16:00:00-07:00', end_at: '2036-11-28T17:00:00-07:00',
    timezone: 'Vancouver time', registration_open: true,
};

async function render({ home = true, items = [sample], failure = false, detail = false } = {}) {
    let finish;
    const done = new Promise((resolve) => { finish = resolve; });
    const root = { innerHTML: '', removeAttribute: () => finish() };
    const requests = [];
    const context = {
        document: {
            readyState: 'complete', body: { dataset: {} },
            querySelector: (selector) => selector === (detail ? '[data-event-detail]' : home ? '[data-events-home]' : '[data-events-list]') ? root : null,
        },
        window: { location: { origin: 'https://example.com', pathname: '/events/fsl-info-trial-session-september-2026', search: '' }, setTimeout, clearTimeout },
        MutationObserver: class { observe() {} },
        URL, URLSearchParams, AbortController, Intl,
        console: { info() {}, error() {} },
        fetch: async (url) => {
            requests.push(new URL(url));
            return { ok: !failure, status: failure ? 404 : 200, json: async () => ({ items }) };
        },
    };
    vm.runInNewContext(source, context);
    await Promise.race([done, new Promise((_, reject) => setTimeout(() => reject(new Error('Rendering did not finish')), 1000).unref())]);
    return { html: root.innerHTML, query: requests[0].searchParams };
}

test('featured selection renders with a legacy timezone and homepage query', async () => {
    const { html, query } = await render();
    assert.match(html, /November session/);
    assert.match(html, /november-session#register/);
    assert.equal(query.get('featured'), 'true');
    assert.equal(query.get('status'), 'all');
    assert.equal(query.has('show_on_events_page'), false);
});

test('events listing requests its own visibility and hides unlisted events', async () => {
    const { html, query } = await render({ home: false, items: [sample, { ...sample, title: 'Hidden event', show_on_events_page: false }] });
    assert.match(html, /November session/);
    assert.doesNotMatch(html, /Hidden event/);
    assert.equal(query.get('show_on_events_page'), 'true');
    assert.equal(query.has('featured'), false);
    assert.equal(query.has('upcoming'), false);
});

test('homepage featuring is independent of the events-page switch', async () => {
    const { html } = await render({ items: [{ ...sample, show_on_events_page: false }] });
    assert.match(html, /November session/);
});

test('empty lists never resurrect the old hardcoded event', async () => {
    for (const home of [true, false]) {
        const { html } = await render({ home, items: [] });
        assert.match(html, /No upcoming events|No events to display/);
        assert.doesNotMatch(html, /trial-FSL|September|Sign Up/);
    }
});

test('feed failures show an error instead of a stale event', async () => {
    const { html } = await render({ failure: true });
    assert.match(html, /temporarily unavailable/);
    assert.doesNotMatch(html, /trial-FSL/);
});

test('archived and draft events are never rendered', async () => {
    const { html } = await render({ items: ['archived', 'draft'].map((status) => ({ ...sample, status })) });
    assert.match(html, /No upcoming events/);
});

test('closed registrations still render the featured event without a signup link', async () => {
    const { html } = await render({ items: [{ ...sample, status: 'closed', registration_open: false }] });
    assert.match(html, /November session/);
    assert.doesNotMatch(html, /#register/);
});

test('an archived legacy detail URL stays unavailable', async () => {
    const { html } = await render({ detail: true, failure: true });
    assert.match(html, /This event is not available/);
    assert.doesNotMatch(html, /Sign Up for Free/);
});

test('restored past events can be presented on the events page', async () => {
    const { html } = await render({ home: false, items: [{ ...sample,
        start_at: '2020-01-01T16:00:00-08:00', end_at: '2020-01-01T17:00:00-08:00',
        registration_open: false,
    }] });
    assert.match(html, /November session/);
    assert.match(html, /Past event/);
    assert.doesNotMatch(html, /#register/);
});
