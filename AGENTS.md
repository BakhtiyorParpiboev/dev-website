# Guide for coding agents

Read this file and `README.md` before making changes. Work on the current implementation; do not rebuild or restyle unrelated parts of the site.

## Product and scope

This is a software engineer's personal portfolio, with public projects, blog posts, about/services/current-focus sections, document links, and a separate owner-only editor.

- Keep the white, spacious design and Roboto typography. Use restrained green UI accents.
- Center the entire hero: name, headline, introduction, and document buttons.
- Current requested headline: **Software Engineer**.
- The particle field is a deliberate palette exception: blue, purple, indigo, and rare pink/red strokes. Preserve a clear area behind text.
- Keep the header's name on the left, navigation in the middle, and “Let's talk” on the right. Preserve the mobile menu.
- Do not invent career history, achievements, social links, contact details, or documents. Label examples honestly.
- Make only the requested changes. Ask before destructive data changes, replacing major libraries, or broad refactors.

## Repository map

| Path | Purpose |
| --- | --- |
| `artifacts/portfolio` | Public React/Vite frontend and admin interface |
| `artifacts/portfolio/src/pages/home.tsx` | Hero and scrolling homepage sections |
| `artifacts/portfolio/src/components/particles.tsx` | Reusable Canvas 2D background |
| `artifacts/portfolio/src/components/site.tsx` | Shared public layout/navigation |
| `artifacts/portfolio/src/pages/admin.tsx` | Content and profile editor |
| `artifacts/portfolio/src/index.css` | Shared visual styles |
| `artifacts/portfolio/src/lib/seo.ts` | Client-side metadata |
| `artifacts/portfolio/index.html` | Static SEO metadata and Person structured data |
| `artifacts/api-server/src/routes` | Express API, health, and SEO routes |
| `artifacts/api-server/src/lib/owner.ts` | Server-enforced owner authorization |
| `artifacts/api-server/src/lib/seed.ts` | One-time initial profile/example content |
| `lib/db/src/schema` | PostgreSQL/Drizzle schema |
| `lib/api-spec/openapi.yaml` | Source of truth for API contracts |
| `lib/api-client-react/src/generated` | Generated client types and query hooks |
| `lib/api-zod/src/generated` | Generated server validators |

## Setup and commands

Use Node.js 24 and pnpm 10 (the export was assembled with pnpm 10.26.1).

```sh
pnpm install --frozen-lockfile
pnpm --filter @workspace/api-spec run codegen
pnpm run typecheck
```

Each workspace package declares its own dependencies. Add a dependency to the package that uses it, not to the repository root.

For an initialized **development** database:

```sh
pnpm --filter @workspace/db run push
```

Confirm the target database before running schema changes. Do not run this against production without a separate, authorized migration procedure.

Run the frontend and API as separate services using the commands in `README.md`. Do not run `pnpm dev` at the repository root. Supply `PORT` and `BASE_PATH` to Vite, and set `API_PORT` for the local same-origin proxy. Keep authentication configuration intact when changing deployment hosts.

See `SOURCE_EXPORT.md` for deployment and persistent storage requirements.

## Content and API changes

1. Inspect the relevant existing implementation.
2. Change the OpenAPI contract first when changing an API.
3. Run `pnpm --filter @workspace/api-spec run codegen`.
4. Update the database schema and backend validation/handlers.
5. Connect the frontend to the real generated client.
6. Refresh affected list/detail/profile caches after writes.

Never manually patch generated API files. Import frontend hooks from `@workspace/api-client-react`; successful payloads are returned directly, not inside a `data` envelope.

Validate inputs server-side and return explicit errors. Preserve draft visibility rules, slug uniqueness handling, confirmation before deletion, and separate loading/error/empty states.

**Content lives in PostgreSQL.** Changing `seed.ts` does not update an existing profile. Use the admin editor or an explicitly authorized, targeted data update. Initial seeding must remain idempotent; deleted examples must stay deleted.

Document fields accept HTTPS URLs. Cover images support owner-only PNG/JPEG/WebP uploads (5 MiB, 40 megapixels), stored under UPLOAD_DIR and referenced through /api/images paths; existing HTTPS image URLs remain valid. Keep draft/unattached uploads private and configure persistent upload storage for deployment. Preserve clear messaging when a document has not been added.

## Authentication and security

- Authentication uses Clerk; authorization belongs to the application.
- Only an authenticated account with a **verified** email matching the configured `ADMIN_EMAIL` can edit.
- A missing owner configuration must deny edits. Never implement first-user-wins, a public role-setting endpoint, or client-only authorization.
- Keep all mutation routes protected on the server. Public readers must not see drafts.
- Browser requests use Clerk session cookies. Do not introduce manual browser bearer-token handling.
- Preserve the canonical Clerk proxy setup and sign-in/sign-up callback routes.
- Never commit or copy secrets, session cookies, real `.env` files, or database dumps into an export.
- Keep article rendering safe: do not inject raw HTML from blog/project content.
- Keep server logs structured and free of sensitive headers or session data.

## Animation and accessibility

- Keep particles behind content, `aria-hidden`, and `pointer-events: none`.
- Do not add dependencies unless the change actually requires them.
- Use elapsed time, stable particle properties, smooth motion, and gentle cursor interaction; do not use random visibility changes per frame.
- Respect reduced-motion preferences, including changes while the page is open.
- Pause unnecessary rendering when the hero is offscreen or the tab is hidden.
- Clean up animation frames, observers, and event listeners.
- Preserve keyboard access, visible focus, readable contrast, semantic structure, and mobile responsiveness.

## SEO

Preserve page-specific titles/descriptions, semantic HTML, static Person structured data, and the published-content sitemap. Keep admin/auth routes out of search results.

Use the actual published URL when configuring `SITE_URL` and `VITE_SITE_URL`; do not bake a preview domain into public metadata. Search rankings/indexing are not guaranteed. Client-rendered article metadata is not full server-side rendering; treat improving crawler-visible article pages as separate work if requested.

## Verification before delivery

- Run type checks for changed packages; run `pnpm run typecheck:libs` first if shared libraries changed.
- Restart affected managed workflows after a coherent batch of changes.
- Check relevant public pages on desktop and mobile after visual changes.
- Check real API responses and denied unauthorized access after backend/security changes.
- For substantial authenticated-flow changes, verify owner success, non-owner denial, persistence after reload, and draft/public separation.
- Match every user requirement against the finished behavior. Report unverified or blocked portions honestly.
