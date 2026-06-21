import * as p from "drizzle-orm/pg-core";

export const planEnum = p.pgEnum("plan", ["free", "pro", "business"]);
export const users = p.pgTable("users", {
  id: p.varchar().primaryKey(),
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

export const link = p.pgTable("links", {
  id: p.varchar().primaryKey(),
  shortCode: p.varchar().notNull().unique(),
  originalUrl: p.text().notNull(),
  userId: p.varchar().references(() => users.id),
  title: p.varchar(),
  isCustomCode: p.boolean(),
  expiresAt: p.timestamp(),
  createdAt: p.timestamp(),
  updatedAt: p.timestamp(),
});

export const clickEvents = p.pgTable("click_events", {
  id: p.varchar().primaryKey(),
  linkId: p.varchar().references(() => link.id),

  clickedAt: p.timestamp().notNull(),

  referer: p.varchar(),

  ip: p.varchar(),
  country: p.varchar(),
  city: p.varchar(),

  userAgent: p.varchar(),
  browser: p.varchar(),
  borwserVersion: p.varchar(),
  os: p.varchar(),
  device: p.varchar(),

  isBot: p.boolean(),
});
