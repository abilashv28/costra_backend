module.exports = (sequelize, DataTypes) => {
  return sequelize.define("ExpenseRequest", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    company_id: { type: DataTypes.INTEGER, allowNull: true },
    employee_id: { type: DataTypes.INTEGER, allowNull: false },
    project_id: { type: DataTypes.INTEGER, allowNull: false },
    category_id: { type: DataTypes.INTEGER, allowNull: false },
    vendor_id: { type: DataTypes.INTEGER, allowNull: true },
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
    
    // Approval Flow Fields
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending',
      allowNull: false,
    },
    approved_by: { type: DataTypes.INTEGER, allowNull: true },
    approved_at: { type: DataTypes.DATE, allowNull: true },
    rejected_by: { type: DataTypes.INTEGER, allowNull: true },
    rejected_at: { type: DataTypes.DATE, allowNull: true },
    rejection_reason: { type: DataTypes.TEXT, allowNull: true },
  }, {
    tableName: "expense_requests",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  });
};
