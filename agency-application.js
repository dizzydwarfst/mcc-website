(function () {
  const PRODUCTION_PORTAL_API_BASE_URL = 'https://lms-system-backend-lake.vercel.app';
  const LOCAL_PORTAL_API_BASE_URL = 'http://localhost:8000';
  const MAX_FILE_BYTES = 15 * 1024 * 1024;
  const PROGRAM_LIMIT = 3;
  const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
  const ALLOWED_FILE_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png'];

  const PROGRAMS = [
    'French Test Preparation (TCF & TEF)',
    'French as a Second Language (FSL)',
    'Global Management in Hospitality Diploma',
    'Hospitality Operations Diploma',
    'International Esports Management Diploma',
    'Next-Gen Applied AI Mastery',
    'Video Content Creation and Social Media Management',
  ];

  const FIELD_LABELS = {
    legalName: 'Legal name',
    primaryMarketRegion: 'Primary market region',
    country: 'Country',
    city: 'City',
    mainContactName: 'Primary contact name',
    mainContactEmail: 'Primary contact email',
    mainContactPhone: 'Primary contact phone',
    secondaryContactEmail: 'Secondary contact email',
    secondaryContactPhone: 'Secondary contact phone',
    companyRegistrationDocument: 'Company registration document',
    governmentIdDocument: 'Government ID document',
    consentConfirmed: 'Consent confirmation',
    privacyConfirmed: 'Privacy confirmation',
    programsOfInterest: 'Programs of interest',
  };

  const ready = (fn) => (document.readyState !== 'loading')
    ? fn()
    : document.addEventListener('DOMContentLoaded', fn);

  ready(() => {
    const form = document.getElementById('agency-application-form');
    if (!form) return;
    initializeAgencyApplication(form);
  });

  function initializeAgencyApplication(form) {
    const programInputs = Array.from(form.querySelectorAll('input[name="programsOfInterest"]'));

    programInputs.forEach((input) => {
      input.addEventListener('change', () => handleProgramChange(form, input));
    });

    form.querySelectorAll('input, select, textarea').forEach((control) => {
      control.addEventListener('input', () => clearFieldError(form, control.name || control.id));
      control.addEventListener('change', () => {
        const field = control.name || control.id;
        if (field === 'programsOfInterest') return;
        clearFieldError(form, field);
      });
    });

    updateProgramCounter(form);

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      hideGeneralMessage(form);

      const errors = validate(form);
      if (errors.length) {
        showValidationErrors(form, errors);
        return;
      }

      await submitApplication(form);
    });
  }

  function handleProgramChange(form, changedInput) {
    const selected = getSelectedPrograms(form);
    if (selected.length > PROGRAM_LIMIT) {
      changedInput.checked = false;
      setFieldError(form, {
        field: 'programsOfInterest',
        message: `Choose no more than ${PROGRAM_LIMIT} programs.`,
      });
    } else {
      clearFieldError(form, 'programsOfInterest');
    }
    updateProgramCounter(form);
  }

  function updateProgramCounter(form) {
    const counter = document.getElementById('programs-counter');
    if (counter) counter.textContent = `${getSelectedPrograms(form).length}/${PROGRAM_LIMIT} selected`;
  }

  function validate(form) {
    clearAllErrors(form);
    const errors = [];

    [
      'legalName',
      'primaryMarketRegion',
      'country',
      'city',
      'mainContactName',
      'mainContactEmail',
      'mainContactPhone',
    ].forEach((field) => requireValue(form, field, errors));

    const email = value(form, 'mainContactEmail');
    if (email && !isValidEmail(email)) {
      errors.push({ field: 'mainContactEmail', message: 'Enter a valid email address.' });
    }

    const phone = value(form, 'mainContactPhone');
    if (phone && !isReasonablePhone(phone)) {
      errors.push({ field: 'mainContactPhone', message: 'Enter a valid phone number.' });
    }

    const secondaryEmail = value(form, 'secondaryContactEmail');
    if (secondaryEmail && !isValidEmail(secondaryEmail)) {
      errors.push({ field: 'secondaryContactEmail', message: 'Enter a valid secondary contact email address.' });
    }

    const secondaryPhone = value(form, 'secondaryContactPhone');
    if (secondaryPhone && !isReasonablePhone(secondaryPhone)) {
      errors.push({ field: 'secondaryContactPhone', message: 'Enter a valid secondary contact phone number.' });
    }

    const programs = getSelectedPrograms(form);
    if (programs.length > PROGRAM_LIMIT) {
      errors.push({ field: 'programsOfInterest', message: `Choose no more than ${PROGRAM_LIMIT} programs.` });
    }

    validateFileField(form, 'companyRegistrationDocument', false, errors);
    validateFileField(form, 'governmentIdDocument', false, errors);

    if (!checkbox(form, 'consentConfirmed')) {
      errors.push({ field: 'consentConfirmed', message: 'Confirm that MCC may review and contact you about this application.' });
    }

    if (!checkbox(form, 'privacyConfirmed')) {
      errors.push({ field: 'privacyConfirmed', message: 'Confirm that you understand the privacy notice before submitting.' });
    }

    return errors;
  }

  function requireValue(form, field, errors) {
    if (!value(form, field)) {
      errors.push({ field, message: `${FIELD_LABELS[field] || field} is required.` });
    }
  }

  function validateFileField(form, field, required, errors) {
    const input = fieldControl(form, field);
    const file = input && input.files ? input.files[0] : null;

    if (!file) {
      if (required) errors.push({ field, message: `${FIELD_LABELS[field]} is required.` });
      return;
    }

    if (!isAllowedFile(file)) {
      errors.push({ field, message: 'Upload a PDF, JPEG, or PNG file.' });
      return;
    }

    if (file.size > MAX_FILE_BYTES) {
      errors.push({ field, message: 'File must be 15 MB or smaller.' });
    }
  }

  async function submitApplication(form) {
    const button = form.querySelector('button[type="submit"]');
    const originalButtonHtml = button ? button.innerHTML : '';

    try {
      setSubmitting(button, true);

      const formData = buildFormData(form);
      const response = await fetch(`${portalApiBaseUrl()}/api/public/agency-application`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const message = await responseMessage(response);
        throw new Error(message);
      }

      let result = {};
      try { result = await response.json(); } catch (_) { /* Empty success body is acceptable. */ }
      showSuccess(form, result);
    } catch (error) {
      showGeneralError(
        form,
        sanitizeSensitiveText((error && error.message) || 'We could not submit your application. Please try again.')
      );
      setSubmitting(button, false, originalButtonHtml);
    }
  }

  function buildFormData(form) {
    const data = new FormData();

    appendRequired(data, 'legalName', value(form, 'legalName'));
    appendIfValue(data, 'preferredName', value(form, 'preferredName'));
    appendRequired(data, 'primaryMarketRegion', value(form, 'primaryMarketRegion'));
    appendMultiValue(data, 'secondaryMarketRegions', value(form, 'secondaryMarketRegions'));
    appendIfValue(data, 'streetAddress', value(form, 'streetAddress'));
    appendRequired(data, 'country', value(form, 'country'));
    appendIfValue(data, 'provinceState', value(form, 'provinceState'));
    appendRequired(data, 'city', value(form, 'city'));
    appendIfValue(data, 'postalCode', value(form, 'postalCode'));
    appendRequired(data, 'mainContactName', value(form, 'mainContactName'));
    appendRequired(data, 'mainContactEmail', value(form, 'mainContactEmail'));
    appendRequired(data, 'mainContactPhone', value(form, 'mainContactPhone'));
    appendIfValue(data, 'mainContactJobTitle', value(form, 'mainContactJobTitle'));
    appendIfValue(data, 'companyEmail', value(form, 'companyEmail'));
    appendIfValue(data, 'companyPhone', value(form, 'companyPhone'));
    appendIfValue(data, 'generalContactInfo', buildGeneralContactInfo(form));
    appendIfValue(data, 'shortIntroduction', value(form, 'shortIntroduction'));
    appendIfValue(data, 'howDidYouHearAboutMcc', value(form, 'howDidYouHearAboutMcc'));
    appendIfValue(data, 'preferredContactChannel', value(form, 'preferredContactChannel'));

    getSelectedPrograms(form).slice(0, PROGRAM_LIMIT).forEach((program) => {
      data.append('programsOfInterest', program);
    });

    appendFileIfValue(data, 'companyRegistrationDocument', fileValue(form, 'companyRegistrationDocument'));
    appendFileIfValue(data, 'governmentIdDocument', fileValue(form, 'governmentIdDocument'));

    data.append('consentConfirmed', checkbox(form, 'consentConfirmed') ? 'true' : 'false');
    data.append('privacyConfirmed', checkbox(form, 'privacyConfirmed') ? 'true' : 'false');

    return data;
  }

  function appendRequired(data, name, rawValue) {
    data.append(name, String(rawValue || '').trim());
  }

  function appendIfValue(data, name, rawValue) {
    const cleanValue = String(rawValue || '').trim();
    if (cleanValue) data.append(name, cleanValue);
  }

  function appendFileIfValue(data, name, file) {
    if (file) data.append(name, file);
  }

  function appendMultiValue(data, name, rawValue) {
    splitMultiValue(rawValue).forEach((entry) => data.append(name, entry));
  }

  function buildGeneralContactInfo(form) {
    const notes = value(form, 'generalContactInfo');
    const secondaryParts = [
      ['Name', value(form, 'secondaryContactName')],
      ['Job title', value(form, 'secondaryContactJobTitle')],
      ['Email', value(form, 'secondaryContactEmail')],
      ['Phone', value(form, 'secondaryContactPhone')],
    ].filter(([, fieldValue]) => fieldValue);

    const secondaryBlock = secondaryParts.length
      ? `Secondary contact: ${secondaryParts.map(([label, fieldValue]) => `${label}: ${fieldValue}`).join('; ')}`
      : '';

    return [notes, secondaryBlock].filter(Boolean).join('\n\n');
  }

  function splitMultiValue(rawValue) {
    return String(rawValue || '')
      .split(/[\n,]+/)
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  function showValidationErrors(form, errors) {
    errors.forEach((error) => setFieldError(form, error));
    showGeneralError(form, 'Please fix the highlighted fields before submitting.');

    const first = errors.find((error) => fieldControl(form, error.field));
    if (first) focusField(form, first.field);
  }

  function setFieldError(form, error) {
    const control = fieldControl(form, error.field);
    const slot = errorSlot(form, error.field);
    const group = errorGroup(form, error.field);

    if (control) {
      control.classList.add('input-error');
      control.setAttribute('aria-invalid', 'true');
      if (slot) control.setAttribute('aria-describedby', slot.id);
    }

    if (group) group.classList.add('has-error');
    if (slot) {
      slot.textContent = error.message;
      slot.style.display = 'block';
    }
  }

  function clearFieldError(form, field) {
    const control = fieldControl(form, field);
    const group = errorGroup(form, field);
    const slot = errorSlot(form, field);

    if (control) {
      control.classList.remove('input-error');
      control.removeAttribute('aria-invalid');
    }
    if (group) group.classList.remove('has-error');
    if (slot) {
      slot.textContent = '';
      slot.style.display = '';
    }
  }

  function clearAllErrors(form) {
    hideGeneralMessage(form);
    form.querySelectorAll('.input-error').forEach((control) => {
      control.classList.remove('input-error');
      control.removeAttribute('aria-invalid');
    });
    form.querySelectorAll('.has-error').forEach((group) => group.classList.remove('has-error'));
    form.querySelectorAll('.error-msg').forEach((slot) => {
      slot.textContent = '';
      slot.style.display = '';
    });
  }

  function showGeneralError(form, message) {
    const box = document.getElementById('agency-submit-error');
    if (!box) return;
    box.textContent = message;
    box.hidden = false;
  }

  function hideGeneralMessage() {
    const box = document.getElementById('agency-submit-error');
    if (box) {
      box.textContent = '';
      box.hidden = true;
    }
  }

  function showSuccess(form, result) {
    const success = document.getElementById('agency-application-success');
    if (!success) return;

    const reference = document.getElementById('agency-application-reference');
    if (reference) {
      reference.textContent = result && result.agency_id ? `Reference: ${result.agency_id}` : '';
      reference.hidden = !(result && result.agency_id);
    }

    success.hidden = false;
    form.classList.add('is-submitted');
    Array.from(form.elements).forEach((control) => {
      if (control.type !== 'hidden') control.disabled = true;
    });
    success.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function setSubmitting(button, isSubmitting, originalButtonHtml) {
    if (!button) return;
    button.disabled = isSubmitting;
    button.innerHTML = isSubmitting
      ? '<i class="fas fa-spinner fa-spin"></i> Submitting...'
      : originalButtonHtml;
  }

  function focusField(form, field) {
    const control = fieldControl(form, field);
    if (!control) return;
    const target = errorGroup(form, field) || control;
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    window.requestAnimationFrame(() => {
      try {
        control.focus({ preventScroll: true });
      } catch (_) {
        control.focus();
      }
    });
  }

  async function responseMessage(response) {
    const fallback = `Submission failed (HTTP ${response.status}). Please review your information and try again.`;
    const text = await response.text();
    if (!text) return fallback;
    try {
      const json = JSON.parse(text);
      if (typeof json.detail === 'string') return sanitizeSensitiveText(json.detail);
      if (typeof json.error === 'string') return sanitizeSensitiveText(json.error);
      if (typeof json.message === 'string') return sanitizeSensitiveText(json.message);
    } catch (_) {
      return sanitizeSensitiveText(text);
    }
    return fallback;
  }

  function portalApiBaseUrl() {
    const configured = window.NEXT_PUBLIC_PORTAL_API_BASE_URL ||
      window.MCC_PORTAL_API_BASE_URL ||
      defaultPortalApiBaseUrl();
    return String(configured).replace(/\/+$/, '');
  }

  function defaultPortalApiBaseUrl() {
    return ['localhost', '127.0.0.1'].includes(window.location.hostname)
      ? LOCAL_PORTAL_API_BASE_URL
      : PRODUCTION_PORTAL_API_BASE_URL;
  }

  function getSelectedPrograms(form) {
    return Array.from(form.querySelectorAll('input[name="programsOfInterest"]:checked'))
      .map((input) => input.value)
      .filter((value) => PROGRAMS.includes(value));
  }

  function fieldControl(form, field) {
    if (!field) return null;
    return form.querySelector(`[name="${cssEscape(field)}"]`) || document.getElementById(field);
  }

  function errorGroup(form, field) {
    if (field === 'programsOfInterest') return form.querySelector('[data-field-group="programsOfInterest"]');
    const control = fieldControl(form, field);
    return control ? control.closest('.form-group, .checkbox-group') : null;
  }

  function errorSlot(form, field) {
    return form.querySelector(`#${cssEscape(field)}-error`);
  }

  function value(form, field) {
    const control = fieldControl(form, field);
    return control ? String(control.value || '').trim() : '';
  }

  function checkbox(form, field) {
    const control = fieldControl(form, field);
    return Boolean(control && control.checked);
  }

  function fileValue(form, field) {
    const control = fieldControl(form, field);
    return control && control.files ? control.files[0] : null;
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function isReasonablePhone(phone) {
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 7 && digits.length <= 20;
  }

  function isAllowedFile(file) {
    const extension = file.name.split('.').pop().toLowerCase();
    return ALLOWED_FILE_TYPES.includes(file.type) || ALLOWED_FILE_EXTENSIONS.includes(extension);
  }

  function sanitizeSensitiveText(value) {
    if (typeof value !== 'string') return value;
    return value
      .replace(/((?:sin|social insurance number)\s*[:=]\s*)["']?[\d -]{3,}["']?/gi, '$1[redacted]')
      .replace(/\b\d{3}[- ]?\d{3}[- ]?\d{3}\b/g, '[redacted SIN]');
  }

  function cssEscape(value) {
    if (window.CSS && typeof window.CSS.escape === 'function') return window.CSS.escape(value);
    return String(value).replace(/["\\]/g, '\\$&');
  }
})();
