import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { signToken, requireAuth, getAuthUser } from "../lib/auth";

const router: IRouter = Router();

router.post("/auth/register", async (req, res): Promise<void> => {
  const { name, email, password, phone, department, semester, college, profilePicture } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ error: "Name, email, and password are required" });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ error: "Invalid email format" });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ error: "Password must be at least 6 characters" });
    return;
  }

  const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing) {
    res.status(400).json({ error: "Email already registered" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const [user] = await db.insert(usersTable).values({
    name,
    email,
    passwordHash,
    phone: phone || null,
    department: department || "",
    semester: semester || "",
    college: college || "",
    profilePicture: profilePicture || null,
    role: "student",
  }).returning();

  const token = signToken({ userId: user.id, role: user.role });

  res.status(201).json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      department: user.department,
      semester: user.semester,
      college: user.college,
      profilePicture: user.profilePicture,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
    },
    token,
  });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  if (!user.isActive) {
    res.status(401).json({ error: "Account has been deactivated" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const token = signToken({ userId: user.id, role: user.role });

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      department: user.department,
      semester: user.semester,
      college: user.college,
      profilePicture: user.profilePicture,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
    },
    token,
  });
});

router.post("/auth/logout", (_req, res): Promise<void> => {
  res.json({ message: "Logged out successfully" });
  return Promise.resolve();
});

router.get("/auth/me", requireAuth, async (req, res): Promise<void> => {
  const auth = getAuthUser(req)!;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, auth.userId));
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    department: user.department,
    semester: user.semester,
    college: user.college,
    profilePicture: user.profilePicture,
    isActive: user.isActive,
    createdAt: user.createdAt.toISOString(),
  });
});

export default router;
