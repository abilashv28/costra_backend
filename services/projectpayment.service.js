const db = require("../models");

exports.createProjectPayment = async (projectId, data, userId) => {
  // Verify project exists and belongs to user
  const project = await db.Project.findByPk(projectId);
  if (!project || project.user_id !== userId) {
    throw new Error("Project not found or unauthorized");
  }

  if (!data.stage_id) {
    throw new Error("stage_id is required");
  }

  const stage = await db.PaymentStage.findByPk(data.stage_id);
  if (!stage) {
    throw new Error("Payment stage not found");
  }

  return await db.ProjectPayment.create({
    ...data,
    project_id: projectId,
    stage_name: stage.name,
  });
};

exports.getProjectPayments = async (projectId, userId) => {
  // Verify project exists and belongs to user
  const project = await db.Project.findByPk(projectId);
  if (!project || project.user_id !== userId) {
    throw new Error("Project not found or unauthorized");
  }

  return await db.ProjectPayment.findAll({
    where: { project_id: projectId },
    order: [["created_at", "ASC"]],
  });
};

exports.updateProjectPayment = async (paymentId, data, userId) => {
  const payment = await db.ProjectPayment.findByPk(paymentId, {
    include: [
      {
        model: db.Project,
        attributes: ["user_id"],
      },
    ],
  });

  if (!payment) {
    throw new Error("Payment not found");
  }

  if (payment.Project.user_id !== userId) {
    throw new Error("Unauthorized");
  }

  if (data.stage_id) {
    const stage = await db.PaymentStage.findByPk(data.stage_id);
    if (!stage) {
      throw new Error("Payment stage not found");
    }
    data.stage_name = stage.name;
  }

  return await payment.update(data);
};

exports.deleteProjectPayment = async (paymentId, userId) => {
  const payment = await db.ProjectPayment.findByPk(paymentId, {
    include: [
      {
        model: db.Project,
        attributes: ["user_id"],
      },
    ],
  });

  if (!payment) {
    throw new Error("Payment not found");
  }

  if (payment.Project.user_id !== userId) {
    throw new Error("Unauthorized");
  }

  await payment.destroy();
  return { message: "Payment deleted successfully" };
};

exports.getProjectPaymentById = async (paymentId, userId) => {
  const payment = await db.ProjectPayment.findByPk(paymentId, {
    include: [
      {
        model: db.Project,
        attributes: ["user_id"],
      },
    ],
  });

  if (!payment) {
    throw new Error("Payment not found");
  }

  if (payment.Project.user_id !== userId) {
    throw new Error("Unauthorized");
  }

  return payment;
};
