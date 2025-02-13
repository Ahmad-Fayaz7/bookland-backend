import { bookValidationSchema } from '../models/book.model.js';

const validateBook = (book: unknown) => {
  const { error } = bookValidationSchema.validate(book);
  console.log('error:', error);
  return error;
};

export { validateBook };
