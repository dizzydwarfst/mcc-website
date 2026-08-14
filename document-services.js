/**
 * Public Document Services catalogue.
 *
 * The MCC Portal API is the sole source of product visibility, descriptions,
 * variants, and prices. Published content remains visible while the global
 * ordering gate is closed; the gate controls actions, not discovery.
 */
(function initDocumentServicesCatalogue() {
    'use strict';

    const DEFAULT_API_BASE = 'https://lms-system-backend-lake.vercel.app/api';
    const API_BASE = String(window.MCC_DOCUMENT_SERVICES_API_BASE || DEFAULT_API_BASE).replace(/\/$/, '');
    const REQUEST_TIMEOUT_MS = 15000;

    function formatCad(cents) {
        const amount = Number(cents);
        if (!Number.isFinite(amount)) return 'Price unavailable';
        return new Intl.NumberFormat('en-CA', {
            style: 'currency',
            currency: 'CAD',
            currencyDisplay: 'narrowSymbol',
            minimumFractionDigits: 2,
        }).format(Math.trunc(amount) / 100);
    }

    function priceRange(variants) {
        const prices = variants
            .map((variant) => Number(variant && variant.price_cents))
            .filter(Number.isFinite)
            .sort((left, right) => left - right);
        if (!prices.length) return 'Price unavailable';
        if (prices[0] === prices[prices.length - 1]) return formatCad(prices[0]);
        return `${formatCad(prices[0])}–${formatCad(prices[prices.length - 1])}`;
    }

    function element(tag, className, text) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    }

    function serviceCard(product, orderingEnabled) {
        const variants = Array.isArray(product.variants) ? product.variants : [];
        const article = element('article', 'document-service-card');
        const header = element('div', 'document-service-card-header');
        const icon = element('span', 'document-service-card-icon');
        icon.setAttribute('aria-hidden', 'true');
        icon.innerHTML = '<i class="fas fa-file-signature"></i>';
        const heading = element('div');
        heading.appendChild(element('span', 'document-service-label', 'Document service'));
        heading.appendChild(element('h3', '', product.name || 'MCC document service'));
        header.append(icon, heading);

        const description = element('p', 'document-service-description', product.description || 'Contact MCC for details about this document service.');
        const variantList = element('div', 'document-service-variants');
        variants.slice(0, 4).forEach((variant) => {
            const row = element('div', 'document-service-variant');
            row.append(
                element('span', '', variant.name || 'Service option'),
                element('strong', '', formatCad(variant.price_cents)),
            );
            variantList.appendChild(row);
        });
        if (variants.length > 4) {
            variantList.appendChild(element('span', 'document-service-more', `+ ${variants.length - 4} more options`));
        }

        const footer = element('div', 'document-service-card-footer');
        const price = element('div', 'document-service-price');
        price.append(element('span', '', 'Available options'), element('strong', '', priceRange(variants)));
        const action = document.createElement('a');
        action.className = orderingEnabled ? 'btn-solid-gold' : 'document-service-disabled';
        action.href = orderingEnabled ? '/contact?topic=document-services' : '#document-services';
        action.textContent = orderingEnabled ? 'Request this service' : 'Ordering opens soon';
        if (!orderingEnabled) {
            action.setAttribute('aria-disabled', 'true');
            action.addEventListener('click', (event) => event.preventDefault());
        }
        footer.append(price, action);
        article.append(header, description, variantList, footer);
        return article;
    }

    function setNotice(notice, state, message) {
        notice.className = `document-services-notice is-${state}`;
        const icon = state === 'ready' ? 'fa-circle-check' : state === 'paused' ? 'fa-clock' : 'fa-triangle-exclamation';
        notice.innerHTML = `<i class="fas ${icon}" aria-hidden="true"></i><span></span>`;
        notice.querySelector('span').textContent = message;
    }

    async function loadCatalogue(root) {
        const grid = root.querySelector('[data-document-services-grid]');
        const notice = root.querySelector('[data-document-services-notice]');
        const empty = root.querySelector('[data-document-services-empty]');
        const controller = new AbortController();
        const timer = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
        try {
            const response = await fetch(`${API_BASE}/public/document-services/products`, {
                headers: { Accept: 'application/json' },
                signal: controller.signal,
            });
            if (!response.ok) throw new Error(`Catalogue request failed (${response.status})`);
            const payload = await response.json();
            const items = Array.isArray(payload.items) ? payload.items : [];
            const orderingEnabled = payload.enabled === true;
            grid.replaceChildren(...items.map((product) => serviceCard(product, orderingEnabled)));
            empty.hidden = items.length !== 0;
            if (orderingEnabled) {
                setNotice(notice, 'ready', 'Online document ordering is available. Prices are loaded directly from the MCC Portal.');
            } else {
                setNotice(notice, 'paused', 'Published services are available to review. Online ordering will open after secure payment setup is completed.');
            }
        } catch (error) {
            console.error('[MCC document services catalogue]', error);
            grid.replaceChildren();
            empty.hidden = true;
            setNotice(notice, 'error', 'Document services could not be loaded. Please contact MCC for assistance.');
        } finally {
            window.clearTimeout(timer);
            root.removeAttribute('aria-busy');
        }
    }

    function ready(callback) {
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', callback, { once: true });
        else callback();
    }

    ready(() => {
        document.querySelectorAll('[data-document-services-home]').forEach(loadCatalogue);
    });
})();
