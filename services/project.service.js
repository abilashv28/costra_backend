const db = require("../models");

exports.createProject = async (data, userId) => {
  return await db.Project.create({ ...data, user_id: userId });
};

exports.updateProject = async (projectId, data, userId) => {
  const project = await db.Project.findByPk(projectId);
  if (!project || project.user_id !== userId) {
    throw new Error("Project not found or unauthorized");
  }
  return await project.update(data);
};

exports.deleteProject = async (projectId, userId) => {
  const project = await db.Project.findByPk(projectId);
  if (!project || project.user_id !== userId) {
    throw new Error("Project not found or unauthorized");
  }
  await project.destroy();
  return { message: "Project deleted successfully" };
};

exports.getProjects = async (userId) => {
  return await db.Project.findAll({ where: { user_id: userId } });
};