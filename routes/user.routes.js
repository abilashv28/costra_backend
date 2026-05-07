const express = require("express");
const router = express.Router();
const userService = require("../services/user.service");
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");

// Password reset routes (no auth required)
router.post("/set-password", async (req, res, next) => {
  try {
    const { token, name, password } = req.body;
    const result = await userService.setPassword(token, { name, password });
    res.json({ message: "Password set successfully", user: result });
  } catch (err) {
    next(err);
  }
});

router.post("/validate-token", async (req, res, next) => {
  try {
    const { token } = req.body;
    let user;
    try {
      // Try to validate as invitation token (for new users)
      user = await userService.validatePasswordResetToken(token);
    } catch (err) {
      // If that fails, try to validate as password reset token (for existing users)
      user = await userService.validatePasswordResetTokenForExistingUser(token);
    }
    res.json({ valid: true, email: user.email });
  } catch (err) {
    next(err);
  }
});

// All other user routes require authentication and admin/super admin role
router.use(authMiddleware);
router.use(roleMiddleware(["admin", "super admin"]));

router.get("/", async (req, res, next) => {
  try {
    const result = await userService.getUsers(req.user);
    res.json({ success: true, message: "Users retrieved successfully", data: result });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const result = await userService.getUserById(req.params.id);
    res.json({ success: true, message: "User retrieved successfully", data: result });
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const result = await userService.createUser(req.body, req.user);
    res.status(201).json({ success: true, message: "User created successfully", data: result });
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const result = await userService.updateUser(req.params.id, req.body);
    res.json({ success: true, message: "User updated successfully", data: result });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const result = await userService.deleteUser(req.params.id);
    res.json({ success: true, message: "User deleted successfully", data: result });
  } catch (err) {
    next(err);
  }
});

module.exports = router;