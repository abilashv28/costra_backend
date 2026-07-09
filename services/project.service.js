const db = require("../models");
const employeeService = require("./employee.service");

exports.createProject = async (data, employee) => {
  const project = await db.Project.create({ ...data, recorded_by: employee.id });
  return project;
};

exports.updateProject = async (projectId, data, employee) => {
  const companyEmployeeIds = await employeeService.getCompanyEmployeeIds(employee.id, employee.company_id);
  
  let whereClause = { id: projectId, recorded_by: { [db.Sequelize.Op.in]: companyEmployeeIds } };
  
  if (employee.role !== 'admin' && employee.role !== 'superadmin') {
    const employeeProjects = await db.EmployeeProject.findAll({ where: { employee_id: employee.id } });
    const projectIds = employeeProjects.map(up => up.project_id);
    if (!projectIds.includes(parseInt(projectId))) {
      throw new Error("Project not found or unauthorized");
    }
  }

  const project = await db.Project.findOne({ where: whereClause });
  if (!project) {
    throw new Error("Project not found or unauthorized");
  }
  const updatedProject = await project.update(data);
  return updatedProject;
};

exports.deleteProject = async (projectId, employee) => {
  const companyEmployeeIds = await employeeService.getCompanyEmployeeIds(employee.id, employee.company_id);
  
  if (employee.role !== 'admin' && employee.role !== 'superadmin') {
    throw new Error("Unauthorized to delete project");
  }

  const project = await db.Project.findOne({ 
    where: { id: projectId, recorded_by: { [db.Sequelize.Op.in]: companyEmployeeIds } } 
  });
  if (!project) {
    throw new Error("Project not found or unauthorized");
  }
  await project.destroy();
  return { message: "Project deleted successfully" };
};

exports.getProjects = async (employee) => {
  const companyEmployeeIds = await employeeService.getCompanyEmployeeIds(employee.id, employee.company_id);
  
  if (employee.role === 'admin' || employee.role === 'superadmin') {
    return await db.Project.findAll({ 
      where: { recorded_by: { [db.Sequelize.Op.in]: companyEmployeeIds } } 
    });
  }

  const employeeProjects = await db.EmployeeProject.findAll({
    where: { employee_id: employee.id }
  });
  const projectIds = employeeProjects.map(up => up.project_id);

  return await db.Project.findAll({ 
    where: { 
      id: { [db.Sequelize.Op.in]: projectIds },
      recorded_by: { [db.Sequelize.Op.in]: companyEmployeeIds } 
    } 
  });
};
