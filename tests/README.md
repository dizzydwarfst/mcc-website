# Marketing-site tests

The site is static — no bundler, no `package.json`, no build step — so these run
on Node's built-in test runner with no dependency to install.

```
node --test "tests/*.test.js" "tests/*.test.cjs"
```

(Node 18+; developed against Node 22.)

## What is covered

| File | Covers |
| --- | --- |
| `portal-api.test.js` | API base configuration, endpoint paths, field limits vs. the backend, email normalisation, HTTP status → visitor wording |
| `contact-form.test.js` | `POST /api/public/contact-inquiries` through the real `form-handler.js` |
| `newsletter-form.test.js` | `POST /api/public/newsletter-subscriptions` through the real `form-handler.js` |
| `website-signup.test.js` | `POST /api/public/website-signups` — `consent_to_contact` is always explicit |
| `agency-links.test.cjs` | QR routing, safe redirects, first-agency attribution and blocked browser storage |
| `events.test.cjs` | Homepage featuring, independent event-page visibility, archived/restored events and unavailable feeds |
| `program-events.test.cjs` | Program-specific upcoming events, archived/past filtering, feed failure and Pacific Time wording |

Before releasing, compare the proposed commit with both the previous deployed
source and newer saved branches. Check the homepage, events and program pages,
admissions, contact/newsletter forms, document catalogue/product/order/lookup
routes and QR redirects. Preserve the current archive/visibility behavior,
agency attribution, responsive event headings, centered event badges and
“Pacific Time (PT)” wording when combining saved work.

Use mocked submissions for browser checks: never create real messages,
applications, registrations or charges merely to test a release.

`helpers/mini-dom.js` is a hand-built DOM covering only what `form-handler.js`
touches, and `helpers/form-harness.js` evaluates the shipped handler against it
in a `vm` context. Nothing in the handler is stubbed, so a change that breaks a
form breaks a test.

The FSL signup dialog in `website-engagement.js` builds its markup with
`innerHTML`, which the mini DOM deliberately does not parse. Its consent
behaviour is covered through the shared payload builder plus a call-site
assertion that the dialog reads the checkbox and posts through that builder.
