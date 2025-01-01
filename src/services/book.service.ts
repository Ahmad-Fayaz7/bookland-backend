import _ from 'lodash';
import { BookCreationDTO } from '../dtos/book.dto.js';
import { Book, IBook } from '../models/book.model.js';
import mongoose from 'mongoose';

const getAllBooks = async () => {
  return await Book.find();
};

const getBook = async (id: string) => {
  return await Book.findById(id).populate('category');
};

const createBook = async (book: BookCreationDTO) => {
  try {
    const newBook = new Book(
      _.pick(book, ['isbn', 'title', 'author', 'price', 'coverImageUrl']),
    );

    const createdBook = await newBook.save();

    return createdBook;
  } catch (error) {
    console.error('Error creating book:', error);
    throw new Error('Could not create book');
  }
};

const setCoverImageUrl = (
  books: IBook[],
  reqProtocol: string,
  reqHost: string | undefined,
) => {
  books.map((book) => {
    book.coverImageUrl = `${reqProtocol}://${reqHost}${book.coverImageUrl}`;
  });
  return books;
};

const findBooksByCategory = async (category: mongoose.Types.ObjectId) => {
  try {
    const books = await Book.find({ category }).lean(); // Use .lean() for plain objects (optional)
    return books;
  } catch (error) {
    console.error('Error fetching books by category:', error);
    throw new Error('Could not fetch books by category');
  }
};

export default {
  getAllBooks,
  getBook,
  createBook,
  setCoverImageUrl,
  findBooksByCategory,
};
