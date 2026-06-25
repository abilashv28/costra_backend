const db = require("../models");
const auditlogService = require("./auditlog.service");
const userService = require("./user.service");

exports.createProject = async (data, user) => {
  const project = await db.Project.create({ ...data, user_id: user.id });
  await auditlogService.logAction(user.id, "CREATE", "Project", project.id, null, project.toJSON(), `Created project ${project.name}`);
  return project;
};

exports.updateProject = async (projectId, data, user) => {
  const companyUserIds = await userService.getCompanyUserIds(user.id, user.company_id);
  const project = await db.Project.findOne({ 
    where: { id: projectId, user_id: { [db.Sequelize.Op.in]: companyUserIds } } 
  });
  if (!project) {
    throw new Error("Project not found or unauthorized");
  }
  const oldData = project.toJSON();
  const updatedProject = await project.update(data);
  await auditlogService.logAction(userId, "UPDATE", "Project", project.id, oldData, updatedProject.toJSON(), `Updated project ${project.name}`);
  return updatedProject;
};

exports.deleteProject = async (projectId, user) => {
  const companyUserIds = await userService.getCompanyUserIds(user.id, user.company_id);
  const project = await db.Project.findOne({ 
    where: { id: projectId, user_id: { [db.Sequelize.Op.in]: companyUserIds } } 
  });
  if (!project) {
    throw new Error("Project not found or unauthorized");
  }
  const oldData = project.toJSON();
  await project.destroy();
  await auditlogService.logAction(userId, "DELETE", "Project", project.id, oldData, null, `Deleted project ${project.name}`);
  return { message: "Project deleted successfully" };
};

exports.getProjects = async (user) => {
  const companyUserIds = await userService.getCompanyUserIds(user.id, user.company_id);
  return await db.Project.findAll({ 
    where: { user_id: { [db.Sequelize.Op.in]: companyUserIds } } 
  });
};