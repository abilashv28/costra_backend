const db = require("../models");
const { Op } = require("sequelize");

exports.createExpense = async (data, userId) => {
  return await db.Expense.create({ ...data, user_id: userId });
};

exports.updateExpense = async (expenseId, data, userId) => {
  const expense = await db.Expense.findByPk(expenseId);
  if (!expense || expense.user_id !== userId) {
    throw new Error("Expense not found or unauthorized");
  }
  return await expense.update(data);
};

exports.deleteExpense = async (expenseId, userId) => {
  const expense = await db.Expense.findByPk(expenseId);
  if (!expense || expense.user_id !== userId) {
    throw new Error("Expense not found or unauthorized");
  }
  await expense.destroy();
  return { message: "Expense deleted successfully" };
};

exports.getExpenses = async (filters = {}, userId) => {
  const where = { user_id: userId };

  if (filters.projectId) {
    where.project_id = filters.projectId;
  }

  if (filters.categoryId) {
    where.category_id = filters.categoryId;
  }

  if (filters.startDate && filters.endDate) {
    where.expense_date = {
      [Op.between]: [filters.startDate, filters.endDate],
    };
  }

  return await db.Expense.findAll({
    where,
    include: [
      { model: db.Project, attributes: ["name"] },
      { model: db.Category, attributes: ["name"] },
    ],
  });
};