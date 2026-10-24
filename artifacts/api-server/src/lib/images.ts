import path from "node:path";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile, access } from "node:fs/promises";
import sharp from "sharp";

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const imageDirectory = path.resolve(process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads"));
const imageName = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.webp$/;

export function isImageFilename(value: string) {
  return imageName.test(value);
}

export function isUploadedImageUrl(value: string) {
  return value.startsWith("/api/images/") && isImageFilename(value.slice("/api/images/".length));
}

export async function uploadedImageExists(value: string) {
  if (!isUploadedImageUrl(value)) return false;
  try { await access(path.join(imageDirectory, value.slice("/api/images/".length))); return true; }
  catch { return false; }
}

export class InvalidImageError extends Error {}

export async function encodeImage(input: Buffer) {
  if (!input.length || input.length > MAX_IMAGE_BYTES) throw new InvalidImageError("Choose an image no larger than 5 MB.");
  try {
    const image = sharp(input, { limitInputPixels: 40_000_000, failOn: "warning" });
    const metadata = await image.metadata();
    if (!["png", "jpeg", "webp"].includes(metadata.format || "")) {
      throw new InvalidImageError("Choose a PNG, JPEG, or WebP image.");
    }
    // Decode and re-encode instead of trusting a filename or MIME header.
    // This also removes metadata and keeps cover images reasonably sized.
    return await image.rotate().resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true }).webp({ quality: 88 }).toBuffer();
  } catch (error) {
    if (error instanceof InvalidImageError) throw error;
    throw new InvalidImageError("This image could not be read. Choose a valid PNG, JPEG, or WebP under 40 megapixels.");
  }
}

export async function storeImage(input: Buffer) {
  const encoded = await encodeImage(input);
  const filename = `${randomUUID()}.webp`;
  await mkdir(imageDirectory, { recursive: true });
  await writeFile(path.join(imageDirectory, filename), encoded, { flag: "wx", mode: 0o600 });
  return `/api/images/${filename}`;
}
