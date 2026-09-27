import crypto from 'crypto';
import { z } from 'zod';
import { query, withTransaction } from '../db/pool.js';

export const resolveReportSchema = z.object({
  status: z.enum(['RESOLVED', 'DISMISSED']),
  resolutionNote: z.string().min(3, 'Resolution note is required').max(500),
  actionTaken: z.string().optional(),
});

export const updateUserStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'SUSPENDED']),
  reason: z.string().min(3, 'Reason is required').max(300),
});

export const moderateListingSchema = z.object({
  status: z.enum(['ACTIVE', 'HIDDEN', 'SOLD', 'ARCHIVED']).optional(),
  moderationState: z.enum(['APPROVED', 'PENDING_REVIEW', 'REJECTED']),
  reason: z.string().min(3, 'Reason is required').max(300),
});

/**
 * GET /api/v1/admin/metrics
 * Aggregate counts and system health metrics
 */
export async function getMetrics(req, res, next) {
  try {
    const [[userMetrics]] = await query(`
      SELECT
        COUNT(*) AS totalUsers,
        SUM(CASE WHEN is_verified = TRUE THEN 1 ELSE 0 END) AS verifiedUsers,
        SUM(CASE WHEN status = 'SUSPENDED' THEN 1 ELSE 0 END) AS suspendedUsers
      FROM users
    `);

    const [[listingMetrics]] = await query(`
      SELECT
        COUNT(*) AS totalListings,
        SUM(CASE WHEN status = 'ACTIVE' AND moderation_state = 'APPROVED' THEN 1 ELSE 0 END) AS activeListings,
        SUM(CASE WHEN status = 'SOLD' THEN 1 ELSE 0 END) AS soldListings,
        SUM(CASE WHEN status = 'ARCHIVED' THEN 1 ELSE 0 END) AS archivedListings,
        SUM(CASE WHEN status = 'HIDDEN' OR moderation_state = 'REJECTED' THEN 1 ELSE 0 END) AS hiddenListings
      FROM listings
    `);

    const [[reportMetrics]] = await query(`
      SELECT
        COUNT(*) AS totalReports,
        SUM(CASE WHEN status = 'OPEN' THEN 1 ELSE 0 END) AS openReports,
        SUM(CASE WHEN status = 'RESOLVED' THEN 1 ELSE 0 END) AS resolvedReports
      FROM reports
    `);

    const [categoryMetrics] = await query(`
      SELECT c.name, COUNT(l.id) AS listingCount
      FROM categories c
      LEFT JOIN listings l ON c.id = l.category_id AND l.status = 'ACTIVE'
      GROUP BY c.id, c.name
      ORDER BY listingCount DESC
    `);

    res.json({
      success: true,
      data: {
        users: {
          total: Number(userMetrics ? userMetrics.totalUsers : 0),
          verified: Number(userMetrics ? userMetrics.verifiedUsers : 0),
          suspended: Number(userMetrics ? userMetrics.suspendedUsers : 0),
        },
        listings: {
          total: Number(listingMetrics ? listingMetrics.totalListings : 0),
          active: Number(listingMetrics ? listingMetrics.activeListings : 0),
          sold: Number(listingMetrics ? listingMetrics.soldListings : 0),
          archived: Number(listingMetrics ? listingMetrics.archivedListings : 0),
          hidden: Number(listingMetrics ? listingMetrics.hiddenListings : 0),
        },
        reports: {
          total: Number(reportMetrics ? reportMetrics.totalReports : 0),
          open: Number(reportMetrics ? reportMetrics.openReports : 0),
          resolved: Number(reportMetrics ? reportMetrics.resolvedReports : 0),
        },
        categories: categoryMetrics.map(c => ({ name: c.name, count: Number(c.listingCount) })),
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/admin/reports
 * List all filed reports with status filter
 */
export async function getReports(req, res, next) {
  try {
    const { status = 'ALL' } = req.query;

    const conditions = [];
    const params = [];

    if (status !== 'ALL') {
      conditions.push('r.status = ?');
      params.push(status.toUpperCase());
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const [rows] = await query(
      `SELECT
        r.id, r.target_type AS targetType, r.target_listing_id AS targetListingId,
        r.target_user_id AS targetUserId, r.reason, r.details, r.status,
        r.resolution_note AS resolutionNote, r.created_at AS createdAt, r.resolved_at AS resolvedAt,
        u_rep.name AS reporterName, u_rep.email AS reporterEmail,
        l.title AS targetListingTitle, l.status AS targetListingStatus,
        u_target.name AS targetUserName, u_target.email AS targetUserEmail,
        u_mod.name AS moderatorName
       FROM reports r
       JOIN users u_rep ON r.reporter_id = u_rep.id
       LEFT JOIN listings l ON r.target_listing_id = l.id
       LEFT JOIN users u_target ON r.target_user_id = u_target.id
       LEFT JOIN users u_mod ON r.moderator_id = u_mod.id
       ${whereClause}
       ORDER BY CASE WHEN r.status = 'OPEN' THEN 0 ELSE 1 END, r.created_at DESC`,
      params
    );

    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/v1/admin/reports/:id
 * Resolve or dismiss a report and log audit trail
 */
export async function resolveReport(req, res, next) {
  try {
    const adminId = req.user.id;
    const { id } = req.params;
    const { status, resolutionNote, actionTaken } = req.body;

    const [reports] = await query('SELECT id, target_type, target_listing_id, target_user_id FROM reports WHERE id = ?', [id]);
    if (reports.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Report not found.' } });
    }

    const rep = reports[0];

    await withTransaction(async (conn) => {
      await conn.query(
        `UPDATE reports
         SET status = ?, resolution_note = ?, moderator_id = ?, resolved_at = NOW()
         WHERE id = ?`,
        [status, resolutionNote, adminId, id]
      );

      // Record audit entry
      const auditId = 'audit-' + crypto.randomUUID();
      await conn.query(
        `INSERT INTO moderation_audits (id, admin_id, action, target_type, target_id, reason)
         VALUES (?, ?, ?, 'REPORT', ?, ?)`,
        [auditId, adminId, actionTaken || `REPORT_${status}`, id, resolutionNote]
      );
    });

    res.json({
      success: true,
      message: `Report marked as ${status}.`,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/admin/users
 * Search and browse users
 */
export async function getUsers(req, res, next) {
  try {
    const { q, role, status, page = '1', limit = '20' } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    const params = [];

    if (q && q.trim()) {
      conditions.push('(name LIKE ? OR email LIKE ?)');
      params.push(`%${q.trim()}%`, `%${q.trim()}%`);
    }

    if (role && role !== 'ALL') {
      conditions.push('role = ?');
      params.push(role.toUpperCase());
    }

    if (status && status !== 'ALL') {
      conditions.push('status = ?');
      params.push(status.toUpperCase());
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*) AS total FROM users ${whereClause}`;
    const [[countResult]] = await query(countSql, params);
    const total = Number(countResult ? countResult.total : 0);

    const [rows] = await query(
      `SELECT
        id, name, email, role, is_verified AS isVerified, status,
        department, hostel, phone, created_at AS createdAt,
        (SELECT COUNT(*) FROM listings WHERE seller_id = users.id) AS listingCount
       FROM users
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limitNum, offset]
    );

    res.json({
      success: true,
      data: {
        users: rows.map(r => ({ ...r, isVerified: Boolean(r.isVerified), listingCount: Number(r.listingCount) })),
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum) || 1,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/v1/admin/users/:id/status
 * Suspend or reactivate user account
 */
export async function updateUserStatus(req, res, next) {
  try {
    const adminId = req.user.id;
    const { id } = req.params;
    const { status, reason } = req.body;

    if (id === adminId) {
      return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'You cannot alter your own admin status.' } });
    }

    const [users] = await query('SELECT id, name, email FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found.' } });
    }

    await withTransaction(async (conn) => {
      await conn.query('UPDATE users SET status = ? WHERE id = ?', [status, id]);

      // Record audit
      const auditId = 'audit-' + crypto.randomUUID();
      await conn.query(
        `INSERT INTO moderation_audits (id, admin_id, action, target_type, target_id, reason)
         VALUES (?, ?, ?, 'USER', ?, ?)`,
        [auditId, adminId, status === 'SUSPENDED' ? 'SUSPEND_USER' : 'ACTIVATE_USER', id, reason]
      );
    });

    res.json({
      success: true,
      message: `User status changed to ${status}.`,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/admin/listings
 * Browse all listings including hidden/rejected
 */
export async function getAllListings(req, res, next) {
  try {
    const { q, status, page = '1', limit = '20' } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    const params = [];

    if (q && q.trim()) {
      conditions.push('(l.title LIKE ? OR l.description LIKE ?)');
      params.push(`%${q.trim()}%`, `%${q.trim()}%`);
    }

    if (status && status !== 'ALL') {
      conditions.push('l.status = ?');
      params.push(status.toUpperCase());
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*) AS total FROM listings l ${whereClause}`;
    const [[countResult]] = await query(countSql, params);
    const total = Number(countResult ? countResult.total : 0);

    const [rows] = await query(
      `SELECT
        l.id, l.title, l.price, l.condition, l.status, l.moderation_state AS moderationState,
        l.view_count AS viewCount, l.created_at AS createdAt,
        c.name AS categoryName, u.name AS sellerName, u.email AS sellerEmail
       FROM listings l
       JOIN categories c ON l.category_id = c.id
       JOIN users u ON l.seller_id = u.id
       ${whereClause}
       ORDER BY l.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limitNum, offset]
    );

    res.json({
      success: true,
      data: {
        listings: rows,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum) || 1,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/v1/admin/listings/:id/moderate
 * Moderation actions: hide, restore, reject listing
 */
export async function moderateListing(req, res, next) {
  try {
    const adminId = req.user.id;
    const { id } = req.params;
    const { status, moderationState, reason } = req.body;

    const [rows] = await query('SELECT seller_id, title FROM listings WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Listing not found.' } });
    }

    const listing = rows[0];

    await withTransaction(async (conn) => {
      const updates = ['moderation_state = ?'];
      const params = [moderationState];

      if (status) {
        updates.push('status = ?');
        params.push(status);
      }

      params.push(id);
      await conn.query(`UPDATE listings SET ${updates.join(', ')} WHERE id = ?`, params);

      // Audit entry
      const auditId = 'audit-' + crypto.randomUUID();
      await conn.query(
        `INSERT INTO moderation_audits (id, admin_id, action, target_type, target_id, reason)
         VALUES (?, ?, ?, 'LISTING', ?, ?)`,
        [auditId, adminId, `MODERATE_${moderationState}`, id, reason]
      );

      // Notify seller
      const notifId = 'notif-' + crypto.randomUUID();
      await conn.query(
        `INSERT INTO notifications (id, recipient_id, type, title, message, link)
         VALUES (?, ?, 'MODERATION', 'Moderation Update', ?, ?)`,
        [
          notifId,
          listing.seller_id,
          `Your listing "${listing.title}" moderation state was updated to ${moderationState}. Reason: ${reason}`,
          `/product/${id}`,
        ]
      );
    });

    res.json({
      success: true,
      message: `Listing moderation status updated to ${moderationState}.`,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/admin/audits
 * Retrieve moderation audit log history
 */
export async function getAudits(req, res, next) {
  try {
    const [rows] = await query(
      `SELECT
        a.id, a.action, a.target_type AS targetType, a.target_id AS targetId,
        a.reason, a.created_at AS createdAt,
        u.name AS adminName, u.email AS adminEmail
       FROM moderation_audits a
       JOIN users u ON a.admin_id = u.id
       ORDER BY a.created_at DESC
       LIMIT 100`
    );

    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    next(error);
  }
}
