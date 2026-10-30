import { Router, type IRouter } from "express";
import { desc } from "drizzle-orm";
import { db, visitorMessagesTable } from "@workspace/db";
import { CreateVisitorMessageBody, ListVisitorMessagesResponse } from "@workspace/api-zod";
import { requireOwner } from "../lib/owner";

const router: IRouter = Router();

// A small process-wide ceiling limits unsolicited submissions without retaining IP addresses.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 20;
let windowStart = Date.now();
let submissions = 0;

// Public submission is intentionally restricted to these fields; all message reads remain owner-only.
router.post("/messages", async (req, res) => {
  const parsed = CreateVisitorMessageBody.safeParse(req.body);
  const name = parsed.success ? parsed.data.name.trim() : "";
  const message = parsed.success ? parsed.data.message.trim() : "";
  if (!parsed.success || !name || !message) {
    res.status(400).json({ error: "Enter your name and a message." }); return;
  }
  if (parsed.data.website) { res.status(201).json({ received: true }); return; }
  const now = Date.now();
  if (now - windowStart >= WINDOW_MS) { windowStart = now; submissions = 0; }
  if (submissions >= MAX_PER_WINDOW) {
    res.status(429).json({ error: "Too many messages. Please try again later." }); return;
  }
  submissions += 1;
  await db.insert(visitorMessagesTable).values({ name, message });
  res.status(201).json({ received: true });
});

router.get("/admin/messages", requireOwner, async (_req, res) => {
  const rows = await db.select().from(visitorMessagesTable)
    .orderBy(desc(visitorMessagesTable.createdAt), desc(visitorMessagesTable.id)).limit(200);
  res.set("Cache-Control", "no-store").json(ListVisitorMessagesResponse.parse(rows));
});

export default router;
