const jwt = require("jsonwebtoken");
const db = require("../models");

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization required" });
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET || "secret-key";
    const payload = jwt.verify(token, secret);
    const employee = await db.Employee.findByPk(payload.id);

    if (!employee) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.employee = employee;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};
