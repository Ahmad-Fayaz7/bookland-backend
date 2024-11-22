import { User } from '../models/user.model.js';
import bcrypt from 'bcrypt';
import _ from 'lodash';
import { Cart } from '../models/cart.model.js';
import mongoose from 'mongoose';

const getAllUsers = async () => {
  return await User.find();
};

const createUser = async (data: unknown) => {
  // Create the user
  const user = new User(
    _.pick(data, ['firstName', 'lastName', 'email', 'password', 'role']),
  );

  // Create the cart
  const newCart = await Cart.create({
    user: user._id, // This can be null at this point
    cartItems: [],
    totalPrice: 0,
  });

  // Add cart to user
  user.cart = newCart._id as mongoose.Types.ObjectId;

  // Hash the password
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  // Save the user
  const createdUser = await user.save();
  return createdUser;
};

const deleteUserById = async (id: string) => {
  const deletedUser = await User.findByIdAndDelete(id);
  return deletedUser;
};

const getCurrentUser = async (id: string) => {
  const user = await User.findById(id).select({
    firstName: 1,
    lastName: 1,
    email: 1,
  });
  return user;
};
export default { getAllUsers, createUser, deleteUserById, getCurrentUser };
