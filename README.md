# Bakhtiyor's portfolio

A software engineer's portfolio built with React, TypeScript, and Vite, with an Express API, PostgreSQL content, and a Clerk-protected owner editor.

## Features

- Responsive projects, blog, About, services, and current-focus pages
- Cursor-responsive canvas animation with reduced-motion support
- Owner-only publishing, profile editing, and cover-image uploads
- Page metadata, published-content sitemap, and safe plain-text article rendering

## Requirements

Node.js 24, pnpm 10.26.1, PostgreSQL, and a configured Clerk application. This repository contains source, not database content or authentication accounts.

```sh
pnpm install --frozen-lockfile
cp artifacts/api-server/.env.example artifacts/api-server/.env.local
cp artifacts/portfolio/.env.example artifacts/portfolio/.env.local
```

Fill in the local environment files. Use matching Clerk development keys and set `ADMIN_EMAIL` to the owner's verified email. Server secrets belong only in the API configuration. Local environment files and uploaded images are ignored by Git.

## Local development

With the environment files configured, run `pnpm api` in one terminal and `pnpm dev` in another, both from the repository root. The API shortcut explicitly loads its `.env.local`. Use `pnpm run server` if you prefer the server alias; plain `pnpm server` is reserved by pnpm for its store service.

The equivalent service commands are shown below.

From the repository root, start the API in one terminal:

```sh
cd artifacts/api-server
set -a
source .env.local
set +a
pnpm run dev
```

Start the frontend in another terminal:

```sh
cd artifacts/portfolio
PORT=5173 BASE_PATH=/ API_PORT=5000 pnpm run dev
```

Open [localhost:5173](http://localhost:5173). The development proxy forwards `/api`, `/sitemap.xml`, and `/robots.txt` to the API. Vite reads the frontend's `.env.local` automatically. The examples above use Bash or Zsh.

For a **new development database only**, first verify `DATABASE_URL` points to the intended database, then run from the API terminal after loading its environment:

```sh
pnpm --filter @workspace/db run push
```

The server seeds the initial profile and clearly labeled examples only once. Existing site content lives in PostgreSQL; transfer it separately using a database backup.

## Checks and builds

```sh
pnpm run typecheck
pnpm test
PORT=5173 BASE_PATH=/ pnpm run build
pnpm --filter @workspace/portfolio run test:seo
```

GitHub Actions runs these checks on pushes and pull requests. Builds do not require production secrets or a database connection. A runnable deployment does require the environment described above.

Generated API code is committed. After changing `lib/api-spec/openapi.yaml`, run:

```sh
pnpm --filter @workspace/api-spec run codegen
```

## Project layout

| Folder | Purpose |
| --- | --- |
| `artifacts/portfolio` | Public frontend and owner interface |
| `artifacts/api-server` | API, owner authorization, image storage, and SEO endpoints |
| `lib/api-spec` | OpenAPI contract and code generation |
| `lib/api-client-react` | Generated React client |
| `lib/api-zod` | Generated server validation |
| `lib/db` | PostgreSQL schema and database tooling |

Edit public text in `/admin`; the configured owner must sign in with a verified email. The About photo is configured in `artifacts/portfolio/src/lib/about-image.ts`; replacement instructions are in `artifacts/portfolio/public/images/README.md`.

See [SOURCE_EXPORT.md](SOURCE_EXPORT.md) for deployment, routing, and persistent-upload requirements, [DESIGN.md](DESIGN.md) for design decisions, and [AGENTS.md](AGENTS.md) for coding guidance.

## Before publishing

Review the files being committed. Keep real `.env` files, database backups, local session state, dependencies, build output, and uploaded content out of Git. Public assets, including the owner's portrait, are intentionally part of the source. Configure the actual deployed domain for canonical metadata and Clerk before launch.

## Search indexing

See [SEO_AUDIT.md](SEO_AUDIT.md) for the October 2026 audit, verified results, and Search Console steps. The Vite build emits static metadata shells for the homepage, project/blog lists, and current focus; article text still requires JavaScript and the public API. Keep the route-specific rewrites and custom 404 in `artifacts/portfolio/vercel.json` when deploying.
