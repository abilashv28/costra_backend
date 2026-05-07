const express = require("express");
const router = express.Router();
const authService = require("../services/auth.service");
const userService = require("../services/user.service");
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
    const result = await userService.forgotPassword(req.body.email);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post("/reset-password", async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const result = await userService.resetPasswordToken(token, { password });
    res.json({ message: "Password reset successfully", user: result });
  } catch (err) {
    next(err);
  }
});

router.get("/me", authMiddleware, async (req, res, next) => {
  try {
    const result = await authService.getUserDetails(req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get("/users", authMiddleware, async (req, res, next) => {
  try {
    const result = await authService.getAllUsers();
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.put("/onboarding", authMiddleware, async (req, res, next) => {
  try {
    const result = await authService.updateOnboarding(req.user.id, req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.put("/update-onboarding-step", authMiddleware, async (req, res, next) => {
  try {
    const result = await authService.updateOnboarding(req.user.id, req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
