const Sequelize = require("sequelize");
const sequelize = require("../config/db");

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Models
db.User = require("./user.model")(sequelize, Sequelize);
db.Project = require("./project.model")(sequelize, Sequelize);
db.Category = require("./category.model")(sequelize, Sequelize);
db.Expense = require("./expense.model")(sequelize, Sequelize);
db.Company = require("./company.model")(sequelize, Sequelize);
db.ProjectPayment = require("./projectpayment.model")(sequelize, Sequelize);
db.PaymentStage = require("./paymentStages.model")(sequelize, Sequelize);
db.Client = require("./client.model")(sequelize, Sequelize);
db.AuditLog = require("./auditlog.model")(sequelize, Sequelize);

// Associations
db.User.belongsTo(db.Company, { foreignKey: "company_id", as: "Company" });
db.Company.hasMany(db.User, { foreignKey: "company_id" });

db.User.belongsTo(db.User, { foreignKey: "created_by", as: "Creator" });
db.User.hasMany(db.User, { foreignKey: "created_by" });

db.User.hasMany(db.Project, { foreignKey: "user_id" });
db.Project.belongsTo(db.User, { foreignKey: "user_id" });

db.User.hasMany(db.Client, { foreignKey: "user_id" });
db.Client.belongsTo(db.User, { foreignKey: "user_id" });

db.Client.hasMany(db.Project, { foreignKey: "client_id", as: "projects" });
db.Project.belongsTo(db.Client, { foreignKey: "client_id", as: "Client" });

db.User.hasMany(db.Expense, { foreignKey: "user_id" });
db.Expense.belongsTo(db.User, { foreignKey: "user_id" });

db.Project.hasMany(db.Expense, { foreignKey: "project_id" });
db.Expense.belongsTo(db.Project, { foreignKey: "project_id" });

db.Category.hasMany(db.Expense, { foreignKey: "category_id" });
db.Expense.belongsTo(db.Category, { foreignKey: "category_id" });

db.Project.hasMany(db.ProjectPayment, { foreignKey: "project_id", as: "payments" });
db.ProjectPayment.belongsTo(db.Project, { foreignKey: "project_id" });

db.PaymentStage.hasMany(db.ProjectPayment, { foreignKey: "stage_id", as: "payments" });
db.ProjectPayment.belongsTo(db.PaymentStage, { foreignKey: "stage_id", as: "stage" });

db.User.hasMany(db.AuditLog, { foreignKey: "user_id" });
db.AuditLog.belongsTo(db.User, { foreignKey: "user_id" });

module.exports = db;