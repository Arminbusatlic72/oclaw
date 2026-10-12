# Next + Sanity Blocks Starter

A starter template for building CMS-driven websites fast with:

- Next.js frontend in `frontend`
- Sanity Studio in `studio`
- Page builder block architecture (`heroSlider`, `cardGrid`, `callToAction`, `infoSection`)
- Typed GROQ queries + generated schema types
- One-command setup and preflight checks

![Preview of Sanity Studio + Next.js](/sanity-next-preview.png)

## What You Get

- `pnpm bootstrap` to install, validate env, generate types, and type-check
- `pnpm dev` to run both frontend and studio
- `pnpm preflight` to catch Node/env misconfiguration early
- `pnpm new:block --name YourBlock` scaffold command for new blocks
- Monorepo setup with shared lockfile and workspace scripts

## Prerequisites

- Node `22.22.1` (see `.nvmrc`)
- pnpm `>=9`

If you use nvm:

```bash
source ~/.nvm/nvm.sh
nvm use
```

## Quick Start

1. Install and prepare the project:

```bash
pnpm bootstrap
```

2. Start both apps:

```bash
pnpm dev
```

3. Open:

- Frontend: http://localhost:3000
- Studio: http://localhost:3333

## Environment Setup

Create local env files from templates:

```bash
cp frontend/.env.example frontend/.env.local
cp studio/.env.example studio/.env.local
```

Required values:

- Frontend (`frontend/.env.local`):
  - `NEXT_PUBLIC_SANITY_PROJECT_ID`
  - `NEXT_PUBLIC_SANITY_DATASET`
  - `SANITY_API_READ_TOKEN`
- Studio (`studio/.env.local`):
  - `SANITY_STUDIO_PROJECT_ID`
  - `SANITY_STUDIO_DATASET`

Studio auto-updates are opt-in through:

- `SANITY_STUDIO_AUTO_UPDATES=true`

## Commands

- `pnpm bootstrap`: install + preflight + typegen + type-check
- `pnpm preflight`: validate Node/env prerequisites
- `pnpm dev`: run Next + Studio together
- `pnpm new:block --name FeatureCards`: scaffold new block files
- `pnpm type-check`: run TypeScript checks across apps
- `pnpm lint`: lint frontend
- `pnpm build`: build frontend and studio
- `pnpm validate`: preflight + type-check + lint + build

## Add A New Block

Generate boilerplate:

```bash
pnpm new:block --name FeatureCards
```

This creates:

- `studio/src/schemaTypes/blocks/featureCards.ts`
- `frontend/app/components/blocks/FeatureCards/index.tsx`

Then wire it in:

1. Register schema export in `studio/src/schemaTypes/index.ts`.
2. Add `{type: 'featureCards'}` to `pageBuilder` in `studio/src/schemaTypes/documents/page.ts`.
3. Add import and `_type` mapping in `frontend/app/components/BlockRenderer.tsx`.
4. Extend `getPageQuery` in `frontend/sanity/lib/queries.ts`.
5. Regenerate types:

```bash
pnpm --filter frontend sanity:typegen
```

## Template Checklist (for new projects)

1. Clone template and create a new repo.
2. Run `pnpm bootstrap`.
3. Confirm both apps open locally.
4. Update brand styles, fonts, and design tokens.
5. Add/remove block types for your project.
6. Add project-specific schemas and seed content.
7. Run `pnpm validate` before first push.

## Deploy

- Studio: `pnpm --filter studio deploy`
- Frontend: deploy `frontend` to your host (Vercel recommended)

For deployment from existing Vercel-created projects, see [vercel-installation-instructions.md](vercel-installation-instructions.md).

## Resources

- https://www.sanity.io/docs
- https://nextjs.org/docs
