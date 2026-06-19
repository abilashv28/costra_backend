const db = require("../models");
const auditlogService = require("./auditlog.service");

exports.createClient = async (data, userId) => {
  const client = await db.Client.create({ ...data, user_id: userId });
  await auditlogService.logAction(userId, "CREATE", "Client", client.id, null, client.toJSON(), `Created client ${client.name}`);
  return client;
};

exports.updateClient = async (clientId, data, userId) => {
  const client = await db.Client.findByPk(clientId);
  if (!client || client.user_id !== userId) {
    throw new Error("Client not found or unauthorized");
  }
  const oldData = client.toJSON();
  const updatedClient = await client.update(data);
  await auditlogService.logAction(userId, "UPDATE", "Client", client.id, oldData, updatedClient.toJSON(), `Updated client ${client.name}`);
  return updatedClient;
};

exports.deleteClient = async (clientId, userId) => {
  const client = await db.Client.findByPk(clientId);
  if (!client || client.user_id !== userId) {
    throw new Error("Client not found or unauthorized");
  }
  
  // Check if any projects use this client before deleting
  const projectsCount = await db.Project.count({ where: { client_id: clientId } });
  if (projectsCount > 0) {
    throw new Error(`Cannot delete client: used in ${projectsCount} project(s)`);
  }

  const oldData = client.toJSON();
  await client.destroy();
  await auditlogService.logAction(userId, "DELETE", "Client", client.id, oldData, null, `Deleted client ${client.name}`);
  return { message: "Client deleted successfully" };
};

exports.getClients = async (userId) => {
  return await db.Client.findAll({ where: { user_id: userId } });
};
