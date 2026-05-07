const express = require("express");
const router = express.Router();
const paymentStagesService = require("../services/paymentStages.service");
const authMiddleware = require("../middleware/auth.middleware");
const requireRole = require("../middleware/role.middleware");

router.post(
  "/",
  authMiddleware,
  requireRole(["admin", "super admin"]),
  async (req, res, next) => {
    try {
      const stage = await paymentStagesService.createPaymentStage(req.body);
      res.json(stage);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/",
  authMiddleware,
  requireRole(["admin", "super admin"]),
  async (req, res, next) => {
    try {
      const stages = await paymentStagesService.getPaymentStages();
      res.json(stages);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;