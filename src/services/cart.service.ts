import mongoose from 'mongoose';
import { CartItemDTO } from '../dtos/cart-item.dto.js';
import { Cart, ICart } from '../models/cart.model.js';
import { User } from '../models/user.model.js';
import 'express-async-errors';
import { BookCreationDTO, BookDTO } from '../dtos/book.dto.js';
import { IBook } from '../models/book.model.js';
import bookService from './book.service.js';
import 'dotenv/config';

const apiUrl = process.env.PUBLIC_API;
const addToCart = async (
  userId: mongoose.Types.ObjectId,
  cartItem: CartItemDTO,
) => {
  const user = await User.findById(userId).populate<{ cart: ICart }>('cart');
  const cart = user?.cart;
  if (cart !== null && cart !== undefined) {
    cart.cartItems.push(cartItem);
    cart.totalPrice = calculateCartTotalPrice(cart.cartItems);
    await cart.save();
    return cart;
  } else {
    throw new Error('Something went wrong');
  }
};

function calculateCartTotalPrice(cartItems: CartItemDTO[]): number {
  return cartItems.reduce(
    (total, item) => total + item.quantity * item.price,
    0,
  );
}

const getCart = async (userId: mongoose.Types.ObjectId) => {
  const cart = await Cart.findOne({ user: userId }).populate('cartItems.book');

  if (!cart) return null; // Handle case when cart is not found.

  cart.cartItems = cart.cartItems.map((item) => {
    // Assert that book is properly populated
    const book = item.book as unknown as BookCreationDTO; // Adjust 'any' to your Book schema type if defined
    if (book && book.coverImageUrl) {
      book.coverImageUrl = `${apiUrl}${book.coverImageUrl}`;
    }
    return item;
  });

  return cart;
};

const hasItem = (cart: ICart, bookId: mongoose.Types.ObjectId): boolean => {
  return cart.cartItems.some((item) => item.book.equals(bookId));
};

const updateItem = async (
  cart: ICart,
  bookId: mongoose.Types.ObjectId,
  q: number,
) => {
  // Find the specific item in the cart
  const cartItem = cart.cartItems.find((item) => item.book.equals(bookId));

  const newQuantity = evaluateQuantity(cart, cartItem!, q);

  // Update the quantity of the item in the cart
  const updateResult = await Cart.updateOne(
    { _id: cart._id, 'cartItems.book': bookId },
    { $set: { 'cartItems.$.quantity': newQuantity } },
  );

  console.log('Update result is: ', updateResult);
  if (updateResult.modifiedCount === 0) {
    throw new Error('No matching cart or item found to update.');
  }

  // Recalculate the total price and save the cart
  const updatedCart = await Cart.findById(cart._id);
  if (updatedCart) {
    updatedCart.totalPrice = calculateCartTotalPrice(updatedCart.cartItems);
    await updatedCart.save();
    return updatedCart;
  } else {
    throw new Error('Cart not found after update.');
  }
};

const getSimilarItems = async (books: BookDTO[]) => {
  // Initialize categories as an empty array
  const categories: mongoose.Types.ObjectId[] = [];
  // Collect all unique categories from the input books
  for (const book of books) {
    const aux = book.category; // Assuming 'category' is an array in each book object
    if (aux !== null) {
      for (const category of aux) {
        if (!categories.includes(category)) {
          categories.push(category);
        }
      }
    }
  }

  const newBooks: BookDTO[] = [];

  // For each category, find books that belong to the category and are not already in the input books
  for (const category of categories) {
    // Fetch books from the database or some data source
    const booksInCategory = await bookService.findBooksByCategory(category);

    // Filter books not already in `books`
    for (const book of booksInCategory) {
      if (
        !newBooks.some((b) => (b.isbn as string) === (book.isbn as string)) &&
        !books.some((b) => b.isbn.toString() === (book.isbn as string))
      ) {
        newBooks.push(book);
      }
    }
  }

  let result: BookDTO[] = newBooks;
  if (newBooks.length > 3) {
    result = newBooks.slice(0, 3);
  }
  result = result.map((r) => ({
    ...r,
    coverImageUrl: r.coverImageUrl ? `${apiUrl}${r.coverImageUrl}` : '',
  }));

  return result;
};
function evaluateQuantity(cart: ICart, cartItem: CartItemDTO, q: number) {
  // Ensure the quantity does not become negative
  const newQuantity = q;
  if (newQuantity < 0) {
    throw new Error('Quantity cannot be negative.');
  }

  // Ensure the total quantity of the cart does not exceed 1000
  const currentTotalQuantity = cart.cartItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );
  const newTotalQuantity =
    currentTotalQuantity - cartItem!.quantity + newQuantity; // Adjust for the updated item
  if (newTotalQuantity > 1000) {
    throw new Error('Total quantity in the cart cannot exceed 1000.');
  }

  return newQuantity;
}

export default { addToCart, getCart, hasItem, updateItem, getSimilarItems };
