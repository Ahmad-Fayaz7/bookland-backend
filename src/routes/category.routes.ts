import express from 'express';
import categoryController from '../controllers/category.controller.js';

const router = express.Router();

router.get('/categories', categoryController.getCategories);
router.post(
  '/categories',

  categoryController.createCategory,
);

export default router;
