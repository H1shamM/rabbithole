/**
 * @fileoverview JWT authentication middleware.
 */

import * as express from "express";
import jwt from "jsonwebtoken";
import { settings } from "../config/settings.js";

/**
 * Request object extended with authenticated user ID.
 */
export interface AuthenticatedRequest extends express.Request {
  user_id?: string;
}

/**
 * Expected JWT payload structure.
 */
interface JwtPayload {
  id: string;
}

/**
 * Middleware to authenticate JWT tokens in the Authorization header.
 * @param {AuthenticatedRequest} req - The request object.
 * @param {express.Response} res - The response object.
 * @param {express.NextFunction} next - The next middleware function.
 */
export const authenticateJWT = (
  req: AuthenticatedRequest,
  res: express.Response,
  next: express.NextFunction,
): void => {
  const authHeader = req.headers.authorization;

  if (settings.env === "development") {
    // For dev, try to get or create a dev user by email, then use its ID
    // For simplicity, we'll just use a fixed ID and ensure the user exists in DB.
    // But we'll rely on ensureDevAuth in frontend to create it.
    req.user_id = "dev-user-id"; // Use a consistent string
    next();
    return;
  }

  if (!authHeader) {
    res.sendStatus(401);
    return;
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    res.sendStatus(401);
    return;
  }

  const jwtSecret = settings.jwtSecret as string;
  if (!jwtSecret) {
    res.status(500).json({ error: "JWT secret not configured" });
    return;
  }

  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) {
      res.sendStatus(403);
      return;
    }

    if (decoded && typeof decoded === "object" && "id" in decoded) {
      req.user_id = (decoded as JwtPayload).id;
      next();
    } else {
      res.sendStatus(403);
    }
  });
};
