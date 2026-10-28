# About Us attorney source mapping

Read-only inventory: `attorneys-about-inventory.json`. Live comparison: `attorneys-about-dry-run.json`. The source pages are WordPress IDs 9 (`/about-us/`) and 2176 (`/es/sobre-nosotros/`). No attorney documents were created.

| WordPress source | Sanity attorney field | Status |
| --- | --- | --- |
| Name on each About page | `fullName` | Verified for four people in both languages. |
| Role below each portrait | `professionalTitle` | Verified as literal source text. Viktoriia Chernova's English and Spanish roles differ in meaning. |
| Portrait URL and source alt | `profileImage` | URLs and source alt recorded. Assets require upload to Sanity before staging. Theresia's alt needs review. |
| Profile URL | `slug` | No WordPress profile pages identified. Proposed slugs in inventory require approval. |
| Source page locale | `language` | English and Spanish About pages verified. |
| Biography, experience, education, admissions, languages | Optional fields | Absent from About pages; request approved information. |
| Social links, public email and phone | Optional fields | No individual contact links verified. Do not copy firm contact details into individual profiles without approval. |
| Practice Area and Office assignments | `practiceAreas[]`, `offices[]` | No assignments verified; leave empty. |
| SEO title and description for profiles | `seo` | No individual profile metadata available. |

The proposed stable IDs are `attorney.about.<slug>.<locale>` with `drafts.` prefixes for staging; translation metadata IDs are `i18n.attorney.about.<slug>`. They are planning identifiers, not imported records. Before any production import, confirm the professional titles, profile slugs, portrait rights and alt text, any biography or credentials, and whether all four should have Spanish profiles. Import only after separate approval and a fresh dataset backup.

The existing About pages' SEO titles and canonical URLs were verified. Their currently published Sanity PageBuilder blocks contain placeholder copy; those documents and their revisions were not changed. The frontend About template uses the verified public WordPress introduction and membership text until approved editorial content is staged in Sanity.
