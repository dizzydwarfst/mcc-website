/**
 * MCC Document Services - public guest storefront.
 *
 * The portal backend is the only source of truth. This file renders the public
 * catalogue, the per-product configurator, the guest order record, and the
 * order lookup. Three rules shape the whole file:
 *
 *   1. Price only ever comes from a variant the server resolved. The browser
 *      never sends an amount.
 *   2. The guest access token is issued exactly once at order creation. It is
 *      persisted locally, shown to the customer, and sent as X-Guest-Order-Token
 *      on every later call for that order.
 *   3. A Moneris browser callback is not a payment. Only the backend
 *      /payment/verify response may show a paid state, and an uncertain result
 *      never starts another charge on its own.
 */
(function initDocumentServices() {
    'use strict';

    const DEFAULT_API_BASE = 'https://lms-system-backend-lake.vercel.app/api';
    const API_BASE = String(
        window.MCC_DOCUMENT_SERVICES_API_BASE || window.MCC_ENGAGEMENT_API_BASE || DEFAULT_API_BASE,
    ).replace(/\/$/, '');
    const PUBLIC_BASE = API_BASE + '/public/document-services';
    const PORTAL_SERVICE_BASE = 'https://portal.metropolitancollege.ca/student/services/';
    const REQUEST_TIMEOUT_MS = 20000;

    const CATALOGUE_PATH = '/document-services';
    const LOOKUP_PATH = '/document-services/lookup';
    const PRODUCT_PATH = '/document-services/';
    const ORDER_PATH = '/document-services/order/';

    const STORAGE_KEY = 'mcc.document-services.orders.v1';
    const RECENT_KEY = 'mcc.document-services.recent.v1';

    const ALLOWED_MONERIS_SCRIPTS = [
        'https://gatewayt.moneris.com/chkt/js/chkt_v1.00.js',
        'https://gateway.moneris.com/chkt/js/chkt_v1.00.js',
    ];

    const SURCHARGE_NOTE = 'No card, convenience, processing, or other surcharge is added. '
        + 'The total shown is the exact amount submitted for payment.';

    const STATUS_LABELS = {
        payment: {
            pending: { label: 'Payment pending', tone: 'amber' },
            processing: { label: 'Payment in progress', tone: 'amber' },
            paid: { label: 'Paid', tone: 'emerald' },
            failed: { label: 'Payment failed', tone: 'red' },
            cancelled: { label: 'Payment cancelled', tone: 'slate' },
            partially_refunded: { label: 'Partially refunded', tone: 'orange' },
            refunded: { label: 'Refunded', tone: 'slate' },
            review_required: { label: 'Under review', tone: 'red' },
        },
        order: {
            draft: { label: 'Draft', tone: 'slate' },
            pending_payment: { label: 'Awaiting payment', tone: 'amber' },
            paid: { label: 'Paid', tone: 'emerald' },
            processing: { label: 'Processing', tone: 'gold' },
            completed: { label: 'Completed', tone: 'emerald' },
            cancelled: { label: 'Cancelled', tone: 'slate' },
            refunded: { label: 'Refunded', tone: 'slate' },
        },
        fulfillment: {
            not_started: { label: 'Not started', tone: 'slate' },
            verification_required: { label: 'Verification required', tone: 'amber' },
            verifying_records: { label: 'Verifying records', tone: 'amber' },
            approved_for_processing: { label: 'Approved for processing', tone: 'gold' },
            preparing: { label: 'Preparing your document', tone: 'gold' },
            ready_for_pickup: { label: 'Ready for pickup', tone: 'emerald' },
            shipped: { label: 'Shipped', tone: 'emerald' },
            delivered: { label: 'Delivered', tone: 'emerald' },
            completed: { label: 'Completed', tone: 'emerald' },
            unable_to_fulfill: { label: 'Unable to fulfill', tone: 'red' },
        },
    };

    /* ---------------------------------------------------------------- DOM -- */

    function el(tag, props, children) {
        const node = document.createElement(tag);
        if (props) {
            Object.keys(props).forEach((key) => {
                const value = props[key];
                if (value === null || value === undefined || value === false) return;
                if (key === 'class') node.className = String(value);
                else if (key === 'text') node.textContent = String(value);
                else if (key === 'dataset') Object.assign(node.dataset, value);
                else if (key.slice(0, 2) === 'on' && typeof value === 'function') {
                    node.addEventListener(key.slice(2).toLowerCase(), value);
                } else node.setAttribute(key, value === true ? '' : String(value));
            });
        }
        appendChildren(node, children);
        return node;
    }

    function appendChildren(node, children) {
        if (children === null || children === undefined || children === false) return;
        if (Array.isArray(children)) {
            children.forEach((child) => appendChildren(node, child));
            return;
        }
        node.appendChild(children instanceof Node ? children : document.createTextNode(String(children)));
    }

    function icon(name) {
        return el('i', { class: 'fas ' + name, 'aria-hidden': 'true' });
    }

    function clear(node) {
        while (node && node.firstChild) node.removeChild(node.firstChild);
    }

    function render(node, children) {
        if (!node) return;
        clear(node);
        appendChildren(node, children);
    }

    function revealIn(node) {
        // script.js only observes elements present at load, so panels built here
        // opt straight into the finished state instead of staying invisible.
        node.querySelectorAll('.reveal').forEach((item) => item.classList.add('active'));
        return node;
    }

    /**
     * These screens repaint whole sections when a choice changes what the form
     * contains. Without this the caret would jump out of whatever the customer
     * was using at the time.
     */
    function withPreservedFocus(paintFn) {
        const active = document.activeElement;
        const id = active && active.id ? active.id : '';
        const caret = active && typeof active.selectionStart === 'number' ? active.selectionStart : null;
        paintFn();
        if (!id) return;
        const restored = document.getElementById(id);
        if (!restored) return;
        try {
            restored.focus({ preventScroll: true });
            if (caret !== null && typeof restored.setSelectionRange === 'function') {
                restored.setSelectionRange(caret, caret);
            }
        } catch (error) { /* focus restoration is best effort */ }
    }

    /* ------------------------------------------------------------ Format -- */

    function formatCad(cents) {
        const value = Number(cents);
        if (!Number.isFinite(value)) return '$0.00';
        return new Intl.NumberFormat('en-CA', {
            style: 'currency',
            currency: 'CAD',
            currencyDisplay: 'narrowSymbol',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(Math.trunc(value) / 100);
    }

    function formatDate(value, withTime) {
        if (!value) return '';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return String(value);
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        if (withTime) {
            options.hour = 'numeric';
            options.minute = '2-digit';
        }
        return new Intl.DateTimeFormat('en-CA', options).format(date);
    }

    function humanize(value, fallback) {
        if (value === null || value === undefined || value === '') return fallback || '';
        return String(value).replace(/[_-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
    }

    function statusMeta(kind, status) {
        const table = STATUS_LABELS[kind] || {};
        return table[status] || { label: humanize(status, 'Unknown'), tone: 'slate' };
    }

    function badge(kind, status) {
        const meta = statusMeta(kind, status);
        return el('span', { class: 'ds-badge tone-' + meta.tone, text: meta.label });
    }

    /* ----------------------------------------------------------- Storage -- */

    function readJson(key) {
        try {
            const raw = window.localStorage.getItem(key);
            const parsed = raw ? JSON.parse(raw) : null;
            return parsed && typeof parsed === 'object' ? parsed : null;
        } catch (error) {
            return null;
        }
    }

    function writeJson(key, value) {
        try {
            window.localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            return false;
        }
    }

    function tokenFor(orderId) {
        const store = readJson(STORAGE_KEY) || {};
        const entry = store[String(orderId)];
        return entry && typeof entry.token === 'string' ? entry.token : '';
    }

    function rememberOrder(order, token) {
        const id = String(order && order.id ? order.id : '');
        if (!id || !token) return false;
        const store = readJson(STORAGE_KEY) || {};
        store[id] = {
            token: token,
            order_number: (order && order.order_number) || '',
            saved_at: new Date().toISOString(),
        };
        const stored = writeJson(STORAGE_KEY, store);
        const recent = (readJson(RECENT_KEY) || {}).items;
        const items = Array.isArray(recent) ? recent.filter((item) => item && item.id !== id) : [];
        items.unshift({
            id: id,
            order_number: (order && order.order_number) || '',
            title: orderTitle(order),
            total_cents: Number((order && order.total_cents) || 0),
            created_at: (order && order.created_at) || new Date().toISOString(),
        });
        writeJson(RECENT_KEY, { items: items.slice(0, 12) });
        return stored;
    }

    function recentOrders() {
        const stored = readJson(RECENT_KEY);
        const items = stored && Array.isArray(stored.items) ? stored.items : [];
        return items.filter((item) => item && item.id);
    }

    function orderTitle(order) {
        const items = (order && Array.isArray(order.items) ? order.items : []).filter(Boolean);
        return (items[0] && (items[0].product_name || items[0].variant_name)) || 'Document order';
    }

    /* --------------------------------------------------------------- API -- */

    function apiErrorMessage(payload, fallback) {
        const detail = payload && payload.detail;
        if (typeof detail === 'string' && detail.trim()) return detail.trim();
        if (detail && typeof detail === 'object' && !Array.isArray(detail)) {
            if (typeof detail.message === 'string' && detail.message.trim()) return detail.message.trim();
        }
        if (Array.isArray(detail)) {
            const messages = detail.map((item) => {
                if (typeof item === 'string') return item;
                if (item && typeof item.msg === 'string') return item.msg.replace(/^Value error,\s*/i, '');
                return '';
            }).filter(Boolean);
            if (messages.length) return messages.join(' ');
        }
        if (payload && typeof payload.message === 'string' && payload.message.trim()) return payload.message.trim();
        return fallback;
    }

    function fieldErrorsFrom(payload) {
        const detail = payload && payload.detail;
        const errors = (detail && detail.field_errors) || (payload && payload.field_errors);
        return errors && typeof errors === 'object' && !Array.isArray(errors) ? errors : null;
    }

    async function request(path, options) {
        const settings = options || {};
        const controller = new AbortController();
        const timer = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
        const headers = { Accept: 'application/json' };
        if (settings.token) headers['X-Guest-Order-Token'] = settings.token;
        let body;
        if (settings.body !== undefined) {
            headers['Content-Type'] = 'application/json';
            body = JSON.stringify(settings.body);
        }
        try {
            const response = await fetch(PUBLIC_BASE + path, {
                method: settings.method || 'GET',
                headers: headers,
                body: body,
                credentials: 'omit',
                signal: controller.signal,
            });
            const payload = await response.json().catch(() => ({}));
            if (!response.ok) {
                const error = new Error(apiErrorMessage(payload, 'Request failed (' + response.status + ')'));
                error.status = response.status;
                error.payload = payload;
                error.fieldErrors = fieldErrorsFrom(payload);
                error.code = (payload && payload.detail && payload.detail.code) || (payload && payload.code) || '';
                throw error;
            }
            return { data: payload, status: response.status };
        } catch (error) {
            if (error.name === 'AbortError') {
                const timeout = new Error('The request took too long. Check your connection and try again.');
                timeout.status = 0;
                throw timeout;
            }
            if (error.status === undefined) {
                const offline = new Error('MCC could not be reached. Check your connection and try again.');
                offline.status = 0;
                throw offline;
            }
            throw error;
        } finally {
            window.clearTimeout(timer);
        }
    }

    async function downloadOrderDocument(orderId, kind, token) {
        const controller = new AbortController();
        const timer = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
        try {
            const response = await fetch(PUBLIC_BASE + '/orders/' + encodeURIComponent(orderId) + '/' + kind, {
                headers: { Accept: 'application/pdf', 'X-Guest-Order-Token': token },
                credentials: 'omit',
                signal: controller.signal,
            });
            if (!response.ok) {
                const payload = await response.json().catch(() => ({}));
                throw new Error(apiErrorMessage(payload, 'The ' + kind + ' could not be downloaded.'));
            }
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const link = el('a', { href: url, download: kind + '-' + orderId + '.pdf' });
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.setTimeout(() => URL.revokeObjectURL(url), 30000);
        } finally {
            window.clearTimeout(timer);
        }
    }

    /* ------------------------------------------------- Product and fields -- */

    function activeVariants(product) {
        const variants = product && Array.isArray(product.variants) ? product.variants : [];
        return variants.filter((variant) => variant && String(variant.status || 'active') === 'active');
    }

    function variantPriceCents(variant) {
        return Number(variant && variant.price_cents) || 0;
    }

    function lowestPriceCents(product) {
        const prices = activeVariants(product).map(variantPriceCents);
        return prices.length ? Math.min.apply(null, prices) : null;
    }

    function priceVaries(product) {
        const prices = activeVariants(product).map(variantPriceCents);
        return prices.length > 1 && Math.min.apply(null, prices) !== Math.max.apply(null, prices);
    }

    /**
     * Sections are the portal's shape: staff set the order they appear in, their
     * labels, and the money shown against every value. option_dimensions is the
     * older unpriced shape, kept only as a fallback for a server that predates
     * the change.
     */
    function optionSections(product) {
        const sections = product && Array.isArray(product.option_sections) && product.option_sections.length
            ? product.option_sections
            : (product && Array.isArray(product.option_dimensions) ? product.option_dimensions : []);
        return sections.filter((section) => (
            section && section.id && Array.isArray(section.values) && section.values.length
        ));
    }

    function sectionValue(section, value) {
        const values = (section && section.values) || [];
        return values.find((item) => String(item && item.value) === String(value)) || null;
    }

    function pricingOf(product) {
        const pricing = product && product.pricing;
        return pricing && typeof pricing === 'object' ? pricing : {};
    }

    function presentationOf(product) {
        const presentation = product && product.presentation;
        return presentation && typeof presentation === 'object' ? presentation : {};
    }

    /**
     * "uplift" prices each option by what it adds, so two cards can never be
     * read as stacking two full combination prices. The server switches to
     * "absolute" when a combination is priced oddly enough that an uplift would
     * be wrong for some choice. The page only obeys the field.
     */
    function displayMode(product) {
        return pricingOf(product).display_mode === 'absolute' ? 'absolute' : 'uplift';
    }

    function upliftCents(value) {
        return Number(value && value.uplift_cents) || 0;
    }

    function upliftText(value) {
        if (value && value.uplift_label) return String(value.uplift_label);
        const cents = upliftCents(value);
        return cents ? '+' + formatCad(cents) : 'Included';
    }

    function optionPriceText(product, value) {
        if (displayMode(product) === 'uplift') return upliftText(value);
        if (value && value.price_label) return String(value.price_label);
        return formatCad(value && value.price_cents);
    }

    function valueOffered(value) {
        return !value || value.available !== false;
    }

    function variantOptions(variant) {
        const values = variant && variant.option_values;
        return values && typeof values === 'object' ? values : {};
    }

    function matchesSelection(variant, product, selection) {
        const options = variantOptions(variant);
        return optionSections(product).every((section) => (
            String(options[section.id] === undefined ? '' : options[section.id])
            === String(selection[section.id] === undefined ? '' : selection[section.id])
        ));
    }

    function resolveVariant(product, selection) {
        const variants = activeVariants(product);
        if (!optionSections(product).length) return variants[0] || null;
        return variants.find((variant) => matchesSelection(variant, product, selection)) || null;
    }

    function cheapestVariant(product) {
        const variants = activeVariants(product);
        if (!variants.length) return null;
        return variants.reduce((best, variant) => (
            variantPriceCents(variant) < variantPriceCents(best) ? variant : best
        ), variants[0]);
    }

    function selectionFor(product, variant) {
        const options = variantOptions(variant);
        const selection = {};
        optionSections(product).forEach((section) => { selection[section.id] = options[section.id]; });
        return selection;
    }

    /**
     * Open on the cheapest value in every section, so the first number a visitor
     * sees is the least this order can cost. A combination nobody sells is worse
     * than a slightly dearer one, so a pick that resolves to nothing falls back
     * to the cheapest variant on offer.
     */
    function defaultSelection(product) {
        const cheapest = cheapestVariant(product);
        if (!cheapest) return {};
        const sections = optionSections(product);
        if (!sections.length) return {};
        const selection = {};
        sections.forEach((section) => {
            const offered = section.values.filter(valueOffered);
            const pool = offered.length ? offered : section.values;
            const lowest = pool.reduce((best, value) => (
                upliftCents(value) < upliftCents(best) ? value : best
            ), pool[0]);
            selection[section.id] = lowest && lowest.value;
        });
        return resolveVariant(product, selection) ? selection : selectionFor(product, cheapest);
    }

    /** Would this value still resolve to a real variant? */
    function valueAvailable(product, selection, sectionId, value) {
        const candidate = Object.assign({}, selection);
        candidate[sectionId] = value;
        return activeVariants(product).some((variant) => {
            const options = variantOptions(variant);
            return optionSections(product).every((section) => {
                if (section.id === sectionId) return String(options[section.id]) === String(value);
                if (candidate[section.id] === undefined) return true;
                return String(options[section.id]) === String(candidate[section.id]);
            });
        });
    }

    function quantityMax(product) {
        const max = Math.trunc(Number(product && product.max_quantity));
        return Number.isFinite(max) && max > 1 ? max : 1;
    }

    /** A single-copy product has no quantity section at all. */
    function quantityOffered(product) {
        return !!(product && product.quantity_allowed) && quantityMax(product) > 1;
    }

    function clampQuantity(product, value) {
        const number = Math.trunc(Number(value));
        if (!Number.isFinite(number) || number < 1) return 1;
        return Math.min(number, quantityMax(product));
    }

    /**
     * The first copy carries the whole combination - delivery and processing are
     * charged once for the order - and every copy after it adds the document
     * alone. This is a preview only: the server recomputes the charge from the
     * stored variant price, and the browser never sends an amount.
     */
    function orderTotalCents(product, variant, quantity) {
        if (!variant) return 0;
        const extra = Number(pricingOf(product).additional_copy_price_cents) || 0;
        return variantPriceCents(variant) + (clampQuantity(product, quantity) - 1) * extra;
    }

    function formFields(product) {
        const form = product && product.form;
        return form && Array.isArray(form.fields) ? form.fields.filter(Boolean) : [];
    }

    function fieldKey(field, index) {
        return String((field && (field.key || field.id)) || 'field_' + index);
    }

    function fieldType(field) {
        return String((field && (field.type || field.input_type)) || 'text').toLowerCase();
    }

    /** Mirrors the backend condition matcher so the browser hides exactly what the server ignores. */
    function conditionMatches(condition, context) {
        if (!condition) return true;
        if (typeof condition !== 'object' || Array.isArray(condition)) return false;
        const key = condition.field || condition.key || condition.dimension;
        if (!key) return true;
        const actual = context[String(key)];
        const operator = String(condition.operator || '').toLowerCase();
        const operand = condition.value;
        if (Object.prototype.hasOwnProperty.call(condition, 'equals') || ['equals', 'eq', '=='].indexOf(operator) !== -1) {
            const expected = Object.prototype.hasOwnProperty.call(condition, 'equals') ? condition.equals : operand;
            return actual === expected;
        }
        if (Object.prototype.hasOwnProperty.call(condition, 'not_equals')) return actual !== condition.not_equals;
        if (Object.prototype.hasOwnProperty.call(condition, 'in')
            || Object.prototype.hasOwnProperty.call(condition, 'one_of')
            || ['in', 'one_of'].indexOf(operator) !== -1) {
            const choices = condition.in || condition.one_of || operand || [];
            return Array.isArray(choices) && choices.indexOf(actual) !== -1;
        }
        if (['not_equals', 'ne', '!='].indexOf(operator) !== -1) return actual !== operand;
        if (Object.prototype.hasOwnProperty.call(condition, 'truthy')) return Boolean(actual) === Boolean(condition.truthy);
        if (Object.prototype.hasOwnProperty.call(condition, 'falsy')) return !actual === Boolean(condition.falsy);
        if (operator === 'truthy') return Boolean(actual);
        if (operator === 'falsy') return !actual;
        return Boolean(actual);
    }

    function conditionContext(variant, answers) {
        return Object.assign({}, variantOptions(variant), answers || {});
    }

    function fieldVisible(field, context) {
        return conditionMatches(field.visible_when || field.show_when || field.condition, context);
    }

    function fieldRequired(field, context) {
        if (field.required === true) return true;
        return Boolean(field.required_when) && conditionMatches(field.required_when, context);
    }

    function fieldOptions(field) {
        const raw = (field && (field.options || field.choices || field.values)) || [];
        if (!Array.isArray(raw)) return [];
        return raw.map((option) => (typeof option === 'string'
            ? { value: option, label: humanize(option) }
            : {
                value: String((option && (option.value !== undefined ? option.value : option.id)) || ''),
                label: (option && (option.label || option.name)) || humanize(option && option.value),
            }
        )).filter((option) => option.value !== '');
    }

    function addressSchema(field) {
        const list = field && Array.isArray(field.address_fields) ? field.address_fields : [];
        const known = list.filter((item) => item && item.key);
        if (known.length) return known;
        return [
            { key: 'address_1', label: 'Address line 1', required: true },
            { key: 'address_2', label: 'Address line 2', required: false },
            { key: 'city', label: 'City', required: true },
            { key: 'province', label: 'Province, state, or region', required: true },
            { key: 'postal_code', label: 'Postal or ZIP code', required: true },
            { key: 'country', label: 'Country', required: true, default: 'Canada' },
        ];
    }

    /** Fills in address defaults the server would otherwise reject as missing. */
    function withFieldDefaults(fields, answers, variant) {
        const next = Object.assign({}, answers);
        const context = conditionContext(variant, next);
        fields.forEach((field, index) => {
            if (fieldType(field) !== 'address') return;
            if (!fieldVisible(field, context)) return;
            const key = fieldKey(field, index);
            const current = next[key] && typeof next[key] === 'object' ? next[key] : {};
            if (Object.prototype.hasOwnProperty.call(current, 'country')) return;
            const country = addressSchema(field).find((item) => item.key === 'country');
            if (country && country.default) next[key] = Object.assign({}, current, { country: country.default });
        });
        return next;
    }

    function isEmptyValue(value) {
        if (value === undefined || value === null || value === '' || value === false) return true;
        if (Array.isArray(value)) return value.length === 0;
        if (typeof value === 'object') return Object.keys(value).length === 0;
        return false;
    }

    function validateAnswers(fields, answers, variant) {
        const errors = {};
        const context = conditionContext(variant, answers);
        fields.forEach((field, index) => {
            if (!fieldVisible(field, context)) return;
            const key = fieldKey(field, index);
            const label = field.label || field.title || humanize(key);
            const value = answers[key];
            const required = fieldRequired(field, context);
            const type = fieldType(field);

            if (['checkbox', 'acknowledgement', 'consent', 'boolean'].indexOf(type) !== -1) {
                if (required && value !== true) errors[key] = 'You must accept this to continue.';
                else if (Object.prototype.hasOwnProperty.call(field, 'accepted_value')
                    && value !== undefined && value !== field.accepted_value) {
                    errors[key] = 'You must accept this to continue.';
                }
                return;
            }

            if (type === 'address') {
                const address = value && typeof value === 'object' ? value : {};
                const schema = addressSchema(field);
                const requiredKeys = schema.filter((item) => item.required).map((item) => item.key);
                const missing = requiredKeys.filter((name) => !String(address[name] || '').trim());
                if ((required || Object.keys(address).length) && missing.length) {
                    const labels = schema
                        .filter((item) => missing.indexOf(item.key) !== -1)
                        .map((item) => String(item.label || humanize(item.key)).toLowerCase());
                    errors[key] = 'Complete the address: ' + labels.join(', ') + '.';
                }
                return;
            }

            if (required && isEmptyValue(value)) {
                errors[key] = label + ' is required.';
                return;
            }
            if (isEmptyValue(value)) return;

            if (type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) {
                errors[key] = 'Enter a valid email address.';
                return;
            }
            if (type === 'select' || type === 'radio') {
                const allowed = fieldOptions(field).map((option) => option.value);
                if (allowed.length && allowed.indexOf(String(value)) === -1) {
                    errors[key] = 'Choose one of the available options.';
                    return;
                }
            }
            if (typeof value === 'string') {
                const trimmed = value.trim();
                const minimum = Number(field.min_length);
                const maximum = Number(field.max_length);
                if (Number.isFinite(minimum) && minimum > 0 && trimmed.length < minimum) {
                    errors[key] = 'Enter at least ' + minimum + ' characters.';
                    return;
                }
                if (Number.isFinite(maximum) && maximum > 0 && trimmed.length > maximum) {
                    errors[key] = 'Enter no more than ' + maximum + ' characters.';
                    return;
                }
                if (field.pattern) {
                    try {
                        if (!new RegExp('^(?:' + field.pattern + ')$').test(trimmed)) {
                            errors[key] = 'Enter this in the required format.';
                            return;
                        }
                    } catch (error) { /* the server rejects unusable schema patterns */ }
                }
            }
            if (type === 'date' && !/^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
                errors[key] = 'Enter a date as YYYY-MM-DD.';
            }
        });
        return errors;
    }

    /** Only visible, server-known answers travel: unknown keys are rejected upstream. */
    function submittableAnswers(fields, answers, variant) {
        const payload = {};
        const context = conditionContext(variant, answers);
        fields.forEach((field, index) => {
            if (!fieldVisible(field, context)) return;
            const key = fieldKey(field, index);
            if (!Object.prototype.hasOwnProperty.call(answers, key)) return;
            const value = answers[key];
            if (value === undefined) return;
            payload[key] = value;
        });
        return payload;
    }

    /** Which answer keys any other field's visibility or requirement depends on. */
    function conditionKeys(fields) {
        const keys = new Set();
        const collect = (condition) => {
            if (!condition || typeof condition !== 'object') return;
            const key = condition.field || condition.key || condition.dimension;
            if (key) keys.add(String(key));
        };
        fields.forEach((field) => {
            collect(field.visible_when);
            collect(field.show_when);
            collect(field.condition);
            collect(field.required_when);
        });
        return keys;
    }

    function acknowledgementMap(fields, answers, variant) {
        const map = {};
        const context = conditionContext(variant, answers);
        fields.forEach((field, index) => {
            if (['checkbox', 'acknowledgement', 'consent', 'boolean'].indexOf(fieldType(field)) === -1) return;
            if (!fieldVisible(field, context)) return;
            const key = fieldKey(field, index);
            map[key] = answers[key] === true;
        });
        return map;
    }

    /* ------------------------------------------------------ Field widgets -- */

    const FIELD_GROUP_LABELS = {
        student_identity: 'Who the record belongs to',
        academic_record: 'The academic record',
        recipient: 'Who receives it',
        delivery: 'Delivery',
        additional_information: 'Anything else we should know',
        acknowledgements: 'Before you continue',
    };

    function helpFor(field) {
        return field.help_text || field.description || field.hint || '';
    }

    function labelText(field, key, required) {
        const parts = [field.label || field.title || humanize(key)];
        return { text: parts[0], required: required };
    }

    function buildLabel(id, field, key, required) {
        const info = labelText(field, key, required);
        return el('label', { for: id }, [
            info.text,
            required ? el('span', { class: 'ds-required', 'aria-hidden': 'true', text: '*' }) : null,
        ]);
    }

    function buildHelp(id, field, error) {
        const nodes = [];
        const help = helpFor(field);
        if (help) nodes.push(el('p', { class: 'ds-help', id: id + '-help', text: help }));
        if (error) nodes.push(el('p', { class: 'ds-error', id: id + '-error', role: 'alert', text: error }));
        return nodes;
    }

    function describedBy(id, field, error) {
        if (error) return id + '-error';
        return helpFor(field) ? id + '-help' : null;
    }

    function buildAddressField(context) {
        const field = context.field;
        const key = context.key;
        const id = context.id;
        const value = context.value && typeof context.value === 'object' ? context.value : {};
        const onChange = context.onChange;
        const schema = addressSchema(field);
        const grid = el('div', { class: 'ds-grid' });
        schema.forEach((part) => {
            const partId = id + '-' + part.key;
            const wide = part.key === 'address_1' || part.key === 'address_2';
            grid.appendChild(el('div', { class: 'ds-field' + (wide ? ' is-wide' : '') }, [
                el('label', { for: partId }, [
                    part.label || humanize(part.key),
                    part.required ? el('span', { class: 'ds-required', 'aria-hidden': 'true', text: '*' }) : null,
                ]),
                el('input', {
                                        id: partId,
                    name: key + '.' + part.key,
                    type: 'text',
                    value: value[part.key] === undefined ? '' : value[part.key],
                    maxlength: part.max_length,
                    autocomplete: part.autocomplete,
                    disabled: context.disabled,
                    onInput: (event) => {
                        // Read the live answer rather than the one captured at
                        // render time, or typing in a second line would drop the first.
                        const current = context.getValue();
                        const base = current && typeof current === 'object' ? current : {};
                        const next = Object.assign({}, base);
                        next[part.key] = event.target.value;
                        onChange(next);
                    },
                }),
            ]));
        });
        return el('fieldset', { class: 'ds-address' }, [
            el('legend', {}, [
                field.label || 'Delivery address',
                context.required ? el('span', { class: 'ds-required', 'aria-hidden': 'true', text: '*' }) : null,
            ]),
            grid,
            buildHelp(id, field, context.error),
        ]);
    }

    function buildField(context) {
        const field = context.field;
        const key = context.key;
        const id = 'ds-field-' + key;
        const type = fieldType(field);
        const error = context.error;
        const required = context.required;
        const disabled = context.disabled;
        const onChange = context.onChange;
        const shared = {
            id: id,
            name: key,
            disabled: disabled,
            // .error-state is the site's own invalid-field treatment.
            class: error ? 'error-state' : null,
            'aria-invalid': error ? 'true' : null,
            'aria-describedby': describedBy(id, field, error),
        };

        if (type === 'heading' || type === 'section') {
            return el('div', { class: 'ds-field is-wide' }, [
                el('h3', { text: field.label || '' }),
                helpFor(field) ? el('p', { class: 'ds-help', text: helpFor(field) }) : null,
            ]);
        }

        if (type === 'address') {
            return buildAddressField({
                field: field, key: key, id: id, value: context.value, error: error,
                required: required, disabled: disabled, onChange: onChange,
                getValue: context.getValue,
            });
        }

        if (['checkbox', 'acknowledgement', 'consent', 'boolean'].indexOf(type) !== -1) {
            return el('div', { class: 'ds-field is-wide' }, [
                el('div', { class: 'ds-check' + (error ? ' is-invalid' : '') }, [
                    el('input', Object.assign({}, shared, {
                        type: 'checkbox',
                        checked: context.value === true,
                        onChange: (event) => onChange(event.target.checked === true, true),
                    })),
                    el('label', { for: id }, [
                        field.label || humanize(key),
                        required ? el('span', { class: 'ds-required', 'aria-hidden': 'true', text: '*' }) : null,
                    ]),
                ]),
                buildHelp(id, field, error),
            ]);
        }

        const wide = type === 'textarea' || Boolean(field.full_width);
        // Typing repaints nothing, so the caret stays put. A field that another
        // field's condition reads commits structurally when it is left.
        const commits = Boolean(context.drivesConditions);
        let control;
        if (type === 'textarea') {
            control = el('textarea', Object.assign({}, shared, {
                class: 'ds-textarea' + (error ? ' error-state' : ''),
                rows: field.rows || 4,
                maxlength: field.max_length,
                placeholder: field.placeholder || '',
                onInput: (event) => onChange(event.target.value, false),
                onChange: commits ? (event) => onChange(event.target.value, true) : null,
            }));
            control.value = context.value === undefined ? '' : String(context.value);
        } else if (type === 'select' || type === 'radio') {
            control = el('select', Object.assign({}, shared, {
                onChange: (event) => onChange(event.target.value, true),
            }), [
                el('option', { value: '', text: 'Select an option' }),
                fieldOptions(field).map((option) => el('option', {
                    value: option.value,
                    text: option.label,
                    selected: String(context.value || '') === option.value,
                })),
            ]);
            control.value = context.value === undefined ? '' : String(context.value);
        } else {
            const inputType = type === 'phone' ? 'tel'
                : ['email', 'tel', 'date', 'number'].indexOf(type) !== -1 ? type
                    : field.format === 'email' ? 'email' : 'text';
            control = el('input', Object.assign({}, shared, {
                type: inputType,
                value: context.value === undefined ? '' : String(context.value),
                maxlength: field.max_length,
                placeholder: field.placeholder || '',
                autocomplete: field.autocomplete,
                inputmode: field.input_mode,
                onInput: (event) => onChange(event.target.value, false),
                onChange: commits ? (event) => onChange(event.target.value, true) : null,
            }));
        }

        return el('div', { class: 'ds-field' + (wide ? ' is-wide' : '') }, [
            buildLabel(id, field, key, required),
            control,
            buildHelp(id, field, error),
        ]);
    }

    /**
     * Renders a product form entirely from its server-supplied field list,
     * grouped the way the schema groups it.
     */
    function buildForm(options) {
        const fields = options.fields;
        const answers = options.answers;
        const variant = options.variant;
        const errors = options.errors || {};
        const disabled = Boolean(options.disabled);
        const onChange = options.onChange;
        const context = conditionContext(variant, answers);
        const drivers = conditionKeys(fields);
        const readAnswer = options.getAnswer || ((key) => answers[key]);
        const groups = [];
        const byGroup = new Map();

        fields.forEach((field, index) => {
            if (!fieldVisible(field, context)) return;
            const name = String(field.group || 'details');
            if (!byGroup.has(name)) {
                const bucket = { name: name, items: [] };
                byGroup.set(name, bucket);
                groups.push(bucket);
            }
            byGroup.get(name).items.push({ field: field, index: index });
        });

        return groups.map((group) => el('fieldset', { class: 'ds-fieldgroup' }, [
            el('legend', { text: FIELD_GROUP_LABELS[group.name] || humanize(group.name) }),
            el('div', { class: 'ds-grid' }, group.items.map((entry) => {
                const key = fieldKey(entry.field, entry.index);
                return buildField({
                    field: entry.field,
                    key: key,
                    value: answers[key],
                    error: errors[key],
                    required: fieldRequired(entry.field, context),
                    disabled: disabled,
                    drivesConditions: drivers.has(key),
                    getValue: () => readAnswer(key),
                    onChange: (value, structural) => onChange(key, value, structural === true),
                });
            })),
        ]));
    }

    /* -------------------------------------------------------- Order lines -- */

    function docketLines(entries) {
        return entries.map((entry) => el('div', { class: 'ds-line' }, [
            el('div', { class: 'ds-line-label' }, [
                entry.label,
                entry.detail ? el('span', { text: entry.detail }) : null,
            ]),
            el('div', { class: 'ds-line-value' + (entry.muted ? ' is-muted' : ''), text: entry.value }),
        ]));
    }

    function taxLine(amountCents) {
        return el('div', { class: 'ds-line' }, [
            el('div', { class: 'ds-line-label' }, [
                'Tax ',
                el('span', { text: 'Exempt - no tax is charged on this service.' }),
            ]),
            el('div', { class: 'ds-line-value is-muted', text: formatCad(amountCents || 0) }),
        ]);
    }

    /**
     * A tax line only exists when MCC has something to say about tax. Printing
     * "no tax is charged" on every order was noise, not information.
     */
    function taxNoteBlock(product) {
        const presentation = presentationOf(product);
        if (presentation.show_tax_note !== true) return null;
        const note = String(presentation.tax_note || '').trim();
        return note ? el('p', { class: 'ds-docket-foot', text: note }) : null;
    }

    function totalRow(totalCents) {
        return el('div', { class: 'ds-total' }, [
            el('span', { class: 'ds-total-label', text: 'Total CAD' }),
            el('span', { class: 'ds-total-value', text: formatCad(totalCents) }),
        ]);
    }

    /* ------------------------------------------------------ Payment modal -- */

    const monerisScriptPromises = new Map();

    function safeMonerisScriptUrl(value) {
        let url;
        try {
            url = new URL(String(value || ''), window.location.origin);
        } catch (error) {
            throw new Error('The payment provider returned an invalid checkout address.');
        }
        if (ALLOWED_MONERIS_SCRIPTS.indexOf(url.href) === -1) {
            throw new Error('The payment provider returned an untrusted checkout address.');
        }
        return url.href;
    }

    function loadMonerisScript(value) {
        const url = safeMonerisScriptUrl(value);
        if (typeof window.monerisCheckout === 'function') return Promise.resolve(window.monerisCheckout);
        if (monerisScriptPromises.has(url)) return monerisScriptPromises.get(url);
        const promise = new Promise((resolve, reject) => {
            const existing = Array.from(document.querySelectorAll('script[data-mcc-moneris-src]'))
                .find((item) => item.dataset.mccMonerisSrc === url);
            const script = existing || document.createElement('script');
            script.addEventListener('load', () => {
                if (typeof window.monerisCheckout === 'function') resolve(window.monerisCheckout);
                else reject(new Error('Secure checkout did not become available.'));
            }, { once: true });
            script.addEventListener('error', () => reject(new Error('Secure checkout could not be loaded.')), { once: true });
            if (!existing) {
                script.src = url;
                script.async = true;
                script.dataset.mccMonerisSrc = url;
                document.head.appendChild(script);
            }
        }).catch((error) => {
            monerisScriptPromises.delete(url);
            throw error;
        });
        monerisScriptPromises.set(url, promise);
        return promise;
    }

    function callbackTicket(payload, fallback) {
        if (!payload) return fallback || '';
        if (typeof payload === 'object') {
            return String(payload.ticket || payload.checkout_ticket || payload.ticket_id || fallback || '');
        }
        const text = String(payload);
        try {
            return callbackTicket(JSON.parse(text), fallback);
        } catch (error) {
            return text.trim() || fallback || '';
        }
    }

    function createMonerisCheckout(settings) {
        if (typeof window.monerisCheckout !== 'function') throw new Error('Secure checkout is unavailable.');
        const checkout = new window.monerisCheckout();
        checkout.setMode(String(settings.environment || 'qa').toLowerCase() === 'prod' ? 'prod' : 'qa');
        checkout.setCheckoutDiv(settings.containerId);
        ['page_loaded', 'cancel_transaction', 'error_event', 'payment_receipt', 'payment_complete'].forEach((name) => {
            checkout.setCallback(name, settings.callbacks[name] || function noop() {});
        });
        return checkout;
    }

    /**
     * Ported from the portal's MonerisCheckoutModal. A provider callback only
     * ever triggers a backend verification; the backend's answer is the single
     * authority on whether the order is paid, and an uncertain answer stops the
     * flow rather than retrying.
     */
    function createPaymentModal(config) {
        const containerId = 'ds-moneris-' + Math.random().toString(36).slice(2, 10);
        const state = {
            phase: 'ready',
            message: '',
            canRetry: false,
            retryKey: '',
            ticket: '',
            starting: false,
            verifying: false,
            cancelling: false,
            closeRequested: false,
            checkout: null,
        };

        const statusIcon = icon('fa-shield-halved');
        const statusText = el('span', { text: 'Your order is ready for payment.' });
        const status = el('div', { class: 'ds-modal-status', 'aria-live': 'polite' }, [statusIcon, statusText]);
        const frame = el('div', { class: 'ds-modal-frame', id: containerId, 'aria-label': 'Moneris secure checkout' });
        const action = el('button', { type: 'button', class: 'btn-solid-gold' }, [
            icon('fa-lock'), el('span', { text: 'Open secure checkout' }),
        ]);
        const guard = el('p', { class: 'ds-help' });
        const closeButton = el('button', {
            type: 'button', class: 'ds-modal-close', 'aria-label': 'Close secure payment',
        }, [icon('fa-xmark')]);

        const card = el('div', {
            class: 'ds-modal-card', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': containerId + '-title',
        }, [
            el('div', { class: 'ds-modal-head' }, [
                el('div', {}, [
                    el('h2', { id: containerId + '-title' }, [icon('fa-credit-card'), 'Secure payment']),
                    el('p', {
                        text: 'Payment is collected by Moneris Checkout. MCC never receives or stores your card number or security code.',
                    }),
                ]),
                closeButton,
            ]),
            el('div', { class: 'ds-modal-body' }, [status, frame, action, guard]),
        ]);
        const root = el('div', { class: 'ds-modal', hidden: true }, [card]);
        document.body.appendChild(root);

        function paint() {
            const expanded = ['loading', 'open', 'verifying'].indexOf(state.phase) !== -1;
            root.classList.toggle('is-expanded', expanded);
            status.className = 'ds-modal-status'
                + (state.phase === 'verified' ? ' tone-emerald' : '')
                + (['failed', 'uncertain'].indexOf(state.phase) !== -1 ? ' tone-red' : '');
            const glyph = state.phase === 'verified' ? 'fa-circle-check'
                : state.phase === 'failed' || state.phase === 'cancelled' ? 'fa-circle-xmark'
                    : state.phase === 'uncertain' ? 'fa-triangle-exclamation'
                        : ['loading', 'verifying'].indexOf(state.phase) !== -1 ? 'fa-spinner fa-spin'
                            : 'fa-shield-halved';
            statusIcon.className = 'fas ' + glyph;
            statusText.textContent = state.message || 'Your order is ready for payment.';

            const showAction = state.phase === 'ready' || (state.canRetry && state.phase !== 'verified');
            action.hidden = !showAction;
            action.disabled = state.starting;
            action.lastChild.textContent = state.canRetry
                ? 'Try checkout again'
                : 'Open secure checkout';

            guard.hidden = state.phase !== 'uncertain';
            guard.textContent = state.phase === 'uncertain'
                ? 'To protect you from a double charge, this screen will not start another payment on its own. '
                + 'Check the order status first, and contact MCC if it does not settle.'
                : '';
            closeButton.disabled = state.phase === 'verifying' || state.cancelling;
        }

        function setState(changes) {
            Object.assign(state, changes);
            paint();
        }

        function closeProvider() {
            try {
                if (state.checkout && typeof state.checkout.closeCheckout === 'function') state.checkout.closeCheckout();
            } catch (error) { /* provider cleanup only */ }
        }

        async function finishCancellation(ticket, providerError) {
            if (state.cancelling || state.verifying) return false;
            setState({ cancelling: true, phase: 'verifying', message: 'MCC is closing the active payment attempt...' });
            closeProvider();
            try {
                const result = (await request('/orders/' + encodeURIComponent(config.orderId) + '/payment/cancel', {
                    method: 'POST', token: config.token, body: { ticket: ticket },
                })).data;
                setState({
                    ticket: '',
                    cancelling: false,
                    canRetry: result.can_retry === true,
                    retryKey: result.checkout_idempotency_key || state.retryKey,
                    phase: providerError ? 'failed' : 'cancelled',
                    message: providerError
                        ? 'The checkout attempt was closed after a problem at the payment provider. No charge was made.'
                        : 'Checkout was cancelled and the payment attempt was safely closed. No charge was made.',
                });
                if (config.onSettled) config.onSettled(result);
                return true;
            } catch (error) {
                setState({
                    cancelling: false,
                    canRetry: false,
                    phase: 'uncertain',
                    message: error.message
                        || 'MCC could not confirm that the payment attempt closed. Do not retry until the order status has been checked.',
                });
                return false;
            }
        }

        async function finishVerification(ticket) {
            if (!ticket || state.verifying || state.cancelling) return;
            // Once the provider reports completion the attempt can no longer be
            // cancelled from the browser. The backend answer is the only authority.
            setState({ verifying: true, ticket: '', phase: 'verifying', message: 'MCC is verifying this payment directly with Moneris...' });
            try {
                const result = (await request('/orders/' + encodeURIComponent(config.orderId) + '/payment/verify', {
                    method: 'POST', token: config.token, body: { ticket: ticket },
                })).data;
                const paid = result.verified === true && result.payment_status === 'paid';
                if (paid) {
                    closeProvider();
                    setState({
                        verifying: false, canRetry: false, phase: 'verified', message: 'Payment approved and verified by MCC.',
                    });
                    if (config.onVerified) config.onVerified(result);
                } else if (result.payment_status === 'failed' || result.payment_status === 'cancelled') {
                    setState({
                        verifying: false,
                        canRetry: result.can_retry === true,
                        retryKey: result.checkout_idempotency_key || state.retryKey,
                        phase: 'failed',
                        message: result.message || 'The payment was not approved. No new charge will be attempted automatically.',
                    });
                    if (config.onSettled) config.onSettled(result);
                } else {
                    setState({
                        verifying: false,
                        canRetry: false,
                        phase: 'uncertain',
                        message: result.message
                            || 'This payment is still being reconciled. Do not start another payment until MCC confirms the result.',
                    });
                    if (config.onSettled) config.onSettled(result);
                }
            } catch (error) {
                setState({
                    verifying: false,
                    canRetry: false,
                    phase: 'uncertain',
                    message: error.message
                        || 'MCC could not confirm the payment result. Do not retry until the order status has been checked.',
                });
            }
        }

        async function begin() {
            if (state.starting || state.verifying || state.cancelling) return;
            setState({ starting: true, phase: 'loading', message: 'Preparing secure checkout...', canRetry: false });
            let startedTicket = '';
            try {
                const preload = (await request('/orders/' + encodeURIComponent(config.orderId) + '/checkout', {
                    method: 'POST', token: config.token, body: { idempotency_key: state.retryKey || config.idempotencyKey },
                })).data;
                const ticket = String(preload.ticket || '');
                if (!ticket || !preload.script_url) throw new Error('Secure checkout configuration is incomplete.');
                startedTicket = ticket;
                setState({ ticket: ticket });

                if (state.closeRequested) {
                    const closed = await finishCancellation(ticket, false);
                    state.closeRequested = false;
                    setState({ starting: false });
                    if (closed) hide(true);
                    return;
                }

                await loadMonerisScript(preload.script_url);
                if (state.ticket !== ticket || state.closeRequested || state.cancelling) {
                    setState({ starting: false });
                    return;
                }

                state.checkout = createMonerisCheckout({
                    environment: preload.environment || preload.mode,
                    containerId: containerId,
                    callbacks: {
                        page_loaded: () => setState({
                            phase: 'open',
                            message: 'Enter your payment details in the secure Moneris window.',
                        }),
                        cancel_transaction: () => finishCancellation(ticket, false),
                        error_event: () => finishCancellation(ticket, true),
                        payment_receipt: () => setState({
                            message: 'Moneris returned a receipt. MCC is waiting for completion before verifying it.',
                        }),
                        payment_complete: (payload) => finishVerification(callbackTicket(payload, ticket)),
                    },
                });
                setState({ phase: 'open', message: 'The secure Moneris checkout is open.', starting: false });
                state.checkout.startCheckout(ticket);
            } catch (error) {
                if (startedTicket) {
                    setState({ starting: false });
                    await finishCancellation(startedTicket, true);
                    return;
                }
                const payload = error.payload || {};
                const detail = payload.detail && typeof payload.detail === 'object' ? payload.detail : {};
                const retryAllowed = payload.can_retry === true || detail.can_retry === true;
                const nextKey = payload.checkout_idempotency_key || detail.checkout_idempotency_key;
                setState({
                    starting: false,
                    phase: retryAllowed ? 'failed' : 'uncertain',
                    canRetry: retryAllowed,
                    retryKey: nextKey || state.retryKey,
                    message: retryAllowed
                        ? (error.message || 'Secure checkout could not be started.')
                        : (error.code === 'already_paid'
                            ? 'This order is already paid. Refresh the order to see the receipt.'
                            : 'MCC could not confirm whether checkout started. Check the order before trying again.'),
                });
            }
        }

        function hide(force) {
            if (!force) {
                if (state.phase === 'verifying' || state.cancelling) return;
                if (state.starting && !state.ticket) {
                    state.closeRequested = true;
                    setState({ message: 'Waiting for MCC to safely close the payment startup request...' });
                    return;
                }
                if (state.ticket && (state.starting || ['loading', 'open'].indexOf(state.phase) !== -1)) {
                    finishCancellation(state.ticket, false).then((closed) => {
                        if (closed) hide(true);
                    });
                    return;
                }
            }
            closeProvider();
            state.checkout = null;
            root.hidden = true;
            document.body.classList.remove('ds-modal-open');
            if (config.onClose) config.onClose(state.phase);
        }

        action.addEventListener('click', begin);
        closeButton.addEventListener('click', () => hide(false));
        root.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') hide(false);
        });

        return {
            open: function open(settings) {
                Object.assign(state, {
                    phase: 'ready',
                    message: '',
                    canRetry: false,
                    ticket: '',
                    starting: false,
                    verifying: false,
                    cancelling: false,
                    closeRequested: false,
                    retryKey: (settings && settings.idempotencyKey) || config.idempotencyKey || '',
                });
                if (settings && settings.idempotencyKey) config.idempotencyKey = settings.idempotencyKey;
                if (settings && settings.token) config.token = settings.token;
                clear(frame);
                root.hidden = false;
                document.body.classList.add('ds-modal-open');
                paint();
                closeButton.focus();
            },
            close: () => hide(true),
        };
    }

    /* ------------------------------------------------------ Shared blocks -- */

    function loadingBlock(label) {
        return el('div', { class: 'ds-loading' }, [
            el('span', { class: 'ds-spinner' }),
            el('span', { text: label || 'Loading...' }),
        ]);
    }

    function noticeBlock(tone, glyph, title, body, extra) {
        return el('div', { class: 'ds-notice' + (tone ? ' tone-' + tone : ''), role: 'status' }, [
            icon(glyph),
            el('div', {}, [
                title ? el('strong', { text: title }) : null,
                body ? el('p', { text: body }) : null,
                extra || null,
            ]),
        ]);
    }

    function errorBlock(message, onRetry) {
        return el('div', { class: 'ds-notice tone-red', role: 'alert' }, [
            icon('fa-triangle-exclamation'),
            el('div', {}, [
                el('strong', { text: 'This could not be loaded' }),
                el('p', { text: message }),
                onRetry ? el('p', {}, [
                    el('button', { type: 'button', class: 'btn-text-question', text: 'Try again', onClick: onRetry }),
                ]) : null,
            ]),
        ]);
    }

    /** enabled:false is a closed counter, not a failure. */
    function closedBlock(context) {
        return noticeBlock(
            'gold',
            'fa-clock',
            'Online ordering is closed right now',
            context === 'order'
                ? 'You can still review this order. New payments cannot be started until MCC reopens online ordering.'
                : 'You can review every service and its price, but orders cannot be placed until MCC reopens online ordering. '
                + 'Contact the college at admin@metropolitancollege.ca and we will take your request directly.',
        );
    }

    function surchargeNote() {
        return el('p', { class: 'ds-docket-foot', text: SURCHARGE_NOTE });
    }

    /* -------------------------------------------------------- Catalogue --- */

    function productHref(product) {
        return PRODUCT_PATH + encodeURIComponent(product.slug || product.id);
    }

    function portalHref(product) {
        return PORTAL_SERVICE_BASE + encodeURIComponent(product.slug || product.id);
    }

    function recordCard(product, enabled) {
        const minimum = lowestPriceCents(product);
        const available = product.available !== false;
        const loginRequired = product.login_required === true;

        let cta;
        if (loginRequired) {
            cta = el('a', { class: 'btn-solid-gold', href: portalHref(product), rel: 'noopener' }, [
                el('span', { text: 'Order in the portal' }), icon('fa-arrow-up-right-from-square'),
            ]);
        } else if (!available) {
            cta = el('span', { class: 'ds-badge tone-slate', text: 'Currently unavailable' });
        } else if (!enabled) {
            cta = el('a', { class: 'btn-outline-gold', href: productHref(product) }, [
                el('span', { text: 'View details' }),
            ]);
        } else {
            cta = el('a', { class: 'btn-solid-gold', href: productHref(product) }, [
                el('span', { text: 'Configure and order' }), icon('fa-arrow-right'),
            ]);
        }

        return el('article', { class: 'ds-record' }, [
            el('div', { class: 'ds-record-head' }, [
                // The catalogue code is a staff identifier, so the same portal
                // switch that governs it on the product page governs it here.
                el('span', {
                    class: 'ds-record-ref',
                    text: (presentationOf(product).show_product_code === true && product.product_id)
                        || 'MCC service',
                }),
                loginRequired ? el('span', { class: 'ds-badge tone-gold', text: 'Sign-in required' }) : null,
            ]),
            el('h3', { text: product.name || 'Document service' }),
            el('p', { class: 'ds-record-desc', text: product.description || 'Review the options, delivery choices, and price.' }),
            product.processing_information
                ? el('p', { class: 'ds-record-note' }, [icon('fa-clock'), el('span', { text: product.processing_information })])
                : null,
            el('div', { class: 'ds-record-foot' }, [
                minimum === null ? el('span', { class: 'ds-badge tone-slate', text: 'Price on request' }) : el('div', { class: 'ds-price' }, [
                    el('small', { text: priceVaries(product) ? 'From' : 'Price' }),
                    formatCad(minimum),
                ]),
                cta,
            ]),
        ]);
    }

    async function mountCatalogue(host) {
        render(host, loadingBlock('Loading the document services catalogue...'));
        let payload;
        try {
            payload = (await request('/products')).data;
        } catch (error) {
            render(host, errorBlock(error.message, () => mountCatalogue(host)));
            return;
        }

        const items = Array.isArray(payload.items) ? payload.items : [];
        const enabled = payload.enabled !== false;
        const nodes = [];

        if (!enabled) nodes.push(closedBlock('catalogue'));

        if (!items.length) {
            nodes.push(el('div', { class: 'ds-empty' }, [
                el('h2', { text: 'No services are published yet' }),
                el('p', { text: 'MCC is preparing the document catalogue. Email admin@metropolitancollege.ca and we will help you directly.' }),
            ]));
        } else {
            nodes.push(el('div', { class: 'ds-record-grid' }, items.map((product) => recordCard(product, enabled))));
        }

        render(host, nodes);
        host.setAttribute('aria-busy', 'false');
    }

    /* ------------------------------------------------------- Configurator -- */

    function mountProduct(host, slug) {
        const state = {
            product: null,
            enabled: true,
            selection: {},
            answers: {},
            customer: { first_name: '', last_name: '', email: '', phone: '' },
            honeypot: '',
            quantity: 1,
            errors: {},
            customerErrors: {},
            submitting: false,
            formError: '',
        };

        function variant() {
            return resolveVariant(state.product, state.selection);
        }

        function fields() {
            return formFields(state.product);
        }

        /** Ordering closed and this product withdrawn are different facts. */
        function canOrder() {
            return state.enabled && state.product.available !== false;
        }

        /**
         * Plain typing updates state and leaves the DOM alone; anything that can
         * change which fields exist repaints. Validation always re-derives from
         * the live answers, so a silent update can never be missed.
         */
        function setAnswer(key, value, structural) {
            state.answers = Object.assign({}, state.answers);
            state.answers[key] = value;
            if (!structural) return;
            if (state.errors[key]) {
                state.errors = Object.assign({}, state.errors);
                delete state.errors[key];
            }
            withPreservedFocus(paint);
        }

        function setSelection(sectionId, value) {
            state.selection = Object.assign({}, state.selection);
            state.selection[sectionId] = value;
            // A new variant can change which fields exist, so defaults are refreshed.
            state.answers = withFieldDefaults(fields(), state.answers, variant());
            withPreservedFocus(paint);
        }

        function setQuantity(value) {
            const next = clampQuantity(state.product, value);
            if (next === state.quantity) return;
            state.quantity = next;
            withPreservedFocus(paint);
        }

        /** Only rendered when the product is sold in more than one copy. */
        function quantityStepper() {
            const pricing = pricingOf(state.product);
            const presentation = presentationOf(state.product);
            const fieldLabel = presentation.quantity_field_label || 'Quantity';
            const max = quantityMax(state.product);
            const quantity = state.quantity;
            const eachLabel = pricing.additional_copy_price_label
                || (pricing.additional_copy_price_cents === undefined
                    ? '' : formatCad(pricing.additional_copy_price_cents));
            // The id is what lets the repaint hand focus back to the button
            // that was just pressed, so the count can be held down.
            const stepButton = (delta, glyph, action) => el('button', {
                type: 'button',
                id: 'ds-quantity-' + (delta < 0 ? 'down' : 'up'),
                class: 'ds-stepper-btn',
                'aria-label': action + ' ' + fieldLabel.toLowerCase(),
                disabled: !canOrder() || (delta < 0 ? quantity <= 1 : quantity >= max),
                onClick: () => setQuantity(quantity + delta),
            }, [icon(glyph)]);

            return el('div', { class: 'ds-quantity' }, [
                el('label', { class: 'ds-quantity-label', for: 'ds-quantity', text: fieldLabel }),
                el('div', { class: 'ds-stepper' }, [
                    stepButton(-1, 'fa-minus', 'Decrease'),
                    el('input', {
                        id: 'ds-quantity',
                        class: 'ds-stepper-input',
                        name: 'quantity',
                        type: 'number',
                        inputmode: 'numeric',
                        min: '1',
                        max: String(max),
                        step: '1',
                        value: String(quantity),
                        disabled: !canOrder(),
                        // An emptied box is someone retyping, not a request for none.
                        onInput: (event) => {
                            if (String(event.target.value).trim() === '') return;
                            setQuantity(event.target.value);
                        },
                        onBlur: (event) => { event.target.value = String(state.quantity); },
                    }),
                    stepButton(1, 'fa-plus', 'Increase'),
                ]),
                eachLabel ? el('p', { class: 'ds-help', text: 'Each additional copy is ' + eachLabel + '.' }) : null,
                el('p', { class: 'ds-help', text: 'Delivery and processing are charged once for the order.' }),
            ]);
        }

        /**
         * A card is priced by what it adds to the order, never by the price of
         * the whole combination it belongs to: "Regular Mail $15.00" next to
         * "Urgent $20.00" reads as $35.00 when the order costs $20.00.
         */
        function optionGroup(section, labelId) {
            const chosen = state.selection[section.id];
            const uplift = displayMode(state.product) === 'uplift';
            return el('div', {
                class: 'ds-options',
                role: 'radiogroup',
                'aria-labelledby': labelId,
            }, section.values.map((option) => {
                const value = option && option.value !== undefined ? option.value : option;
                const label = (option && option.label) || humanize(value);
                const selected = String(chosen) === String(value);
                const available = valueOffered(option)
                    && valueAvailable(state.product, state.selection, section.id, value);
                const included = uplift && upliftCents(option) === 0;
                const classes = 'ds-option'
                    + (selected ? ' is-selected' : '')
                    + (available ? '' : ' is-unavailable');
                return el('label', { class: classes }, [
                    el('input', {
                        type: 'radio',
                        id: 'ds-opt-' + section.id + '-' + String(value),
                        name: 'ds-opt-' + section.id,
                        value: String(value),
                        checked: selected,
                        // Options stay explorable when ordering is closed:
                        // reviewing the price is the whole point of that state.
                        disabled: !available,
                        onChange: () => setSelection(section.id, value),
                    }),
                    el('span', { class: 'ds-option-name', text: label }),
                    el('span', {
                        class: 'ds-option-price' + (available && included ? ' is-included' : ''),
                        text: available ? optionPriceText(state.product, option) : 'Not available',
                    }),
                ]);
            }));
        }

        function customerField(key, label, type, autocomplete, required) {
            const id = 'ds-customer-' + key;
            const error = state.customerErrors[key];
            return el('div', { class: 'ds-field' }, [
                el('label', { for: id }, [
                    label, required ? el('span', { class: 'ds-required', 'aria-hidden': 'true', text: '*' }) : null,
                ]),
                el('input', {
                                        id: id,
                    name: key,
                    type: type,
                    autocomplete: autocomplete,
                    value: state.customer[key],
                    'aria-invalid': error ? 'true' : null,
                    'aria-describedby': error ? id + '-error' : null,
                    disabled: !canOrder(),
                    onInput: (event) => { state.customer[key] = event.target.value; },
                }),
                error ? el('p', { class: 'ds-error', id: id + '-error', role: 'alert', text: error }) : null,
            ]);
        }

        function validateCustomer() {
            const errors = {};
            if (!state.customer.first_name.trim()) errors.first_name = 'Enter your first name.';
            if (!state.customer.last_name.trim()) errors.last_name = 'Enter your last name.';
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.customer.email.trim())) errors.email = 'Enter a valid email address.';
            return errors;
        }

        /**
         * Every row carries money. A row that pairs a category with a value and
         * no amount ("Delivery method ... Pickup") is the ambiguity this summary
         * exists to remove.
         */
        function docket() {
            const product = state.product;
            const chosen = variant();
            const pricing = pricingOf(product);
            const presentation = presentationOf(product);
            const quantity = clampQuantity(product, state.quantity);
            const name = product.name || 'Document service';
            const baseCents = Number.isFinite(Number(pricing.base_price_cents))
                ? Number(pricing.base_price_cents)
                : variantPriceCents(chosen);
            const eachLabel = pricing.base_price_label || formatCad(baseCents);
            // The catalogue code identifies a row for staff, not a purchase for
            // a customer, so it appears only when MCC asks for it.
            const code = presentation.show_product_code === true ? String(product.product_id || '') : '';
            const optionEntries = optionSections(product).map((section) => {
                const value = sectionValue(section, state.selection[section.id]);
                if (!value) return null;
                const scope = String(section.label || humanize(section.id)).toLowerCase();
                return {
                    label: (value.label || humanize(value.value)) + ' (' + scope + ')',
                    value: upliftText(value),
                    muted: upliftCents(value) === 0,
                };
            }).filter(Boolean);

            return el('div', { class: 'ds-rail' }, [
                el('div', { class: 'ds-docket' }, [
                    el('div', { class: 'ds-docket-head' }, [
                        el('h2', { text: presentation.summary_heading || 'Order details' }),
                        code ? el('span', { class: 'ds-docket-ref', text: code }) : null,
                    ]),
                    el('div', { class: 'ds-line' }, [
                        el('div', { class: 'ds-line-label' }, [
                            quantity > 1 ? quantity + ' \u00d7 ' + name : name,
                            quantity > 1 ? el('span', { text: eachLabel + ' each' }) : null,
                        ]),
                        el('div', {
                            class: 'ds-line-value',
                            text: chosen ? formatCad(baseCents * quantity) : '--',
                        }),
                    ]),
                    docketLines(optionEntries),
                    totalRow(orderTotalCents(product, chosen, quantity)),
                    taxNoteBlock(product),
                    surchargeNote(),
                ]),
                el('div', { class: 'ds-rail-actions' }, [
                    el('button', {
                        type: 'button',
                        class: 'btn-solid-gold',
                        disabled: !canOrder() || !chosen || state.submitting,
                        onClick: submit,
                    }, [
                        state.submitting ? el('span', { class: 'ds-spinner' }) : icon('fa-lock'),
                        el('span', { text: state.submitting ? 'Placing order...' : 'Place order and pay' }),
                    ]),
                    el('p', {
                        class: 'ds-docket-foot',
                        text: 'You will review the order and pay through the secure Moneris window on the next screen.',
                    }),
                ]),
                state.formError ? el('div', { class: 'ds-rail-actions' }, [
                    noticeBlock('red', 'fa-triangle-exclamation', 'Your order was not placed', state.formError),
                ]) : null,
            ]);
        }

        async function submit() {
            const chosen = variant();
            if (!chosen || !canOrder() || state.submitting) return;
            const list = fields();
            const answers = withFieldDefaults(list, state.answers, chosen);
            state.answers = answers;
            const answerErrors = validateAnswers(list, answers, chosen);
            const customerErrors = validateCustomer();
            state.errors = answerErrors;
            state.customerErrors = customerErrors;
            state.formError = '';

            if (Object.keys(answerErrors).length || Object.keys(customerErrors).length) {
                state.formError = 'Check the highlighted fields and try again.';
                paint();
                const firstInvalid = host.querySelector('[aria-invalid="true"], .ds-check.is-invalid');
                if (firstInvalid) firstInvalid.scrollIntoView({ block: 'center', behavior: 'smooth' });
                return;
            }

            state.submitting = true;
            paint();

            const payload = {
                variant_id: chosen.id,
                quantity: clampQuantity(state.product, state.quantity),
                form_answers: submittableAnswers(list, answers, chosen),
            };

            try {
                await request('/products/' + encodeURIComponent(slug) + '/validate', { method: 'POST', body: payload });
            } catch (error) {
                state.submitting = false;
                if (error.fieldErrors) {
                    state.errors = Object.assign({}, state.errors, error.fieldErrors);
                    state.formError = 'MCC could not accept some answers. Check the highlighted fields.';
                } else {
                    state.formError = error.message;
                }
                paint();
                return;
            }

            let created;
            try {
                created = (await request('/orders', {
                    method: 'POST',
                    body: Object.assign({}, payload, {
                        product_id: state.product.id,
                        customer: {
                            first_name: state.customer.first_name.trim(),
                            last_name: state.customer.last_name.trim(),
                            email: state.customer.email.trim(),
                            phone: state.customer.phone.trim(),
                        },
                        acknowledgements: acknowledgementMap(list, answers, chosen),
                        company_website: state.honeypot,
                    }),
                })).data;
            } catch (error) {
                state.submitting = false;
                if (error.fieldErrors) {
                    state.errors = Object.assign({}, state.errors, error.fieldErrors);
                    state.formError = 'MCC could not accept some answers. Check the highlighted fields.';
                } else {
                    state.formError = error.message;
                }
                paint();
                return;
            }

            // The honeypot path returns a success shape with no order.
            if (!created || !created.order || !created.order.id) {
                render(host, el('div', { class: 'ds-panel' }, [
                    el('h2', { text: 'Your request was received' }),
                    el('p', { class: 'ds-lede', text: 'MCC has your request. If you expected to pay now, email admin@metropolitancollege.ca and we will finish the order with you.' }),
                ]));
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }

            const token = created.guest_access_token || '';
            const saved = rememberOrder(created.order, token);
            try {
                window.sessionStorage.setItem('mcc.ds.new-order', created.order.id);
                if (token) window.sessionStorage.setItem('mcc.ds.token.' + created.order.id, token);
            } catch (error) { /* private browsing: the key is still shown on the next screen */ }

            if (!saved && token) {
                // Storage is unavailable, so the key must be read before leaving.
                render(host, accessKeyHandoff(created.order, token));
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }
            window.location.href = ORDER_PATH + encodeURIComponent(created.order.id);
        }

        function accessKeyHandoff(order, token) {
            return el('div', { class: 'ds-key' }, [
                el('h2', { text: 'Save your access key before you continue' }),
                el('p', {
                    text: 'Order ' + (order.order_number || order.id) + ' was created, but this browser will not let MCC store the key for you. '
                        + 'Copy it now: it is shown once and it is the only way back into this order.',
                }),
                keyValueRow(token),
                el('div', { class: 'ds-panel-actions' }, [
                    el('a', { class: 'btn-solid-gold', href: ORDER_PATH + encodeURIComponent(order.id) }, [
                        el('span', { text: 'Continue to payment' }), icon('fa-arrow-right'),
                    ]),
                ]),
            ]);
        }

        function paint() {
            const product = state.product;
            const chosen = variant();
            const list = fields();
            const sections = optionSections(product);
            let step = 0;

            const stepHead = (title, description, titleId) => el('div', { class: 'ds-step-head' }, [
                el('span', { class: 'ds-step-index', text: String(++step).padStart(2, '0') }),
                el('div', { class: 'ds-step-title-wrap' }, [
                    el('h2', { id: titleId || null, text: title }),
                    description ? el('p', { text: description }) : null,
                ]),
            ]);

            const column = el('div', {}, [
                state.enabled ? null : closedBlock('catalogue'),
                product.available === false
                    ? noticeBlock('gold', 'fa-circle-info', 'This service is not open for orders',
                        'MCC has paused new orders for this document. Email admin@metropolitancollege.ca and we will help you directly.')
                    : null,
                // A single-copy product has no quantity step, and the numbering
                // closes up behind it rather than starting at 02.
                quantityOffered(product) ? el('section', { class: 'ds-step' }, [
                    stepHead(presentationOf(product).quantity_section_label || 'Quantity'),
                    quantityStepper(),
                ]) : null,
                // Section order, labels and count all come from the portal.
                sections.map((section, index) => {
                    const labelId = 'ds-section-' + section.id;
                    return el('section', { class: 'ds-step' }, [
                        stepHead(section.label || humanize(section.id), section.description || null, labelId),
                        optionGroup(section, labelId),
                        chosen || index !== sections.length - 1
                            ? null
                            : noticeBlock('red', 'fa-triangle-exclamation', 'That combination is not offered',
                                'Pick a different combination to see its price.'),
                    ]);
                }),
                el('section', { class: 'ds-step' }, [
                    stepHead('Your contact details', 'MCC uses these to confirm the order and send your receipt.'),
                    el('div', { class: 'ds-grid' }, [
                        customerField('first_name', 'First name', 'text', 'given-name', true),
                        customerField('last_name', 'Last name', 'text', 'family-name', true),
                        customerField('email', 'Email address', 'email', 'email', true),
                        customerField('phone', 'Phone number', 'tel', 'tel', false),
                    ]),
                ]),
                list.length ? el('section', { class: 'ds-step' }, [
                    stepHead('Document details', 'These questions come from the MCC registrar and change with the options you picked.'),
                    buildForm({
                        fields: list,
                        answers: state.answers,
                        variant: chosen,
                        errors: state.errors,
                        disabled: !canOrder(),
                        getAnswer: (key) => state.answers[key],
                        onChange: setAnswer,
                    }),
                ]) : null,
                el('section', { class: 'ds-step' }, [
                    stepHead('Place the order', 'MCC creates the order first, then opens the secure Moneris payment window.'),
                    product.refund_policy
                        ? noticeBlock('gold', 'fa-circle-info', 'Refund policy', product.refund_policy)
                        : null,
                    product.processing_information
                        ? el('p', { class: 'ds-help', text: product.processing_information })
                        : null,
                    // Honeypot: a real person never sees or fills this.
                    el('div', { class: 'ds-honeypot', 'aria-hidden': 'true' }, [
                        el('label', { for: 'company_website', text: 'Company website' }),
                        el('input', {
                            id: 'company_website',
                            name: 'company_website',
                            type: 'text',
                            tabindex: '-1',
                            autocomplete: 'off',
                            value: state.honeypot,
                            onInput: (event) => { state.honeypot = event.target.value; },
                        }),
                    ]),
                ]),
            ]);

            render(host, [
                el('div', { class: 'ds-layout' }, [column, docket()]),
            ]);
        }

        (async function load() {
            render(host, loadingBlock('Loading this service...'));
            let payload;
            try {
                payload = (await request('/products/' + encodeURIComponent(slug))).data;
            } catch (error) {
                if (error.status === 404) {
                    render(host, el('div', { class: 'ds-empty' }, [
                        el('h2', { text: 'This service is not available here' }),
                        el('p', { text: 'It may have been withdrawn, or it may only be orderable from the student portal.' }),
                        el('div', { class: 'ds-panel-actions', style: 'justify-content:center;' }, [
                            el('a', { class: 'btn-outline-gold', href: CATALOGUE_PATH, text: 'Back to services' }),
                            el('a', {
                                class: 'btn-solid-gold',
                                href: PORTAL_SERVICE_BASE + encodeURIComponent(slug),
                                rel: 'noopener',
                                text: 'Open the portal',
                            }),
                        ]),
                    ]));
                    return;
                }
                render(host, errorBlock(error.message, () => mountProduct(host, slug)));
                return;
            }

            state.product = payload.product || {};
            state.enabled = payload.enabled !== false;
            state.selection = defaultSelection(state.product);
            state.answers = withFieldDefaults(formFields(state.product), {}, variant());
            state.quantity = 1;

            const heading = document.querySelector('[data-ds-product-title]');
            if (heading) heading.textContent = state.product.name || 'Document service';
            const summary = document.querySelector('[data-ds-product-summary]');
            if (summary) summary.textContent = state.product.description || '';
            const crumb = document.querySelector('[data-ds-product-crumb]');
            if (crumb) crumb.textContent = state.product.name || 'Service';
            if (state.product.name) document.title = state.product.name + ' | Document Services | MCC';

            paint();
        }());
    }

    /* ---------------------------------------------------------- Order page -- */

    function keyValueRow(token) {
        const code = el('code', { text: token });
        const copy = el('button', { type: 'button', class: 'btn-text-question', text: 'Copy' });
        copy.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(token);
                copy.textContent = 'Copied';
            } catch (error) {
                const range = document.createRange();
                range.selectNodeContents(code);
                const selection = window.getSelection();
                selection.removeAllRanges();
                selection.addRange(range);
                copy.textContent = 'Select and copy';
            }
            window.setTimeout(() => { copy.textContent = 'Copy'; }, 2500);
        });
        return el('div', { class: 'ds-key-value' }, [code, copy]);
    }

    const FULFILLMENT_SEQUENCE = [
        'verifying_records', 'approved_for_processing', 'preparing', 'ready_for_pickup', 'shipped', 'delivered', 'completed',
    ];

    function timelineFor(order, tracking) {
        const paid = ['paid', 'partially_refunded', 'refunded'].indexOf(order.payment_status) !== -1;
        const status = (tracking && tracking.status) || order.fulfillment_status || 'not_started';
        const stageIndex = FULFILLMENT_SEQUENCE.indexOf(status);
        const entries = [
            { label: 'Order received', meta: formatDate(order.created_at, true), state: 'done' },
            {
                label: paid ? 'Payment verified by MCC' : 'Payment pending',
                meta: paid ? 'Confirmed with Moneris' : 'Complete payment to start processing',
                state: paid ? 'done' : 'current',
            },
        ];
        if (paid) {
            FULFILLMENT_SEQUENCE.forEach((stage, index) => {
                if (stage === 'completed' && status !== 'completed') return;
                if (index > stageIndex + 1) return;
                entries.push({
                    label: statusMeta('fulfillment', stage).label,
                    meta: index === stageIndex ? 'Current stage' : '',
                    state: index < stageIndex ? 'done' : index === stageIndex ? 'current' : 'pending',
                });
            });
        }
        if (status === 'unable_to_fulfill') {
            entries.push({ label: 'MCC could not fulfill this order', meta: 'Contact the college', state: 'current' });
        }
        return el('ol', { class: 'ds-timeline' }, entries.map((entry) => el('li', {
            class: entry.state === 'done' ? 'is-done' : entry.state === 'current' ? 'is-current' : 'is-pending',
        }, [
            el('div', { class: 'ds-timeline-label', text: entry.label }),
            entry.meta ? el('div', { class: 'ds-timeline-meta', text: entry.meta }) : null,
        ])));
    }

    function answerValueText(value) {
        if (value === true) return 'Accepted';
        if (value === false) return 'Not accepted';
        if (value && typeof value === 'object') {
            return ['address_1', 'address_2', 'city', 'province', 'postal_code', 'country']
                .map((key) => value[key]).filter(Boolean).join(', ');
        }
        if (value === undefined || value === null || value === '') return '--';
        const text = String(value);
        // Stored select values are machine tokens. Anything a person typed keeps
        // its own capitalisation, punctuation, and spacing untouched.
        return /^[a-z0-9]+(_[a-z0-9]+)*$/.test(text) ? humanize(text) : text;
    }

    function orderDetails(order) {
        const items = Array.isArray(order.items) ? order.items : [];
        return items.map((item) => {
            const answers = item.form_answers && typeof item.form_answers === 'object' ? item.form_answers : {};
            const rows = [];
            Object.keys(answers).forEach((key) => {
                rows.push(el('dt', { text: humanize(key) }));
                rows.push(el('dd', { text: answerValueText(answers[key]) }));
            });
            return el('section', { class: 'ds-panel' }, [
                el('h2', { text: item.product_name || 'Document service' }),
                el('dl', { class: 'ds-defs' }, [
                    el('dt', { text: 'Option' }),
                    el('dd', { text: item.variant_name || item.sku || '--' }),
                    el('dt', { text: 'Reference' }),
                    el('dd', { text: item.sku || item.product_number || '--' }),
                    rows,
                ]),
            ]);
        });
    }

    function shippingUpgradePanel(context) {
        const upgrade = context.upgrade;
        const order = context.order;
        const token = context.token;
        if (!upgrade || upgrade.eligible !== true) return null;
        const products = Array.isArray(upgrade.items) ? upgrade.items : [];
        if (!products.length) return null;

        const state = { productId: '', variantId: '', answers: {}, errors: {}, busy: false, error: '' };
        const panel = el('section', { class: 'ds-panel' });

        function currentProduct() {
            return products.find((item) => item.id === state.productId) || null;
        }

        async function submit() {
            const product = currentProduct();
            if (!product || !state.variantId || state.busy) return;
            const chosen = activeVariants(product).find((item) => item.id === state.variantId);
            const list = formFields(product);
            const answers = withFieldDefaults(list, state.answers, chosen);
            const errors = validateAnswers(list, answers, chosen);
            state.errors = errors;
            state.error = '';
            if (Object.keys(errors).length) {
                paint();
                return;
            }
            state.busy = true;
            paint();
            try {
                const created = (await request('/orders/' + encodeURIComponent(order.id) + '/shipping-upgrade', {
                    method: 'POST',
                    token: token,
                    body: {
                        product_id: product.id,
                        variant_id: state.variantId,
                        parent_item_id: upgrade.parent_item_id || '',
                        form_answers: submittableAnswers(list, answers, chosen),
                        acknowledgements: acknowledgementMap(list, answers, chosen),
                    },
                })).data;
                if (created && created.order && created.order.id) {
                    rememberOrder(created.order, created.guest_access_token || '');
                    try {
                        window.sessionStorage.setItem('mcc.ds.new-order', created.order.id);
                    } catch (error) { /* the key is still shown on the next screen */ }
                    window.location.href = ORDER_PATH + encodeURIComponent(created.order.id);
                    return;
                }
                state.busy = false;
                state.error = 'MCC could not create the upgrade order. Try again in a moment.';
                paint();
            } catch (error) {
                state.busy = false;
                state.error = error.message;
                if (error.fieldErrors) state.errors = Object.assign({}, state.errors, error.fieldErrors);
                paint();
            }
        }

        function paint() {
            const product = currentProduct();
            const list = product ? formFields(product) : [];
            const chosen = product ? activeVariants(product).find((item) => item.id === state.variantId) : null;
            render(panel, [
                el('h2', { text: 'Upgrade the delivery on this order' }),
                el('p', {
                    class: 'ds-lede',
                    text: 'This order ships by Regular Mail. You can add a faster or tracked service while it is still with the registrar.',
                }),
                el('div', { class: 'ds-options', style: 'margin-top:1.25rem;' }, products.map((item) => (
                    activeVariants(item).map((option) => {
                        const selected = state.variantId === option.id;
                        return el('label', { class: 'ds-option' + (selected ? ' is-selected' : '') }, [
                            el('input', {
                                type: 'radio',
                                name: 'ds-upgrade',
                                checked: selected,
                                onChange: () => {
                                    state.productId = item.id;
                                    state.variantId = option.id;
                                    state.answers = withFieldDefaults(formFields(item), state.answers, option);
                                    paint();
                                },
                            }),
                            el('span', { class: 'ds-option-name', text: option.name || item.name || 'Upgrade' }),
                            el('span', { class: 'ds-option-price', text: formatCad(variantPriceCents(option)) }),
                        ]);
                    })
                ))),
                list.length && chosen ? buildForm({
                    fields: list,
                    answers: state.answers,
                    variant: chosen,
                    errors: state.errors,
                    getAnswer: (key) => state.answers[key],
                    onChange: (key, value, structural) => {
                        state.answers = Object.assign({}, state.answers);
                        state.answers[key] = value;
                        if (structural) withPreservedFocus(paint);
                    },
                }) : null,
                state.error ? el('p', { class: 'ds-error', role: 'alert', text: state.error }) : null,
                el('div', { class: 'ds-panel-actions' }, [
                    el('button', {
                        type: 'button',
                        class: 'btn-solid-gold',
                        disabled: !state.variantId || state.busy,
                        onClick: submit,
                    }, [
                        state.busy ? el('span', { class: 'ds-spinner' }) : icon('fa-truck-fast'),
                        el('span', { text: state.busy ? 'Creating the upgrade...' : 'Add this upgrade' }),
                    ]),
                ]),
                el('p', { class: 'ds-docket-foot', text: 'The upgrade is a separate order with its own payment and its own access key.' }),
            ]);
        }

        paint();
        return panel;
    }

    function mountOrder(host, orderId) {
        let token = tokenFor(orderId);
        if (!token) {
            try {
                token = window.sessionStorage.getItem('mcc.ds.token.' + orderId) || '';
            } catch (error) { token = ''; }
        }
        let justCreated = false;
        try {
            justCreated = window.sessionStorage.getItem('mcc.ds.new-order') === orderId;
        } catch (error) { justCreated = false; }

        let modal = null;

        if (!token) {
            render(host, el('div', { class: 'ds-panel' }, [
                el('h2', { text: 'This order needs its access key' }),
                el('p', {
                    class: 'ds-lede',
                    text: 'MCC does not use accounts for guest orders. The access key issued when you placed the order is the only way in, '
                        + 'and this browser does not have it saved.',
                }),
                el('div', { class: 'ds-panel-actions' }, [
                    el('a', { class: 'btn-solid-gold', href: LOOKUP_PATH + '?id=' + encodeURIComponent(orderId) }, [
                        el('span', { text: 'Enter my access key' }), icon('fa-arrow-right'),
                    ]),
                    el('a', { class: 'btn-outline-gold', href: CATALOGUE_PATH, text: 'Back to services' }),
                ]),
            ]));
            return;
        }

        async function load(scrollTop) {
            render(host, loadingBlock('Loading your order...'));
            let payload;
            try {
                payload = (await request('/orders/' + encodeURIComponent(orderId), { token: token })).data;
            } catch (error) {
                if (error.status === 404) {
                    render(host, el('div', { class: 'ds-empty' }, [
                        el('h2', { text: 'That order and key do not match' }),
                        el('p', { text: 'Check the order number and access key, or contact MCC at admin@metropolitancollege.ca.' }),
                        el('div', { class: 'ds-panel-actions', style: 'justify-content:center;' }, [
                            el('a', { class: 'btn-solid-gold', href: LOOKUP_PATH, text: 'Try the order lookup' }),
                        ]),
                    ]));
                    return;
                }
                render(host, errorBlock(error.message, () => load(false)));
                return;
            }
            paint(payload);
            if (scrollTop) window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        function paint(payload) {
            const order = payload.order || {};
            const tracking = payload.tracking || {};
            const enabled = payload.enabled !== false;
            const paid = ['paid', 'partially_refunded', 'refunded'].indexOf(order.payment_status) !== -1;
            const underReview = order.payment_status === 'review_required' || order.payment_review_required === true;
            const canPay = enabled && !paid && !underReview
                && order.can_retry_payment === true && Boolean(order.checkout_idempotency_key);

            const heading = document.querySelector('[data-ds-order-number]');
            if (heading) heading.textContent = order.order_number || orderId;
            document.title = (order.order_number || 'Order') + ' | Document Services | MCC';

            const statusNotice = paid
                ? noticeBlock('emerald', 'fa-circle-check', 'Payment verified',
                    'MCC confirmed this payment directly with Moneris. Your receipt and invoice are available below.')
                : underReview
                    ? noticeBlock('red', 'fa-triangle-exclamation', 'This payment is under review',
                        'MCC could not confirm the last payment result automatically, so staff are reconciling it with Moneris. '
                        + 'Do not start another payment. We will email you once it settles.')
                    : order.payment_status === 'failed'
                        ? noticeBlock('red', 'fa-circle-xmark', 'The last payment was declined',
                            'No charge was made. You can start a new payment when you are ready.')
                        : noticeBlock('gold', 'fa-clock', 'This order is waiting for payment',
                            'Your document enters the registrar queue once the payment is verified.');

            const payButton = el('button', { type: 'button', class: 'btn-solid-gold', disabled: !canPay }, [
                icon('fa-lock'), el('span', { text: paid ? 'Paid' : 'Pay securely with Moneris' }),
            ]);
            payButton.addEventListener('click', () => {
                if (!canPay) return;
                if (!modal) {
                    modal = createPaymentModal({
                        orderId: orderId,
                        token: token,
                        idempotencyKey: order.checkout_idempotency_key,
                        onVerified: () => { load(true); },
                        onSettled: () => { /* the order is refreshed when the window closes */ },
                        onClose: () => { load(false); },
                    });
                }
                modal.open({ idempotencyKey: order.checkout_idempotency_key, token: token });
            });

            const documentButtons = el('div', { class: 'ds-rail-actions' }, ['receipt', 'invoice'].map((kind) => {
                const button = el('button', { type: 'button', class: 'btn-outline-gold' }, [
                    icon('fa-file-pdf'), el('span', { text: 'Download ' + kind }),
                ]);
                button.addEventListener('click', async () => {
                    button.disabled = true;
                    try {
                        await downloadOrderDocument(orderId, kind, token);
                    } catch (error) {
                        button.lastChild.textContent = error.message;
                    } finally {
                        window.setTimeout(() => {
                            button.disabled = false;
                            button.lastChild.textContent = 'Download ' + kind;
                        }, 2500);
                    }
                });
                return button;
            }));

            const subtotal = Number(order.subtotal_cents || 0);
            const rail = el('div', { class: 'ds-rail' }, [
                el('div', { class: 'ds-docket' }, [
                    el('div', { class: 'ds-docket-head' }, [
                        el('h2', { text: 'Order docket' }),
                        el('span', { class: 'ds-docket-ref', text: order.order_number || '' }),
                    ]),
                    docketLines((Array.isArray(order.items) ? order.items : []).map((item) => ({
                        label: item.product_name || 'Document service',
                        detail: item.variant_name || item.sku || '',
                        value: formatCad(item.total_cents !== undefined ? item.total_cents : item.unit_price_cents),
                    }))),
                    docketLines([{ label: 'Subtotal', value: formatCad(subtotal) }]),
                    taxLine(order.tax_amount_cents || 0),
                    totalRow(order.total_cents || 0),
                    surchargeNote(),
                ]),
                el('div', { class: 'ds-rail-actions' }, [
                    paid ? null : payButton,
                    canPay ? el('p', {
                        class: 'ds-docket-foot',
                        text: 'The card form is hosted by Moneris. MCC never sees your card number or security code.',
                    }) : null,
                    !enabled && !paid ? closedBlock('order') : null,
                ]),
                paid ? documentButtons : null,
                el('div', { class: 'ds-rail-actions' }, [
                    el('button', {
                        type: 'button', class: 'btn-outline-gold', onClick: () => load(false),
                    }, [icon('fa-rotate-right'), el('span', { text: 'Check for updates' })]),
                ]),
            ]);

            const trackingRows = [];
            if (tracking.carrier) {
                trackingRows.push(el('dt', { text: 'Carrier' }), el('dd', { text: tracking.carrier }));
            }
            if (tracking.tracking_number) {
                trackingRows.push(el('dt', { text: 'Tracking number' }));
                trackingRows.push(el('dd', {}, [
                    tracking.tracking_url
                        ? el('a', { class: 'subtle-link', href: tracking.tracking_url, rel: 'noopener', target: '_blank', text: tracking.tracking_number })
                        : el('span', { text: tracking.tracking_number }),
                ]));
            }
            if (tracking.shipped_at) {
                trackingRows.push(el('dt', { text: 'Shipped' }), el('dd', { text: formatDate(tracking.shipped_at, true) }));
            }
            if (tracking.estimated_delivery) {
                trackingRows.push(el('dt', { text: 'Estimated delivery' }), el('dd', { text: formatDate(tracking.estimated_delivery) }));
            }
            if (tracking.delivered_at) {
                trackingRows.push(el('dt', { text: 'Delivered' }), el('dd', { text: formatDate(tracking.delivered_at, true) }));
            }

            const column = el('div', {}, [
                el('div', { class: 'ds-badge-row', style: 'margin-bottom:1.25rem;' }, [
                    badge('order', order.order_status),
                    badge('payment', order.payment_status),
                    badge('fulfillment', tracking.status || order.fulfillment_status),
                ]),
                statusNotice,
                token ? el('section', { class: 'ds-key', style: 'margin-top:1.25rem;' }, [
                    el('h2', { text: justCreated ? 'Save your access key now' : 'Your access key' }),
                    el('p', {
                        text: justCreated
                            ? 'MCC issued this key once, when the order was created, and saved it in this browser. '
                            + 'Copy it somewhere safe: if you clear your browser data or switch devices, this key is the only way back into the order.'
                            : 'Keep this key. Together with the order number it is the only way to reopen this order from another browser or device.',
                    }),
                    keyValueRow(token),
                    el('p', { class: 'ds-docket-foot' }, [
                        'Order number ',
                        el('span', { text: order.order_number || orderId }),
                        '. Reopen it any time from the ',
                        el('a', { class: 'subtle-link', href: LOOKUP_PATH, text: 'order lookup' }),
                        '.',
                    ]),
                ]) : null,
                el('section', { class: 'ds-panel', style: 'margin-top:1.25rem;' }, [
                    el('h2', { text: 'Progress' }),
                    timelineFor(order, tracking),
                ]),
                trackingRows.length ? el('section', { class: 'ds-panel' }, [
                    el('h2', { text: 'Delivery' }),
                    el('dl', { class: 'ds-defs' }, trackingRows),
                ]) : null,
                orderDetails(order),
                el('section', { class: 'ds-panel' }, [
                    el('h2', { text: 'Order record' }),
                    el('dl', { class: 'ds-defs' }, [
                        el('dt', { text: 'Order number' }),
                        el('dd', { text: order.order_number || orderId }),
                        el('dt', { text: 'Placed' }),
                        el('dd', { text: formatDate(order.created_at, true) }),
                        el('dt', { text: 'Ordered by' }),
                        el('dd', {
                            text: [(order.customer || {}).first_name, (order.customer || {}).last_name]
                                .filter(Boolean).join(' ') || '--',
                        }),
                        el('dt', { text: 'Contact email' }),
                        el('dd', { text: (order.customer || {}).email || '--' }),
                        el('dt', { text: 'Recipient' }),
                        el('dd', { text: (order.recipient || {}).name || '--' }),
                    ]),
                ]),
                shippingUpgradePanel({ upgrade: payload.shipping_upgrade, order: order, token: token }),
            ]);

            render(host, el('div', { class: 'ds-layout' }, [column, rail]));

            if (justCreated) {
                justCreated = false;
                try {
                    window.sessionStorage.removeItem('mcc.ds.new-order');
                } catch (error) { /* nothing to clean up */ }
            }
        }

        load(false);
    }

    /* --------------------------------------------------------- Lookup page -- */

    function mountLookup(host) {
        const params = new URLSearchParams(window.location.search);
        const state = { id: params.get('id') || '', key: '', busy: false, error: '' };

        async function submit(event) {
            if (event) event.preventDefault();
            if (state.busy) return;
            const id = state.id.trim();
            const key = state.key.trim();
            if (!id || !key) {
                state.error = 'Enter both the order number and the access key.';
                paint();
                return;
            }
            state.busy = true;
            state.error = '';
            paint();
            try {
                const payload = (await request('/orders/' + encodeURIComponent(id), { token: key })).data;
                rememberOrder(payload.order || { id: id }, key);
                window.location.href = ORDER_PATH + encodeURIComponent(id);
            } catch (error) {
                state.busy = false;
                state.error = error.status === 404
                    ? 'No order matches that order ID and access key. Check both and try again.'
                    : error.message;
                paint();
            }
        }

        function paint() {
            const saved = recentOrders();
            render(host, [
                el('form', { class: 'ds-panel', onSubmit: submit, novalidate: true }, [
                    el('h2', { text: 'Open an existing order' }),
                    el('p', {
                        class: 'ds-lede',
                        text: 'Guest orders have no account. Enter the order ID from your confirmation email and the access key that was '
                            + 'issued when you placed the order.',
                    }),
                    el('div', { class: 'ds-grid', style: 'margin-top:1.5rem;' }, [
                        el('div', { class: 'ds-field is-wide' }, [
                            el('label', { for: 'ds-lookup-id' }, [
                                'Order ID', el('span', { class: 'ds-required', 'aria-hidden': 'true', text: '*' }),
                            ]),
                            el('input', {
                                                                id: 'ds-lookup-id',
                                name: 'order_id',
                                type: 'text',
                                autocomplete: 'off',
                                spellcheck: 'false',
                                value: state.id,
                                onInput: (event) => { state.id = event.target.value; },
                            }),
                            el('p', { class: 'ds-help', text: 'The long identifier in your confirmation email, not the ORD- number.' }),
                        ]),
                        el('div', { class: 'ds-field is-wide' }, [
                            el('label', { for: 'ds-lookup-key' }, [
                                'Access key', el('span', { class: 'ds-required', 'aria-hidden': 'true', text: '*' }),
                            ]),
                            el('input', {
                                                                id: 'ds-lookup-key',
                                name: 'access_key',
                                type: 'text',
                                autocomplete: 'off',
                                spellcheck: 'false',
                                value: state.key,
                                onInput: (event) => { state.key = event.target.value; },
                            }),
                        ]),
                    ]),
                    state.error ? el('p', { class: 'ds-error', role: 'alert', text: state.error }) : null,
                    el('div', { class: 'ds-panel-actions' }, [
                        el('button', { type: 'submit', class: 'btn-solid-gold', disabled: state.busy }, [
                            state.busy ? el('span', { class: 'ds-spinner' }) : icon('fa-key'),
                            el('span', { text: state.busy ? 'Checking...' : 'Open my order' }),
                        ]),
                        el('a', { class: 'btn-outline-gold', href: CATALOGUE_PATH, text: 'Back to services' }),
                    ]),
                    el('p', {
                        class: 'ds-docket-foot',
                        text: 'Lost the key? MCC cannot re-issue it, because it is never stored in a readable form. '
                            + 'Email admin@metropolitancollege.ca with your order number and we will help you directly.',
                    }),
                ]),
                saved.length ? el('section', { class: 'ds-panel' }, [
                    el('h2', { text: 'Saved on this browser' }),
                    el('div', { class: 'ds-saved' }, saved.map((item) => el('a', {
                        class: 'ds-saved-item',
                        href: ORDER_PATH + encodeURIComponent(item.id),
                    }, [
                        el('span', {}, [
                            el('span', { class: 'ds-saved-number', text: item.order_number || item.id }),
                            el('span', { class: 'ds-saved-meta', text: item.title + ' - ' + formatDate(item.created_at) }),
                        ]),
                        icon('fa-arrow-right'),
                    ]))),
                ]) : null,
            ]);
        }

        paint();
    }

    /* ------------------------------------------------------------- Bootstrap */

    function orderIdFromLocation() {
        const params = new URLSearchParams(window.location.search);
        const fromQuery = params.get('id');
        if (fromQuery) return fromQuery;
        const match = /\/document-services\/order\/([^/?#]+)/.exec(window.location.pathname);
        return match ? decodeURIComponent(match[1]) : '';
    }

    function productSlugFromLocation() {
        const params = new URLSearchParams(window.location.search);
        const fromQuery = params.get('slug');
        if (fromQuery) return fromQuery;
        const match = /\/document-services\/([^/?#]+)/.exec(window.location.pathname);
        const slug = match ? decodeURIComponent(match[1]) : '';
        return slug === 'order' || slug === 'lookup' ? '' : slug;
    }

    function start() {
        const main = document.querySelector('[data-ds-page]');
        if (!main) return;
        const host = main.querySelector('[data-ds-root]') || main;
        const page = main.getAttribute('data-ds-page');

        if (page === 'catalogue') {
            mountCatalogue(host);
            return;
        }
        if (page === 'product') {
            const slug = productSlugFromLocation();
            if (!slug) {
                window.location.replace(CATALOGUE_PATH);
                return;
            }
            mountProduct(host, slug);
            return;
        }
        if (page === 'order') {
            const id = orderIdFromLocation();
            if (!id) {
                window.location.replace(LOOKUP_PATH);
                return;
            }
            mountOrder(host, id);
            return;
        }
        if (page === 'lookup') mountLookup(host);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
    else start();

    // Exposed only so the reveal helper stays reachable for future sections.
    window.MCCDocumentServices = { revealIn: revealIn };
}());
