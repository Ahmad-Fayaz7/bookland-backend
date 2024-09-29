import { User } from '../models/user.model.js';
import bcrypt from 'bcrypt';
import _ from 'lodash';

const getAllUsers = async () => {
  return await User.find();
};

const createUser = async (data: unknown) => {
  // Create the user
  const user = new User(
    _.pick(data, ['firstName', 'lastName', 'email', 'password', 'role']),
  );

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
