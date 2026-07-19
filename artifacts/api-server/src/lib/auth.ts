import jwt from "jsonwebtoken";
import { type Request, type Response, type NextFunction } from "express";


const SECRET = process.env.SESSION_SECRET || "bookbridge-secret-key";

export interface AuthPayload {
  userId: number;
  role: string;
}

export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): AuthPayload | null {
  try {
    return jwt.verify(token, SECRET) as AuthPayload;
  } catch {
    return null;
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const token = auth.slice(7);
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }
  (req as any).authUser = payload;
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  requireAuth(req, res, () => {
    const user = (req as any).authUser as AuthPayload;
    if (user.role !== "admin") {
      res.status(403).json({ error: "Admin access required" });
      return;
    }
    next();
  });
}

export function getAuthUser(req: Request): AuthPayload | null {
  return (req as any).authUser || null;
}
