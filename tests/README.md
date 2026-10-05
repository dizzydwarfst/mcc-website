# Marketing-site tests

The site is static — no bundler, no `package.json`, no build step — so these run
on Node's built-in test runner with no dependency to install.

```
node --test "tests/*.test.js"
```

(Node 18+; developed against Node 22.)

## What is covered

| File | Covers |
| --- | --- |
| `portal-api.test.js` | API base configuration, endpoint paths, field limits vs. the backend, email normalisation, HTTP status → visitor wording |
| `contact-form.test.js` | `POST /api/public/contact-inquiries` through the real `form-handler.js` |
| `newsletter-form.test.js` | `POST /api/public/newsletter-subscriptions` through the real `form-handler.js` |
| `website-signup.test.js` | `POST /api/public/website-signups` — `consent_to_contact` is always explicit |

`helpers/mini-dom.js` is a hand-built DOM covering only what `form-handler.js`
touches, and `helpers/form-harness.js` evaluates the shipped handler against it
in a `vm` context. Nothing in the handler is stubbed, so a change that breaks a
form breaks a test.

The FSL signup dialog in `website-engagement.js` builds its markup with
`innerHTML`, which the mini DOM deliberately does not parse. Its consent
behaviour is covered through the shared payload builder plus a call-site
assertion that the dialog reads the checkbox and posts through that builder.
