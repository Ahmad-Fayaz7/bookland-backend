import jwt, { JwtPayload } from 'jsonwebtoken';
import 'dotenv/config';
import { Request, Response, NextFunction } from 'express';
import { UserPayload } from '../types/user.types.js';

// Ensure that JWT_SECRET exists and provide a fallback type for jwtKey
// eslint-disable-next-line no-undef
const jwtKey = process.env.JWT_SECRET as string;

if (!jwtKey) {
  throw new Error('JWT_SECRET is not defined in environment variables.');
}

// Extend the Request interface to include the user property
declare module 'express' {
  export interface Request {
    user?: UserPayload | JwtPayload;
  }
}

export function authorize(req: Request, res: Response, next: NextFunction) {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).send('Access denied, no token provided.');
  try {
    const decoded = jwt.verify(token, jwtKey) as JwtPayload & UserPayload; // Returns the token payload
    req.user = decoded;
    // Save the decoded token (user info) in req.user
    if (decoded && decoded._id && decoded.email && decoded.role) {
      req.user = {
        _id: decoded._id,
        email: decoded.email,
        role: decoded.role,
      };
    } else {
      throw new Error('Invalid token payload.');
    }
    next(); // Continue to the next middleware
  } catch (err) {
    console.log(err);
    res.status(400).send('Invalid token.');
  }
}
