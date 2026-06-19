module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Client", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    contact_person: DataTypes.STRING,
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    gst_number: DataTypes.STRING,
    address: DataTypes.TEXT,
    user_id: { type: DataTypes.INTEGER, allowNull: false },
  }, {
    tableName: "clients",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  });
};
