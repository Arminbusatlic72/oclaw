# About translation relationship repair

This is a narrowly scoped repair for the existing published About pages in project `ewrcmuk0`, dataset `production`. It does not create pages, change slugs, or run the broader i18n migration.

The script is dry-run by default. Run it from `frontend/`:

```sh
node --env-file=.env.local scripts/repair-about-translation.mjs --dry-run
```

The script verifies both published IDs, types, slugs, language fields, draft absence, and all `translation.metadata` documents before proposing mutations. It refuses to apply if a draft, unexpected language/slug/type, metadata collision, or competing relationship is found. Its metadata ID and array keys are deterministic, so rerunning after a successful repair is a no-op. The two references are strong because both target pages are already published and Studio is configured with `weakReferences: false`.

## Backup before an approved apply

Export the dataset to a secure local archive using the Studio CLI, and retain the dry-run output (including the original English language value and revisions):

```sh
cd studio
pnpm exec sanity dataset export production ./about-repair-before.tar.gz
```

The archive contains the whole dataset and may contain sensitive content; store it securely. Do not import it over the live dataset as a routine rollback, because that could overwrite other editors' work.

## Apply only after approval

From `frontend/`, supply a Sanity token with write permission through `SANITY_API_WRITE_TOKEN`. Do not put the token in the command history or commit it. Then run:

```sh
node --env-file=.env.local scripts/repair-about-translation.mjs --apply --confirm-project=ewrcmuk0 --confirm-dataset=production --confirm-pair=b6c94469-f8ea-405c-b0b1-c7b9cacbd5a2:9765a4db-9c9d-4150-bcdc-37add9a35ec9
```

Re-run the dry-run command immediately before applying, and avoid concurrent edits to these pages during the transaction. A revision guard protects any English language patch; the metadata creation fails if its deterministic ID was created concurrently.

## Verify and roll back if needed

After an approved apply, rerun the dry run; `proposedMutations` should be empty. In Studio, inspect the two existing About pages and their shared translation metadata. Test `/about-us/` to `/es/sobre-nosotros/` and back in the frontend, plus unavailable-language behavior on an unlinked page.

For a targeted rollback, first confirm that no one has since changed the metadata document. Delete only `i18n.page.b6c94469-f8ea-405c-b0b1-c7b9cacbd5a2` and, **only if the apply added `language: "en"`**, unset that one field on the English page. Keep the two page documents and their slugs intact. On the currently observed dataset the English language is already `en`, so a repair apply would not change it and rollback must not unset it. Use the retained export and transaction history to review the original state; coordinate before any rollback if subsequent edits have occurred.
