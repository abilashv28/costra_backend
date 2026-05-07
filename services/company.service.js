const db = require("../models");

exports.createCompany = async (data) => {
  return await db.Company.create({ name: data.name });
};

exports.getCompanies = async () => {
  return await db.Company.findAll({ order: [["created_at", "DESC"]] });
};
