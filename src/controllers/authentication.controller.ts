import { Request, Response } from 'express';
import { validateLogin } from '../validations/login.validation.js';
import { User } from '../models/user.model.js';
import bcrypt from 'bcrypt';
const login = async (req: Request, res: Response) => {
  const error = validateLogin(req.body);
  if (error)
    return res.status(400).json({ message: 'Email or password is invalid' });
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return res.status(400).json({ message: 'Email or password is invalid' });
  // Decrypt the password and compare it with the given password
  const isValidPass = await bcrypt.compare(req.body.password, user.password);
  if (!isValidPass)
    return res.status(400).send('Email or password is invalid.');

  // Generat token
  const token = user.generateAuthToken();
  res.send(token);
};

export default { login };
