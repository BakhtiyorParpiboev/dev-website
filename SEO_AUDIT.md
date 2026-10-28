# bakhtiyor.me indexing audit

Audit date: October 28, 2026 (Asia/Seoul). Code fixes are local and have **not been deployed**. No production content, database schema, authentication settings, or DNS records were changed.

## Search Console follow-up — October 28, 2026 (KST)

This follow-up supersedes the earlier access/submission limitations below; the original audit is retained as historical evidence.

- Domain ownership is verified. The supplied Google verification TXT record was saved at Gabia and resolved through both its authoritative nameserver and Google's public DNS.
- Search Console property access works under the owner's university Google account. The different Google account signed in to Chrome does not have property access; it was not granted additional access.
- Submitted `https://bakhtiyor.me/sitemap.xml`. Search Console first reported “Couldn't fetch,” then changed to **Success**, type **Sitemap**, with **8 discovered pages** and last read October 28, 2026. No duplicate submission was needed.
- The initial homepage URL Inspection report said **“URL is not on Google”** and **“URL is unknown to Google.”** No referring sitemap, previous crawl, or Google-selected canonical was reported at that point.
- Google's live homepage test passed: **URL is available to Google**, **Page can be indexed**, smartphone inspection fetch successful, crawl allowed, indexing allowed, and user-declared canonical `https://bakhtiyor.me/`. Google-selected canonical is only determined after indexing. Tested-page HTML was available; this is not a full article-rendering audit.
- Requested homepage indexing through URL Inspection. Google confirmed **“Indexing requested”** and said the URL was added to a priority crawl queue. This confirms the request, not actual indexing or rankings. Other URLs are covered by the submitted sitemap; individual indexing requests were not made for them.
- A live sitemap request returned valid eight-URL XML in **14.69 seconds**; a subsequent Googlebot-user-agent request returned HTTP 200 in **0.67 seconds**. A cold start may have contributed to the initial fetch problem, but this is an inference, not a confirmed Google error cause.
- No production deployment was performed by this assistant. The live sitemap observed during this follow-up still has eight URLs, rather than the nine returned by the locally updated handler. Production rollout/verification of the earlier code changes remains separate.

Evidence screenshots are saved locally at `/tmp/search-console-sitemap-success.jpg` and `/tmp/search-console-indexing-requested.jpg`. Keep the DNS TXT record and allow Google to process the crawl queue. Coverage/performance reports initially said they were processing data. No recurring monitor was created.

## 1. Website Status

| Check | Observed result |
| --- | --- |
| Framework | React 19 / TypeScript / Vite; Wouter browser routing; Express API; PostgreSQL/Drizzle; Clerk owner authentication |
| Hosting | Live HTTP headers identify Vercel; API rewrites target Render; deployment docs identify Neon PostgreSQL |
| DNS | `bakhtiyor.me` resolves to `216.198.79.1`; `www.bakhtiyor.me` did not resolve from the audit host |
| HTTPS | Homepage HTTPS GET/HEAD returned 200 with HSTS; no TLS error |
| HTTP redirect | `http://bakhtiyor.me/` returned 308 then the HTTPS homepage returned 200 |
| Public pages | Homepage, projects, blog, current focus, and every currently listed sitemap URL returned 200 |
| Googlebot | A request with a Googlebot user agent returned 200 and the normal HTML shell; this is not a request from Google's actual crawler IPs |
| Restrictions | Homepage source has `index, follow`; no `X-Robots-Tag` restriction in the checked homepage headers |
| API | `/api/healthz` returned 200; unauthenticated `/api/content?admin=true` returned 403 |

`www` failure is a secondary domain configuration issue, not evidence that the working apex domain cannot be indexed. Configure its DNS and hosting redirect if that alias should work; a redirect rule alone cannot fix missing DNS.

## 2. Google Indexing

**Current indexing status: unknown. Verified indexed pages: none verified during this audit.** HTTP 200 proves accessibility, not inclusion in Google's index.

The available browser is signed in to Google Search Console. Opening the `sc-domain:bakhtiyor.me` property displayed **“Oops, you don't have access to this property.”** The property selector listed no matching property. The current account cannot provide coverage reports, URL Inspection results, ownership status for other accounts, or sitemap submission history. This does not prove that no other account has a verified property.

No sitemap was submitted and no indexing request was made. No Indexing API or third-party submission service was used.

Confirmed technical defects and risks, ordered by likely relevance:

1. **Rendering/API dependency:** live public HTML initially contains an empty React root. Google must execute JavaScript and fetch the public API before it can see content and links. The documented free Render service can sleep. No actual Google rendering failure was verified. Static metadata is improved by this patch; full content rendering remains a separate implementation decision.
2. **Discovery:** live static `robots.txt` only contained `User-agent: *` and `Allow: /`; it did not advertise the working sitemap. The existing sitemap omitted `/working-on`.
3. **Canonical/initial metadata:** live source had no canonical or `og:url`; every route initially used homepage metadata. The client previously depended on an optional environment variable to add canonicals.
4. **Transient failure deindexing:** article code applied `noindex` whenever an API error left no article data. Temporary service failures could therefore produce an avoidable indexing restriction.
5. **Structured data:** the Person JSON-LD contained a trailing comma and could not be parsed as JSON.
6. **Soft 404s:** the catch-all Vercel rewrite returned HTTP 200 for unrelated nonexistent paths. Missing article slugs still require client/API resolution.
7. **Private pages:** the initial admin HTML was the same indexable shell; its exclusion depended on JavaScript. Vercel will now provide explicit `noindex` headers and a private HTML shell.

