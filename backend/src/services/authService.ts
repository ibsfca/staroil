import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import logger from '../utils/logger';

interface TokenPayload {
  id: string;
  email: string;
  role: string;
}

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access-secret-key-change-in-production';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh-secret-key-change-in-production';

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string, rounds: number = 12): Promise<string> {
  return bcrypt.hash(password, rounds);
}

/**
 * Compare password with hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    logger.error('Password comparison error', { error });
    return false;
  }
}

/**
 * Generate JWT tokens (access and refresh)
 */
export function generateTokens(payload: TokenPayload): TokenResponse {
  try {
    const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
      expiresIn: '8h',
      algorithm: 'HS256',
    });

    const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, {
      expiresIn: '7d',
      algorithm: 'HS256',
    });

    return { accessToken, refreshToken };
  } catch (error) {
    logger.error('Token generation error', { error });
    throw error;
  }
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string, secret: string = ACCESS_TOKEN_SECRET): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, secret) as TokenPayload;
    return decoded;
  } catch (error) {
    logger.error('Token verification error', { error });
    return null;
  }
}

/**
 * Decode JWT token without verification (for inspection)
 */
export function decodeToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.decode(token) as TokenPayload;
    return decoded;
  } catch (error) {
    logger.error('Token decode error', { error });
    return null;
  }
}
