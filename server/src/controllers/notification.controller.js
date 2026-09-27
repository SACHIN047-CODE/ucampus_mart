import { query } from '../db/pool.js';

/**
 * GET /api/v1/me/notifications
 * List notifications for current authenticated user
 */
export async function getNotifications(req, res, next) {
  try {
    const userId = req.user.id;

    const [rows] = await query(
      `SELECT id, type, title, message, link, is_read AS isRead, created_at AS createdAt
       FROM notifications
       WHERE recipient_id = ?
       ORDER BY created_at DESC
       LIMIT 50`,
      [userId]
    );

    res.json({
      success: true,
      data: rows.map(r => ({ ...r, isRead: Boolean(r.isRead) })),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/me/notifications/unread-count
 */
export async function getUnreadCount(req, res, next) {
  try {
    const userId = req.user.id;
    const [[result]] = await query(
      'SELECT COUNT(*) AS count FROM notifications WHERE recipient_id = ? AND is_read = FALSE',
      [userId]
    );

    res.json({
      success: true,
      data: {
        unreadCount: Number(result ? result.count : 0),
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/v1/me/notifications/:id/read
 * Mark single notification as read
 */
export async function markAsRead(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await query(
      'UPDATE notifications SET is_read = TRUE WHERE id = ? AND recipient_id = ?',
      [id, userId]
    );

    res.json({
      success: true,
      message: 'Notification marked as read.',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/me/notifications/read-all
 * Mark all notifications as read
 */
export async function markAllAsRead(req, res, next) {
  try {
    const userId = req.user.id;

    await query(
      'UPDATE notifications SET is_read = TRUE WHERE recipient_id = ? AND is_read = FALSE',
      [userId]
    );

    res.json({
      success: true,
      message: 'All notifications marked as read.',
    });
  } catch (error) {
    next(error);
  }
}
