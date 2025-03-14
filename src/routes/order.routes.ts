import express from 'express';
import orderController from '../controllers/order.controller.js';

const router = express.Router();

// Create an order
router.post('/orders', orderController.createOrder);

export default router;
