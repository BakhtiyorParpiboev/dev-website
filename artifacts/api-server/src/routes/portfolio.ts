import { Router, type IRouter } from "express";
import { and, desc, eq } from "drizzle-orm";
import { db, contentTable, profileTable } from "@workspace/db";
import {
  GetProfileResponse, UpdateProfileBody, GetAdminSessionResponse,
  ListContentResponse, CreateContentBody, GetContentResponse,
  UpdateContentBody, GetContentParams, DeleteContentParams,
} from "@workspace/api-zod";
import { ownerState, requireOwner } from "../lib/owner";

import { isUploadedImageUrl, uploadedImageExists } from "../lib/images";

const router: IRouter = Router();

function validUrls(data: Record<string, unknown>) {
  return Object.entries(data).every(([key, value]) => {
    if (!key.endsWith("Url") || value === "") return true;
    if (typeof value !== "string") return false;
    if (key === "imageUrl" && isUploadedImageUrl(value)) return true;
    try { return new URL(value).protocol === "https:"; } catch { return false; }
  });
}

router.get("/admin/session", async (req, res) => {
  res.set("Cache-Control", "no-store").json(GetAdminSessionResponse.parse(await ownerState(req)));
});

router.get("/profile", async (_req, res) => {
  const [row] = await db.select().from(profileTable).where(eq(profileTable.id, 1));
  if (!row) { res.status(503).json({ error: "Profile has not been initialized." }); return; }
  res.json(GetProfileResponse.parse(row.data));
});

router.put("/profile", requireOwner, async (req, res) => {
  const parsed = UpdateProfileBody.safeParse(req.body);
  if (!parsed.success || !validUrls(parsed.data) ||
    (parsed.data.email !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parsed.data.email))) {
    res.status(400).json({ error: "Enter valid profile fields, an email address, and HTTPS URLs (or leave optional fields blank)." }); return;
  }
  await db.insert(profileTable).values({ id: 1, data: parsed.data })
    .onConflictDoUpdate({ target: profileTable.id, set: { data: parsed.data } });
  res.json(GetProfileResponse.parse(parsed.data));
});

router.get("/content", async (req, res) => {
  const kind = req.query.kind;
  if (kind !== undefined && kind !== "project" && kind !== "blog") {
    res.status(400).json({ error: "Invalid content kind." }); return;
  }
  if (req.query.admin !== undefined && req.query.admin !== "true" && req.query.admin !== "false") {
    res.status(400).json({ error: "Invalid admin parameter." }); return;
  }
  const admin = req.query.admin === "true";
  if (admin && !(await ownerState(req)).isAdmin) {
    res.status(403).json({ error: "Owner access required." }); return;
  }
  const rows = await db.select().from(contentTable).where(and(
    kind ? eq(contentTable.kind, kind) : undefined,
    admin ? undefined : eq(contentTable.published, true),
  )).orderBy(desc(contentTable.featured), desc(contentTable.createdAt));
  res.set("Cache-Control", "no-store").json(ListContentResponse.parse(rows));
});

router.post("/content", requireOwner, async (req, res) => {
  const parsed = CreateContentBody.safeParse(req.body);
  if (!parsed.success || !validUrls(parsed.data) || (isUploadedImageUrl(parsed.data.imageUrl) && !(await uploadedImageExists(parsed.data.imageUrl)))) {
    res.status(400).json({ error: "Check required fields, the lowercase hyphenated slug, and HTTPS links." }); return;
  }
  const [row] = await db.insert(contentTable).values(parsed.data).returning();
  res.status(201).json(GetContentResponse.parse(row));
});

router.get("/content/:slug", async (req, res) => {
  const params = GetContentParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: "Invalid slug." }); return; }
  const [row] = await db.select().from(contentTable).where(eq(contentTable.slug, params.data.slug));
  if (!row || (!row.published && !(await ownerState(req)).isAdmin)) {
    res.status(404).json({ error: "Content not found." }); return;
  }
  res.set("Cache-Control", "no-store").json(GetContentResponse.parse(row));
});

router.put("/content/:slug", requireOwner, async (req, res) => {
  const params = GetContentParams.safeParse(req.params);
  const parsed = UpdateContentBody.safeParse(req.body);
  if (!params.success || !parsed.success || !validUrls(parsed.data) || (isUploadedImageUrl(parsed.data.imageUrl) && !(await uploadedImageExists(parsed.data.imageUrl)))) {
    res.status(400).json({ error: "Check required fields, the lowercase hyphenated slug, and HTTPS links." }); return;
  }
  const [row] = await db.update(contentTable).set({ ...parsed.data, updatedAt: new Date().toISOString() })
    .where(eq(contentTable.slug, params.data.slug)).returning();
  if (!row) { res.status(404).json({ error: "Content not found." }); return; }
  res.json(GetContentResponse.parse(row));
});

router.delete("/content/:slug", requireOwner, async (req, res) => {
  const params = DeleteContentParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: "Invalid slug." }); return; }
  const deleted = await db.delete(contentTable).where(eq(contentTable.slug, params.data.slug)).returning();
  if (!deleted.length) { res.status(404).json({ error: "Content not found." }); return; }
  res.sendStatus(204);
});

export default router;
