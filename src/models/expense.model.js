import mongoose, { Schema } from 'mongoose';

const expenseSchema = new Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxLength: 60
    },
    amount: {
        type: Number,
        required: true,  
        default: 0,
    },
    date: {
        type: Date,
        required: true,
        trim: true
    },
     category: {
        type: String,
        required: true,
        enum: ["Food", "Transport", "Rent", "Shopping", "Bills", "Other"],
        trim: true,
    }, 
    description: {
        type: String,
        trim: true
    }

}, {timestamps: true});

const Expense = mongoose.model('Expense', expenseSchema);

export default Expense;