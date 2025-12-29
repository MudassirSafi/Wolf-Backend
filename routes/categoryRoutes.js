// backend/routes/categoryRoutes.js
import express from 'express';
import { CATEGORY_HIERARCHY, getCategoryOptions } from '../constants/categories.js';

const router = express.Router();

// Get all categories
router.get('/', (req, res) => {
  res.json({
    success: true,
    categories: CATEGORY_HIERARCHY,
    flatList: getCategoryOptions()
  });
});

export default router;