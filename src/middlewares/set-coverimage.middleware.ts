// Middleware to set books cover image on getting books

import { Request, Response, NextFunction } from 'express';

const apiUrl = process.env.PUBLIC_API || ''; // Fallback to empty string if not set
if (!apiUrl) {
  console.error(
    'Warning: PUBLIC_API environment variable is not set. Cover image URLs may not work correctly.',
  );
}

const setCoverImageUrl = (req: Request, res: Response, next: NextFunction) => {
  const books = res.locals.books;

  if (!books) {
    console.warn('No books found in res.locals.books');
    return next(); // Proceed if there are no books to modify
  }

  try {
    if (Array.isArray(books)) {
      books.forEach((book) => {
        if (book.coverImageUrl) {
          book.coverImageUrl = `${req.protocol}://${req.get('host')}${book.coverImageUrl}`;
        }
      });
    } else if (typeof books === 'object' && 'coverImageUrl' in books) {
      // Handle single book object
      books.coverImageUrl = `${apiUrl}${books.coverImageUrl}`;
    }

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error('Error processing coverImageUrl:', error);
    next(error); // Pass error to error-handling middleware
  }
};

export default setCoverImageUrl;
