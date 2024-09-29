import jwt, { JwtPayload } from 'jsonwebtoken';
import 'dotenv/config';
import { Request, Response, NextFunction } from 'express';

// Ensure that JWT_SECRET exists and provide a fallback type for jwtKey
// eslint-disable-next-line no-undef
const jwtKey = process.env.JWT_SECRET as string;

if (!jwtKey) {
  throw new Error('JWT_SECRET is not defined in environment variables.');
}

// Extend the Request interface to include the user property
declare module 'express' {
  export interface Request {
    user?: string | JwtPayload;
  }
}

export function authorize(req: Request, res: Response, next: NextFunction) {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).send('Access denied, no token provided.');

  try {
    const decoded = jwt.verify(token, jwtKey) as string | JwtPayload; // Returns the token payload
    req.user = decoded; // Save the decoded token (user info) in req.user
    next(); // Continue to the next middleware
  } catch (err) {
    console.log(err);
    res.status(400).send('Invalid token.');
  }
}
