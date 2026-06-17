# Portal Follow-Up: Apply Form Backend Blockers

The marketing apply form can now surface field-level errors, but three requested items need portal/API changes before they can be completed safely.

## 1. Application SIN support

Current finding: `POST /api/applications` rejects `sin_number` with `extra_forbidden`. The OpenAPI routes expose SIN handling for agents (`/api/agents/{agent_id}/sin`) but not for applications or students.

Needed portal change:
- Add an optional SIN field to the public application intake model.
- Store it only through encrypted SIN handling, using the existing SIN encryption path/key.
- Do not log, echo, or persist plaintext SIN in application records, validation errors, request logs, or conversion notes.
- Decide how SIN transfers when an application converts to a student.

## 2. Optional applicant photo upload

Current finding: `POST /api/applications/document-upload` rejects `photo` and `student_photo`. Accepted `doc_type` values are only `passport`, `study_permit`, `transcripts`, and `english_results`.

Needed portal change:
- Add an optional photo document type to the document upload literal/schema.
- Allow `image/jpeg` and `image/png` for the photo type.
- Preserve the existing R2 presign and application `documents[]` flow.
- Decide where the uploaded photo lands after application conversion for school ID/profile use.

## 3. French program application 500

Current finding: the live public program list returns canonical French names:
- `French as a Second Language (FSL)`
- `French Test Preparation (TCF & TEF)`

Non-creatable French application probes using those canonical names reached `POST /api/applications` and returned `HTTP 500` with an empty body. This points to a server-side failure after validation, not a client-side encoding issue with `&` or parentheses.

Needed portal change:
- Reproduce with each French program above.
- Fix the application submit/conversion path so both names are accepted.
- Return structured 4xx field-level errors when the request is invalid instead of an empty 500.
