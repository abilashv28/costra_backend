module.exports = (sequelize, DataTypes) => {
  return sequelize.define("ProjectVendor", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    project_id: { type: DataTypes.INTEGER, allowNull: false },
    vendor_id: { type: DataTypes.INTEGER, allowNull: false },
    notes: DataTypes.TEXT,
  }, {
    tableName: "project_vendors",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  });
};
