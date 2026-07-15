// Scroll Handler for sticky Header
const header = document.querySelector('.glass-header, .solid-header');

const syncHeaderState = () => {
    if (!header) return;

    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
};

syncHeaderState();
window.addEventListener('scroll', syncHeaderState);

// Intersection Observer for reveal animations
const revealElements = document.querySelectorAll('.reveal');

const revealOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
};

const revealOnScroll = new IntersectionObserver(function(entries, observer) {
    entries.forEach(entry => {
        if (!entry.isIntersecting) {
            return;
        } else {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        }
    });
}, revealOptions);

revealElements.forEach(el => {
    revealOnScroll.observe(el);
});

const activateVisibleRevealElements = () => {
    revealElements.forEach(el => {
        if (el.classList.contains('active')) return;

        const rect = el.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.92) {
            el.classList.add('active');
            revealOnScroll.unobserve(el);
        }
    });
};

requestAnimationFrame(activateVisibleRevealElements);
window.addEventListener('load', activateVisibleRevealElements);
window.addEventListener('pageshow', activateVisibleRevealElements);

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Typewriter Effect (language-aware; re-queries element so language swaps don't orphan it)
const TYPEWRITER_WORDS = {
    en: ["Learning", "Growth", "Excellence", "Innovation", "Success"],
    fr: ["l'apprentissage", "la croissance", "l'excellence", "l'innovation", "la réussite"]
};

let wordIndex = 0;
let charIndex = 0;
let isDeleting = true;

function currentTypewriterLang() {
    return (document.body && document.body.getAttribute('data-lang') === 'fr') ? 'fr' : 'en';
}

function type() {
    const el = document.querySelector('.typewriter');
    if (!el) return;

    const list = TYPEWRITER_WORDS[currentTypewriterLang()] || TYPEWRITER_WORDS.en;
    const currentWord = list[wordIndex % list.length];

    if (isDeleting) {
        charIndex--;
    } else {
        charIndex++;
    }
    if (charIndex < 0) charIndex = 0;
    if (charIndex > currentWord.length) charIndex = currentWord.length;

    el.textContent = currentWord.substring(0, charIndex);

    let typeSpeed = isDeleting ? 40 : 100;

    if (!isDeleting && charIndex === currentWord.length) {
        typeSpeed = 2000;
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % list.length;
        typeSpeed = 400;
    }

    setTimeout(type, typeSpeed);
}

if (document.querySelector('.typewriter')) setTimeout(type, 2000);

// Hamburger Menu Toggle
document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mainNav = document.querySelector('.main-nav');
    
    if (mobileMenuBtn && mainNav) {
        mobileMenuBtn.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            mobileMenuBtn.classList.toggle('active');
        });
    }

    // Top-level Dropdown Mobile Toggle (About / Programs / Admissions / Student Life)
    document.querySelectorAll('.nav-dropdown').forEach((dropdown) => {
        const toggle = dropdown.querySelector(':scope > .nav-dropdown-toggle');
        const content = dropdown.querySelector(':scope > .dropdown-content');
        if (!toggle || !content) return;

        toggle.addEventListener('click', (e) => {
            if (window.innerWidth <= 900) {
                e.preventDefault();
                const wasOpen = content.classList.contains('show');
                document.querySelectorAll('.dropdown-content.show').forEach((c) => c.classList.remove('show'));
                if (!wasOpen) content.classList.add('show');
            }
        });
    });

    // ==========================================
    // FAQ Accordion Logic
    // ==========================================
    const faqItems = document.querySelectorAll('.faq-item');
    if (faqItems.length > 0) {
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                
                faqItems.forEach(child => {
                    child.classList.remove('active');
                    child.querySelector('.faq-answer').style.maxHeight = null;
                });

                if (!isActive) {
                    item.classList.add('active');
                    const answer = item.querySelector('.faq-answer');
                    answer.style.maxHeight = answer.scrollHeight + "px";
                }
            });
        });
    }

    // ==========================================
    // Newsletter Year Filter Logic
    // ==========================================
    const yearBtns = document.querySelectorAll('.year-btn');
    const newsCards = document.querySelectorAll('.news-card');

    if (yearBtns.length > 0 && newsCards.length > 0) {
        const applyNewsletterFilter = (filterYear = 'all') => {
            yearBtns.forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('data-year') === filterYear);
            });

            newsCards.forEach(card => {
                const shouldShow = filterYear === 'all' || card.getAttribute('data-year') === filterYear;
                card.style.display = shouldShow ? '' : 'none';
            });
        };

        yearBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                applyNewsletterFilter(btn.getAttribute('data-year') || 'all');
            });
        });

        const activeYearBtn = document.querySelector('.year-btn.active') || yearBtns[0];
        applyNewsletterFilter(activeYearBtn ? activeYearBtn.getAttribute('data-year') : 'all');

        window.addEventListener('pageshow', () => {
            const selectedYearBtn = document.querySelector('.year-btn.active') || yearBtns[0];
            applyNewsletterFilter(selectedYearBtn ? selectedYearBtn.getAttribute('data-year') : 'all');
        });
    }

    // ==========================================
    // Newsletter Modal Logic
    // ==========================================
    const modalOverlay = document.getElementById('newsletter-modal');
    if (modalOverlay) {
        const modalClose = modalOverlay.querySelector('.modal-close');
        const readMoreLinks = document.querySelectorAll('.news-card-link');
        
        readMoreLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                const card = link.closest('.news-card');
                const title = card.querySelector('.news-card-title').textContent;
                const date = card.querySelector('.news-card-date').textContent;
                const modalHtml = card.querySelector('.full-content-data').innerHTML;
                const accentClass = card.querySelector('.news-card-accent').className.split(' ')[1];

                modalOverlay.querySelector('.modal-title').textContent = title;
                modalOverlay.querySelector('.modal-date').textContent = date;
                modalOverlay.querySelector('.modal-text').innerHTML = modalHtml;
                
                const modalAccent = modalOverlay.querySelector('.modal-accent-top');
                modalAccent.className = `modal-accent-top ${accentClass}`;

                modalOverlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        });

        modalClose.addEventListener('click', () => {
            modalOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });

        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                modalOverlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // ==========================================
    // Testimonial Marquee — clone cards for seamless loop
    // ==========================================
    const marquees = document.querySelectorAll('.testimonial-marquee .testimonial-grid');
    marquees.forEach(track => {
        const originals = Array.from(track.children);
        if (originals.length === 0) return;
        originals.forEach(card => {
            const clone = card.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            track.appendChild(clone);
        });
    });

    // ==========================================
    // Portal Login Modal Logic
    // ==========================================
    const portalTriggers = document.querySelectorAll('.btn-top-portal');

    if (portalTriggers.length > 0) {
        const portalModal = document.createElement('div');
        portalModal.className = 'portal-modal-overlay';
        portalModal.id = 'portal-login-modal';
        portalModal.setAttribute('aria-hidden', 'true');
        portalModal.innerHTML = `
            <div class="portal-modal-shell" role="dialog" aria-modal="true" aria-labelledby="portal-modal-title">
                <button type="button" class="portal-modal-close" aria-label="Close login panel">&times;</button>
                <div class="portal-modal-intro">
                    <span class="portal-modal-kicker">MCC Portal</span>
                    <h2 id="portal-modal-title">MCC Portal Login</h2>
                    <p>Sign in to the MCC Portal. Choose your role to continue to the secure portal sign-in.</p>
                    <div class="portal-switcher" role="tablist" aria-label="Portal selection">
                        <button type="button" id="portal-tab-student" class="portal-tab active" data-portal="student" role="tab" aria-selected="true" aria-controls="portal-panel-student" tabindex="0">Student</button>
                        <button type="button" id="portal-tab-teacher" class="portal-tab" data-portal="teacher" role="tab" aria-selected="false" aria-controls="portal-panel-teacher" tabindex="-1">Teacher</button>
                        <button type="button" id="portal-tab-admin" class="portal-tab" data-portal="admin" role="tab" aria-selected="false" aria-controls="portal-panel-admin" tabindex="-1">Admin</button>
                    </div>
                </div>
                <div class="portal-modal-body">
                    <section id="portal-panel-student" class="portal-panel active" data-portal-panel="student" role="tabpanel" aria-labelledby="portal-tab-student">
                        <span class="portal-panel-label">Student Access</span>
                        <h3>Student sign-in</h3>
                        <p>Continue to the secure portal to enter your sign-in details.</p>
                        <form class="portal-login-form" action="https://portal.metropolitancollege.ca/login" method="get">
                            <input type="hidden" name="role" value="student">
                            <button type="submit" class="btn-solid-gold">Continue to secure sign-in</button>
                        </form>
                    </section>
                    <section id="portal-panel-teacher" class="portal-panel" data-portal-panel="teacher" role="tabpanel" aria-labelledby="portal-tab-teacher" hidden>
                        <span class="portal-panel-label">Teacher Access</span>
                        <h3>Teacher sign-in</h3>
                        <p>Continue to the secure portal to enter your sign-in details.</p>
                        <form class="portal-login-form" action="https://portal.metropolitancollege.ca/login" method="get">
                            <input type="hidden" name="role" value="teacher">
                            <button type="submit" class="btn-solid-gold">Continue to secure sign-in</button>
                        </form>
                    </section>
                    <section id="portal-panel-admin" class="portal-panel" data-portal-panel="admin" role="tabpanel" aria-labelledby="portal-tab-admin" hidden>
                        <span class="portal-panel-label">Admin Access</span>
                        <h3>Admin sign-in</h3>
                        <p>Continue to the secure portal to enter your sign-in details.</p>
                        <form class="portal-login-form" action="https://portal.metropolitancollege.ca/login" method="get">
                            <input type="hidden" name="role" value="admin">
                            <button type="submit" class="btn-solid-gold">Continue to secure sign-in</button>
                        </form>
                    </section>
                </div>
            </div>
        `;
        document.body.appendChild(portalModal);

        const portalTabs = portalModal.querySelectorAll('.portal-tab');
        const portalPanels = portalModal.querySelectorAll('.portal-panel');
        const portalCloseBtn = portalModal.querySelector('.portal-modal-close');
        let portalReturnFocus = null;

        const validPortalRoles = ['student', 'teacher', 'admin'];
        const normalizePortalRole = (portalType) => {
            if (validPortalRoles.includes(portalType)) return portalType;
            if (portalType === 'staff' || portalType === 'crm') return 'admin';
            return 'student';
        };

        const setActivePortal = (portalType) => {
            const activePortalType = normalizePortalRole(portalType);

            portalTabs.forEach(tab => {
                const isActive = tab.getAttribute('data-portal') === activePortalType;
                tab.classList.toggle('active', isActive);
                tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
                tab.tabIndex = isActive ? 0 : -1;
            });

            portalPanels.forEach(panel => {
                const isActive = panel.getAttribute('data-portal-panel') === activePortalType;
                panel.classList.toggle('active', isActive);
                panel.hidden = !isActive;
            });

            return activePortalType;
        };

        const openPortalModal = (portalType, trigger) => {
            const activePortalType = setActivePortal(portalType);
            portalReturnFocus = trigger || document.activeElement;
            portalModal.classList.add('active');
            portalModal.setAttribute('aria-hidden', 'false');
            document.body.classList.add('portal-modal-open');

            const continueButton = portalModal.querySelector(`.portal-panel[data-portal-panel="${activePortalType}"] button`);
            if (continueButton) {
                continueButton.focus();
            }
        };

        const closePortalModal = () => {
            portalModal.classList.remove('active');
            portalModal.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('portal-modal-open');
            if (portalReturnFocus && typeof portalReturnFocus.focus === 'function') {
                portalReturnFocus.focus();
            }
            portalReturnFocus = null;
        };

        portalTriggers.forEach(trigger => {
            const configuredPortal = trigger.getAttribute('data-portal-open');
            const triggerText = trigger.textContent.toLowerCase();
            const portalType = normalizePortalRole(configuredPortal || (triggerText.includes('admin') || triggerText.includes('crm') ? 'admin' : triggerText.includes('teacher') ? 'teacher' : 'student'));

            trigger.setAttribute('data-portal-open', portalType);
            trigger.setAttribute('aria-haspopup', 'dialog');
            trigger.setAttribute('aria-controls', 'portal-login-modal');

            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                openPortalModal(portalType, trigger);
            });
        });

        portalTabs.forEach((tab, index) => {
            tab.addEventListener('click', () => {
                setActivePortal(tab.getAttribute('data-portal'));
            });
            tab.addEventListener('keydown', (e) => {
                const tabs = Array.from(portalTabs);
                let nextIndex = null;
                if (e.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
                if (e.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
                if (e.key === 'Home') nextIndex = 0;
                if (e.key === 'End') nextIndex = tabs.length - 1;
                if (nextIndex === null) return;
                e.preventDefault();
                const nextTab = tabs[nextIndex];
                setActivePortal(nextTab.getAttribute('data-portal'));
                nextTab.focus();
            });
        });

        portalCloseBtn.addEventListener('click', closePortalModal);

        portalModal.addEventListener('click', (e) => {
            if (e.target === portalModal) {
                closePortalModal();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (!portalModal.classList.contains('active')) return;
            if (e.key === 'Escape') {
                closePortalModal();
                return;
            }
            if (e.key !== 'Tab') return;

            const focusable = Array.from(portalModal.querySelectorAll(
                'button:not([disabled]), a[href], input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
            )).filter((element) => !element.hidden && element.offsetParent !== null);
            if (focusable.length === 0) return;

            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        });
    }

    // ==========================================
    // Form Wizard Logic (4 steps)
    // ==========================================
    const wizardForm = document.getElementById('wizard-form');
    if (wizardForm) {
        let currentStep = 1;
        const totalSteps = 4;
        const steps = wizardForm.querySelectorAll('.form-step');
        const indicators = document.querySelectorAll('.step-indicator');
        const progressFill = document.querySelector('.progress-line-fill');

        // Conditional agency fields (Step 2)
        const agencyFields = document.getElementById('agency-fields');
        const agencyRadios = wizardForm.querySelectorAll('input[name="using_agency"]');
        function syncAgencyVisibility() {
            const checked = wizardForm.querySelector('input[name="using_agency"]:checked');
            const showFields = checked && checked.value === 'yes';
            if (agencyFields) {
                agencyFields.style.display = showFields ? '' : 'none';
            }
        }
        agencyRadios.forEach(r => r.addEventListener('change', syncAgencyVisibility));
        syncAgencyVisibility();

        function updateWizardUI() {
            steps.forEach((step, idx) => {
                step.classList.toggle('active', idx + 1 === currentStep);
            });

            indicators.forEach((ind, idx) => {
                const stepNum = idx + 1;
                ind.classList.remove('active', 'completed');
                const circle = ind.querySelector('.step-circle');

                if (stepNum === currentStep) {
                    ind.classList.add('active');
                    circle.innerHTML = stepNum;
                } else if (stepNum < currentStep) {
                    ind.classList.add('completed');
                    circle.innerHTML = '<i class="fas fa-check"></i>';
                } else {
                    circle.innerHTML = stepNum;
                }
            });

            const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;
            if (progressFill) progressFill.style.width = `${progressPercentage}%`;
        }

        function fieldFilled(input) {
            if (input.type === 'checkbox' || input.type === 'radio') {
                return input.checked;
            }
            if (input.type === 'file') {
                return input.files && input.files.length > 0;
            }
            return input.value && input.value.trim() !== '';
        }

        function markInvalid(input, invalid) {
            input.classList.toggle('input-error', invalid);
            if (invalid) input.setAttribute('aria-invalid', 'true');
            else input.removeAttribute('aria-invalid');

            const group = input.closest('.form-group, .checkbox-group');
            if (group) group.classList.toggle('has-error', invalid);

            let error = input.id ? document.getElementById(`${input.id}-error`) : null;
            if (!error && group) error = group.querySelector('.error-msg');
            if (!error && group && group.nextElementSibling?.classList.contains('error-msg')) {
                error = group.nextElementSibling;
            }
            if (!error) return;

            if (!error.id && (input.id || input.name)) {
                error.id = `${input.id || input.name}-step-error`;
            }
            if (error.id) {
                const describedBy = new Set((input.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean));
                if (invalid) describedBy.add(error.id);
                else describedBy.delete(error.id);
                if (describedBy.size) input.setAttribute('aria-describedby', Array.from(describedBy).join(' '));
                else input.removeAttribute('aria-describedby');
            }
            if (invalid) {
                error.style.display = 'block';
                error.dataset.wizardVisible = 'true';
            } else if (error.dataset.wizardVisible === 'true') {
                error.style.display = '';
                delete error.dataset.wizardVisible;
            }
        }

        function validateStep() {
            const currentStepEl = wizardForm.querySelector(`.form-step[data-step="${currentStep}"]`);
            currentStepEl.querySelectorAll('input, select, textarea').forEach(input => markInvalid(input, false));

            let isValid = true;

            // Standard required inputs/selects/textareas
            currentStepEl.querySelectorAll('input[required], select[required], textarea[required]').forEach(input => {
                if (input.type === 'radio') return; // handled in groups below
                if (!fieldFilled(input) || !input.checkValidity()) {
                    isValid = false;
                    markInvalid(input, true);
                }
            });

            // Required radio groups: every required radio represents a group; validate by name once
            const seenRadioGroups = new Set();
            currentStepEl.querySelectorAll('input[type="radio"][required]').forEach(radio => {
                if (seenRadioGroups.has(radio.name)) return;
                seenRadioGroups.add(radio.name);
                const checked = currentStepEl.querySelector(`input[name="${radio.name}"]:checked`);
                if (!checked) {
                    isValid = false;
                    currentStepEl.querySelectorAll(`input[name="${radio.name}"]`).forEach(input => markInvalid(input, true));
                }
            });

            // Step 2: if "Yes" on agency, validate conditional agency fields
            if (currentStep === 2) {
                const usingAgency = wizardForm.querySelector('input[name="using_agency"]:checked');
                if (usingAgency && usingAgency.value === 'yes') {
                    currentStepEl.querySelectorAll('[data-agency-required]').forEach(input => {
                        if (!fieldFilled(input) || !input.checkValidity()) {
                            isValid = false;
                            markInvalid(input, true);
                        }
                    });
                }
            }

            // Step 4: terms checkbox lives outside the form-group structure; toggle its error msg
            if (currentStep === 4) {
                const terms = currentStepEl.querySelector('#terms_agreement');
                if (terms && !terms.checked) {
                    isValid = false;
                    markInvalid(terms, true);
                }
            }

            if (!isValid) {
                const firstInvalid = currentStepEl.querySelector('[aria-invalid="true"]');
                if (firstInvalid) firstInvalid.focus();
            }
            return isValid;
        }

        window.mccApplyWizard = {
            goToStep(step) {
                const nextStep = Number(step);
                if (!Number.isFinite(nextStep)) return;
                currentStep = Math.min(totalSteps, Math.max(1, nextStep));
                syncAgencyVisibility();
                updateWizardUI();
            },
            getCurrentStep() {
                return currentStep;
            }
        };

        wizardForm.querySelectorAll('.btn-next').forEach(btn => {
            btn.addEventListener('click', () => {
                if (validateStep() && currentStep < totalSteps) {
                    currentStep++;
                    updateWizardUI();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });
        });

        wizardForm.querySelectorAll('.btn-back').forEach(btn => {
            btn.addEventListener('click', () => {
                if (currentStep > 1) {
                    currentStep--;
                    updateWizardUI();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });
        });

        updateWizardUI();
    }
});

// Animated Counters Logic
document.addEventListener('DOMContentLoaded', () => {
    const statNums = document.querySelectorAll('.stat-number');
    if(statNums.length === 0) return;

    const animateCounters = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const endVal = parseInt(target.getAttribute('data-target'));
                const duration = 2000;
                const frameRate = 30;
                const totalFrames = Math.round((duration / 1000) * frameRate);
                let currentFrame = 0;

                const counter = setInterval(() => {
                    currentFrame++;
                    const progress = currentFrame / totalFrames;
                    const currentValue = Math.round(endVal * progress);
                    target.innerText = currentValue + (target.getAttribute('data-suffix') || '');

                    if (currentFrame >= totalFrames) {
                        clearInterval(counter);
                        target.innerText = endVal + (target.getAttribute('data-suffix') || '');
                    }
                }, 1000 / frameRate);
                
                observer.unobserve(target);
            }
        });
    };

    const counterObserver = new IntersectionObserver(animateCounters, { threshold: 0.5 });
    statNums.forEach(num => counterObserver.observe(num));
});

