import express from 'express';
import cors from 'cors';
import { connectToDb } from './services/db.service.js';
import router from './routes/index.js';
const app = express();
// To parse JSON bodies
app.use(express.json());

// To parse URL-encoded bodies (for form submissions)
app.use(express.urlencoded({ extended: true }));

connectToDb();
app.use(cors());
app.use(router);
export default app;
