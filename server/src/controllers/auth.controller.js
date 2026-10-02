import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { z } from 'zod';
import { OAuth2Client } from 'google-auth-library';
import { config } from '../config/index.js';
import { query } from '../db/pool.js';
import { sendOtpEmail } from '../utils/mailer.js';

const googleClient = new OAuth2Client(config.googleClientId);

/**
 * Helper to generate user avatar initials:
 * - Single word ("Krishna") -> "K"
 * - Multi-word ("Krishna Kirola") -> "KK" (first + surname)
 * - Three words ("Krishna Kumar Kirola") -> "KK"
 */
function getInitials(name, email = '') {
  const cleanName = (typeof name === 'string' ? name : '').trim();
  if (cleanName) {
    const spaceParts = cleanName.split(/\s+/).filter(Boolean);
    if (spaceParts.length >= 2) {
      const first = spaceParts[0].replace(/[^a-zA-Z0-9]/g, '');
      const last = spaceParts[spaceParts.length - 1].replace(/[^a-zA-Z0-9]/g, '');
      const firstChar = first ? first.charAt(0).toUpperCase() : spaceParts[0].charAt(0).toUpperCase();
      const lastChar = last ? last.charAt(0).toUpperCase() : spaceParts[spaceParts.length - 1].charAt(0).toUpperCase();
      return `${firstChar}${lastChar}`;
    }

    const dotParts = cleanName.split(/[._-]+/).filter(Boolean);
    if (dotParts.length >= 2) {
      const first = dotParts[0].replace(/[^a-zA-Z0-9]/g, '');
      const last = dotParts[dotParts.length - 1].replace(/[^a-zA-Z0-9]/g, '');
      const firstChar = first ? first.charAt(0).toUpperCase() : dotParts[0].charAt(0).toUpperCase();
      const lastChar = last ? last.charAt(0).toUpperCase() : dotParts[dotParts.length - 1].charAt(0).toUpperCase();
      return `${firstChar}${lastChar}`;
    }

    const single = cleanName.replace(/[^a-zA-Z0-9]/g, '') || cleanName;
    return single.charAt(0).toUpperCase() || 'U';
  }

  const cleanEmail = (typeof email === 'string' ? email : '').trim();
  if (cleanEmail) {
    const prefix = cleanEmail.split('@')[0].trim();
    const parts = prefix.split(/[._-]+/).filter(Boolean);
    if (parts.length >= 2) {
      const first = parts[0].replace(/[^a-zA-Z0-9]/g, '');
      const last = parts[parts.length - 1].replace(/[^a-zA-Z0-9]/g, '');
      const firstChar = first ? first.charAt(0).toUpperCase() : parts[0].charAt(0).toUpperCase();
      const lastChar = last ? last.charAt(0).toUpperCase() : parts[parts.length - 1].charAt(0).toUpperCase();
      return `${firstChar}${lastChar}`;
    }
    if (parts.length === 1 && parts[0].length > 0) {
      const single = parts[0].replace(/[^a-zA-Z0-9]/g, '') || parts[0];
      return single.charAt(0).toUpperCase() || 'U';
    }
  }

  return 'U';
}

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

function isChitkaraEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return email.trim().toLowerCase().endsWith('@chitkara.edu.in');
}

