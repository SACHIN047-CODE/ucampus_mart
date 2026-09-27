import crypto from 'crypto';
import { query } from '../db/pool.js';

/**
 * GET /api/v1/me/wishlist
 * Return full wishlist items for authenticated user
 */
export async function getMyWishlist(req, res, next) {
  try {
    const userId = req.user.id;

    const [rows] = await query(
      `SELECT
        w.id AS wishlistEntryId, w.created_at AS savedAt,
        l.id, l.title, l.description, l.price, l.condition, l.is_negotiable AS isNegotiable,
        l.pickup_location AS pickupLocation, l.status, l.moderation_state AS moderationState,
        c.name AS categoryName, u.name AS sellerName
       FROM wishlist w
       JOIN listings l ON w.listing_id = l.id
       JOIN categories c ON l.category_id = c.id
       JOIN users u ON l.seller_id = u.id
       WHERE w.user_id = ?
       ORDER BY w.created_at DESC`,
      [userId]
    );

    if (rows.length === 0) {
      return res.json({ success: true, data: { items: [], ids: [] } });
    }

    const listingIds = rows.map(r => r.id);
    const placeholders = listingIds.map(() => '?').join(',');

    const [images] = await query(
      `SELECT listing_id, url FROM listing_images WHERE listing_id IN (${placeholders}) ORDER BY display_order ASC`,
      listingIds
    );

    const imgMap = {};
    for (const img of images) {
      if (!imgMap[img.listing_id]) imgMap[img.listing_id] = [];
      imgMap[img.listing_id].push(img.url);
    }

    const items = rows.map(r => ({
      ...r,
      images: imgMap[r.id] || [],
      isAvailable: r.status === 'ACTIVE' && r.moderationState === 'APPROVED',
    }));

    res.json({
      success: true,
      data: {
        items,
        ids: listingIds,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT or POST /api/v1/me/wishlist/:listingId
 * Add item to wishlist (prevents duplicate)
 */
export async function addToWishlist(req, res, next) {
  try {
    const userId = req.user.id;
    const { listingId } = req.params;

    // Check if listing exists
    const [listings] = await query('SELECT id, title FROM listings WHERE id = ?', [listingId]);
    if (listings.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Listing not found.' } });
    }

    const entryId = 'wish-' + crypto.randomUUID();

    await query(
      `INSERT INTO wishlist (id, user_id, listing_id)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE created_at = CURRENT_TIMESTAMP`,
      [entryId, userId, listingId]
    );

    res.json({
      success: true,
      message: `"${listings[0].title}" added to wishlist.`,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/v1/me/wishlist/:listingId
 * Remove item from wishlist
 */
export async function removeFromWishlist(req, res, next) {
  try {
    const userId = req.user.id;
    const { listingId } = req.params;

    await query('DELETE FROM wishlist WHERE user_id = ? AND listing_id = ?', [userId, listingId]);

    res.json({
      success: true,
      message: 'Item removed from wishlist.',
    });
  } catch (error) {
    next(error);
  }
}
