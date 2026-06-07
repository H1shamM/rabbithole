/**
 * @fileoverview Configuration settings for the application.
 */

/**
 * Application settings interface.
 */
export interface AppSettings {
  /** The port the application runs on. */
  port: number;
  /** The path to the SQLite database. */
  dbPath: string;
  /** The environment mode (development, production, etc.). */
  env: string;
  /** JWT secret for authentication. */
  jwtSecret: string;
  /** Default user ID used when dev auth bypass is enabled. */
  devUserId: string;
  /** Google OAuth configuration. */
  google?: {
    clientId: string;
    clientSecret: string;
    callbackUrl: string;
  };
  /** GitHub OAuth configuration. */
  github?: {
    clientId: string;
    clientSecret: string;
    callbackUrl: string;
  };
}

const google = process.env.GOOGLE_CLIENT_ID ? {
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/v1/auth/google/callback',
} : undefined;

const github = process.env.GITHUB_CLIENT_ID ? {
  clientId: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
  callbackUrl: process.env.GITHUB_CALLBACK_URL || 'http://localhost:3000/api/v1/auth/github/callback',
} : undefined;

const settingsObj: AppSettings = {
  port: parseInt(process.env.PORT || '3000', 10),
  dbPath: process.env.DB_PATH || 'stumble.db',
  env: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'secret',
  devUserId: process.env.DEV_USER_ID || 'dev-user',
};

if (google) settingsObj.google = google;
if (github) settingsObj.github = github;

export const settings: AppSettings = settingsObj;
