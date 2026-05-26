module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    name: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true, // Allow null for users who haven't set password yet
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "user",
    },
    company_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    onboarding_step: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    is_tour_completed: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.getDataValue('onboarding_step') >= 100;
      },
      set(value) {
        if (value) {
          this.setDataValue('onboarding_step', 100);
        }
      },
    },
    password_reset_token: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    password_reset_expires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true, // New users are active by default. Invitation-only users override this to false.
    },
  }, {
    tableName: 'users',
    timestamps: true,
    underscored: false
  });

  return User;
};