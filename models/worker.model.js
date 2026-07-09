module.exports = (sequelize, DataTypes) => {
  const Worker = sequelize.define("Worker", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
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
    tableName: 'workers',
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  });

  return Worker;
};
