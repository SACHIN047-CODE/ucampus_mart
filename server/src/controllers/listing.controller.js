import crypto from 'crypto';
import { z } from 'zod';
import { query, withTransaction } from '../db/pool.js';

// Simple in-memory cache to prevent view count spam per session/IP
const recentViews = new Map();
setInterval(() => {
  const cutoff = Date.now() - 30 * 60 * 1000; // 30 minutes
  for (const [key, timestamp] of recentViews.entries()) {
    if (timestamp < cutoff) recentViews.delete(key);
  }
}, 10 * 60 * 1000);

export const createListingSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  categoryId: z.string().min(1, 'Category is required'),
  price: z.number().int().min(0, 'Price must be 0 (free) or positive'),
  condition: z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR']),
  isNegotiable: z.boolean().default(false),
  pickupLocation: z.string().min(3, 'Pickup location is required'),
  images: z.array(z.string().url('Invalid image URL')).max(6, 'Maximum 6 images allowed').default([]),
});

export const updateListingSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().min(10).optional(),
  categoryId: z.string().min(1).optional(),
  price: z.number().int().min(0).optional(),
  condition: z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR']).optional(),
  isNegotiable: z.boolean().optional(),
  pickupLocation: z.string().min(3).optional(),
  images: z.array(z.string().url()).max(6).optional(),
});

/**
 * Helper to attach images array to listing rows
 */
async function attachImagesToListings(listings) {
  if (listings.length === 0) return listings;
  const listingIds = listings.map(l => l.id);
  const placeholders = listingIds.map(() => '?').join(',');

  const [images] = await query(
    `SELECT listing_id, url, alt_text, display_order
     FROM listing_images
     WHERE listing_id IN (${placeholders})
     ORDER BY display_order ASC`,
    listingIds
  );

  const imagesMap = {};
  for (const img of images) {
    if (!imagesMap[img.listing_id]) imagesMap[img.listing_id] = [];
    imagesMap[img.listing_id].push(img.url);
  }

  return listings.map(l => ({
    ...l,
    images: imagesMap[l.id] || [],
  }));
}

/**
 * GET /api/v1/listings
 * Browse active listings with search, category, price range, condition, location & sorting
 */
