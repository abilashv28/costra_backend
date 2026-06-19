const db = require("../models");
const auditlogService = require("./auditlog.service");

exports.createProject = async (data, userId) => {
  const project = await db.Project.create({ ...data, user_id: userId });
  await auditlogService.logAction(userId, "CREATE", "Project", project.id, null, project.toJSON(), `Created project ${project.name}`);
  return project;
};

exports.updateProject = async (projectId, data, userId) => {
  const project = await db.Project.findByPk(projectId);
  if (!project || project.user_id !== userId) {
    throw new Error("Project not found or unauthorized");
  }
  const oldData = project.toJSON();
  const updatedProject = await project.update(data);
  await auditlogService.logAction(userId, "UPDATE", "Project", project.id, oldData, updatedProject.toJSON(), `Updated project ${project.name}`);
  return updatedProject;
};

exports.deleteProject = async (projectId, userId) => {
  const project = await db.Project.findByPk(projectId);
  if (!project || project.user_id !== userId) {
    throw new Error("Project not found or unauthorized");
  }
  const oldData = project.toJSON();
  await project.destroy();
  await auditlogService.logAction(userId, "DELETE", "Project", project.id, oldData, null, `Deleted project ${project.name}`);
  return { message: "Project deleted successfully" };
};

exports.getProjects = async (userId) => {
  return await db.Project.findAll({ where: { user_id: userId } });
};