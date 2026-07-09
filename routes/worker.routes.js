const express = require("express");
const router = express.Router();
const workerService = require("../services/worker.service");
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");

router.use(authMiddleware);

// Worker Master Routes
router.get("/", async (req, res, next) => {
  try {
    const result = await workerService.getWorkers(req.employee);
    res.json({ success: true, message: "Workers retrieved successfully", data: result });
  } catch (err) {
    next(err);
  }
});

router.post("/", roleMiddleware(["admin", "super admin"]), async (req, res, next) => {
  try {
    const result = await workerService.createWorker(req.body, req.employee);
    res.status(201).json({ success: true, message: "Worker created successfully", data: result });
  } catch (err) {
    next(err);
  }
});

router.put("/:id", roleMiddleware(["admin", "super admin"]), async (req, res, next) => {
  try {
    const result = await workerService.updateWorker(req.params.id, req.body, req.employee);
    res.json({ success: true, message: "Worker updated successfully", data: result });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", roleMiddleware(["admin", "super admin"]), async (req, res, next) => {
  try {
    const result = await workerService.deleteWorker(req.params.id, req.employee);
    res.json({ success: true, message: "Worker deleted successfully", data: result });
  } catch (err) {
    next(err);
  }
});

// Worker Salary Routes
router.get("/:workerId/salaries", async (req, res, next) => {
  try {
    const result = await workerService.getWorkerSalaries(req.params.workerId, req.employee);
    res.json({ success: true, message: "Salaries retrieved successfully", data: result });
  } catch (err) {
    next(err);
  }
});

router.post("/salaries", roleMiddleware(["admin", "super admin"]), async (req, res, next) => {
  try {
    const result = await workerService.createWorkerSalary(req.body, req.employee);
    res.status(201).json({ success: true, message: "Salary created successfully", data: result });
  } catch (err) {
    next(err);
  }
});

router.put("/salaries/:id", roleMiddleware(["admin", "super admin"]), async (req, res, next) => {
  try {
    const result = await workerService.updateWorkerSalary(req.params.id, req.body, req.employee);
    res.json({ success: true, message: "Salary updated successfully", data: result });
  } catch (err) {
    next(err);
  }
});

router.delete("/salaries/:id", roleMiddleware(["admin", "super admin"]), async (req, res, next) => {
  try {
    const result = await workerService.deleteWorkerSalary(req.params.id, req.employee);
    res.json({ success: true, message: "Salary deleted successfully", data: result });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
