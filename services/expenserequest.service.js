const db = require("../models");

exports.createRequest = async (data, employee) => {
  // Create the request
  const request = await db.ExpenseRequest.create({
    ...data,
    employee_id: employee.id,
    company_id: employee.company_id,
    status: 'pending',
  });

  // Notify Admins
  const admins = await db.Employee.findAll({
    where: {
      company_id: employee.company_id,
      role: ['admin', 'superadmin', 'super admin']
    }
  });

  const notifications = admins.map(admin => ({
    company_id: employee.company_id,
    employee_id: admin.id,
    type: "expense_request",
    title: "New Expense Request",
    message: `${employee.name} submitted a new expense request for ${data.amount}.`,
    reference_type: "ExpenseRequest",
    reference_id: request.id,
  }));

  if (notifications.length > 0) {
    await db.Notification.bulkCreate(notifications);
  }

  return request;
};

exports.getRequests = async (employee) => {
  const isAdmin = ['admin', 'superadmin', 'super admin'].includes(employee.role?.toLowerCase());

  let whereClause = { company_id: employee.company_id };

  if (!isAdmin) {
    whereClause.employee_id = employee.id; // Employees only see their own
  } else {
    // Admins can see all. Maybe filter by status in the controller, but here we just return all for this company.
  }

  return db.ExpenseRequest.findAll({
    where: whereClause,
    include: [
      { model: db.Project, attributes: ['id', 'name'] },
      { model: db.Category, attributes: ['id', 'name'] },
      { model: db.Vendor, attributes: ['id', 'name'] },
      { model: db.Employee, as: 'Employee', attributes: ['id', 'name'] },
      { model: db.Employee, as: 'Approver', attributes: ['id', 'name'] },
      { model: db.Employee, as: 'Rejecter', attributes: ['id', 'name'] },
    ],
    order: [['created_at', 'DESC']]
  });
};

exports.approveRequest = async (id, admin) => {
  const request = await db.ExpenseRequest.findByPk(id);
  if (!request) throw new Error("Request not found");
  if (request.status !== 'pending') throw new Error("Request is not pending");

  const result = await db.sequelize.transaction(async (t) => {
    // Mark approved
    await request.update({
      status: 'approved',
      approved_by: admin.id,
      approved_at: new Date(),
    }, { transaction: t });

    // Insert into actual expenses table
    const expense = await db.Expense.create({
      recorded_by: admin.id, // Or request.employee_id? The rule: "Only Admin approved". We can keep recorded_by as the admin, or the employee. Let's use employee_id to keep ownership, but wait: old logic used logged-in user. Let's use request.employee_id.
      project_id: request.project_id,
      category_id: request.category_id,
      amount: request.amount,
      gst_applicable: request.gst_applicable,
      gst_percent: request.gst_percent,
      gst_amount: request.gst_amount,
      expense_date: request.expense_date,
      notes: request.notes,
      file_url: request.file_url,
      vendor_id: request.vendor_id,
    }, { transaction: t });

    // Notify employee
    await db.Notification.create({
      company_id: request.company_id,
      employee_id: request.employee_id,
      type: "expense_approved",
      title: "Expense Request Approved",
      message: `Your expense request for ${request.amount} has been approved.`,
      reference_type: "ExpenseRequest",
      reference_id: request.id,
    }, { transaction: t });

    return { request, expense };
  });

  return result;
};

exports.rejectRequest = async (id, rejectionReason, admin) => {
  if (!rejectionReason) throw new Error("Rejection reason is required");

  const request = await db.ExpenseRequest.findByPk(id);
  if (!request) throw new Error("Request not found");
  if (request.status !== 'pending') throw new Error("Request is not pending");

  await request.update({
    status: 'rejected',
    rejected_by: admin.id,
    rejected_at: new Date(),
    rejection_reason: rejectionReason,
  });

  // Notify employee
  await db.Notification.create({
    company_id: request.company_id,
    employee_id: request.employee_id,
    type: "expense_rejected",
    title: "Expense Request Rejected",
    message: `Your expense request for ${request.amount} was rejected. Reason: ${rejectionReason}`,
    reference_type: "ExpenseRequest",
    reference_id: request.id,
  });

  return request;
};
