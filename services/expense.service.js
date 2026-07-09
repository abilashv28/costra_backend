const db = require("../models");
const { Op } = require("sequelize");
const employeeService = require("./employee.service");

exports.createExpense = async (data, employee) => {
  const payload = { ...data, recorded_by: employee.id };
  if (payload.gst_applicable) {
    const percent = parseFloat(payload.gst_percent) || 0;
    const amt = parseFloat(payload.amount) || 0;
    payload.gst_amount = parseFloat(((amt * percent) / 100).toFixed(2));
  } else {
    payload.gst_amount = null;
    payload.gst_percent = payload.gst_percent ? payload.gst_percent : null;
  }
  const expense = await db.Expense.create(payload);
  return expense;
};

exports.updateExpense = async (expenseId, data, employee) => {
  const companyEmployeeIds = await employeeService.getCompanyEmployeeIds(employee.id, employee.company_id);
  const expense = await db.Expense.findOne({
    where: { id: expenseId, recorded_by: { [Op.in]: companyEmployeeIds } }
  });
  if (!expense) {
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
  return updatedExpense;
};

exports.deleteExpense = async (expenseId, employee) => {
  const companyEmployeeIds = await employeeService.getCompanyEmployeeIds(employee.id, employee.company_id);
  const expense = await db.Expense.findOne({
    where: { id: expenseId, recorded_by: { [Op.in]: companyEmployeeIds } }
  });
  if (!expense) {
    throw new Error("Expense not found or unauthorized");
  }
  const oldData = expense.toJSON();
  await expense.destroy();
  return { message: "Expense deleted successfully" };
};

exports.getExpenses = async (filters = {}, employee) => {
  const companyEmployeeIds = await employeeService.getCompanyEmployeeIds(employee.id, employee.company_id);
  const where = { recorded_by: { [Op.in]: companyEmployeeIds } };

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
      { model: db.Vendor, attributes: ["name"] }
    ],
  });
};
