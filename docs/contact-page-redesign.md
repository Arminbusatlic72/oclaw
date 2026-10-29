# Contact PageBuilder setup

The contact redesign is delivered as three reusable PageBuilder blocks: `contactInfoCards`, `contactForm`, and `locationMap`. No Sanity documents were created or changed by the implementation.

## Verified source information

The English production contact page was checked on October 28, 2026 and displays:

| Office | Phone | Address |
| --- | --- | --- |
| Chicago | +1 847-258-9954 | 518 E Northwest Hwy, Mt Prospect, IL 60056 |
| New York | +1 347-305-7600 | 1412 Broadway, Office 2113, 21st floor, New York, NY 10018 |
| Miami | +1 786-383-0297 | 66 W Flagler Street, Suite 900, PMB 12470, Miami, FL 33130 |

The shared email is `info@oclaw.us`.

The configured Sanity dataset contained no Office documents and no pages with the `contact` or `contacto` slug at implementation time. The Spanish production site still displayed different New York and Miami addresses, so those stale values were not copied. Have an editor/legal owner approve the table above before creating localized Office records.

## Required content setup

1. In Sanity Studio, create one English Office document per approved location. Fill name, complete address, phone, email (when office-specific), map URL, display order, and coordinates. Do not publish until the legal/content owner approves the details.
2. Create Spanish translations through the existing document-internationalization action. Translate only display names; keep approved factual address/phone data aligned. Link each English/Spanish pair in `translation.metadata`.
3. Ensure the relevant English and Spanish Practice Area documents are published and translation-linked. Only published records in the page locale appear in the form.
4. Create an English Page named Contact, language `en`, slug `contact`. Add blocks in this order:
   1. Page hero with breadcrumb enabled.
   2. Contact information cards. Add any number/order of cards; use Office references for address and phone cards, and manual content only for the shared email if it is not represented by an Office.
   3. Contact form. Set localized heading/description/messages, select General inquiry or Appointment request, and link the English Privacy Policy page.
   4. Location map. Select the approved English Office records. Leave embed URL blank to use address-derived keyless embeds, or enter one approved HTTPS embed URL for a single office.
5. Create the Spanish Page named Contacto, language `es`, slug `contacto`, using translated copy and Spanish Office/Practice Area references. Do not copy English text into Spanish fields.
6. Link Contact and Contacto with the Studio translation action. This supplies reciprocal hreflang and language switching through the existing metadata architecture.
7. Preview both drafts at `/contact/` and `/es/contacto/`. Confirm breadcrumb, phone/email links, office maps, form mode, validation, and footer/navigation before publishing.

## Submission delivery

Submissions post to `/api/contact`, which performs same-origin, timing, honeypot, rate-limit, duplicate, field, and published-option validation. The server then sends JSON to an approved HTTPS endpoint using:

- `CONTACT_FORM_WEBHOOK_URL`
- `CONTACT_FORM_WEBHOOK_TOKEN`

The webhook receives an `Authorization: Bearer …` header and the submission UUID as `Idempotency-Key`. It must return a 2xx response only after durable delivery/queueing. Until both variables are configured, the UI returns a configuration error and never displays a success state.

In-memory throttling and idempotency provide immediate protection per running instance. The receiving provider should enforce the same idempotency key and an organization-wide rate limit for multi-instance production deployments.

Supporting document upload remains disabled. Enable it only after approving private storage, MIME/size scanning, access control, retention, and deletion policies. Do not store client documents in public Sanity assets.
