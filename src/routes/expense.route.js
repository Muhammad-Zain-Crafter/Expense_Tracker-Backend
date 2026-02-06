import { addExpense, deleteExpense, getExpense } from "../controllers/expense.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { Router } from "express";

const router = Router();

router.route('/add-expense').post(
    verifyJWT, addExpense
)
router.route('/get-expense').get(
    verifyJWT, getExpense
)
router.route('/delete-expense/:id').delete(
    verifyJWT, deleteExpense
)
export default router;