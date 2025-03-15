import { Response, Request } from 'express';
import { validateId } from '../validations/id.validator.js';
import bookService from '../services/book.service.js';
import ApiError from '../models/api-error.model.js';
import cartService from '../services/cart.service.js';
import mongoose from 'mongoose';
import { Cart } from '../models/cart.model.js';
import { User } from '../models/user.model.js';

// Create a cart
const addToCart = async (req: Request, res: Response) => {
  // Validate user
  const user = req.user;
  if (!user) {
    throw new ApiError('User not found', 404);
  }

  // Validate Cart
  let cart = await cartService.getCart(user._id);
  if (!cart) {
    // Create the cart
    cart = await Cart.create({
      user: user._id, // This can be null at this point
      cartItems: [],
      totalPrice: 0,
    });
    console.log(cart);
    // Add cart to user
    const targetUser = await User.findById(user._id);
    if (!targetUser) {
      throw new ApiError('User not found', 404);
    }
    targetUser.cart = cart._id as mongoose.Types.ObjectId;
    await targetUser.save();
  }

  // Validate book id
  const { bookId } = req.params;
  const bookObjectId = new mongoose.Types.ObjectId(bookId);
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
  const isIncluded = cartService.hasItem(cart, bookObjectId);
  if (isIncluded) {
    const updatedCart = await cartService.updateItem(cart, bookObjectId, 1);
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

// Get cart
const getCart = async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    throw new ApiError('User not found', 404);
  }
  const isValidId = validateId(user?._id);
  if (!isValidId) {
    throw new ApiError('Invalid cart ID format', 400);
  }
  const cart = await cartService.getCart(user._id);
  if (!cart) {
    throw new ApiError('Cart not found', 404);
  }
  return res.status(200).json(cart);
};

// Update cart
const updateCart = async (req: Request, res: Response) => {
  let { bookId, quantity } = req.body;
  quantity = quantity as number;
  const user = req.user;
  if (!user) {
    throw new ApiError('User not found', 404);
  }
  const isValidId = validateId(user?._id);
  if (!isValidId) {
    throw new ApiError('Invalid cart ID format', 400);
  }
  const cart = await cartService.getCart(user._id);
  if (!cart) {
    throw new ApiError('Cart not found', 404);
  }
  const updatedCart = await cartService.updateItem(cart, bookId, quantity);
  if (!updatedCart) {
    throw new ApiError('Something went wrong', 500);
  }
  return res.status(200).json(updatedCart);
};

// Remove from cart
const removeFromCart = async (req: Request, res: Response) => {
  const user = req.user;
  const id = req.params.id;
  const bookObjectId = new mongoose.Types.ObjectId(id);
  if (!user) {
    throw new ApiError('User not found', 404);
  }
  const isValidId = validateId(user?._id);
  if (!isValidId) {
    throw new ApiError('Invalid cart ID format', 400);
  }
  const cart = await cartService.getCart(user._id);
  if (!cart) {
    throw new ApiError('Cart not found', 404);
  }

  const result = await Cart.updateOne(
    { _id: cart._id },
    { $pull: { cartItems: { book: bookObjectId } } },
  );

  if (result.modifiedCount > 0) {
    console.log(`Book with ID ${id} removed from the cart`);
  } else {
    console.log('No matching book found in the cart');
  }

  res.status(200).json({ message: 'Item removed successfully' });
};

const getSimilarBooks = async (req: Request, res: Response) => {
  const user = req.user;
  const { books } = req.body;
  if (!user) {
    throw new ApiError('User not found', 404);
  }
  if (!Array.isArray(books) || books.length === 0) {
    throw new ApiError('Invalid input. An array of books is required.', 400);
  }
  const similarBooks = await cartService.getSimilarItems(books);

  return res.status(200).json(similarBooks);
};

export default {
  addToCart,
  getCart,
  updateCart,
  removeFromCart,
  getSimilarBooks,
};
