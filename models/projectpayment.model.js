module.exports = (sequelize, DataTypes) => {
  return sequelize.define("ProjectPayment", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    project_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "projects",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    stage_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "payment_stages",
        key: "id",
      },
      onDelete: "RESTRICT",
    },
    stage_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    expected_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: {
        min: 0.01,
      },
    },
    payment_mode: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: {
          args: [["cash", "check", "online", "credit"]],
          msg: "Payment mode must be one of: cash, check, online, credit"
        }
      }
    },
    payment_date: {
      type: DataTypes.DATEONLY,
      defaultValue: DataTypes.NOW,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: "project_payments",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  });
};