function withCampusFlag(userPayload, email) {
  return {
    ...userPayload,
    isCampusVerified: isChitkaraEmail(email),
  };
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

    // Send verification OTP email via Nodemailer asynchronously
    sendOtpEmail({
      to: normalizedEmail,
      name,
      code: verificationCode,
      purpose: 'verification',
    }).catch(err => console.error('Background email dispatch error:', err?.message || err));

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

    // Check if code was generated and matches
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
      user: withCampusFlag({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: true,
        initials: getInitials(user.name, user.email),
      }, user.email),
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

    sendOtpEmail({
      to: normalizedEmail,
      name: users[0].name || 'Student',
      code: verificationCode,
      purpose: 'verification',
    }).catch(err => console.error('Background email dispatch error:', err?.message || err));

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

    // Generate login OTP
    const verificationCode = generateOtp();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await query(
      `UPDATE users
       SET verification_code = ?, verification_code_expires_at = ?
       WHERE id = ?`,
      [verificationCode, expiresAt, user.id]
    );

    // Send OTP email asynchronously
    sendOtpEmail({
      to: normalizedEmail,
      name: user.name,
      code: verificationCode,
      purpose: 'login',
    }).catch(err => console.error('Background email dispatch error:', err?.message || err));

    res.json({
      success: true,
      requiresOtp: true,
      email: normalizedEmail,
      message: 'Login verification code sent to your campus email.',
      ...(config.isDev ? { devVerificationCode: verificationCode } : {}),
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
      user: withCampusFlag({
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
        initials: getInitials(req.user.name, req.user.email),
        stats: {
          activeListings: stats ? Number(stats.activeListings) : 0,
          soldListings: stats ? Number(stats.soldListings) : 0,
          savedItems: stats ? Number(stats.savedItems) : 0,
          unreadNotifications: stats ? Number(stats.unreadNotifications) : 0,
        },
      }, req.user.email),
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
      user: withCampusFlag({
        id: rows[0].id,
        name: rows[0].name,
        email: rows[0].email,
        role: rows[0].role,
        isVerified: Boolean(rows[0].is_verified),
        department: rows[0].department,
        hostel: rows[0].hostel,
        phone: rows[0].phone,
        avatar: rows[0].avatar,
        initials: getInitials(rows[0].name, rows[0].email),
      }, rows[0].email),
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

/**
 * POST /api/v1/auth/google
 */
export async function googleAuth(req, res, next) {
  try {
    const { credential, mode = 'any' } = req.body;
    if (!credential) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_CREDENTIAL', message: 'Google credential token is required' },
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: config.googleClientId,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_TOKEN', message: 'Invalid Google token payload' },
      });
    }

    const email = payload.email.toLowerCase().trim();
    const name = payload.name || email.split('@')[0];
    const picture = payload.picture || null;

    const [existing] = await query('SELECT * FROM users WHERE email = ?', [email]);
    let user;

    if (existing.length === 0) {
      // If user came from Login screen, do NOT silently create account!
      if (mode === 'login') {
        return res.status(404).json({
          success: false,
          error: {
            code: 'ACCOUNT_NOT_FOUND',
            message: 'No account found with this Google email. Please create an account first.',
          },
        });
      }

      const userId = 'user-' + crypto.randomUUID();
      const tempHash = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10);

      await query(
        `INSERT INTO users (id, name, email, password_hash, role, is_verified, verified_at, avatar, status)
         VALUES (?, ?, ?, ?, 'STUDENT', TRUE, NOW(), ?, 'ACTIVE')`,
        [userId, name, email, tempHash, picture]
      );

      const [newUser] = await query('SELECT * FROM users WHERE id = ?', [userId]);
      user = newUser[0];
    } else {
      user = existing[0];
      if (user.status === 'SUSPENDED') {
        return res.status(403).json({
          success: false,
          error: { code: 'ACCOUNT_SUSPENDED', message: 'Your account has been suspended.' },
        });
      }

      // Update avatar if missing or if verified was false
      if (!user.is_verified || (!user.avatar && picture)) {
        await query(
          'UPDATE users SET is_verified = TRUE, verified_at = COALESCE(verified_at, NOW()), avatar = COALESCE(avatar, ?) WHERE id = ?',
          [picture, user.id]
        );
        user.is_verified = 1;
        if (!user.avatar) user.avatar = picture;
      }
    }

    const token = signToken(user);
    setAuthCookie(res, token);

    res.json({
      success: true,
      message: 'Google login successful',
      token,
      user: withCampusFlag({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: Boolean(user.is_verified),
        department: user.department,
        hostel: user.hostel,
        phone: user.phone,
        avatar: user.avatar,
        initials: getInitials(user.name, user.email),
      }, user.email),
    });
  } catch (error) {
    next(error);
  }
}

