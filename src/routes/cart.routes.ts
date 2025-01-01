import express from 'express';
import cartController from '../controllers/cart.controller.js';
import { authorize } from '../middlewares/authorization.middleware.js';

const router = express.Router();
/* Router.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.path}`);
  next();
}); */
// Oreder routes from specific ones to genegral ones otherwise you may get route conflict
router.post('/cart/similar/', authorize, cartController.getSimilarBooks);
router.post(
  '/cart/:bookId([0-9a-fA-F]{24})',
  authorize,
  cartController.addToCart,
);
router.get('/cart/', authorize, cartController.getCart);
router.post('/cart/', authorize, cartController.updateCart);
router.delete('/cart/:id', authorize, cartController.removeFromCart);

export default router;
