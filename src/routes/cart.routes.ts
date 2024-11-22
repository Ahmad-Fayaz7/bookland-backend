import express from 'express';
import cartController from '../controllers/cart.controller.js';
import { authorize } from '../middlewares/authorization.middleware.js';

const router = express.Router();

router.post('/cart/:bookId', authorize, cartController.addToCart);

export default router;
