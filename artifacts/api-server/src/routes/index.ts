import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import booksRouter from "./books";
import categoriesRouter from "./categories";
import wishlistRouter from "./wishlist";
import exchangesRouter from "./exchanges";
import dashboardRouter from "./dashboard";
import adminRouter from "./admin";
import contactRouter from "./contact";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(booksRouter);
router.use(categoriesRouter);
router.use(wishlistRouter);
router.use(exchangesRouter);
router.use(dashboardRouter);
router.use(adminRouter);
router.use(contactRouter);

export default router;
