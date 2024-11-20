import express, { Request, Response, NextFunction } from 'express'; // Import relevant types
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url'; // Import this to work with import.meta.url

import { connectToDb } from './services/db.service.js';
import router from './routes/index.js';

// Get the directory name (replaces __dirname)
const __filename = fileURLToPath(import.meta.url); // Get the current file URL
const __dirname = path.dirname(__filename); // Get the directory path from the file URL

// Configuration
const IMAGE_DIR = path.join(__dirname, '../../public', 'images', 'books'); // Use the absolute path
console.log(IMAGE_DIR);
const app = express();

// Connect to the database
connectToDb();

// Middleware to parse JSON bodies and URL-encoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS Configuration (customize in production)
app.use(
  cors({
    origin: '*', // Allow all origins; restrict in production
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

// Serve static files (images)
app.use(express.static('public'));

// API routes
app.use(router);

// Error handling middleware with proper TypeScript types
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err.message || err);
  res.status(500).json({ message: 'Server Error', error: err.message });
});

export default app;
