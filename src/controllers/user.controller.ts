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
  if (!createdUser) {
    return res.status(500).json({ message: 'Something went wrong' });
  }
  // Generate token
  const token = createdUser.generateAuthToken();
  res
    .header('x-auth-token', token)
    .header('Access-Control-Expose-Headers', 'x-auth-token') // Expose the header so the frontend can access it
    .send(_.pick(createdUser, ['firstName', 'lastName', 'email', 'role']));
};

const deleteUser = async (req: Request, res: Response) => {
  const userId = req.params.id;
  const deletedUser = await userService.deleteUserById(userId);
  if (!deletedUser) return res.status(404).json({ messsage: 'User not found' });
  return res.status(200).json({ message: 'User deleted successfully' });
};

const me = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(400).json({ message: 'User not found' });
  }

  try {
    const user = await User.findById(req.user._id).select(
      'firstName lastName email',
    );

    if (!user) {
      return res
        .status(404)
        .json({ message: 'User not found in the database' });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error('Error: ', error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
};

export default { getAllUsers, createUser, deleteUser, me };
