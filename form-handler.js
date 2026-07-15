/**
 * MCC Forms Handler
 * Wires up any <form data-form-type="..."> to the MCC Forms Apps Script backend.
 * Loads BEFORE script.js so it registers its submit listener first.
 */

(function () {
  const ENDPOINT = 'https://script.google.com/macros/s/AKfycbwG-SO5SXt1WAIV_-qqVDLyW7J_JlqWfOCxQH7kjVN_BTtYxWj1F8S3HwSo2F-EwCMZ/exec';

  const ready = (fn) => (document.readyState !== 'loading')
    ? fn()
    : document.addEventListener('DOMContentLoaded', fn);

  ready(() => {
    document.querySelectorAll('form[data-form-type]').forEach(attach);
  });

  function attach(form) {
    if (form.dataset.mccBound === '1') return;
    form.dataset.mccBound = '1';

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalHTML = submitBtn ? submitBtn.innerHTML : '';
      const setBtn = (text, disabled = true) => {
        if (!submitBtn) return;
        submitBtn.disabled = disabled;
        submitBtn.innerHTML = text;
      };

      try {
        setBtn('<i class="fas fa-spinner fa-spin"></i> Submitting…');

        const formType = form.dataset.formType;
        const fields = collectFormData(form);

        const submitResult = await postJSON({
          action: 'submit-data',
          formType: formType,
          data: fields,
        });

        handleSuccess(form, submitResult);

      } catch {
        console.error('MCC form submission failed.');
        alert(
          'Sorry, there was a problem submitting your form.\n' +
          'Please try again, or contact admissions@metropolitancollege.ca.'
        );
        setBtn(originalHTML, false);
      }
    });
  }

  function collectFormData(form) {
    const fields = {};
    const radioGroups = new Set();

    Array.from(form.elements).forEach((el) => {
      if (!el.name) return;
      if (el.type === 'file') {
        return;
      } else if (el.type === 'checkbox') {
        fields[el.name] = el.checked ? 'Yes' : 'No';
      } else if (el.type === 'radio') {
        if (radioGroups.has(el.name)) return;
        const checked = form.querySelector(`input[type="radio"][name="${el.name}"]:checked`);
        fields[el.name] = checked ? checked.value : '';
        radioGroups.add(el.name);
      } else if (el.type === 'submit' || el.type === 'button' || el.type === 'reset') {
        // skip
      } else {
        fields[el.name] = el.value;
      }
    });

    return fields;
  }

  async function postJSON(payload) {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      mode: 'cors',
      redirect: 'follow',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Submission failed (HTTP ${res.status}).`);
    const result = await res.json();
    if (!result || result.ok !== true) throw new Error('The submission was rejected.');
    return result;
  }

  function handleSuccess(form, result) {
    const successEl = document.getElementById('wizard-success');
    const wizardEl = document.getElementById('wizard-container');
    if (successEl && wizardEl) {
      wizardEl.style.display = 'none';
      successEl.style.display = 'block';
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
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
    title.textContent = 'Thank you!';

    const message = document.createElement('p');
    message.style.color = '#555';
    message.textContent = "Your submission has been received. We'll be in touch.";

    success.append(icon, title, message);

    const applicationId = result && ['string', 'number'].includes(typeof result.applicationId)
      ? String(result.applicationId)
      : '';
    if (applicationId) {
      const reference = document.createElement('p');
      reference.style.cssText = 'color:#888;font-size:0.9rem;margin-top:1rem;';
      reference.textContent = `Reference: ${applicationId}`;
      success.appendChild(reference);
    }

    form.replaceChildren(success);
    success.focus();
  }
})();
