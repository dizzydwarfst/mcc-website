/**
 * MCC public website engagement tools.
 *
 * Adds the FSL trial-session registration dialog and the site-wide website
 * message widget. Both features use the LMS public API; neither creates a
 * portal account or an admissions application.
 */
(function initWebsiteEngagement() {
    'use strict';

    const DEFAULT_API_BASE = 'https://lms-system-backend-lake.vercel.app/api';
    const API_BASE = String(window.MCC_ENGAGEMENT_API_BASE || DEFAULT_API_BASE).replace(/\/$/, '');
    const CHAT_STORAGE_KEY = 'mcc_website_chat_session_v1';
    const CHAT_POLL_MS = 7000;
    const AVAILABILITY_POLL_MS = 15000;
    const REQUEST_TIMEOUT_MS = 15000;

    const EVENT = {
        event_id: 'fsl-trial-2026-09-01',
        event_title: 'FSL Info & Trial Session',
        event_date: '2026-09-01',
        timezone: 'America/Vancouver',
    };

    const COPY = {
        en: {
            close: 'Close',
            free_event: 'Free FSL Event',
            signup_title: 'Sign up for the FSL Info & Trial Session',
            signup_intro: 'September 1, 2026 · 5:00–6:00 PM · Online or in person',
            first_name: 'First name',
            last_name: 'Last name',
            email: 'Email address',
            phone: 'Phone number',
            attendance: 'How would you like to attend?',
            attendance_placeholder: 'Choose an attendance option',
            online: 'Online',
            in_person: 'In person',
            undecided: 'Not sure yet',
            heard: 'How did you hear about us?',
            heard_placeholder: 'Choose an option',
            google: 'Google or another search engine',
            instagram: 'Instagram',
            facebook: 'Facebook',
            tiktok: 'TikTok',
            friend: 'Friend or family',
            agency: 'Agency',
            other: 'Other',
            agency_selected: 'Agency selected:',
            agency_edit: 'Change agency',
            consent: 'I agree that MCC may contact me about this session and the FSL program.',
            submit_signup: 'Reserve My Free Spot',
            submitting_signup: 'Saving your spot…',
            signup_success_title: 'You’re registered!',
            signup_success_copy: 'Thank you. We received your registration and our team will follow up with session details.',
            signup_success_close: 'Done',
            signup_error: 'We could not save your registration. Please try again or call 604-300-3123.',
            agency_title: 'Which agency referred you?',
            agency_intro: 'Enter the agency name so our team can keep your registration connected to the right referral.',
            agency_label: 'Agency name',
            agency_placeholder: 'Type the agency name',
            agency_save: 'Save Agency',
            agency_cancel: 'Cancel',
            agency_required: 'Please enter the agency name.',
            chat_launcher: 'Ask a Question',
            chat_title: 'Message MCC',
            chat_online: 'Staff are online',
            chat_online_one: '1 staff member online',
            chat_online_many: '{count} staff members online',
            chat_offline: "Staff are away · we'll reply by email",
            chat_intro: 'Ask a common website question for a quick answer. If you need more help, a staff member can join. You may close this chat or leave the page—we have your email and will follow up.',
            chat_name: 'Your name',
            chat_email: 'Your email',
            chat_message: 'Brief message',
            chat_message_placeholder: 'What would you like to know?',
            chat_start: 'Start Conversation',
            chat_starting: 'Starting…',
            chat_send_placeholder: 'Write a message…',
            chat_send: 'Send',
            chat_empty: 'Your conversation will appear here.',
            chat_followup_note: 'Our website assistant answers common questions. Ask to speak with staff anytime. You may close this chat or leave the page—we will follow up by email.',
            chat_connect_error: 'We could not connect to chat. Please try again or email admin@metropolitancollege.ca.',
            chat_send_error: 'Your message could not be sent. Please try again.',
            chat_session_expired: 'Please enter your details again to start a new conversation.',
            sender_staff: 'MCC staff',
            sender_automatic: 'MCC website assistant',
            sender_you: 'You',
        },
        fr: {
            close: 'Fermer',
            free_event: 'Événement FLS gratuit',
            signup_title: "Inscrivez-vous à la séance d'information et au cours d'essai FLS",
            signup_intro: '1er septembre 2026 · 17 h–18 h · En ligne ou en personne',
            first_name: 'Prénom',
            last_name: 'Nom de famille',
            email: 'Adresse courriel',
            phone: 'Numéro de téléphone',
            attendance: 'Comment souhaitez-vous participer?',
            attendance_placeholder: 'Choisir un mode de participation',
            online: 'En ligne',
            in_person: 'En personne',
            undecided: 'Je ne sais pas encore',
            heard: 'Comment avez-vous entendu parler de nous?',
            heard_placeholder: 'Choisir une option',
            google: 'Google ou un autre moteur de recherche',
            instagram: 'Instagram',
            facebook: 'Facebook',
            tiktok: 'TikTok',
            friend: 'Ami ou famille',
            agency: 'Agence',
            other: 'Autre',
            agency_selected: 'Agence sélectionnée :',
            agency_edit: "Changer d'agence",
            consent: 'J’accepte que MCC me contacte au sujet de cette séance et du programme FLS.',
            submit_signup: 'Réserver ma place gratuite',
            submitting_signup: 'Réservation en cours…',
            signup_success_title: 'Votre inscription est confirmée!',
            signup_success_copy: 'Merci. Nous avons reçu votre inscription et notre équipe vous transmettra les détails de la séance.',
            signup_success_close: 'Terminé',
            signup_error: "Nous n'avons pas pu enregistrer votre inscription. Réessayez ou appelez le 604-300-3123.",
            agency_title: 'Quelle agence vous a recommandé?',
            agency_intro: "Indiquez le nom de l'agence afin que notre équipe puisse associer votre inscription à la bonne recommandation.",
            agency_label: "Nom de l'agence",
            agency_placeholder: "Saisir le nom de l'agence",
            agency_save: "Enregistrer l'agence",
            agency_cancel: 'Annuler',
            agency_required: "Veuillez saisir le nom de l'agence.",
            chat_launcher: 'Poser une question',
            chat_title: 'Écrire à MCC',
            chat_online: "L'équipe est en ligne",
            chat_online_one: "1 membre de l'équipe en ligne",
            chat_online_many: "{count} membres de l'équipe en ligne",
            chat_offline: "L'équipe est absente · réponse par courriel",
            chat_intro: "Posez une question courante sur le site pour obtenir une réponse rapide. Si vous avez besoin d'aide, un membre de l'équipe peut intervenir. Vous pouvez fermer cette fenêtre ou quitter la page—nous avons votre courriel et assurerons le suivi.",
            chat_name: 'Votre nom',
            chat_email: 'Votre courriel',
            chat_message: 'Bref message',
            chat_message_placeholder: 'Que souhaitez-vous savoir?',
            chat_start: 'Démarrer la conversation',
            chat_starting: 'Démarrage…',
            chat_send_placeholder: 'Écrire un message…',
            chat_send: 'Envoyer',
            chat_empty: 'Votre conversation apparaîtra ici.',
            chat_followup_note: "Notre assistant du site répond aux questions courantes. Demandez à parler à l'équipe en tout temps. Vous pouvez fermer cette fenêtre ou quitter la page—nous vous répondrons par courriel.",
            chat_connect_error: "Impossible de se connecter. Réessayez ou écrivez à admin@metropolitancollege.ca.",
            chat_send_error: "Votre message n'a pas pu être envoyé. Veuillez réessayer.",
            chat_session_expired: 'Veuillez saisir de nouveau vos coordonnées pour commencer une conversation.',
            sender_staff: 'Équipe MCC',
            sender_automatic: 'Assistant du site MCC',
            sender_you: 'Vous',
        },
    };

    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback, { once: true });
        } else {
            callback();
        }
    }

    function currentLanguage() {
        const bodyLanguage = document.body?.getAttribute('data-lang');
        if (bodyLanguage === 'fr') return 'fr';
        try {
            return localStorage.getItem('mcc_lang') === 'fr' ? 'fr' : 'en';
        } catch (_) {
            return 'en';
        }
    }

    function copy(key) {
        const language = currentLanguage();
        return COPY[language]?.[key] || COPY.en[key] || key;
    }

    function applyInterfaceCopy(root) {
        if (!root) return;
        root.querySelectorAll('[data-copy]').forEach((element) => {
            element.textContent = copy(element.getAttribute('data-copy'));
        });
        root.querySelectorAll('[data-copy-placeholder]').forEach((element) => {
            element.setAttribute('placeholder', copy(element.getAttribute('data-copy-placeholder')));
        });
        root.querySelectorAll('[data-copy-aria]').forEach((element) => {
            element.setAttribute('aria-label', copy(element.getAttribute('data-copy-aria')));
        });
    }

    function sourcePage() {
        return `${window.location.pathname || '/'}${window.location.search || ''}`.slice(0, 500);
    }

    function errorMessage(payload, fallback) {
        if (typeof payload?.detail === 'string') return payload.detail;
        if (typeof payload?.message === 'string') return payload.message;
        return fallback;
    }

    async function apiRequest(path, options = {}) {
        const controller = new AbortController();
        const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
        const headers = { Accept: 'application/json', ...(options.headers || {}) };
        if (options.body !== undefined) headers['Content-Type'] = 'application/json';

        try {
            const response = await fetch(`${API_BASE}${path}`, {
                ...options,
                headers,
                signal: controller.signal,
            });
            const payload = await response.json().catch(() => ({}));
            if (!response.ok) {
                const error = new Error(errorMessage(payload, `Request failed (${response.status})`));
                error.status = response.status;
                error.payload = payload;
                throw error;
            }
            return payload;
        } finally {
            window.clearTimeout(timeout);
        }
    }

    function focusableElements(container) {
        return [...container.querySelectorAll(
            'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        )].filter((element) => !element.hidden && element.offsetParent !== null);
    }

    function trapTab(event, container) {
        if (event.key !== 'Tab') return;
        const focusable = focusableElements(container);
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }

    function initSignupDialog() {
        const signupTriggers = [...document.querySelectorAll('[data-fsl-signup-open]')];
        if (!signupTriggers.length) return null;

        const overlay = document.createElement('div');
        overlay.className = 'engagement-overlay';
        overlay.hidden = true;
        overlay.setAttribute('aria-hidden', 'true');
        overlay.innerHTML = `
            <div class="engagement-dialog" role="dialog" aria-modal="true" aria-labelledby="fsl-signup-title" aria-describedby="fsl-signup-intro">
                <button type="button" class="engagement-dialog-close" data-signup-close data-copy-aria="close">
                    <i class="fas fa-xmark" aria-hidden="true"></i>
                </button>
                <div class="engagement-dialog-header">
                    <span class="section-kicker" data-copy="free_event">Free FSL Event</span>
                    <h2 id="fsl-signup-title" data-copy="signup_title">Sign up for the FSL Info &amp; Trial Session</h2>
                    <p id="fsl-signup-intro" data-copy="signup_intro">September 1, 2026 · 5:00–6:00 PM · Online or in person</p>
                </div>
                <form class="engagement-signup-form" novalidate>
                    <div class="engagement-form-grid">
                        <label>
                            <span data-copy="first_name">First name</span>
                            <input type="text" name="first_name" autocomplete="given-name" maxlength="100" required>
                        </label>
                        <label>
                            <span data-copy="last_name">Last name</span>
                            <input type="text" name="last_name" autocomplete="family-name" maxlength="100" required>
                        </label>
                        <label>
                            <span data-copy="email">Email address</span>
                            <input type="email" name="email" autocomplete="email" maxlength="254" required>
                        </label>
                        <label>
                            <span data-copy="phone">Phone number</span>
                            <input type="tel" name="phone_number" autocomplete="tel" maxlength="50" required>
                        </label>
                        <label>
                            <span data-copy="attendance">How would you like to attend?</span>
                            <select name="attendance_preference" required>
                                <option value="" data-copy="attendance_placeholder">Choose an attendance option</option>
                                <option value="online" data-copy="online">Online</option>
                                <option value="in_person" data-copy="in_person">In person</option>
                                <option value="undecided" data-copy="undecided">Not sure yet</option>
                            </select>
                        </label>
                        <label>
                            <span data-copy="heard">How did you hear about us?</span>
                            <select name="how_did_you_hear_about_us" required>
                                <option value="" data-copy="heard_placeholder">Choose an option</option>
                                <option value="google_search" data-copy="google">Google or another search engine</option>
                                <option value="instagram" data-copy="instagram">Instagram</option>
                                <option value="facebook" data-copy="facebook">Facebook</option>
                                <option value="tiktok" data-copy="tiktok">TikTok</option>
                                <option value="friend_family" data-copy="friend">Friend or family</option>
                                <option value="agency" data-copy="agency">Agency</option>
                                <option value="other" data-copy="other">Other</option>
                            </select>
                        </label>
                    </div>
                    <div class="engagement-agency-summary" data-agency-summary hidden>
                        <span><span data-copy="agency_selected">Agency selected:</span> <strong data-agency-summary-name></strong></span>
                        <button type="button" data-agency-edit data-copy="agency_edit">Change agency</button>
                    </div>
                    <label class="engagement-consent">
                        <input type="checkbox" name="consent_to_contact" required>
                        <span data-copy="consent">I agree that MCC may contact me about this session and the FSL program.</span>
                    </label>
                    <label class="engagement-honeypot" aria-hidden="true">
                        Company website
                        <input type="text" name="company_website" tabindex="-1" autocomplete="off">
                    </label>
                    <p class="engagement-form-status" data-signup-status role="status" aria-live="polite"></p>
                    <button type="submit" class="btn-solid-gold engagement-submit" data-copy="submit_signup">Reserve My Free Spot</button>
                </form>
                <div class="engagement-success" data-signup-success hidden>
                    <span class="engagement-success-icon" aria-hidden="true"><i class="fas fa-check"></i></span>
                    <h3 data-copy="signup_success_title">You’re registered!</h3>
                    <p data-copy="signup_success_copy">Thank you. We received your registration and our team will follow up with session details.</p>
                    <button type="button" class="btn-solid-gold" data-signup-success-close data-copy="signup_success_close">Done</button>
                </div>
                <div class="engagement-agency-layer" data-agency-layer hidden>
                    <div class="engagement-agency-dialog" role="dialog" aria-modal="true" aria-labelledby="agency-dialog-title">
                        <h3 id="agency-dialog-title" data-copy="agency_title">Which agency referred you?</h3>
                        <p data-copy="agency_intro">Enter the agency name so our team can keep your registration connected to the right referral.</p>
                        <label>
                            <span data-copy="agency_label">Agency name</span>
                            <input type="text" data-agency-name maxlength="200" data-copy-placeholder="agency_placeholder" placeholder="Type the agency name">
                        </label>
                        <p class="engagement-agency-error" data-agency-error role="alert"></p>
                        <div class="engagement-agency-actions">
                            <button type="button" class="btn-outline-gold" data-agency-cancel data-copy="agency_cancel">Cancel</button>
                            <button type="button" class="btn-solid-gold" data-agency-save data-copy="agency_save">Save Agency</button>
                        </div>
                    </div>
                </div>
            </div>`;
        document.body.appendChild(overlay);
        applyInterfaceCopy(overlay);

        const dialog = overlay.querySelector('.engagement-dialog');
        const form = overlay.querySelector('.engagement-signup-form');
        const success = overlay.querySelector('[data-signup-success]');
        const status = overlay.querySelector('[data-signup-status]');
        const submit = form.querySelector('[type="submit"]');
        const heardSelect = form.elements.how_did_you_hear_about_us;
        const agencyLayer = overlay.querySelector('[data-agency-layer]');
        const agencyDialog = overlay.querySelector('.engagement-agency-dialog');
        const agencyInput = overlay.querySelector('[data-agency-name]');
        const agencyError = overlay.querySelector('[data-agency-error]');
        const agencySummary = overlay.querySelector('[data-agency-summary]');
        const agencySummaryName = overlay.querySelector('[data-agency-summary-name]');
        let agencyName = '';
        let lastTrigger = null;
        let submitting = false;

        function updateAgencySummary() {
            agencySummaryName.textContent = agencyName;
            agencySummary.hidden = !agencyName;
        }

        function openAgencyDialog() {
            agencyError.textContent = '';
            agencyInput.value = agencyName;
            agencyLayer.hidden = false;
            window.requestAnimationFrame(() => agencyLayer.classList.add('active'));
            window.setTimeout(() => agencyInput.focus(), 20);
        }

        function closeAgencyDialog({ resetSelection = false } = {}) {
            agencyLayer.classList.remove('active');
            agencyLayer.hidden = true;
            if (resetSelection && !agencyName) heardSelect.value = '';
            heardSelect.focus();
        }

        function saveAgency() {
            const value = agencyInput.value.trim();
            if (!value) {
                agencyError.textContent = copy('agency_required');
                agencyInput.focus();
                return;
            }
            agencyName = value;
            updateAgencySummary();
            closeAgencyDialog();
        }

        function openSignup(event) {
            if (event) event.preventDefault();
            lastTrigger = event?.currentTarget || document.activeElement;
            overlay.hidden = false;
            overlay.setAttribute('aria-hidden', 'false');
            document.body.classList.add('engagement-modal-open');
            window.requestAnimationFrame(() => overlay.classList.add('active'));
            window.setTimeout(() => form.elements.first_name?.focus(), 30);
        }

        function closeSignup() {
            if (submitting) return;
            if (!agencyLayer.hidden) closeAgencyDialog({ resetSelection: true });
            overlay.classList.remove('active');
            overlay.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('engagement-modal-open');
            window.setTimeout(() => {
                overlay.hidden = true;
                if (!success.hidden) resetSignup();
            }, 180);
            if (lastTrigger?.focus) lastTrigger.focus();
        }

        function resetSignup() {
            form.reset();
            form.hidden = false;
            success.hidden = true;
            status.textContent = '';
            status.classList.remove('is-error');
            agencyName = '';
            updateAgencySummary();
        }

        signupTriggers.forEach((trigger) => trigger.addEventListener('click', openSignup));
        overlay.querySelector('[data-signup-close]').addEventListener('click', closeSignup);
        overlay.querySelector('[data-signup-success-close]').addEventListener('click', closeSignup);
        overlay.querySelector('[data-agency-edit]').addEventListener('click', openAgencyDialog);
        overlay.querySelector('[data-agency-cancel]').addEventListener('click', () => closeAgencyDialog({ resetSelection: true }));
        overlay.querySelector('[data-agency-save]').addEventListener('click', saveAgency);
        agencyInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                saveAgency();
            }
        });
        heardSelect.addEventListener('change', () => {
            if (heardSelect.value === 'agency') {
                openAgencyDialog();
            } else {
                agencyName = '';
                updateAgencySummary();
            }
        });
        overlay.addEventListener('click', (event) => {
            if (event.target === overlay) closeSignup();
        });
        overlay.addEventListener('keydown', (event) => {
            if (!agencyLayer.hidden) {
                if (event.key === 'Escape') {
                    event.preventDefault();
                    closeAgencyDialog({ resetSelection: true });
                } else {
                    trapTab(event, agencyDialog);
                }
                return;
            }
            if (event.key === 'Escape') {
                event.preventDefault();
                closeSignup();
            } else {
                trapTab(event, dialog);
            }
        });

        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            status.textContent = '';
            status.classList.remove('is-error');
            if (!form.reportValidity()) return;
            if (heardSelect.value === 'agency' && !agencyName) {
                openAgencyDialog();
                return;
            }

            const data = new FormData(form);
            const payload = {
                ...EVENT,
                first_name: String(data.get('first_name') || '').trim(),
                last_name: String(data.get('last_name') || '').trim(),
                email: String(data.get('email') || '').trim(),
                phone_number: String(data.get('phone_number') || '').trim(),
                attendance_preference: String(data.get('attendance_preference') || ''),
                how_did_you_hear_about_us: String(data.get('how_did_you_hear_about_us') || ''),
                agency_name: heardSelect.value === 'agency' ? agencyName : '',
                source_page: sourcePage(),
                consent_to_contact: data.get('consent_to_contact') === 'on',
                company_website: String(data.get('company_website') || ''),
            };

            submitting = true;
            submit.disabled = true;
            submit.textContent = copy('submitting_signup');
            try {
                await apiRequest('/public/website-signups', {
                    method: 'POST',
                    body: JSON.stringify(payload),
                });
                form.hidden = true;
                success.hidden = false;
                success.querySelector('button')?.focus();
            } catch (error) {
                console.error('[MCC website signup]', error);
                status.textContent = copy('signup_error');
                status.classList.add('is-error');
            } finally {
                submitting = false;
                submit.disabled = false;
                submit.textContent = copy('submit_signup');
            }
        });

        return {
            root: overlay,
            open: openSignup,
            close: closeSignup,
            reset: resetSignup,
            translate: () => applyInterfaceCopy(overlay),
        };
    }

    function readChatSession() {
        try {
            const value = JSON.parse(localStorage.getItem(CHAT_STORAGE_KEY) || 'null');
            if (value?.conversationId && value?.visitorToken) return value;
        } catch (_) {
            // Ignore damaged or unavailable storage.
        }
        return null;
    }

    function writeChatSession(session) {
        try {
            if (session) localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(session));
            else localStorage.removeItem(CHAT_STORAGE_KEY);
        } catch (_) {
            // The conversation can still work for the current page view.
        }
    }

    function messageTime(value) {
        const parsed = value ? new Date(value) : new Date();
        if (Number.isNaN(parsed.getTime())) return '';
        return new Intl.DateTimeFormat(currentLanguage() === 'fr' ? 'fr-CA' : 'en-CA', {
            hour: 'numeric',
            minute: '2-digit',
        }).format(parsed);
    }

    function initWebsiteChat() {
        const root = document.createElement('div');
        root.className = 'website-chat';
        root.innerHTML = `
            <button type="button" class="website-chat-launcher" data-chat-launcher aria-expanded="false" aria-controls="website-chat-panel">
                <i class="fas fa-message" aria-hidden="true"></i>
                <span data-copy="chat_launcher">Ask a Question</span>
            </button>
            <section class="website-chat-panel" id="website-chat-panel" aria-labelledby="website-chat-title" hidden>
                <header class="website-chat-header">
                    <div>
                        <h2 id="website-chat-title" data-copy="chat_title">Message MCC</h2>
                        <p class="website-chat-availability" data-chat-availability>
                            <span aria-hidden="true"></span>
                            <span data-copy="chat_offline">Staff are away · replies are saved</span>
                        </p>
                    </div>
                    <button type="button" class="website-chat-close" data-chat-close data-copy-aria="close">
                        <i class="fas fa-minus" aria-hidden="true"></i>
                    </button>
                </header>
                <div class="website-chat-body">
                    <form class="website-chat-preform" data-chat-preform novalidate>
                        <p data-copy="chat_intro">Tell us who you are and briefly how we can help. You can continue the conversation right here.</p>
                        <label>
                            <span data-copy="chat_name">Your name</span>
                            <input type="text" name="visitor_name" autocomplete="name" maxlength="150" required>
                        </label>
                        <label>
                            <span data-copy="chat_email">Your email</span>
                            <input type="email" name="visitor_email" autocomplete="email" maxlength="254" required>
                        </label>
                        <label>
                            <span data-copy="chat_message">Brief message</span>
                            <textarea name="initial_message" rows="4" maxlength="2000" data-copy-placeholder="chat_message_placeholder" placeholder="What would you like to know?" required></textarea>
                        </label>
                        <label class="engagement-honeypot" aria-hidden="true">
                            Company website
                            <input type="text" name="company_website" tabindex="-1" autocomplete="off">
                        </label>
                        <p class="website-chat-error" data-chat-start-error role="alert"></p>
                        <button type="submit" class="btn-solid-gold" data-copy="chat_start">Start Conversation</button>
                    </form>
                    <div class="website-chat-conversation" data-chat-conversation hidden>
                        <div class="website-chat-messages" data-chat-messages role="log" aria-live="polite" aria-relevant="additions text">
                            <p class="website-chat-empty" data-copy="chat_empty">Your conversation will appear here.</p>
                        </div>
                        <p class="website-chat-followup" data-copy="chat_followup_note">Our website assistant answers common questions. Ask to speak with staff anytime. You may close this chat or leave the page—we will follow up by email.</p>
                        <form class="website-chat-composer" data-chat-composer>
                            <label class="sr-only" for="website-chat-message" data-copy="chat_message">Brief message</label>
                            <textarea id="website-chat-message" name="text" rows="2" maxlength="2000" data-copy-placeholder="chat_send_placeholder" placeholder="Write a message…" required></textarea>
                            <button type="submit" data-copy-aria="chat_send" aria-label="Send">
                                <i class="fas fa-paper-plane" aria-hidden="true"></i>
                            </button>
                        </form>
                        <p class="website-chat-error website-chat-send-error" data-chat-send-error role="alert"></p>
                    </div>
                </div>
            </section>`;
        document.body.appendChild(root);
        applyInterfaceCopy(root);

        const launcher = root.querySelector('[data-chat-launcher]');
        const panel = root.querySelector('.website-chat-panel');
        const closeButton = root.querySelector('[data-chat-close]');
        const availability = root.querySelector('[data-chat-availability]');
        const availabilityCopy = availability.querySelector('[data-copy]');
        const preform = root.querySelector('[data-chat-preform]');
        const conversationView = root.querySelector('[data-chat-conversation]');
        const messagesRoot = root.querySelector('[data-chat-messages]');
        const composer = root.querySelector('[data-chat-composer]');
        const startError = root.querySelector('[data-chat-start-error]');
        const sendError = root.querySelector('[data-chat-send-error]');
        let session = readChatSession();
        let panelOpen = false;
        let polling = null;
        let availabilityPolling = null;
        let loadingMessages = false;
        let staffOnline = false;
        let onlineStaffCount = null;

        function visitorHeaders() {
            return session?.visitorToken ? { 'X-Visitor-Token': session.visitorToken } : {};
        }

        function showPreform(message = '') {
            preform.hidden = false;
            conversationView.hidden = true;
            if (message) startError.textContent = message;
        }

        function showConversation() {
            preform.hidden = true;
            conversationView.hidden = false;
        }

        function setAvailability(payload) {
            const countValue = payload && typeof payload === 'object'
                ? payload.online_staff_count ?? payload.active_staff_count ?? payload.staff_count ?? payload.online_count
                : null;
            const parsedCount = Number(countValue);
            onlineStaffCount = countValue !== null && countValue !== undefined && countValue !== ''
                && Number.isInteger(parsedCount) && parsedCount >= 0
                ? parsedCount
                : null;
            staffOnline = typeof payload === 'boolean'
                ? payload
                : onlineStaffCount > 0 || payload?.online === true || payload?.staff_online === true;
            availability.classList.toggle('is-online', staffOnline);
            let copyKey = staffOnline ? 'chat_online' : 'chat_offline';
            if (staffOnline && onlineStaffCount === 1) copyKey = 'chat_online_one';
            if (staffOnline && onlineStaffCount > 1) copyKey = 'chat_online_many';
            availabilityCopy.setAttribute('data-copy', copyKey);
            availabilityCopy.textContent = copy(copyKey).replace('{count}', String(onlineStaffCount ?? ''));
        }

        async function loadAvailability() {
            try {
                const payload = await apiRequest('/public/website-chat/availability');
                setAvailability(payload);
            } catch (_) {
                setAvailability(false);
            }
        }

        function stopAvailabilityPolling() {
            if (availabilityPolling) window.clearInterval(availabilityPolling);
            availabilityPolling = null;
        }

        function startAvailabilityPolling() {
            stopAvailabilityPolling();
            if (!panelOpen) return;
            availabilityPolling = window.setInterval(loadAvailability, AVAILABILITY_POLL_MS);
        }

        function senderLabel(type) {
            if (type === 'visitor') return copy('sender_you');
            if (type === 'automatic') return copy('sender_automatic');
            return copy('sender_staff');
        }

        function renderMessages(messages) {
            const list = Array.isArray(messages) ? messages : [];
            messagesRoot.replaceChildren();
            if (!list.length) {
                const empty = document.createElement('p');
                empty.className = 'website-chat-empty';
                empty.textContent = copy('chat_empty');
                messagesRoot.appendChild(empty);
                return;
            }
            list.forEach((message) => {
                const type = ['visitor', 'staff', 'automatic'].includes(message?.sender_type)
                    ? message.sender_type
                    : 'staff';
                const article = document.createElement('article');
                article.className = `website-chat-message is-${type}`;
                const meta = document.createElement('div');
                meta.className = 'website-chat-message-meta';
                const sender = document.createElement('span');
                sender.textContent = senderLabel(type);
                const time = document.createElement('time');
                time.dateTime = message?.created_at || '';
                time.textContent = messageTime(message?.created_at);
                const text = document.createElement('p');
                text.textContent = String(message?.text || message?.message || '');
                meta.append(sender, time);
                article.append(meta, text);
                messagesRoot.appendChild(article);
            });
            messagesRoot.scrollTop = messagesRoot.scrollHeight;
        }

        function expireSession() {
            session = null;
            writeChatSession(null);
            renderMessages([]);
            showPreform(copy('chat_session_expired'));
            stopPolling();
        }

        async function loadMessages({ quiet = false } = {}) {
            if (!session || loadingMessages) return;
            loadingMessages = true;
            try {
                const payload = await apiRequest(
                    `/public/website-chat/conversations/${encodeURIComponent(session.conversationId)}/messages`,
                    { headers: visitorHeaders() },
                );
                renderMessages(Array.isArray(payload) ? payload : payload?.messages || []);
            } catch (error) {
                if (error?.status === 401 || error?.status === 403 || error?.status === 404) {
                    expireSession();
                } else if (!quiet) {
                    sendError.textContent = copy('chat_connect_error');
                }
            } finally {
                loadingMessages = false;
            }
        }

        function stopPolling() {
            if (polling) window.clearInterval(polling);
            polling = null;
        }

        function startPolling() {
            stopPolling();
            if (!session || !panelOpen) return;
            polling = window.setInterval(() => loadMessages({ quiet: true }), CHAT_POLL_MS);
        }

        function openChat(event) {
            if (event) event.preventDefault();
            panelOpen = true;
            panel.hidden = false;
            launcher.setAttribute('aria-expanded', 'true');
            window.requestAnimationFrame(() => panel.classList.add('active'));
            loadAvailability();
            startAvailabilityPolling();
            if (session) {
                showConversation();
                loadMessages();
                startPolling();
                window.setTimeout(() => composer.elements.text?.focus(), 40);
            } else {
                showPreform();
                window.setTimeout(() => preform.elements.visitor_name?.focus(), 40);
            }
        }

        function closeChat() {
            panelOpen = false;
            panel.classList.remove('active');
            launcher.setAttribute('aria-expanded', 'false');
            stopPolling();
            stopAvailabilityPolling();
            window.setTimeout(() => { panel.hidden = true; }, 160);
            launcher.focus();
        }

        launcher.addEventListener('click', () => (panelOpen ? closeChat() : openChat()));
        closeButton.addEventListener('click', closeChat);
        document.querySelectorAll('[data-website-chat-open]').forEach((trigger) => {
            trigger.addEventListener('click', openChat);
        });
        panel.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                closeChat();
            }
        });

        preform.addEventListener('submit', async (event) => {
            event.preventDefault();
            startError.textContent = '';
            if (!preform.reportValidity()) return;
            const data = new FormData(preform);
            const submitButton = preform.querySelector('[type="submit"]');
            submitButton.disabled = true;
            submitButton.textContent = copy('chat_starting');
            try {
                const payload = await apiRequest('/public/website-chat/conversations', {
                    method: 'POST',
                    body: JSON.stringify({
                        visitor_name: String(data.get('visitor_name') || '').trim(),
                        visitor_email: String(data.get('visitor_email') || '').trim(),
                        initial_message: String(data.get('initial_message') || '').trim(),
                        source_page: sourcePage(),
                        company_website: String(data.get('company_website') || ''),
                    }),
                });
                const conversationId = payload?.conversation_id || payload?.id || payload?.conversation?.id;
                const visitorToken = payload?.visitor_token || payload?.token;
                if (!conversationId || !visitorToken) throw new Error('The chat response was incomplete.');
                session = { conversationId, visitorToken };
                writeChatSession(session);
                showConversation();
                if (Array.isArray(payload?.messages)) renderMessages(payload.messages);
                await loadMessages({ quiet: true });
                startPolling();
                composer.elements.text?.focus();
            } catch (error) {
                console.error('[MCC website chat start]', error);
                startError.textContent = copy('chat_connect_error');
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = copy('chat_start');
            }
        });

        composer.addEventListener('submit', async (event) => {
            event.preventDefault();
            sendError.textContent = '';
            if (!session || !composer.reportValidity()) return;
            const text = composer.elements.text.value.trim();
            if (!text) return;
            const sendButton = composer.querySelector('[type="submit"]');
            sendButton.disabled = true;
            try {
                await apiRequest(
                    `/public/website-chat/conversations/${encodeURIComponent(session.conversationId)}/messages`,
                    {
                        method: 'POST',
                        headers: visitorHeaders(),
                        body: JSON.stringify({ text }),
                    },
                );
                composer.reset();
                await loadMessages({ quiet: true });
                composer.elements.text?.focus();
            } catch (error) {
                if (error?.status === 401 || error?.status === 403 || error?.status === 404) {
                    expireSession();
                } else {
                    console.error('[MCC website chat send]', error);
                    sendError.textContent = copy('chat_send_error');
                }
            } finally {
                sendButton.disabled = false;
            }
        });

        showPreform();
        loadAvailability();

        return {
            root,
            open: openChat,
            close: closeChat,
            translate: () => {
                applyInterfaceCopy(root);
                setAvailability({ online: staffOnline, online_staff_count: onlineStaffCount });
                if (session) loadMessages({ quiet: true });
            },
        };
    }

    ready(() => {
        if (window.MCCWebsiteEngagement?.initialized) return;
        const signup = initSignupDialog();
        const chat = initWebsiteChat();

        const languageObserver = new MutationObserver((mutations) => {
            if (!mutations.some((mutation) => mutation.attributeName === 'data-lang')) return;
            signup?.translate();
            chat?.translate();
        });
        languageObserver.observe(document.body, { attributes: true, attributeFilter: ['data-lang'] });

        window.MCCWebsiteEngagement = {
            initialized: true,
            openSignup: signup?.open || null,
            openChat: chat?.open || null,
        };
    });
})();
