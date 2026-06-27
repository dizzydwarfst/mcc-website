(function () {
    const PROGRAMS_URL = 'https://lms-system-backend-lake.vercel.app/api/public/programs';
    const HOST_SELECTOR = '[data-program-code]';
    const SCHEDULE_ATTR = 'data-program-intake-schedule';

    const TEXT = {
        en: {
            kicker: 'Upcoming Intakes',
            title: 'Intake schedule',
            intro: 'Start and completion dates for this program.',
            start: 'Start',
            end: 'End',
            tbd: 'TBD'
        },
        fr: {
            kicker: 'Prochaines rentr\u00e9es',
            title: 'Calendrier des rentr\u00e9es',
            intro: 'Dates de d\u00e9but et de fin pour ce programme.',
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

    function cleanDate(value) {
        if (typeof value !== 'string') return '';
        return value.trim();
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

    function formatDate(value, lang) {
        const clean = cleanDate(value);
        if (!clean) return '';

        const date = parseIsoLocal(clean);
        if (!date) return clean;

        return new Intl.DateTimeFormat(lang === 'fr' ? 'fr-CA' : 'en-CA', {
            year: 'numeric',
            month: 'short',
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
                    end: cleanDate(row.end)
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
