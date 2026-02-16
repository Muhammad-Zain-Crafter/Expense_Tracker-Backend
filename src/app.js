import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express()

app.use(express.json({
    limit: "100mb"
}));
app.use(express.urlencoded({ extended: true }));

app.use(cors({
   
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(cookieParser()); // for parsing cookies

app.get('/', (req, res) => {
    res.send('Welcome to the Expense Tracker API');
})

import userRouter from './routes/user.route.js';
import expenseRouter from './routes/expense.route.js';
import budgetRouter from './routes/budget.route.js';
import incomeRouter from './routes/income.route.js';
import dashboardRouter from './routes/dashboard.route.js';

app.use('/api/v1/expense-tracker/users', userRouter) // User routes
app.use('/api/v1/expense-tracker/expenses', expenseRouter) // Expense routes
app.use('/api/v1/expense-tracker/budgets', budgetRouter) // Budget routes
app.use('/api/v1/expense-tracker/incomes', incomeRouter) // Income routes
app.use('/api/v1/expense-tracker/dashboard', dashboardRouter) // Dashboard routes

export default app