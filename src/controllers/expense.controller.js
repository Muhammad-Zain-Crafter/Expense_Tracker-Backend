import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Expense } from "../models/expense.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { isValidObjectId } from "mongoose";
import { Budget } from "../models/budget.model.js";

const addExpense = asyncHandler(async (req, res) => {
  const { title, amount, date, category, description } = req.body;
  if (!title) {
    throw new ApiError(400, "title is required");
  }
  if (!amount) {
    throw new ApiError(400, "amount is required");
  }
  if (!date) {
    throw new ApiError(400, "date is required");
  }
  if (amount <= 0 || isNaN(amount)) {
    throw new ApiError(400, "amount must be a positive number");
  }
  if (!category) {
    throw new ApiError(400, "category is required");
  }

  const expenseMonth = new Date(date).getMonth() + 1; // getMonth() returns 0-11, we add 1 to make it 1-12
  const expenseYear = new Date(date).getFullYear();

  const budget = await Budget.findOne({
    user: req.user._id,
    category,
    month: expenseMonth,
    year: expenseYear,
  });
  if (budget) {
    const totalExpense = await Expense.aggregate([
      {
        $match: {
          user: req.user._id,
          category,
          $expr: {
            $and: [
              { $eq: [{ $month: "$date" }, expenseMonth] },
              { $eq: [{ $year: "$date" }, expenseYear] },
            ],
          },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const spent = totalExpense[0]?.total || 0;
    if (spent + amount > budget.limit) {
      throw new ApiError(
        400,
        `Budget exceeded for ${category}. Limit: ${budget.limit}`,
      );
    }
  }

  const expense = await Expense.create({
    title,
    amount,
    date,
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
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid expense id");
  }

  const expense = await Expense.findOneAndDelete({
    _id: id,
    user: req.user._id,
  });
  if (!expense) {
    throw new ApiError(404, "Expense not found or already deleted");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, expense, "Expense deleted successfully"));
});

const updateExpense = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid expense id");
  }
  const { title, amount, date, category, description } = req.body;
  if (amount && (amount <= 0 || isNaN(amount))) {
    throw new ApiError(400, "amount must be a positive number");
  }
  const updateExpense = await Expense.findOneAndUpdate(
    { _id: id, user: req.user._id },
    {
      $set: {
        title: title,
        amount: amount,
        date: date,
        category: category,
        description: description,
      },
    },
    { new: true },
  );
  if (!updateExpense) {
    throw new ApiError(404, "Expense not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, updateExpense, "Expense updated successfully"));
});

export { addExpense, getExpense, updateExpense, deleteExpense };
