import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { z } from 'zod';
import { config } from '../config/index.js';
import { query } from '../db/pool.js';

/**
 * Generate 6-digit verification code
 */
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Generate JWT token for user
 */
function signToken(user) {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
}

/**
 * Set HTTP-only auth cookie
 */
function setAuthCookie(res, token) {
  res.cookie('token', token, {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: config.nodeEnv === 'production' ? 'none' : 'lax',
    maxAge: config.jwt.cookieMaxAge,
  });
}

/**
 * Check if email matches allowed campus domains
 */
function isAllowedCampusEmail(email) {
  const normalized = email.toLowerCase().trim();
  const domain = normalized.split('@')[1];
  if (!domain) return false;

  return config.allowedCampusDomains.some(allowed => {
    return domain === allowed || domain.endsWith('.' + allowed);
  });
}

// Validation schemas
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  department: z.string().optional(),
  hostel: z.string().optional(),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const verifyOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
  code: z.string().length(6, 'Verification code must be 6 digits'),
});

export const resendOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10, 'Invalid reset token'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().max(50).optional(),
  department: z.string().max(150).optional(),
  hostel: z.string().max(150).optional(),
  avatar: z.string().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

/**
 * POST /api/v1/auth/register
 */
export async function register(req, res, next) {
  try {
    const { name, email, password, department, hostel, phone } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    if (!isAllowedCampusEmail(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_CAMPUS_DOMAIN',
          message: `Registration requires a valid campus email (${config.allowedCampusDomains.join(', ')}).`,
        },
      });
    }

    const [existing] = await query('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        error: { code: 'EMAIL_ALREADY_EXISTS', message: 'An account with this campus email already exists.' },
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const verificationCode = generateOtp();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    const userId = 'user-' + crypto.randomUUID();

    await query(
      `INSERT INTO users (id, name, email, password_hash, role, is_verified, verification_code, verification_code_expires_at, department, hostel, phone)
       VALUES (?, ?, ?, ?, 'STUDENT', FALSE, ?, ?, ?, ?, ?)`,
      [userId, name, normalizedEmail, passwordHash, verificationCode, expiresAt, department || null, hostel || null, phone || null]
    );

    console.log(`✉️ [Campus Verification Code] Sent code '${verificationCode}' to ${normalizedEmail}`);

    res.status(201).json({
      success: true,
      message: 'Account created! Please check your campus email for the 6-digit verification code.',
      data: {
        userId,
        email: normalizedEmail,
        // Provided in development to ease testing without real SMTP server
        ...(config.isDev ? { devVerificationCode: verificationCode } : {}),
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/auth/verify-email
 */
export async function verifyEmail(req, res, next) {
  try {
    const { email, code } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const [users] = await query(
      `SELECT id, name, email, role, is_verified, verification_code, verification_code_expires_at
       FROM users WHERE email = ?`,
      [normalizedEmail]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'No account found with this email.' },
      });
    }

    const user = users[0];

    if (user.is_verified) {
      const token = signToken(user);
      setAuthCookie(res, token);
      return res.json({
        success: true,
        message: 'Account is already verified.',
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role, isVerified: true },
      });
    }

    if (!user.verification_code || user.verification_code !== code.trim()) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_CODE', message: 'Invalid verification code.' },
      });
    }

    if (new Date(user.verification_code_expires_at) < new Date()) {
      return res.status(400).json({
        success: false,
        error: { code: 'CODE_EXPIRED', message: 'Verification code has expired. Please request a new one.' },
      });
    }

    await query(
      `UPDATE users
       SET is_verified = TRUE, verified_at = NOW(), verification_code = NULL, verification_code_expires_at = NULL
       WHERE id = ?`,
      [user.id]
    );

    const token = signToken(user);
    setAuthCookie(res, token);

    res.json({
      success: true,
      message: 'Email verified successfully! Welcome to CampusMart.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: true,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/auth/resend-code
 */
export async function resendVerificationCode(req, res, next) {
  try {
    const { email } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const [users] = await query('SELECT id, is_verified FROM users WHERE email = ?', [normalizedEmail]);
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'No account found with this email.' },
      });
    }

    if (users[0].is_verified) {
      return res.status(400).json({
        success: false,
        error: { code: 'ALREADY_VERIFIED', message: 'Your account is already verified.' },
      });
    }

    const verificationCode = generateOtp();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await query(
      `UPDATE users
       SET verification_code = ?, verification_code_expires_at = ?
       WHERE id = ?`,
      [verificationCode, expiresAt, users[0].id]
    );

    console.log(`✉️ [Campus Verification Code Resend] Sent code '${verificationCode}' to ${normalizedEmail}`);

    res.json({
      success: true,
      message: 'A new 6-digit verification code has been sent to your email.',
      ...(config.isDev ? { devVerificationCode: verificationCode } : {}),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/auth/login
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const [users] = await query(
      `SELECT id, name, email, password_hash, role, is_verified, status, department, hostel, phone, avatar
       FROM users WHERE email = ?`,
      [normalizedEmail]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Incorrect email or password.' },
      });
    }

    const user = users[0];

    if (user.status === 'SUSPENDED') {
      return res.status(403).json({
        success: false,
        error: { code: 'ACCOUNT_SUSPENDED', message: 'Your account has been suspended by an administrator.' },
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Incorrect email or password.' },
      });
    }

    const token = signToken(user);
    setAuthCookie(res, token);

    res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: Boolean(user.is_verified),
        department: user.department,
        hostel: user.hostel,
        phone: user.phone,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/auth/logout
 */
