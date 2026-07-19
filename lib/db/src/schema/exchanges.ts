import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { booksTable } from "./books";

export const exchangesTable = pgTable("exchange_requests", {
  id: serial("id").primaryKey(),
  bookId: integer("book_id").notNull().references(() => booksTable.id),
  requesterId: integer("requester_id").notNull().references(() => usersTable.id),
  ownerId: integer("owner_id").notNull().references(() => usersTable.id),
  status: text("status").notNull().default("pending"), // pending, accepted, rejected, completed
  message: text("message"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertExchangeSchema = createInsertSchema(exchangesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertExchange = z.infer<typeof insertExchangeSchema>;
export type Exchange = typeof exchangesTable.$inferSelect;
