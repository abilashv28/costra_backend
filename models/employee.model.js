module.exports = (sequelize, DataTypes) => {
  const Employee = sequelize.define("Employee", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    plain_password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM("superadmin", "super admin", "admin", "user"),
      defaultValue: "user",
    },
    employee_id_string: { // Auto generated ID e.g. av001138678
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    department: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    designation: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    base_salary: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    company_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // Only superadmin can have null
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    recorded_by: { // Self-referential creator
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  }, {
    tableName: 'employees',
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    hooks: {
      beforeCreate: (employee) => {
        if (!employee.employee_id_string && employee.name) {
          const names = employee.name.trim().split(" ");
          let initials = "";
          if (names.length >= 2) {
            initials = names[0].charAt(0) + names[names.length - 1].charAt(0);
          } else {
            initials = names[0].substring(0, 2);
          }
          const randomNum = Math.floor(10000000 + Math.random() * 90000000);
          employee.employee_id_string = (initials + randomNum).toLowerCase();
        }
      }
    }
  });

  return Employee;
};
