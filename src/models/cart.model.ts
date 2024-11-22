import mongoose, { Model, Schema, Document } from 'mongoose';
import Joi from 'joi';
import { CartItemDTO } from '../dtos/cart-item.dto.js';

// Create cart interface
export interface ICart extends Document {
  user: mongoose.Types.ObjectId;
  cartItems: Array<CartItemDTO>;
  totalPrice: number;
}

// Create cart schema
const cartSchema: Schema<ICart> = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  cartItems: [
    {
      book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true,
      },
      quantity: {
        type: Number,
        min: 1,
        required: true,
      },
      price: {
        type: Number,
        min: 0,
        required: true,
      },
    },
  ],
  totalPrice: {
    type: Number,
    required: true,
    min: 0,
  },
});

// Create cart model
const Cart: Model<ICart> = mongoose.model<ICart>('Cart', cartSchema);

const cartValidationSchema = Joi.object({
  user: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/) // Validate as a MongoDB ObjectId
    .required()
    .messages({
      'string.pattern.base': 'User must be a valid ObjectId.',
    }),
  cartItems: Joi.array()
    .items(
      Joi.object({
        book: Joi.string()
          .pattern(/^[0-9a-fA-F]{24}$/) // Validate as a MongoDB ObjectId
          .required()
          .messages({
            'string.pattern.base': 'Product must be a valid ObjectId.',
          }),
        quantity: Joi.number().integer().min(1).required().messages({
          'number.base': 'Quantity must be a number.',
          'number.min': 'Quantity must be at least 1.',
        }),
        price: Joi.number().min(0).required().messages({
          'number.base': 'Price must be a number.',
          'number.min': 'Price cannot be negative.',
        }),
      }),
    )
    .required()
    .messages({
      'array.base': 'Cart items must be an array.',
      'array.includes': 'Each cart item must be a valid object.',
    }),
  totalPrice: Joi.number().min(0).required().messages({
    'number.base': 'Total price must be a number.',
    'number.min': 'Total price cannot be negative.',
  }),
});

export { Cart, cartValidationSchema };
