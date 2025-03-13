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
import { Book } from '../models/book.model.js';

export async function createOrder(req: Request, res: Response) {
  try {
    const { order } = req.body;

    // Validate order before creating it
    const { error } = orderValidationSchema.validate(order);
    if (error)
      return res.status(400).send({ message: `${error.details[0].message}` });

    // Find the user
    const user = await User.findOne({ _id: order.customerId });
    if (!user) return res.status(400).send({ message: 'User not found!' });

    // Get cart items
    const cart = await Cart.findOne({ user: user._id });
    if (!cart) return res.status(400).send({ message: 'Cart not found!' });

    // Bulk fetch books instead of individual queries
    const bookIds = cart.cartItems.map((item) => item.book);
    const books = await Book.find({ _id: { $in: bookIds } });
    let originalCartItemsLength = cart.cartItems.length;
    // Remove out-of-stock items
    cart.cartItems = cart.cartItems.filter((cartItem) => {
      const book = books.find(
        (b: any) => b._id.toString() === cartItem.book.toString(),
      );
      return book && cartItem.quantity <= book.stock;
    });

    await cart.save();

    if (cart.cartItems.length === 0) {
      return res
        .status(400)
        .send({ message: 'All items in your cart are out of stock' });
    }

    if (originalCartItemsLength > cart.cartItems.length) {
      return res.status(400).send({
        message:
          'One or more items are out of stock which will be removed automatically from your cart and you can try again',
      });
    }

    // Calculate total amount
    const totalAmount = cart.cartItems.reduce(
      (total, item) => total + item.price,
      0,
    );
    order.totalAmount = totalAmount;
    order.orderItems = cart.cartItems.map((item) => {
      return { bookId: item.book, quantity: item.quantity };
    });

    // Create and save order
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

    // Remove ordered items from cart
    cart.cartItems = cart.cartItems.filter(
      (cartItem) =>
        !order.orderItems.some(
          (orderItem: OrderItem) =>
            orderItem.bookId.toString() === cartItem.book.toString(),
        ),
    );
    await cart.save();

    return res.status(200).send(createdOrder);
  } catch (err) {
    console.error('Error creating order:', err);
    return res.status(500).send({ message: 'Internal Server Error' });
  }
}

export default { createOrder };
