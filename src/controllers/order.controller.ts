// Create an order

import { Request, Response } from 'express';
import {
  Order,
  OrderItem,
  orderValidationSchema,
} from '../models/order.model.js';
import _ from 'lodash';
import { User } from '../models/user.model.js';
import { Cart } from '../models/cart.model.js';

export async function createOrder(req: Request, res: Response) {
  const { order } = req.body;

  // Find the user
  const user = await User.findOne({ _id: order.customerId });
  if (!user) return res.status(400).send({ message: 'user not found!' });

  // Validate order before creating it
  const { error } = orderValidationSchema.validate(order);
  if (error)
    return res.status(400).send({ message: `${error.details[0].message}` });

  // Get cart items from user's cart
  const cart = await Cart.findOne({ user: user?._id });
  if (!cart) return res.status(400).send({ message: 'cart not found!' });

  // Calculate the total amount of cart
  let sum = cart?.cartItems.reduce((total, item) => {
    return total + item.price;
  }, 0);
  order.totalAmount = sum;

  cart.cartItems = cart.cartItems.filter(
    (cartItem) =>
      !order.orderItems.some(
        (orderItem: OrderItem) =>
          orderItem.bookId.toString() === cartItem.book._id.toString(),
      ),
  );
  await cart.save();
  // Create order in the database
  const newOrder = new Order(
    _.pick(order, [
      'name',
      'email',
      'country',
      'city',
      'phone',
      'address',
      'status',
      'orderItems',
      'totalAmount',
      'paymentMethod',
      'deliveryMethod',
    ]),
  );

  const createdOrder = await newOrder.save();
  res.status(200).send(createdOrder);
}

export default { createOrder };
