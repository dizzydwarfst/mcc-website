/**
 * MCC public events experience.
 *
 * The portal is the source of truth. A local published event keeps the first
 * launch useful while Event Studio is being deployed, but registrations are
 * always sent to the versioned portal event endpoint so consent evidence is
 * never lost in the legacy website-signup flow.
 */
(function initMccEvents() {
    'use strict';

    const DEFAULT_API_BASE = 'https://lms-system-backend-lake.vercel.app/api';
    const API_BASE = String(window.MCC_EVENTS_API_BASE || window.MCC_ENGAGEMENT_API_BASE || DEFAULT_API_BASE).replace(/\/$/, '');
    const REQUEST_TIMEOUT_MS = 15000;
    const EVENT_PATH_PREFIX = '/events/';

    const FALLBACK_EVENT = {
        id: 'fsl-trial-2026-09-01',
        event_id: 'fsl-trial-2026-09-01',
        slug: 'fsl-info-trial-session-september-2026',
        status: 'published',
        featured: true,
        priority: 1,
        eyebrow: 'Free FSL event',
        title: 'FSL Info & Trial Session',
        summary: 'Meet the team, ask questions, and experience MCC\'s communication-first French instruction in a free one-hour session.',
        description: 'This welcoming hybrid session is designed for future French learners who want to understand the program before enrolling. Join online or in person, learn how the course works, ask the instructor questions, and participate in a sample lesson.',
        start_at: '2026-09-01T17:00:00-07:00',
        end_at: '2026-09-01T18:00:00-07:00',
        timezone: 'America/Vancouver',
        attendance_modes: ['online', 'in_person'],
        registration_open: false,
        registration_reason: 'Online registration will open after MCC publishes the event and required policies.',
        is_free: true,
        program_url: '/programs-french-language',
        hero_image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1600&q=84',
        hero_alt: 'Students participating in an instructor-led information session',
        highlights: [
            { icon: 'fa-user-group', title: 'Meet the instructor', text: 'Learn about the teaching approach and ask about levels, schedules, and learning goals.' },
            { icon: 'fa-language', title: 'Try the lesson', text: 'Experience a communication-first sample class in a welcoming environment.' },
            { icon: 'fa-laptop', title: 'Choose your format', text: 'Attend online through a live link or join the in-person experience.' },
        ],
        agenda: [
            { time: '5:00–5:30 PM', title: 'Introduction & Q&A', text: 'Meet the team and ask about levels, schedules, delivery formats, and next steps.' },
            { time: '5:30–6:00 PM', title: 'Free trial class', text: 'Join a short immersive lesson and experience MCC\'s teaching style.' },
        ],
        process: [
            { title: 'Reserve your spot', text: 'Complete the registration form at the bottom of this page and select online or in-person attendance.' },
            { title: 'Receive your details', text: 'MCC will email your confirmation and, before the session, the online live link or in-person access information.' },
            { title: 'Join the free hour', text: 'Arrive a few minutes early, meet the instructor, ask questions, and take part in the trial lesson.' },
            { title: 'Choose your next step', text: 'After the event, our team can help you compare levels and prepare for the September course.' },
        ],
        course_details: {
            title: 'September French course',
            start_date: 'September 14, 2026',
            schedule: 'Monday–Thursday, 5:30–8:30 PM',
            delivery: 'In-person class or online synchronous live stream',
        },
        faqs: [
            { question: 'Do I need French experience?', answer: 'No. The information session is suitable for prospective learners exploring their options. Our team can explain levels and placement.' },
            { question: 'Is the trial session really free?', answer: 'Yes. Registration for this one-hour information and trial session is free.' },
            { question: 'How do I receive the online link or location?', answer: 'Register below. MCC will email the appropriate online access link or in-person instructions before the event.' },
            { question: 'What happens if I close the page after registering?', answer: 'Your registration is saved in the MCC Portal. Confirmation and necessary event updates are sent to the email you provide.' },
            { question: 'Will photos or video be taken?', answer: 'Photography or video may take place. The form requires you to acknowledge the notice and choose whether you consent to promotional use. Selecting no does not prevent registration.' },
        ],
        brochures: [
            { locale: 'en', title: 'English event brochure', url: '/assets/events/fsl-info-trial-september-2026/brochure-en.jpeg', thumbnail_url: '/assets/events/fsl-info-trial-september-2026/brochure-en.jpeg', file_type: 'image/jpeg' },
            { locale: 'zh', title: '中文活动宣传册', url: '/assets/events/fsl-info-trial-september-2026/brochure-zh.jpg', thumbnail_url: '/assets/events/fsl-info-trial-september-2026/brochure-zh.jpg', file_type: 'image/jpeg' },
        ],
    };

    const FALLBACK_POLICIES = {
        privacy: {
            policy_id: 'privacy-website-2026-08-10',
            type: 'privacy',
            version: '2026.08',
            title: 'Privacy Notice',
            effective_date: '2026-08-10',
            summary: 'How MCC collects, uses, protects, and manages personal information submitted through this website.',
            body: `
                <h2>Information MCC collects</h2>
                <p>MCC collects the information you choose to provide through application, agency, event, contact, and live-message forms. This may include identity and contact details, program interests, referral information, attendance preferences, documents, messages, and consent choices.</p>
                <h2>Why MCC uses it</h2>
                <p>MCC uses this information to respond to requests, administer applications and registrations, provide event access and updates, support students and partners, maintain records, protect the website, and meet legal or regulatory obligations. Promotional communication is sent only according to the marketing choice recorded on the relevant form.</p>
                <h2>Access, service providers, and retention</h2>
                <p>Authorized MCC staff and service providers supporting MCC systems may process information only for their assigned purposes. Records are retained according to applicable legal, regulatory, operational, and security requirements.</p>
                <h2>Your choices</h2>
                <p>You may ask about or request correction of your personal information and may withdraw optional marketing or future promotional-use consent, subject to legal and operational limits. Withdrawing consent does not affect uses that occurred before withdrawal.</p>
                <p><a href="/assets/policies/confidential-information-privacy-policy.pdf" target="_blank" rel="noopener">Open MCC's Confidential Information and Privacy Policy (PDF)</a>.</p>
            `,
        },
        terms: {
            policy_id: 'website-terms-2026-08-10',
            type: 'terms',
            version: '2026.08',
            title: 'Website Terms and Conditions',
            effective_date: '2026-08-10',
            summary: 'Terms governing use of MCC’s public website and online forms.',
            body: `
                <h2>Using this website</h2>
                <p>Use the MCC website lawfully and do not attempt to interfere with its security, availability, accounts, forms, or data. Information submitted through a form must be accurate to the best of your knowledge.</p>
                <h2>Educational information</h2>
                <p>Website content is general information and may change. Submitting an inquiry, registration, or application does not guarantee admission, enrolment, a seat, immigration status, employment, certification, or any other outcome. Official enrolment agreements and published college policies govern enrolled students where applicable.</p>
                <h2>Intellectual property</h2>
                <p>MCC website text, branding, graphics, brochures, and other materials may not be republished commercially without permission, except for ordinary sharing through the provided event-sharing tools.</p>
                <h2>Third-party services and availability</h2>
                <p>Links and integrated services may be operated by third parties under their own terms. MCC works to keep information and services available but does not guarantee uninterrupted or error-free access.</p>
                <h2>Applicable law and contact</h2>
                <p>These terms are governed by the laws applicable in British Columbia, Canada. Questions may be sent to admin@metropolitancollege.ca.</p>
            `,
        },
        event_terms: {
            policy_id: 'event-terms-2026-08-10',
            type: 'event_terms',
            version: '2026.08',
            title: 'Event Terms',
            effective_date: '2026-08-10',
            summary: 'Registration, attendance, access, conduct, cancellation, and recording terms for MCC events.',
            body: `
                <h2>Registration and capacity</h2>
                <p>Registration is personal and subject to event capacity. MCC may contact you with confirmations, reminders, access instructions, schedule changes, cancellations, and follow-up that is necessary to administer the event.</p>
                <h2>Online and in-person access</h2>
                <p>Do not redistribute private event links, access codes, or location instructions. Follow reasonable safety, conduct, and staff directions during the event. Disruptive or unsafe participation may be ended.</p>
                <h2>Changes and cancellation</h2>
                <p>MCC may change the instructor, agenda, delivery format, date, or capacity when reasonably necessary and will use the registration contact information to provide important updates.</p>
                <h2>Photography and video</h2>
                <p>Photography or video may occur when disclosed on the event page. Registration records your separate media choice. A participant selecting no consent should use the no-photo process provided by staff or keep their camera off online.</p>
                <h2>General information</h2>
                <p>Event and program information is educational and is not legal or immigration advice. Program admission and enrolment remain subject to MCC’s official requirements and agreements.</p>
            `,
        },
        media_release: {
            policy_id: 'media-release-2026-08-10',
            type: 'media_release',
            version: '2026.08',
            title: 'Media Release',
            effective_date: '2026-08-10',
            summary: 'The choice governing promotional use of a participant’s image, voice, or appearance.',
            body: `
                <h2>Your media choice</h2>
                <p>When an event includes photography or recording, every registrant must choose yes or no. Choosing no does not block event registration. Staff may use a no-photo identifier or designated area; online participants may keep their camera off.</p>
                <h2>If you choose yes</h2>
                <p>You permit MCC to capture and use photographs, video, audio, and related event material containing your image or voice for MCC educational, informational, recruitment, social-media, advertising, and promotional purposes, in digital or printed formats.</p>
                <h2>Withdrawal</h2>
                <p>You may contact MCC to withdraw permission for future use. Withdrawal cannot undo materials already produced, distributed, or published before MCC processed the request.</p>
                <h2>Participants under the age of majority</h2>
                <p>A parent or legal guardian must complete any required release for a minor before promotional media containing the minor is used.</p>
            `,
        },
        marketing_consent: {
            policy_id: 'marketing-consent-2026-08-10',
            type: 'marketing_consent',
            version: '2026.08',
            title: 'Marketing Communication Choice',
            effective_date: '2026-08-10',
            summary: 'The choice governing future MCC program, event, and promotional messages.',
            body: `
                <h2>If you choose yes</h2>
                <p>MCC may use the contact details you provide to send information about future programs, events, application opportunities, and promotions. Messages will identify MCC and provide a way to unsubscribe where required.</p>
                <h2>If you choose no</h2>
                <p>MCC will limit communication to messages necessary for the application, inquiry, registration, event, existing relationship, or another purpose permitted by law.</p>
                <h2>Changing your choice</h2>
                <p>You may unsubscribe through a message or contact MCC. A change applies to future promotional communication after it is processed and does not prevent necessary service or transaction messages.</p>
            `,
        },
    };

    const FALLBACK_CONSENT_FORM = {
        locale: 'en',
        acknowledgements: [
            { field: 'privacy_accepted', label: 'I have read and agree to the Privacy Policy.', required: true, value: null },
            { field: 'terms_accepted', label: 'I have read and agree to the Terms and Conditions and Event Terms.', required: true, value: null },
            { field: 'media_notice_acknowledged', label: 'I understand that photography and video recording may take place during this session.', required: true, value: null },
        ],
        choices: [
            {
                field: 'media_choice', label: 'Photography and video', required: true, value: null,
                options: [
                    { value: 'consent', label: 'I consent to MCC using photographs or video containing my image or voice for educational, promotional and marketing purposes.' },
                    { value: 'no_consent', label: 'I do not consent. Please identify me as a no-photo participant or allow camera-off participation online.' },
                ],
            },
            {
                field: 'marketing_choice', label: 'Future MCC news', required: true, value: null,
                options: [
                    { value: 'consent', label: 'I would like to receive information about future MCC programs, events and promotions.' },
                    { value: 'no_consent', label: 'Only contact me about this registration and event.' },
                ],
            },
        ],
        operational_contact_notice: 'Regardless of your marketing choice, we will send you the messages needed to run this event: your registration confirmation, reminders, joining or access details, schedule changes, and any necessary follow-up about this event.',
        minor: {
            age_threshold: 19,
            declaration: 'I am the parent or legal guardian of this participant and I am authorised to make these choices on their behalf.',
            fields: ['guardian_name', 'guardian_email', 'guardian_relationship'],
        },
        policies: [],
    };

    function ready(callback) {
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', callback, { once: true });
        else callback();
    }

    function escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function safeUrl(value, fallback = '#') {
        try {
            const raw = String(value || '').trim();
            if (!raw) return fallback;
            const url = new URL(raw, window.location.origin);
            if (!['http:', 'https:'].includes(url.protocol)) return fallback;
            return url.href;
        } catch (_) {
            return fallback;
        }
    }

    function locale() {
        if (document.body?.dataset.lang === 'fr') return 'fr';
        try { return localStorage.getItem('mcc_lang') === 'fr' ? 'fr' : 'en'; } catch (_) { return 'en'; }
    }

    function apiErrorMessage(payload, fallback) {
        if (typeof payload?.detail === 'string') return payload.detail;
        if (Array.isArray(payload?.detail)) {
            const messages = payload.detail.map((item) => {
                if (typeof item === 'string') return item;
                if (typeof item?.msg === 'string') return item.msg.replace(/^Value error,\s*/i, '');
                return '';
            }).filter(Boolean);
            if (messages.length) return messages.join(' ');
        }
        if (typeof payload?.message === 'string') return payload.message;
        return fallback;
    }

    async function apiRequest(path, options = {}) {
        const controller = new AbortController();
        const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
        const headers = { Accept: 'application/json', ...(options.headers || {}) };
        if (options.body !== undefined) headers['Content-Type'] = 'application/json';
        try {
            const response = await fetch(`${API_BASE}${path}`, { ...options, headers, signal: controller.signal });
            const payload = await response.json().catch(() => ({}));
            if (!response.ok) {
                const error = new Error(apiErrorMessage(payload, `Request failed (${response.status})`));
                error.status = response.status;
                error.payload = payload;
                throw error;
            }
            return payload;
        } finally {
            window.clearTimeout(timeout);
        }
    }

    function localizedRecord(raw) {
        if (!raw || typeof raw !== 'object') return {};
        const translations = raw.translations || raw.locales || {};
        return { ...raw, ...(translations[locale()] || translations.en || {}) };
    }

    function normalizeEvent(raw) {
        const isLocalFallback = raw === FALLBACK_EVENT;
        const event = localizedRecord(raw);
        const agenda = Array.isArray(event.agenda) ? event.agenda : Array.isArray(event.schedule) ? event.schedule : [];
        const highlights = Array.isArray(event.highlights) ? event.highlights : Array.isArray(event.benefits) ? event.benefits : [];
        const base = isLocalFallback ? FALLBACK_EVENT : {
            status: 'published', featured: false, priority: 9999, eyebrow: 'MCC event',
            title: 'MCC Event', summary: '', description: '', description_html: '', start_at: '', end_at: '',
            timezone: 'America/Vancouver', attendance_modes: ['online'], registration_open: false,
            registration_reason: 'Registration is not available.', is_free: true, program_url: '/programs',
            hero_image: FALLBACK_EVENT.hero_image, hero_alt: '', highlights: [], agenda: [], process: [],
            course_details: {}, faqs: [], brochures: [], policies: [], consent_form: FALLBACK_CONSENT_FORM,
            seo: {}, social: {}, gallery: [], location_summary: '', contact_email: '', contact_phone: '',
        };
        const hero = event.hero_image && typeof event.hero_image === 'object' ? event.hero_image : null;
        const attendanceMode = String(event.attendance_mode || '').toLowerCase();
        const attendanceModes = attendanceMode === 'hybrid'
            ? ['online', 'in_person']
            : attendanceMode === 'in_person' ? ['in_person']
                : attendanceMode === 'online' ? ['online']
                    : (Array.isArray(event.attendance_modes) ? event.attendance_modes : base.attendance_modes);
        return {
            ...base,
            ...event,
            id: event.id || event._id || event.event_id || base.id || '',
            event_id: event.event_id || event.public_id || event.id || base.event_id || '',
            slug: event.slug || base.slug || '',
            title: event.title || event.name || base.title,
            summary: event.summary || event.short_description || base.summary,
            description: event.description || event.body || base.description,
            description_html: event.description_html || base.description_html || '',
            start_at: event.start_at || event.start_datetime || event.start || base.start_at,
            end_at: event.end_at || event.end_datetime || event.end || base.end_at,
            agenda: agenda.length ? agenda : base.agenda,
            highlights: highlights.length ? highlights : base.highlights,
            process: Array.isArray(event.how_it_works) && event.how_it_works.length
                ? event.how_it_works
                : Array.isArray(event.process) && event.process.length ? event.process : base.process,
            faqs: Array.isArray(event.faqs) && event.faqs.length ? event.faqs : base.faqs,
            brochures: Array.isArray(event.brochures) && event.brochures.length ? event.brochures : base.brochures,
            attendance_modes: attendanceModes,
            hero_image: hero?.url || (typeof event.hero_image === 'string' ? event.hero_image : base.hero_image),
            hero_alt: hero?.alt_text || event.hero_alt || base.hero_alt || '',
            registration_open: typeof event.registration?.open === 'boolean'
                ? event.registration.open : (typeof event.registration_open === 'boolean' ? event.registration_open : base.registration_open),
            registration_reason: event.registration?.reason || event.registration_reason || base.registration_reason || '',
            registration_endpoint: event.registration_endpoint || '',
            waitlist: Boolean(event.registration?.waitlist),
            seats_remaining: event.registration?.seats_remaining,
            consent_form: event.consent_form || base.consent_form || FALLBACK_CONSENT_FORM,
        };
    }

    function listFromPayload(payload) {
        const records = Array.isArray(payload) ? payload : payload?.events || payload?.items || payload?.results || [];
        return records.map(normalizeEvent);
    }

    async function loadEvents({ featured = false, limit = 24 } = {}) {
        const query = new URLSearchParams({ status: 'published', upcoming: 'true', limit: String(limit), locale: locale() });
        if (featured) query.set('featured', 'true');
        try {
            const events = listFromPayload(await apiRequest(`/public/events?${query}`));
            return events.length ? events : [normalizeEvent(FALLBACK_EVENT)];
        } catch (error) {
            console.info('[MCC events] Portal event list is not available yet; using the local published event.', error);
            return [normalizeEvent(FALLBACK_EVENT)];
        }
    }

    function eventSlugFromLocation() {
        const querySlug = new URLSearchParams(window.location.search).get('slug');
        if (querySlug) return querySlug;
        const path = window.location.pathname.replace(/\/$/, '');
        const marker = path.lastIndexOf(EVENT_PATH_PREFIX);
        return marker >= 0 ? decodeURIComponent(path.slice(marker + EVENT_PATH_PREFIX.length)) : '';
    }

    async function loadEvent(slug) {
        try {
            const payload = await apiRequest(`/public/events/${encodeURIComponent(slug)}?locale=${encodeURIComponent(locale())}`);
            return normalizeEvent(payload?.event || payload);
        } catch (error) {
            if (!slug || slug === FALLBACK_EVENT.slug || slug === FALLBACK_EVENT.event_id) return normalizeEvent(FALLBACK_EVENT);
            throw error;
        }
    }

    function formatDate(event, includeYear = true) {
        const date = new Date(event.start_at);
        if (Number.isNaN(date.getTime())) return '';
        return new Intl.DateTimeFormat(locale() === 'fr' ? 'fr-CA' : 'en-CA', {
            weekday: 'long', month: 'long', day: 'numeric', ...(includeYear ? { year: 'numeric' } : {}),
            timeZone: event.timezone || 'America/Vancouver',
        }).format(date);
    }

    function formatTimeRange(event) {
        const start = new Date(event.start_at);
        const end = new Date(event.end_at);
        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return '';
        const options = { hour: 'numeric', minute: '2-digit', timeZone: event.timezone || 'America/Vancouver' };
        const formatter = new Intl.DateTimeFormat(locale() === 'fr' ? 'fr-CA' : 'en-CA', options);
        return `${formatter.format(start)}–${formatter.format(end)}`;
    }

    function attendanceLabel(event) {
        const modes = event.attendance_modes || [];
        if (modes.includes('online') && (modes.includes('in_person') || modes.includes('in-person'))) return 'Online or in person';
        if (modes.includes('online')) return 'Online';
        return 'In person';
    }

    function eventHref(event) {
        return `${EVENT_PATH_PREFIX}${encodeURIComponent(event.slug)}`;
    }

    function eventCard(event, compact = false) {
        const image = safeUrl(event.hero_image, FALLBACK_EVENT.hero_image);
        const registrationLabel = event.registration_open === false ? 'View Event' : (event.waitlist ? 'Join the Waitlist' : 'Sign Up for Free');
        return `
            <article class="event-card${compact ? ' is-featured' : ''}">
                <a class="event-card-media" href="${escapeHtml(eventHref(event))}" aria-label="View ${escapeHtml(event.title)}">
                    <img src="${escapeHtml(image)}" alt="${escapeHtml(event.hero_alt || '')}">
                    <span class="event-card-date"><strong>${escapeHtml(new Date(event.start_at).getDate())}</strong>${escapeHtml(new Intl.DateTimeFormat('en-CA', { month: 'short', timeZone: event.timezone || 'America/Vancouver' }).format(new Date(event.start_at)))}</span>
                </a>
                <div class="event-card-content">
                    <span class="section-kicker">${escapeHtml(event.eyebrow || 'MCC event')}</span>
                    <h3><a href="${escapeHtml(eventHref(event))}">${escapeHtml(event.title)}</a></h3>
                    <p>${escapeHtml(event.summary)}</p>
                    <div class="event-card-meta">
                        <span><i class="fa-regular fa-calendar" aria-hidden="true"></i>${escapeHtml(formatDate(event))}</span>
                        <span><i class="fa-regular fa-clock" aria-hidden="true"></i>${escapeHtml(formatTimeRange(event))}</span>
                        <span><i class="fa-solid fa-location-dot" aria-hidden="true"></i>${escapeHtml(attendanceLabel(event))}</span>
                    </div>
                    <div class="event-card-actions">
                        <a class="btn-solid-gold" href="${escapeHtml(eventHref(event))}${event.registration_open === false ? '' : '#register'}">${registrationLabel}</a>
                        <a class="subtle-link" href="${escapeHtml(eventHref(event))}">Event details <i class="fas fa-arrow-right" aria-hidden="true"></i></a>
                    </div>
                </div>
            </article>
        `;
    }

    async function renderEventLists() {
        const homeRoot = document.querySelector('[data-events-home]');
        const listRoot = document.querySelector('[data-events-list]');
        if (!homeRoot && !listRoot) return;
        const events = await loadEvents({ featured: Boolean(homeRoot), limit: homeRoot ? 3 : 24 });
        if (homeRoot) {
            homeRoot.innerHTML = events.slice(0, 3).map((event) => eventCard(event, events.length === 1)).join('');
            homeRoot.removeAttribute('aria-busy');
        }
        if (listRoot) {
            listRoot.innerHTML = events.length
                ? events.map((event) => eventCard(event)).join('')
                : '<div class="events-empty"><h2>No upcoming events</h2><p>New MCC events will appear here when registration opens.</p></div>';
            listRoot.removeAttribute('aria-busy');
        }
    }

    function policyListFromPayload(payload) {
        return Array.isArray(payload) ? payload : payload?.policies || payload?.items || payload?.results || [];
    }

    async function loadPolicies(types) {
        const uniqueTypes = [...new Set(types)];
        try {
            const query = new URLSearchParams({ types: uniqueTypes.join(','), locale: locale() });
            const payload = await apiRequest(`/public/legal/policies?${query}`);
            const records = policyListFromPayload(payload);
            const mapped = {};
            records.forEach((record) => {
                const type = record.type || record.policy_type;
                if (type) mapped[type] = { ...FALLBACK_POLICIES[type], ...record, is_published: true };
            });
            uniqueTypes.forEach((type) => {
                if (!mapped[type]) mapped[type] = { ...FALLBACK_POLICIES[type], is_published: false };
            });
            mapped.__consentForm = payload?.consent_form || FALLBACK_CONSENT_FORM;
            return mapped;
        } catch (error) {
            console.info('[MCC events] Published portal policies are not available.', error);
            return {
                ...Object.fromEntries(uniqueTypes.map((type) => [type, { ...FALLBACK_POLICIES[type], is_published: false }])),
                __consentForm: FALLBACK_CONSENT_FORM,
            };
        }
    }

    function policyHref(type) {
        return `/legal?type=${encodeURIComponent(type)}`;
    }

    function acknowledgementResources(field) {
        if (field === 'privacy_accepted') return `<a href="${policyHref('privacy')}" target="_blank" rel="noopener">Read Privacy Policy</a>`;
        if (field === 'terms_accepted') return `<a href="${policyHref('terms')}" target="_blank" rel="noopener">Website Terms</a> <span aria-hidden="true">·</span> <a href="${policyHref('event_terms')}" target="_blank" rel="noopener">Event Terms</a>`;
        if (field === 'media_notice_acknowledged') return `<a href="${policyHref('media_release')}" target="_blank" rel="noopener">Read Media Release</a>`;
        return '';
    }

    function consentFormTemplate(definition) {
        const form = definition && typeof definition === 'object' ? definition : FALLBACK_CONSENT_FORM;
        const acknowledgements = Array.isArray(form.acknowledgements) ? form.acknowledgements : [];
        const choices = Array.isArray(form.choices) ? form.choices : [];
        const minor = form.minor || FALLBACK_CONSENT_FORM.minor;
        return `
            <fieldset class="event-choice-group event-minor-choice">
                <legend>Participant age <strong>Required—choose one</strong></legend>
                <p>Participants under ${escapeHtml(minor.age_threshold || 19)} require a parent or legal guardian declaration.</p>
                <label><input type="radio" name="is_minor" value="false" required><span>The participant is ${escapeHtml(minor.age_threshold || 19)} or older.</span></label>
                <label><input type="radio" name="is_minor" value="true" required><span>The participant is under ${escapeHtml(minor.age_threshold || 19)}.</span></label>
            </fieldset>
            <div class="event-guardian-fields" data-guardian-fields hidden>
                <h3>Parent or legal guardian</h3>
                <div class="event-form-grid">
                    <label>Guardian name<input type="text" name="guardian_name" maxlength="120" autocomplete="name"></label>
                    <label>Guardian email<input type="email" name="guardian_email" maxlength="254" autocomplete="email"></label>
                    <label>Relationship to participant<input type="text" name="guardian_relationship" maxlength="80" placeholder="For example: parent"></label>
                </div>
                <label class="event-check"><input type="checkbox" name="guardian_declaration_accepted"><span>${escapeHtml(minor.declaration || FALLBACK_CONSENT_FORM.minor.declaration)}</span></label>
            </div>
            <div class="event-legal-box">
                <h3>Privacy and registration terms</h3>
                ${acknowledgements.map((item) => `
                    <label class="event-check">
                        <input type="checkbox" name="${escapeHtml(item.field)}"${item.required ? ' required' : ''}>
                        <span>${escapeHtml(item.label)} <span class="event-policy-links">${acknowledgementResources(item.field)}</span></span>
                    </label>
                `).join('')}
            </div>
            ${choices.map((choice) => `
                <fieldset class="event-choice-group">
                    <legend>${escapeHtml(choice.label)}${choice.required ? ' <strong>Required—choose one</strong>' : ''}</legend>
                    ${choice.field === 'media_choice' ? '<p>Selecting no does not prevent registration.</p>' : ''}
                    ${(Array.isArray(choice.options) ? choice.options : []).map((option) => `
                        <label><input type="radio" name="${escapeHtml(choice.field)}" value="${escapeHtml(option.value)}"${choice.required ? ' required' : ''}><span>${escapeHtml(option.label)}</span></label>
                    `).join('')}
                    ${choice.field === 'marketing_choice' ? `<p><a href="${policyHref('marketing_consent')}" target="_blank" rel="noopener">How MCC handles marketing choices</a></p>` : ''}
                </fieldset>
            `).join('')}
            <p class="event-operational-notice"><i class="fas fa-circle-info" aria-hidden="true"></i>${escapeHtml(form.operational_contact_notice || FALLBACK_CONSENT_FORM.operational_contact_notice)}</p>
        `;
    }

    function attendanceOptionsTemplate(event) {
        const modes = event.attendance_modes || [];
        const options = [];
        if (modes.includes('online')) options.push('<option value="online">Online</option>');
        if (modes.includes('in_person') || modes.includes('in-person')) options.push('<option value="in_person">In person</option>');
        if (options.length > 1) options.push('<option value="undecided">Not sure yet</option>');
        return options.join('') || '<option value="undecided">Contact MCC for attendance details</option>';
    }

    function courseCardTemplate(event) {
        const details = event.course_details || {};
        if (details.title || details.start_date || details.schedule || details.delivery) {
            return `
                <aside class="event-course-card">
                    <span class="section-kicker">Continue learning</span><h3>${escapeHtml(details.title || 'Program details')}</h3>
                    <dl><div><dt>Course starts</dt><dd>${escapeHtml(details.start_date || 'Ask our team')}</dd></div><div><dt>Class schedule</dt><dd>${escapeHtml(details.schedule || 'Ask our team')}</dd></div><div><dt>Delivery</dt><dd>${escapeHtml(details.delivery || attendanceLabel(event))}</dd></div></dl>
                    <a href="${escapeHtml(safeUrl(event.program_url, '/programs'))}" class="subtle-link">Explore the program <i class="fas fa-arrow-right" aria-hidden="true"></i></a>
                </aside>`;
        }
        return `
            <aside class="event-course-card">
                <span class="section-kicker">Event at a glance</span><h3>${escapeHtml(attendanceLabel(event))}</h3>
                <dl><div><dt>Date</dt><dd>${escapeHtml(formatDate(event))}</dd></div><div><dt>Time</dt><dd>${escapeHtml(formatTimeRange(event))} Pacific</dd></div>${event.location_summary ? `<div><dt>Location</dt><dd>${escapeHtml(event.location_summary)}</dd></div>` : ''}</dl>
                ${event.contact_email ? `<a href="mailto:${escapeHtml(event.contact_email)}" class="subtle-link">Contact the event team <i class="fas fa-arrow-right" aria-hidden="true"></i></a>` : ''}
            </aside>`;
    }

    function brochurePreviewTemplate(brochure, url) {
        const contentType = String(brochure.content_type || brochure.file_type || '').toLowerCase();
        const previewValue = brochure.thumbnail_url || brochure.preview_url || (contentType.startsWith('image/') ? brochure.url || brochure.asset_url : '');
        if (previewValue) {
            return `<img src="${escapeHtml(safeUrl(previewValue))}" alt="${escapeHtml(brochure.title || 'Event brochure')}">`;
        }
        const label = contentType.includes('pdf') ? 'PDF' : 'FILE';
        return `<span class="event-brochure-file-preview"><i class="fas fa-file-pdf" aria-hidden="true"></i><strong>${label}</strong><small>Open brochure</small></span>`;
    }

    function detailTemplate(event, consentForm) {
        const heroImage = safeUrl(event.hero_image, FALLBACK_EVENT.hero_image);
        return `
            <section class="event-detail-hero">
                <div class="event-detail-hero-copy">
                    <a class="event-back-link" href="/events"><i class="fas fa-arrow-left" aria-hidden="true"></i> All events</a>
                    <span class="section-kicker">${escapeHtml(event.eyebrow || 'MCC event')}</span>
                    <h1>${escapeHtml(event.title)}</h1>
                    <p>${escapeHtml(event.summary)}</p>
                    <div class="event-hero-facts">
                        <span><i class="fa-regular fa-calendar" aria-hidden="true"></i><strong>${escapeHtml(formatDate(event))}</strong></span>
                        <span><i class="fa-regular fa-clock" aria-hidden="true"></i><strong>${escapeHtml(formatTimeRange(event))}</strong> Pacific time</span>
                        <span><i class="fa-solid fa-location-dot" aria-hidden="true"></i><strong>${escapeHtml(attendanceLabel(event))}</strong></span>
                    </div>
                    <div class="hero-action-row">
                        <a class="btn-solid-gold" href="${event.registration_open === false ? '#overview' : '#register'}">${event.registration_open === false ? 'View Event Details' : (event.waitlist ? 'Join the Waitlist' : 'Reserve My Free Spot')}</a>
                        <a class="btn-outline-gold" href="#brochures">View Brochures</a>
                    </div>
                </div>
                <div class="event-detail-hero-media">
                    <img src="${escapeHtml(heroImage)}" alt="${escapeHtml(event.hero_alt || '')}">
                    <div class="event-hero-badge"><strong>1 free hour</strong><span>Information, Q&A, and a trial class</span></div>
                </div>
            </section>

            <nav class="event-jump-nav" aria-label="Event page sections">
                <a href="#overview">Overview</a><a href="#schedule">Schedule</a><a href="#process">How it works</a><a href="#brochures">Brochures</a><a href="#questions">FAQ</a><a href="#register">Register</a>
            </nav>

            <section class="event-section" id="overview">
                <div class="event-section-heading"><span class="section-kicker">Why attend</span><h2>Explore the program before you enrol</h2><div class="event-description">${event.description_html ? sanitizePolicyHtml(event.description_html) : `<p>${escapeHtml(event.description)}</p>`}</div></div>
                <div class="event-highlight-grid">
                    ${event.highlights.map((item) => `
                        <article><span class="event-icon"><i class="fas ${escapeHtml(item.icon || 'fa-check')}" aria-hidden="true"></i></span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.body || item.text || item.description)}</p></article>
                    `).join('')}
                </div>
            </section>

            <section class="event-section event-schedule-section" id="schedule">
                <div class="event-section-heading"><span class="section-kicker">Your free hour</span><h2>A clear, useful introduction to MCC French</h2></div>
                <div class="event-agenda-grid">
                    <div class="event-agenda-list">
                        ${event.agenda.map((item, index) => `<article><span>${String(index + 1).padStart(2, '0')}</span><time>${escapeHtml(item.time || item.start_time)}</time><div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.body || item.text || item.description)}</p></div></article>`).join('')}
                    </div>
                    ${courseCardTemplate(event)}
                </div>
            </section>

            <section class="event-section" id="process">
                <div class="event-section-heading"><span class="section-kicker">How it works</span><h2>From registration to your trial lesson</h2></div>
                <ol class="event-process-grid">
                    ${event.process.map((item, index) => `<li><span>${index + 1}</span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.body || item.text || item.description)}</p></li>`).join('')}
                </ol>
                <div class="event-access-note"><i class="fas fa-shield-halved" aria-hidden="true"></i><div><strong>Private access details stay private</strong><p>The online live link and precise in-person instructions are sent to registered attendees instead of being published openly.</p></div></div>
            </section>

            <section class="event-section event-brochure-section" id="brochures">
                <div class="event-section-heading"><span class="section-kicker">Event brochures</span><h2>View, download, and share</h2><p>Choose the language you need. Each brochure links back to this live event page for the latest registration information.</p></div>
                <div class="event-brochure-grid">
                    ${event.brochures.map((brochure) => {
                        const url = safeUrl(brochure.url || brochure.asset_url);
                        return `<article><a class="event-brochure-preview" href="${escapeHtml(url)}" target="_blank" rel="noopener" aria-label="${escapeHtml(brochure.title || 'Open event brochure')}">${brochurePreviewTemplate(brochure, url)}</a><div><span>${escapeHtml(String(brochure.locale || '').toUpperCase())}</span><h3>${escapeHtml(brochure.title || 'Event brochure')}</h3>${brochure.description ? `<p>${escapeHtml(brochure.description)}</p>` : ''}<a href="${escapeHtml(url)}" target="_blank" rel="noopener" class="btn-outline-gold">${escapeHtml(brochure.title || 'Open brochure')} <i class="fas fa-arrow-up-right-from-square" aria-hidden="true"></i></a></div></article>`;
                    }).join('')}
                </div>
                <div class="event-share-card" data-event-share>
                    <div><span class="section-kicker">Share this event</span><h3>Know someone who wants to learn French?</h3><p>Send them the live page so they always see the current event details.</p></div>
                    <div class="event-share-actions">
                        <button type="button" data-share="native"><i class="fas fa-share-nodes" aria-hidden="true"></i> Share</button>
                        <button type="button" data-share="copy"><i class="fas fa-link" aria-hidden="true"></i> Copy link</button>
                        <a data-share-link="facebook" href="#" target="_blank" rel="noopener" aria-label="Share on Facebook"><i class="fa-brands fa-facebook-f" aria-hidden="true"></i></a>
                        <a data-share-link="linkedin" href="#" target="_blank" rel="noopener" aria-label="Share on LinkedIn"><i class="fa-brands fa-linkedin-in" aria-hidden="true"></i></a>
                        <a data-share-link="whatsapp" href="#" target="_blank" rel="noopener" aria-label="Share on WhatsApp"><i class="fa-brands fa-whatsapp" aria-hidden="true"></i></a>
                        <a data-share-link="email" href="#" aria-label="Share by email"><i class="fas fa-envelope" aria-hidden="true"></i></a>
                        ${(Array.isArray(event.social?.campaign_links) ? event.social.campaign_links : []).map((link) => `<a class="event-campaign-link" href="${escapeHtml(safeUrl(link.url))}" target="_blank" rel="noopener">${escapeHtml(link.label || 'Campaign link')}</a>`).join('')}
                    </div>
                    <p class="event-share-status" data-share-status role="status" aria-live="polite"></p>
                </div>
            </section>

            <section class="event-section" id="questions">
                <div class="event-section-heading"><span class="section-kicker">Questions</span><h2>What to know before registering</h2></div>
                <div class="event-faq-list">
                    ${event.faqs.map((item) => `<details><summary>${escapeHtml(item.question || item.title)}<i class="fas fa-plus" aria-hidden="true"></i></summary><p>${escapeHtml(item.answer || item.body)}</p></details>`).join('')}
                </div>
            </section>

            <section class="event-registration-section" id="register">
                <div class="event-registration-intro"><span class="section-kicker">Free registration</span><h2>Reserve your place</h2><p>Complete the form once. MCC will send the online link or in-person instructions before the session.</p><div class="event-registration-summary"><span><i class="fa-regular fa-calendar" aria-hidden="true"></i>${escapeHtml(formatDate(event))}</span><span><i class="fa-regular fa-clock" aria-hidden="true"></i>${escapeHtml(formatTimeRange(event))} Pacific</span><span><i class="fa-solid fa-location-dot" aria-hidden="true"></i>${escapeHtml(attendanceLabel(event))}</span></div><button type="button" class="btn-text-question" data-website-chat-open><i class="fas fa-message" aria-hidden="true"></i> Ask a Question</button></div>
                <div class="event-registration-card">
                    <form data-event-registration novalidate${event.registration_open === false ? ' hidden' : ''}>
                        <div class="event-form-grid">
                            <label>First name <input type="text" name="first_name" autocomplete="given-name" maxlength="100" required></label>
                            <label>Last name <input type="text" name="last_name" autocomplete="family-name" maxlength="100" required></label>
                            <label>Email address <input type="email" name="email" autocomplete="email" maxlength="254" required></label>
                            <label>Phone number <input type="tel" name="phone_number" autocomplete="tel" maxlength="50" required></label>
                            <label>How would you like to attend?<select name="attendance_preference" required><option value="">Choose one</option>${attendanceOptionsTemplate(event)}</select></label>
                            <label>How did you hear about us?<select name="how_did_you_hear_about_us" required><option value="">Choose one</option><option value="google_search">Google or another search engine</option><option value="instagram">Instagram</option><option value="facebook">Facebook</option><option value="tiktok">TikTok</option><option value="friend_family">Friend or family</option><option value="agency">Agency</option><option value="other">Other</option></select></label>
                            <label class="event-agency-field" hidden>Which agency?<input type="text" name="agency_name" maxlength="200" autocomplete="organization"></label>
                        </div>
                        ${consentFormTemplate(consentForm)}
                        <label class="event-honeypot" aria-hidden="true">Company website<input type="text" name="company_website" tabindex="-1" autocomplete="off"></label>
                        <p class="event-form-status" data-event-form-status role="status" aria-live="polite"></p>
                        <button class="btn-solid-gold event-register-submit" type="submit">Reserve My Free Spot</button>
                    </form>
                    ${event.registration_open === false ? `<div class="event-registration-success"><span><i class="fas fa-calendar-xmark" aria-hidden="true"></i></span><h3>Registration is closed</h3><p>${escapeHtml(event.registration_reason || 'This event is no longer accepting online registrations.')}</p><button type="button" class="btn-outline-gold" data-website-chat-open>Ask MCC</button></div>` : ''}
                    <div class="event-registration-success" data-event-registration-success hidden><span><i class="fas fa-check" aria-hidden="true"></i></span><h3>Your registration is saved</h3><p>Thank you. MCC will send event details and necessary updates to your email.</p><a class="btn-outline-gold" href="/events">Explore more events</a></div>
                </div>
            </section>
            <aside class="event-recording-disclaimer">
                <i class="fas fa-camera" aria-hidden="true"></i>
                <div><strong>Photography and video notice</strong><p>Photography and video may take place during this session. MCC uses identifiable images for educational or promotional purposes according to the media choice recorded during registration. If you select no, tell the event team when you arrive so they can provide the no-photo process; online participants may keep their camera off.</p></div>
            </aside>
        `;
    }

    function setupSharing(event) {
        const canonicalUrl = safeUrl(event.social?.share_url || event.seo?.canonical_url, `${window.location.origin}${eventHref(event)}`);
        const shareTitle = event.social?.title || event.title;
        const shareSummary = event.social?.summary || event.summary;
        const encodedUrl = encodeURIComponent(canonicalUrl);
        const encodedTitle = encodeURIComponent(`${shareTitle} | Metropolitan Community College`);
        const links = {
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
            whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
            email: `mailto:?subject=${encodedTitle}&body=${encodeURIComponent(`${shareSummary}\n\n${canonicalUrl}`)}`,
        };
        Object.entries(links).forEach(([type, href]) => {
            const anchor = document.querySelector(`[data-share-link="${type}"]`);
            if (anchor) anchor.href = href;
        });
        const root = document.querySelector('[data-event-share]');
        const status = root?.querySelector('[data-share-status]');
        root?.addEventListener('click', async (clickEvent) => {
            const button = clickEvent.target.closest('button[data-share]');
            if (!button) return;
            if (button.dataset.share === 'native' && navigator.share) {
                try { await navigator.share({ title: shareTitle, text: shareSummary, url: canonicalUrl }); } catch (_) { /* visitor cancelled */ }
                return;
            }
            try {
                await navigator.clipboard.writeText(canonicalUrl);
                if (status) status.textContent = 'Event link copied.';
            } catch (_) {
                window.prompt('Copy this event link:', canonicalUrl);
            }
        });
    }

    function registrationApiPath(event) {
        const supplied = String(event.registration_endpoint || '').trim();
        if (supplied) {
            try {
                const url = new URL(supplied, `${API_BASE}/`);
                return `${url.pathname.replace(/^\/api(?=\/)/, '')}${url.search}`;
            } catch (_) {
                // Fall through to the internal event UUID.
            }
        }
        return `/public/events/${encodeURIComponent(event.id)}/registrations`;
    }

    function utmValues() {
        const query = new URLSearchParams(window.location.search);
        return {
            utm_source: query.get('utm_source') || '',
            utm_medium: query.get('utm_medium') || '',
            utm_campaign: query.get('utm_campaign') || '',
            utm_content: query.get('utm_content') || '',
            utm_term: query.get('utm_term') || '',
        };
    }

    function setupRegistration(event, consentForm) {
        const form = document.querySelector('[data-event-registration]');
        if (!form) return;
        const definition = consentForm && typeof consentForm === 'object' ? consentForm : FALLBACK_CONSENT_FORM;
        const referral = form.elements.how_did_you_hear_about_us;
        const agencyField = form.querySelector('.event-agency-field');
        const agencyInput = form.elements.agency_name;
        const guardianFields = form.querySelector('[data-guardian-fields]');
        const guardianInputs = ['guardian_name', 'guardian_email', 'guardian_relationship']
            .map((name) => form.elements[name]).filter(Boolean);
        const guardianDeclaration = form.elements.guardian_declaration_accepted;
        const status = form.querySelector('[data-event-form-status]');
        const submit = form.querySelector('[type="submit"]');
        const success = document.querySelector('[data-event-registration-success]');

        function syncAgency() {
            const visible = referral.value === 'agency';
            agencyField.hidden = !visible;
            agencyInput.required = visible;
            if (!visible) agencyInput.value = '';
        }
        referral.addEventListener('change', syncAgency);
        syncAgency();

        function syncGuardian() {
            const selected = form.querySelector('input[name="is_minor"]:checked');
            const isMinor = selected?.value === 'true';
            guardianFields.hidden = !isMinor;
            guardianInputs.forEach((input) => { input.required = isMinor; });
            if (guardianDeclaration) guardianDeclaration.required = isMinor;
            if (!isMinor) {
                guardianInputs.forEach((input) => { input.value = ''; });
                if (guardianDeclaration) guardianDeclaration.checked = false;
            }
        }
        form.querySelectorAll('input[name="is_minor"]').forEach((input) => input.addEventListener('change', syncGuardian));
        syncGuardian();

        form.addEventListener('submit', async (submitEvent) => {
            submitEvent.preventDefault();
            status.textContent = '';
            status.classList.remove('is-error', 'is-success');
            if (!form.reportValidity()) return;
            const data = new FormData(form);
            const isMinor = data.get('is_minor') === 'true';
            const consent = {};
            (definition.acknowledgements || []).forEach((item) => {
                consent[item.field] = data.get(item.field) === 'on';
            });
            (definition.choices || []).forEach((choice) => {
                consent[choice.field] = String(data.get(choice.field) || '');
            });
            if (isMinor) {
                consent.guardian_name = String(data.get('guardian_name') || '').trim();
                consent.guardian_email = String(data.get('guardian_email') || '').trim();
                consent.guardian_relationship = String(data.get('guardian_relationship') || '').trim();
                consent.guardian_declaration_accepted = data.get('guardian_declaration_accepted') === 'on';
            }
            const payload = {
                first_name: String(data.get('first_name') || '').trim(),
                last_name: String(data.get('last_name') || '').trim(),
                email: String(data.get('email') || '').trim(),
                phone_number: String(data.get('phone_number') || '').trim(),
                attendance_preference: String(data.get('attendance_preference') || ''),
                how_did_you_hear_about_us: String(data.get('how_did_you_hear_about_us') || ''),
                agency_name: referral.value === 'agency' ? String(data.get('agency_name') || '').trim() : '',
                locale: locale(),
                source_page: window.location.href.slice(0, 500),
                ...utmValues(),
                is_minor: isMinor,
                consent,
                company_website: String(data.get('company_website') || ''),
            };

            submit.disabled = true;
            submit.textContent = 'Saving your registration…';
            try {
                const response = await apiRequest(registrationApiPath(event), { method: 'POST', body: JSON.stringify(payload) });
                form.hidden = true;
                success.hidden = false;
                const successTitle = success.querySelector('h3');
                const successMessage = success.querySelector('p');
                if (successTitle) {
                    successTitle.textContent = response?.status === 'waitlisted'
                        ? 'You are on the waitlist'
                        : response?.status === 'already_registered' ? 'You are already registered' : 'Your registration is saved';
                }
                if (successMessage && response?.message) successMessage.textContent = response.message;
                success.focus?.();
            } catch (error) {
                console.error('[MCC event registration]', error);
                status.textContent = error.status === 404
                    ? 'Online registration is being connected to the MCC Portal. Please call 604-300-3123 or email admin@metropolitancollege.ca to reserve your place.'
                    : (error.message || 'We could not save your registration. Please try again or contact MCC.');
                status.classList.add('is-error');
            } finally {
                submit.disabled = false;
                submit.textContent = 'Reserve My Free Spot';
            }
        });
    }

    function setPageMeta(event) {
        const seo = event.seo || {};
        const social = event.social || {};
        const canonicalUrl = social.share_url || seo.canonical_url || `${window.location.origin}${eventHref(event)}`;
        const socialImage = social.image?.url || seo.og_image?.url || '';
        document.title = seo.title || `${event.title} | Metropolitan Community College`;
        const values = {
            'meta[name="description"]': seo.meta_description || event.summary,
            'meta[property="og:title"]': social.title || seo.title || event.title,
            'meta[property="og:description"]': social.summary || seo.meta_description || event.summary,
            'meta[property="og:image"]': socialImage,
            'meta[property="og:url"]': canonicalUrl,
            'meta[name="twitter:card"]': socialImage ? 'summary_large_image' : 'summary',
            'meta[name="twitter:title"]': social.title || seo.title || event.title,
            'meta[name="twitter:description"]': social.summary || seo.meta_description || event.summary,
            'meta[name="twitter:image"]': socialImage,
        };
        Object.entries(values).forEach(([selector, value]) => {
            if (!value) return;
            let element = document.querySelector(selector);
            if (!element) {
                element = document.createElement('meta');
                const match = selector.match(/^meta\[(name|property)="([^"]+)"\]$/);
                if (!match) return;
                element.setAttribute(match[1], match[2]);
                document.head.appendChild(element);
            }
            element.content = value;
        });
        if (canonicalUrl) {
            let canonical = document.querySelector('link[rel="canonical"]');
            if (!canonical) {
                canonical = document.createElement('link');
                canonical.rel = 'canonical';
                document.head.appendChild(canonical);
            }
            canonical.href = safeUrl(canonicalUrl, window.location.href);
        }
    }

    async function renderEventDetail() {
        const root = document.querySelector('[data-event-detail]');
        if (!root) return;
        try {
            const [event, policies] = await Promise.all([
                loadEvent(eventSlugFromLocation()),
                loadPolicies(['privacy', 'terms', 'event_terms', 'media_release', 'marketing_consent']),
            ]);
            const consentForm = event.consent_form || policies.__consentForm || FALLBACK_CONSENT_FORM;
            root.innerHTML = detailTemplate(event, consentForm);
            root.removeAttribute('aria-busy');
            setPageMeta(event);
            setupSharing(event);
            setupRegistration(event, consentForm);
        } catch (error) {
            root.innerHTML = '<section class="event-not-found"><span class="section-kicker">Event not found</span><h1>This event is not available</h1><p>It may have been archived or its link may have changed.</p><a class="btn-solid-gold" href="/events">View upcoming events</a></section>';
            root.removeAttribute('aria-busy');
        }
    }

    function sanitizePolicyHtml(value) {
        const template = document.createElement('template');
        template.innerHTML = String(value || '');
        template.content.querySelectorAll('script, style, iframe, object, embed, form, input, button').forEach((node) => node.remove());
        template.content.querySelectorAll('*').forEach((node) => {
            [...node.attributes].forEach((attribute) => {
                if (/^on/i.test(attribute.name) || attribute.name === 'srcdoc') node.removeAttribute(attribute.name);
                if (['href', 'src'].includes(attribute.name)) {
                    const safe = safeUrl(attribute.value, '');
                    if (!safe) node.removeAttribute(attribute.name);
                    else node.setAttribute(attribute.name, safe);
                }
            });
        });
        return template.innerHTML;
    }

    async function renderLegalDocument() {
        const root = document.querySelector('[data-legal-document]');
        if (!root) return;
        const requested = new URLSearchParams(window.location.search).get('type') || 'privacy';
        const type = Object.prototype.hasOwnProperty.call(FALLBACK_POLICIES, requested) ? requested : 'privacy';
        const policies = await loadPolicies([type]);
        const policy = policies[type];
        const policyBody = policy.is_published
            ? sanitizePolicyHtml(policy.content_html || policy.body || policy.html_body || policy.content || '<p>This published policy has no website content.</p>')
            : '<div class="legal-unavailable"><i class="fas fa-clock" aria-hidden="true"></i><div><strong>This document has not been published yet.</strong><p>MCC is completing its legal review. Contact the college if you need the current applicable information before submitting a form.</p></div></div>';
        root.innerHTML = `
            <article class="legal-document">
                <a href="/policies" class="event-back-link"><i class="fas fa-arrow-left" aria-hidden="true"></i> All policies</a>
                <span class="section-kicker">MCC legal information</span>
                <h1>${escapeHtml(policy.title)}</h1>
                <div class="legal-document-meta">${policy.is_published ? `<span>Version ${escapeHtml(policy.version || 'Current')}</span><span>Effective ${escapeHtml(policy.effective_date || 'as published')}</span>` : '<span>Pending legal review</span>'}</div>
                <p class="legal-document-summary">${escapeHtml(policy.summary || '')}</p>
                <div class="legal-document-body">${policyBody}</div>
                <aside><strong>Questions about this document?</strong><p>Contact MCC at <a href="mailto:admin@metropolitancollege.ca">admin@metropolitancollege.ca</a> or 604-300-3123.</p></aside>
            </article>`;
        root.removeAttribute('aria-busy');
        document.title = `${policy.title} | Metropolitan Community College`;
    }

    ready(() => {
        renderEventLists();
        renderEventDetail();
        renderLegalDocument();

        let renderedLocale = locale();
        const languageObserver = new MutationObserver(() => {
            const nextLocale = locale();
            if (nextLocale === renderedLocale) return;
            renderedLocale = nextLocale;
            renderEventLists();
            renderEventDetail();
            renderLegalDocument();
        });
        languageObserver.observe(document.body, { attributes: true, attributeFilter: ['data-lang'] });
    });
})();
