const Sequelize = require("sequelize");
const sequelize = require("../config/db");

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Models
db.Employee = require("./employee.model")(sequelize, Sequelize);
db.Project = require("./project.model")(sequelize, Sequelize);
db.Category = require("./category.model")(sequelize, Sequelize);
db.Expense = require("./expense.model")(sequelize, Sequelize);
db.Company = require("./company.model")(sequelize, Sequelize);
db.ProjectPayment = require("./projectpayment.model")(sequelize, Sequelize);
db.PaymentStage = require("./paymentStages.model")(sequelize, Sequelize);
db.Vendor = require("./vendor.model")(sequelize, Sequelize);
db.Client = require("./client.model")(sequelize, Sequelize);
db.EmployeeSalary = require("./employeesalary.model")(sequelize, Sequelize);
db.Worker = require("./worker.model")(sequelize, Sequelize);
db.WorkerSalary = require("./workersalary.model")(sequelize, Sequelize);
db.ProjectVendor = require("./projectvendor.model")(sequelize, Sequelize);
db.EmployeeProject = require("./employeeproject.model")(sequelize, Sequelize);
db.ExpenseRequest = require("./expenserequest.model")(sequelize, Sequelize);
db.Notification = require("./notification.model")(sequelize, Sequelize);

// Associations
db.Employee.belongsTo(db.Company, { foreignKey: "company_id", as: "Company" });
db.Company.hasMany(db.Employee, { foreignKey: "company_id" });

// Self-referential creator
db.Employee.belongsTo(db.Employee, { foreignKey: "recorded_by", as: "Creator" });
db.Employee.hasMany(db.Employee, { foreignKey: "recorded_by", as: "CreatedEmployees" });

// Employee <-> Project (recorded_by)
db.Employee.hasMany(db.Project, { foreignKey: "recorded_by" });
db.Project.belongsTo(db.Employee, { foreignKey: "recorded_by", as: "Recorder" });

// Employee <-> Project (Assignments)
db.Employee.belongsToMany(db.Project, { through: db.EmployeeProject, foreignKey: "employee_id", as: "assignedProjects" });
db.Project.belongsToMany(db.Employee, { through: db.EmployeeProject, foreignKey: "project_id", as: "assignedEmployees" });

db.Employee.hasMany(db.Client, { foreignKey: "recorded_by" });
db.Client.belongsTo(db.Employee, { foreignKey: "recorded_by", as: "Recorder" });

db.Client.hasMany(db.Project, { foreignKey: "client_id", as: "projects" });
db.Project.belongsTo(db.Client, { foreignKey: "client_id", as: "Client" });

db.Employee.hasMany(db.Expense, { foreignKey: "recorded_by" });
db.Expense.belongsTo(db.Employee, { foreignKey: "recorded_by", as: "Recorder" });

db.Project.hasMany(db.Expense, { foreignKey: "project_id" });
db.Expense.belongsTo(db.Project, { foreignKey: "project_id" });

db.Category.hasMany(db.Expense, { foreignKey: "category_id" });
db.Expense.belongsTo(db.Category, { foreignKey: "category_id" });

db.Project.hasMany(db.ProjectPayment, { foreignKey: "project_id", as: "payments" });
db.ProjectPayment.belongsTo(db.Project, { foreignKey: "project_id" });

db.PaymentStage.hasMany(db.ProjectPayment, { foreignKey: "stage_id", as: "payments" });
db.ProjectPayment.belongsTo(db.PaymentStage, { foreignKey: "stage_id", as: "stage" });

db.Employee.hasMany(db.Vendor, { foreignKey: "recorded_by" });
db.Vendor.belongsTo(db.Employee, { foreignKey: "recorded_by", as: "Recorder" });

db.Project.belongsToMany(db.Vendor, { through: db.ProjectVendor, foreignKey: "project_id", as: "vendors" });
db.Vendor.belongsToMany(db.Project, { through: db.ProjectVendor, foreignKey: "vendor_id", as: "projects" });

db.Vendor.hasMany(db.Expense, { foreignKey: "vendor_id" });
db.Expense.belongsTo(db.Vendor, { foreignKey: "vendor_id" });

// Salaries recorded by an admin/employee
db.Employee.hasMany(db.EmployeeSalary, { foreignKey: "recorded_by", as: "RecordedSalaries" });
db.EmployeeSalary.belongsTo(db.Employee, { foreignKey: "recorded_by", as: "Recorder" });

// Target employee for the salary
db.Employee.hasMany(db.EmployeeSalary, { foreignKey: "employee_id", as: "salaries" });
db.EmployeeSalary.belongsTo(db.Employee, { foreignKey: "employee_id", as: "employee" });

// Workers recorded by an admin/employee
db.Employee.hasMany(db.Worker, { foreignKey: "recorded_by" });
db.Worker.belongsTo(db.Employee, { foreignKey: "recorded_by", as: "Recorder" });

// Worker Salaries recorded by an admin/employee
db.Employee.hasMany(db.WorkerSalary, { foreignKey: "recorded_by", as: "RecordedWorkerSalaries" });
db.WorkerSalary.belongsTo(db.Employee, { foreignKey: "recorded_by", as: "Recorder" });

db.Worker.hasMany(db.WorkerSalary, { foreignKey: "worker_id", as: "salaries" });
db.WorkerSalary.belongsTo(db.Worker, { foreignKey: "worker_id", as: "worker" });

// Worker salary <-> Project mapping (for expenses/daily wages)
// Optionally link WorkerSalary to Project if needed
db.Project.hasMany(db.WorkerSalary, { foreignKey: "project_id" });
db.WorkerSalary.belongsTo(db.Project, { foreignKey: "project_id" });

// ExpenseRequest associations
db.Employee.hasMany(db.ExpenseRequest, { foreignKey: "employee_id" });
db.ExpenseRequest.belongsTo(db.Employee, { foreignKey: "employee_id", as: "Employee" });

db.Project.hasMany(db.ExpenseRequest, { foreignKey: "project_id" });
db.ExpenseRequest.belongsTo(db.Project, { foreignKey: "project_id" });

db.Category.hasMany(db.ExpenseRequest, { foreignKey: "category_id" });
db.ExpenseRequest.belongsTo(db.Category, { foreignKey: "category_id" });

db.Vendor.hasMany(db.ExpenseRequest, { foreignKey: "vendor_id" });
db.ExpenseRequest.belongsTo(db.Vendor, { foreignKey: "vendor_id" });

db.Company.hasMany(db.ExpenseRequest, { foreignKey: "company_id" });
db.ExpenseRequest.belongsTo(db.Company, { foreignKey: "company_id" });

db.Employee.hasMany(db.ExpenseRequest, { foreignKey: "approved_by", as: "ApprovedRequests" });
db.ExpenseRequest.belongsTo(db.Employee, { foreignKey: "approved_by", as: "Approver" });

db.Employee.hasMany(db.ExpenseRequest, { foreignKey: "rejected_by", as: "RejectedRequests" });
db.ExpenseRequest.belongsTo(db.Employee, { foreignKey: "rejected_by", as: "Rejecter" });

// Notification associations
db.Employee.hasMany(db.Notification, { foreignKey: "employee_id" });
db.Notification.belongsTo(db.Employee, { foreignKey: "employee_id", as: "Employee" });

db.Company.hasMany(db.Notification, { foreignKey: "company_id" });
db.Notification.belongsTo(db.Company, { foreignKey: "company_id" });

module.exports = db;