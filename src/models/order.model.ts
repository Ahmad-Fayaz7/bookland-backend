import Joi, { required } from 'joi';
import mongoose from 'mongoose';

// Interface for order items
interface OrderItem {
  bookId: string;
  quantity: number;
}

const orderSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  name: String,
  email: String,
  country: String,
  city: String,
  address: String,
  phone: String,
  orderItems: [
    {
      bookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'book',
        required: true,
      },
      quantity: {
        type: Number,
        min: 1,
        required: true,
      },
    },
  ],
  totalAmount: Number,
  status: String,
  orderDate: {
    type: Date,
    default: Date.now(),
  },
  paymentMethod: String,
  deliveryMethod: String,
});

const Order = mongoose.model('Order', orderSchema);

const orderValidationSchema = Joi.object({
  customerId: Joi.string(),
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  country: Joi.string().min(1).max(100).required(),
  city: Joi.string().min(1).max(100).required(),
  address: Joi.string().min(1).max(255).required(),
  phone: Joi.string(),
  status: Joi.string(),
  orderItems: Joi.array()
    .items(
      Joi.object({
        bookId: Joi.string().required(),
        quantity: Joi.number().integer().min(1).required(),
      }),
    )
    .min(1)
    .required(),

  orderDate: Joi.date(),
  paymentMethod: Joi.string(),
  deliveryMethod: Joi.string(),
});

export { Order, OrderItem, orderValidationSchema };
