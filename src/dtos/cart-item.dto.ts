import mongoose from 'mongoose';

export interface CartItemDTO {
  book: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
}
