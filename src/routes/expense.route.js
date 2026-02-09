import { addExpense, deleteExpense, getExpense, updateExpense } from "../controllers/expense.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { Router } from "express";

const router = Router();

router.route('/add-expense').post(
    verifyJWT, addExpense
)
router.route('/get-expense').get(
    verifyJWT, getExpense
)
router.route('/update-expense/:id').put(
    verifyJWT, updateExpense
)
router.route('/delete-expense/:id').delete(
    verifyJWT, deleteExpense
)
export default router;