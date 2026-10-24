import { test, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import sharp from "sharp";

const directory = await mkdtemp(path.join(os.tmpdir(), "portfolio-images-test-"));
process.env.UPLOAD_DIR = directory;
const { encodeImage, storeImage, isUploadedImageUrl, isImageFilename, uploadedImageExists, InvalidImageError, MAX_IMAGE_BYTES } = await import("../src/lib/images.ts");
after(() => rm(directory, { recursive: true, force: true }));

for (const format of ["png", "jpeg", "webp"] as const) {
  test(`decodes ${format} and stores an actual WebP image`, async () => {
    const input = await sharp({ create: { width: 80, height: 40, channels: 3, background: "#287750" } }).toFormat(format).toBuffer();
    const encoded = await encodeImage(input);
    const metadata = await sharp(encoded).metadata();
    assert.equal(metadata.format, "webp");
    assert.equal(metadata.width, 80);
    assert.equal(metadata.height, 40);
  });
}

test("resizes large covers, auto-orients them, and strips EXIF", async () => {
  const input = await sharp({ create: { width: 2800, height: 1400, channels: 3, background: "white" } }).jpeg().withMetadata({ orientation: 6 }).toBuffer();
  const result = await sharp(await encodeImage(input)).metadata();
  assert.equal(result.width, 1200);
  assert.equal(result.height, 2400);
  assert.equal(result.exif, undefined);
  assert.equal(result.orientation, undefined);
});

test("rejects invalid, truncated, empty, SVG, and oversized inputs", async () => {
  const png = await sharp({ create: { width: 16, height: 16, channels: 3, background: "white" } }).png().toBuffer();
  for (const input of [Buffer.alloc(0), Buffer.from("not an image"), png.subarray(0, 30), Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10"/></svg>'), Buffer.alloc(MAX_IMAGE_BYTES + 1)]) {
    await assert.rejects(() => encodeImage(input), InvalidImageError);
  }
});

test("assigns unique paths and persists images across reads", async () => {
  const png = await sharp({ create: { width: 16, height: 16, channels: 3, background: "white" } }).png().toBuffer();
  const first = await storeImage(png);
  const second = await storeImage(png);
  assert.notEqual(first, second);
  assert.ok(isUploadedImageUrl(first));
  assert.ok(await uploadedImageExists(first));
  const stored = await readFile(path.join(directory, first.split("/").at(-1)!));
  assert.equal((await sharp(stored).metadata()).format, "webp");
});

test("rejects path traversal, suffixes, and non-issued names", async () => {
  for (const value of ["../../secret", "name.svg", "https://example.com/a.webp", "/api/images/../../secret", "/api/images/1.webp", "/api/images/7ab4d135-88f0-4c14-bf67-a0f4db951a0e.webp?query=1"]) {
    assert.equal(isUploadedImageUrl(value), false);
    assert.equal(isImageFilename(value), false);
    assert.equal(await uploadedImageExists(value), false);
  }
});
