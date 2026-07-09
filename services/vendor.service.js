const db = require("../models");

const employeeService = require("./employee.service");

exports.createVendor = async (data, employee) => {
  return await db.Vendor.create({
    ...data,
    recorded_by: employee.id,
  });
};

exports.updateVendor = async (vendorId, data, employee) => {
  const companyEmployeeIds = await employeeService.getCompanyEmployeeIds(employee.id, employee.company_id);
  const vendor = await db.Vendor.findOne({ where: { id: vendorId, recorded_by: { [db.Sequelize.Op.in]: companyEmployeeIds } } });
  if (!vendor) throw new Error("Vendor not found");

  await vendor.update(data);
  return vendor;
};

exports.deleteVendor = async (vendorId, employee) => {
  const companyEmployeeIds = await employeeService.getCompanyEmployeeIds(employee.id, employee.company_id);
  const vendor = await db.Vendor.findOne({ where: { id: vendorId, recorded_by: { [db.Sequelize.Op.in]: companyEmployeeIds } } });
  if (!vendor) throw new Error("Vendor not found");

  // Optional: Check if associated with projects/expenses before deletion
  const projectsCount = await vendor.countProjects();
  const expensesCount = await db.Expense.count({ where: { vendor_id: vendorId } });

  if (projectsCount > 0 || expensesCount > 0) {
    throw new Error("Cannot delete vendor: associated with projects or expenses");
  }

  await vendor.destroy();
  return { message: "Vendor deleted successfully" };
};

exports.getVendors = async (employee, search) => {
  const companyEmployeeIds = await employeeService.getCompanyEmployeeIds(employee.id, employee.company_id);
  const where = { recorded_by: { [db.Sequelize.Op.in]: companyEmployeeIds } };
  if (search) {
    where[db.Sequelize.Op.or] = [
      { name: { [db.Sequelize.Op.iLike]: `%${search}%` } },
      { location: { [db.Sequelize.Op.iLike]: `%${search}%` } },
      { city: { [db.Sequelize.Op.iLike]: `%${search}%` } },
      { area: { [db.Sequelize.Op.iLike]: `%${search}%` } },
      { service_type: { [db.Sequelize.Op.iLike]: `%${search}%` } }
    ];
  }
  
  return await db.Vendor.findAll({ 
    where,
    order: [['created_at', 'DESC']]
  });
};

exports.assignToProject = async (vendorId, projectId, notes, employee) => {
  const companyEmployeeIds = await employeeService.getCompanyEmployeeIds(employee.id, employee.company_id);
  // Verify ownership
  const vendor = await db.Vendor.findOne({ where: { id: vendorId, recorded_by: { [db.Sequelize.Op.in]: companyEmployeeIds } } });
  if (!vendor) throw new Error("Vendor not found");
  
  const project = await db.Project.findOne({ where: { id: projectId, recorded_by: { [db.Sequelize.Op.in]: companyEmployeeIds } } });
  if (!project) throw new Error("Project not found");

  await db.ProjectVendor.create({
    project_id: projectId,
    vendor_id: vendorId,
    notes: notes || null
  });

  return { message: "Vendor assigned to project successfully" };
};

exports.getProjectVendors = async (projectId, employee) => {
  const companyEmployeeIds = await employeeService.getCompanyEmployeeIds(employee.id, employee.company_id);
  const project = await db.Project.findOne({ 
    where: { id: projectId, recorded_by: { [db.Sequelize.Op.in]: companyEmployeeIds } },
    include: [{
      model: db.Vendor,
      as: 'vendors',
      through: { attributes: ['notes'] } // include the notes from junction table
    }]
  });
  if (!project) throw new Error("Project not found");
  
  return project.vendors;
};
