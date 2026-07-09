const db = require("../models");

exports.getNotifications = async (employee) => {
  return db.Notification.findAll({
    where: {
      company_id: employee.company_id,
      employee_id: employee.id,
    },
    order: [['created_at', 'DESC']]
  });
};

exports.markAsRead = async (id, employee) => {
  const notification = await db.Notification.findOne({
    where: {
      id,
      employee_id: employee.id,
    }
  });

  if (!notification) throw new Error("Notification not found");

  await notification.update({ is_read: true });
  return notification;
};

exports.markAllAsRead = async (employee) => {
  await db.Notification.update(
    { is_read: true },
    { 
      where: {
        employee_id: employee.id,
        is_read: false,
      } 
    }
  );
  return { success: true };
};
