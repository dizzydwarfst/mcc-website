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

// Typewriter Effect
const words = ["Learning", "Growth", "Excellence", "Innovation", "Success"];
let wordIndex = 0;
let charIndex = words[0].length;
let isDeleting = true;
const typewriterElement = document.querySelector('.typewriter');

function type() {
    if (!typewriterElement) return;

    const currentWord = words[wordIndex];
    
    if (isDeleting) {
        charIndex--;
    } else {
        charIndex++;
    }
    
    typewriterElement.textContent = currentWord.substring(0, charIndex);
    
    let typeSpeed = isDeleting ? 40 : 100;
    
    if (!isDeleting && charIndex === currentWord.length) {
        typeSpeed = 2000;
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        typeSpeed = 400;
    }
    
    setTimeout(type, typeSpeed);
}

setTimeout(type, 2000);

// ==========================================
// Hero Card Carousel Auto-Animation
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const carousel = document.getElementById('heroCarousel');
    if (!carousel) return;

    const cards = carousel.querySelectorAll('.carousel-card');
    if (cards.length === 0) return;

    const positionClasses = ['card-pos-1', 'card-pos-2', 'card-pos-3', 'card-pos-4', 'card-pos-5'];
    
    // Track current order: index i holds which card element is at position i
    // Initial: card 0 at pos 0, card 1 at pos 1, etc.
    let order = Array.from({ length: cards.length }, (_, i) => i);

    let isHovering = false;
    let animationInterval;

    function updatePositions() {
        order.forEach((cardIdx, posIdx) => {
            const card = cards[cardIdx];
            // Remove all position classes
            positionClasses.forEach(cls => card.classList.remove(cls));
            // Assign new position
            card.classList.add(positionClasses[posIdx]);
        });
    }

    function rotateCards() {
        if (isHovering) return;
        // Front card (pos 3, index 2) goes to back (pos 1, index 0)
        // Shift all positions: each card moves one position toward the front
        // The card at pos-5 wraps to pos-1
        const last = order.pop();
        order.unshift(last);
        updatePositions();
    }

    // Auto-rotate every 3 seconds
    animationInterval = setInterval(rotateCards, 3000);

    // Pause animation on hover
    carousel.addEventListener('mouseenter', () => {
        isHovering = true;
    });

    carousel.addEventListener('mouseleave', () => {
        isHovering = false;
    });
});

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
    const portalTriggers = document.querySelectorAll('.btn-top-portal, .campus-portals .btn-outline-gold');

    if (portalTriggers.length > 0) {
        const portalModal = document.createElement('div');
        portalModal.className = 'portal-modal-overlay';
        portalModal.id = 'portal-login-modal';
        portalModal.setAttribute('aria-hidden', 'true');
        portalModal.innerHTML = `
            <div class="portal-modal-shell" role="dialog" aria-modal="true" aria-labelledby="portal-modal-title">
                <button type="button" class="portal-modal-close" aria-label="Close login panel">&times;</button>
                <div class="portal-modal-intro">
                    <span class="portal-modal-kicker">Portal Access Preview</span>
                    <h2 id="portal-modal-title">MCC Portal Login</h2>
                    <p>Choose LMS or CRM access below. The live systems are still being connected, but both login panels are ready to preview right now.</p>
                    <div class="portal-switcher" role="tablist" aria-label="Portal selection">
                        <button type="button" class="portal-tab active" data-portal="student" role="tab" aria-selected="true">Student LMS</button>
                        <button type="button" class="portal-tab" data-portal="staff" role="tab" aria-selected="false">Staff CRM</button>
                    </div>
                </div>
                <div class="portal-modal-body">
                    <section class="portal-panel active" data-portal-panel="student">
                        <span class="portal-panel-label">Student Access</span>
                        <h3>Student LMS Login</h3>
                        <p>Preview the student sign-in experience for courses, grades, schedules, and campus resources.</p>
                        <form class="portal-login-form" data-portal-form="student">
                            <label>
                                Student Email or ID
                                <input type="text" name="student-identity" placeholder="student@mcc.edu" required>
                            </label>
                            <label>
                                Password
                                <input type="password" name="student-password" placeholder="Password" required>
                            </label>
                            <button type="submit" class="btn-solid-gold">Sign In to LMS</button>
                        </form>
                        <p class="portal-panel-note">Live LMS authentication will be connected in a future update.</p>
                        <div class="portal-feedback" aria-live="polite"></div>
                    </section>
                    <section class="portal-panel" data-portal-panel="staff">
                        <span class="portal-panel-label">Staff Access</span>
                        <h3>Staff CRM Login</h3>
                        <p>Preview the staff sign-in experience for admissions workflows, student records, and follow-up activity.</p>
                        <form class="portal-login-form" data-portal-form="staff">
                            <label>
                                Staff Email or ID
                                <input type="text" name="staff-identity" placeholder="staff@mcc.edu" required>
                            </label>
                            <label>
                                Password
                                <input type="password" name="staff-password" placeholder="Password" required>
                            </label>
                            <button type="submit" class="btn-solid-gold">Sign In to CRM</button>
                        </form>
                        <p class="portal-panel-note">Live CRM authentication will be connected in a future update.</p>
                        <div class="portal-feedback" aria-live="polite"></div>
                    </section>
                </div>
            </div>
        `;
        document.body.appendChild(portalModal);

        const portalTabs = portalModal.querySelectorAll('.portal-tab');
        const portalPanels = portalModal.querySelectorAll('.portal-panel');
        const portalForms = portalModal.querySelectorAll('.portal-login-form');
        const portalCloseBtn = portalModal.querySelector('.portal-modal-close');

        const setActivePortal = (portalType) => {
            portalTabs.forEach(tab => {
                const isActive = tab.getAttribute('data-portal') === portalType;
                tab.classList.toggle('active', isActive);
                tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
            });

            portalPanels.forEach(panel => {
                const isActive = panel.getAttribute('data-portal-panel') === portalType;
                panel.classList.toggle('active', isActive);
            });
        };

        const openPortalModal = (portalType) => {
            setActivePortal(portalType);
            portalForms.forEach(form => form.reset());
            portalModal.querySelectorAll('.portal-feedback').forEach(feedback => {
                feedback.textContent = '';
                feedback.classList.remove('active');
            });
            portalModal.classList.add('active');
            portalModal.setAttribute('aria-hidden', 'false');
            document.body.classList.add('portal-modal-open');

            const firstInput = portalModal.querySelector(`.portal-panel[data-portal-panel="${portalType}"] input`);
            if (firstInput) {
                firstInput.focus();
            }
        };

        const closePortalModal = () => {
            portalModal.classList.remove('active');
            portalModal.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('portal-modal-open');
        };

        portalTriggers.forEach(trigger => {
            const configuredPortal = trigger.getAttribute('data-portal-open');
            const triggerText = trigger.textContent.toLowerCase();
            const portalType = configuredPortal || (triggerText.includes('crm') ? 'staff' : 'student');

            trigger.setAttribute('data-portal-open', portalType);
            trigger.setAttribute('aria-haspopup', 'dialog');
            trigger.setAttribute('aria-controls', 'portal-login-modal');

            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                openPortalModal(portalType);
            });
        });

        portalTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                setActivePortal(tab.getAttribute('data-portal'));
            });
        });

        portalForms.forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();

                const portalType = form.getAttribute('data-portal-form');
                const feedback = form.parentElement.querySelector('.portal-feedback');
                const portalName = portalType === 'staff' ? 'Staff CRM' : 'Student LMS';

                feedback.textContent = `${portalName} access is coming soon. This panel is live as a temporary preview for now.`;
                feedback.classList.add('active');
            });
        });

        portalCloseBtn.addEventListener('click', closePortalModal);

        portalModal.addEventListener('click', (e) => {
            if (e.target === portalModal) {
                closePortalModal();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && portalModal.classList.contains('active')) {
                closePortalModal();
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
        }

        function validateStep() {
            const currentStepEl = wizardForm.querySelector(`.form-step[data-step="${currentStep}"]`);
            currentStepEl.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));

            let isValid = true;

            // Standard required inputs/selects/textareas
            currentStepEl.querySelectorAll('input[required], select[required], textarea[required]').forEach(input => {
                if (input.type === 'radio') return; // handled in groups below
                if (!fieldFilled(input)) {
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
                    currentStepEl.querySelectorAll(`input[name="${radio.name}"]`).forEach(r => markInvalid(r, true));
                }
            });

            // Step 2: if "Yes" on agency, validate conditional agency fields
            if (currentStep === 2) {
                const usingAgency = wizardForm.querySelector('input[name="using_agency"]:checked');
                if (usingAgency && usingAgency.value === 'yes') {
                    currentStepEl.querySelectorAll('[data-agency-required]').forEach(input => {
                        if (!fieldFilled(input)) {
                            isValid = false;
                            markInvalid(input, true);
                        }
                    });
                }
            }

            return isValid;
        }

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

        wizardForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (validateStep()) {
                document.getElementById('wizard-container').style.display = 'none';
                document.getElementById('wizard-success').style.display = 'block';
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
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
// Language Flip Toggle (EN / FR) + Google Translate
// ==========================================
(function initLanguageToggle() {
    const COOKIE = 'googtrans';

    function readLang() {
        const match = document.cookie.match(/(?:^|;\s*)googtrans=([^;]+)/);
        if (!match) return 'en';
        return decodeURIComponent(match[1]).endsWith('/fr') ? 'fr' : 'en';
    }

    function writeCookie(lang) {
        const value = lang === 'fr' ? '/en/fr' : '/en/en';
        const host = location.hostname;
        // set for current path
        document.cookie = `googtrans=${value};path=/`;
        // set for host (and parent domain if applicable)
        document.cookie = `googtrans=${value};path=/;domain=${host}`;
        const parts = host.split('.');
        if (parts.length > 2) {
            document.cookie = `googtrans=${value};path=/;domain=.${parts.slice(-2).join('.')}`;
        }
    }

    function clearCookie() {
        const host = location.hostname;
        const past = 'Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = `googtrans=;path=/;expires=${past}`;
        document.cookie = `googtrans=;path=/;domain=${host};expires=${past}`;
        const parts = host.split('.');
        if (parts.length > 2) {
            document.cookie = `googtrans=;path=/;domain=.${parts.slice(-2).join('.')};expires=${past}`;
        }
    }

    function buildToggle() {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'lang-flip-toggle';
        btn.setAttribute('aria-label', 'Toggle language between English and French');
        btn.setAttribute('title', 'Switch language / Changer de langue');
        btn.innerHTML = `
            <span class="lang-thumb" aria-hidden="true"></span>
            <span class="lang-label" data-lang-code="en">EN</span>
            <span class="lang-label" data-lang-code="fr">FR</span>
        `;
        return btn;
    }

    function injectGoogleTranslate() {
        if (document.getElementById('google_translate_element')) return;
        const container = document.createElement('div');
        container.id = 'google_translate_element';
        document.body.appendChild(container);

        window.googleTranslateElementInit = function () {
            // eslint-disable-next-line no-undef
            new google.translate.TranslateElement({
                pageLanguage: 'en',
                includedLanguages: 'en,fr',
                layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
                autoDisplay: false
            }, 'google_translate_element');
        };

        const script = document.createElement('script');
        script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        script.async = true;
        document.body.appendChild(script);
    }

    function applyLang(lang) {
        if (lang === 'fr') {
            writeCookie('fr');
        } else {
            clearCookie();
        }
        // Reload so Google Translate's frame re-runs against the fresh cookie.
        // This is the most reliable approach across all pages.
        location.reload();
    }

    document.addEventListener('DOMContentLoaded', () => {
        const host = document.querySelector('.portal-logins');
        if (!host) return;

        const btn = buildToggle();
        const current = readLang();
        btn.setAttribute('data-lang', current);

        // Place as the first item so it's visually prominent
        host.insertBefore(btn, host.firstChild);

        btn.addEventListener('click', () => {
            const next = btn.getAttribute('data-lang') === 'fr' ? 'en' : 'fr';
            btn.classList.add('is-flipping');
            btn.setAttribute('data-lang', next);
            setTimeout(() => applyLang(next), 260);
        });

        injectGoogleTranslate();
    });
})();
