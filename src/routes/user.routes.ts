import express from 'express';
import userController from '../controllers/user.controller.js';
import { authorize } from '../middlewares/authorization.middleware.js';
const router = express.Router();

router.get('/users', userController.getAllUsers);
router.post('/users', userController.createUser);
// DELETE user by ID
router.delete('/users/:id', authorize, userController.deleteUser);
export default router;
