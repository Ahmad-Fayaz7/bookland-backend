import bookService from '../services/book.service.js';
import { Request, Response } from 'express';
import { validateBook } from '../validations/book.validation.js';
import { cleanupUploadedFile, deleteFile } from '../utils/file.utils.js';
import path from 'path';
import { Category } from '../models/category.model.js';
import { validateId } from '../validations/id.validator.js';
import ApiError from '../models/api-error.model.js';
import { Book } from '../models/book.model.js';
import 'dotenv/config';
import { BookCreationDTO, BookDTO } from '../dtos/book.dto.js';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';

const apiUrl = process.env.PUBLIC_API;
const PUBLIC_IMAGE_PATH = '/images/books/';
// Define __dirname manually for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// TODO: Get featured books
const getFeaturedBooks = async () => {
  let books = await bookService.getAllBooks();
  return books;
};

// Get books paginated
const getBooks = async (filter: any) => {
  const skip = (filter.page - 1) * filter.limit;
  let books: BookDTO[] = await Book.find()
    .populate('category')
    .lean()
    .skip(skip)
    .limit(filter.limit)
    .exec();

  const totalDocuments = await Book.countDocuments();

  const totalPages = Math.ceil(totalDocuments / filter.limit);
  return { currentPage: filter.page, totalPages, totalDocuments, books };
};

// Get book by ID
const getBook = async (req: Request, res: Response) => {
  const bookId = req.params.id;
  const isValid = validateId(bookId);
  if (!isValid) {
    throw new ApiError('Invalid book ID format.', 400);
  }

  const book = await bookService.getBook(bookId);
  if (!book) {
    throw new ApiError('Book not found.', 404);
  }
  book.coverImageUrl = `${req.protocol}://${req.get('host')}${book.coverImageUrl}`;

  res.status(200).json(book);
};

// Get book by category
export const getBooksByCategory = async (req: Request, res: Response) => {
  const { categoryId } = req.params;
  const isValid = validateId(categoryId);
  // Validate that categoryId is a valid ObjectId
  if (!isValid) {
    throw new ApiError('Invalid category ID format.', 400);
  }

  // Check if the category exists
  const category = await Category.findById(categoryId).populate('books');
  if (!category) {
    throw new ApiError(`Category with ID ${categoryId} not found.`, 404);
  }

  // Get books for the specified category
  const books = category.books;
  if (!books) {
    throw new ApiError('No books found for this category.', 404);
  }
  // Return the books found

  return res.status(200).json(books);
};

// Get book by category paginated
export const getBooksByCategoryPaginated = async (
  req: Request,
  res: Response,
) => {
  const filter = req.body;
  const skip = (filter.page - 1) * filter.limit;
  let books: BookDTO[] = await Book.find({
    category: filter.category as mongoose.Types.ObjectId,
  })
    .lean()
    .skip(skip)
    .limit(filter.limit)
    .exec();

  books = books.map((book) => ({
    ...book,
    coverImageUrl: `${apiUrl}${book.coverImageUrl}`,
  }));

  const totalDocuments = await Book.countDocuments({
    category: filter.category,
  });

  const totalPages = Math.ceil(totalDocuments / filter.limit);
  return res
    .status(200)
    .json({ currentPage: filter.page, totalPages, totalDocuments, books });
};
export const searchBooksByTitle = async (title: string) => {
  const books = await bookService.searchBooksByTitle(title);
  if (!books) {
    throw new ApiError('No books found for this search.', 404);
  }
  return books;
};
// Search books by title and category
export const searchBooksByTitleAndCategory = async (params: any) => {
  const books = await bookService.searchBooksByTitleAndCategory(params);
  if (!books) {
    throw new ApiError('No books found for this search.', 404);
  }
  return books;
};
// Create book
const createBook = async (req: Request, res: Response) => {
  try {
    const book = req.body as BookCreationDTO;

    if (typeof book.category === 'string') {
      book.category = JSON.parse(book.category);
    }

    const error = validateBook(req.body);
    if (error) {
      cleanupUploadedFile(req);
      return res.status(400).json({ message: 'Book data is not valid' });
    }
    // Create file path for book cover
    if (req.file) {
      const filePath = path.join(PUBLIC_IMAGE_PATH, req.file.filename); // Store relative path
      req.body.coverImageUrl = filePath;
    }
    const newBook = await bookService.createBook(book);
    res.json({ message: 'Book created successfully', newBookId: newBook._id });
  } catch (error) {
    cleanupUploadedFile(req);
    console.log('Error creating book: ', error);
    res.json({ message: 'Error creating book', status: 500 });
  }
};
// Edit book
const editBook = async (req: Request, res: Response) => {
  const bookId = req.params.id;
  const isValid = validateId(bookId);
  if (!isValid) {
    throw new ApiError('Invalid book ID format.', 400);
  }

  const book = await bookService.getBook(bookId);
  if (!book) {
    throw new ApiError('Book not found.', 404);
  }
  // Create file path for book cover
  if (req.file) {
    // Delete existing cover image
    const existingImagePath = path.join(
      __dirname,
      '../../public',
      book.coverImageUrl,
    );
    deleteFile(existingImagePath);
    const newFilePath = path.join(PUBLIC_IMAGE_PATH, req.file.filename); // Store relative path
    req.body.coverImageUrl = newFilePath;
  }
  try {
    const updatedBook = await bookService.editBook(bookId, req.body);
    res.json({ message: 'Book updated successfully', updatedBook });
  } catch (error) {
    console.log('Error updating book: ', error);
    res.json({ message: 'Error updating book', status: 500 });
  }
};

// Delete book
const deleteBook = async (req: Request, res: Response) => {
  const bookId = req.params.id;
  const isValid = validateId(bookId);
  if (!isValid) {
    throw new ApiError('Invalid book ID format.', 400);
  }

  const book = await bookService.getBook(bookId);
  if (!book) {
    throw new ApiError('Book not found.', 404);
  }

  try {
    // Delete existing cover image
    const existingImagePath = path.join(
      __dirname,
      '../../public',
      book.coverImageUrl,
    );
    deleteFile(existingImagePath);
    await bookService.deleteBook(bookId);
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.log('Error deleting book: ', error);
    res.json({ message: 'Error deleting book', status: 500 });
  }
};

export default {
  getBooks,
  getFeaturedBooks,
  getBook,
  getBooksByCategory,
  createBook,
  getBooksByCategoryPaginated,
  searchBooksByTitle,
  searchBooksByTitleAndCategory,
  editBook,
  deleteBook,
};
