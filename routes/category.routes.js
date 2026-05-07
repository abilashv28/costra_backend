const express = require('express');
const categoryService = require('../services/category.service');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// GET all categories
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const categories = await categoryService.getCategories();
    res.json({ data: categories });
  } catch (error) {
    next(error);
  }
});

// POST create category
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const category = await categoryService.createCategory(req.body);
    res.json(category);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
