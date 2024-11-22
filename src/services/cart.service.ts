import mongoose from 'mongoose';
import { CartItemDTO } from '../dtos/cart-item.dto.js';
import { Cart, ICart } from '../models/cart.model.js';
import { User } from '../models/user.model.js';
import 'express-async-errors';

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
  const cart = await Cart.findOne({ user: userId }).populate('cartItems');
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

function evaluateQuantity(cart: ICart, cartItem: CartItemDTO, q: number) {
  // Ensure the quantity does not become negative
  const newQuantity = cartItem!.quantity + q;
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
export default { addToCart, getCart, hasItem, updateItem };
