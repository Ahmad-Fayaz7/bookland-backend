import express from 'express';
import cors from 'cors';
import { connectToDb } from './services/db.service.js';
import router from './routes/index.js';
const app = express();

connectToDb();
app.use(cors());
app.use(router);
export default app;
