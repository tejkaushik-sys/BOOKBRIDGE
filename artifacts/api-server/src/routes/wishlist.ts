import { Router, type IRouter } from "express";
import { db, wishlistTable, booksTable, usersTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { requireAuth, getAuthUser } from "../lib/auth";

const router: IRouter = Router();

router.get("/wishlist", requireAuth, async (req, res): Promise<void> => {
  const auth = getAuthUser(req)!;

  const items = await db.select({
    id: wishlistTable.id,
    bookId: wishlistTable.bookId,
    userId: wishlistTable.userId,
    addedAt: wishlistTable.addedAt,
    book: {
      id: booksTable.id, title: booksTable.title, author: booksTable.author,
      publisher: booksTable.publisher, category: booksTable.category,
      department: booksTable.department, semester: booksTable.semester,
      condition: booksTable.condition, price: booksTable.price,
      listingType: booksTable.listingType, description: booksTable.description,
      imageUrl: booksTable.imageUrl, isAvailable: booksTable.isAvailable,
      sellerId: booksTable.sellerId, viewCount: booksTable.viewCount,
      wishlistCount: booksTable.wishlistCount, createdAt: booksTable.createdAt,
      sellerName: usersTable.name,
    },
  })
  .from(wishlistTable)
  .innerJoin(booksTable, eq(wishlistTable.bookId, booksTable.id))
  .innerJoin(usersTable, eq(booksTable.sellerId, usersTable.id))
  .where(eq(wishlistTable.userId, auth.userId));

  res.json(items.map(item => ({
    ...item,
    addedAt: item.addedAt.toISOString(),
    book: { ...item.book, createdAt: item.book.createdAt.toISOString() },
  })));
});

router.post("/wishlist", requireAuth, async (req, res): Promise<void> => {
  const auth = getAuthUser(req)!;
  const { bookId } = req.body;
  if (!bookId) { res.status(400).json({ error: "bookId is required" }); return; }

  const bid = parseInt(String(bookId), 10);
  const [existing] = await db.select().from(wishlistTable)
    .where(and(eq(wishlistTable.userId, auth.userId), eq(wishlistTable.bookId, bid)));

  if (existing) { res.status(400).json({ error: "Book already in wishlist" }); return; }

  const [item] = await db.insert(wishlistTable).values({ userId: auth.userId, bookId: bid }).returning();
  await db.execute(sql`UPDATE books SET wishlist_count = wishlist_count + 1 WHERE id = ${bid}`);

  const [book] = await db.select({
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
  .where(eq(booksTable.id, bid));

  res.status(201).json({
    ...item,
    addedAt: item.addedAt.toISOString(),
    book: book ? { ...book, createdAt: book.createdAt.toISOString() } : null,
  });
});

router.delete("/wishlist/:bookId", requireAuth, async (req, res): Promise<void> => {
  const auth = getAuthUser(req)!;
  const raw = Array.isArray(req.params.bookId) ? req.params.bookId[0] : req.params.bookId;
  const bookId = parseInt(raw, 10);
  if (isNaN(bookId)) { res.status(400).json({ error: "Invalid bookId" }); return; }

  await db.delete(wishlistTable)
    .where(and(eq(wishlistTable.userId, auth.userId), eq(wishlistTable.bookId, bookId)));
  await db.execute(sql`UPDATE books SET wishlist_count = GREATEST(wishlist_count - 1, 0) WHERE id = ${bookId}`);

  res.json({ message: "Removed from wishlist" });
});

export default router;
