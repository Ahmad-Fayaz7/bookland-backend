import { Response, Request } from 'express';
import { validateId } from '../validations/id.validator.js';
import bookService from '../services/book.service.js';
import ApiError from '../models/api-error.model.js';
import cartService from '../services/cart.service.js';
import mongoose from 'mongoose';

// Create a cart
const addToCart = async (req: Request, res: Response) => {
  // Validate user
  const user = req.user;
  if (!user) {
    throw new ApiError('User not found', 404);
  }

  // Validate Cart
  const cart = await cartService.getCart(user._id);
  if (!cart) {
    throw new ApiError('Cart not found', 404);
  }

  // Validate book id
  const { bookId } = req.params;
  const isValid = validateId(bookId);
  if (!isValid) {
    throw new ApiError('Invalid book ID format', 400);
  }

  // Find book
  const book = await bookService.getBook(bookId);
  if (!book) {
    throw new ApiError('Book not found', 404);
  }

  // Check if the item already exists in cart
  const isIncluded = cartService.hasItem(cart, book.id);
  if (isIncluded) {
    const updatedCart = await cartService.updateItem(cart, book.id, 3);
    if (updatedCart) {
      return res.status(200).json({ message: 'Cart updated successfully' });
    } else {
      return res.status(200).json({ message: 'Cart not found after update' });
    }
  }

  // Create cart item
  const cartItem = {
    book: book._id as mongoose.Types.ObjectId,
    quantity: 1,
    price: book.price,
  };

  const success = await cartService.addToCart(user._id, cartItem);
  if (!success) {
    throw new ApiError('Something went wrong', 500);
  }
  res.status(200).json({ message: 'Item added successfully' });
};

export default { addToCart };
