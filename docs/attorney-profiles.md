# Attorney profiles

The existing `attorney` document and localized routes are retained. No production content migration is required. Deploy the Studio schema and frontend together through the normal approved release process; this change does not publish either.

## Editing a profile

1. Open the correct English or Spanish attorney document in Studio. Keep its existing slug. Credentials and legal terminology must be supplied or approved by the client; do not automatically translate them.
2. Set Full Name, Professional Title, Profile Image (including alt text), Phone and Email. Select Assigned Offices and Practice Areas in the same language. These references drive linked profile sections and the reverse attorney listings on office and practice pages.
3. Use **Short Biography** for the card, listing, About Us attorney showcase, profile introduction, and the existing SEO description fallback. Use **Biography** for the rich-text Overview. **Personal experience** is a separate section; it no longer replaces Biography.
4. Add **Professional memberships** for Membership & Involvement.
5. Add **Structured education**: institution and degree, with optional graduation year and description. Existing **Education** text entries remain visible. Avoid entering the same credential in both lists. No existing entries are converted or deleted automatically.
6. Add **Structured admissions**: jurisdiction, optional bar/court, admission year and description. Existing **Bar admissions** text entries remain visible. Avoid duplicate entries across these fields.
7. Under **Resources & insights**, select Speaking Engagements, Blog Posts or Firm News for each item. Prefer an existing localized blog-post reference. Only published, non-future posts in the profile's language with a slug appear. Alternatively enter a client-approved external HTTPS URL and title. An optional date and description can be added. Broken/unpublished references are hidden rather than replaced by external fallback content.
8. **Consultation booking action** can override the shared booking action with an approved Calendly action. Without an override, the profile uses the matching language's Navigation → CTA Link if it is a Calendly action. Use the existing global event URL or office booking options. No calendar URL is guessed. Without a valid URL, the existing shared component renders a disabled action. The existing popup, consent step, office selection and fallback link behavior are reused.
9. Existing experience, skills, achievements, certificates, languages and social links remain supported. Empty optional sections are hidden.

## Findings and compatibility

- `professionalTitle` is a string, `shortBiography` is plain text, and `biography` / `experience` are Portable Text. Localization is per document, not per field.
- The old profile selected `experience`, then `biography`, then `shortBiography` as competing fallback sources. When Personal experience existed, both biography edits were hidden despite correct published data and a successful webhook.
- The profile now renders the three fields independently. Queries and cards already fetched the correct biography names. About Us is a page-builder page using `AttorneysSection`; there is no separate `AboutPage.tsx` in this checkout.
- The previous `practiceAreas[]->[filter]` and `offices[]->[filter]` profile projections returned null entries for valid published references. `(practiceAreas[]->)[filter]` and `(offices[]->)[filter]` filter the complete dereferenced arrays and preserve language checks. Reverse queries are unchanged.
- Title and biographies use the same published `sanityFetch`. The shared `sanity` tag and path invalidation already cover this content. No webhook, fetch-client or cache configuration changes were made. Changes to referenced blog posts also invalidate the shared tag.
- Existing SEO metadata, Person JSON-LD, slugs and localized collection routes are preserved. Existing legacy education/admissions fields remain unchanged in the schema and content.

## Verification after deployment

1. With authorization, edit and publish one English attorney's title, short biography and rich-text biography. Do not change the slug. Confirm the webhook succeeds.
2. Reload the profile: title appears in the header, short biography in the introduction, and the full rich text in Overview even when Personal experience is populated. Check formatting and links.
3. Check the short biography on the attorney listing, About Us showcase, and related Practice Area and Office cards. Check profile links to assigned offices and practice areas and their reverse attorney lists.
4. Repeat with an approved Spanish attorney document and verify that English content is unchanged. Use separate client-approved Spanish text; do not invent a translation.
5. Populate structured education/admissions and memberships with approved information. Confirm optional fields and empty sections behave correctly, and check for duplicates with the preserved legacy lists.
6. Add a localized published blog reference and an approved external event/news link. Confirm grouping. Unpublish the referenced post only in an authorized test environment and verify it disappears; it must not reveal draft content.
7. Test the consultation button on desktop and mobile. An approved URL opens the same shared popup, with consent before loading Calendly. Verify office selection and the fallback link. With no approved URL configured the action is disabled.
8. Check desktop, tablet and mobile layouts, keyboard navigation and section anchors. Cache tag invalidation uses the existing stale-while-revalidate behavior; allow regeneration and check a subsequent request if the first response is stale.

## Client-approved information still needed

Read-only inspection during implementation found four published English attorneys and no published Spanish attorneys. Existing legacy education, admissions and membership content is retained. The new structured fields and resources were not populated automatically. Neither language's shared navigation CTA currently provides a Calendly booking URL. Editors must supply any missing portraits/contact data, approved Spanish documents, structured credentials, related insights and approved booking URLs.
