const db = require("../models");

exports.logAction = async (userId, action, entityType, entityId, oldData = null, newData = null, description = null) => {
  try {
    await db.AuditLog.create({
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      old_data: oldData,
      new_data: newData,
      description,
    });
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
};

exports.getLogs = async (filters = {}) => {
  const whereClause = {};
  if (filters.user_id) whereClause.user_id = filters.user_id;
  if (filters.entity_type) whereClause.entity_type = filters.entity_type;
  if (filters.action) whereClause.action = filters.action;

  return await db.AuditLog.findAll({
    where: whereClause,
    include: [{ model: db.User, attributes: ["id", "username", "email"] }],
    order: [["created_at", "DESC"]],
    limit: 1000 // Limit to 1000 logs to prevent memory issues
  });
};
