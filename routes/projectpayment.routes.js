const express = require("express");
const router = express.Router({ mergeParams: true });
const projectPaymentService = require("../services/projectpayment.service");
const authMiddleware = require("../middleware/auth.middleware");
const requireRole = require("../middleware/role.middleware");

// Create a new project payment
router.post(
  "/",
  authMiddleware,
  requireRole(["admin", "super admin"]),
  async (req, res, next) => {
  try {
    const projectId = req.params.projectId;
    const payment = await projectPaymentService.createProjectPayment(
      projectId,
      req.body,
      req.employee
    );
    res.status(201).json(payment);
  } catch (err) {
    next(err);
  }
});

// Get all payments for a project
router.get(
  "/",
  authMiddleware,
  requireRole(["admin", "super admin"]),
  async (req, res, next) => {
    try {
      const projectId = req.params.projectId;
      const payments = await projectPaymentService.getProjectPayments(
        projectId,
        req.employee
      );
      res.json(payments);
    } catch (err) {
      next(err);
    }
  }
);

// Get a specific payment
router.get(
  "/:id",
  authMiddleware,
  requireRole(["admin", "super admin"]),
  async (req, res, next) => {
  try {
    const payment = await projectPaymentService.getProjectPaymentById(
      req.params.id,
      req.employee
    );
    res.json(payment);
  } catch (err) {
    next(err);
  }
});

// Update a payment
router.put(
  "/:id",
  authMiddleware,
  requireRole(["admin", "super admin"]),
  async (req, res, next) => {
    try {
      const payment = await projectPaymentService.updateProjectPayment(
        req.params.id,
        req.body,
        req.employee
      );
      res.json(payment);
    } catch (err) {
      next(err);
    }
  }
);

// Delete a payment
router.delete(
  "/:id",
  authMiddleware,
  requireRole(["admin", "super admin"]),
  async (req, res, next) => {
  try {
    const result = await projectPaymentService.deleteProjectPayment(
      req.params.id,
      req.employee
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
