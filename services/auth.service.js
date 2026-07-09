const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../models");

const signToken = employee => {
  const secret = process.env.JWT_SECRET || "secret-key";
  return jwt.sign(
    { id: employee.id, email: employee.email, role: employee.role },
    secret,
    {
      expiresIn: "7d",
    }
  );
};

const sanitizeEmployee = employee => ({
  id: employee.id,
  employee_id_string: employee.employee_id_string,
  name: employee.name,
  email: employee.email,
  role: employee.role,
  department: employee.department,
  designation: employee.designation,
  base_salary: employee.base_salary,
  company_id: employee.company_id,
  recorded_by: employee.recorded_by,
  plain_password: employee.plain_password,
});

const createError = (message, status = 400) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

exports.register = async ({ name, email, password, company_name, company_id, role }) => {
  if (!name || !email || !password) {
    throw createError("Name, email, and password are required");
  }

  const existingEmployee = await db.Employee.findOne({ where: { email } });
  if (existingEmployee) {
    throw createError("An employee with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await db.sequelize.transaction(async (transaction) => {
    let employee = await db.Employee.create(
      {
        name,
        email,
        password: hashedPassword,
        plain_password: password,
        role: role || "user",
        company_id: company_id || null,
        base_salary: 0,
      },
      { transaction }
    );

    let company = null;
    if (company_name && company_name.trim()) {
      company = await db.Company.create(
        { name: company_name.trim() },
        { transaction }
      );
      employee = await employee.update(
        { company_id: company.id },
        { transaction }
      );
    } else if (company_id) {
      const existingCompany = await db.Company.findByPk(company_id, { transaction });
      if (!existingCompany) {
        throw createError("Company not found");
      }
    }

    employee = await employee.update(
      { recorded_by: employee.id },
      { transaction }
    );

    return { employee, company };
  });

  const { employee, company } = result;

  return {
    success: true,
    message: "Registration successful",
    employee: sanitizeEmployee(employee),
    token: signToken(employee),
    company: company
      ? {
          id: company.id,
          name: company.name,
          created_at: company.created_at,
        }
      : undefined,
  };
};

exports.login = async ({ email, password }) => {
  if (!email || !password) {
    throw createError("Email and password are required");
  }

  const employee = await db.Employee.findOne({ where: { email } });
  if (!employee) {
    throw createError("Invalid email or password");
  }

  if (employee.role === "user" && !employee.is_active) {
    throw createError("Account not activated. Please check with your admin.");
  }

  const passwordMatches = await bcrypt.compare(password, employee.password);
  if (!passwordMatches) {
    throw createError("Invalid email or password");
  }

  const sanitizedEmployee = sanitizeEmployee(employee);

  return {
    success: true,
    message: "Login successful",
    employee: sanitizedEmployee,
    token: signToken(employee)
  };
};

exports.getEmployeeDetails = async (employeeId) => {
  const employee = await db.Employee.findByPk(employeeId);
  if (!employee) {
    throw createError("Employee not found", 404);
  }

  return {
    success: true,
    message: "Employee details retrieved successfully",
    employee: sanitizeEmployee(employee)
  };
};

exports.getAllEmployees = async () => {
  const employees = await db.Employee.findAll();
  return {
    success: true,
    message: "Employees retrieved successfully",
    employees: employees.map(sanitizeEmployee)
  };
};
