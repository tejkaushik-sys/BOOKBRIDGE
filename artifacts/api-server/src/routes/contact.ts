import { Router, type IRouter } from "express";
import { db, contactsTable } from "@workspace/db";

const router: IRouter = Router();

router.post("/contact", async (req, res): Promise<void> => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    res.status(400).json({ error: "All fields are required" });
    return;
  }

  await db.insert(contactsTable).values({ name, email, subject, message });
  res.json({ message: "Message sent successfully. We will get back to you soon!" });
});

export default router;
