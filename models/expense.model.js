module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Expense", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    project_id: { type: DataTypes.INTEGER, allowNull: false },
    category_id: { type: DataTypes.INTEGER, allowNull: false },
    amount: DataTypes.FLOAT,
    gst_applicable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    gst_percent: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    gst_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },
    expense_date: DataTypes.DATE,
    notes: DataTypes.TEXT,
    file_url: { type: DataTypes.TEXT, allowNull: true },
  }, {
    tableName: "expenses",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  });
};