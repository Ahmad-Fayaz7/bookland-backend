import bookService from '../services/book.service.js';
import { Request, Response } from 'express';

const getBooks = async (req: Request, res: Response) => {
  const books = await bookService.getAllBooks();
  res.send(books);
};

export default { getBooks };
