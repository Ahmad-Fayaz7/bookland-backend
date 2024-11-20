import { Request, Response } from 'express';

/* export const setUploadDirectory = (
  req: Request,
  res: Response,
  next: Function,
) => {
  console.log('Hello world!');
  next();
}; */

export const myLogger = function (
  req: Request,
  res: Response,
  next: () => void,
) {
  console.log('LOGGED');
  next();
};
