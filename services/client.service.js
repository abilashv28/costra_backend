const db = require("../models");
const auditlogService = require("./auditlog.service");
const userService = require("./user.service");

exports.createClient = async (data, user) => {
  const client = await db.Client.create({ ...data, user_id: user.id });
  await auditlogService.logAction(user.id, "CREATE", "Client", client.id, null, client.toJSON(), `Created client ${client.name}`);
  return client;
};

exports.updateClient = async (clientId, data, user) => {
  const companyUserIds = await userService.getCompanyUserIds(user.id, user.company_id);
  const client = await db.Client.findOne({ 
    where: { id: clientId, user_id: { [db.Sequelize.Op.in]: companyUserIds } } 
  });
  if (!client) {
    throw new Error("Client not found or unauthorized");
  }
  const oldData = client.toJSON();
  const updatedClient = await client.update(data);
  await auditlogService.logAction(user.id, "UPDATE", "Client", client.id, oldData, updatedClient.toJSON(), `Updated client ${client.name}`);
  return updatedClient;
};

exports.deleteClient = async (clientId, user) => {
  const companyUserIds = await userService.getCompanyUserIds(user.id, user.company_id);
  const client = await db.Client.findOne({ 
    where: { id: clientId, user_id: { [db.Sequelize.Op.in]: companyUserIds } } 
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
  await auditlogService.logAction(user.id, "DELETE", "Client", client.id, oldData, null, `Deleted client ${client.name}`);
  return { message: "Client deleted successfully" };
};

exports.getClients = async (user) => {
  const companyUserIds = await userService.getCompanyUserIds(user.id, user.company_id);
  return await db.Client.findAll({ 
    where: { user_id: { [db.Sequelize.Op.in]: companyUserIds } } 
  });
};
