import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import Expense from "../models/expense.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { isValidObjectId } from "mongoose";

const addExpense = asyncHandler(async (req, res) => {
  const { title, amount, category, description } = req.body;
  if (!title) {
    throw new ApiError(400, "title is required");
  }
  if (!amount) {
    throw new ApiError(400, "amount is required");
  }
  if (amount <= 0 || isNaN(amount)) {
    throw new ApiError(400, "amount must be a positive number");
  }
  if (!category) {
    throw new ApiError(400, "category is required");
  }
  const expense = await Expense.create({
    title,
    amount,
    category,
    description,
    user: req.user._id,
  });
  if (!expense) {
    throw new ApiError(500, "something went wrong while adding expense");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, expense, "Expense added successfully"));
});

const getExpense = asyncHandler(async (req, res) => {
  const expenses = await Expense.find({
    user: req.user._id,
  }).sort({
    createdAt: -1,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, expenses, "Expenses fetched successfully"));
});

const deleteExpense = asyncHandler(async (req, res) => {
    const {id} = req.params;
    if (!isValidObjectId(id)) {
        throw new ApiError(400, "Invalid expense id");
    }

    const expense = await Expense.findOneAndDelete({
        _id: id,
        user: req.user._id
    });
    if (!expense) {
        throw new ApiError(404, "Expense not found or already deleted");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, expense, "Expense deleted successfully"));   
}) 

export { addExpense, getExpense, deleteExpense };
s