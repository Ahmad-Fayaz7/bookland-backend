import mongoose, { Schema, Document, Model } from 'mongoose';
import jwt from 'jsonwebtoken';
import Joi, { ObjectSchema } from 'joi';
import 'dotenv/config';
// Create user interface
interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  generateAuthToken: () => string;
}
const userSchema: Schema<IUser> = new mongoose.Schema({
  firstName: {
    type: String,
    minLength: 2,
    maxLength: 20,
    required: true,
  },
  lastName: {
    type: String,
    minLength: 2,
    maxLength: 20,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: 'string',
    required: true,
  },
  role: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer',
    required: true,
  },
});

// eslint-disable-next-line no-undef
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) throw new Error('JWT token not provided');

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign({ _id: this._id, role: this.role }, jwtSecret);
  return token;
};

const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);

const userValidationSchema: ObjectSchema = Joi.object({
  firstName: Joi.string().min(2).max(20).required(),
  lastName: Joi.string().min(2).max(20).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  role: Joi.string().valid('customer', 'admin'),
});

export { User, userValidationSchema };
