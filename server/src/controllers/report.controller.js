import crypto from 'crypto';
import { z } from 'zod';
import { query } from '../db/pool.js';

export const createReportSchema = z.object({
  targetType: z.enum(['LISTING', 'USER']),
  targetListingId: z.string().optional(),
  targetUserId: z.string().optional(),
  reason: z.string().min(3, 'Reason is required').max(150),
  details: z.string().max(1000).optional(),
}).refine(data => {
  if (data.targetType === 'LISTING' && !data.targetListingId) return false;
  if (data.targetType === 'USER' && !data.targetUserId) return false;
  return true;
}, {
  message: 'Appropriate target ID must be specified for the target type',
});

/**
 * POST /api/v1/reports
 * Submit a report against a listing or a user
 */
export async function createReport(req, res, next) {
  try {
    const reporterId = req.user.id;
    const { targetType, targetListingId, targetUserId, reason, details } = req.body;

    // Prevent reporting oneself
    if (targetType === 'USER' && targetUserId === reporterId) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_TARGET', message: 'You cannot report your own account.' },
      });
    }

    if (targetType === 'LISTING') {
      const [listingRows] = await query('SELECT seller_id, title FROM listings WHERE id = ?', [targetListingId]);
      if (listingRows.length === 0) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Target listing not found.' } });
      }
      if (listingRows[0].seller_id === reporterId) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_TARGET', message: 'You cannot report your own listing.' },
        });
      }

      // Check for duplicate open reports
      const [existing] = await query(
        `SELECT id FROM reports
         WHERE reporter_id = ? AND target_type = 'LISTING' AND target_listing_id = ? AND status = 'OPEN'`,
        [reporterId, targetListingId]
      );
      if (existing.length > 0) {
        return res.status(409).json({
          success: false,
          error: { code: 'DUPLICATE_REPORT', message: 'You already have an open report pending review for this listing.' },
        });
      }
    } else {
      const [userRows] = await query('SELECT id FROM users WHERE id = ?', [targetUserId]);
      if (userRows.length === 0) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Target user not found.' } });
      }

      const [existing] = await query(
        `SELECT id FROM reports
         WHERE reporter_id = ? AND target_type = 'USER' AND target_user_id = ? AND status = 'OPEN'`,
        [reporterId, targetUserId]
      );
      if (existing.length > 0) {
        return res.status(409).json({
          success: false,
          error: { code: 'DUPLICATE_REPORT', message: 'You already have an open report pending review for this user.' },
        });
      }
    }

    const reportId = 'rep-' + crypto.randomUUID();

    await query(
      `INSERT INTO reports (id, reporter_id, target_type, target_listing_id, target_user_id, reason, details, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'OPEN')`,
      [reportId, reporterId, targetType, targetListingId || null, targetUserId || null, reason, details || null]
    );

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully. Our campus moderation team will review it shortly.',
      data: {
        reportId,
      },
    });
  } catch (error) {
    next(error);
  }
}
