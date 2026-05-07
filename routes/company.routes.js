const express = require("express");
const router = express.Router();
const companyService = require("../services/company.service");

router.post("/", async (req, res, next) => {
  try {
    const company = await companyService.createCompany(req.body);
    res.status(201).json(company);
  } catch (err) {
    next(err);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const companies = await companyService.getCompanies();
    res.json(companies);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
