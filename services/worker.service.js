const db = require("../models");
const employeeService = require("./employee.service");

exports.createWorker = async (data, employee) => {
  const worker = await db.Worker.create({ ...data, recorded_by: employee.id, company_id: employee.company_id });
  return worker;
};

exports.updateWorker = async (workerId, data, employee) => {
  const companyEmployeeIds = await employeeService.getCompanyEmployeeIds(employee.id, employee.company_id);
  const worker = await db.Worker.findOne({ 
    where: { id: workerId, recorded_by: { [db.Sequelize.Op.in]: companyEmployeeIds } } 
  });
  if (!worker) {
    throw new Error("Worker not found or unauthorized");
  }
  const updatedWorker = await worker.update(data);
  return updatedWorker;
};

exports.deleteWorker = async (workerId, employee) => {
  const companyEmployeeIds = await employeeService.getCompanyEmployeeIds(employee.id, employee.company_id);
  const worker = await db.Worker.findOne({ 
    where: { id: workerId, recorded_by: { [db.Sequelize.Op.in]: companyEmployeeIds } } 
  });
  if (!worker) {
    throw new Error("Worker not found or unauthorized");
  }
  await worker.destroy();
  return { message: "Worker deleted successfully" };
};

exports.getWorkers = async (employee) => {
  const companyEmployeeIds = await employeeService.getCompanyEmployeeIds(employee.id, employee.company_id);
  return await db.Worker.findAll({ 
    where: { recorded_by: { [db.Sequelize.Op.in]: companyEmployeeIds } } 
  });
};

// Worker Salary Transactions
exports.createWorkerSalary = async (data, employee) => {
  const salary = await db.WorkerSalary.create({ ...data, recorded_by: employee.id, company_id: employee.company_id });
  return salary;
};

exports.updateWorkerSalary = async (salaryId, data, employee) => {
  const companyEmployeeIds = await employeeService.getCompanyEmployeeIds(employee.id, employee.company_id);
  const salary = await db.WorkerSalary.findOne({ 
    where: { id: salaryId, recorded_by: { [db.Sequelize.Op.in]: companyEmployeeIds } } 
  });
  if (!salary) {
    throw new Error("Salary record not found or unauthorized");
  }
  const updatedSalary = await salary.update(data);
  return updatedSalary;
};

exports.deleteWorkerSalary = async (salaryId, employee) => {
  const companyEmployeeIds = await employeeService.getCompanyEmployeeIds(employee.id, employee.company_id);
  const salary = await db.WorkerSalary.findOne({ 
    where: { id: salaryId, recorded_by: { [db.Sequelize.Op.in]: companyEmployeeIds } } 
  });
  if (!salary) {
    throw new Error("Salary record not found or unauthorized");
  }
  await salary.destroy();
  return { message: "Salary record deleted successfully" };
};

exports.getWorkerSalaries = async (workerId, employee) => {
  const companyEmployeeIds = await employeeService.getCompanyEmployeeIds(employee.id, employee.company_id);
  return await db.WorkerSalary.findAll({ 
    where: { worker_id: workerId, recorded_by: { [db.Sequelize.Op.in]: companyEmployeeIds } },
    order: [['date', 'DESC']]
  });
};
