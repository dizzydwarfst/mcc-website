/**
 * MCC Apply-for-Admissions form handler.
 * Posts structured application data to the LMS Admissions API
 * (POST {API_BASE}/applications). Supporting documents (optional) are presigned
 * via POST {API_BASE}/applications/document-upload, uploaded with a raw PUT
 * straight to R2, then referenced in the application's documents[] array.
 *
 * Loaded with `defer`, so it registers its submit listener before the wizard
 * code in script.js runs (on DOMContentLoaded). It then calls
 * stopImmediatePropagation() so script.js's own submit handler — which would
 * otherwise show the success screen without ever calling the API — never fires.
 * The wizard's step navigation / validation listeners in script.js are
 * separate and keep working.
 */

(function () {
  // Single source of truth for the API base. No other hardcoded URLs.
  const API_BASE = 'https://lms-system-backend-lake.vercel.app/api';

  // Public, active-only program list. CORS is locked to the marketing origin,
  // so a localhost/file:// preview is expected to fall back to the page's
  // hardcoded <option>s — verified live post-deploy.
  const PUBLIC_PROGRAMS_URL = API_BASE + '/public/programs';
  const ASAP_SEMESTER = { value: 'asap', label: 'As soon as possible' };
  const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  let programsByName = new Map();
  let semesterPlaceholderTemplate = null;

  // Document uploads. Values below MUST match the backend's DocTypeLiteral /
  // DocContentTypeLiteral (confirmed against the live lms-system backend).
  const ALLOWED_CONTENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
  const MAX_BYTES = 15 * 1024 * 1024; // client-side guard; presign max_bytes is authoritative

  const DOC_FIELDS = [
    { docType: 'passport',        label: 'Passport',             inputId: 'doc-passport',         required: true },
    { docType: 'study_permit',    label: 'Study Permit',         inputId: 'doc-study-permit',     required: false },
    { docType: 'transcripts',     label: 'Academic Transcripts', inputId: 'doc-transcripts',      required: true },
    { docType: 'english_results', label: 'English Test Results', inputId: 'doc-english-results',  required: false },
    { docType: 'photo',           label: 'Digital photo',        inputId: 'doc-photo',            required: false, allowedTypes: ['image/jpeg', 'image/png'], typeMessage: 'Must be a JPG or PNG.' },
  ];

  const FIELD_CONFIG = [
    { id: 'first_name', label: 'First name', step: 1, message: 'First name is required.' },
    { id: 'last_name', label: 'Last name', step: 1, message: 'Last name is required.' },
    { id: 'dob', label: 'Date of birth', step: 1, message: 'Date of birth is required.' },
    { id: 'gender', label: 'Gender', step: 1, message: 'Gender is required.' },
    { id: 'citizenship', label: 'Country of citizenship', step: 1, message: 'Country of citizenship is required.' },
    { id: 'phone_code', label: 'Phone country code', step: 1, message: 'Phone country code is required.' },
    { id: 'phone_number', label: 'Phone number', step: 1, message: 'Phone number is required.' },
    { id: 'email', label: 'Email', step: 1, message: 'A valid email is required.' },
    { id: 'status', label: 'Status in Canada', step: 1, message: 'Status in Canada is required.' },
    { id: 'sin_number', label: 'Social Insurance Number', step: 1, optional: true },
    { id: 'street_address', label: 'Street address', step: 1, message: 'Street address is required.' },
    { id: 'city', label: 'City', step: 1, message: 'City is required.' },
    { id: 'province', label: 'Province / state', step: 1, message: 'Province / state is required.' },
    { id: 'country', label: 'Country', step: 1, message: 'Country is required.' },
    { id: 'info_update', label: 'Information update agreement', step: 1, message: 'Please confirm you will update your contact information if it changes.' },
    { id: 'using_agency', name: 'using_agency', label: 'Agency question', step: 2, type: 'radio', message: 'Please tell us whether you are using an agency.' },
    { id: 'agent_first_name', label: 'Agent first name', step: 2, agencyOnly: true, message: 'Agent first name is required.' },
    { id: 'agent_last_name', label: 'Agent last name', step: 2, agencyOnly: true, message: 'Agent last name is required.' },
    { id: 'agency_company', label: 'Agency company name', step: 2, agencyOnly: true, message: 'Agency company name is required.' },
    { id: 'agent_phone', label: 'Agent phone', step: 2, agencyOnly: true, message: 'Agent phone is required.' },
    { id: 'agent_email', label: 'Agent email', step: 2, agencyOnly: true, message: 'A valid agent email is required.' },
    { id: 'program', label: 'Program', step: 3, message: 'Please choose a program.' },
    { id: 'semester', label: 'Preferred start date', step: 3, message: 'Please choose a preferred start date.' },
    { id: 'attendance_mode', name: 'attendance_mode', label: 'Attendance mode', step: 3, type: 'radio', message: 'Please choose how you will attend classes.' },
    { id: 'pathway_plan', name: 'pathway_plan', label: 'University pathway question', step: 3, type: 'radio', message: 'Please answer the university-pathway question.' },
    { id: 'signature_name', label: 'Signature', step: 4, message: 'Please type your full legal name as your signature.' },
    { id: 'terms_agreement', label: 'Declaration and consent', step: 4, message: 'Please agree to the policies, terms and conditions before submitting.' },
    ...DOC_FIELDS.map((f) => ({ id: f.inputId, label: f.label, step: 4 })),
  ];

  const FIELD_BY_ID = FIELD_CONFIG.reduce((acc, field) => {
    acc[field.id] = field;
    return acc;
  }, {});

  const SERVER_FIELD_MAP = {
    first_name: 'first_name',
    last_name: 'last_name',
    preferred_name: 'preferred_name',
    date_of_birth: 'dob',
    gender: 'gender',
    country_of_citizenship: 'citizenship',
    phone_country_code: 'phone_code',
    phone_number: 'phone_number',
    email: 'email',
    status_in_canada: 'status',
    status_expiry_date: 'status_expiry',
    sin_number: 'sin_number',
    address: 'street_address',
    'address.unit': 'apt_unit',
    'address.street': 'street_address',
    'address.city': 'city',
    'address.province_state': 'province',
    'address.postal_code': 'postal_code',
    'address.country': 'country',
    using_agency: 'using_agency',
    agent_first_name: 'agent_first_name',
    agent_last_name: 'agent_last_name',
    agency_company_name: 'agency_company',
    agent_phone: 'agent_phone',
    agent_email: 'agent_email',
    agency_notes: 'agency_notes',
    program: 'program',
    intended_semester: 'semester',
    campus: 'campus',
    attendance_mode: 'attendance_mode',
    university_pathway: 'pathway_plan',
    signature_full_name: 'signature_name',
    agreed_to_policies: 'terms_agreement',
    documents: 'doc-passport',
  };

  const ready = (fn) => (document.readyState !== 'loading')
    ? fn()
    : document.addEventListener('DOMContentLoaded', fn);

  ready(() => {
    const form = document.getElementById('wizard-form');
    if (form) attach(form);
    initializeSemesterSelect();
    loadLivePrograms();
  });

  // ── Live program list ──
  // Swap the hardcoded <option>s for the portal's live, active-only programs so
  // adding/archiving a program in the portal admin reflects here with no
  // marketing redeploy. Only the option *source* changes; the submitted program
  // value stays whatever the <select> sends — now constrained to canonical names.
  async function loadLivePrograms() {
    const select = document.getElementById('program');
    if (!select) return;
    try {
      const res = await fetch(PUBLIC_PROGRAMS_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const programs = await res.json();
      if (!Array.isArray(programs) || programs.length === 0) {
        throw new Error('empty or malformed program list');
      }
      populatePrograms(select, programs);
      syncSemesterSelect(select.value, true);
    } catch (err) {
      // Network / CORS / timeout / bad shape — keep the hardcoded fallback and
      // never block the form. (Locally, CORS blocks this; that's expected.)
      console.warn('[MCC apply] live program list unavailable; using fallback options', err);
    }
  }

  function populatePrograms(select, programs) {
    const placeholder = select.querySelector('option[value=""]');
    const previous = select.value; // preserve any selection across the swap
    programsByName = new Map(
      programs
        .filter((program) => program && typeof program.name === 'string' && program.name.trim())
        .map((program) => [program.name, program])
    );
    while (select.firstChild) select.removeChild(select.firstChild);
    if (placeholder) select.appendChild(placeholder); // re-attach the detached placeholder
    for (const p of programsByName.values()) {
      const opt = document.createElement('option');
      opt.value = p.name;        // value = name — matches what buildPayload() submits
      opt.textContent = p.name;
      select.appendChild(opt);
    }
    select.value = previous; // restores the prior choice if it's still in the list
  }

  function initializeSemesterSelect() {
    const programSelect = document.getElementById('program');
    const semesterSelect = document.getElementById('semester');
    if (!programSelect || !semesterSelect) return;

    const placeholder = semesterSelect.querySelector('option[value=""]');
    semesterPlaceholderTemplate = placeholder ? placeholder.cloneNode(true) : null;

    syncSemesterSelect(programSelect.value, true);
    programSelect.addEventListener('change', () => syncSemesterSelect(programSelect.value));
  }

  function syncSemesterSelect(programName, preserveSelection) {
    const semesterSelect = document.getElementById('semester');
    if (!semesterSelect) return;

    const program = programsByName.get(programName);
    const semesters = program && Array.isArray(program.semesters)
      ? program.semesters
      : [];
    populateSemesters(semesterSelect, programName, semesters, preserveSelection);
  }

  function populateSemesters(select, programName, semesters, preserveSelection) {
    const previous = preserveSelection ? select.value : '';
    const placeholder = getSemesterPlaceholder();
    const hasProgram = Boolean(programName);
    const configuredStartDates = semesters
      .filter((semester) => typeof semester === 'string' && semester.trim())
      .map((semester) => semester.trim())
      .filter((semester, index, values) => values.indexOf(semester) === index)
      .filter((semester) => {
        const normalized = semester.toLowerCase();
        return normalized !== ASAP_SEMESTER.value && normalized !== ASAP_SEMESTER.label.toLowerCase();
      });

    while (select.firstChild) select.removeChild(select.firstChild);

    if (!hasProgram) {
      if (placeholder) select.appendChild(placeholder);
      select.disabled = true;
      select.value = '';
      return;
    }

    // Programs without configured start dates intentionally show ASAP as their
    // only available choice, rather than an empty or disabled control.
    if (configuredStartDates.length && placeholder) select.appendChild(placeholder);
    appendOption(select, ASAP_SEMESTER.value, ASAP_SEMESTER.label);
    configuredStartDates.forEach((startDate) => {
      appendOption(select, startDate, formatStartDate(startDate));
    });

    select.disabled = false;
    if (previous && Array.from(select.options).some((option) => option.value === previous)) {
      select.value = previous;
    }
  }

  function appendOption(select, value, label) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = label;
    select.appendChild(option);
  }

  // ISO dates must be split before formatting: new Date('YYYY-MM-DD') treats
  // the value as UTC midnight and can render the prior day in Vancouver.
  // Legacy free-text values remain visible unchanged until staff replace them.
  function formatStartDate(value) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) return value;

    const year = Number(match[1]);
    const monthIndex = Number(match[2]) - 1;
    const day = Number(match[3]);
    const localDate = new Date(year, monthIndex, day);

    if (
      monthIndex < 0 ||
      monthIndex > 11 ||
      localDate.getFullYear() !== year ||
      localDate.getMonth() !== monthIndex ||
      localDate.getDate() !== day
    ) {
      return value;
    }

    return `${MONTH_NAMES[monthIndex]} ${day}, ${year}`;
  }

  function getSemesterPlaceholder() {
    if (semesterPlaceholderTemplate) return semesterPlaceholderTemplate.cloneNode(true);

    const option = document.createElement('option');
    option.value = '';
    option.textContent = 'Choose an option';
    option.setAttribute('data-i18n', 'apply.s3_choose');
    return option;
  }

  function attach(form) {
    if (form.dataset.mccBound === '1') return;
    form.dataset.mccBound = '1';

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      e.stopImmediatePropagation(); // block script.js's bare success-screen handler

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalHTML = submitBtn ? submitBtn.innerHTML : '';
      const setBtn = (html, disabled) => {
        if (!submitBtn) return;
        submitBtn.disabled = disabled;
        submitBtn.innerHTML = html;
      };

      // Client-side validation mirroring the server model. Don't send if invalid.
      clearAllErrors(form);
      const clientErrors = validate(form);
      if (clientErrors.length) {
        showValidationErrors(form, clientErrors, 'Please fix the highlighted fields before submitting.');
        return;
      }

      const payload = buildPayload(form);

      // Required documents must be attached before we upload or submit anything.
      const missingDocs = DOC_FIELDS.filter(
        (f) => f.required && !document.getElementById(f.inputId)?.files?.[0]
      );
      if (missingDocs.length) {
        showValidationErrors(
          form,
          missingDocs.map((f) => ({
            field: f.inputId,
            label: f.label,
            message: `${f.label} is required.`,
            step: 4,
          })),
          'Please attach the required documents before submitting.'
        );
        return;
      }

      // Upload attached documents. Required fields are guaranteed present above;
      // optional ones are skipped when empty (and type/size-checked when attached).
      let documents = [];
      try {
        setBtn('<i class="fas fa-spinner fa-spin"></i> Uploading documents…', true);
        documents = await collectDocuments();
      } catch (e) {
        const uploadError = normalizeUploadError(e);
        console.error('[MCC apply] document upload failed', sanitizeSensitiveText(uploadError.message));
        showValidationErrors(
          form,
          uploadError.field ? [uploadError] : [],
          uploadError.message || 'We could not upload your documents. Please try again.'
        );
        setBtn(originalHTML, false);
        return; // do not submit a partial application silently
      }
      payload.documents = documents;

      try {
        setBtn('<i class="fas fa-spinner fa-spin"></i> Submitting…', true);

        const res = await fetch(API_BASE + '/applications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.status === 201) {
          let data = {};
          try { data = await res.json(); } catch (_) { /* tolerate empty body */ }
          handleSuccess(data.application_id);
          return;
        }

        const body = await readResponseBody(res);
        const failure = parseServerFailure(res.status, body);
        console.error('[MCC apply] submit failed', { status: res.status, reason: failure.summary });
        showValidationErrors(form, failure.fieldErrors, failure.summary);
        setBtn(originalHTML, false);

      } catch (err) {
        // Network / CORS / fetch rejection.
        const message = sanitizeSensitiveText(`Network error: ${(err && err.message) || 'Could not reach the server'}. Please check your connection and try again, or email admissions@metropolitancollege.ca.`);
        console.error('[MCC apply] network error', sanitizeSensitiveText((err && err.message) || err));
        showValidationErrors(form, [], message);
        setBtn(originalHTML, false);
      }
    });
  }

  // ── Helpers ──
  const val = (id) => {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
  };
  const radio = (name) => {
    const el = document.querySelector(`input[name="${name}"]:checked`);
    return el ? el.value : '';
  };

  function isUsingAgency() {
    return radio('using_agency') === 'yes';
  }

  // ── Document uploads ──

  function validateFile(file, field) {
    const allowedTypes = field && field.allowedTypes ? field.allowedTypes : ALLOWED_CONTENT_TYPES;
    if (!allowedTypes.includes(file.type)) {
      return (field && field.typeMessage) || 'Must be a PDF, JPG, or PNG.';
    }
    if (file.size < 1) return 'File looks empty.';
    if (file.size > MAX_BYTES) return 'Must be 15 MB or smaller.';
    return null;
  }

  // presign -> raw PUT to R2 -> resolve to the documents[] entry for this file.
  async function uploadDocument(docType, file) {
    // 1) Presign. Body keys are EXACTLY these — the backend model is extra="forbid".
    //    company_website is the honeypot; pass the live form value (empty for humans).
    const presignRes = await fetch(API_BASE + '/applications/document-upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        doc_type: docType,
        filename: file.name,
        content_type: file.type,
        company_website: val('company_website'),
      }),
    });
    if (!presignRes.ok) {
      const body = await readResponseBody(presignRes);
      throw new Error(responseMessage(presignRes.status, body, 'Could not prepare upload'));
    }
    const { url, method, headers, max_bytes, key } = await presignRes.json();

    if (max_bytes && file.size > max_bytes) throw new Error('File exceeds the server limit.');

    // 2) Raw PUT straight to R2 — body is the File itself, signed headers verbatim.
    //    Do NOT use FormData/JSON and do NOT override Content-Type, or the signature breaks.
    const putRes = await fetch(url, { method, headers, body: file });
    if (!putRes.ok) throw new Error(`Upload failed (HTTP ${putRes.status}).`);

    // 3) documents[] entry — EXACTLY these 5 keys (extra="forbid").
    return {
      doc_type: docType,
      key,
      filename: file.name,
      content_type: file.type,
      size: file.size,
    };
  }

  // Validates + uploads every attached file in order. Throws { field, message }
  // on the first problem so the error attributes cleanly to one field.
  async function collectDocuments() {
    const documents = [];
    for (const f of DOC_FIELDS) {
      const file = document.getElementById(f.inputId)?.files?.[0];
      if (!file) continue; // optional fields are skipped when empty
      const err = validateFile(file, f);
      if (err) throw { field: f.inputId, label: f.label, message: err };
      try {
        documents.push(await uploadDocument(f.docType, file)); // sequential = clean attribution
      } catch (uploadErr) {
        const message = uploadErr && uploadErr.message ? uploadErr.message : 'Upload failed.';
        throw { field: f.inputId, label: f.label, message };
      }
    }
    return documents;
  }

  function normalizeUploadError(error) {
    if (!error || typeof error !== 'object') {
      return { message: 'We could not upload your documents. Please try again.' };
    }
    return {
      field: error.field,
      label: error.label || getFieldLabel(error.field),
      message: sanitizeSensitiveText(error.message || 'We could not upload your documents. Please try again.'),
      step: error.step || getStepForField(error.field),
    };
  }

  function clearAllErrors(form) {
    form.querySelectorAll('.input-error').forEach((el) => {
      el.classList.remove('input-error');
      el.removeAttribute('aria-invalid');
    });
    form.querySelectorAll('.has-error').forEach((el) => el.classList.remove('has-error'));
    form.querySelectorAll('.error-msg').forEach((slot) => {
      if (Object.prototype.hasOwnProperty.call(slot.dataset, 'defaultError')) {
        slot.textContent = slot.dataset.defaultError;
      }
      slot.style.display = '';
    });
    const box = document.getElementById('apply-submit-error');
    if (box) box.style.display = 'none';
  }

  function buildPayload(form) {
    const usingAgency = isUsingAgency();

    const payload = {
      // Step 1 — Personal
      first_name: val('first_name'),
      last_name: val('last_name'),
      preferred_name: val('preferred_name'),
      date_of_birth: val('dob'),
      gender: val('gender'),
      country_of_citizenship: val('citizenship'),
      phone_country_code: val('phone_code'),
      phone_number: val('phone_number'),
      email: val('email'),
      status_in_canada: val('status'),
      status_expiry_date: val('status_expiry'),
      address: {
        unit: val('apt_unit'),
        street: val('street_address'),
        city: val('city'),
        province_state: val('province'),
        postal_code: val('postal_code'),
        country: val('country'),
      },

      // Step 2 — Agency (agent fields only when using an agency; the API rejects
      // non-empty agency fields when using_agency is false).
      using_agency: usingAgency,

      // Step 3 — Program
      program: val('program'),
      intended_semester: val('semester'),
      campus: val('campus') || 'undecided',
      attendance_mode: radio('attendance_mode'),
      university_pathway: radio('pathway_plan'),

      // Step 4 — Declaration
      signature_full_name: val('signature_name'),
      agreed_to_policies: !!document.getElementById('terms_agreement')?.checked,

      // Honeypot — must stay empty for real users.
      company_website: val('company_website'),
    };

    const sinNumber = val('sin_number');
    if (sinNumber) payload.sin_number = sinNumber;

    if (usingAgency) {
      payload.agent_first_name = val('agent_first_name');
      payload.agent_last_name = val('agent_last_name');
      payload.agency_company_name = val('agency_company');
      payload.agent_phone = val('agent_phone');
      payload.agent_email = val('agent_email');
      payload.agency_notes = val('agency_notes');
    }

    return payload;
  }

  function validate(form) {
    const errors = [];
    for (const field of FIELD_CONFIG) {
      if (field.id.startsWith('doc-')) continue;
      if (field.agencyOnly && !isUsingAgency()) continue;

      if (field.type === 'radio') {
        if (!radio(field.name || field.id)) errors.push(toFieldError(field));
        continue;
      }

      const control = document.getElementById(field.id);
      if (!control) continue;

      if (control.type === 'checkbox') {
        if (!control.checked) errors.push(toFieldError(field));
        continue;
      }

      if (field.optional && !val(field.id)) continue;

      if (!val(field.id)) {
        errors.push(toFieldError(field));
        continue;
      }

      if (control.type === 'email' && !control.checkValidity()) {
        errors.push(toFieldError(field, `Please enter a valid ${field.label.toLowerCase()}.`));
      }
    }
    return errors;
  }

  function toFieldError(field, message) {
    return {
      field: field.id,
      label: field.label,
      message: message || field.message || `${field.label} is required.`,
      step: field.step,
    };
  }

  function showValidationErrors(form, errors, summary) {
    const uniqueErrors = dedupeErrors(errors);
    uniqueErrors.forEach(setFieldError);

    const targetStep = uniqueErrors[0] ? uniqueErrors[0].step : getCurrentStep();
    const box = getErrorSummaryBox(form, targetStep);
    box.textContent = '';

    const title = document.createElement('strong');
    title.textContent = sanitizeSensitiveText(summary || (uniqueErrors.length
      ? 'Please fix the highlighted fields before submitting.'
      : 'We could not submit your application.'));
    box.appendChild(title);

    if (uniqueErrors.length) {
      const list = document.createElement('ul');
      list.style.cssText = 'margin:0.6rem 0 0 1.1rem;padding:0;';
      uniqueErrors.forEach((error) => {
        const item = document.createElement('li');
        item.textContent = `${error.label || getFieldLabel(error.field)}: ${sanitizeSensitiveText(error.message)}`;
        list.appendChild(item);
      });
      box.appendChild(list);
    }

    box.style.display = 'block';

    const first = uniqueErrors.find((error) => getControlForField(error.field));
    if (first) {
      focusField(first.field);
    } else {
      box.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function dedupeErrors(errors) {
    const seen = new Set();
    const result = [];
    for (const error of errors || []) {
      if (!error || !error.message) continue;
      const key = error.field || error.message;
      if (seen.has(key)) continue;
      seen.add(key);
      result.push({
        field: error.field,
        label: error.label || getFieldLabel(error.field),
        message: sanitizeSensitiveText(error.message),
        step: error.step || getStepForField(error.field),
      });
    }
    return result;
  }

  function setFieldError(error) {
    const control = getControlForField(error.field);
    const slot = getErrorSlot(error.field);
    const group = getErrorGroup(error.field);

    if (control) {
      control.classList.add('input-error');
      control.setAttribute('aria-invalid', 'true');
      if (slot) {
        if (!slot.id) slot.id = `${error.field}-error`;
        control.setAttribute('aria-describedby', slot.id);
      }
    }
    if (group) group.classList.add('has-error');
    if (slot) {
      if (!Object.prototype.hasOwnProperty.call(slot.dataset, 'defaultError')) {
        slot.dataset.defaultError = slot.textContent;
      }
      slot.textContent = sanitizeSensitiveText(error.message);
      slot.style.display = 'block';
    }
  }

  function getControlForField(fieldId) {
    if (!fieldId) return null;
    return document.getElementById(fieldId) || document.querySelector(`[name="${fieldId}"]`);
  }

  function getErrorSlot(fieldId) {
    if (!fieldId) return null;
    const explicit = document.getElementById(`${fieldId}-error`);
    if (explicit) return explicit;
    const docField = DOC_FIELDS.find((f) => f.inputId === fieldId);
    if (docField) return document.getElementById(`${docField.inputId}-error`);

    const control = getControlForField(fieldId);
    if (!control) return null;
    if (fieldId === 'terms_agreement') return document.getElementById('terms_agreement-error');
    if (fieldId === 'info_update') return document.getElementById('info_update-error');

    const group = control.closest('.form-group') || control.closest('.checkbox-group');
    if (!group) return null;
    return group.querySelector('.error-msg') || group.nextElementSibling;
  }

  function getErrorGroup(fieldId) {
    const control = getControlForField(fieldId);
    if (!control) return null;
    return control.closest('.form-group') || control.closest('.checkbox-group');
  }

  function focusField(fieldId) {
    const control = getControlForField(fieldId);
    if (!control) return;

    const step = getStepForField(fieldId);
    activateStep(step);

    window.requestAnimationFrame(() => {
      const target = getErrorGroup(fieldId) || control;
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      try {
        control.focus({ preventScroll: true });
      } catch (_) {
        control.focus();
      }
    });
  }

  function activateStep(step) {
    const stepNum = Number(step);
    if (!Number.isFinite(stepNum)) return;
    if (window.mccApplyWizard && typeof window.mccApplyWizard.goToStep === 'function') {
      window.mccApplyWizard.goToStep(stepNum);
      return;
    }

    document.querySelectorAll('.form-step').forEach((el) => {
      el.classList.toggle('active', el.dataset.step === String(stepNum));
    });
    document.querySelectorAll('.step-indicator').forEach((ind, idx) => {
      const indicatorStep = idx + 1;
      ind.classList.toggle('active', indicatorStep === stepNum);
      ind.classList.toggle('completed', indicatorStep < stepNum);
    });
  }

  function getStepForField(fieldId) {
    const known = FIELD_BY_ID[fieldId];
    if (known) return known.step;
    const control = getControlForField(fieldId);
    const stepEl = control ? control.closest('.form-step') : null;
    return stepEl ? Number(stepEl.dataset.step) : 4;
  }

  function getFieldLabel(fieldId) {
    const known = FIELD_BY_ID[fieldId];
    return known ? known.label : 'Application field';
  }

  function getErrorSummaryBox(form, step) {
    let box = document.getElementById('apply-submit-error');
    if (!box) {
      box = document.createElement('div');
      box.id = 'apply-submit-error';
      box.setAttribute('role', 'alert');
      box.style.cssText = 'margin:1.25rem 0;padding:0.9rem 1.1rem;border-radius:8px;' +
        'background:#fdecea;border:1px solid #f5c6cb;color:#a12622;font-size:0.95rem;line-height:1.5;';
    }
    const buttons = form.querySelector(`.form-step[data-step="${step || 4}"] .wizard-buttons`) ||
      form.querySelector('.form-step.active .wizard-buttons') ||
      form.querySelector('.form-step[data-step="4"] .wizard-buttons');
    if (buttons) buttons.parentNode.insertBefore(box, buttons);
    else form.appendChild(box);
    return box;
  }

  function getCurrentStep() {
    if (window.mccApplyWizard && typeof window.mccApplyWizard.getCurrentStep === 'function') {
      return window.mccApplyWizard.getCurrentStep();
    }
    const active = document.querySelector('.form-step.active');
    return active ? Number(active.dataset.step) : 4;
  }

  async function readResponseBody(res) {
    const text = await res.text();
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch (_) {
      return text;
    }
  }

  function parseServerFailure(status, body) {
    const fieldErrors = [];
    const general = [];

    const detail = body && typeof body === 'object' ? body.detail : null;
    if (Array.isArray(detail)) {
      detail.forEach((item) => {
        const loc = Array.isArray(item.loc) ? item.loc : [];
        const field = mapServerLocToField(loc);
        const message = sanitizeSensitiveText(item.msg || 'This field could not be accepted.');
        if (field) {
          fieldErrors.push({
            field,
            label: getFieldLabel(field),
            message,
            step: getStepForField(field),
          });
        } else {
          general.push(sanitizeSensitiveText(`${humanizeServerLoc(loc)}: ${message}`));
        }
      });
    } else if (typeof detail === 'string') {
      general.push(sanitizeSensitiveText(detail));
    } else if (body && typeof body === 'object' && typeof body.error === 'string') {
      general.push(sanitizeSensitiveText(body.error));
    } else if (typeof body === 'string') {
      general.push(sanitizeSensitiveText(body));
    }

    return {
      fieldErrors,
      summary: fieldErrors.length
        ? 'Please correct the highlighted fields and submit again.'
        : (general[0] || responseMessage(status, body, 'The server rejected the application')),
    };
  }

  function sanitizeSensitiveText(value) {
    if (typeof value !== 'string') return value;
    return value
      .replace(/((?:sin_number|social insurance number|sin)\s*[:=]\s*)["']?[\d -]{3,}["']?/gi, '$1[redacted]')
      .replace(/\b\d{3}[- ]?\d{3}[- ]?\d{3}\b/g, '[redacted SIN]');
  }

  function responseMessage(status, body, fallback) {
    if (body && typeof body === 'object') {
      if (typeof body.detail === 'string') return sanitizeSensitiveText(body.detail);
      if (typeof body.error === 'string') return sanitizeSensitiveText(body.error);
    }
    if (typeof body === 'string' && body.trim()) return sanitizeSensitiveText(body.trim());
    if (status === 429) return 'Too many attempts. Please wait a moment and try again.';
    if (status === 400 || status === 422) return `${fallback} (HTTP ${status}). Please review the highlighted fields.`;
    return `${fallback} (HTTP ${status}) without details. Please try again, or email admissions@metropolitancollege.ca.`;
  }

  function mapServerLocToField(loc) {
    const parts = loc.filter((part) => part !== 'body').map(String);
    if (!parts.length) return null;

    if (parts[0] === 'documents') {
      const index = Number(parts[1]);
      return DOC_FIELDS[index] ? DOC_FIELDS[index].inputId : DOC_FIELDS[0].inputId;
    }

    for (let len = parts.length; len > 0; len--) {
      const key = parts.slice(0, len).join('.');
      if (SERVER_FIELD_MAP[key]) return SERVER_FIELD_MAP[key];
    }

    return document.getElementById(parts[0]) ? parts[0] : null;
  }

  function humanizeServerLoc(loc) {
    const parts = loc.filter((part) => part !== 'body').map(String);
    if (!parts.length) return 'Submission';
    return parts.join(' / ').replace(/_/g, ' ');
  }

  function handleSuccess(applicationId) {
    const successEl = document.getElementById('wizard-success');
    const wizardEl = document.getElementById('wizard-container');
    if (applicationId) {
      const p = document.querySelector('#wizard-success p');
      if (p) {
        const ref = document.createElement('p');
        ref.style.cssText = 'color:#0F3D2E;font-weight:700;margin:0 auto 2rem;font-size:1rem;';
        ref.textContent = 'Your reference: ' + applicationId;
        p.insertAdjacentElement('afterend', ref);
      }
    }
    if (successEl && wizardEl) {
      wizardEl.style.display = 'none';
      successEl.style.display = 'block';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
})();
