import express from 'express';
import bookController from '../controllers/book.controller.js';
const router = express.Router();

router.get('/books', bookController.getBooks);

export default router;
