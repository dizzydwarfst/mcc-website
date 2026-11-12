/**
 * Website signup — consent must reach the portal explicitly.
 *
 * The portal declares `consent_to_contact` required precisely because an
 * omitted boolean used to be stored as "no consent". These tests pin the three
 * cases apart: true is sent, false is sent, and the key is never absent.
 */
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const api = require('../portal-api.js');

const BASE_FIELDS = {
    event_id: 'fsl-trial-2026-09-01',
    event_title: 'FSL Info & Trial Session',
    event_date: '2026-09-01',
    timezone: 'America/Vancouver',
    first_name: 'Amelie',
    last_name: 'Roy',
    email: 'Amelie.Roy@Example.com',
    phone_number: '604-555-0100',
    attendance_preference: 'online',
    how_did_you_hear_about_us: 'instagram',
    source_page: '/programs-french-language',
};

test('consent true is sent explicitly', () => {
    const payload = api.buildWebsiteSignup({ ...BASE_FIELDS, consent_to_contact: true });
    assert.equal(payload.consent_to_contact, true);
    assert.equal(typeof payload.consent_to_contact, 'boolean');
});

test('consent false is sent explicitly rather than dropped', () => {
    const payload = api.buildWebsiteSignup({ ...BASE_FIELDS, consent_to_contact: false });
    assert.equal(payload.consent_to_contact, false);
    assert.ok(Object.prototype.hasOwnProperty.call(payload, 'consent_to_contact'));
});

test('consent is never omitted, whatever the caller passes', () => {
    const inputs = [
        { ...BASE_FIELDS },                                  // key absent entirely
        { ...BASE_FIELDS, consent_to_contact: undefined },
        { ...BASE_FIELDS, consent_to_contact: null },
        { ...BASE_FIELDS, consent_to_contact: '' },
        { ...BASE_FIELDS, consent_to_contact: 'on' },
        { ...BASE_FIELDS, consent_to_contact: 0 },
    ];
    inputs.forEach((fields) => {
        const payload = api.buildWebsiteSignup(fields);
        assert.ok(
            Object.prototype.hasOwnProperty.call(payload, 'consent_to_contact'),
            `consent_to_contact missing for ${JSON.stringify(fields.consent_to_contact)}`,
        );
        assert.equal(typeof payload.consent_to_contact, 'boolean');
        assert.ok(JSON.parse(JSON.stringify(payload)).consent_to_contact !== undefined);
    });
});

test('consent survives JSON serialisation as a real boolean', () => {
    const payload = api.buildWebsiteSignup({ ...BASE_FIELDS, consent_to_contact: false });
    const wire = JSON.parse(JSON.stringify(payload));
    assert.equal(wire.consent_to_contact, false);
    assert.equal('consent_to_contact' in wire, true);
});

test('consent is never hard-coded: the built value follows the input', () => {
    assert.equal(api.buildWebsiteSignup({ ...BASE_FIELDS, consent_to_contact: true }).consent_to_contact, true);
    assert.equal(api.buildWebsiteSignup({ ...BASE_FIELDS, consent_to_contact: false }).consent_to_contact, false);
});

test('required-consent validation blocks an unchecked submission', () => {
    const payload = api.buildWebsiteSignup({ ...BASE_FIELDS, consent_to_contact: false });
    const errors = api.validateWebsiteSignup(payload, 'en');
    assert.equal(errors.length, 1);
    assert.equal(errors[0].field, 'consent_to_contact');
    assert.match(errors[0].message, /contact you/i);
});

test('a fully consented signup passes validation', () => {
    const payload = api.buildWebsiteSignup({ ...BASE_FIELDS, consent_to_contact: true });
    assert.deepEqual(api.validateWebsiteSignup(payload, 'en'), []);
});

test('the email is normalised to the backend identity before sending', () => {
    const payload = api.buildWebsiteSignup({ ...BASE_FIELDS, consent_to_contact: true });
    assert.equal(payload.email, 'amelie.roy@example.com');
});

test('field limits match the portal so a valid form is never rejected as too long', () => {
    const payload = api.buildWebsiteSignup({
        ...BASE_FIELDS,
        first_name: 'a'.repeat(81),
        consent_to_contact: true,
    });
    const errors = api.validateWebsiteSignup(payload, 'en');
    assert.equal(errors[0].field, 'first_name');
    assert.equal(api.LIMITS.name, 80);
    assert.equal(api.LIMITS.phone, 40);
    assert.equal(api.LIMITS.email, 254);
});

test('the signup endpoint path is the portal public route', () => {
    assert.equal(api.PATHS.signup, '/public/website-signups');
});

test('signup submission goes to the configured base and carries the consent key', async () => {
    const calls = [];
    const scope = {
        fetch: (url, options) => {
            calls.push({ url, body: JSON.parse(options.body) });
            return Promise.resolve({ ok: true, status: 201, json: () => Promise.resolve({ status: 'received' }) });
        },
    };
    const payload = api.buildWebsiteSignup({ ...BASE_FIELDS, consent_to_contact: true });
    await api.submitWebsiteSignup(payload, scope);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, `${api.DEFAULT_API_BASE}/public/website-signups`);
    assert.equal(calls[0].body.consent_to_contact, true);
});

test('the signup call site builds its payload through the shared builder', () => {
    // A regression guard on the one caller that cannot be driven through the
    // mini DOM: the FSL dialog is built with innerHTML, so this asserts the
    // wiring instead of re-parsing it.
    const source = fs.readFileSync(path.join(__dirname, '..', 'website-engagement.js'), 'utf8');
    assert.match(source, /portalApi\.buildWebsiteSignup\(/, 'signup payload must come from the shared builder');
    assert.match(source, /consent_to_contact: consentInput\.checked/, 'consent must come from the checkbox state');
    assert.match(source, /portalApi\.submitWebsiteSignup\(/, 'signup must post through the shared client');
    assert.doesNotMatch(source, /consent_to_contact:\s*true\b/, 'consent must never be hard-coded to true');
});
