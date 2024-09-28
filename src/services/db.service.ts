import mongoose from 'mongoose';
const db = 'mongodb://localhost/bookland';

export function connectToDb() {
  mongoose
    .connect(db)
    .then(() => console.log('Connected to mongodb'))
    .catch(() => console.log('Could not connect to mongodb'));
}
