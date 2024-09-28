import mongoose, { Model, Schema, Document } from 'mongoose';
import Joi from 'joi';

// Create book interface
interface IBook extends Document {
  _id: mongoose.Schema.Types.ObjectId;
  isbn: string;
  title: string;
  author: string;
  price: number;
  coverImageUrl: string;
}

// Create book schema
const bookSchema: Schema<IBook> = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
  },
  isbn: {
    type: 'string',
    unique: true,
    pattern: '^(97(8|9))?[- ]?d{1,5}[- ]?d{1,7}[- ]?d{1,7}[- ]?d{1,7}[- ]?d$',
  },
  title: {
    type: 'string',
    minLength: 1,
    maxLength: 255,
  },
  author: {
    type: 'string',
  },
  price: {
    type: 'number',
    minimum: 0,
  },
  coverImageUrl: {
    type: 'string',
  },
});

// Create book model
const Book: Model<IBook> = mongoose.model<IBook>('Book', bookSchema);

// Joi validation schema for book
const bookValidationSchema = Joi.object({
  _id: Joi.string(),
  isbn: Joi.string().pattern(
    /^(97(8|9))?[\- ]?\d{1,5}[\- ]?\d{1,7}[\- ]?\d{1,7}[\- ]?\d{1,7}[\- ]?\d$/,
  ),
  title: Joi.string().required().min(1).max(255).messages({
    'string.empty': 'Title cannot be empty.',
    'string.max': 'Title must not exceed 255 characters.',
    'any.required': 'Title is required.',
  }),
  // authors: Joi.array().items(Joi.string().min(1)).min(1).required(),
  author: Joi.string(),
  price: Joi.number().min(0).messages({
    'number.min': 'Price cannot be negative.',
  }),
  coverImageUrl: Joi.string(),
});

export { Book, bookValidationSchema };
