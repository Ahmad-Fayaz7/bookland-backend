// Middleware to upload books cover image on creation

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get __dirname when using ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Navigate to the project root and set up directory path
const rootDirectory = path.join(__dirname, '../../');
const directory = path.join(rootDirectory, 'public/images/books');

// Ensure the directory exists
if (!fs.existsSync(directory)) {
  fs.mkdirSync(directory, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, directory); // Specify folder to store files
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  },
});

// Initialize multer with the storage configuration
export const upload = multer({ storage });
