module.exports = (sequelize, DataTypes) => {
  return sequelize.define("AuditLog", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: true }, // allow null for system actions
    action: { type: DataTypes.STRING, allowNull: false }, // CREATE, UPDATE, DELETE
    entity_type: { type: DataTypes.STRING, allowNull: false }, // Project, Expense, Client, User, etc.
    entity_id: { type: DataTypes.INTEGER, allowNull: false },
    old_data: { type: DataTypes.JSON, allowNull: true },
    new_data: { type: DataTypes.JSON, allowNull: true },
    description: { type: DataTypes.STRING, allowNull: true },
  }, {
    tableName: "audit_logs",
    timestamps: true,
    updatedAt: false,
    createdAt: "created_at",
  });
};
