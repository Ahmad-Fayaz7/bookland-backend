import { BookCreationDTO } from '../dtos/book.dto.js';
import { CategoryCreationDTO } from '../dtos/category.dto.js';

import { connectToDb } from '../services/db.service.js';
import { Category } from '../models/category.model.js';
import { Book } from '../models/book.model.js';
import mongoose from 'mongoose';

let categoriesData: CategoryCreationDTO[] = [
  {
    name: 'Fantasy',
    books: [],
    imageUrl: `/images/categories/Harry_Potter.jpg`,
  },
  {
    name: 'Science Fiction',
    books: [],
    imageUrl: '/images/categories/To_Kill_a_mockingbird.jpg',
  },
  {
    name: 'Historical Fiction',
    books: [],
    imageUrl: '/images/categories/The_Nightingale.jpg',
  },
  {
    name: 'Thriller',
    books: [],
    imageUrl: '/images/categories/dragontattooo.jpg',
  },
  {
    name: 'Mystery',
    books: [],
    imageUrl: '/images/categories/The_Book_Thief.jpg',
  },
  {
    name: 'Adventure',
    books: [],
    imageUrl: '/images/categories/Into_The_Wild.jpg',
  },
  {
    name: 'Classic',
    books: [],
    imageUrl: '/images/categories/The_Catcher_In_The_Rye.jpg',
  },
  {
    name: 'Romance',
    books: [],
    imageUrl: '/images/categories/twilight.jpg',
  },
  {
    name: 'Non-fiction',
    books: [],
    imageUrl: '/images/categories/A_Brief_History_Of_Humankind.jpg',
  },
  {
    name: 'Young Adult',
    books: [],
    imageUrl: '/images/categories/The_Falult_In_Our_Stars.jpg',
  },
];

let bookData: BookCreationDTO[] = [
  {
    isbn: '978-0747532743',
    title: "Harry Potter and the Philosopher's Stone",
    author: 'J. K. Rowling',
    description: `Harry Potter and the Philosopher's Stone is a fantasy novel written by the British author J. K. Rowling. It is the first novel in the Harry Potter series and was Rowling's debut novel.`,
    price: 53.85,
    coverImageUrl: '/images/books/Harry_Potter_Philosopher.jpg',
    category: ['Fantasy', 'Young Adult'],
    stock: 15,
  },
  {
    isbn: '978-0385732550',
    title: 'The Book Thief',
    author: 'Markus Zusak',
    description: `Set during World War II in Germany, this is the story of a young girl who transforms the lives of everyone around her when she discovers the power of words.`,
    price: 48.99,
    coverImageUrl: '/images/books/Book_Thief.jpg',
    category: ['Fantasy', 'Mystery', 'Classic', 'Romance', 'Young Adult'],
    stock: 20,
  },
  {
    isbn: '978-0439139595',
    title: 'Harry Potter and the Goblet of Fire',
    author: 'J. K. Rowling',
    description: `The fourth book in the Harry Potter series, it follows Harry as he competes in the dangerous Triwizard Tournament.`,
    price: 59.75,
    coverImageUrl: '/images/books/Harry_Potter_Goblet.jpg',
    category: ['Fantasy', 'Adventure', 'Young Adult'],
    stock: 10,
  },
  {
    isbn: '978-0553103540',
    title: 'A Game of Thrones',
    author: 'George R. R. Martin',
    description: `The first novel in the epic fantasy series A Song of Ice and Fire, which inspired the television series Game of Thrones.`,
    price: 65.95,
    coverImageUrl: '/images/books/Game_of_Thrones.jpg',
    category: ['Historical Fiction'],
    stock: 12,
  },
  {
    isbn: '978-0316769488',
    title: 'The Catcher in the Rye',
    author: 'J. D. Salinger',
    description: `A novel about a teenage boy's journey through New York City after being expelled from his boarding school.`,
    price: 38.5,
    coverImageUrl: '/images/books/Catcher_in_the_Rye.jpg',
    category: ['67308687b05aa92b727744b5'],
    stock: 25,
  },
  {
    isbn: '978-0061120084',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    description: `A classic novel about racial inequality and moral growth, seen through the eyes of a young girl in the American South.`,
    price: 47.8,
    coverImageUrl: '/images/books/To_Kill_a_Mockingbird.jpg',
    category: ['Science Fiction', 'Adventure', 'Classic', 'Romance'],
    stock: 18,
  },
  {
    isbn: '978-1501124020',
    title: 'The Nightingale',
    author: 'Kristin Hannah',
    description: `A story about two sisters living in France during World War II and their struggle to survive the war.`,
    price: 42.0,
    coverImageUrl: '/images/books/The_Nightingale.jpg',
    category: ['Science Fiction', 'Historical Fiction'],
    stock: 14,
  },
  {
    isbn: '978-0062315007',
    title: 'Sapiens: A Brief History of Humankind',
    author: 'Yuval Noah Harari',
    description: `A groundbreaking narrative of humanity's creation and evolution that explores the ways in which biology and history have defined us.`,
    price: 55.25,
    coverImageUrl: '/images/books/Sapiens.jpg',
    category: ['Science Fiction', 'Thriller', 'Non-fiction'],
    stock: 30,
  },
  {
    isbn: '978-0143127741',
    title: 'The Martian',
    author: 'Andy Weir',
    description: `A gripping story of an astronaut stranded on Mars and his struggle to survive against all odds.`,
    price: 46.99,
    coverImageUrl: '/images/books/The_Martian.jpg',
    category: ['67308687b05aa92b727744b8'],
    stock: 16,
  },
  {
    isbn: '978-0307592736',
    title: 'The Girl with the Dragon Tattoo',
    author: 'Stieg Larsson',
    description: `A thriller about a journalist and a computer hacker who team up to solve a decades-old missing person case.`,
    price: 50.0,
    coverImageUrl: '/images/books/Girl_with_Dragon_Tattoo.jpg',
    category: ['Science Fiction', 'Thriller', 'Mystery'],
    stock: 22,
  },
];

async function seedDatabase() {
  try {
    connectToDb();

    // Clear the existing data
    await Category.deleteMany({});
    const categories = await Category.insertMany(categoriesData);
    console.log('Categories inserted...');
    // Create a map of category names to IDs
    const categoryMap = categories.reduce(
      (map: Record<string, string>, category) => {
        map[category.name] = category._id as string;
        return map;
      },
      {},
    );

    const books = bookData.map((book) => ({
      ...book,
      category: book.category?.map((name) => categoryMap[name]),
    }));

    // Clear the existing data
    await Book.deleteMany({});
    const savedBooks = await Book.insertMany(books);
    console.log('Books inserted successfully...');
    for (const cat of categories) {
      const booksInCategory = savedBooks.filter((book) =>
        book.category?.includes(cat._id as string),
      );

      const bookIds = booksInCategory.map((b) => b._id);

      await Category.updateOne(
        { _id: cat._id },
        { $push: { books: { $each: bookIds } } },
      );
    }
  } catch (error) {
    console.log(error);
  } finally {
    mongoose.disconnect();
    console.log('Disconnected from database.');
  }
}

seedDatabase();
