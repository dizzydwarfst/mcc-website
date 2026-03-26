// Scroll Handler for sticky Header
const header = document.querySelector('.glass-header, .solid-header');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

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
let wordIndex = 0; // We start with the first word "Learning" already in HTML
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
        typeSpeed = 2000; // Pause at end of word
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        typeSpeed = 400; // Pause before typing new word
    }
    
    setTimeout(type, typeSpeed);
}

// Start the backspace after a 2-second delay since "Learning" is already in the HTML
setTimeout(type, 2000);

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

    // Admissions Dropdown Mobile Toggle
    const dropdownToggle = document.querySelector('.nav-dropdown-toggle');
    const dropdownContent = document.querySelector('.dropdown-content');

    if (dropdownToggle && dropdownContent) {
        dropdownToggle.addEventListener('click', (e) => {
            // Only toggle on mobile screens
            if (window.innerWidth <= 900) {
                e.preventDefault();
                dropdownContent.classList.toggle('show');
            }
        });
    }

    // ==========================================
    // FAQ Accordion Logic
    // ==========================================
    const faqItems = document.querySelectorAll('.faq-item');
    if (faqItems.length > 0) {
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                
                // Close all other items
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

    if (yearBtns.length > 0) {
        yearBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all
                yearBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const filterYear = btn.getAttribute('data-year');
                
                newsCards.forEach(card => {
                    if (filterYear === 'all' || card.getAttribute('data-year') === filterYear) {
                        card.style.display = 'flex';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
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
                
                // Get data from the clicked card
                const card = link.closest('.news-card');
                const title = card.querySelector('.news-card-title').textContent;
                const date = card.querySelector('.news-card-date').textContent;
                const issue = card.querySelector('.news-card-issue').textContent;
                const modalHtml = card.querySelector('.full-content-data').innerHTML;
                const accentClass = card.querySelector('.news-card-accent').className.split(' ')[1];
                
                // Populate modal
                modalOverlay.querySelector('.modal-title').textContent = title;
                modalOverlay.querySelector('.modal-date').textContent = date;
                modalOverlay.querySelector('.modal-issue').textContent = issue;
                modalOverlay.querySelector('.modal-text').innerHTML = modalHtml;
                
                const modalAccent = modalOverlay.querySelector('.modal-accent-top');
                modalAccent.className = `modal-accent-top ${accentClass}`;

                // Show modal
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
    // Form Wizard Logic
    // ==========================================
    const wizardForm = document.getElementById('wizard-form');
    if (wizardForm) {
        let currentStep = 1;
        const totalSteps = 5;
        const steps = document.querySelectorAll('.form-step');
        const indicators = document.querySelectorAll('.step-indicator');
        const progressFill = document.querySelector('.progress-line-fill');

        function updateWizardUI() {
            // Update step visibility
            steps.forEach((step, idx) => {
                if (idx + 1 === currentStep) {
                    step.classList.add('active');
                } else {
                    step.classList.remove('active');
                }
            });

            // Update indicators
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

            // Update progress line
            const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;
            if (progressFill) progressFill.style.width = `${progressPercentage}%`;
        }

        function validateStep() {
            let isValid = true;
            const currentStepEl = document.querySelector(`.form-step[data-step="${currentStep}"]`);
            const requiredInputs = currentStepEl.querySelectorAll('input[required], select[required], textarea[required]');
            
            // Remove old errors
            currentStepEl.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
            
            // If it's step 4 (Radio cards), ensure one is checked
            if (currentStep === 4) {
                const checkedRadio = currentStepEl.querySelector('input[name="program"]:checked');
                if (!checkedRadio) {
                    isValid = false;
                    alert('Please select a program.');
                }
            } else {
                requiredInputs.forEach(input => {
                    if (!input.value.trim() || (input.type === 'checkbox' && !input.checked)) {
                        isValid = false;
                        input.classList.add('input-error');
                    }
                });
            }
            
            return isValid;
        }

        function populateSummary() {
            if (currentStep !== 5) return;
            
            function val(id, isSelect=false) {
                const el = document.getElementById(id);
                if (!el) return '';
                if (isSelect && el.options) {
                    return el.options[el.selectedIndex].text;
                }
                return el.value;
            }

            document.getElementById('sum-name').textContent = `${val('first_name')} ${val('last_name')}` + (val('preferred_name') ? ` (${val('preferred_name')})` : '');
            document.getElementById('sum-dob-gender').textContent = `${val('dob')} | ${val('gender', true)}`;
            document.getElementById('sum-citizen').textContent = val('citizenship');

            const pCode = val('phone_code', true);
            document.getElementById('sum-phone').textContent = `${pCode !== "Other" ? pCode : ""} ${val('phone_number')}`.trim();
            document.getElementById('sum-email').textContent = val('email');
            document.getElementById('sum-status').textContent = `${val('status', true)} (Exp: ${val('status_expiry') || 'N/A'})`;

            const street = val('street_address');
            document.getElementById('sum-address').textContent = `${street ? street + ', ' : ''}${val('city')}, ${val('province')} ${val('postal_code')} - ${val('country', true)}`;

            const selectedProgram = document.querySelector('input[name="program"]:checked');
            if (selectedProgram) {
                document.getElementById('sum-program').textContent = selectedProgram.value;
            }
            document.getElementById('sum-term').textContent = val('term', true);
        }

        // Attach click to next/back buttons
        document.querySelectorAll('.btn-next').forEach(btn => {
            btn.addEventListener('click', () => {
                if (validateStep() && currentStep < totalSteps) {
                    currentStep++;
                    if(currentStep === 5) populateSummary();
                    updateWizardUI();
                }
            });
        });

        document.querySelectorAll('.btn-back').forEach(btn => {
            btn.addEventListener('click', () => {
                if (currentStep > 1) {
                    currentStep--;
                    updateWizardUI();
                }
            });
        });
        
        // Form Submission
        wizardForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (validateStep()) {
                document.getElementById('wizard-container').style.display = 'none';
                document.getElementById('wizard-success').style.display = 'block';
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
        
        // Attach Edit links in Summary
        document.querySelectorAll('.summary-edit').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                currentStep = parseInt(link.getAttribute('data-target-step'), 10);
                updateWizardUI();
            });
        });

        // Init UI
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
