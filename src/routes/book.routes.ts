import express from 'express';
import bookController from '../controllers/book.controller.js';
import { upload } from '../middlewares/fileupload.middleware.js';

const router = express.Router();
// Get books by title
router.get('/books/search/:title', bookController.searchBooksByTitle);

// Get books by title and category
router.get('/books/search', bookController.searchBooksByTitleAndCategory);

// Get books by category paginated
router.get('/books/by-category', bookController.getBooksByCategoryPaginated);

// Get featured books
router.get('/books/featured', bookController.getFeaturedBooks);
// Get a specific book by ID
router.get('/books/:id', bookController.getBook);
// Get books (paginated)
router.get('/books', bookController.getBooks);

// Get books by category ID
//router.get('/books/category/:categoryId', bookController.getBooksByCategory);

// Create a new book
router.post(
  '/books',
  upload.single('coverImageUrl'),
  bookController.createBook,
);

// Update a book by ID
router.put(
  '/books/:id',
  upload.single('coverImageUrl'),
  bookController.editBook,
);

// Delete a book by ID
router.delete('/books/:id', bookController.deleteBook);
export default router;
