(function () {
  const PRODUCTION_PORTAL_API_BASE_URL = 'https://lms-system-backend-lake.vercel.app';
  const LOCAL_PORTAL_API_BASE_URL = 'http://localhost:8000';
  const MAX_FILE_BYTES = 15 * 1024 * 1024;
  const PROGRAM_LIMIT = 3;
  const OTHER_VALUE = 'Other';
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

  const GROUP_FIELDS = [
    'communicationChannels',
    'studentSourceCountries',
    'targetEducationLevels',
    'programsOfInterest',
    'promotionalChannels',
    'uploadDocuments',
  ];

  const FIELD_LABELS = {
    legalName: 'Company legal name',
    companyPhone: 'Company phone number',
    companyEmail: 'Company email address',
    companyWebsite: 'Company website',
    country: 'Country',
    city: 'City',
    mainContactName: 'Main contact person full name',
    mainContactEmail: 'Main contact person email address',
    mainContactPhone: 'Main contact person phone number',
    secondaryContactEmail: 'Secondary contact email address',
    secondaryContactPhone: 'Secondary contact phone number',
    gstNumber: 'GST Number',
    sinNumber: 'SIN Number',
    natureOfBusinessOther: 'Other nature of business',
    communicationChannelOther: 'Other communication channel',
    howDidYouHearAboutMccOther: 'Other source',
    companyRegistrationDocument: 'Company registration document',
    governmentIdDocument: 'Government ID document',
    consentConfirmed: 'Consent confirmation',
    privacyConfirmed: 'Privacy confirmation',
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
    populateProgramSelects(form);
    populateCountryRankSelects(form);
    setupSecondaryContact(form);
    setupConditionalOtherFields(form);

    form.querySelectorAll('input, select, textarea').forEach((control) => {
      control.addEventListener('input', () => clearFieldError(form, control.name || control.id));
      control.addEventListener('change', () => clearFieldError(form, control.name || control.id));
    });

    ['companyRegistrationDocument', 'governmentIdDocument'].forEach((field) => {
      const control = fieldControl(form, field);
      if (control) control.addEventListener('change', () => clearFieldError(form, 'uploadDocuments'));
    });

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      hideGeneralMessage();

      const errors = validate(form);
      if (errors.length) {
        showValidationErrors(form, errors);
        return;
      }

      await submitApplication(form);
    });
  }

  function populateProgramSelects(form) {
    form.querySelectorAll('select[name="programsOfInterest"]').forEach((select) => {
      if (select.options.length > 1) return;
      PROGRAMS.forEach((program) => select.appendChild(option(program, program)));
    });
  }

  function populateCountryRankSelects(form) {
    const country = fieldControl(form, 'country');
    const countryRankSelects = Array.from(form.querySelectorAll('select[data-country-rank]'));
    if (!country || !country.options || country.options.length <= 1 || !countryRankSelects.length) return;

    countryRankSelects.forEach((select) => {
      const previous = select.value;
      select.textContent = '';
      Array.from(country.options).forEach((countryOption, index) => {
        const opt = option(countryOption.value, index === 0 ? 'Select Country' : countryOption.textContent);
        select.appendChild(opt);
      });
      if (previous && hasOption(select, previous)) select.value = previous;
    });
  }

  function setupSecondaryContact(form) {
    const button = form.querySelector('[data-secondary-contact-toggle]');
    const panel = document.getElementById('secondary-contact-panel');
    if (!button || !panel) return;

    const fields = Array.from(panel.querySelectorAll('[data-secondary-contact-field]'));
    const setVisible = (visible) => {
      panel.hidden = !visible;
      button.setAttribute('aria-expanded', visible ? 'true' : 'false');
      button.innerHTML = visible
        ? '<i class="fas fa-minus"></i> Remove Secondary Contact Person'
        : '<i class="fas fa-plus"></i> Add Secondary Contact Person';

      fields.forEach((field) => {
        field.disabled = !visible;
        if (!visible) clearFieldValue(form, field.name || field.id);
      });
    };

    setVisible(false);
    button.addEventListener('click', () => setVisible(panel.hidden));
  }

  function setupConditionalOtherFields(form) {
    form.querySelectorAll('[data-other-select]').forEach((select) => {
      const update = () => setOtherFieldVisible(form, select.dataset.otherSelect, select.value === OTHER_VALUE);
      select.addEventListener('change', update);
      update();
    });

    form.querySelectorAll('[data-other-toggle]').forEach((checkboxInput) => {
      const update = () => setOtherFieldVisible(form, checkboxInput.dataset.otherToggle, checkboxInput.checked);
      checkboxInput.addEventListener('change', update);
      update();
    });
  }

  function setOtherFieldVisible(form, field, visible) {
    const group = form.querySelector(`[data-other-field="${cssEscape(field)}"]`);
    const control = fieldControl(form, field);
    if (group) group.hidden = !visible;
    if (control) {
      control.disabled = !visible;
      if (!visible) clearFieldValue(form, field);
    }
  }

  function validate(form) {
    clearAllErrors(form);
    const errors = [];

    [
      'legalName',
      'companyPhone',
      'companyEmail',
      'country',
      'city',
      'mainContactName',
      'mainContactEmail',
      'mainContactPhone',
    ].forEach((field) => requireValue(form, field, errors));

    validateEmailField(form, 'companyEmail', errors);
    validateEmailField(form, 'mainContactEmail', errors);
    validateEmailField(form, 'secondaryContactEmail', errors);
    validatePhoneField(form, 'companyPhone', errors);
    validatePhoneField(form, 'mainContactPhone', errors);
    validatePhoneField(form, 'secondaryContactPhone', errors);

    const website = value(form, 'companyWebsite');
    if (website && !isValidWebsite(website)) {
      errors.push({ field: 'companyWebsite', message: 'Enter a valid website, such as example.com or https://example.com.' });
    }

    if (value(form, 'natureOfBusiness') === OTHER_VALUE) {
      requireValue(form, 'natureOfBusinessOther', errors);
    }

    if (getCheckedValues(form, 'communicationChannels').includes(OTHER_VALUE)) {
      requireValue(form, 'communicationChannelOther', errors);
    }

    if (value(form, 'howDidYouHearAboutMcc') === OTHER_VALUE) {
      requireValue(form, 'howDidYouHearAboutMccOther', errors);
    }

    const sin = value(form, 'sinNumber');
    if (sin && !isValidSin(sin)) {
      errors.push({ field: 'sinNumber', message: 'SIN must be 9 digits and pass the Canadian checksum.' });
    }

    const programs = getSelectedPrograms(form);
    if (programs.length > PROGRAM_LIMIT) {
      errors.push({ field: 'programsOfInterest', message: `Choose no more than ${PROGRAM_LIMIT} programs.` });
    }

    validateFileField(form, 'companyRegistrationDocument', errors);
    validateFileField(form, 'governmentIdDocument', errors);
    if (!fileValue(form, 'companyRegistrationDocument') && !fileValue(form, 'governmentIdDocument')) {
      errors.push({
        field: 'uploadDocuments',
        message: 'Upload a company registration document (businesses) or a government ID document (personal/individual agents).',
      });
    }

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

  function validateEmailField(form, field, errors) {
    const email = value(form, field);
    if (email && !isValidEmail(email)) {
      errors.push({ field, message: `Enter a valid ${FIELD_LABELS[field] || 'email address'}.` });
    }
  }

  function validatePhoneField(form, field, errors) {
    const phone = value(form, field);
    if (phone && !isReasonablePhone(phone)) {
      errors.push({ field, message: `Enter a valid ${FIELD_LABELS[field] || 'phone number'}.` });
    }
  }

  function validateFileField(form, field, errors) {
    const file = fileValue(form, field);
    if (!file) return;

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
      const text = await response.text();
      const responseBody = parseResponseBody(text);

      if (!response.ok) {
        console.error(`Agency application submission failed (HTTP ${response.status}).`);
        throw new Error(submissionErrorMessage(response.status));
      }

      const result = responseBody && typeof responseBody === 'object' ? responseBody : {};
      showSuccess(form, result);
    } catch (error) {
      showGeneralError(
        form,
        (error && error.message) || 'We could not submit your application. Please try again.'
      );
      setSubmitting(button, false, originalButtonHtml);
    }
  }

  function buildFormData(form) {
    const data = new FormData();

    appendRequired(data, 'legalName', value(form, 'legalName'));
    appendRequired(data, 'country', value(form, 'country'));
    appendRequired(data, 'city', value(form, 'city'));
    appendRequired(data, 'mainContactName', value(form, 'mainContactName'));
    appendRequired(data, 'mainContactEmail', value(form, 'mainContactEmail'));
    appendRequired(data, 'mainContactPhone', value(form, 'mainContactPhone'));
    appendRequired(data, 'companyEmail', value(form, 'companyEmail'));
    appendRequired(data, 'companyPhone', value(form, 'companyPhone'));
    data.append('consentConfirmed', checkbox(form, 'consentConfirmed') ? 'true' : 'false');
    data.append('privacyConfirmed', checkbox(form, 'privacyConfirmed') ? 'true' : 'false');

    appendIfValue(data, 'preferredName', value(form, 'preferredName'));
    appendIfValue(data, 'companyWebsite', normalizeWebsite(value(form, 'companyWebsite')));
    appendIfValue(data, 'provinceState', value(form, 'provinceState'));
    appendIfValue(data, 'postalCode', value(form, 'postalCode'));
    appendIfValue(data, 'streetAddress', value(form, 'streetAddress'));
    appendIfValue(data, 'mainContactPreferredName', value(form, 'mainContactPreferredName'));
    appendIfValue(data, 'mainContactJobTitle', value(form, 'mainContactJobTitle'));

    appendIfValue(data, 'secondaryContactName', value(form, 'secondaryContactName'));
    appendIfValue(data, 'secondaryContactPreferredName', value(form, 'secondaryContactPreferredName'));
    appendIfValue(data, 'secondaryContactJobTitle', value(form, 'secondaryContactJobTitle'));
    appendIfValue(data, 'secondaryContactPhone', value(form, 'secondaryContactPhone'));
    appendIfValue(data, 'secondaryContactEmail', value(form, 'secondaryContactEmail'));

    getCheckedValues(form, 'communicationChannels').forEach((channel) => {
      data.append('communicationChannels', channel);
    });
    appendIfValue(data, 'communicationChannelOther', value(form, 'communicationChannelOther'));

    appendIfValue(data, 'natureOfBusiness', value(form, 'natureOfBusiness'));
    appendIfValue(data, 'natureOfBusinessOther', value(form, 'natureOfBusinessOther'));
    appendIfValue(data, 'numberOfEmployees', value(form, 'numberOfEmployees'));
    appendIfValue(data, 'gstNumber', value(form, 'gstNumber'));
    appendIfValue(data, 'sin', value(form, 'sinNumber'));
    appendIfValue(data, 'studentsSentToCanadaPast12Months', value(form, 'studentsSentToCanadaPast12Months'));
    appendIfValue(data, 'studentsAnticipatedForMccNext12Months', value(form, 'studentsAnticipatedForMccNext12Months'));

    getMultiControlValues(form, 'studentSourceCountries').slice(0, 3).forEach((country) => {
      data.append('studentSourceCountries', country);
    });
    getMultiControlValues(form, 'targetEducationLevels').slice(0, 3).forEach((level) => {
      data.append('targetEducationLevels', level);
    });
    getSelectedPrograms(form).slice(0, PROGRAM_LIMIT).forEach((program) => {
      data.append('programsOfInterest', program);
    });
    getCheckedValues(form, 'promotionalChannels').forEach((channel) => {
      data.append('promotionalChannels', channel);
    });

    appendIfValue(data, 'howDidYouHearAboutMcc', value(form, 'howDidYouHearAboutMcc'));
    appendIfValue(data, 'howDidYouHearAboutMccOther', value(form, 'howDidYouHearAboutMccOther'));

    appendFileIfValue(data, 'companyRegistrationDocument', fileValue(form, 'companyRegistrationDocument'));
    appendFileIfValue(data, 'governmentIdDocument', fileValue(form, 'governmentIdDocument'));

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

  function showValidationErrors(form, errors) {
    errors.forEach((error) => setFieldError(form, error));
    showGeneralError(form, 'Please fix the highlighted fields before submitting.');

    const first = errors.find((error) => fieldControl(form, error.field) || errorGroup(form, error.field));
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
    hideGeneralMessage();
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

  function clearFieldValue(form, field) {
    const control = fieldControl(form, field);
    if (!control) return;
    if (control.type === 'checkbox' || control.type === 'radio') control.checked = false;
    else control.value = '';
    clearFieldError(form, field);
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
    form.reset();
    form.hidden = true;
    success.scrollIntoView({ behavior: 'smooth', block: 'center' });
    success.focus();
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
    const target = errorGroup(form, field) || control;
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (!control) return;
    window.requestAnimationFrame(() => {
      try {
        control.focus({ preventScroll: true });
      } catch (_) {
        control.focus();
      }
    });
  }

  function parseResponseBody(text) {
    if (!text) return '';
    try {
      return JSON.parse(text);
    } catch (_) {
      return text;
    }
  }

  function submissionErrorMessage(status) {
    if (status === 413) return 'One or more files are too large. Please choose smaller files and try again.';
    if (status === 429) return 'Too many attempts. Please wait a few minutes and try again.';
    if (status === 400 || status === 422) {
      return 'The server could not accept the application. Please review the highlighted fields and try again.';
    }
    return 'We could not submit your application. Please try again or contact MCC for help.';
  }

  function portalApiBaseUrl() {
    return defaultPortalApiBaseUrl();
  }

  function defaultPortalApiBaseUrl() {
    return ['localhost', '127.0.0.1'].includes(window.location.hostname)
      ? LOCAL_PORTAL_API_BASE_URL
      : PRODUCTION_PORTAL_API_BASE_URL;
  }

  function getSelectedPrograms(form) {
    return getMultiControlValues(form, 'programsOfInterest')
      .filter((entry) => PROGRAMS.includes(entry));
  }

  function getMultiControlValues(form, name) {
    const values = [];
    form.querySelectorAll(`[name="${cssEscape(name)}"]`).forEach((control) => {
      const controlValue = String(control.value || '').trim();
      if (controlValue && !values.includes(controlValue)) values.push(controlValue);
    });
    return values;
  }

  function getCheckedValues(form, name) {
    return Array.from(form.querySelectorAll(`input[name="${cssEscape(name)}"]:checked`))
      .map((input) => input.value)
      .filter(Boolean);
  }

  function fieldControl(form, field) {
    if (!field) return null;
    return form.querySelector(`[name="${cssEscape(field)}"]`) || document.getElementById(field);
  }

  function errorGroup(form, field) {
    if (GROUP_FIELDS.includes(field)) return form.querySelector(`[data-field-group="${cssEscape(field)}"]`);
    const control = fieldControl(form, field);
    return control ? control.closest('.form-group, .checkbox-group, .agency-choice, fieldset') : null;
  }

  function errorSlot(form, field) {
    return form.querySelector(`#${cssEscape(field)}-error`);
  }

  function value(form, field) {
    const control = fieldControl(form, field);
    if (!control) return '';
    return String(control.value || '').trim();
  }

  function checkbox(form, field) {
    const control = fieldControl(form, field);
    return Boolean(control && control.checked);
  }

  function fileValue(form, field) {
    const control = fieldControl(form, field);
    return control && control.files ? control.files[0] : null;
  }

  function option(value, label) {
    const opt = document.createElement('option');
    opt.value = value;
    opt.textContent = label;
    return opt;
  }

  function hasOption(select, value) {
    return Array.from(select.options).some((opt) => opt.value === value);
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function isReasonablePhone(phone) {
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 7 && digits.length <= 20;
  }

  function isValidWebsite(url) {
    try {
      const parsed = new URL(hasProtocol(url) ? url : `https://${url}`);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch (_) {
      return false;
    }
  }

  function normalizeWebsite(url) {
    const cleanValue = String(url || '').trim();
    if (!cleanValue || !isValidWebsite(cleanValue)) return '';
    return hasProtocol(cleanValue) ? cleanValue : `https://${cleanValue}`;
  }

  function hasProtocol(url) {
    return /^https?:\/\//i.test(String(url || '').trim());
  }

  // Mirrors the portal backend's SIN check: 9 digits + Luhn-style checksum.
  function isValidSin(rawValue) {
    const digits = String(rawValue || '').replace(/\D/g, '');
    if (digits.length !== 9) return false;
    let total = 0;
    for (let index = 0; index < digits.length; index += 1) {
      const number = Number(digits[index]);
      if (index % 2 === 1) {
        const doubled = number * 2;
        total += doubled < 10 ? doubled : doubled - 9;
      } else {
        total += number;
      }
    }
    return total % 10 === 0;
  }

  function isAllowedFile(file) {
    const extension = file.name.split('.').pop().toLowerCase();
    const hasAllowedExtension = ALLOWED_FILE_EXTENSIONS.includes(extension);
    const hasAllowedType = !file.type || ALLOWED_FILE_TYPES.includes(file.type);
    return hasAllowedExtension && hasAllowedType;
  }

  function cssEscape(value) {
    if (window.CSS && typeof window.CSS.escape === 'function') return window.CSS.escape(value);
    return String(value).replace(/["\\]/g, '\\$&');
  }
})();
