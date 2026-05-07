const express = require("express");
const router = express.Router();
const expenseService = require("../services/expense.service");
const authMiddleware = require("../middleware/auth.middleware");

router.post("/", authMiddleware, async (req, res, next) => {
  try {
    const expense = await expenseService.createExpense(req.body, req.user.id);
    res.json(expense);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", authMiddleware, async (req, res, next) => {
  try {
    const expense = await expenseService.updateExpense(req.params.id, req.body, req.user.id);
    res.json(expense);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", authMiddleware, async (req, res, next) => {
  try {
    const result = await expenseService.deleteExpense(req.params.id, req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get("/", authMiddleware, async (req, res, next) => {
  try {
    const expenses = await expenseService.getExpenses(req.query, req.user.id);
    res.json(expenses);
  } catch (err) {
    next(err);
  }
});

module.exports = router;