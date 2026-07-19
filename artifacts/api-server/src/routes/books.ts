import { Router, type IRouter } from "express";
import { db, booksTable, usersTable, wishlistTable } from "@workspace/db";
import { eq, and, ilike, gte, lte, desc, asc, or, sql } from "drizzle-orm";
import { requireAuth, getAuthUser } from "../lib/auth";

const router: IRouter = Router();

// GET /books - list with filters
router.get("/books", async (req, res): Promise<void> => {
  const {
    search, category, department, semester, condition,
    minPrice, maxPrice, listingType, page = "1", limit = "12", sort = "newest"
  } = req.query as Record<string, string>;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, parseInt(limit, 10) || 12);
  const offset = (pageNum - 1) * limitNum;

  const conditions: any[] = [eq(booksTable.isAvailable, true)];

  if (search) {
    conditions.push(
      or(
        ilike(booksTable.title, `%${search}%`),
        ilike(booksTable.author, `%${search}%`),
        ilike(booksTable.publisher, `%${search}%`)
      )
    );
  }
  if (category) conditions.push(ilike(booksTable.category, `%${category}%`));
  if (department) conditions.push(eq(booksTable.department, department));
  if (semester) conditions.push(eq(booksTable.semester, semester));
  if (condition) conditions.push(eq(booksTable.condition, condition));
  if (listingType) conditions.push(eq(booksTable.listingType, listingType));
  if (minPrice) conditions.push(gte(booksTable.price, parseFloat(minPrice)));
  if (maxPrice) conditions.push(lte(booksTable.price, parseFloat(maxPrice)));

  const orderBy = sort === "price-asc"
    ? asc(booksTable.price)
    : sort === "price-desc"
    ? desc(booksTable.price)
    : sort === "popular"
    ? desc(booksTable.viewCount)
    : desc(booksTable.createdAt);

  const whereClause = and(...conditions);

  const [books, countResult] = await Promise.all([
    db.select({
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
    .where(whereClause)
    .orderBy(orderBy)
    .limit(limitNum)
    .offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(booksTable).where(whereClause),
  ]);

  const total = Number(countResult[0]?.count || 0);
  res.json({
    books: books.map(b => ({ ...b, createdAt: b.createdAt.toISOString() })),
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum),
  });
});

// GET /books/featured
router.get("/books/featured", async (_req, res): Promise<void> => {
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
  .orderBy(desc(booksTable.wishlistCount))
  .limit(8);

  res.json(books.map(b => ({ ...b, createdAt: b.createdAt.toISOString() })));
});

// GET /books/popular
router.get("/books/popular", async (_req, res): Promise<void> => {
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
  .limit(8);

  res.json(books.map(b => ({ ...b, createdAt: b.createdAt.toISOString() })));
});

// GET /books/my-listings
router.get("/books/my-listings", requireAuth, async (req, res): Promise<void> => {
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
  .where(eq(booksTable.sellerId, auth.userId))
  .orderBy(desc(booksTable.createdAt));

  res.json(books.map(b => ({ ...b, createdAt: b.createdAt.toISOString() })));
});

// GET /books/:id
router.get("/books/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid book ID" }); return; }

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
    sellerEmail: usersTable.email,
    sellerPhone: usersTable.phone,
    sellerCollege: usersTable.college,
  })
  .from(booksTable)
  .innerJoin(usersTable, eq(booksTable.sellerId, usersTable.id))
  .where(eq(booksTable.id, id));

  if (!book) { res.status(404).json({ error: "Book not found" }); return; }

  // Increment view count
  await db.update(booksTable).set({ viewCount: book.viewCount + 1 }).where(eq(booksTable.id, id));

  // Check wishlist status for authenticated user
  const authUser = getAuthUser(req);
  let isInWishlist = false;
  if (authUser) {
    const [w] = await db.select().from(wishlistTable)
      .where(and(eq(wishlistTable.userId, authUser.userId), eq(wishlistTable.bookId, id)));
    isInWishlist = !!w;
  }

  res.json({ ...book, createdAt: book.createdAt.toISOString(), isInWishlist });
});

// POST /books
router.post("/books", requireAuth, async (req, res): Promise<void> => {
  const auth = getAuthUser(req)!;
  const { title, author, publisher, category, department, semester, condition, price, listingType, description, imageUrl } = req.body;

  if (!title || !author || !publisher || !category || !department || !semester || !condition) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const [book] = await db.insert(booksTable).values({
    title, author, publisher, category, department, semester, condition,
    price: parseFloat(price) || 0,
    listingType: listingType || "sell",
    description: description || null,
    imageUrl: imageUrl || null,
    sellerId: auth.userId,
  }).returning();

  // Update category book count
  await db.execute(sql`UPDATE categories SET book_count = book_count + 1 WHERE name = ${category}`);

  const [seller] = await db.select().from(usersTable).where(eq(usersTable.id, auth.userId));

  res.status(201).json({ ...book, sellerName: seller?.name || "", createdAt: book.createdAt.toISOString() });
});

// PATCH /books/:id
router.patch("/books/:id", requireAuth, async (req, res): Promise<void> => {
  const auth = getAuthUser(req)!;
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid book ID" }); return; }

  const [existing] = await db.select().from(booksTable).where(eq(booksTable.id, id));
  if (!existing) { res.status(404).json({ error: "Book not found" }); return; }
  if (existing.sellerId !== auth.userId && auth.role !== "admin") {
    res.status(403).json({ error: "Forbidden" }); return;
  }

  const updates: Partial<typeof booksTable.$inferInsert> = {};
  const { title, author, publisher, category, department, semester, condition, price, listingType, description, imageUrl, isAvailable } = req.body;
  if (title !== undefined) updates.title = title;
  if (author !== undefined) updates.author = author;
  if (publisher !== undefined) updates.publisher = publisher;
  if (category !== undefined) updates.category = category;
  if (department !== undefined) updates.department = department;
  if (semester !== undefined) updates.semester = semester;
  if (condition !== undefined) updates.condition = condition;
  if (price !== undefined) updates.price = parseFloat(price);
  if (listingType !== undefined) updates.listingType = listingType;
  if (description !== undefined) updates.description = description;
  if (imageUrl !== undefined) updates.imageUrl = imageUrl;
  if (isAvailable !== undefined) updates.isAvailable = isAvailable;

  const [book] = await db.update(booksTable).set(updates).where(eq(booksTable.id, id)).returning();
  const [seller] = await db.select().from(usersTable).where(eq(usersTable.id, book.sellerId));

  res.json({ ...book, sellerName: seller?.name || "", createdAt: book.createdAt.toISOString() });
});

// DELETE /books/:id
router.delete("/books/:id", requireAuth, async (req, res): Promise<void> => {
  const auth = getAuthUser(req)!;
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid book ID" }); return; }

  const [existing] = await db.select().from(booksTable).where(eq(booksTable.id, id));
  if (!existing) { res.status(404).json({ error: "Book not found" }); return; }
  if (existing.sellerId !== auth.userId && auth.role !== "admin") {
    res.status(403).json({ error: "Forbidden" }); return;
  }

  await db.delete(booksTable).where(eq(booksTable.id, id));
  await db.execute(sql`UPDATE categories SET book_count = GREATEST(book_count - 1, 0) WHERE name = ${existing.category}`);

  res.json({ message: "Book deleted" });
});

export default router;
