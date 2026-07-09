const express = require("express");
const router = express.Router();
const authService = require("../services/auth.service");
const employeeService = require("../services/employee.service");
const authMiddleware = require("../middleware/auth.middleware");

router.post("/signup", async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post("/forgot-password", async (req, res, next) => {
  try {
    const result = await employeeService.forgotPassword(req.body.email);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post("/reset-password", async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const result = await employeeService.resetPasswordToken(token, { password });
    res.json({ message: "Password reset successfully", employee: result });
  } catch (err) {
    next(err);
  }
});

router.get("/me", authMiddleware, async (req, res, next) => {
  try {
    const result = await authService.getEmployeeDetails(req.employee.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Assuming onboarding steps apply to employees as well
router.put("/onboarding", authMiddleware, async (req, res, next) => {
  try {
    const result = await employeeService.updateOnboarding(req.employee.id, req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.put("/update-onboarding-step", authMiddleware, async (req, res, next) => {
  try {
    const result = await employeeService.updateOnboarding(req.employee.id, req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
