# Bilingual content rollout

The English and Spanish About pages are published, but they are not yet linked as
translations. Until a published Spanish settings document references a published
Spanish homepage, `/es/` returns 404. Unpublished page translations are not
included in the public switcher or sitemap. Existing English pages keep their
current slugs.

## Inventory and dry run

From `frontend/`, with `.env.local` containing the project ID, dataset, and a read
token:

```sh
node --env-file=.env.local scripts/i18n-migration.mjs
```

The script prints document IDs, types, draft status, languages, slugs, translation
references, conflicts, and proposed operations. It does not change the dataset unless
`--apply` is explicitly supplied. It refuses to apply if conflicts are detected.

The October 14 read-only inventory found published English `about-us` and Spanish
`sobre-nosotros` pages. English still has no `language` value; Spanish is `es`.
There is no `translation.metadata` document linking them, so the language
switcher correctly marks the other language unavailable. Both navigation
documents exist but have no `language` value. Neither settings document exists,
so the Spanish homepage is not yet configured. The script does not infer page
translation relationships from similar titles or slugs.

To activate the About switcher, an editor or an approved migration must set
`language: "en"` on page `b6c94469-f8ea-405c-b0b1-c7b9cacbd5a2` and create one
`translation.metadata` document of schema type `page` referencing that page as
`en` and page `9765a4db-9c9d-4150-bcdc-37add9a35ec9` as `es`. The Studio
plugin's Manage Translations flow can create the metadata relationship once the
source language is assigned; if the editor cannot attach an existing Spanish
document there, prepare and review a targeted migration rather than creating a
duplicate Spanish page. No content mutation is performed by the frontend.

## Backup and controlled application (later approval only)

Before applying, export the dataset using the Sanity CLI from `studio/`:

```sh
mkdir -p ./backups
pnpm exec sanity dataset export production ./backups/production-before-i18n.tar.gz
```

Store the archive securely and verify its size and checksum. Configure a token with
write permission as `SANITY_API_WRITE_TOKEN`, then rerun the dry run. Only after
reviewing every proposed operation, run from `frontend/`:

Pause Studio editing during the short apply window to avoid a concurrent editor
creating a second translation group after the inventory check.

```sh
node --env-file=.env.local scripts/i18n-migration.mjs --apply --confirm-dataset=production
```

The script preserves existing IDs, slugs, blocks, and references. It sets missing
English language values, creates missing localized singleton **drafts**, and
creates/extends `translation.metadata` documents in the installed plugin's v6
`internationalizedArrayReferenceValue` format. It uses revision checks for patches
and `createIfNotExists` for new documents. It never publishes.

After application, run the dry run again and inspect all locale documents in Studio.
For rollback, compare the pre-change export with current documents and revert only
the specific language patches or newly created draft/metadata IDs from the output.
Do **not** import the entire export over a live dataset; that could overwrite edits
made after the backup. A full import is a last-resort restore into a separate
dataset for comparison.

## Editorial sequence

1. Create or finish English settings and choose the English homepage page.
2. Translate that page using the Studio language selector; give Spanish its own slug.
3. Fill the Spanish settings draft and choose the Spanish homepage.
4. Translate navigation and footer text and links independently. Prefer page
   references; raw English paths are intentionally suppressed on Spanish pages.
5. Publish English and Spanish documents deliberately, then verify routes,
   canonical tags, switcher links, and sitemap.

No migration, export, import, or publication was run as part of this code change.