These are verified defects or architecture risks, **not verified reasons Google excluded a particular URL**. Search Console is needed to establish that cause.

## 3. Technical SEO

### robots.txt

Static frontend and API rules now agree. They advertise `https://bakhtiyor.me/sitemap.xml`, allow public pages, and allow the profile/content/image API resources used during rendering while disallowing other API crawling. Authentication still enforces privacy.

Admin and auth pages remain crawlable so Google can read their `noindex` directives. Blocking crawling would prevent Google from reading those directives. [Google's noindex guidance](https://developers.google.com/search/docs/crawling-indexing/block-indexing).

### sitemap.xml

The existing dynamic endpoint selects only published rows and uses their stored `updatedAt` for article `lastmod`. It now adds `/working-on`, encodes slugs, and uses the configured canonical origin with `https://bakhtiyor.me` as the default, rather than deriving it from a proxy Host header. No modification dates were invented for static routes. Publishing changes continue to appear on subsequent sitemap requests.

Live pre-change XML parsed successfully and contained eight URLs; all eight returned 200. The updated handler, tested through a local read-only harness against the configured database, returned valid XML with **nine unique public HTTPS URLs**, correct lastmod fields, and no admin/auth URLs. API and static robots responses matched byte for byte.

### Canonicals and metadata

The Vite build now emits route-specific HTML heads for `/`, `/projects`, `/blog`, and `/working-on`: title, description, Open Graph, Twitter card, and one absolute canonical. Vercel rewrites map those routes to their shells. These contain metadata only; the React root is still populated in the browser.

Article routes deliberately use `seo/article.html`, a shell without a homepage canonical. The root `index.html` also carries the homepage head, so filesystem-first hosting serves the correct root metadata. Their existing client hook supplies article metadata and the correct canonical after loading. Navigating to private/missing pages removes stale canonical and Open Graph URLs. Draft articles rendered by the owner remain `noindex`.

`SITE_URL` and `VITE_SITE_URL` should both be `https://bakhtiyor.me`. Frontend changes require a rebuild. A different deployment domain also requires updating the static robots sitemap URL.

### Structured data and semantics

The existing truthful Person data is preserved and now parses as valid JSON. No awards, employers, social accounts, or other unsupported details were added. This was a JSON/structure check, not a claimed Google Rich Results validation or rich-result eligibility.

The document retains `lang="en"`. Rendered public pages have semantic headings and real internal anchor links. The owner portrait has descriptive alternative text; decorative project thumbnails are hidden appropriately. The original visual design and particle implementation are unchanged.

### Missing URLs and private routes

Vercel's unbounded catch-all is replaced by explicit supported page/auth routes. A generated custom `404.html` includes `noindex`. Unknown top-level paths should receive the host's HTTP 404. Known article patterns still load React: a nonexistent article returns HTTP 200 at the frontend and an API 404, then receives client `noindex`. Resolving that remaining article HTTP-status limitation requires server-side route/content lookup.

Header and rewrite behavior on Vercel must be checked after an approved deployment. A local server emulating the mapping is not proof of production routing.

## 4. Changes Implemented

| File | Change |
| --- | --- |
| `artifacts/api-server/src/routes/seo.ts` | Canonical origin default, missing sitemap route, escaped/encoded URLs, matching crawler rules |
| `artifacts/portfolio/index.html` | Correct invalid Person JSON-LD |
| `artifacts/portfolio/public/robots.txt` | Sitemap discovery and public rendering-resource rules |
| `artifacts/portfolio/src/lib/seo.ts` | Normalize the canonical origin; actual-domain default; remove stale Open Graph URL on excluded pages |
| `artifacts/portfolio/src/pages/content-detail.tsx` | Separate API outages from confirmed missing content, preserve draft exclusion, and avoid temporary-error `noindex` |
| `artifacts/portfolio/scripts/seo-build.mjs` | Generate four static public metadata heads, private shell, and custom 404 without database snapshots |
| `artifacts/portfolio/scripts/check-seo.mjs` | Check built metadata, canonical consistency, strict JSON-LD parsing, route mapping, exclusions, and sitemap advertisement |
| `artifacts/portfolio/vite.config.ts` | Register metadata generation with Vite and load canonical origin configuration |
| `artifacts/portfolio/vercel.json` | Route-specific shells, supported article/auth rewrites, private/API `X-Robots-Tag`, index alias redirect, trailing-slash normalization |
| `artifacts/portfolio/package.json` | Add `test:seo` command |
| `.github/workflows/ci.yml` | Validate SEO artifacts after production build |
| `README.md` | Document verification command and this audit |
| `SOURCE_EXPORT.md` | Explain production routing, generated shells, canonical defaults, and static robots |
| `SEO_AUDIT.md` | Record evidence, limits, and remaining owner actions |

No dependencies were added and no generated API contract files were patched.

## 5. Verification Results

| Verification | Result |
| --- | --- |
| `pnpm install --frozen-lockfile` | Passed; lockfile unchanged |
| `pnpm run typecheck` | Passed, including shared library build and both application packages |
| `PORT=5173 BASE_PATH=/ pnpm run build` | Passed for frontend and API |
| `pnpm --filter @workspace/portfolio run test:seo` | Passed: four public heads, valid Person JSON, unique HTTPS canonicals, private/404 exclusions, canonical-free article fallback, robots advertisement |
| `pnpm test` | All seven existing image tests passed |
| `git diff --check` | Passed |
| Real updated sitemap handler | Passed with read-only database access: nine URLs, valid XML, no duplicates/private routes; no seeding/mutation routes loaded |
| Live current sitemap links | All eight returned 200 |
| Browser public content | Homepage, blog list, published article, and current focus rendered from public data snapshots in a local production-build preview |
| Browser metadata | Homepage/article/current-focus titles and canonicals updated correctly; published article had `index, follow` |
| Mobile | 390×844 viewport: menu opened, current-focus navigation worked, no horizontal overflow observed |
| Simulated API outage | Explicit retry message; retained `index, follow` and article canonical |
| Missing article | API 404 produced `noindex, nofollow`; stale canonical and Open Graph URL were removed |
| Custom 404 browser rendering | Unknown top-level route displayed the existing 404 interface from the generated shell |
| Production private access | Unauthenticated admin-content list returned 403 |

Browser preview data was copied only from public endpoints. Its temporary server rejects mutations. It emulates relevant routing and does not exercise Vercel edge processing or a live owner session. A Clerk development-key warning appeared in the local preview; no claim is made about production Clerk configuration.

Core Web Vitals field data, Googlebot's actual rendered HTML, Rich Results Test, Search Console exclusions, ownership under another account, and production behavior of these **undeployed changes** remain unverified. Individual warm public HTTP requests completed in roughly 0.7–0.9 seconds from the audit host; this is not LCP, INP, CLS, or a cold-start benchmark. The built main JavaScript bundle is 518,693 bytes (157,987 gzip bytes); CSS is 74,616 bytes (13,524 gzip bytes). These are local artifact measurements, not measured production transfer sizes. No performance score is claimed.

## 6. Remaining Actions

1. **Review and approve deployment.** Deploy both frontend and API changes through the existing workflow, retaining Clerk configuration. No deployment has been performed. Set both canonical-origin variables to `https://bakhtiyor.me`.
2. **Repeat production checks:** `/robots.txt`, `/sitemap.xml`, static canonical tags for all four main pages, HTTP-to-HTTPS and trailing-slash redirects, an unrelated unknown path returning 404, private/auth `X-Robots-Tag`, published article rendering, and unauthorized API denial. Confirm the sitemap now has nine public URLs (or the current published set).
3. **Obtain Search Console ownership/access:** open [Search Console](https://search.google.com/search-console), use the correct Google account, choose **Add property → Domain**, enter `bakhtiyor.me`, copy Google's exact supplied DNS TXT record into the authoritative DNS provider, then click **Verify**. Keep the TXT record. If another account already owns the property, use that account or ask its owner to grant access. DNS changes need domain-provider access; no token or DNS change was fabricated here.
4. **Submit the sitemap:** in the verified property, open **Sitemaps**, submit `https://bakhtiyor.me/sitemap.xml`, and confirm the reported processing status. Review errors if it is not accepted. [Google's sitemap and coverage workflow](https://support.google.com/webmasters/answer/10351509?hl=en).
5. **Inspect and request indexing:** use the top URL Inspection field for `https://bakhtiyor.me/`, inspect the indexed result, run **Test live URL**, and inspect rendered HTML/screenshot and loaded resources. If eligible, choose **Request indexing**. Repeat for `/projects`, `/blog`, `/working-on`, and the important published article URLs listed by the sitemap. Record Google's actual selected canonical and exclusion reasons. Do not use the general Indexing API for this portfolio. [Google's URL Inspection instructions](https://support.google.com/webmasters/answer/9012289?hl=en).
6. **Review reports:** check **Page indexing** and **Core Web Vitals** after Google has collected data. Reinspect changed URLs when there is a meaningful status change. No recurring monitor was created.
7. **Optional follow-up:** configure `www` DNS and a permanent apex redirect if wanted. Consider server/static rendering of public content and accurate article HTTP statuses if live inspection shows content/API rendering problems. This is the principal remaining architecture limitation; it requires a separate implementation scope rather than a hidden framework replacement.

## 7. Indexing Expectations

Google controls discovery, crawling, canonical selection, indexing, and rankings. These fixes improve technical eligibility; they do not guarantee indexing, timing, rich results, or search placement. Even an accepted indexing request does not guarantee inclusion. Use Search Console evidence to distinguish a discovery problem, rendering failure, duplicate/canonical selection, or Google's content-quality decision. [Google's JavaScript SEO guidance](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics).
