module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Vendor", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    contact_person: DataTypes.STRING,
    phone: DataTypes.STRING,
    email: DataTypes.STRING,
    country: DataTypes.STRING,
    state: DataTypes.STRING,
    city: DataTypes.STRING,
    area: DataTypes.STRING,
    location: DataTypes.STRING, // Kept for backwards compatibility
    latitude: DataTypes.FLOAT,
    longitude: DataTypes.FLOAT,
    service_type: DataTypes.STRING, // e.g., Plumber, Electrician
    gst_number: DataTypes.STRING,
    address: DataTypes.TEXT,
    user_id: { type: DataTypes.INTEGER, allowNull: false },
  }, {
    tableName: "vendors",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  });
};