export async function getListings(req, res, next) {
  try {
    const {
      q,
      category,
      minPrice,
      maxPrice,
      condition,
      location,
      sortBy = 'newest',
      page = '1',
      limit = '12',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const offset = (pageNum - 1) * limitNum;

    const conditions = ["l.status = 'ACTIVE'", "l.moderation_state = 'APPROVED'"];
    const params = [];

    // Search query in title or description
    if (q && q.trim()) {
      conditions.push('(l.title LIKE ? OR l.description LIKE ?)');
      params.push(`%${q.trim()}%`, `%${q.trim()}%`);
    }

    // Category filter
    if (category && category !== 'all') {
      conditions.push('(l.category_id = ? OR c.slug = ?)');
      params.push(category, category);
    }

    // Price range filters
    if (minPrice !== undefined && minPrice !== '') {
      conditions.push('l.price >= ?');
      params.push(parseInt(minPrice, 10) || 0);
    }
    if (maxPrice !== undefined && maxPrice !== '') {
      conditions.push('l.price <= ?');
      params.push(parseInt(maxPrice, 10) || 0);
    }

    // Condition filter
    if (condition && condition !== 'all') {
      conditions.push('l.condition = ?');
      params.push(condition.toUpperCase());
    }

    // Location filter
    if (location && location.trim()) {
      conditions.push('l.pickup_location LIKE ?');
      params.push(`%${location.trim()}%`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Sorting
    let orderBy = 'l.created_at DESC';
    if (sortBy === 'price_asc') orderBy = 'l.price ASC';
    else if (sortBy === 'price_desc') orderBy = 'l.price DESC';
    else if (sortBy === 'popular') orderBy = 'l.view_count DESC, l.created_at DESC';

    // Count total matching items
    const countSql = `
      SELECT COUNT(*) AS total
      FROM listings l
      JOIN categories c ON l.category_id = c.id
      ${whereClause}
    `;
    const [[countResult]] = await query(countSql, params);
    const total = Number(countResult ? countResult.total : 0);

    // Fetch items with pagination
    const dataSql = `
      SELECT
        l.id, l.title, l.description, l.price, l.condition, l.is_negotiable AS isNegotiable,
        l.pickup_location AS pickupLocation, l.status, l.view_count AS viewCount,
        l.created_at AS createdAt, l.updated_at AS updatedAt,
        c.id AS categoryId, c.name AS categoryName, c.slug AS categorySlug, c.icon AS categoryIcon,
        u.id AS sellerId, u.name AS sellerName, u.department AS sellerDepartment,
        u.hostel AS sellerHostel, u.avatar AS sellerAvatar
      FROM listings l
      JOIN categories c ON l.category_id = c.id
      JOIN users u ON l.seller_id = u.id
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;

    const [rows] = await query(dataSql, [...params, limitNum, offset]);
    const items = await attachImagesToListings(rows);

    res.json({
      success: true,
      data: {
        items,
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
 * GET /api/v1/listings/:id
 * Retrieve details of a single product and track views
 */
export async function getListingById(req, res, next) {
  try {
    const { id } = req.params;

    const [rows] = await query(
      `SELECT
        l.id, l.title, l.description, l.price, l.condition, l.is_negotiable AS isNegotiable,
        l.pickup_location AS pickupLocation, l.status, l.moderation_state AS moderationState,
        l.view_count AS viewCount, l.created_at AS createdAt, l.updated_at AS updatedAt,
        c.id AS categoryId, c.name AS categoryName, c.slug AS categorySlug, c.icon AS categoryIcon,
        u.id AS sellerId, u.name AS sellerName, u.department AS sellerDepartment,
        u.hostel AS sellerHostel, u.avatar AS sellerAvatar, u.created_at AS sellerJoinedAt
       FROM listings l
       JOIN categories c ON l.category_id = c.id
       JOIN users u ON l.seller_id = u.id
       WHERE l.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Listing not found.' },
      });
    }

    const listing = rows[0];

    // Check visibility: public visitors can only see active + approved listings
    const isOwner = req.user && req.user.id === listing.sellerId;
    const isAdmin = req.user && req.user.role === 'ADMIN';

    if (listing.status !== 'ACTIVE' && !isOwner && !isAdmin) {
      return res.status(404).json({
        success: false,
        error: { code: 'LISTING_UNAVAILABLE', message: 'This listing is no longer available.' },
      });
    }

    // View counting logic: prevent trivial refresh spam
    const clientKey = `${req.ip}-${id}`;
    if (!isOwner && !recentViews.has(clientKey)) {
      recentViews.set(clientKey, Date.now());
      await query('UPDATE listings SET view_count = view_count + 1 WHERE id = ?', [id]);
      listing.viewCount = Number(listing.viewCount) + 1;
    }

    // Fetch images
    const [images] = await query(
      'SELECT url, alt_text, display_order FROM listing_images WHERE listing_id = ? ORDER BY display_order ASC',
      [id]
    );
    listing.images = images.map(img => img.url);

    // Fetch related listings in same category (up to 4 items)
    const [relatedRows] = await query(
      `SELECT
        l.id, l.title, l.price, l.condition, l.pickup_location AS pickupLocation,
        c.name AS categoryName, u.name AS sellerName
       FROM listings l
       JOIN categories c ON l.category_id = c.id
       JOIN users u ON l.seller_id = u.id
       WHERE l.category_id = ? AND l.id != ? AND l.status = 'ACTIVE' AND l.moderation_state = 'APPROVED'
       ORDER BY l.created_at DESC
       LIMIT 4`,
      [listing.categoryId, id]
    );
    const related = await attachImagesToListings(relatedRows);

    res.json({
      success: true,
      data: {
        listing,
        related,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/listings
 * Create a new product listing (Verified Student required)
 */
export async function createListing(req, res, next) {
  try {
    const sellerId = req.user.id;
    const {
      title,
      description,
      categoryId,
      price,
      condition,
      isNegotiable,
      pickupLocation,
      images,
    } = req.body;

    // Verify category exists
    const [cats] = await query('SELECT id FROM categories WHERE id = ?', [categoryId]);
    if (cats.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_CATEGORY', message: 'The selected category does not exist.' },
      });
    }

    const listingId = 'list-' + crypto.randomUUID();

    await withTransaction(async (conn) => {
      await conn.query(
        `INSERT INTO listings (id, seller_id, category_id, title, description, price, \`condition\`, is_negotiable, pickup_location, status, moderation_state)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', 'APPROVED')`,
        [listingId, sellerId, categoryId, title, description, price, condition, Boolean(isNegotiable), pickupLocation]
      );

      if (images && images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const imgId = 'img-' + crypto.randomUUID();
          await conn.query(
            `INSERT INTO listing_images (id, listing_id, url, alt_text, display_order)
             VALUES (?, ?, ?, ?, ?)`,
            [imgId, listingId, images[i], title, i]
          );
        }
      }

      // Add system notification for the seller
      const notifId = 'notif-' + crypto.randomUUID();
      await conn.query(
        `INSERT INTO notifications (id, recipient_id, type, title, message, link)
         VALUES (?, ?, 'SYSTEM', 'Listing Published', ?, ?)`,
        [notifId, sellerId, `Your listing "${title}" was successfully published.`, `/product/${listingId}`]
      );
    });

    res.status(201).json({
      success: true,
      message: 'Listing created successfully!',
      data: {
        id: listingId,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/v1/listings/:id
 * Update listing details (Owner or Admin)
 */
export async function updateListing(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    const [rows] = await query('SELECT seller_id FROM listings WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Listing not found.' } });
    }

    if (rows[0].seller_id !== userId && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You can only edit your own listings.' },
      });
    }

    const {
      title,
      description,
      categoryId,
      price,
      condition,
      isNegotiable,
      pickupLocation,
      images,
    } = req.body;

    await withTransaction(async (conn) => {
      const updates = [];
      const params = [];

      if (title !== undefined) { updates.push('title = ?'); params.push(title); }
      if (description !== undefined) { updates.push('description = ?'); params.push(description); }
      if (categoryId !== undefined) { updates.push('category_id = ?'); params.push(categoryId); }
      if (price !== undefined) { updates.push('price = ?'); params.push(price); }
      if (condition !== undefined) { updates.push('`condition` = ?'); params.push(condition); }
      if (isNegotiable !== undefined) { updates.push('is_negotiable = ?'); params.push(Boolean(isNegotiable)); }
      if (pickupLocation !== undefined) { updates.push('pickup_location = ?'); params.push(pickupLocation); }

      if (updates.length > 0) {
        params.push(id);
        await conn.query(`UPDATE listings SET ${updates.join(', ')} WHERE id = ?`, params);
      }

      if (images !== undefined) {
        await conn.query('DELETE FROM listing_images WHERE listing_id = ?', [id]);
        for (let i = 0; i < images.length; i++) {
          const imgId = 'img-' + crypto.randomUUID();
          await conn.query(
            `INSERT INTO listing_images (id, listing_id, url, alt_text, display_order)
             VALUES (?, ?, ?, ?, ?)`,
            [imgId, id, images[i], title || 'Product Image', i]
          );
        }
      }
    });

    res.json({
      success: true,
      message: 'Listing updated successfully.',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/listings/:id/sold
 * Mark listing as Sold
 */
export async function markListingAsSold(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    const [rows] = await query('SELECT seller_id, title FROM listings WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Listing not found.' } });
    }

    if (rows[0].seller_id !== userId && !isAdmin) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Permission denied.' } });
    }

    await query("UPDATE listings SET status = 'SOLD' WHERE id = ?", [id]);

    res.json({
      success: true,
      message: `Listing "${rows[0].title}" marked as sold.`,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/listings/:id/archive
 * Archive a listing
 */
export async function archiveListing(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    const [rows] = await query('SELECT seller_id, title FROM listings WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Listing not found.' } });
    }

    if (rows[0].seller_id !== userId && !isAdmin) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Permission denied.' } });
    }

    await query("UPDATE listings SET status = 'ARCHIVED' WHERE id = ?", [id]);

    res.json({
      success: true,
      message: `Listing "${rows[0].title}" archived.`,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/v1/listings/:id
 * Delete a listing (Owner or Admin)
 */
export async function deleteListing(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    const [rows] = await query('SELECT seller_id, title FROM listings WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Listing not found.' } });
    }

    if (rows[0].seller_id !== userId && !isAdmin) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Permission denied.' } });
    }

    await query('DELETE FROM listings WHERE id = ?', [id]);

    res.json({
      success: true,
      message: `Listing "${rows[0].title}" removed successfully.`,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/listings/my/all
 * Retrieve logged in user's listings categorized by status
 */
export async function getMyListings(req, res, next) {
  try {
    const userId = req.user.id;

    const [rows] = await query(
      `SELECT
        l.id, l.title, l.description, l.price, l.condition, l.is_negotiable AS isNegotiable,
        l.pickup_location AS pickupLocation, l.status, l.moderation_state AS moderationState,
        l.view_count AS viewCount, l.created_at AS createdAt,
        c.name AS categoryName
       FROM listings l
       JOIN categories c ON l.category_id = c.id
       WHERE l.seller_id = ?
       ORDER BY l.created_at DESC`,
      [userId]
    );

    const items = await attachImagesToListings(rows);

    res.json({
      success: true,
      data: {
        active: items.filter(i => i.status === 'ACTIVE'),
        sold: items.filter(i => i.status === 'SOLD'),
        archived: items.filter(i => i.status === 'ARCHIVED'),
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/listings/seller/:sellerId
 * Retrieve public active listings for a given seller
 */
export async function getSellerListings(req, res, next) {
  try {
    const { sellerId } = req.params;

    const [sellerRows] = await query(
      'SELECT id, name, department, hostel, avatar, created_at AS joinedAt FROM users WHERE id = ?',
      [sellerId]
    );
    if (sellerRows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Seller not found.' } });
    }

    const [rows] = await query(
      `SELECT
        l.id, l.title, l.price, l.condition, l.pickup_location AS pickupLocation,
        l.status, l.view_count AS viewCount, l.created_at AS createdAt,
        c.name AS categoryName
       FROM listings l
       JOIN categories c ON l.category_id = c.id
       WHERE l.seller_id = ? AND l.status = 'ACTIVE' AND l.moderation_state = 'APPROVED'
       ORDER BY l.created_at DESC`,
      [sellerId]
    );

    const items = await attachImagesToListings(rows);

    res.json({
      success: true,
      data: {
        seller: sellerRows[0],
        listings: items,
      },
    });
  } catch (error) {
    next(error);
  }
}
