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
    'primaryMarketRegion',
    'preferredContactChannels',
    'targetEducationLevels',
    'programsOfInterest',
    'promotionalChannels',
  ];

  const FIELD_LABELS = {
    legalName: 'Legal name',
    companyPhone: 'Company / organization phone',
    companyEmail: 'Company / organization email',
    country: 'Country',
    city: 'City',
    primaryMarketRegion: 'Primary market region',
    mainContactName: 'Main contact name',
    mainContactEmail: 'Main contact email',
    mainContactPhone: 'Main contact phone',
    secondaryContactEmail: 'Secondary contact email address',
    secondaryContactPhone: 'Secondary contact phone number',
    gstNumber: 'GST Number',
    natureOfBusinessOther: 'Other nature of business',
    preferredContactChannelOther: 'Other communication channel',
    howDidYouHearAboutMccOther: 'Other source',
    supportingDocument: 'Supporting document',
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
      'country',
      'city',
      'primaryMarketRegion',
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

    if (value(form, 'natureOfBusiness') === OTHER_VALUE) {
      requireValue(form, 'natureOfBusinessOther', errors);
    }

    if (getCheckedValues(form, 'preferredContactChannels').includes(OTHER_VALUE)) {
      requireValue(form, 'preferredContactChannelOther', errors);
    }

    if (value(form, 'howDidYouHearAboutMcc') === OTHER_VALUE) {
      requireValue(form, 'howDidYouHearAboutMccOther', errors);
    }

    const programs = getSelectedPrograms(form);
    if (programs.length > PROGRAM_LIMIT) {
      errors.push({ field: 'programsOfInterest', message: `Choose no more than ${PROGRAM_LIMIT} programs.` });
    }

    validateFileField(form, 'supportingDocument', true, errors);

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
      const text = await response.text();
      const responseBody = parseResponseBody(text);

      if (!response.ok) {
        console.error('Agency application submission failed:', {
          status: response.status,
          errorBody: responseBody,
        });
        throw new Error(submissionErrorMessage(responseBody));
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
    const preferredChannels = expandOtherValueList(
      getCheckedValues(form, 'preferredContactChannels'),
      value(form, 'preferredContactChannelOther')
    );
    const promotionalChannels = getCheckedValues(form, 'promotionalChannels');
    const secondaryMarketRegions = getMultiControlValues(form, 'secondaryMarketRegions');
    const educationLevels = getMultiControlValues(form, 'targetEducationLevels');
    const programs = getSelectedPrograms(form);
    const natureOfBusiness = formatOtherValue(value(form, 'natureOfBusiness'), value(form, 'natureOfBusinessOther'));
    const heardAboutMcc = formatOtherValue(value(form, 'howDidYouHearAboutMcc'), value(form, 'howDidYouHearAboutMccOther'));
    const generalContactInfo = combineTextBlocks([
      value(form, 'generalContactInfo'),
      buildGeneralContactInfo({
        form,
        preferredChannels,
        promotionalChannels,
        secondaryMarketRegions,
        educationLevels,
        programs,
        natureOfBusiness,
        heardAboutMcc,
      }),
    ]);

    appendRequired(data, 'legalName', value(form, 'legalName'));
    appendRequired(data, 'primaryMarketRegion', value(form, 'primaryMarketRegion'));

    appendRequired(data, 'country', value(form, 'country'));
    appendRequired(data, 'city', value(form, 'city'));
    appendRequired(data, 'mainContactName', value(form, 'mainContactName'));
    appendRequired(data, 'mainContactEmail', value(form, 'mainContactEmail'));
    appendRequired(data, 'mainContactPhone', value(form, 'mainContactPhone'));
    data.append('consentConfirmed', checkbox(form, 'consentConfirmed') ? 'true' : 'false');
    data.append('privacyConfirmed', checkbox(form, 'privacyConfirmed') ? 'true' : 'false');

    appendIfValue(data, 'preferredName', value(form, 'preferredName'));
    secondaryMarketRegions.slice(0, 2).forEach((region) => data.append('secondaryMarketRegions', region));
    programs.slice(0, PROGRAM_LIMIT).forEach((program) => {
      data.append('programsOfInterest', program);
    });
    appendIfValue(data, 'provinceState', value(form, 'provinceState'));
    appendIfValue(data, 'postalCode', value(form, 'postalCode'));
    appendIfValue(data, 'streetAddress', value(form, 'streetAddress'));
    appendIfValue(data, 'mainContactJobTitle', value(form, 'mainContactJobTitle'));
    appendIfValue(data, 'companyEmail', value(form, 'companyEmail'));
    appendIfValue(data, 'companyPhone', value(form, 'companyPhone'));
    appendIfValue(data, 'generalContactInfo', generalContactInfo);
    appendIfValue(data, 'shortIntroduction', value(form, 'shortIntroduction'));

    appendIfValue(data, 'estimatedStudentReferralVolume', value(form, 'anticipatedMccStudentsNext12Months'));
    appendIfValue(data, 'preferredContactChannel', preferredChannels.join(', '));
    appendIfValue(data, 'howDidYouHearAboutMcc', heardAboutMcc);
    appendFileIfValue(data, 'supportingDocument', fileValue(form, 'supportingDocument'));

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

  function buildGeneralContactInfo(context) {
    const { form, preferredChannels, promotionalChannels, secondaryMarketRegions, educationLevels, programs, natureOfBusiness, heardAboutMcc } = context;
    const sections = [];

    addSection(sections, 'Secondary contact person', [
      ['Full name', value(form, 'secondaryContactName')],
      ['Preferred name', value(form, 'secondaryContactPreferredName')],
      ['Job title', value(form, 'secondaryContactJobTitle')],
      ['Phone', value(form, 'secondaryContactPhone')],
      ['Email', value(form, 'secondaryContactEmail')],
    ]);

    addSection(sections, 'Communication preferences', [
      ['Preferred channels', preferredChannels.join(', ')],
    ]);

    addSection(sections, 'Agency business information', [
      ['Nature of business', natureOfBusiness],
      ['Number of employees', value(form, 'numberOfEmployees')],
      ['GST Number', value(form, 'gstNumber')],
      ['Students sent to Canada in past 12 months', value(form, 'studentsSentToCanadaLast12Months')],
      ['Anticipated MCC students in next 12 months', value(form, 'anticipatedMccStudentsNext12Months')],
      ['Secondary market regions', secondaryMarketRegions.join(', ')],
      ['Target education levels', educationLevels.join(', ')],
      ['Ranked programs of interest', programs.join(', ')],
      ['Promotional channels used', promotionalChannels.join(', ')],
      ['How they heard about MCC', heardAboutMcc],
    ]);

    return sections.join('\n\n');
  }

  function combineTextBlocks(blocks) {
    return blocks
      .map((block) => String(block || '').trim())
      .filter(Boolean)
      .join('\n\n');
  }

  function addSection(sections, title, rows) {
    const parts = rows
      .filter(([, fieldValue]) => fieldValue)
      .map(([label, fieldValue]) => `${label}: ${fieldValue}`);
    if (parts.length) sections.push(`${title}\n${parts.join('\n')}`);
  }

  function formatOtherValue(baseValue, otherValue) {
    if (baseValue !== OTHER_VALUE) return baseValue;
    return otherValue ? `${OTHER_VALUE}: ${otherValue}` : OTHER_VALUE;
  }

  function expandOtherValueList(values, otherValue) {
    return values
      .map((entry) => (entry === OTHER_VALUE ? formatOtherValue(entry, otherValue) : entry))
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

  function parseResponseBody(text) {
    if (!text) return '';
    try {
      return JSON.parse(text);
    } catch (_) {
      return text;
    }
  }

  function submissionErrorMessage(errorBody) {
    if (typeof errorBody === 'string') return errorBody || 'Agency application submission failed';
    if (!errorBody) return 'Agency application submission failed';

    const detail = errorBody.detail || errorBody.message || errorBody.error;
    if (typeof detail === 'string') return detail;
    if (detail) return JSON.stringify(detail);

    try {
      return JSON.stringify(errorBody);
    } catch (_) {
      return 'Agency application submission failed';
    }
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
    return getMultiControlValues(form, 'programsOfInterest')
      .filter((entry) => PROGRAMS.includes(entry));
  }

  function getMultiControlValues(form, name) {
    return Array.from(form.querySelectorAll(`[name="${cssEscape(name)}"]`))
      .map((control) => String(control.value || '').trim())
      .filter(Boolean);
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

  function isAllowedFile(file) {
    const extension = file.name.split('.').pop().toLowerCase();
    return ALLOWED_FILE_TYPES.includes(file.type) || ALLOWED_FILE_EXTENSIONS.includes(extension);
  }

  function cssEscape(value) {
    if (window.CSS && typeof window.CSS.escape === 'function') return window.CSS.escape(value);
    return String(value).replace(/["\\]/g, '\\$&');
  }
})();
