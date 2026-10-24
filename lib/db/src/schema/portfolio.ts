import { pgTable, serial, text, boolean, jsonb, timestamp, integer } from "drizzle-orm/pg-core";

export const contentTable = pgTable("portfolio_content", {
  id: serial("id").primaryKey(),
  kind: text("kind").notNull(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  summary: text("summary").notNull(),
  body: text("body").notNull(),
  tags: jsonb("tags").$type<string[]>().notNull(),
  imageUrl: text("image_url").notNull().default(""),
  liveUrl: text("live_url").notNull().default(""),
  sourceUrl: text("source_url").notNull().default(""),
  published: boolean("published").notNull().default(false),
  featured: boolean("featured").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).defaultNow().notNull(),
});

export const profileTable = pgTable("portfolio_profile", {
  id: integer("id").primaryKey(),
  data: jsonb("data").$type<Record<string, string>>().notNull(),
});
