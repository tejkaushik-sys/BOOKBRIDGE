import { Router, type IRouter } from "express";
import { db, usersTable, booksTable, exchangesTable, categoriesTable, contactsTable } from "@workspace/db";
import { eq, ilike, desc, sql, and } from "drizzle-orm";
import { requireAdmin } from "../lib/auth";

const router: IRouter = Router();

router.get("/admin/stats", requireAdmin, async (_req, res): Promise<void> => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [users, books, exchanges, categories, newUsers, newBooks] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(usersTable),
    db.select({ count: sql<number>`count(*)` }).from(booksTable),
    db.select({ count: sql<number>`count(*)` }).from(exchangesTable),
    db.select({ count: sql<number>`count(*)` }).from(categoriesTable),
    db.select({ count: sql<number>`count(*)` }).from(usersTable).where(sql`created_at >= ${startOfMonth}`),
    db.select({ count: sql<number>`count(*)` }).from(booksTable).where(sql`created_at >= ${startOfMonth}`),
  ]);

  // Recent activity from books and exchanges
  const recentBooks = await db.select({
    id: booksTable.id,
    type: sql<string>`'book'`,
    description: sql<string>`'New book listed: ' || ${booksTable.title}`,
    createdAt: booksTable.createdAt,
  }).from(booksTable).orderBy(desc(booksTable.createdAt)).limit(5);

  const recentExchanges = await db.select({
    id: exchangesTable.id,
    type: sql<string>`'exchange'`,
    description: sql<string>`'Exchange request ' || ${exchangesTable.status}`,
    createdAt: exchangesTable.createdAt,
  }).from(exchangesTable).orderBy(desc(exchangesTable.createdAt)).limit(5);

  const recentActivity = [...recentBooks, ...recentExchanges]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8)
    .map(a => ({ ...a, createdAt: new Date(a.createdAt).toISOString() }));

  res.json({
    totalUsers: Number(users[0]?.count || 0),
    totalBooks: Number(books[0]?.count || 0),
    totalExchanges: Number(exchanges[0]?.count || 0),
    totalCategories: Number(categories[0]?.count || 0),
    newUsersThisMonth: Number(newUsers[0]?.count || 0),
    newBooksThisMonth: Number(newBooks[0]?.count || 0),
    recentActivity,
  });
});

router.get("/admin/users", requireAdmin, async (req, res): Promise<void> => {
  const { search, page = "1" } = req.query as Record<string, string>;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limit = 20;
  const offset = (pageNum - 1) * limit;

  const conditions = search
    ? [sql`(${usersTable.name} ILIKE ${'%' + search + '%'} OR ${usersTable.email} ILIKE ${'%' + search + '%'})`]
    : [];

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [users, countResult] = await Promise.all([
    db.select({
      id: usersTable.id, name: usersTable.name, email: usersTable.email,
      phone: usersTable.phone, role: usersTable.role, department: usersTable.department,
      semester: usersTable.semester, college: usersTable.college,
      profilePicture: usersTable.profilePicture, isActive: usersTable.isActive,
      createdAt: usersTable.createdAt,
    })
    .from(usersTable)
    .where(whereClause)
    .orderBy(desc(usersTable.createdAt))
    .limit(limit)
    .offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(usersTable).where(whereClause),
  ]);

  const total = Number(countResult[0]?.count || 0);
  res.json({
    users: users.map(u => ({ ...u, createdAt: u.createdAt.toISOString() })),
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limit),
  });
});

router.patch("/admin/users/:id", requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const { name, isActive, role } = req.body;
  const updates: any = {};
  if (name !== undefined) updates.name = name;
  if (isActive !== undefined) updates.isActive = isActive;
  if (role !== undefined) updates.role = role;

  const [user] = await db.update(usersTable).set(updates).where(eq(usersTable.id, id)).returning();
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  res.json({ ...user, createdAt: user.createdAt.toISOString() });
});

router.delete("/admin/users/:id", requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  await db.delete(usersTable).where(eq(usersTable.id, id));
  res.json({ message: "User deleted" });
});

router.get("/admin/books", requireAdmin, async (req, res): Promise<void> => {
  const { page = "1", search } = req.query as Record<string, string>;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limit = 20;
  const offset = (pageNum - 1) * limit;

  const conditions = search ? [ilike(booksTable.title, `%${search}%`)] : [];
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

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
    .orderBy(desc(booksTable.createdAt))
    .limit(limit)
    .offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(booksTable).where(whereClause),
  ]);

  const total = Number(countResult[0]?.count || 0);
  res.json({
    books: books.map(b => ({ ...b, createdAt: b.createdAt.toISOString() })),
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limit),
  });
});

router.get("/admin/analytics", requireAdmin, async (_req, res): Promise<void> => {
  const [catBooks, condBooks, typeBooks, userGrowthRaw, exchangeMonths] = await Promise.all([
    db.select({
      label: booksTable.category,
      value: sql<number>`count(*)`,
    }).from(booksTable).groupBy(booksTable.category).orderBy(sql`count(*) desc`).limit(12),

    db.select({
      label: booksTable.condition,
      value: sql<number>`count(*)`,
    }).from(booksTable).groupBy(booksTable.condition),

    db.select({
      label: booksTable.listingType,
      value: sql<number>`count(*)`,
    }).from(booksTable).groupBy(booksTable.listingType),

    db.execute(sql`
      SELECT TO_CHAR(created_at, 'Mon') as label, COUNT(*) as value
      FROM users
      WHERE created_at >= NOW() - INTERVAL '6 months'
      GROUP BY TO_CHAR(created_at, 'Mon'), DATE_TRUNC('month', created_at)
      ORDER BY DATE_TRUNC('month', created_at)
    `),

    db.execute(sql`
      SELECT TO_CHAR(created_at, 'Mon') as label, COUNT(*) as value
      FROM exchange_requests
      WHERE created_at >= NOW() - INTERVAL '6 months'
      GROUP BY TO_CHAR(created_at, 'Mon'), DATE_TRUNC('month', created_at)
      ORDER BY DATE_TRUNC('month', created_at)
    `),
  ]);

  res.json({
    booksByCategory: catBooks.map(r => ({ label: r.label, value: Number(r.value) })),
    booksByCondition: condBooks.map(r => ({ label: r.label, value: Number(r.value) })),
    listingsByType: typeBooks.map(r => ({ label: r.label, value: Number(r.value) })),
    userGrowth: (userGrowthRaw.rows as any[]).map(r => ({ label: r.label, value: Number(r.value) })),
    exchangesByMonth: (exchangeMonths.rows as any[]).map(r => ({ label: r.label, value: Number(r.value) })),
  });
});

export default router;
