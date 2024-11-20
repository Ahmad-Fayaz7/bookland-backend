import { bookValidationSchema } from '../models/book.model.js';

const validateBook = (book: unknown) => {
  const { error } = bookValidationSchema.validate(book);
  return error;
};

export { validateBook };
