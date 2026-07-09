module.exports = (sequelize, DataTypes) => {
  const WorkerSalary = sequelize.define("WorkerSalary", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    worker_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    payment_type: {
      type: DataTypes.ENUM('Daily', 'Monthly'),
      allowNull: false,
      defaultValue: 'Daily',
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    base_wage: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    overtime_hours: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
    },
    overtime_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    paid: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    remaining: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM('Paid', 'Partial', 'Unpaid'),
      defaultValue: 'Unpaid',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    company_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    recorded_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    tableName: 'worker_salaries',
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  });

  return WorkerSalary;
};
