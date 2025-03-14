import express from 'express';
import cartController from '../controllers/cart.controller.js';
import { authorize } from '../middlewares/authorization.middleware.js';

const router = express.Router();

router.post('/cart/similar/', authorize, cartController.getSimilarBooks);
router.post(
  '/cart/:bookId([0-9a-fA-F]{24})',
  authorize,
  cartController.addToCart,
);
router.get('/cart/', authorize, cartController.getCart);

// UPDATES AN ITEM INSIDE CART
router.put('/cart/', authorize, cartController.updateCart);

// REMOVES ITEMS FROM CART, NOT CART
router.delete('/cart/:id', authorize, cartController.removeFromCart);

export default router;
