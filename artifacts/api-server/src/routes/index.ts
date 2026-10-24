import { Router, type IRouter } from "express";
import healthRouter from "./health";
import imageRouter from "./images";
import portfolioRouter from "./portfolio";

const router: IRouter = Router();

router.use(healthRouter);
router.use(portfolioRouter);
router.use(imageRouter);

export default router;
