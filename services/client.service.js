const db = require("../models");
const employeeService = require("./employee.service");

exports.createClient = async (data, employee) => {
  const client = await db.Client.create({ ...data, recorded_by: employee.id });
  return client;
};

exports.updateClient = async (clientId, data, employee) => {
  const companyEmployeeIds = await employeeService.getCompanyEmployeeIds(employee.id, employee.company_id);
  const client = await db.Client.findOne({ 
    where: { id: clientId, recorded_by: { [db.Sequelize.Op.in]: companyEmployeeIds } } 
  });
  if (!client) {
    throw new Error("Client not found or unauthorized");
  }
  const oldData = client.toJSON();
  const updatedClient = await client.update(data);
  return updatedClient;
};

exports.deleteClient = async (clientId, employee) => {
  const companyEmployeeIds = await employeeService.getCompanyEmployeeIds(employee.id, employee.company_id);
  const client = await db.Client.findOne({ 
    where: { id: clientId, recorded_by: { [db.Sequelize.Op.in]: companyEmployeeIds } } 
  });
  if (!client) {
    throw new Error("Client not found or unauthorized");
  }
  
  // Check if any projects use this client before deleting
  const projectsCount = await db.Project.count({ where: { client_id: clientId } });
  if (projectsCount > 0) {
    throw new Error(`Cannot delete client: used in ${projectsCount} project(s)`);
  }

  const oldData = client.toJSON();
  await client.destroy();
  return { message: "Client deleted successfully" };
};

exports.getClients = async (employee) => {
  const companyEmployeeIds = await employeeService.getCompanyEmployeeIds(employee.id, employee.company_id);
  return await db.Client.findAll({ 
    where: { recorded_by: { [db.Sequelize.Op.in]: companyEmployeeIds } } 
  });
};
