module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Notification", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    company_id: { type: DataTypes.INTEGER, allowNull: true },
    employee_id: { type: DataTypes.INTEGER, allowNull: false },
    type: { 
      type: DataTypes.STRING, 
      allowNull: false 
      // e.g. "expense_request", "expense_approved", "expense_rejected"
    },
    title: { type: DataTypes.STRING, allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    reference_type: { type: DataTypes.STRING, allowNull: true }, // e.g. "ExpenseRequest"
    reference_id: { type: DataTypes.INTEGER, allowNull: true },
    is_read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    }
  }, {
    tableName: "notifications",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  });
};
