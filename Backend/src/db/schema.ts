import * as p from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";

export const planEnum = p.pgEnum("plan", ["free", "pro", "business"]);
export const users = p.pgTable("users", {
  id: p
    .varchar()
    .primaryKey()
    .$default(() => nanoid()),
  supabaseId: p.uuid("supabase_id").notNull().unique(),
  email: p.varchar({ length: 255 }).notNull().unique(),
  password: p.varchar({ length: 255 }).notNull(),
  name: p.varchar({ length: 100 }).notNull(),
  userName: p.varchar("user_name", { length: 100 }).notNull(),
  plan: planEnum().notNull().default("free"),
  isActive: p.boolean().notNull().default(true),
  isVerified: p.boolean().notNull().default(false),
  createdAt: p.timestamp().notNull().defaultNow(),
  updatedAt: p
    .timestamp()
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const links = p.pgTable("links", {
  id: p
    .varchar()
    .primaryKey()
    .$default(() => nanoid()),
  shortCode: p.varchar().notNull().unique(),
  originalUrl: p.text().notNull(),
  userId: p
    .varchar()
    .references(() => users.id)
    .notNull(),
  title: p.varchar().notNull(),
  isCustomCode: p.boolean().notNull(),
  isActive: p.boolean().notNull().default(true),
  expiresAt: p
    .timestamp()
    .notNull()
    .$default(() => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
  createdAt: p.timestamp().notNull().defaultNow(),
  updatedAt: p
    .timestamp()
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const clickEvents = p.pgTable("click_events", {
  id: p
    .varchar()
    .primaryKey()
    .$default(() => nanoid()),
  linkId: p.varchar().references(() => links.id),
  clickedAt: p.timestamp().notNull().defaultNow(),
  referer: p.varchar(),
  ip: p.varchar(),
  country: p.varchar(),
  city: p.varchar(),
  userAgent: p.varchar(),
  browser: p.varchar(),
  browserVersion: p.varchar(),
  os: p.varchar(),
  device: p.varchar(),
  isBot: p.boolean(),
});
