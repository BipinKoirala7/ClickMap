import * as p from "drizzle-orm/pg-core";

// Add Plans info into the table
export const userTable = p.pgTable("users", {
  id: p.varchar().primaryKey(),
  userName: p.varchar().notNull().unique(),
  fullName: p.varchar().notNull(),
  email: p.varchar().notNull().unique(),
  password: p.varchar().notNull(),
  createdAt: p.timestamp(),
  updatedAt: p.timestamp(),
});

export const linkTable = p.pgTable("links", {
  id: p.varchar().primaryKey().unique(),
  shortCode: p.varchar().notNull().unique(),
  originalUrl: p.text().notNull(),
  userId: p.varchar().references(() => userTable.id),
  title: p.varchar(),
  isCustomCode: p.boolean(),
  expiresAt: p.timestamp(),
  createdAt: p.timestamp(),
  updatedAt: p.timestamp(),
});
