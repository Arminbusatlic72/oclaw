# Oclaw

Oclaw is a pnpm workspace containing a Next.js frontend and a standalone
Sanity Studio. The frontend renders content from Sanity, while the Studio
provides the editing interface, schema definitions, and presentation preview
configuration.

Repository: [github.com/Arminbusatlic72/oclaw](https://github.com/Arminbusatlic72/oclaw)

## Technology versions

The current workspace uses:

| Technology | Version |
| --- | --- |
| Node.js | `22.22.1` (pinned in `.nvmrc`; preflight requires Node 22.x) |
| pnpm | `9.15.9` |
| Next.js | `16.1.5` |
| React / React DOM | `19.2.3` |
| Sanity | `5.15.0` |
| next-sanity | `12.1.1` |
| TypeScript | `5.9.3` |

The package manifests may use compatible version ranges for some dependencies;
the versions above are the versions currently resolved in the workspace.

## Architecture

Oclaw is organized as a two-application monorepo:

```text
oclaw/
├── frontend/              # Next.js application
├── studio/                # Standalone Sanity Studio
├── sanity.schema.json/    # Extracted schema used for type generation
├── scripts/               # Setup, preflight, and block scaffolding scripts
├── package.json           # Root workspace commands
├── pnpm-lock.yaml         # Shared dependency lockfile
└── pnpm-workspace.yaml    # Workspace definition
```

### Frontend

`frontend/` contains the Next.js App Router application. It includes the page
routes, UI components, Sanity client configuration, GROQ queries, generated
Sanity types, and the draft-mode endpoint used by Sanity's presentation tools.

The development server runs at [http://localhost:3000](http://localhost:3000).

### Sanity Studio

`studio/` contains the independently configured Sanity Studio. It owns the
content schemas, custom desk structure, initial values, presentation preview
configuration, and Studio plugins. Schema extraction produces
`sanity.schema.json/schema.json`, which is then used to generate typed Sanity
definitions for both applications.

The Studio development server runs at
[http://localhost:3333](http://localhost:3333).

## Prerequisites

- Node.js 22.x; `22.22.1` is provided in `.nvmrc`
- pnpm 9; the current local version is `9.15.9`
- A Sanity project and dataset
- A Sanity read token for authenticated frontend reads and previews

With `nvm` installed, select the repository's Node.js version with:

```bash
nvm use
```

## Local installation

Clone the repository and enter the project directory:

```bash
git clone https://github.com/Arminbusatlic72/oclaw.git
cd oclaw
```

Create local environment files from the committed templates:

```bash
cp frontend/.env.example frontend/.env.local
cp studio/.env.example studio/.env.local
```

Fill in the required values described below, then run the workspace bootstrap:

```bash
pnpm bootstrap
```

The bootstrap command installs dependencies, validates the local environment,
extracts the Sanity schema, generates types, and type-checks both applications.
To install dependencies without running the remaining setup steps, use
`pnpm install`.

## Environment configuration

Local environment files are excluded from Git. Do not commit credentials or
replace the example placeholders with real secrets.

### `frontend/.env.local`

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Yes | Sanity project ID used by the frontend |
| `NEXT_PUBLIC_SANITY_DATASET` | Yes | Sanity dataset name, commonly `production` |
| `SANITY_API_READ_TOKEN` | Yes | Server-side token for authenticated reads and previews |
| `NEXT_PUBLIC_SANITY_API_VERSION` | No | Sanity API version used by the frontend client |
| `NEXT_PUBLIC_SANITY_STUDIO_URL` | No | Studio URL; the example uses `http://localhost:3333` |

### `studio/.env.local`

| Variable | Required | Purpose |
| --- | --- | --- |
| `SANITY_STUDIO_PROJECT_ID` | Yes | Sanity project ID used by the Studio |
| `SANITY_STUDIO_DATASET` | Yes | Sanity dataset name, commonly `production` |
| `SANITY_STUDIO_PREVIEW_URL` | No | Frontend preview origin; defaults to `http://localhost:3000` |
| `SANITY_STUDIO_STUDIO_HOST` | No | Hosted Studio name used by Sanity deployment |
| `SANITY_STUDIO_AUTO_UPDATES` | No | Set to `true` to enable Studio deployment auto-updates |

Run the environment and runtime checks independently with:

```bash
pnpm preflight
```

## Running locally

Start the frontend and Studio together:

```bash
pnpm dev
```

To run them separately:

```bash
pnpm dev:next
pnpm dev:studio
```

The frontend development command regenerates Sanity types before starting
Next.js. The Studio development command also extracts the schema and regenerates
Studio types before starting Sanity.

## Project commands

Run these commands from the repository root:

| Command | Description |
| --- | --- |
| `pnpm bootstrap` | Install dependencies, run preflight checks, generate Sanity types, and type-check the workspace |
| `pnpm dev` | Run the frontend and Studio development servers together |
| `pnpm dev:next` | Run only the Next.js frontend |
| `pnpm dev:studio` | Run only Sanity Studio |
| `pnpm preflight` | Check the Node.js version, workspace, and required environment values |
| `pnpm lint` | Lint the frontend with ESLint |
| `pnpm type-check` | Type-check both workspace applications |
| `pnpm build` | Build the frontend and Studio |
| `pnpm validate` | Run preflight, type-checking, linting, and both production builds |
| `pnpm format` | Format the workspace with Prettier |
| `pnpm new:block --name FeatureCards` | Scaffold frontend and Studio files for a new content block |

## Source attribution

Oclaw was initially derived from Sanity's
[Clean Next.js template](https://github.com/sanity-io/sanity-template-nextjs-clean),
whose earlier history came from
[nextjs-blog-cms-sanity-v3](https://github.com/sanity-io/nextjs-blog-cms-sanity-v3).
See [NOTICE.md](NOTICE.md) for the preserved provenance and licensing notice.

## Documentation

- [Next.js documentation](https://nextjs.org/docs)
- [Sanity documentation](https://www.sanity.io/docs)
- [pnpm documentation](https://pnpm.io/)
