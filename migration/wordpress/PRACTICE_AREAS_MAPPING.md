# Practice areas migration plan

The [read-only inventory](./practice-areas-inventory.json) contains 14 English and 14 Spanish WordPress child pages as of 2026-10-22. Each record includes its URL, title, slug, excerpt HTML, full content HTML, image URLs, Yoast metadata, and a proposed translation pair. The [live dry-run report](./practice-areas-dry-run.json) verified every record against the WordPress REST API and all 14 pairs against reciprocal `hreflang` links on both public pages. No Sanity documents were created or published.

## Mapping

| WordPress field | Sanity field | Review |
| --- | --- | --- |
| English and Spanish URL | `practiceArea.slug` per language | Preserve each existing slug exactly. |
| Title | `practiceArea.title` | Check headings and capitalization. |
| Excerpt HTML | `practiceArea.shortDescription` | All 28 excerpts are truncated. Leave the field empty during draft staging; write a reviewed description. |
| Content HTML | `practiceArea.body` and optional `sections` | The converter preserves headings, lists, emphasis, and underline as Portable Text. |
| Embedded and social images | `mainImage`, optional `icon`, `seo.openGraphImage` | Confirm image rights and write alt text. |
| Yoast title and description | `seo.title`, `seo.description` | Check length and locale. |
| Verified language pair | `translation.metadata` | All 14 pairs have reciprocal WordPress `hreflang` links. The migration plan uses weak references until the drafts are published. |
| Attorney association | `attorney.practiceAreas` | No reliable association was exposed in the API; assign only after review. |

The WordPress archive has no `Wealth Protection` detail page among its child pages, despite that label appearing on the homepage. Do not create one without source content. The public WordPress API currently exposes different office details on the English and Spanish homepages, so confirm addresses before entering offices.

## Dry-run findings

- **28/28 source records matched** the live REST API, including URL, parent, slug, title, body, excerpt, Yoast title and canonical. All canonical URLs preserve the existing English or Spanish path.
- **14/14 translation pairs were confirmed** by reciprocal `hreflang` links. There are no missing or uncertain pairs in this inventory.
- **406 Portable Text blocks** were planned. Source markup comprises paragraphs, bold and italic text, underline, line breaks, bullet and numbered lists, and one empty layout wrapper. The converter promotes bold lines to headings, turns printed bullets into list items, discards the empty wrapper, and fails if it loses words or meets an unknown tag. No unsupported content was found.
- **28/28 pages lack source images** in the REST content, featured-media field, and Yoast Open Graph image. There are no image alt values to migrate. Editors must source approved card icons and hero images and supply alt text if those visuals are required.
- **28/28 Yoast meta descriptions are blank**, though titles are present and within the schema limit. The site derives canonical URLs from the preserved slugs; the migration does not copy arbitrary canonical values into Sanity.
- **28/28 excerpts are truncated** and must not become card descriptions or SEO descriptions automatically. All 28 bodies repeat the same phone number and email address; check these against current office records before publication.
- The English Fiancé(e) K-1 Visa body uses hand-typed bullet symbols and line breaks where its Spanish counterpart uses HTML lists. The converter preserves the lines as Portable Text lists, but an editor should check list boundaries.
- Every page requires a current legal and translation review. Draft staging may proceed after approval; publishing is not ready.

## Dry-run and apply safeguards

From `frontend/`, run `node --env-file=.env.local scripts/practice-areas-migrate.mjs` for the read-only default dry run. It checks live WordPress content and reciprocal translation links, converts all 28 bodies, checks raw Sanity documents for slug and metadata conflicts, and writes `practice-areas-dry-run.json`. It never logs API tokens.

The script has a separate `--apply` mode for a later approved session. It requires exact project, dataset, and inventory-hash confirmations plus `SANITY_API_WRITE_TOKEN`. It uses stable WordPress-derived IDs, creates **draft** practice areas only, and creates deterministic `translation.metadata` documents with weak references that can strengthen when the areas are published. Existing edited drafts and conflicting translation groups stop the run. Existing published records are never overwritten. This task ran only the default dry run.

## Studio workflow

1. Create the English and Spanish `practiceArea` documents with their original slugs. Use the document internationalization control to link verified translations, then publish each language independently.
2. Create the localized `practiceAreaArchive` singleton for headings, introduction, empty state, and SEO. The archive routes exist without a singleton and show a default heading.
3. Create verified `office` records and `attorney` profiles in each language. On each attorney, choose its published practice areas and offices in the same language. Those arrays are the authoritative relationships; practice and office pages use reverse queries.
4. Add `practiceAreasSection` to a homepage PageBuilder. Automatic mode reads published practice areas marked `featuredOnHomepage`, ordered by `displayOrder`. Manual mode uses the selected references in editor order and resolves linked translations for the active locale. A missing translation is omitted.
5. Check English and Spanish pages, language switcher, canonical/hreflang links, sitemap, and structured data before migration launch.

New attorney routes are `/attorneys/[slug]/` and `/es/abogados/[slug]/`; office routes are `/offices/[slug]/` and `/es/oficinas/[slug]/`. The public WordPress page inventory had no attorney or office profile URLs to preserve. Confirm these new paths before adding navigation links.
