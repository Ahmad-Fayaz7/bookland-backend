import mongoose from 'mongoose';

export interface BookCreationDTO {
  isbn: string;
  title: string;
  author: string;
  description: string;
  price: number;
  coverImageUrl: string;
  category: Array<string>;
  stock: number;
}

export interface BookDTO {
  id?: mongoose.Types.ObjectId;
  isbn: string;
  title: string;
  author: string;
  description: string;
  price: number;
  coverImageUrl: string;
  category: Array<mongoose.Types.ObjectId> | null;
  stock: number;
}
