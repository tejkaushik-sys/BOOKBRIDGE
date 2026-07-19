import { Router, type IRouter } from "express";
import { db, categoriesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "../lib/auth";

const router: IRouter = Router();

router.get("/categories", async (_req, res): Promise<void> => {
  const categories = await db.select().from(categoriesTable).orderBy(categoriesTable.name);
  res.json(categories);
});

router.get("/categories/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const [cat] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, id));
  if (!cat) { res.status(404).json({ error: "Category not found" }); return; }
  res.json(cat);
});

router.post("/admin/categories", requireAdmin, async (req, res): Promise<void> => {
  const { name, icon } = req.body;
  if (!name || !icon) { res.status(400).json({ error: "Name and icon are required" }); return; }

  const [cat] = await db.insert(categoriesTable).values({ name, icon }).returning();
  res.status(201).json(cat);
});

router.delete("/admin/categories/:id", requireAdmin, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  await db.delete(categoriesTable).where(eq(categoriesTable.id, id));
  res.json({ message: "Category deleted" });
});

export default router;
