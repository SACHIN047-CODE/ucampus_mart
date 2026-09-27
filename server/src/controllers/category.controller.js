import { z } from 'zod';
import { query } from '../db/pool.js';

export const createCategorySchema = z.object({
  id: z.string().min(2).max(50),
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(100),
  icon: z.string().optional(),
  color: z.string().optional(),
  description: z.string().optional(),
  sortOrder: z.number().int().default(0),
});

export const updateCategorySchema = z.object({
  name: z.string().min(2).max(100).optional(),
  slug: z.string().min(2).max(100).optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

/**
 * GET /api/v1/categories
 * Returns active categories with listing counts
 */
export async function getCategories(req, res, next) {
  try {
    const [rows] = await query(
      `SELECT
        c.id, c.name, c.slug, c.icon, c.color, c.description, c.sort_order AS sortOrder,
        (
          SELECT COUNT(*)
          FROM listings l
          WHERE l.category_id = c.id AND l.status = 'ACTIVE' AND l.moderation_state = 'APPROVED'
        ) AS count
       FROM categories c
       WHERE c.is_active = TRUE
       ORDER BY c.sort_order ASC, c.name ASC`
    );

    res.json({
      success: true,
      data: rows.map(r => ({ ...r, count: Number(r.count) })),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/categories
 * Admin: Add new category
 */
export async function createCategory(req, res, next) {
  try {
    const { id, name, slug, icon, color, description, sortOrder } = req.body;

    await query(
      `INSERT INTO categories (id, name, slug, icon, color, description, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id.toLowerCase().trim(), name, slug.toLowerCase().trim(), icon || '📦', color || '#2563EB', description || '', sortOrder || 0]
    );

    res.status(201).json({
      success: true,
      message: 'Category created successfully.',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/v1/categories/:id
 * Admin: Update category
 */
export async function updateCategory(req, res, next) {
  try {
    const { id } = req.params;
    const { name, slug, icon, color, description, isActive, sortOrder } = req.body;

    const updates = [];
    const params = [];

    if (name !== undefined) { updates.push('name = ?'); params.push(name); }
    if (slug !== undefined) { updates.push('slug = ?'); params.push(slug); }
    if (icon !== undefined) { updates.push('icon = ?'); params.push(icon); }
    if (color !== undefined) { updates.push('color = ?'); params.push(color); }
    if (description !== undefined) { updates.push('description = ?'); params.push(description); }
    if (isActive !== undefined) { updates.push('is_active = ?'); params.push(Boolean(isActive)); }
    if (sortOrder !== undefined) { updates.push('sort_order = ?'); params.push(sortOrder); }

    if (updates.length > 0) {
      params.push(id);
      await query(`UPDATE categories SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    res.json({
      success: true,
      message: 'Category updated successfully.',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/v1/categories/:id
 * Admin: Soft delete / archive category
 */
export async function deleteCategory(req, res, next) {
  try {
    const { id } = req.params;
    await query('UPDATE categories SET is_active = FALSE WHERE id = ?', [id]);
    res.json({
      success: true,
      message: 'Category deactivated.',
    });
  } catch (error) {
    next(error);
  }
}
