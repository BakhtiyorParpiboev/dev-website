import express, { Router, type IRouter } from "express";
import { and, eq } from "drizzle-orm";
import { db, contentTable } from "@workspace/db";
import { UploadImageResponse } from "@workspace/api-zod";
import { ownerState, requireOwner } from "../lib/owner";
import { imageDirectory, isImageFilename, InvalidImageError, MAX_IMAGE_BYTES, storeImage } from "../lib/images";

const router: IRouter = Router();

router.post("/images", requireOwner, (req, res, next) => {
  if (!req.is("application/octet-stream")) {
    res.status(415).json({ error: "Upload PNG, JPEG, or WebP image bytes." }); return;
  }
  next();
}, express.raw({ type: "application/octet-stream", limit: MAX_IMAGE_BYTES }), async (req, res) => {
  if (!Buffer.isBuffer(req.body)) { res.status(400).json({ error: "Choose an image to upload." }); return; }
  try {
    const url = await storeImage(req.body);
    res.status(201).json(UploadImageResponse.parse({ url }));
  } catch (error) {
    if (error instanceof InvalidImageError) { res.status(400).json({ error: error.message }); return; }
    throw error;
  }
});

router.get("/images/:filename", async (req, res, next) => {
  res.set({ "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", "Cross-Origin-Resource-Policy": "same-origin" });
  const filename = req.params.filename;
  if (!isImageFilename(filename)) { res.status(404).json({ error: "Image not found." }); return; }
  const url = `/api/images/${filename}`;
  const [published] = await db.select({ id: contentTable.id }).from(contentTable)
    .where(and(eq(contentTable.imageUrl, url), eq(contentTable.published, true))).limit(1);
  if (!published && !(await ownerState(req)).isAdmin) {
    res.status(404).json({ error: "Image not found." }); return;
  }
  res.type("image/webp").sendFile(filename, { root: imageDirectory, dotfiles: "deny", cacheControl: false }, (error) => {
    if (!error) return;
    if ((error as { status?: number }).status === 404) { res.status(404).json({ error: "Image not found." }); return; }
    next(error);
  });
});

export default router;
