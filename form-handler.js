/**
 * MCC public form handler.
 *
 * Wires every <form data-form-type="..."> on the marketing site to the MCC
 * Portal's public website-engagement API:
 *
 *   data-form-type="contact"    → POST /api/public/contact-inquiries
 *   data-form-type="newsletter" → POST /api/public/newsletter-subscriptions
 *
 * The endpoint paths, field names, limits and visitor-facing error wording all
 * come from portal-api.js, which is the single description of those contracts.
 * Loads BEFORE script.js so it registers its submit listener first.
 */

(function () {
  'use strict';

  const api = window.MCCPortalApi;

  const ready = (fn) => (document.readyState !== 'loading')
    ? fn()
    : document.addEventListener('DOMContentLoaded', fn);

  const HANDLERS = {
    contact: {
      build: (form) => api.buildContactInquiry({
        full_name: value(form, 'full_name'),
        email: value(form, 'email'),
        phone: value(form, 'phone'),
        subject: value(form, 'subject'),
        message: value(form, 'message'),
        locale: api.detectLocale(),
        source_page: api.sourcePage(),
        company_website: value(form, 'company_website'),
      }),
      validate: (payload, locale) => api.validateContactInquiry(payload, locale),
      submit: (payload) => api.submitContactInquiry(payload),
      successKey: 'contact_success',
      errorKind: 'contact',
      busyLabel: { en: 'Sending…', fr: 'Envoi en cours…' },
      // A sent message is gone from the form on purpose: the visitor gets the
      // thank-you panel the page already ships, not an inbox-shaped textarea
      // still holding what they just sent.
      onSuccess: (form) => showSuccessPanel(form),
    },
    newsletter: {
      build: (form) => api.buildNewsletterSubscription({
        email: value(form, 'email'),
        locale: api.detectLocale(),
        source_page: api.sourcePage(),
        company_website: value(form, 'company_website'),
      }),
      validate: (payload, locale) => api.validateNewsletterSubscription(payload, locale),
      submit: (payload) => api.submitNewsletterSubscription(payload),
      successKey: 'newsletter_success',
      errorKind: 'newsletter',
      busyLabel: { en: 'Subscribing…', fr: 'Abonnement en cours…' },
      // An inline subscribe bar stays on the page, so clearing the field is what
      // signals "done" — and stops a second Subscribe click resending the same
      // address.
      onSuccess: (form) => { form.reset(); },
    },
  };

  function value(form, name) {
    const field = form.elements[name];
    if (!field) return '';
    if (field.type === 'checkbox') return field.checked ? 'on' : '';
    return field.value;
  }

  function attach(form) {
    if (form.dataset.mccBound === '1') return;
    const handler = HANDLERS[form.dataset.formType];
    if (!handler) {
      console.warn(`[MCC forms] No portal endpoint for data-form-type="${form.dataset.formType}".`);
      return;
    }
    form.dataset.mccBound = '1';

    const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
    const status = statusElement(form);
    const originalHTML = submitBtn ? submitBtn.innerHTML : '';

    // The guard, not the disabled attribute, is what makes double submission
    // impossible: a disabled button still lets Enter in a text input submit the
    // form, and that is the duplicate-inquiry path visitors actually hit.
    let isSubmitting = false;

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (isSubmitting) return;

      const locale = api.detectLocale();
      clearFieldErrors(form);
      setStatus(status, '', null);

      const payload = handler.build(form);
      const errors = handler.validate(payload, locale);
      if (errors.length) {
        markFieldErrors(form, errors);
        setStatus(status, errors[0].message, 'error');
        focusField(form, errors[0].field);
        return;
      }

      isSubmitting = true;
      setBusy(submitBtn, true, handler.busyLabel[locale] || handler.busyLabel.en);

      try {
        await handler.submit(payload);
        setStatus(status, api.copy(handler.successKey, locale), 'success');
        handler.onSuccess(form);
      } catch (error) {
        // The raw error is for us, not the visitor: it can carry a status line,
        // a backend detail string or an abort. What the page shows is mapped
        // from the response class, and everything typed stays where it is so a
        // retry costs nothing.
        console.error('[MCC forms] submission failed', error);
        setStatus(status, api.friendlyMessage(error, handler.errorKind, locale), 'error');
      } finally {
        isSubmitting = false;
        setBusy(submitBtn, false, '', originalHTML);
      }
    });
  }

  /**
   * The form's live region. Looked up inside the form first, then beside it —
   * the newsletter subscribe bar is a flex row whose children are laid out as
   * pill controls, so its status line lives as a sibling instead.
   */
  function statusElement(form) {
    const existing = form.querySelector('[data-form-status]')
      || (form.parentElement && form.parentElement.querySelector('[data-form-status]'));
    if (existing) return existing;
    const status = document.createElement('p');
    status.className = 'mcc-form-status';
    status.setAttribute('data-form-status', '');
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    form.appendChild(status);
    return status;
  }

  function setStatus(status, message, kind) {
    if (!status) return;
    status.textContent = message || '';
    status.classList.toggle('is-error', kind === 'error');
    status.classList.toggle('is-success', kind === 'success');
  }

  function setBusy(button, busy, busyLabel, originalHTML) {
    if (!button) return;
    button.disabled = busy;
    button.setAttribute('aria-busy', String(busy));
    if (busy) {
      // The label is ours, not the visitor's, so the icon markup is safe here;
      // the original markup is restored verbatim when the request settles.
      button.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> ' + busyLabel;
    } else if (originalHTML !== undefined) {
      button.innerHTML = originalHTML;
    }
  }

  function clearFieldErrors(form) {
    form.querySelectorAll('[aria-invalid="true"]').forEach((field) => {
      field.removeAttribute('aria-invalid');
    });
  }

  function markFieldErrors(form, errors) {
    errors.forEach(({ field }) => {
      const element = form.elements[field];
      if (element && element.setAttribute) element.setAttribute('aria-invalid', 'true');
    });
  }

  function focusField(form, name) {
    const element = form.elements[name];
    if (element && typeof element.focus === 'function') element.focus();
  }

  /**
   * Replace the form with the page's thank-you state. Built with DOM calls
   * rather than innerHTML so nothing that came back over the wire can be
   * rendered as markup.
   */
  function showSuccessPanel(form) {
    const locale = api.detectLocale();
    const success = document.createElement('div');
    success.setAttribute('role', 'status');
    success.setAttribute('aria-live', 'polite');
    success.tabIndex = -1;
    success.style.cssText = 'text-align:center;padding:3rem 1rem;';

    const icon = document.createElement('i');
    icon.className = 'fas fa-check-circle';
    icon.setAttribute('aria-hidden', 'true');
    icon.style.cssText = 'font-size:3rem;color:#D4AF37;margin-bottom:1rem;';

    const title = document.createElement('h3');
    title.style.cssText = 'color:#0F3D2E;margin-bottom:0.5rem;';
    title.textContent = locale === 'fr' ? 'Merci!' : 'Thank you!';

    const message = document.createElement('p');
    message.style.color = '#555';
    message.textContent = api.copy('contact_success', locale);

    success.append(icon, title, message);
    form.replaceChildren(success);
    success.focus();
  }

  // Bound last, and only here: this script is deferred, so `ready` runs its
  // callback immediately, and HANDLERS and the helpers above must already be
  // initialised when attach() reads them.
  ready(() => {
    if (!api) {
      // portal-api.js is a hard dependency: without it we cannot know where to
      // post. Leaving the form unbound keeps the browser's own validation and
      // avoids a listener that would swallow the submit and do nothing.
      console.error('[MCC forms] portal-api.js did not load; public forms are not bound.');
      return;
    }
    document.querySelectorAll('form[data-form-type]').forEach(attach);
  });
})();
