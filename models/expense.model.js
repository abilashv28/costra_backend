module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Expense", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    project_id: { type: DataTypes.INTEGER, allowNull: false },
    category_id: { type: DataTypes.INTEGER, allowNull: false },
    amount: DataTypes.FLOAT,
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