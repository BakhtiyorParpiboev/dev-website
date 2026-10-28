import { Router, type IRouter } from "express";
import { db, contentTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export const seoRouter: IRouter = Router();
const escapeXml = (value: string) => value.replace(/[<>&"']/g, c => ({
  "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;",
})[c]!);

// Use the published canonical origin rather than the reverse proxy's Host.
const canonicalOrigin = () => new URL(process.env.SITE_URL || "https://bakhtiyor.me").origin;
seoRouter.get("/sitemap.xml", async (_req, res) => {
  const origin = canonicalOrigin();
  const rows = await db.select({
    kind: contentTable.kind, slug: contentTable.slug, updatedAt: contentTable.updatedAt,
  }).from(contentTable).where(eq(contentTable.published, true));
  const urls = [
    ...["/", "/projects", "/blog", "/working-on"].map(path => `<url><loc>${escapeXml(origin + path)}</loc></url>`),
    ...rows.map(row => `<url><loc>${escapeXml(`${origin}/${row.kind === "project" ? "projects" : "blog"}/${encodeURIComponent(row.slug)}`)}</loc><lastmod>${new Date(row.updatedAt).toISOString()}</lastmod></url>`),
  ];
  res.type("application/xml").send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join("")}</urlset>`);
});

// The frontend serves the same rules statically on Vercel, without waking the API.
// Allow public API resources needed to render pages; private endpoints remain
// server-authorized. Auth pages must be crawlable to expose their noindex rule.
seoRouter.get("/robots.txt", (_req, res) => {
  res.type("text/plain").send(`User-agent: *\nAllow: /\nDisallow: /api/\nAllow: /api/profile\nAllow: /api/content\nAllow: /api/images/\n\nSitemap: ${canonicalOrigin()}/sitemap.xml\n`);
});
