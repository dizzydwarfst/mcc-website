(function () {
    const PROGRAMS_URL = 'https://lms-system-backend-lake.vercel.app/api/public/programs';
    const HOST_SELECTOR = '[data-program-code]';
    const SCHEDULE_ATTR = 'data-program-intake-schedule';

    const TEXT = {
        en: {
            kicker: 'Upcoming Intakes',
            title: 'Intake schedule',
            intro: 'Start and completion dates for this program.',
            intake: 'Intake',
            schedule: 'Schedule',
            scheduleValue: 'Monday to Thursday',
            format: 'Format',
            formatValue: 'Online, In-Person, Hybrid',
            nextStart: 'Next Start Date',
            action: 'Apply',
            enroll: 'Enroll Now',
            start: 'Start',
            end: 'End',
            tbd: 'TBD'
        },
        fr: {
            kicker: 'Prochaines rentr\u00e9es',
            title: 'Calendrier des rentr\u00e9es',
            intro: 'Dates de d\u00e9but et de fin pour ce programme.',
            intake: 'Rentr\u00e9e',
            schedule: 'Horaire',
            scheduleValue: 'Du lundi au jeudi',
            format: 'Format',
            formatValue: 'En ligne, en personne, hybride',
            nextStart: 'Prochaine date de d\u00e9but',
            action: 'Inscription',
            enroll: "S'inscrire",
            start: 'D\u00e9but',
            end: 'Fin',
            tbd: '\u00c0 confirmer'
        }
    };

    let hosts = [];
    let programsByCode = new Map();

    function currentLang() {
        return document.body && document.body.getAttribute('data-lang') === 'fr' ? 'fr' : 'en';
    }

    function cleanText(value) {
        if (typeof value !== 'string') return '';
        return value.trim();
    }

    function cleanDate(value) {
        return cleanText(value);
    }

    function parseIsoLocal(value) {
        const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
        if (!match) return null;

        const year = Number(match[1]);
        const month = Number(match[2]);
        const day = Number(match[3]);
        const date = new Date(year, month - 1, day);

        if (
            date.getFullYear() !== year ||
            date.getMonth() !== month - 1 ||
            date.getDate() !== day
        ) {
            return null;
        }

        return date;
    }

    function formatDate(value, lang, monthStyle) {
        const clean = cleanDate(value);
        if (!clean) return '';

        const date = parseIsoLocal(clean);
        if (!date) return clean;

        return new Intl.DateTimeFormat(lang === 'fr' ? 'fr-CA' : 'en-CA', {
            year: 'numeric',
            month: monthStyle || 'short',
            day: 'numeric'
        }).format(date);
    }

    function normalizeIntakes(program) {
        const rows = Array.isArray(program && program.intakes) ? program.intakes : [];
        const fallbackStarts = Array.isArray(program && program.semesters) ? program.semesters : [];
        const source = rows.length > 0 ? rows : fallbackStarts.map(start => ({ start, end: null }));

        return source
            .map(row => {
                if (typeof row === 'string') {
                    return { start: cleanDate(row), end: '' };
                }

                if (!row || typeof row !== 'object') return null;
                return {
                    start: cleanDate(row.start),
                    end: cleanDate(row.end),
                    enrollmentOpen: row.enrollment_open,
                    enrollmentStatus: cleanText(row.enrollment_status).toLowerCase(),
                    enrollmentLabel: cleanText(row.enrollment_label)
                };
            })
            .filter(row => row && row.start)
            .sort((a, b) => {
                const aDate = parseIsoLocal(a.start);
                const bDate = parseIsoLocal(b.start);
                if (aDate && bDate) return aDate.getTime() - bDate.getTime();
                return a.start.localeCompare(b.start);
            });
    }

    function el(tagName, className, text) {
        const node = document.createElement(tagName);
        if (className) node.className = className;
        if (text != null) node.textContent = text;
        return node;
    }

    function dateCell(label, value, isTbd) {
        const cell = el('div', 'program-intake-date');
        cell.appendChild(el('span', 'program-intake-label', label));
        const strong = el('strong', isTbd ? 'is-tbd' : '', value);
        cell.appendChild(strong);
        return cell;
    }

    function tableCell(label, value, className) {
        const cell = el('td', className || '', value);
        cell.setAttribute('data-label', label);
        return cell;
    }

    // Staff set the state in the portal; never derive it from the dates.
    function isEnrollmentOpen(row) {
        if (row.enrollmentOpen === true) return true;
        if (row.enrollmentOpen === false) return false;
        if (row.enrollmentStatus) return row.enrollmentStatus === 'open';
        return true;
    }

    function actionContent(row, labels) {
        if (isEnrollmentOpen(row)) {
            const enroll = el('a', 'program-intake-enroll', row.enrollmentLabel || labels.enroll);
            enroll.href = '/apply-for-admissions';
            return enroll;
        }

        const status = el('span', 'program-intake-status', row.enrollmentLabel || '—');
        if (row.enrollmentStatus) status.setAttribute('data-enrollment-status', row.enrollmentStatus);
        return status;
    }

    function renderFslSchedule(section, surface, program, intakes, labels, lang) {
        section.classList.add('program-intake-schedule-table');
        section.setAttribute('aria-labelledby', 'program-intake-title');

        const intro = el('div', 'section-intro program-intake-intro');
        intro.appendChild(el('span', 'section-kicker', labels.kicker));
        const title = el('h2', 'section-title center', labels.title);
        title.id = 'program-intake-title';
        intro.appendChild(title);
        intro.appendChild(el('p', '', labels.intro));
        surface.appendChild(intro);

        const tableWrap = el('div', 'program-intake-table-wrap');
        const table = el('table', 'program-intake-table');
        const head = el('thead');
        const headRow = el('tr');
        [labels.intake, labels.schedule, labels.format, labels.nextStart, labels.end, labels.action].forEach(label => {
            headRow.appendChild(el('th', '', label));
        });
        head.appendChild(headRow);
        table.appendChild(head);

        const body = el('tbody');
        const programName = program.name || 'French as a Second Language (FSL)';
        intakes.forEach(row => {
            const item = el('tr');
            const intake = tableCell(labels.intake, '', 'program-intake-name');
            const intakeContent = el('div', 'program-intake-name-content');
            intakeContent.appendChild(el('strong', '', programName));
            intake.appendChild(intakeContent);
            item.appendChild(intake);
            item.appendChild(tableCell(labels.schedule, labels.scheduleValue));
            item.appendChild(tableCell(labels.format, labels.formatValue));
            item.appendChild(tableCell(labels.nextStart, formatDate(row.start, lang, 'long')));
            item.appendChild(tableCell(labels.end, row.end ? formatDate(row.end, lang, 'long') : labels.tbd, row.end ? '' : 'is-tbd'));
            const action = tableCell(labels.action, '', 'program-intake-action');
            action.appendChild(actionContent(row, labels));
            item.appendChild(action);
            body.appendChild(item);
        });
        table.appendChild(body);
        tableWrap.appendChild(table);
        surface.appendChild(tableWrap);
    }

    function removeSchedule(host) {
        const existing = host.querySelector(`[${SCHEDULE_ATTR}]`);
        if (existing) existing.remove();
    }

    function renderHost(host, program) {
        removeSchedule(host);

        const intakes = normalizeIntakes(program);
        if (!program || intakes.length === 0) return;

        const lang = currentLang();
        const labels = TEXT[lang] || TEXT.en;
        const section = el('section', 'section-shell program-intake-schedule');
        section.setAttribute(SCHEDULE_ATTR, '');

        const surface = el('div', 'section-surface');
        const code = (program.code || '').trim().toUpperCase();

        if (code === 'FSL') {
            renderFslSchedule(section, surface, program, intakes, labels, lang);
            section.appendChild(surface);

            const anchor = host.querySelector('[data-program-intake-anchor]');
            if (anchor) {
                anchor.insertAdjacentElement('beforebegin', section);
            } else {
                host.appendChild(section);
            }
            return;
        }

        const intro = el('div', 'section-intro program-intake-intro');
        intro.appendChild(el('span', 'section-kicker', labels.kicker));
        intro.appendChild(el('h2', 'section-title center', labels.title));
        intro.appendChild(el('p', '', labels.intro));
        surface.appendChild(intro);

        const grid = el('div', 'program-intake-grid');
        intakes.forEach(row => {
            const startText = formatDate(row.start, lang);
            const endText = row.end ? formatDate(row.end, lang) : labels.tbd;
            const item = el('article', 'program-intake-row');
            item.appendChild(dateCell(labels.start, startText, false));
            item.appendChild(el('span', 'program-intake-divider', '-'));
            item.appendChild(dateCell(labels.end, endText, !row.end));
            grid.appendChild(item);
        });
        surface.appendChild(grid);
        section.appendChild(surface);

        const hero = host.querySelector('.page-hero');
        if (hero && hero.parentNode === host) {
            hero.insertAdjacentElement('afterend', section);
        } else {
            host.insertBefore(section, host.firstElementChild || null);
        }
    }

    function renderAll() {
        hosts.forEach(host => {
            const code = (host.getAttribute('data-program-code') || '').trim().toUpperCase();
            if (!code) return;
            renderHost(host, programsByCode.get(code));
        });
    }

    async function init() {
        hosts = Array.from(document.querySelectorAll(HOST_SELECTOR));
        if (hosts.length === 0) return;

        try {
            const response = await fetch(PROGRAMS_URL, {
                headers: { Accept: 'application/json' },
                cache: 'no-store'
            });
            if (!response.ok) return;

            const programs = await response.json();
            if (!Array.isArray(programs)) return;

            programsByCode = new Map(
                programs
                    .filter(program => program && typeof program.code === 'string')
                    .map(program => [program.code.trim().toUpperCase(), program])
            );
            renderAll();
        } catch (_) {
            return;
        }

        if (document.body && typeof MutationObserver !== 'undefined') {
            const observer = new MutationObserver(mutations => {
                if (mutations.some(mutation => mutation.attributeName === 'data-lang')) {
                    renderAll();
                }
            });
            observer.observe(document.body, { attributes: true, attributeFilter: ['data-lang'] });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
