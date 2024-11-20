import fs from 'fs';
import { Request, Response } from 'express';

// Delete file
export function deleteFile(filePath: string) {
  fs.unlink(filePath, (err) => {
    if (err) console.error(`Error deleting file: ${err.message}`);
  });
}

// Cleanup uploaded file when needed
export function cleanupUploadedFile(req: Request) {
  if (req.file) deleteFile(req.file.path);
}

// Handle errors
export function handleError(res: Response, err: Error, message: string) {
  //Console.error(`${message}: ${err.message}`);
  console.log(err.message, err);
  res.status(500).send(message);
}
