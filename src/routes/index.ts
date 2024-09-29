import express from 'express';
import bookRoutes from './book.routes.js';
import userRoutes from './user.routes.js';
import authenticationRoutes from './authentication.routes.js';
const router = express.Router();
router.use('/api', bookRoutes);
router.use('/api', userRoutes);
router.use('/api', authenticationRoutes);
export default router;
