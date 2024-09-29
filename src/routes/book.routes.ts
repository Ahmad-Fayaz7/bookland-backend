import express from 'express';
import bookController from '../controllers/book.controller.js';
import { authorize } from '../middlewares/authorization.middleware.js';
const router = express.Router();

router.get('/books', authorize, bookController.getBooks);

export default router;
