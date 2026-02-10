import Router from "express";
import { monthlySummary } from "../controllers/dashboard.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route('/monthly-summary').get(
    verifyJWT, monthlySummary
)

export default router