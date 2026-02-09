import mongoose, { Schema } from "mongoose";

const budgetSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      enum: ["Food", "Transport", "Rent", "Shopping", "Bills", "Other"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    month: {
      type: Number, // 1–12
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

// There can be ONLY ONE budget for a specific category in a specific month & year:
budgetSchema.index({ user: 1, category: 1, month: 1, year: 1 }, { unique: true });

export const Budget = mongoose.model("Budget", budgetSchema);
