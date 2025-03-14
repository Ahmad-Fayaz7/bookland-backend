import express from 'express';
import bookController from '../controllers/book.controller.js';
import { upload } from '../middlewares/fileupload.middleware.js';
import setCoverImageUrl from '../middlewares/set-coverimage.middleware.js';
import {
  fetchBooks,
  fetchFeaturedBooks,
} from '../middlewares/book.middleware.js';

const router = express.Router();
// Get books by title
router.get(
  '/books/search/:title',
  async (req, res, next) => {
    const title = req.params.title;
    const books = await bookController.searchBooksByTitle(title);
    res.locals.books = books;
    next();
  },
  setCoverImageUrl,
  (req, res) => {
    res.json(res.locals.books);
  },
);

// Get books by category paginated
router.get('/books/by-category', bookController.getBooksByCategoryPaginated);

// Get featured books
router.get(
  '/books/featured',
  fetchFeaturedBooks,
  setCoverImageUrl,
  (req, res) => {
    res.json(res.locals.books);
  },
);
// Get a specific book by ID
router.get('/books/:id', bookController.getBook);
// Get books (paginated)
router.get('/books', fetchBooks, setCoverImageUrl, (req, res) => {
  res.json(res.locals.books);
});

// Get books by category ID
//router.get('/books/category/:categoryId', bookController.getBooksByCategory);

// Get books by title and category
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
