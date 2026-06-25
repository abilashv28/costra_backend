const express = require("express");
const router = express.Router();
const clientService = require("../services/client.service");
const authMiddleware = require("../middleware/auth.middleware");

router.post("/", authMiddleware, async (req, res, next) => {
  try {
    const client = await clientService.createClient(req.body, req.user);
    res.json(client);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", authMiddleware, async (req, res, next) => {
  try {
    const client = await clientService.updateClient(req.params.id, req.body, req.user);
    res.json(client);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", authMiddleware, async (req, res, next) => {
  try {
    const result = await clientService.deleteClient(req.params.id, req.user);
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
    const clients = await clientService.getClients(req.user);
    res.json(clients);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
