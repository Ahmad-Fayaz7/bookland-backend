import express from 'express';
import categoryController from '../controllers/category.controller.js';
import { authorize } from '../middlewares/authorization.middleware.js';

const router = express.Router();

// Get all categories
router.get('/categories', categoryController.getCategories);

// Create a new category
router.post('/categories', authorize, categoryController.createCategory);

export default router;
