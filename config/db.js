const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "postgres",
    logging: false,

      // Make SSL optional via DB_SSL env var. Default: true for remote DB, false for local.
      dialectOptions: process.env.DB_SSL === "false" ? {} : {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
  }
);

module.exports = sequelize;