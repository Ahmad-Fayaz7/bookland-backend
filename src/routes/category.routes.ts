import express from 'express';
import categoryController from '../controllers/category.controller.js';
import { authorize } from '../middlewares/authorization.middleware.js';

const router = express.Router();

router.get('/categories', categoryController.getCategories);
router.post('/categories', authorize, categoryController.createCategory);

export default router;
