import _ from 'lodash';
import { BookCreationDTO } from '../dtos/book.dto.js';
import { Book } from '../models/book.model.js';
import { Category } from '../models/category.model.js';

const getAllBooks = async () => {
  return await Book.find();
};

const getBook = async (id: string) => {
  return await Book.findById(id).populate('category');
};

const getBooksByCategory = async (categoryId: string) => {
  try {
    const books = await Category.findById(categoryId).populate('books');
    console.log(books);
    return books;
  } catch (error) {
    console.log('Something went wrong: ', error);
    return [];
  }
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

export default { getAllBooks, getBook, getBooksByCategory, createBook };
