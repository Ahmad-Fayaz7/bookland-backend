import _ from 'lodash';
import { BookCreationDTO, BookDTO } from '../dtos/book.dto.js';
import { Book, IBook } from '../models/book.model.js';
import mongoose from 'mongoose';
import 'dotenv/config';
import ApiError from '../models/api-error.model.js';

const host = process.env.HOST;
const protocol = process.env.PROTOCOL;
const port = process.env.PORT;
const apiUrl = `${protocol}://${host}:${port}` || ''; // Fallback to empty string if not set

const getAllBooks = async () => {
  const books = await Book.find();

  return setCoverImageUrl(books);
};

// Get books paginated
const getBooksPaginated = async (page: number, limit: number) => {
  const skip = (page - 1) * limit;
  let books: BookDTO[] = await Book.find()
    .populate('category')
    .lean()
    .skip(skip)
    .limit(limit)
    .exec();
  books = setCoverImageUrl(books);
  const totalDocuments = await Book.countDocuments();
  const totalPages = Math.ceil(totalDocuments / limit);
  return { currentPage: page, totalPages, totalDocuments, books };
};

// Get books by category paginated
const getBooksByCategoryPaginated = async (
  pageNum: number,
  limitNum: number,
  category: string,
) => {
  const skip = (pageNum - 1) * limitNum;
  let books: BookDTO[] = await Book.find({
    category: category,
  })
    .lean()
    .skip(skip)
    .limit(limitNum)
    .exec();

  /*  books = books.map((book) => ({
    ...book,
    coverImageUrl: `${apiUrl}${book.coverImageUrl}`,
  })); */
  const totalDocuments = await Book.countDocuments({
    category: category,
  });

  const totalPages = Math.ceil(totalDocuments / limitNum);
  books = setCoverImageUrl(books);
  return { currentPage: pageNum, totalPages, totalDocuments, books };
};

const getBook = async (id: string) => {
  let book = await Book.findById(id).populate('category');
  return setCoverImageUrl(book);
};

const createBook = async (book: BookCreationDTO) => {
  try {
    const newBook = new Book(
      _.pick(book, [
        'isbn',
        'title',
        'author',
        'price',
        'stock',
        'coverImageUrl',
        'category',
        'description',
      ]),
    );

    const createdBook = await newBook.save();

    return createdBook;
  } catch (error) {
    console.error('Error creating book:', error);
    throw new Error('Could not create book');
  }
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

const searchBooksByTitle = async (title: string) => {
  const books = await Book.find({
    title: { $regex: title, $options: 'i' },
  }).lean();

  return setCoverImageUrl(books);
};
const searchBooksByTitleAndCategory = async (
  searchTerm: string,
  category: string,
) => {
  try {
    console.log(searchTerm);
    const books = await Book.find({
      category: category,
      title: { $regex: searchTerm, $options: 'i' },
    }).lean();
    return setCoverImageUrl(books);
  } catch (err) {
    console.error('Error searching books by title and category:', err);
    throw new Error('Could not search books by title and category');
  }
};

const editBook = async (id: string, book: BookDTO) => {
  console.log('book:', book);
  if (typeof book.category === 'string') {
    book.category = JSON.parse(book.category);
  }
  const updatedBook = await Book.findByIdAndUpdate(id, book, { new: true });
  return updatedBook;
};

// Delete a book by ID
const deleteBook = async (id: string) => {
  try {
    const deletedBook = await Book.findByIdAndDelete(id);
    return deletedBook; // Return the deleted book
  } catch (error) {
    // Catch any errors
    console.error('Error deleting book:', error);
    throw new Error('Could not delete book'); // Throw an error to the caller
  }
};

function setCoverImageUrl(books: any) {
  if (!apiUrl) {
    console.error(
      'Warning: PUBLIC_API environment variable is not set. Cover image URLs may not work correctly.',
    );
  }
  if (!books) {
    console.warn('No books found');
  }
  try {
    if (Array.isArray(books)) {
      books.forEach((book) => {
        if (book.coverImageUrl) {
          book.coverImageUrl = `${apiUrl}${book.coverImageUrl}`;
        }
      });
    } else if (typeof books === 'object' && 'coverImageUrl' in books) {
      // Handle single book object
      books.coverImageUrl = `${apiUrl}${books.coverImageUrl}`;
    }
    return books;
  } catch (error) {
    console.error('Error processing coverImageUrl:', error);
  }
}

export default {
  getAllBooks,
  getBooksPaginated,
  getBook,
  createBook,
  findBooksByCategory,
  searchBooksByTitle,
  searchBooksByTitleAndCategory,
  getBooksByCategoryPaginated,
  editBook,
  deleteBook,
  setCoverImageUrl,
};
