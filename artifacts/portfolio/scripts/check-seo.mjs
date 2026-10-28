import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { publicPages } from './seo-build.mjs';

const root = new URL('../dist/public/', import.meta.url);
const config = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'));
for (const [name, page] of Object.entries(publicPages)) {
  const html = await readFile(new URL(`seo/${name}.html`, root), 'utf8');
  assert.ok(html.includes(`<title>${page.title}</title>`), `${name}: static title`);
  const canonicals = [...html.matchAll(/<link rel="canonical" href="([^"]+)"/g)];
  assert.equal(canonicals.length, 1, `${name}: one canonical`);
  const canonical = new URL(canonicals[0][1]);
  assert.equal(canonical.protocol, 'https:');
  assert.equal(canonical.pathname, page.path);
  assert.ok(html.includes(`<meta property="og:url" content="${canonical.href}"`));
  assert.ok(html.includes('content="index, follow"'));
  const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  assert.equal(schema['@type'], 'Person');
  assert.equal(schema.name, 'Parpiboev Bakhtiyor');
  assert.ok(config.rewrites.some(route => route.source === page.path && route.destination === `/seo/${name}.html`));
}
for (const file of ['seo/private.html', '404.html']) {
  const html = await readFile(new URL(file, root), 'utf8');
  assert.ok(html.includes('content="noindex, nofollow"'));
  assert.ok(!html.includes('rel="canonical"'));
}
const fallback = await readFile(new URL('seo/article.html', root), 'utf8');
assert.ok(!fallback.includes('rel="canonical"'), 'article shell must not canonicalize to home');
const homeIndex = await readFile(new URL('index.html', root), 'utf8');
const homeShell = await readFile(new URL('seo/home.html', root), 'utf8');
assert.equal(homeIndex, homeShell, 'filesystem root and rewrite destination must agree');
assert.ok(!config.rewrites.some(route => route.source === '/(.*)'), 'unknown paths must not serve HTTP 200');
assert.ok((await readFile(new URL('robots.txt', root), 'utf8')).includes('Sitemap: https://bakhtiyor.me/sitemap.xml'));
console.log('SEO build checks passed: four public heads, JSON-LD, canonicals, private/404 exclusions, fallback and robots.');
