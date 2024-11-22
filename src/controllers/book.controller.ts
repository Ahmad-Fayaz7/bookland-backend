import bookService from '../services/book.service.js';
import { Request, Response } from 'express';
import { validateBook } from '../validations/book.validation.js';
import { cleanupUploadedFile } from '../utils/file.utils.js';
import path from 'path';
import { Category } from '../models/category.model.js';
import { validateId } from '../validations/id.validator.js';
const PUBLIC_IMAGE_PATH = '/images/books/';

// Get all books
const getBooks = async (req: Request, res: Response) => {
  const books = await bookService.getAllBooks();
  books.map((book) => {
    book.coverImageUrl = `${req.protocol}://${req.get('host')}${book.coverImageUrl}`;
  });
  res.send(books);
};

// Get book by ID
const getBook = async (req: Request, res: Response) => {
  const bookId = req.params.id;
  const isValid = validateId(bookId);
  if (!isValid) {
    return res.status(400).json({ message: 'Invalid book ID format.' });
  }

  try {
    const book = await bookService.getBook(bookId);
    if (!book) {
      return res.status(400).json({ message: 'Book not found.' });
    }
    book.coverImageUrl = `${req.protocol}://${req.get('host')}${book.coverImageUrl}`;

    res.status(200).json(book);
  } catch (error) {
    console.log('Error: ', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// Get book by category
export const getBooksByCategory = async (req: Request, res: Response) => {
  const { categoryId } = req.params;
  const isValid = validateId(categoryId);
  // Step 1: Validate that categoryId is a valid ObjectId
  if (!isValid) {
    return res.status(400).json({ message: 'Invalid category ID format.' });
  }

  try {
    // Step 2: Check if the category exists
    const category = await Category.findById(categoryId);
    console.log(category);
    if (!category) {
      return res.status(404).json({
        message: `Category with ID ${categoryId} not found.`,
      });
    }

    // Step 3: Get books for the specified category
    const books = await bookService.getBooksByCategory(categoryId);

    if (!books) {
      return res.status(404).json({
        message: 'No books found for this category.',
      });
    }

    // Step 4: Return the books found
    return res.status(200).json(books);
  } catch (error) {
    console.error('Error occurred:', error);
    return res.status(500).json({
      message: 'Something went wrong while retrieving the books.',
    });
  }
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
