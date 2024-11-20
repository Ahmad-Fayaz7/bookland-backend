import multer from 'multer';
import path from 'path';

// Configuration
// Const IMAGE_DIR = './public/images/books/';
// Const PUBLIC_IMAGE_PATH = '/public/images/books/';

// Configure where to store files and how to name them
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const directory = './public/images/default/';

    cb(null, directory); // Specify the folder to store the files
  },
  filename: function (req, file, cb) {
    // Name files with a timestamp
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  },
});

// Initialize multer with the storage configuration
export const upload = multer({ storage: storage });
