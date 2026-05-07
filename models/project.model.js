module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Project", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: DataTypes.STRING,
    client_name: DataTypes.STRING,
    budget: DataTypes.FLOAT,
    location: DataTypes.TEXT,
    projecttype: {
      type: DataTypes.ENUM('interior', 'building_construction'),
      allowNull: false,
      defaultValue: 'interior'
    },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
  }, {
    tableName: "projects",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  });
};