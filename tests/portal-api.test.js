/**
 * The shared portal client: configuration, contracts and error mapping.
 */
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const api = require('../portal-api.js');

const ROOT = path.join(__dirname, '..');

test('the API base comes from configuration, not from a component', () => {
    assert.equal(api.apiBase({}), api.DEFAULT_API_BASE);
    assert.equal(
        api.apiBase({ MCC_ENGAGEMENT_API_BASE: 'https://staging.example/api/' }),
        'https://staging.example/api',
        'a trailing slash must not double up in the request path',
    );
    assert.equal(api.apiBase({ MCC_ENGAGEMENT_API_BASE: 'http://localhost:8000/api' }), 'http://localhost:8000/api');
});

test('the site uses one override name across every portal-backed script', () => {
    const sources = ['portal-api.js', 'events.js', 'document-services.js']
        .map((file) => fs.readFileSync(path.join(ROOT, file), 'utf8'));
    sources.forEach((source) => assert.match(source, /MCC_ENGAGEMENT_API_BASE/));
});

test('no public form script hard-codes a portal host of its own', () => {
    ['form-handler.js', 'website-engagement.js'].forEach((file) => {
        const source = fs.readFileSync(path.join(ROOT, file), 'utf8');
        assert.doesNotMatch(source, /https?:\/\/(localhost|[^\s'"]*vercel\.app)/, `${file} must not name a host`);
    });
});

test('the public endpoint paths match the portal routes', () => {
    assert.deepEqual(api.PATHS, {
        contact: '/public/contact-inquiries',
        newsletter: '/public/newsletter-subscriptions',
        signup: '/public/website-signups',
    });
});

test('client limits mirror the backend field limits', () => {
    assert.deepEqual(api.LIMITS, {
        name: 80,
        email: 254,
        phone: 40,
        subject: 120,
        message: 4000,
        sourcePage: 500,
        agencyName: 120,
        heardDetail: 200,
        visitorName: 80,
        chatMessage: 2000,
    });
});

test('the markup limits on the shipped forms match those limits', () => {
    const contact = fs.readFileSync(path.join(ROOT, 'contact.html'), 'utf8');
    assert.match(contact, /name="full_name"[^>]*maxlength="80"/);
    assert.match(contact, /name="email"[^>]*maxlength="254"/);
    assert.match(contact, /name="phone"[^>]*maxlength="40"/);
    assert.match(contact, /name="message"[^>]*maxlength="4000"/);

    const engagement = fs.readFileSync(path.join(ROOT, 'website-engagement.js'), 'utf8');
    assert.match(engagement, /name="first_name"[^>]*maxlength="80"/);
    assert.match(engagement, /name="phone_number"[^>]*maxlength="40"/);
    assert.match(engagement, /name="visitor_name"[^>]*maxlength="80"/);
});

test('email validation accepts what the backend accepts', () => {
    ['a@b.co', 'first.last+tag@sub.example.ca', 'x@y.z'].forEach((email) => {
        assert.ok(api.isValidEmail(email), `${email} should be valid`);
    });
    ['', 'nope', 'a@b', 'a b@c.com', 'a@@b.com', `${'a'.repeat(250)}@example.com`].forEach((email) => {
        assert.equal(api.isValidEmail(email), false, `${email} should be invalid`);
    });
});

test('the source page is a path, capped, and carries no fragment', () => {
    assert.equal(api.sourcePage({ pathname: '/contact', search: '?ref=abc' }), '/contact?ref=abc');
    assert.equal(api.sourcePage({ pathname: '/', search: '' }), '/');
    assert.ok(api.sourcePage({ pathname: `/${'a'.repeat(900)}`, search: '' }).length <= api.LIMITS.sourcePage);
});

test('the locale follows the page language switch', () => {
    const frenchPage = { body: { getAttribute: (name) => (name === 'data-lang' ? 'fr' : null) } };
    const englishPage = { body: { getAttribute: () => 'en' } };
    assert.equal(api.detectLocale(frenchPage, null), 'fr');
    assert.equal(api.detectLocale(englishPage, { getItem: () => null }), 'en');
    assert.equal(api.detectLocale(englishPage, { getItem: () => 'fr' }), 'fr');
    assert.equal(api.detectLocale(null, { getItem: () => { throw new Error('blocked'); } }), 'en');
});

test('every response class maps to wording written for visitors', () => {
    const cases = [
        [{ status: 0 }, 'network'],
        [{ status: 400 }, 'invalid'],
        [{ status: 422 }, 'invalid'],
        [{ status: 429 }, 'rate_limited'],
        [{ status: 500 }, 'server'],
        [{ status: 503 }, 'server'],
    ];
    cases.forEach(([error, key]) => {
        assert.equal(api.friendlyMessage(error, 'contact', 'en'), api.copy(key, 'en'));
        assert.equal(api.friendlyMessage(error, 'contact', 'fr'), api.copy(key, 'fr'));
    });
    assert.equal(api.friendlyMessage({ status: 409 }, 'newsletter', 'en'), api.copy('newsletter_error', 'en'));
});

test('a backend detail string is never handed to the visitor', () => {
    const error = Object.assign(new Error('Request failed (422)'), {
        status: 422,
        payload: { detail: [{ loc: ['body', 'consent_to_contact'], msg: 'Field required' }] },
    });
    const shown = api.friendlyMessage(error, 'signup', 'en');
    assert.doesNotMatch(shown, /consent_to_contact|Field required|loc|body/);
});

test('every message exists in both site languages', () => {
    const keys = ['network', 'rate_limited', 'invalid', 'server', 'contact_success', 'contact_error',
        'newsletter_success', 'newsletter_error', 'signup_error', 'required_consent', 'invalid_email'];
    keys.forEach((key) => {
        assert.notEqual(api.copy(key, 'en'), key, `missing EN copy for ${key}`);
        assert.notEqual(api.copy(key, 'fr'), key, `missing FR copy for ${key}`);
        assert.notEqual(api.copy(key, 'en'), api.copy(key, 'fr'), `${key} is not translated`);
    });
});

test('a non-2xx response raises an error carrying the status', async () => {
    const scope = {
        fetch: () => Promise.resolve({ ok: false, status: 429, json: () => Promise.resolve({ detail: 'slow down' }) }),
    };
    await assert.rejects(
        () => api.submitContactInquiry({ email: 'a@b.co' }, scope),
        (error) => error.status === 429 && error.payload.detail === 'slow down',
    );
});

test('an unreadable response body still yields a typed error', async () => {
    const scope = {
        fetch: () => Promise.resolve({ ok: false, status: 500, json: () => Promise.reject(new Error('not json')) }),
    };
    await assert.rejects(() => api.submitContactInquiry({}, scope), (error) => error.status === 500);
});

test('a transport failure is reported as status 0, not as an exception the UI must parse', async () => {
    const scope = { fetch: () => Promise.reject(new TypeError('Failed to fetch')) };
    await assert.rejects(() => api.submitNewsletterSubscription({}, scope), (error) => error.status === 0);
});

test('builders send only the fields their endpoint declares', () => {
    const contact = api.buildContactInquiry({ full_name: 'A', email: 'a@b.co', message: 'hi', nickname: 'drop me' });
    assert.equal('nickname' in contact, false);
    const newsletter = api.buildNewsletterSubscription({ email: 'a@b.co', consent_to_marketing: true });
    assert.equal('consent_to_marketing' in newsletter, false);
});

test('the contact message keeps its line breaks while single-line fields are collapsed', () => {
    const payload = api.buildContactInquiry({
        full_name: '  Jordan   Blake ',
        email: 'a@b.co',
        message: 'Line one\r\nLine two\n\nLine four   ',
    });
    assert.equal(payload.full_name, 'Jordan Blake');
    assert.equal(payload.message, 'Line one\nLine two\n\nLine four');
});

test('fetch is invoked bound to its own global', async () => {
    // A browser throws "Illegal invocation" when window.fetch is detached from
    // window and called on its own, which is exactly how a scope-passing client
    // would call it.
    let sawCorrectThis = false;
    const scope = {
        marker: 'window-like',
        fetch: function boundCheck() {
            sawCorrectThis = this === scope;
            return Promise.resolve({ ok: true, status: 201, json: () => Promise.resolve({}) });
        },
    };
    await api.submitContactInquiry({ email: 'a@b.co' }, scope);
    assert.ok(sawCorrectThis, 'fetch must be called with its host as `this`');
});
