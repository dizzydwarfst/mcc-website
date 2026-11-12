/**
 * Agency share-link redirector: /r/:code
 *
 * MCC generates a tracked short link per agency, per event, per channel. This
 * route records the click with the portal and forwards the visitor to the event
 * page. The redirect is the only thing that must never fail: a lost click is a
 * rounding error, a dead link on a printed poster is a lost student, so every
 * error path still ends in a redirect.
 */
'use strict';

const DEFAULT_API_BASE = 'https://lms-system-backend-lake.vercel.app/api';
const API_BASE = String(process.env.MCC_EVENT_LINKS_API_BASE || DEFAULT_API_BASE).replace(/\/+$/, '');
const HOME_URL = 'https://metropolitancollege.ca/';
const EVENTS_URL = 'https://metropolitancollege.ca/events';
const CLICK_TIMEOUT_MS = 2500;

// Eight characters from A-Z and 2-9, minus the look-alikes I, L, O, 0 and 1.
const CODE_PATTERN = /^[A-HJKMNP-Z2-9]{8}$/;

// The portal owns the destination, but this route is a public redirector, so
// only MCC-controlled hosts are ever forwarded to.
const ALLOWED_REDIRECT_HOSTS = new Set([
    'metropolitancollege.ca',
    'www.metropolitancollege.ca',
    'portal.metropolitancollege.ca',
    'lms-system-backend-lake.vercel.app',
]);

// Chrome, Firefox and Safari all announce speculative loads differently.
const PREFETCH_HEADERS = ['purpose', 'x-purpose', 'sec-purpose', 'x-moz', 'x-prefetch'];
const FORWARDED_HEADERS = ['user-agent', 'referer', 'accept-language', 'x-forwarded-for', 'x-real-ip', ...PREFETCH_HEADERS];

function isPrefetch(req) {
    return PREFETCH_HEADERS.some((name) => /prefetch|preview|prerender/i.test(String(req.headers[name] || '')));
}

function safeDestination(value) {
    if (!value) return '';
    try {
        const url = new URL(String(value));
        if (url.protocol !== 'https:') return '';
        if (!ALLOWED_REDIRECT_HOSTS.has(url.hostname.toLowerCase())) return '';
        return url.href;
    } catch (_) {
        return '';
    }
}

function upstreamHeaders(req) {
    const headers = { accept: 'application/json' };
    FORWARDED_HEADERS.forEach((name) => {
        const value = req.headers[name];
        if (value) headers[name] = Array.isArray(value) ? value.join(', ') : String(value);
    });
    return headers;
}

async function resolveDestination(req, code) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), CLICK_TIMEOUT_MS);
    // A speculative load must not spend the agency's click, so it uses the
    // read-only resolver instead of the counting endpoint.
    const counts = !isPrefetch(req) && req.method !== 'HEAD';
    const url = counts
        ? `${API_BASE}/public/event-links/${encodeURIComponent(code)}/click`
        : `${API_BASE}/public/event-links/${encodeURIComponent(code)}`;
    try {
        const response = await fetch(url, {
            method: counts ? 'POST' : 'GET',
            headers: upstreamHeaders(req),
            signal: controller.signal,
        });
        if (!response.ok) return '';
        const body = await response.json();
        return safeDestination(body && body.destination_url);
    } catch (_) {
        return '';
    } finally {
        clearTimeout(timer);
    }
}

function redirect(res, location) {
    // 302, never 301: staff re-route events, and a permanently cached redirect
    // would outlive the change.
    res.statusCode = 302;
    res.setHeader('Location', location);
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end(`Redirecting to ${location}`);
}

module.exports = async function handler(req, res) {
    const raw = Array.isArray(req.query?.code) ? req.query.code[0] : req.query?.code;
    const code = String(raw || '').trim().toUpperCase();

    if (!CODE_PATTERN.test(code)) {
        redirect(res, HOME_URL);
        return;
    }

    const destination = await resolveDestination(req, code);
    redirect(res, destination || EVENTS_URL);
};
