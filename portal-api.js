/**
 * Shared client for the MCC Portal public website-engagement API.
 *
 * One place decides the portal base URL, the field names each public endpoint
 * expects, the client-side limits that mirror the backend's, and what a visitor
 * is told when a request fails. The page scripts (form-handler.js,
 * website-engagement.js) own the DOM; this file owns the contract.
 *
 * Loads as a plain browser script (window.MCCPortalApi) and as a CommonJS
 * module, so the payload builders, validators and error mapping can be tested
 * with `node --test` without a DOM.
 */
(function (root, factory) {
    'use strict';
    const api = factory();
    if (typeof module === 'object' && module && module.exports) module.exports = api;
    if (root) root.MCCPortalApi = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function buildPortalApi() {
    'use strict';

    // Same default and same override hook the other portal-backed scripts use
    // (events.js, document-services.js), so a deployment points every public
    // call at one backend by setting window.MCC_ENGAGEMENT_API_BASE once. No
    // component hard-codes a host of its own, and nothing secret is involved:
    // these endpoints are unauthenticated by design.
    const DEFAULT_API_BASE = 'https://lms-system-backend-lake.vercel.app/api';
    const REQUEST_TIMEOUT_MS = 15000;

    // Mirrors of the backend limits in backend/website_engagement.py. Frontend
    // validation is UX only — the backend re-checks every one of these — but
    // matching them means a visitor is told about an over-long field instead of
    // being handed a 422 after typing.
    const LIMITS = {
        name: 80,          // MAX_NAME_LEN
        email: 254,        // MAX_EMAIL_LEN
        phone: 40,         // MAX_PHONE_LEN
        subject: 120,      // MAX_INQUIRY_SUBJECT_LEN
        message: 4000,     // MAX_INQUIRY_MESSAGE_LEN
        sourcePage: 500,   // MAX_SOURCE_PAGE_LEN
        agencyName: 120,   // MAX_AGENCY_NAME_LEN
        heardDetail: 200,  // MAX_HEARD_DETAIL_LEN
        visitorName: 80,   // MAX_VISITOR_NAME_LEN
        chatMessage: 2000, // MAX_MESSAGE_LEN
    };

    const PATHS = {
        contact: '/public/contact-inquiries',
        newsletter: '/public/newsletter-subscriptions',
        signup: '/public/website-signups',
    };

    // Deliberately the backend's own regex (_EMAIL_RE), not a stricter one: a
    // frontend that rejects an address the backend would accept is a bug the
    // visitor cannot work around.
    const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

    const COPY = {
        en: {
            network: 'We could not reach MCC just now. Please check your connection and try again.',
            rate_limited: 'You have sent several requests recently. Please wait a few minutes and try again.',
            invalid: 'Please check the highlighted fields and try again.',
            server: 'Something went wrong on our side. Please try again in a few minutes, or call 604-300-3123.',
            contact_success: 'Thank you. Your message has been received and our team will reply by email.',
            contact_error: 'We could not send your message. Please try again, or email admin@metropolitancollege.ca.',
            newsletter_success: 'Thank you. Your email is on the MCC newsletter list.',
            newsletter_error: 'We could not complete your subscription. Please try again in a few minutes.',
            signup_error: 'We could not save your registration. Please try again or call 604-300-3123.',
            required_name: 'Please enter your full name.',
            required_first_name: 'Please enter your first name.',
            required_last_name: 'Please enter your last name.',
            required_email: 'Please enter your email address.',
            invalid_email: 'Please enter a valid email address.',
            required_message: 'Please enter your message.',
            required_consent: 'Please confirm that MCC may contact you before submitting.',
            too_long: 'This is longer than we can accept. Please shorten it.',
        },
        fr: {
            network: 'Nous n’avons pas pu joindre MCC pour le moment. Vérifiez votre connexion et réessayez.',
            rate_limited: 'Vous avez envoyé plusieurs demandes récemment. Patientez quelques minutes et réessayez.',
            invalid: 'Veuillez vérifier les champs indiqués et réessayer.',
            server: 'Une erreur est survenue de notre côté. Réessayez dans quelques minutes ou appelez le 604-300-3123.',
            contact_success: 'Merci. Votre message a bien été reçu et notre équipe vous répondra par courriel.',
            contact_error: 'Nous n’avons pas pu envoyer votre message. Réessayez ou écrivez à admin@metropolitancollege.ca.',
            newsletter_success: 'Merci. Votre courriel est inscrit à l’infolettre de MCC.',
            newsletter_error: 'Nous n’avons pas pu terminer votre abonnement. Réessayez dans quelques minutes.',
            signup_error: 'Nous n’avons pas pu enregistrer votre inscription. Réessayez ou appelez le 604-300-3123.',
            required_name: 'Veuillez saisir votre nom complet.',
            required_first_name: 'Veuillez saisir votre prénom.',
            required_last_name: 'Veuillez saisir votre nom de famille.',
            required_email: 'Veuillez saisir votre adresse courriel.',
            invalid_email: 'Veuillez saisir une adresse courriel valide.',
            required_message: 'Veuillez saisir votre message.',
            required_consent: 'Veuillez confirmer que MCC peut vous contacter avant de soumettre.',
            too_long: 'Ce texte dépasse la longueur acceptée. Veuillez le raccourcir.',
        },
    };

    function copy(key, locale) {
        const table = COPY[locale === 'fr' ? 'fr' : 'en'];
        return table[key] || COPY.en[key] || key;
    }

    function text(value) {
        return String(value === undefined || value === null ? '' : value).replace(/\s+/g, ' ').trim();
    }

    function multiline(value) {
        return String(value === undefined || value === null ? '' : value)
            .replace(/\r\n?/g, '\n')
            .replace(/[ \t]+$/gm, '')
            .trim();
    }

    /** Canonical address identity — the same trim-and-lowercase the backend does.
     * Capitalisation never makes a second subscriber or a second inquirer. */
    function normalizeEmail(value) {
        return text(value).toLowerCase();
    }

    function isValidEmail(value) {
        const email = normalizeEmail(value);
        return Boolean(email) && email.length <= LIMITS.email && EMAIL_RE.test(email);
    }

    function apiBase(scope) {
        const host = scope || (typeof globalThis !== 'undefined' ? globalThis : {});
        const configured = host && host.MCC_ENGAGEMENT_API_BASE;
        return String(configured || DEFAULT_API_BASE).replace(/\/+$/, '');
    }

    /** 'en' unless the page is showing French. Mirrors the site-wide language
     * switch in script.js so an inquiry is filed in the language it was typed. */
    function detectLocale(doc, storage) {
        const documentRef = doc || (typeof document !== 'undefined' ? document : null);
        if (documentRef && documentRef.body && documentRef.body.getAttribute('data-lang') === 'fr') return 'fr';
        try {
            const store = storage || (typeof localStorage !== 'undefined' ? localStorage : null);
            return store && store.getItem('mcc_lang') === 'fr' ? 'fr' : 'en';
        } catch (_) {
            return 'en';
        }
    }

    /** Path and query only: enough to tell staff which page a visitor wrote
     * from, without carrying a fragment or an over-long URL into the record. */
    function sourcePage(location) {
        const loc = location || (typeof window !== 'undefined' ? window.location : null);
        if (!loc) return '';
        return `${loc.pathname || '/'}${loc.search || ''}`.slice(0, LIMITS.sourcePage);
    }

    // ───────────────────────────── payload builders ─────────────────────────────
    // Each builder returns exactly the fields its endpoint declares — no extras,
    // no invented names — so the request matches the pydantic model one to one.

    function buildContactInquiry(fields) {
        const input = fields || {};
        return {
            full_name: text(input.full_name),
            email: normalizeEmail(input.email),
            phone: text(input.phone),
            subject: text(input.subject),
            message: multiline(input.message),
            locale: input.locale === 'fr' ? 'fr' : 'en',
            source_page: text(input.source_page).slice(0, LIMITS.sourcePage),
            company_website: text(input.company_website),
        };
    }

    function buildNewsletterSubscription(fields) {
        const input = fields || {};
        return {
            email: normalizeEmail(input.email),
            locale: input.locale === 'fr' ? 'fr' : 'en',
            source_page: text(input.source_page).slice(0, LIMITS.sourcePage),
            company_website: text(input.company_website),
        };
    }

    /**
     * The website-signup payload.
     *
     * `consent_to_contact` is always written, never conditionally spread in:
     * the backend declares it required precisely because an omitted boolean and
     * an explicit `false` used to be indistinguishable. `Boolean(...)` of the
     * checkbox state is what the visitor actually chose — this never hard-codes
     * true, and refusal is sent as an explicit `false` rather than dropped.
     */
    function buildWebsiteSignup(fields) {
        const input = fields || {};
        const payload = {
            event_id: text(input.event_id),
            event_title: text(input.event_title),
            event_date: text(input.event_date),
            timezone: text(input.timezone),
            first_name: text(input.first_name),
            last_name: text(input.last_name),
            email: normalizeEmail(input.email),
            phone_number: text(input.phone_number),
            attendance_preference: text(input.attendance_preference),
            how_did_you_hear_about_us: text(input.how_did_you_hear_about_us),
            agency_name: text(input.agency_name),
            source_page: text(input.source_page).slice(0, LIMITS.sourcePage),
            consent_to_contact: Boolean(input.consent_to_contact),
            company_website: text(input.company_website),
        };
        // Event identity is optional on the wire (the backend defaults it), so
        // an empty value is dropped rather than sent as "" and failing a
        // min-length the model does not have. Consent is never treated this way.
        ['event_id', 'event_title', 'event_date', 'timezone'].forEach((key) => {
            if (!payload[key]) delete payload[key];
        });
        return payload;
    }

    // ───────────────────────────── validators ─────────────────────────────
    // Return [{ field, message }] so a caller can both focus the offending
    // input and announce the reason. Empty array means "worth sending".

    function tooLong(value, limit) {
        return String(value || '').length > limit;
    }

    function validateContactInquiry(payload, locale) {
        const data = payload || {};
        const errors = [];
        if (!data.full_name) errors.push({ field: 'full_name', message: copy('required_name', locale) });
        else if (tooLong(data.full_name, LIMITS.name)) errors.push({ field: 'full_name', message: copy('too_long', locale) });
        if (!data.email) errors.push({ field: 'email', message: copy('required_email', locale) });
        else if (!isValidEmail(data.email)) errors.push({ field: 'email', message: copy('invalid_email', locale) });
        if (tooLong(data.phone, LIMITS.phone)) errors.push({ field: 'phone', message: copy('too_long', locale) });
        if (tooLong(data.subject, LIMITS.subject)) errors.push({ field: 'subject', message: copy('too_long', locale) });
        if (!data.message) errors.push({ field: 'message', message: copy('required_message', locale) });
        else if (tooLong(data.message, LIMITS.message)) errors.push({ field: 'message', message: copy('too_long', locale) });
        return errors;
    }

    function validateNewsletterSubscription(payload, locale) {
        const data = payload || {};
        const errors = [];
        if (!data.email) errors.push({ field: 'email', message: copy('required_email', locale) });
        else if (!isValidEmail(data.email)) errors.push({ field: 'email', message: copy('invalid_email', locale) });
        return errors;
    }

    /**
     * Positive consent is mandatory here, because the backend's consent
     * validator rejects an explicit `false` as well as an omitted field. Sending
     * an unchecked box would be a guaranteed 422, so the visitor is stopped at
     * the form with a reason instead.
     */
    function validateWebsiteSignup(payload, locale) {
        const data = payload || {};
        const errors = [];
        if (!data.first_name) errors.push({ field: 'first_name', message: copy('required_first_name', locale) });
        else if (tooLong(data.first_name, LIMITS.name)) errors.push({ field: 'first_name', message: copy('too_long', locale) });
        if (!data.last_name) errors.push({ field: 'last_name', message: copy('required_last_name', locale) });
        else if (tooLong(data.last_name, LIMITS.name)) errors.push({ field: 'last_name', message: copy('too_long', locale) });
        if (!data.email) errors.push({ field: 'email', message: copy('required_email', locale) });
        else if (!isValidEmail(data.email)) errors.push({ field: 'email', message: copy('invalid_email', locale) });
        if (tooLong(data.phone_number, LIMITS.phone)) errors.push({ field: 'phone_number', message: copy('too_long', locale) });
        if (data.consent_to_contact !== true) {
            errors.push({ field: 'consent_to_contact', message: copy('required_consent', locale) });
        }
        return errors;
    }

    // ───────────────────────────── transport ─────────────────────────────

    function requestError(message, extra) {
        const error = new Error(message);
        Object.assign(error, extra || {});
        return error;
    }

    /**
     * What the visitor reads. Backend detail strings are never passed through:
     * they are written for staff and can name internal fields, so each response
     * class maps to wording we control.
     */
    function friendlyMessage(error, kind, locale) {
        const fallbackKey = `${kind || 'contact'}_error`;
        const status = error && typeof error.status === 'number' ? error.status : 0;
        if (!status) return copy('network', locale);
        if (status === 429) return copy('rate_limited', locale);
        if (status === 400 || status === 422) return copy('invalid', locale);
        if (status === 409) return copy(fallbackKey, locale);
        if (status >= 500) return copy('server', locale);
        return copy(fallbackKey, locale);
    }

    async function request(path, options, scope) {
        const settings = options || {};
        const host = scope || (typeof globalThis !== 'undefined' ? globalThis : {});
        // Bound to its own global: browsers throw "Illegal invocation" when
        // window.fetch is pulled off the object and called on its own.
        const rawFetch = typeof host.fetch === 'function'
            ? host.fetch.bind(host)
            : (typeof fetch === 'function' ? fetch : null);
        if (!rawFetch) throw requestError('No fetch implementation available.', { status: 0 });

        const controller = typeof AbortController === 'function' ? new AbortController() : null;
        const timer = controller && typeof setTimeout === 'function'
            ? setTimeout(() => controller.abort(), settings.timeoutMs || REQUEST_TIMEOUT_MS)
            : null;
        const headers = { Accept: 'application/json', ...(settings.headers || {}) };
        if (settings.body !== undefined) headers['Content-Type'] = 'application/json';

        try {
            let response;
            try {
                response = await rawFetch(`${apiBase(host)}${path}`, {
                    ...settings,
                    headers,
                    signal: controller ? controller.signal : undefined,
                });
            } catch (cause) {
                // Offline, DNS, CORS, abort — all indistinguishable to fetch and
                // all "we could not reach MCC" to the visitor.
                throw requestError('The request could not be completed.', { status: 0, cause });
            }
            let payload = {};
            try {
                payload = await response.json();
            } catch (_) {
                payload = {};
            }
            if (!response.ok) {
                throw requestError(`Request failed (${response.status})`, {
                    status: response.status,
                    payload,
                });
            }
            return payload;
        } finally {
            if (timer !== null && typeof clearTimeout === 'function') clearTimeout(timer);
        }
    }

    function post(path, payload, scope) {
        return request(path, { method: 'POST', body: JSON.stringify(payload) }, scope);
    }

    return {
        DEFAULT_API_BASE,
        REQUEST_TIMEOUT_MS,
        LIMITS,
        PATHS,
        apiBase,
        copy,
        detectLocale,
        sourcePage,
        normalizeEmail,
        isValidEmail,
        buildContactInquiry,
        buildNewsletterSubscription,
        buildWebsiteSignup,
        validateContactInquiry,
        validateNewsletterSubscription,
        validateWebsiteSignup,
        friendlyMessage,
        request,
        submitContactInquiry: (payload, scope) => post(PATHS.contact, payload, scope),
        submitNewsletterSubscription: (payload, scope) => post(PATHS.newsletter, payload, scope),
        submitWebsiteSignup: (payload, scope) => post(PATHS.signup, payload, scope),
    };
});
