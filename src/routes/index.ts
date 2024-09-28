import express from 'express';
import bookRoutes from './book.routes.js';
const router = express.Router();
router.use('/api', bookRoutes);
export default router;
