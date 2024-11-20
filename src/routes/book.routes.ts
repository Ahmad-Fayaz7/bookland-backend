import express from 'express';
import bookController from '../controllers/book.controller.js';
import { upload } from '../middlewares/fileupload.middleware.js';
import { myLogger } from '../middlewares/set-directory.middleware.js';

const router = express.Router();
// Get all books
router.get('/books', bookController.getBooks);

// Get a specific book by ID
router.get('/books/:id', bookController.getBook);

// Get books by category ID
router.get('/books/category/:categoryId', bookController.getBooksByCategory);

export default router;

/* router.post(
  '/books',

  myLogger,
  upload.single('file'),
  bookController.createBook,
); */
