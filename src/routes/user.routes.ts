import express from 'express';
import userController from '../controllers/user.controller.js';
import { authorize } from '../middlewares/authorization.middleware.js';
const router = express.Router();

// Get the current logged in user
router.get('/users/me', authorize, userController.me);

// Get all users
router.get('/users', userController.getAllUsers);

// Create a user
router.post('/users', userController.createUser);

// DELETE user by ID
router.delete('/users/:id', authorize, userController.deleteUser);

export default router;
