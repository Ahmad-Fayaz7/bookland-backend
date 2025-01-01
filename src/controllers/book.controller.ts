import bookService from '../services/book.service.js';
import { Request, Response } from 'express';
import { validateBook } from '../validations/book.validation.js';
import { cleanupUploadedFile } from '../utils/file.utils.js';
import path from 'path';
import { Category } from '../models/category.model.js';
import { validateId } from '../validations/id.validator.js';
import ApiError from '../models/api-error.model.js';

const PUBLIC_IMAGE_PATH = '/images/books/';

// Get all books
const getBooks = async (req: Request, res: Response) => {
  let books = await bookService.getAllBooks();
  const reqProtocol = req.protocol;
  const reqHost = req.get('host');
  books = bookService.setCoverImageUrl(books, reqProtocol, reqHost);

  res.send(books);
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

// Create book
const createBook = async (req: Request, res: Response) => {
  try {
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
    const newBook = await bookService.createBook(req.body);
    res.json(newBook);
  } catch (error) {
    cleanupUploadedFile(req);
    console.log('Error creating book: ', error);
    res.json({ message: 'Error creating book', status: 500 });
  }
};

export default { getBooks, getBook, getBooksByCategory, createBook };
