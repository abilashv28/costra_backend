module.exports = (sequelize, DataTypes) => {
  return sequelize.define("PaymentStage", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
  }, {
    tableName: "payment_stages",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  });
};