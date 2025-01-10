import express from 'express';
import bookController from '../controllers/book.controller.js';
import { upload } from '../middlewares/fileupload.middleware.js';
import setCoverImageUrl from '../middlewares/set-coverimage.middleware.js';
import { myLogger } from '../middlewares/set-directory.middleware.js';
import { IBook } from '../models/book.model.js';
import { BookDTO } from '../dtos/book.dto.js';

const router = express.Router();
// Get all books
router.get(
  '/books/featured',
  async (req, res, next) => {
    try {
      const books = await bookController.getBooks();
      res.locals.books = books;
      next();
    } catch (error) {
      next(error);
    }
  },
  setCoverImageUrl,
  (req, res) => {
    res.json(res.locals.books);
  },
);

// Get a specific book by ID
router.get('/books/:id', bookController.getBook);

// Get books by category ID
router.get('/books/category/:categoryId', bookController.getBooksByCategory);

// Get books by category paginated
router.post('/books/category', bookController.getBooksByCategoryPaginated);

// Get books by title and category
// POST route with middleware
router.post(
  '/books/search',
  async (req, res, next) => {
    try {
      const books = await bookController.searchBooksByTitleAndCategory(
        req.body,
      );
      // Attach books to `res.locals` to pass it to middleware
      res.locals.books = books;
      next(); // Proceed to middleware
    } catch (err) {
      next(err); // Forward errors to error-handling middleware
    }
  },
  setCoverImageUrl, // Middleware processes `res.locals.books`
  (req, res) => {
    // Middleware has already modified books; now send the response
    res.json(res.locals.books);
  },
);

export default router;
