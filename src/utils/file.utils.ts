import fs from 'fs';
import path from 'path';
import { Request, Response } from 'express';
import { fileURLToPath } from 'url';

// Define __dirname manually for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BOOKS_IMAGE_PATH = '/images/books/';

// Returns a full url for cover image (we need full url to delete an image)
export function getFilePath(coverImageUrl: string) {
  const filePath = path.join(
    __dirname,
    '../../public',
    BOOKS_IMAGE_PATH,
    getFileName(coverImageUrl),
  );
  return filePath;
}

// Extracts filename from a file path
export const getFileName = (filePath: string): string => {
  // Normalize slashes to handle both Windows (`\`) and Unix (`/`) paths
  const normalizedPath = filePath.replace(/\\/g, '/');

  // Extract the filename using `split`
  return normalizedPath.split('/').pop() || '';
};

// Delete file
export function deleteFile(filePath: string) {
  fs.unlink(filePath, (err) => {
    if (err) console.error(`Error deleting file: ${err.message}`);
  });
}

// Removes uploaded file when needed
export function removeUploadedFile(req: Request) {
  if (req.file) deleteFile(req.file.path);
}

// Handle errors
/* export function handleError(res: Response, err: Error, message: string) {
  //Console.error(`${message}: ${err.message}`);
  console.log(err.message, err);
  res.status(500).send(message);
} */
