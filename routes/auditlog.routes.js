const express = require("express");
const router = express.Router();
const auditlogService = require("../services/auditlog.service");
const authMiddleware = require("../middleware/auth.middleware");

// Get all audit logs (Should probably be restricted to admin only, but reusing simple auth middleware for now)
router.get("/", authMiddleware, async (req, res, next) => {
  try {
    const logs = await auditlogService.getLogs(req.query);
    res.json(logs);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
