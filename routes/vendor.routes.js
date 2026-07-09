const express = require("express");
const router = express.Router();
const vendorService = require("../services/vendor.service");
const authMiddleware = require("../middleware/auth.middleware");

router.post("/", authMiddleware, async (req, res, next) => {
  try {
    const vendor = await vendorService.createVendor(req.body, req.employee);
    res.json(vendor);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", authMiddleware, async (req, res, next) => {
  try {
    const vendor = await vendorService.updateVendor(req.params.id, req.body, req.employee);
    res.json(vendor);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", authMiddleware, async (req, res, next) => {
  try {
    const result = await vendorService.deleteVendor(req.params.id, req.employee);
    res.json(result);
  } catch (err) {
    if (err.message.includes("Cannot delete")) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next(err);
  }
});

router.get("/", authMiddleware, async (req, res, next) => {
  try {
    const { location, service_type } = req.query;
    const vendors = await vendorService.getVendors(req.employee, location, service_type);
    res.json(vendors);
  } catch (err) {
    next(err);
  }
});

router.post("/:id/assign-project", authMiddleware, async (req, res, next) => {
  try {
    const { project_id, notes } = req.body;
    const result = await vendorService.assignToProject(req.params.id, project_id, notes, req.employee);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get("/project/:projectId", authMiddleware, async (req, res, next) => {
  try {
    const vendors = await vendorService.getProjectVendors(req.params.projectId, req.employee);
    res.json(vendors);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
