import { Router, type IRouter } from "express";
import { db, exchangesTable, booksTable, usersTable } from "@workspace/db";
import { eq, and, or } from "drizzle-orm";
import { requireAuth, getAuthUser } from "../lib/auth";

const router: IRouter = Router();

router.get("/exchanges", requireAuth, async (req, res): Promise<void> => {
  const auth = getAuthUser(req)!;
  const { status } = req.query as Record<string, string>;

  const conditions: any[] = [
    or(eq(exchangesTable.requesterId, auth.userId), eq(exchangesTable.ownerId, auth.userId))
  ];
  if (status) conditions.push(eq(exchangesTable.status, status));

  const exchanges = await db.select({
    id: exchangesTable.id,
    bookId: exchangesTable.bookId,
    requesterId: exchangesTable.requesterId,
    ownerId: exchangesTable.ownerId,
    status: exchangesTable.status,
    message: exchangesTable.message,
    createdAt: exchangesTable.createdAt,
    updatedAt: exchangesTable.updatedAt,
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
    requesterName: usersTable.name,
    requesterEmail: usersTable.email,
  })
  .from(exchangesTable)
  .innerJoin(booksTable, eq(exchangesTable.bookId, booksTable.id))
  .innerJoin(usersTable, eq(exchangesTable.requesterId, usersTable.id))
  .where(and(...conditions));

  // Get owner names
  const ownerIds = [...new Set(exchanges.map(e => e.ownerId))];
  const owners = ownerIds.length > 0
    ? await db.select({ id: usersTable.id, name: usersTable.name })
        .from(usersTable)
        .where(or(...ownerIds.map(id => eq(usersTable.id, id))))
    : [];
  const ownerMap = new Map(owners.map(o => [o.id, o.name]));

  res.json(exchanges.map(e => ({
    ...e,
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
    ownerName: ownerMap.get(e.ownerId) || "",
    book: { ...e.book, createdAt: e.book.createdAt.toISOString() },
  })));
});

router.post("/exchanges", requireAuth, async (req, res): Promise<void> => {
  const auth = getAuthUser(req)!;
  const { bookId, message } = req.body;

  if (!bookId) { res.status(400).json({ error: "bookId is required" }); return; }

  const bid = parseInt(String(bookId), 10);
  const [book] = await db.select().from(booksTable).where(eq(booksTable.id, bid));
  if (!book) { res.status(404).json({ error: "Book not found" }); return; }
  if (!book.isAvailable) { res.status(400).json({ error: "Book is not available" }); return; }
  if (book.sellerId === auth.userId) { res.status(400).json({ error: "Cannot request your own book" }); return; }

  const [existing] = await db.select().from(exchangesTable)
    .where(and(eq(exchangesTable.bookId, bid), eq(exchangesTable.requesterId, auth.userId), eq(exchangesTable.status, "pending")));
  if (existing) { res.status(400).json({ error: "You already have a pending request for this book" }); return; }

  const [exchange] = await db.insert(exchangesTable).values({
    bookId: bid,
    requesterId: auth.userId,
    ownerId: book.sellerId,
    message: message || null,
  }).returning();

  const [requester] = await db.select().from(usersTable).where(eq(usersTable.id, auth.userId));
  const [owner] = await db.select().from(usersTable).where(eq(usersTable.id, book.sellerId));

  res.status(201).json({
    ...exchange,
    createdAt: exchange.createdAt.toISOString(),
    updatedAt: exchange.updatedAt.toISOString(),
    book: { ...book, sellerName: owner?.name || "", createdAt: book.createdAt.toISOString() },
    requesterName: requester?.name || "",
    requesterEmail: requester?.email || "",
    ownerName: owner?.name || "",
  });
});

router.patch("/exchanges/:id", requireAuth, async (req, res): Promise<void> => {
  const auth = getAuthUser(req)!;
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const { status } = req.body;
  if (!["accepted", "rejected", "completed"].includes(status)) {
    res.status(400).json({ error: "Invalid status" }); return;
  }

  const [exchange] = await db.select().from(exchangesTable).where(eq(exchangesTable.id, id));
  if (!exchange) { res.status(404).json({ error: "Exchange request not found" }); return; }

  if (exchange.ownerId !== auth.userId && exchange.requesterId !== auth.userId) {
    res.status(403).json({ error: "Forbidden" }); return;
  }

  const [updated] = await db.update(exchangesTable).set({ status }).where(eq(exchangesTable.id, id)).returning();

  const [book] = await db.select().from(booksTable).where(eq(booksTable.id, exchange.bookId));
  const [requester] = await db.select().from(usersTable).where(eq(usersTable.id, exchange.requesterId));
  const [owner] = await db.select().from(usersTable).where(eq(usersTable.id, exchange.ownerId));

  res.json({
    ...updated,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
    book: book ? { ...book, sellerName: owner?.name || "", createdAt: book.createdAt.toISOString() } : null,
    requesterName: requester?.name || "",
    requesterEmail: requester?.email || "",
    ownerName: owner?.name || "",
  });
});

export default router;
