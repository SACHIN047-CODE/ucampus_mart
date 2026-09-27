import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { query } from '../db/pool.js';

/**
 * Extract token from Cookie or Authorization header
 */
function extractToken(req) {
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

/**
 * Middleware: Require Authentication
 */
export async function requireAuth(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required. Please log in.' },
      });
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    const [users] = await query(
      'SELECT id, name, email, role, is_verified, status, department, hostel, phone, avatar FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User account no longer exists.' },
      });
    }

    const user = users[0];
    if (user.status === 'SUSPENDED') {
      return res.status(403).json({
        success: false,
        error: { code: 'ACCOUNT_SUSPENDED', message: 'Your account has been suspended by an administrator.' },
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: { code: 'TOKEN_EXPIRED', message: 'Session expired. Please log in again.' },
      });
    }
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Invalid authentication token.' },
    });
  }
}

/**
 * Middleware: Require Verified Student Email
 */
export function requireVerified(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required.' },
    });
  }

  if (!req.user.is_verified && req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      error: { code: 'EMAIL_NOT_VERIFIED', message: 'Please verify your campus email before continuing.' },
    });
  }

  next();
}

/**
 * Middleware: Require Administrator Role
 */
export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required.' },
    });
  }

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Administrator privileges required.' },
    });
  }

  next();
}

/**
 * Middleware: Optional Authentication (attaches req.user if token is present and valid)
 */
export async function optionalAuth(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    const [users] = await query(
      'SELECT id, name, email, role, is_verified, status, department, hostel, phone, avatar FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (users.length > 0 && users[0].status !== 'SUSPENDED') {
      req.user = users[0];
    }
  } catch {
    // Ignore invalid optional token
  }
  next();
}
