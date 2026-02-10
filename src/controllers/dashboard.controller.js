import { Expense } from "../models/expense.model.js";
import { Income } from "../models/income.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const monthlySummary = asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  const m = Number(month);
  const y = Number(year);

  if (isNaN(m) || isNaN(y) || m < 1 || m > 12) {
    throw new ApiError(400, "Invalid month or year");
  }

  const matchCondition = {
    user: req.user._id,
    $expr: {
      // Compare fields with expressions
      $and: [
        { $eq: [{ $month: "$date" }, Number(month)] }, // extracts month number from the date field.
        { $eq: [{ $year: "$date" }, Number(year)] }, // extracts year number from the date field.
      ],
    },
  };
  const totalExpense = await Expense.aggregate([
    { $match: matchCondition },
    { $group: { _id: null, total: { $sum: "$amount" } } }, // _id: null → single total for all matched documents
  ]);
  const totalIncome = await Income.aggregate([
    { $match: matchCondition },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const expense = totalExpense[0]?.total || 0;
  const income = totalIncome[0]?.total || 0;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        month: m,
        year: y,
        income,
        expense,
        savings: income - expense,
      },
      "Monthly summary fetched",
    ),
  );
});

export { monthlySummary };
