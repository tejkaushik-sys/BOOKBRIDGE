import { Router, type IRouter } from "express";
import { db, booksTable, wishlistTable, exchangesTable, usersTable } from "@workspace/db";
import { eq, and, desc, sql } from "drizzle-orm";
import { requireAuth, getAuthUser } from "../lib/auth";

const router: IRouter = Router();

router.get("/dashboard/stats", requireAuth, async (req, res): Promise<void> => {
  const auth = getAuthUser(req)!;

  const [listings, wishlist, pending, completed] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(booksTable).where(eq(booksTable.sellerId, auth.userId)),
    db.select({ count: sql<number>`count(*)` }).from(wishlistTable).where(eq(wishlistTable.userId, auth.userId)),
    db.select({ count: sql<number>`count(*)` }).from(exchangesTable)
      .where(and(eq(exchangesTable.ownerId, auth.userId), eq(exchangesTable.status, "pending"))),
    db.select({ count: sql<number>`count(*)` }).from(exchangesTable)
      .where(and(
        sql`(${exchangesTable.requesterId} = ${auth.userId} OR ${exchangesTable.ownerId} = ${auth.userId})`,
        eq(exchangesTable.status, "completed")
      )),
  ]);

  res.json({
    totalListings: Number(listings[0]?.count || 0),
    wishlistCount: Number(wishlist[0]?.count || 0),
    pendingRequests: Number(pending[0]?.count || 0),
    completedExchanges: Number(completed[0]?.count || 0),
  });
});

router.get("/dashboard/recent-views", requireAuth, async (req, res): Promise<void> => {
  // Return recently updated/viewed books not owned by user as a proxy for viewed
  const auth = getAuthUser(req)!;
  const books = await db.select({
    id: booksTable.id, title: booksTable.title, author: booksTable.author,
    publisher: booksTable.publisher, category: booksTable.category,
    department: booksTable.department, semester: booksTable.semester,
    condition: booksTable.condition, price: booksTable.price,
    listingType: booksTable.listingType, description: booksTable.description,
    imageUrl: booksTable.imageUrl, isAvailable: booksTable.isAvailable,
    sellerId: booksTable.sellerId, viewCount: booksTable.viewCount,
    wishlistCount: booksTable.wishlistCount, createdAt: booksTable.createdAt,
    sellerName: usersTable.name,
  })
  .from(booksTable)
  .innerJoin(usersTable, eq(booksTable.sellerId, usersTable.id))
  .where(eq(booksTable.isAvailable, true))
  .orderBy(desc(booksTable.viewCount))
  .limit(6);

  res.json(books.map(b => ({ ...b, createdAt: b.createdAt.toISOString() })));
});

router.get("/dashboard/recommended", requireAuth, async (req, res): Promise<void> => {
  const auth = getAuthUser(req)!;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, auth.userId));

  const books = await db.select({
    id: booksTable.id, title: booksTable.title, author: booksTable.author,
    publisher: booksTable.publisher, category: booksTable.category,
    department: booksTable.department, semester: booksTable.semester,
    condition: booksTable.condition, price: booksTable.price,
    listingType: booksTable.listingType, description: booksTable.description,
    imageUrl: booksTable.imageUrl, isAvailable: booksTable.isAvailable,
    sellerId: booksTable.sellerId, viewCount: booksTable.viewCount,
    wishlistCount: booksTable.wishlistCount, createdAt: booksTable.createdAt,
    sellerName: usersTable.name,
  })
  .from(booksTable)
  .innerJoin(usersTable, eq(booksTable.sellerId, usersTable.id))
  .where(and(
    eq(booksTable.isAvailable, true),
    eq(booksTable.department, user?.department || "")
  ))
  .orderBy(desc(booksTable.wishlistCount))
  .limit(6);

  // If not enough department-specific books, fill with popular books
  if (books.length < 6) {
    const more = await db.select({
      id: booksTable.id, title: booksTable.title, author: booksTable.author,
      publisher: booksTable.publisher, category: booksTable.category,
      department: booksTable.department, semester: booksTable.semester,
      condition: booksTable.condition, price: booksTable.price,
      listingType: booksTable.listingType, description: booksTable.description,
      imageUrl: booksTable.imageUrl, isAvailable: booksTable.isAvailable,
      sellerId: booksTable.sellerId, viewCount: booksTable.viewCount,
      wishlistCount: booksTable.wishlistCount, createdAt: booksTable.createdAt,
      sellerName: usersTable.name,
    })
    .from(booksTable)
    .innerJoin(usersTable, eq(booksTable.sellerId, usersTable.id))
    .where(eq(booksTable.isAvailable, true))
    .orderBy(desc(booksTable.wishlistCount))
    .limit(6);

    const existingIds = new Set(books.map(b => b.id));
    for (const b of more) {
      if (!existingIds.has(b.id) && books.length < 6) books.push(b);
    }
  }

  res.json(books.map(b => ({ ...b, createdAt: b.createdAt.toISOString() })));
});

export default router;
