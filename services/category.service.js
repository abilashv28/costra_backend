const db = require("../models");

exports.getCategories = async () => {
  return await db.Category.findAll({
    order: [["name", "ASC"]]
  });
};

exports.createCategory = async (data) => {
  return await db.Category.create(data);
};
