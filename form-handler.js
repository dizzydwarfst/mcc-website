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
        const { fields, files } = collectFormData(form);

        const submitResult = await postJSON({
          action: 'submit-data',
          formType: formType,
          data: fields,
        });

        if (!submitResult.ok) {
          throw new Error(submitResult.error || 'Server rejected the submission.');
        }

        for (let i = 0; i < files.length; i++) {
          const { fieldName, file } = files[i];
          setBtn(`<i class="fas fa-upload"></i> Uploading ${i + 1}/${files.length}…`);

          const base64 = await fileToBase64(file);
          const uploadResult = await postJSON({
            action: 'upload-file',
            folderId: submitResult.folderId,
            fieldName: fieldName,
            filename: file.name,
            mimeType: file.type,
            fileData: base64,
          });

          if (!uploadResult.ok) {
            console.warn(`Failed to upload ${file.name}:`, uploadResult.error);
          }
        }

        handleSuccess(form, submitResult);

      } catch (err) {
        console.error('MCC form submission failed:', err);
        alert(
          'Sorry, there was a problem submitting your form.\n' +
          'Please try again, or contact admissions@metropolitancollege.ca.\n\n' +
          'Error details: ' + err.message
        );
        setBtn(originalHTML, false);
      }
    });
  }

  function collectFormData(form) {
    const fields = {};
    const files = [];
    const radioGroups = new Set();

    Array.from(form.elements).forEach((el) => {
      if (!el.name) return;
      if (el.type === 'file') {
        if (el.files && el.files.length > 0) {
          Array.from(el.files).forEach((file) => {
            files.push({ fieldName: el.name, file: file });
          });
          fields[el.name] = `[${el.files.length} file(s) uploaded]`;
        } else {
          fields[el.name] = '';
        }
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

    return { fields, files };
  }

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        const comma = result.indexOf(',');
        resolve(comma >= 0 ? result.slice(comma + 1) : result);
      };
      reader.onerror = () => reject(new Error('Failed to read file: ' + file.name));
      reader.readAsDataURL(file);
    });
  }

  async function postJSON(payload) {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      mode: 'cors',
      redirect: 'follow',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
    });
    return await res.json();
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
    form.innerHTML = `
      <div style="text-align:center;padding:3rem 1rem;">
        <i class="fas fa-check-circle" style="font-size:3rem;color:#D4AF37;margin-bottom:1rem;"></i>
        <h3 style="color:#0F3D2E;margin-bottom:0.5rem;">Thank you!</h3>
        <p style="color:#555;">Your submission has been received. We'll be in touch.</p>
        ${result.applicationId ? `<p style="color:#888;font-size:0.9rem;margin-top:1rem;">Reference: ${result.applicationId}</p>` : ''}
      </div>
    `;
  }
})();
