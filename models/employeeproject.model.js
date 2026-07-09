module.exports = (sequelize, DataTypes) => {
  const EmployeeProject = sequelize.define("EmployeeProject", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    employee_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    project_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    tableName: 'employee_projects',
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  });

  return EmployeeProject;
};
