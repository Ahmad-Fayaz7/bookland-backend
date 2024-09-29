import _ from 'lodash';
import { User, userValidationSchema } from '../models/user.model.js';
import userService from '../services/user.service.js';
import { Request, Response } from 'express';

const getAllUsers = async (req: Request, res: Response) => {
  const users = await userService.getAllUsers();
  res.send(users);
};

const createUser = async (req: Request, res: Response) => {
  // Validate user's data
  const { error } = userValidationSchema.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  // Check if the user already exists
  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send('User already exists.');

  const createdUser = await userService.createUser(req.body);
  // Generate token
  const token = createdUser.generateAuthToken();
  res
    .header('x-auth-token', token)
    .send(_.pick(createdUser, ['firstName', 'lastName', 'email', 'role']));
};

const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const deletedUser = await userService.deleteUserById(userId);
    if (!deletedUser)
      return res.status(404).json({ messsage: 'User not found' });
    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting the user', error });
  }
};

/* Const me = async (req: Request, res: Response) => {
  const currentUser = await userService.getCurrentUser(req.user._id);
  res.send(currentUser);
}; */
export default { getAllUsers, createUser, deleteUser };
