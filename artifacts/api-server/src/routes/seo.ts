import { Router, type IRouter } from "express";
import { db, contentTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export const seoRouter: IRouter = Router();
const escapeXml = (value: string) => value.replace(/[<>&"']/g, c => ({
  "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;",
})[c]!);

// The current request provides the served origin; no development domain is
// embedded in assets. SITE_URL can pin the canonical domain after publication.
seoRouter.get("/sitemap.xml", async (req, res) => {
  const origin = process.env.SITE_URL?.replace(/\/$/, "") ||
    `${req.get("x-forwarded-proto") === "https" ? "https" : req.protocol}://${req.get("host")}`;
  const rows = await db.select({
    kind: contentTable.kind, slug: contentTable.slug, updatedAt: contentTable.updatedAt,
  }).from(contentTable).where(eq(contentTable.published, true));
  const urls = [
    ...["/", "/projects", "/blog"].map(path => `<url><loc>${escapeXml(origin + path)}</loc></url>`),
    ...rows.map(row => `<url><loc>${escapeXml(`${origin}/${row.kind === "project" ? "projects" : "blog"}/${row.slug}`)}</loc><lastmod>${new Date(row.updatedAt).toISOString()}</lastmod></url>`),
  ];
  res.type("application/xml").send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join("")}</urlset>`);
});

seoRouter.get("/robots.txt", (req, res) => {
  const origin = process.env.SITE_URL?.replace(/\/$/, "") ||
    `${req.get("x-forwarded-proto") === "https" ? "https" : req.protocol}://${req.get("host")}`;
  res.type("text/plain").send(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /sign-in\nDisallow: /sign-up\nDisallow: /api/\nSitemap: ${origin}/sitemap.xml\n`);
});
