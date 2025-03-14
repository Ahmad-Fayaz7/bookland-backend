import { Request, Response, NextFunction } from 'express';
import bookController from '../controllers/book.controller.js';

export const fetchBooks = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (page < 1 || limit < 1) {
      return res.status(400).json({ error: 'Invalid page or limit value' });
    }

    const books = await bookController.getBooks({ page, limit });
    res.locals.books = books;
    next();
  } catch (error) {
    next(error);
  }
};

export const fetchFeaturedBooks = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const books = await bookController.getFeaturedBooks();
    res.locals.books = books;
    next();
  } catch (error) {
    next(error);
  }
};