// ==========================================
// Language Flip Toggle (EN / FR) — native i18n
// Translations live in translations.js (window.MCC_TRANSLATIONS)
// ==========================================
(function initLanguageToggle() {
    const STORAGE_KEY = 'mcc_lang';

    function readLang() {
        const stored = (typeof localStorage !== 'undefined') ? localStorage.getItem(STORAGE_KEY) : null;
        return stored === 'fr' ? 'fr' : 'en';
    }

    function writeLang(lang) {
        try { localStorage.setItem(STORAGE_KEY, lang); } catch (_) { /* no-op */ }
    }

    function lookup(key) {
        if (!window.MCC_TRANSLATIONS || !key) return null;
        const parts = key.split('.');
        let node = window.MCC_TRANSLATIONS;
        for (const p of parts) {
            if (!node || typeof node !== 'object') return null;
            node = node[p];
        }
        return (node && typeof node === 'object' && ('en' in node || 'fr' in node)) ? node : null;
    }

    function valueFor(entry, lang) {
        if (!entry) return null;
        if (lang === 'fr' && entry.fr != null) return entry.fr;
        return entry.en != null ? entry.en : null;
    }

    const ATTR_KEYS = ['placeholder', 'alt', 'title', 'aria-label'];

    function applyTranslations(lang) {
        document.documentElement.setAttribute('lang', lang);
        document.body.setAttribute('data-lang', lang);

        document.querySelectorAll('[data-i18n]').forEach(el => {
            const v = valueFor(lookup(el.getAttribute('data-i18n')), lang);
            if (v != null) el.textContent = v;
        });

        document.querySelectorAll('[data-i18n-html]').forEach(el => {
            const v = valueFor(lookup(el.getAttribute('data-i18n-html')), lang);
            if (v != null) el.innerHTML = v;
        });

        ATTR_KEYS.forEach(attr => {
            const selector = `[data-i18n-${attr}]`;
            document.querySelectorAll(selector).forEach(el => {
                const v = valueFor(lookup(el.getAttribute(`data-i18n-${attr}`)), lang);
                if (v != null) el.setAttribute(attr, v);
            });
        });

        // Update toggle button visual state
        document.querySelectorAll('.lang-flip-toggle').forEach(btn => {
            btn.setAttribute('data-lang', lang);
        });
    }

    function buildToggle(lang) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'lang-flip-toggle';
        btn.setAttribute('data-lang', lang);
        const ariaEntry = lookup('lang_toggle.aria');
        const titleEntry = lookup('lang_toggle.title');
        btn.setAttribute('aria-label', valueFor(ariaEntry, lang) || 'Toggle language');
        btn.setAttribute('title', valueFor(titleEntry, lang) || 'Switch language');
        btn.innerHTML = `
            <span class="lang-thumb" aria-hidden="true"></span>
            <span class="lang-label" data-lang-code="en">EN</span>
            <span class="lang-label" data-lang-code="fr">FR</span>
        `;
        return btn;
    }

    document.addEventListener('DOMContentLoaded', () => {
        const host = document.querySelector('.portal-logins');
        if (!host) return;

        const current = readLang();
        const btn = buildToggle(current);
        host.insertBefore(btn, host.firstChild);

        // Apply current language on load
        applyTranslations(current);

        btn.addEventListener('click', () => {
            const next = btn.getAttribute('data-lang') === 'fr' ? 'en' : 'fr';
            btn.classList.add('is-flipping');
            btn.setAttribute('data-lang', next);
            writeLang(next);
            setTimeout(() => {
                applyTranslations(next);
                btn.classList.remove('is-flipping');
            }, 260);
        });
    });
})();
