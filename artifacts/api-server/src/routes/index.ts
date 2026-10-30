import { Router, type IRouter } from "express";
import healthRouter from "./health";
import imageRouter from "./images";
import portfolioRouter from "./portfolio";
import messagesRouter from "./messages";

const router: IRouter = Router();

router.use(healthRouter);
router.use(portfolioRouter);
router.use(messagesRouter);
router.use(imageRouter);

export default router;
