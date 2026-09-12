import { Router, type IRouter } from "express";
import healthRouter from "./health";
import nourishloopRouter from "./nourishloop";

const router: IRouter = Router();

router.use(healthRouter);
router.use(nourishloopRouter);

export default router;
