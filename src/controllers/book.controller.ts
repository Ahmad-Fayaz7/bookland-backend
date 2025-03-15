import bookService from '../services/book.service.js';
import { Request, Response } from 'express';
import { validateBook } from '../validations/book.validation.js';
import { cleanupUploadedFile, deleteFile } from '../utils/file.utils.js';
import path from 'path';
import { validateId } from '../validations/id.validator.js';
import ApiError from '../models/api-error.model.js';
import 'dotenv/config';
import { BookCreationDTO, BookDTO } from '../dtos/book.dto.js';

import { fileURLToPath } from 'url';

const PUBLIC_IMAGE_PATH = '/images/books/';
// Define __dirname manually for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// TODO: Get featured books
const getFeaturedBooks = async (req: Request, res: Response) => {
  let books = await bookService.getAllBooks();
  return res.send(books);
};

// Get books paginated
const getBooks = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string);
    const limit = parseInt(req.query.limit as string);
    if (Number.isNaN(page) || Number.isNaN(limit)) {
      return res.status(400).send({ message: 'Page or limit is not valid' });
    }
    const data = await bookService.getBooksPaginated(page, limit);
    return res.send(data);
  } catch (error: any) {
    return res.status(400).send({ error: error.message });
  }
};

// Get book by ID
const getBook = async (req: Request, res: Response) => {
  const bookId = req.params.id;
  const isValid = validateId(bookId);
  if (!isValid) {
    throw new ApiError('Invalid book ID format.', 400);
  }

  let book = await bookService.getBook(bookId);
  if (!book) {
    throw new ApiError('Book not found.', 404);
  }
  res.status(200).json(book);
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
  const { page = 1, limit = 10, category } = req.query;
  // Convert pagination values to numbers
  const pageNum = parseInt(page as string, 1);
  const limitNum = parseInt(limit as string, 10);
  try {
    const data = await bookService.getBooksByCategoryPaginated(
      pageNum,
      limitNum,
      category as string,
    );
    return res.send(data);
  } catch (error) {
    return res.status(400).send({ error: (error as Error).message });
  }
};

// Search books by title
export const searchBooksByTitle = async (req: Request, res: Response) => {
  const title = req.params.title;
  const books = await bookService.searchBooksByTitle(title);
  if (!books) {
    throw new ApiError('No books found for this search.', 404);
  }
  return res.send(books);
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
    throw new ApiError('No books found for this search.', 404);
  }
  return res.send(books);
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
  // getBooksByCategory,
  createBook,
  getBooksByCategoryPaginated,
  searchBooksByTitle,
  searchBooksByTitleAndCategory,
  editBook,
  deleteBook,
};
