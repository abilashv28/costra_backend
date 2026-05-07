module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Company", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
  }, {
    tableName: "companies",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  });
};
