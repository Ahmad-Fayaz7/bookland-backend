import { Book } from '../models/book.model.js';

export interface CategoryCreationDTO {
  name: string;
  imageUrl: string;
  books: Array<typeof Book> | null;
}
