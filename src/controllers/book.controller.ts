import bookService from '../services/book.service.js';
import { Request, Response } from 'express';
import { validateBook } from '../validations/book.validation.js';
import {
  removeUploadedFile,
  deleteFile,
  getFilePath,
  getFileName,
} from '../utils/file.utils.js';
import path from 'path';
import { validateId } from '../validations/id.validator.js';
import ApiError from '../models/api-error.model.js';
import 'dotenv/config';
import { BookCreationDTO, BookDTO } from '../dtos/book.dto.js';

import { fileURLToPath } from 'url';

const BOOKS_IMAGE_PATH = '/images/books/';
// Define __dirname manually for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// TODO: Get featured books
const getFeaturedBooks = async (req: Request, res: Response) => {
  let books = await bookService.getAllBooks();
  if (!books) {
    throw new ApiError('Error retrieving books', 500);
  }

  if (books.length === 0) {
    return res.status(200).json({ message: 'No books found', books: [] });
  }
  return res.status(200).send(books);
};

// Get books paginated
const getBooks = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string);
  const limit = parseInt(req.query.limit as string);
  if (Number.isNaN(page) || Number.isNaN(limit) || page < 1 || limit < 1) {
    throw new ApiError('Invalid page or limit value', 400);
  }
  const data = await bookService.getBooksPaginated(page, limit);
  if (!data) {
    throw new ApiError('Error retrieving books', 500);
  }

  if (data.books.length === 0) {
    return res.status(200).json({ message: 'No books found', books: [] });
  }
  return res.send(data).status(200);
};

// Get book by ID
const getBook = async (req: Request, res: Response) => {
  const bookId = req.params.id;
  const isValid = validateId(bookId);
  if (!isValid) {
    throw new ApiError('Invalid book ID format', 400);
  }

  const book = await bookService.getBook(bookId);
  if (!book) {
    throw new ApiError('Error retrieving book', 500);
  }
  res.status(200).send(book);
};

// Get book by category
/* export const getBooksByCategory = async (req: Request, res: Response) => {
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
}; */

// Get book by category paginated
export const getBooksByCategoryPaginated = async (
  req: Request,
  res: Response,
) => {
  let { page = 1, limit = 10, category } = req.query;

  // Convert pagination values to numbers
  page = parseInt(req.query.page as string);
  limit = parseInt(req.query.limit as string);

  if (Number.isNaN(page) || Number.isNaN(limit) || page < 1 || limit < 1) {
    throw new ApiError('Invalid page or limit value', 400);
  }
  const data = await bookService.getBooksByCategoryPaginated(
    page,
    limit,
    category as string,
  );
  if (!data) {
    throw new ApiError('Error retrieving books', 500);
  }

  if (data.books.length === 0) {
    return res.status(200).json({ message: 'No books found', books: [] });
  }
  return res.status(200).send(data);
};

// Search books by title
export const searchBooksByTitle = async (req: Request, res: Response) => {
  const title = req.params.title;
  const books = await bookService.searchBooksByTitle(title);
  if (!books) {
    throw new ApiError('Error retrieving books', 500);
  }
  if (books.length === 0) {
    return res.status(200).send({ message: 'No books found', books: [] });
  }
  return res.status(200).send(books);
};

// Search books by title and category
export const searchBooksByTitleAndCategory = async (
  req: Request,
  res: Response,
) => {
  const { searchTerm, category } = req.query;
  const books = await bookService.searchBooksByTitleAndCategory(
    searchTerm as string,
    category as string,
  );
  if (!books) {
    throw new ApiError('Error retrieving books', 500);
  }
  if (books.length === 0) {
    return res.status(200).send({ message: 'No books found', books: [] });
  }
  return res.status(200).send(books);
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
      removeUploadedFile(req); // Removes uploaded file in case of error
      throw new ApiError('Book data is not valid', 400);
    }
    // Create file path for book cover
    if (req.file) {
      const filePath = path.join(BOOKS_IMAGE_PATH, req.file.filename); // Store relative path
      req.body.coverImageUrl = filePath;
    }
    const newBook = await bookService.createBook(book);
    res.json({ message: 'Book created successfully', newBookId: newBook._id });
  } catch (error) {
    removeUploadedFile(req);
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
    const filePath = getFilePath(book.coverImageUrl);
    deleteFile(filePath);
    const newFilePath = path.join(BOOKS_IMAGE_PATH, req.file.filename); // Store relative path
    req.body.coverImageUrl = newFilePath;
  }

  const updatedBook = await bookService.editBook(bookId, req.body);
  if (!updatedBook) {
    throw new ApiError('Error updating book', 500);
  }
  res.json({ message: 'Book updated successfully', updatedBook });
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
  // Delete existing cover image
  const filePath = getFilePath(book.coverImageUrl);
  deleteFile(filePath);
  const result = await bookService.deleteBook(bookId);
  if (!result) {
    throw new ApiError('Error deleting book', 500);
  }
  res.json({ message: 'Book deleted successfully' });
};

export default {
  getBooks,
  getFeaturedBooks,
  getBook,
  // getBooksByCategory,
  createBook,
  getBooksByCategoryPaginated,
  searchBooksByTitle,
  searchBooksByTitleAndCategory,
  editBook,
  deleteBook,
};
