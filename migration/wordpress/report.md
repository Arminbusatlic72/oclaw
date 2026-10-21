# WordPress blog migration dry run

Target: `ewrcmuk0/production`. No Sanity writes in dry run.

- WordPress posts: 28 across 1 API page(s); English: 28; Spanish: 0.
- Existing Sanity pages: 4; blog posts: 2.
- Eligible without review: 27; slug conflicts: 0.
- Featured image absent in source: 19; unique image URLs: 10; inaccessible: 0.
- SEO titles: 28; SEO descriptions: 0.

## Article inventory

| WP ID | Slug | Date | Featured | Review |
|---:|---|---|---|---|
| 2445 | `understanding-common-reasons-uscis-may-reject-your-case` | 2024-07-16 | yes | missing image alt text |
| 2441 | `big-news-for-vawa-applicants-no-more-filing-fees-for-your-entire-application-package` | 2024-06-25 | yes | missing image alt text |
| 2437 | `marriage-based-green-card-interview-what-not-to-do-and-how-to-shine` | 2024-06-20 | yes | missing image alt text |
| 2408 | `the-importance-of-bringing-an-interpreter-to-your-uscis-interview` | 2024-06-17 | yes | missing image alt text |
| 2388 | `know-your-rights-what-to-do-if-ice-detains-you` | 2024-06-13 | yes | missing image alt text |
| 2385 | `mastering-uscis-translation-standards-a-complete-guide-for-applicants` | 2024-06-10 | yes | missing image alt text |
| 2343 | `preparing-for-your-i-130-and-i-485-interview-with-a-pending-asylum-case` | 2024-06-03 | yes | missing image alt text |
| 2165 | `how-to-seek-parole-into-the-united-states` | 2024-05-23 | yes | missing image alt text |
| 2152 | `a-comprehensive-guide-to-immigration-to-the-usa` | 2024-05-20 | yes | missing image alt text, complex line-break formatting |
| 2140 | `top-20-occupations-for-h-1b-visas-in-the-united-states` | 2024-02-21 | no | none |
| 2137 | `a-comprehensive-guide-to-student-visas-in-the-usa` | 2024-02-20 | no | unsupported content |
| 2121 | `understanding-the-i-751-petition-to-remove-conditions-on-residence` | 2024-02-14 | no | none |
| 2119 | `h2b-visa-a-pathway-for-temporary-non-agricultural-workers` | 2024-02-13 | no | none |
| 2116 | `u-visa-requirements-and-essential-documents` | 2024-02-12 | no | none |
| 2114 | `unlocking-opportunities-10-ways-to-immigrate-legally-to-the-united-states` | 2024-02-08 | no | none |
| 2092 | `navigating-the-eb-3-visa-a-comprehensive-guide-to-required-documents` | 2024-02-07 | no | none |
| 2089 | `required-documents-and-evidence-for-asylum-form-i-589-application` | 2024-02-06 | no | none |
| 2084 | `empowering-all-victims-mens-eligibility-for-permanent-residency-under-vawa` | 2024-02-05 | no | none |
| 2078 | `navigating-the-path-to-justice-a-guide-to-filing-for-vawa-protection` | 2024-02-02 | no | none |
| 2076 | `seeking-sanctuary-a-guide-to-pursuing-asylum-in-the-united-states` | 2024-02-01 | no | none |
| 2074 | `navigating-love-across-borders-a-guide-to-the-k-1-visa-process` | 2024-01-31 | no | none |
| 2058 | `navigating-the-world-of-o-visas-a-comprehensive-guide-for-international-talent` | 2024-01-30 | no | none |
| 2052 | `after-filing-form-i-485-next-steps-and-important-information-for-marriage-based-cases-download` | 2024-01-29 | no | none |
| 2050 | `joint-sponsorship-navigating-financial-requirements-for-marriage-based-green-card-applicants` | 2024-01-26 | no | none |
| 2045 | `joint-finances-in-marriage-based-green-card-applications-tips-for-demonstrating-financial-interdependence` | 2024-01-25 | no | none |
| 2043 | `navigating-the-marriage-based-green-card-interview-what-to-expect-and-common-questions` | 2024-01-24 | no | none |
| 2040 | `unlocking-h-1b-visa-opportunities-your-gateway-to-a-global-career` | 2024-01-23 | no | missing image alt text |
| 2038 | `uscis-to-launch-organizational-accounts-enabling-online-collaboration-and-submission-of-h-1b-registrations` | 2024-01-23 | no | none |

## Source and target differences

- WordPress Yoast canonical URLs are recorded in inventory; target derives the canonical from the unchanged slug. Non-default values are flagged.
- WordPress index/noindex is mapped to `seo.noIndex`; original follow directives and other Yoast robots values are recorded for review.
- Yoast Article structured data becomes BlogPosting in the frontend. Review schema differences before publishing.
- Images are represented by source URLs in dry-run Portable Text and uploaded once per URL in apply mode.
- Missing SEO descriptions remain absent; the frontend uses the excerpt as its existing fallback.
- Spanish source posts are inventoried separately and never inferred from English articles.

## Internal links needing review

- WordPress 2052: `https://www.oclaw.us/wp-content/uploads/2024/01/i485.pdf` needs asset preservation or a redirect if WordPress media hosting changes.

## Manual review

- **2445** `understanding-common-reasons-uscis-may-reject-your-case`: missing image alt text.
- **2441** `big-news-for-vawa-applicants-no-more-filing-fees-for-your-entire-application-package`: missing image alt text.
- **2437** `marriage-based-green-card-interview-what-not-to-do-and-how-to-shine`: missing image alt text.
- **2408** `the-importance-of-bringing-an-interpreter-to-your-uscis-interview`: missing image alt text.
- **2388** `know-your-rights-what-to-do-if-ice-detains-you`: missing image alt text.
- **2385** `mastering-uscis-translation-standards-a-complete-guide-for-applicants`: missing image alt text.
- **2343** `preparing-for-your-i-130-and-i-485-interview-with-a-pending-asylum-case`: missing image alt text.
- **2165** `how-to-seek-parole-into-the-united-states`: missing image alt text.
- **2152** `a-comprehensive-guide-to-immigration-to-the-usa`: missing image alt text, complex line-break formatting.
- **2137** `a-comprehensive-guide-to-student-visas-in-the-usa`: unsupported content.
- **2040** `unlocking-h-1b-visa-opportunities-your-gateway-to-a-global-career`: missing image alt text.

## Import and rollback

Run the script with `--apply --confirm-project=ewrcmuk0 --confirm-dataset=production --post-id=ID` only after approval and a Sanity export.
The script creates `drafts.wp-blog-en-ID` with Sanity `create` (never overwrite). It writes `apply-manifest.json` after each draft.
For rollback, use the manifest to delete only its `createdDrafts` IDs after reviewing dependencies. Delete uploaded assets only when no other document references them.
Never delete pre-existing pages, posts, translation.metadata, or shared assets.
