import { isValidObjectId } from "mongoose";
import { Income } from "../models/income.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const addIncome = asyncHandler(async (req, res) => {
  const { amount, date, source, description } = req.body;

  if (!amount || !date || !source) {
    throw new ApiError(400, "amount, date and source are required");
  }

  if (isNaN(amount) || amount <= 0) {
    throw new ApiError(400, "amount must be a positive number");
  }

  const income = await Income.create({
    user: req.user._id,
    amount,
    date,
    source,
    description,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, income, "Income added successfully"));
});

const getIncomes = asyncHandler(async (req, res) => {
  const incomes = await Income.find({
    user: req.user._id,
  }).sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, incomes, "Incomes fetched successfully"));
});

const updateIncome = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { amount, date, source, description } = req.body;

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid income id");
  }

  if (amount && (isNaN(amount) || amount <= 0)) {
    throw new ApiError(400, "amount must be a positive number");
  }

  const income = await Income.findOneAndUpdate(
    { _id: id, user: req.user._id },
    {
      $set: {
        amount,
        date,
        source,
        description,
      },
    },
    { new: true }
  );

  if (!income) {
    throw new ApiError(404, "Income not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, income, "Income updated successfully"));
});

const deleteIncome = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid income id");
  }

  const income = await Income.findOneAndDelete({
    _id: id,
    user: req.user._id,
  });

  if (!income) {
    throw new ApiError(404, "Income not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, income, "Income deleted successfully"));
});

export { addIncome, getIncomes, updateIncome, deleteIncome };
