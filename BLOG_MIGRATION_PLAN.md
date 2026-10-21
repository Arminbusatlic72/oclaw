# WordPress blog migration plan

The blog system is ready for content entry. No WordPress posts were imported and no Sanity documents were written during implementation.

## Inventory and mapping

Export WordPress posts, media, categories, and SEO fields to a local, versioned migration input. Preserve each original URL slug exactly as `blogPost.slug.current`, the original publish timestamp as `publishedAt`, and the original title. Map the article body to Portable Text blocks (headings, paragraphs, lists, quotes, links, and captioned images), featured media to `featuredImage` with alt text, category names to `categories`, and available meta title, description, and social image to `seo`. Set `language` to `en` or `es`; link translations only when an actual translated post exists. Do not generate translations automatically.

## Dry run

1. Parse the export locally without writing to Sanity. Produce a report of record count, expected target IDs, original URLs, media references, unresolved links, unsupported blocks, missing alt text, and SEO fields.
2. Fetch existing Sanity `page` and `blogPost` slugs read-only. Compare case-normalized slugs per locale and check reserved routes (`blog`, `blog-espanol`, `es`, `api`, `studio`, `_next`, file routes). Stop if any collision is found.
3. Render a sample of converted Portable Text locally and compare it with the source export. Confirm dates and language assignments, plus canonical URLs and hreflang for paired translations.

## Controlled import

Use deterministic document IDs derived from the WordPress post ID and locale. Import media first, then create **draft** `blogPost` documents with a transaction or batches that can be audited. Keep an import manifest containing source ID, target ID, original slug, and media asset IDs. Review drafts in Studio, then publish only after editorial approval in a separate phase. Configure translation metadata only for verified pairs.

## Rollback

Before any write, save a Sanity export and the import manifest. To roll back, delete only documents created by the migration manifest, including their translation metadata; leave pre-existing documents untouched. Remove newly uploaded media only after checking that no other document references it. Re-run the read-only URL inventory after rollback.

## First manual post

In Studio, open **Blog posts**, create an English post, keep its original WordPress slug, enter a publication date and Portable Text body, and publish. The article will appear at `/{slug}/` and in `/blog/`. Create a Spanish translation from the document internationalization UI only when translated content exists; publish it to enable `/es/{spanish-slug}/` and the language switch. The archive heading, introduction, SEO, page size, and empty message can be edited under **Blog archive** for each language.
