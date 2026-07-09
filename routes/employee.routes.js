const express = require("express");
const router = express.Router();
const employeeService = require("../services/employee.service");
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");

// Get all employees (Admin/Superadmin only)
router.get("/", authMiddleware, roleMiddleware(["superadmin", "super admin", "admin"]), async (req, res, next) => {
  try {
    const employees = await employeeService.getEmployees(req.employee);
    res.json({ success: true, data: employees });
  } catch (err) {
    next(err);
  }
});

// Create new employee
router.post("/", authMiddleware, roleMiddleware(["superadmin", "super admin", "admin"]), async (req, res, next) => {
  try {
    const employee = await employeeService.createEmployee(req.body, req.employee);
    res.status(201).json({ success: true, data: employee, message: "Employee created successfully" });
  } catch (err) {
    next(err);
  }
});

// Update employee
router.put("/:id", authMiddleware, roleMiddleware(["superadmin", "super admin", "admin"]), async (req, res, next) => {
  try {
    const employee = await employeeService.updateEmployee(req.params.id, req.body, req.employee);
    res.json({ success: true, data: employee, message: "Employee updated successfully" });
  } catch (err) {
    next(err);
  }
});

// Delete employee
router.delete("/:id", authMiddleware, roleMiddleware(["superadmin", "super admin", "admin"]), async (req, res, next) => {
  try {
    const result = await employeeService.deleteEmployee(req.params.id, req.employee);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
});

// Assign projects to employee
router.post("/:id/assign-projects", authMiddleware, roleMiddleware(["superadmin", "super admin", "admin"]), async (req, res, next) => {
  try {
    const { projectIds } = req.body;
    const result = await employeeService.assignProjects(req.params.id, projectIds);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
});

// Get projects assigned to employee
router.get("/:id/assigned-projects", authMiddleware, roleMiddleware(["superadmin", "super admin", "admin"]), async (req, res, next) => {
  try {
    const projectIds = await employeeService.getAssignedProjects(req.params.id);
    res.json({ success: true, data: projectIds });
  } catch (err) {
    next(err);
  }
});

// --- Employee Salary Routes ---

// Get salaries for an employee
router.get("/:id/salaries", authMiddleware, roleMiddleware(["superadmin", "super admin", "admin"]), async (req, res, next) => {
  try {
    const salaries = await employeeService.getEmployeeSalaries(req.params.id, req.employee);
    res.json({ success: true, data: salaries });
  } catch (err) {
    next(err);
  }
});

// Create salary record
router.post("/salaries", authMiddleware, roleMiddleware(["superadmin", "super admin", "admin"]), async (req, res, next) => {
  try {
    const salary = await employeeService.createEmployeeSalary(req.body, req.employee);
    res.status(201).json({ success: true, data: salary, message: "Salary record created" });
  } catch (err) {
    next(err);
  }
});

// Update salary record
router.put("/salaries/:id", authMiddleware, roleMiddleware(["superadmin", "super admin", "admin"]), async (req, res, next) => {
  try {
    const salary = await employeeService.updateEmployeeSalary(req.params.id, req.body, req.employee);
    res.json({ success: true, data: salary, message: "Salary record updated" });
  } catch (err) {
    next(err);
  }
});

// Delete salary record
router.delete("/salaries/:id", authMiddleware, roleMiddleware(["superadmin", "super admin", "admin"]), async (req, res, next) => {
  try {
    const result = await employeeService.deleteEmployeeSalary(req.params.id, req.employee);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
