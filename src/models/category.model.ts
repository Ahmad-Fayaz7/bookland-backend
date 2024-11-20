import Joi from 'joi';
import mongoose, { Model, Schema, Document } from 'mongoose';

// Create category interface
interface ICategory extends Document {
  name: string;
  imageUrl: string;
  books: Array<mongoose.Types.ObjectId>;
}

// Create category schema
const categorySchema: Schema<ICategory> = new mongoose.Schema({
  name: {
    type: String,
    enum: ['Fiction', 'NonFiction', 'Science', 'History', 'Fantasy', 'Other'],
    default: 'Other',
    unique: true,
  },
  books: [
    {
      type: mongoose.Types.ObjectId,
      ref: 'Book',
    },
  ],
});

// Create category model
const Category: Model<ICategory> = mongoose.model<ICategory>(
  'Category',
  categorySchema,
);

// Joi validation schema for book
const categoryValidationSchema = Joi.object({
  name: Joi.string()
    .valid('Fiction', 'NonFiction', 'Science', 'History', 'Fantasy', 'Other')
    .default('Other'),
});

export { Category, categoryValidationSchema };
