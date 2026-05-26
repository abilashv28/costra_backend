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

  // Calculate GST amount server-side if applicable
  const payload = {
    ...data,
    project_id: projectId,
    stage_name: stage.name,
  };

  if (payload.gst_applicable) {
    const percent = parseFloat(payload.gst_percent) || 0;
    const amt = parseFloat(payload.amount) || 0;
    payload.gst_amount = parseFloat(((amt * percent) / 100).toFixed(2));
  } else {
    payload.gst_amount = null;
    payload.gst_percent = payload.gst_percent ? payload.gst_percent : null;
  }

  return await db.ProjectPayment.create(payload);
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

  // Recalculate GST if applicable
  if (data.gst_applicable !== undefined) {
    if (data.gst_applicable) {
      const percent = parseFloat(data.gst_percent) || 0;
      const amt = parseFloat(data.amount !== undefined ? data.amount : payment.amount) || 0;
      data.gst_amount = parseFloat(((amt * percent) / 100).toFixed(2));
    } else {
      data.gst_amount = null;
      data.gst_percent = data.gst_percent ? data.gst_percent : null;
    }
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
