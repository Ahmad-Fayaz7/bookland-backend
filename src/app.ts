import cors from 'cors';
import { connectToDb } from './services/db.service.js';
import 'express-async-errors';
import router from './routes/index.js';
import express from 'express';
import errorHandler from './middlewares/error-handling.middlewar.js';

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
    allowedHeaders: [
      'Access-Control-Allow-Headers',
      'Content-Type',
      'Authorization',
      'x-auth-token',
    ],
  }),
);

// Serve static files (images)
app.use(express.static('public'));

// API routes
app.use(router);

// Error handler middlewar
app.use(errorHandler);
export default app;
