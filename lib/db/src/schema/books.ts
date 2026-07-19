import { pgTable, text, serial, timestamp, boolean, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const booksTable = pgTable("books", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  author: text("author").notNull(),
  publisher: text("publisher").notNull(),
  category: text("category").notNull(),
  department: text("department").notNull(),
  semester: text("semester").notNull(),
  condition: text("condition").notNull(), // new, like-new, good, fair, poor
  price: real("price").notNull().default(0),
  listingType: text("listing_type").notNull().default("sell"), // sell, exchange, donate
  description: text("description"),
  imageUrl: text("image_url"),
  isAvailable: boolean("is_available").notNull().default(true),
  sellerId: integer("seller_id").notNull().references(() => usersTable.id),
  viewCount: integer("view_count").notNull().default(0),
  wishlistCount: integer("wishlist_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertBookSchema = createInsertSchema(booksTable).omit({ id: true, createdAt: true, updatedAt: true, viewCount: true, wishlistCount: true });
export type InsertBook = z.infer<typeof insertBookSchema>;
export type Book = typeof booksTable.$inferSelect;
