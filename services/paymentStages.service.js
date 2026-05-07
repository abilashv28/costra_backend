const db = require("../models");

exports.createPaymentStage = async (data) => {
  return await db.PaymentStage.create(data);
};

exports.getPaymentStages = async () => {
  return await db.PaymentStage.findAll({ order: [["created_at", "DESC"]] });
};