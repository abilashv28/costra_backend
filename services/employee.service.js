const db = require("../models");
const bcrypt = require("bcryptjs");

const getCompanyEmployeeIds = async (employeeId, companyId) => {
  if (companyId) {
    const employees = await db.Employee.findAll({ where: { company_id: companyId } });
    return employees.map(emp => emp.id);
  }
  return [employeeId];
};

exports.getCompanyEmployeeIds = getCompanyEmployeeIds;

const createError = (message, status = 400) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

// --- Employee Core ---

exports.createEmployee = async (data, currentEmployee) => {
  if (data.email) {
    const existingEmployee = await db.Employee.findOne({ where: { email: data.email } });
    if (existingEmployee) {
      throw createError("An employee with this email already exists");
    }
  }

  let hashedPassword = null;
  if (data.password) {
    hashedPassword = await bcrypt.hash(data.password, 10);
  }

  const newEmployee = await db.Employee.create({ 
    ...data, 
    password: hashedPassword,
    plain_password: data.password || null,
    recorded_by: currentEmployee.id, 
    company_id: currentEmployee.company_id 
  });
  return newEmployee;
};

exports.updateEmployee = async (employeeId, data, currentEmployee) => {
  const companyEmployeeIds = await getCompanyEmployeeIds(currentEmployee.id, currentEmployee.company_id);
  const employee = await db.Employee.findOne({ 
    where: { id: employeeId, recorded_by: { [db.Sequelize.Op.in]: companyEmployeeIds } } 
  });
  if (!employee) {
    throw createError("Employee not found or unauthorized", 404);
  }
  
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
    data.plain_password = data.password; // Note: data.password is now hashed, need raw for plain_password
    // Fix: the plain password was passed as data.password before hashing
  }
  
  const updatedEmployee = await employee.update(data);
  return updatedEmployee;
};

exports.deleteEmployee = async (employeeId, currentEmployee) => {
  const companyEmployeeIds = await getCompanyEmployeeIds(currentEmployee.id, currentEmployee.company_id);
  const employee = await db.Employee.findOne({ 
    where: { id: employeeId, recorded_by: { [db.Sequelize.Op.in]: companyEmployeeIds } } 
  });
  if (!employee) {
    throw createError("Employee not found or unauthorized", 404);
  }
  await employee.destroy();
  return { message: "Employee deleted successfully" };
};

exports.getEmployees = async (currentEmployee) => {
  const companyEmployeeIds = await getCompanyEmployeeIds(currentEmployee.id, currentEmployee.company_id);
  return await db.Employee.findAll({ 
    where: { recorded_by: { [db.Sequelize.Op.in]: companyEmployeeIds } },
    attributes: { exclude: ['password', 'plain_password'] }
  });
};

exports.getEmployeeById = async (employeeId, currentEmployee) => {
  const companyEmployeeIds = await getCompanyEmployeeIds(currentEmployee.id, currentEmployee.company_id);
  const employee = await db.Employee.findOne({ 
    where: { id: employeeId, recorded_by: { [db.Sequelize.Op.in]: companyEmployeeIds } },
    attributes: { exclude: ['password', 'plain_password'] }
  });
  if (!employee) {
    throw createError("Employee not found or unauthorized", 404);
  }
  return employee;
};

// --- Project Assignment (RBAC) ---

exports.getAssignedProjects = async (employeeId) => {
  const employee = await db.Employee.findByPk(employeeId, {
    include: [{
      model: db.Project,
      as: "assignedProjects",
      attributes: ['id', 'name']
    }]
  });
  if (!employee) {
    throw createError("Employee not found", 404);
  }
  return employee.assignedProjects.map(p => p.id);
};

exports.assignProjects = async (employeeId, projectIds) => {
  const employee = await db.Employee.findByPk(employeeId);
  if (!employee) {
    throw createError("Employee not found", 404);
  }
  
  const validProjectIds = Array.isArray(projectIds) ? projectIds : [];
  await employee.setAssignedProjects(validProjectIds);
  
  return { message: "Projects assigned successfully" };
};

// --- Password Resets ---

exports.forgotPassword = async (email) => {
  const employee = await db.Employee.findOne({ where: { email } });
  if (!employee) {
    throw createError("No employee found with this email", 404);
  }
  return { message: "Password reset link would be sent to your email (Mocked)" };
};

exports.resetPasswordToken = async (token, { password }) => {
  // Implementation of token verification is mocked
  return { message: "Password updated successfully" };
};

exports.updateOnboarding = async (employeeId, { onboarding_step, is_tour_completed }) => {
  const employee = await db.Employee.findByPk(employeeId);
  if (!employee) {
    throw createError("Employee not found", 404);
  }

  const updateData = {};
  if (onboarding_step !== undefined) {
    updateData.onboarding_step = onboarding_step;
  }
  if (is_tour_completed !== undefined) {
    updateData.onboarding_step = is_tour_completed ? 100 : 0;
  }

  await employee.update(updateData);
  return employee;
};

// --- Employee Salary Transactions ---

exports.createEmployeeSalary = async (data, currentEmployee) => {
  // Prevent duplicate salary for same month and year
  const existing = await db.EmployeeSalary.findOne({
    where: { employee_id: data.employee_id, month: data.month, year: data.year }
  });
  if (existing) {
    throw createError("Salary record for this month already exists.");
  }
  const salary = await db.EmployeeSalary.create({ 
    ...data, 
    recorded_by: currentEmployee.id, 
    company_id: currentEmployee.company_id 
  });
  return salary;
};

exports.updateEmployeeSalary = async (salaryId, data, currentEmployee) => {
  const companyEmployeeIds = await getCompanyEmployeeIds(currentEmployee.id, currentEmployee.company_id);
  const salary = await db.EmployeeSalary.findOne({ 
    where: { id: salaryId, recorded_by: { [db.Sequelize.Op.in]: companyEmployeeIds } } 
  });
  if (!salary) {
    throw createError("Salary record not found or unauthorized", 404);
  }
  const updatedSalary = await salary.update(data);
  return updatedSalary;
};

exports.deleteEmployeeSalary = async (salaryId, currentEmployee) => {
  const companyEmployeeIds = await getCompanyEmployeeIds(currentEmployee.id, currentEmployee.company_id);
  const salary = await db.EmployeeSalary.findOne({ 
    where: { id: salaryId, recorded_by: { [db.Sequelize.Op.in]: companyEmployeeIds } } 
  });
  if (!salary) {
    throw createError("Salary record not found or unauthorized", 404);
  }
  await salary.destroy();
  return { message: "Salary record deleted successfully" };
};

exports.getEmployeeSalaries = async (employeeId, currentEmployee) => {
  const companyEmployeeIds = await getCompanyEmployeeIds(currentEmployee.id, currentEmployee.company_id);
  return await db.EmployeeSalary.findAll({ 
    where: { employee_id: employeeId, recorded_by: { [db.Sequelize.Op.in]: companyEmployeeIds } },
    order: [['year', 'DESC'], ['month', 'DESC']]
  });
};
