const db = require("../models");
const { Op } = require("sequelize");
const auditlogService = require("./auditlog.service");

exports.createExpense = async (data, userId) => {
  const payload = { ...data, user_id: userId };
  if (payload.gst_applicable) {
    const percent = parseFloat(payload.gst_percent) || 0;
    const amt = parseFloat(payload.amount) || 0;
    payload.gst_amount = parseFloat(((amt * percent) / 100).toFixed(2));
  } else {
    payload.gst_amount = null;
    payload.gst_percent = payload.gst_percent ? payload.gst_percent : null;
  }
  const expense = await db.Expense.create(payload);
  await auditlogService.logAction(userId, "CREATE", "Expense", expense.id, null, expense.toJSON(), `Created expense for project ${expense.project_id}`);
  return expense;
};

exports.updateExpense = async (expenseId, data, userId) => {
  const expense = await db.Expense.findByPk(expenseId);
  if (!expense || expense.user_id !== userId) {
    throw new Error("Expense not found or unauthorized");
  }
  // Recalculate GST if applicable
  if (data.gst_applicable !== undefined) {
    if (data.gst_applicable) {
      const percent = parseFloat(data.gst_percent) || 0;
      const amt = parseFloat(data.amount !== undefined ? data.amount : expense.amount) || 0;
      data.gst_amount = parseFloat(((amt * percent) / 100).toFixed(2));
    } else {
      data.gst_amount = null;
      data.gst_percent = data.gst_percent ? data.gst_percent : null;
    }
  }

  const oldData = expense.toJSON();
  const updatedExpense = await expense.update(data);
  await auditlogService.logAction(userId, "UPDATE", "Expense", expense.id, oldData, updatedExpense.toJSON(), `Updated expense for project ${expense.project_id}`);
  return updatedExpense;
};

exports.deleteExpense = async (expenseId, userId) => {
  const expense = await db.Expense.findByPk(expenseId);
  if (!expense || expense.user_id !== userId) {
    throw new Error("Expense not found or unauthorized");
  }
  const oldData = expense.toJSON();
  await expense.destroy();
  await auditlogService.logAction(userId, "DELETE", "Expense", expense.id, oldData, null, `Deleted expense for project ${expense.project_id}`);
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