export function logout(req, res) {
  res.clearCookie('token', {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: config.nodeEnv === 'production' ? 'none' : 'lax',
  });
  res.json({
    success: true,
    message: 'Logged out successfully.',
  });
}

/**
 * POST /api/v1/auth/forgot-password
 */
export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const [users] = await query('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
    if (users.length === 0) {
      // Don't reveal account existence for security
      return res.json({
        success: true,
        message: 'If an account exists with this email, password reset instructions have been generated.',
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetId = 'pw-' + crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await query(
      `INSERT INTO password_resets (id, user_id, token, expires_at)
       VALUES (?, ?, ?, ?)`,
      [resetId, users[0].id, resetToken, expiresAt]
    );

    console.log(`🔑 [Password Reset Token] Token '${resetToken}' generated for ${normalizedEmail}`);

    res.json({
      success: true,
      message: 'Password reset link has been dispatched to your email.',
      ...(config.isDev ? { devResetToken: resetToken } : {}),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/auth/reset-password
 */
export async function resetPassword(req, res, next) {
  try {
    const { token, newPassword } = req.body;

    const [resets] = await query(
      `SELECT id, user_id, expires_at, used_at FROM password_resets WHERE token = ?`,
      [token]
    );

    if (resets.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_RESET_TOKEN', message: 'Invalid or unknown reset token.' },
      });
    }

    const reset = resets[0];
    if (reset.used_at) {
      return res.status(400).json({
        success: false,
        error: { code: 'TOKEN_ALREADY_USED', message: 'This reset token has already been used.' },
      });
    }

    if (new Date(reset.expires_at) < new Date()) {
      return res.status(400).json({
        success: false,
        error: { code: 'TOKEN_EXPIRED', message: 'This reset token has expired. Please request a new one.' },
      });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await query('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, reset.user_id]);
    await query('UPDATE password_resets SET used_at = NOW() WHERE id = ?', [reset.id]);

    res.json({
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/auth/me
 */
export async function getMe(req, res, next) {
  try {
    const userId = req.user.id;

    // Get user stats
    const [[stats]] = await query(
      `SELECT
        (SELECT COUNT(*) FROM listings WHERE seller_id = ? AND status = 'ACTIVE') AS activeListings,
        (SELECT COUNT(*) FROM listings WHERE seller_id = ? AND status = 'SOLD') AS soldListings,
        (SELECT COUNT(*) FROM wishlist WHERE user_id = ?) AS savedItems,
        (SELECT COUNT(*) FROM notifications WHERE recipient_id = ? AND is_read = FALSE) AS unreadNotifications
       FROM DUAL`,
      [userId, userId, userId, userId]
    );

    res.json({
      success: true,
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        isVerified: Boolean(req.user.is_verified),
        status: req.user.status,
        department: req.user.department,
        hostel: req.user.hostel,
        phone: req.user.phone,
        avatar: req.user.avatar,
        stats: {
          activeListings: stats ? Number(stats.activeListings) : 0,
          soldListings: stats ? Number(stats.soldListings) : 0,
          savedItems: stats ? Number(stats.savedItems) : 0,
          unreadNotifications: stats ? Number(stats.unreadNotifications) : 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/v1/auth/me
 */
export async function updateProfile(req, res, next) {
  try {
    const userId = req.user.id;
    const { name, phone, department, hostel, avatar } = req.body;

    const updates = [];
    const params = [];

    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      params.push(phone);
    }
    if (department !== undefined) {
      updates.push('department = ?');
      params.push(department);
    }
    if (hostel !== undefined) {
      updates.push('hostel = ?');
      params.push(hostel);
    }
    if (avatar !== undefined) {
      updates.push('avatar = ?');
      params.push(avatar);
    }

    if (updates.length > 0) {
      params.push(userId);
      await query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    const [rows] = await query(
      'SELECT id, name, email, role, is_verified, department, hostel, phone, avatar FROM users WHERE id = ?',
      [userId]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: rows[0].id,
        name: rows[0].name,
        email: rows[0].email,
        role: rows[0].role,
        isVerified: Boolean(rows[0].is_verified),
        department: rows[0].department,
        hostel: rows[0].hostel,
        phone: rows[0].phone,
        avatar: rows[0].avatar,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/auth/change-password
 */
export async function changePassword(req, res, next) {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    const [rows] = await query('SELECT password_hash FROM users WHERE id = ?', [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });
    }

    const isMatch = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_CURRENT_PASSWORD', message: 'Current password does not match.' },
      });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, userId]);

    res.json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (error) {
    next(error);
  }
}
