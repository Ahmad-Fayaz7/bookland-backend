import { Book } from '../models/book.model.js';

const getAllBooks = async () => {
  return await Book.find();
};

export default { getAllBooks };
