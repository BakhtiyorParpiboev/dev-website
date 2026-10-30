# Deployment and content transfer

The repository contains application source, shared libraries, generated API source, package manifests, a lockfile, and editing instructions. See `README.md` for local setup.

**Start with `AGENTS.md` when handing this project to another coding agent.**

## What is not included

- Secrets, environment variable values, or `.env` files
- Database rows, Clerk users/sessions, or uploaded documents
- `node_modules`, compiled `dist` output, caches, logs, Git history, or temporary files
- Private agent/session state and bundled platform skills

This is a **source repository**, not a full backup of your live content or authentication accounts. A fresh database gets the initial profile and clearly labeled examples from the seed code. Later edits made through the admin page require a separate database backup if you want to transfer them.

## Install

Use Node.js 24 and pnpm 10:

```sh
pnpm install --frozen-lockfile
pnpm run typecheck
```

The runtime consists of the portfolio frontend and API server, with shared workspace libraries.

## Environment configuration

Configure these through your host's environment/secret settings; values are deliberately not bundled:

| Variable | Used by | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | API/database tooling | PostgreSQL connection |
| `CLERK_SECRET_KEY` | API | Clerk server credentials |
| `CLERK_PUBLISHABLE_KEY` | API | Matching Clerk instance |
| `VITE_CLERK_PUBLISHABLE_KEY` | Frontend | Matching Clerk publishable key |
| `ADMIN_EMAIL` | API | Sole authorized owner's verified email |
| `RESEND_API_KEY` | API, optional | Resend credential for visitor-message email alerts |
| `MESSAGE_EMAIL_FROM` | API, optional | Sender address on a domain verified in Resend |
| `MESSAGE_EMAIL_TO` | API, optional | Recipient of visitor-message alerts |
| `PORT` | Each service | Service's own listening port |
| `BASE_PATH` | Vite | Frontend mount path; `/` for the portfolio |
| `SITE_URL` | API, optional | Actual canonical public origin; defaults to `https://bakhtiyor.me` |
| `VITE_SITE_URL` | Frontend, optional | Same canonical origin; defaults to `https://bakhtiyor.me` |

Configure a Clerk application for the destination domain. The existing frontend supports `VITE_CLERK_PROXY_URL`; the backend retains its production Clerk proxy. Use a proxy URL only when it is configured for that Clerk instance and domain. Keep matching frontend/backend Clerk keys and verified owner authorization.

Frontend `VITE_*` values are build-time configuration. A production frontend must be rebuilt after changing them. Do not put server secrets in `VITE_*` variables.

## Database and server

After configuring a new development PostgreSQL database:

```sh
pnpm --filter @workspace/db run push
```

The API initializes starter content only when the singleton profile does not exist. It does not create database tables automatically.

The API service command is:

```sh
pnpm --filter @workspace/api-server run dev
```

It requires its `PORT` and server environment to be set by the host.

## Frontend and routing

The portfolio service command is:

```sh
pnpm --filter @workspace/portfolio run dev
```

It requires its own `PORT`, `BASE_PATH=/`, and frontend authentication configuration.

The app expects **same-origin routing**:

| Public path | Destination |
| --- | --- |
| `/api` and subpaths | API service |
| `/sitemap.xml` | API service |
| `/robots.txt` | Frontend static asset (API also serves matching rules for local development) |
| Public pages and auth routes | Portfolio frontend using the route-specific rewrites in `artifacts/portfolio/vercel.json` |
| Unknown paths | Frontend `404.html` with HTTP 404 |

Configure a reverse proxy with fallback only for the supported React routes (`/projects/:slug`, `/blog/:slug`, `/admin`, and sign-in/sign-up callback paths). Serve the generated `seo/*.html` metadata shells at their public routes as defined in `vercel.json`; leave the article shell canonical-free. Do not rewrite every unknown URL to HTTP 200. For local development, use `API_PORT=5000` with Vite as described in `README.md`. Starting the two services on separate ports alone does not establish this routing. Keep API URLs relative; do not hardcode localhost into browser code.

For a production build, supply the frontend build environment and run each package's build:

```sh
pnpm --filter @workspace/portfolio run build
pnpm --filter @workspace/api-server run build
```

The frontend output is `artifacts/portfolio/dist/public`, including generated `seo/*.html` metadata shells and a custom `404.html`. These shells contain metadata, not server-rendered article text. On another domain, update both origin variables and the static `public/robots.txt` sitemap URL together. The API entry point is `artifacts/api-server/dist/index.mjs`. Build output is ignored by Git.

## Editing content

Visit `/admin`, authenticate with the configured owner's email, and verify it. Use the editor for projects, blog posts, profile text, current focus, social/contact links, and document URLs. Other accounts must remain unable to edit.

Visitor messages are stored in PostgreSQL. To enable optional email alerts, configure all three message-email variables on the API service; the sender domain must be verified with Resend. Delivery is best effort: if the provider is unavailable, the message remains in the owner inbox and the server logs an alert failure. No automatic email retry is currently configured.

## Cover image uploads

The owner editor accepts PNG, JPEG, and WebP cover images up to 5 MiB (40 megapixels). The API decodes, auto-orients, downsizes to at most 2400px, strips metadata, and saves WebP files. No database schema change is required: the existing imageUrl field stores the server-issued path. HTTPS cover URLs already saved remain supported.

Files live in `artifacts/api-server/uploads` when running the API from its package directory. Set `UPLOAD_DIR` to an absolute persistent-volume directory in production, and back it up alongside the database. Container or ephemeral hosting without a persistent volume will lose uploads on replacement. Keep `/api/images` routed to the API; do not expose the upload folder as a static directory. Unattached and draft images require owner access; images referenced by published content are public. Unpublishing revokes future public image requests. Replacing or removing a cover does not delete the underlying file. Uploads are not included in source exports.

## Free Render deployment

The Vercel configuration builds the editor with `VITE_IMAGE_UPLOADS_ENABLED=false`.
The editor accepts HTTPS cover-image URLs. Existing uploaded covers are preserved
when editing content unless the owner replaces or removes them.

On Render Free, set `IMAGE_UPLOADS_ENABLED=false` in the API environment and do not
attach a disk. This rejects new file uploads on the server even if a client tries
to submit one directly. Existing local image files are not durable on this plan;
host covers externally or commit public images to the frontend's public assets,
then use their full HTTPS URL. Do not commit private or draft image assets.

PostgreSQL content lives in Neon and is independent of the API filesystem. The
free API can sleep after inactivity; public API requests may need to wait for it
to start. No snapshot of current database content is included in this source.
