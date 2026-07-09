const express = require("express");
const { createRequest, getRequests, approveRequest, rejectRequest } = require("../controllers/expenserequest.controller");
const protect = require("../middleware/auth.middleware");

const router = express.Router();

router.use(protect); // Secure all routes

router.post("/", createRequest);
router.get("/", getRequests);
router.put("/:id/approve", approveRequest);
router.put("/:id/reject", rejectRequest);

module.exports = router;
