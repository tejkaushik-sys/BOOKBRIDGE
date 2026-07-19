import { pgTable, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { booksTable } from "./books";

export const wishlistTable = pgTable("wishlist", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  bookId: integer("book_id").notNull().references(() => booksTable.id),
  addedAt: timestamp("added_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertWishlistSchema = createInsertSchema(wishlistTable).omit({ id: true, addedAt: true });
export type InsertWishlist = z.infer<typeof insertWishlistSchema>;
export type WishlistEntry = typeof wishlistTable.$inferSelect;
