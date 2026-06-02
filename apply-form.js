/**
 * MCC Apply-for-Admissions form handler.
 * Posts structured application data to the LMS Admissions API
 * (POST {API_BASE}/applications). Documents are deferred (no uploads here);
 * the admissions team collects them after submission.
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

  const ready = (fn) => (document.readyState !== 'loading')
    ? fn()
    : document.addEventListener('DOMContentLoaded', fn);

  ready(() => {
    const form = document.getElementById('wizard-form');
    if (form) attach(form);
  });

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
      const problem = validate(form);
      if (problem) {
        showError(form, problem);
        return;
      }

      const payload = buildPayload(form);

      try {
        setBtn('<i class="fas fa-spinner fa-spin"></i> Submitting…', true);
        clearError(form);

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

        // Non-201: friendly message, keep the user's data, log details.
        let message;
        if (res.status === 429) {
          message = 'Too many attempts, please wait a moment and try again.';
        } else if (res.status === 422 || res.status === 400) {
          message = 'Some details could not be accepted. Please review your entries and try again.';
        } else {
          message = 'Sorry, something went wrong submitting your application. Please try again.';
        }
        let body = null;
        try { body = await res.json(); } catch (_) { /* ignore */ }
        console.error('[MCC apply] submit failed', res.status, body);
        showError(form, message);
        setBtn(originalHTML, false);

      } catch (err) {
        // Network / CORS / fetch rejection.
        console.error('[MCC apply] network error', err);
        showError(form, 'We couldn’t reach the server. Please check your connection and try again, or email admissions@metropolitancollege.ca.');
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
    const required = {
      first_name: 'First name', last_name: 'Last name', dob: 'Date of birth',
      gender: 'Gender', citizenship: 'Country of citizenship',
      phone_code: 'Phone country code', phone_number: 'Phone number',
      email: 'Email', status: 'Status in Canada', street_address: 'Street address',
      city: 'City', province: 'Province / state', country: 'Country',
      program: 'Program', semester: 'Intended semester',
      signature_name: 'Signature',
    };
    for (const [id, label] of Object.entries(required)) {
      if (!val(id)) return `Please complete a required field: ${label}.`;
    }
    if (!radio('attendance_mode')) return 'Please choose how you will attend classes.';
    if (!radio('pathway_plan')) return 'Please answer the university-pathway question.';
    if (!radio('using_agency')) return 'Please tell us whether you are using an agency.';

    if (isUsingAgency()) {
      const agentReq = {
        agent_first_name: 'Agent first name', agent_last_name: 'Agent last name',
        agency_company: 'Agency company name', agent_phone: 'Agent phone',
        agent_email: 'Agent email',
      };
      for (const [id, label] of Object.entries(agentReq)) {
        if (!val(id)) return `Please complete a required field: ${label}.`;
      }
    }

    const terms = document.getElementById('terms_agreement');
    if (!terms || !terms.checked) {
      return 'Please agree to the policies, terms and conditions before submitting.';
    }
    return null;
  }

  function showError(form, message) {
    let box = document.getElementById('apply-submit-error');
    if (!box) {
      box = document.createElement('div');
      box.id = 'apply-submit-error';
      box.setAttribute('role', 'alert');
      box.style.cssText = 'margin:1.25rem 0;padding:0.9rem 1.1rem;border-radius:8px;' +
        'background:#fdecea;border:1px solid #f5c6cb;color:#a12622;font-size:0.95rem;';
      const buttons = form.querySelector('.form-step[data-step="4"] .wizard-buttons');
      if (buttons) buttons.parentNode.insertBefore(box, buttons);
      else form.appendChild(box);
    }
    box.textContent = message;
    box.style.display = 'block';
    box.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function clearError(form) {
    const box = document.getElementById('apply-submit-error');
    if (box) box.style.display = 'none';
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
