import crypto from 'crypto';
import { z } from 'zod';
import { query, withTransaction } from '../db/pool.js';

export const createConversationSchema = z.object({
  listingId: z.string().min(1, 'Listing ID is required'),
  initialMessage: z.string().optional(),
});

export const sendMessageSchema = z.object({
  body: z.string().min(1, 'Message body cannot be empty').max(2000),
});

/**
 * GET /api/v1/conversations
 * List all active conversations for the authenticated user
 */
export async function getConversations(req, res, next) {
  try {
    const userId = req.user.id;

    const [rows] = await query(
      `SELECT
        c.id, c.listing_id AS listingId, c.buyer_id AS buyerId, c.seller_id AS sellerId,
        c.created_at AS createdAt, c.updated_at AS updatedAt,
        l.title AS listingTitle, l.price AS listingPrice, l.status AS listingStatus,
        u_buyer.id AS b_id, u_buyer.name AS b_name, u_buyer.avatar AS b_avatar, u_buyer.department AS b_dept,
        u_seller.id AS s_id, u_seller.name AS s_name, u_seller.avatar AS s_avatar, u_seller.department AS s_dept,
        (
          SELECT JSON_OBJECT('body', m.body, 'createdAt', m.created_at, 'senderId', m.sender_id, 'isRead', m.is_read)
          FROM messages m
          WHERE m.conversation_id = c.id
          ORDER BY m.created_at DESC
          LIMIT 1
        ) AS latestMessageJson,
        (
          SELECT COUNT(*)
          FROM messages m
          WHERE m.conversation_id = c.id AND m.sender_id != ? AND m.is_read = FALSE
        ) AS unreadCount
       FROM conversations c
       JOIN listings l ON c.listing_id = l.id
       JOIN users u_buyer ON c.buyer_id = u_buyer.id
       JOIN users u_seller ON c.seller_id = u_seller.id
       WHERE c.buyer_id = ? OR c.seller_id = ?
       ORDER BY c.updated_at DESC`,
      [userId, userId, userId]
    );

    const conversations = rows.map((r) => {
      const isBuyer = r.buyerId === userId;
      const other = isBuyer
        ? { id: r.s_id, name: r.s_name, avatar: r.s_avatar, department: r.s_dept, role: 'Seller' }
        : { id: r.b_id, name: r.b_name, avatar: r.b_avatar, department: r.b_dept, role: 'Buyer' };

      let latestMessage = null;
      if (r.latestMessageJson) {
        try {
          latestMessage = typeof r.latestMessageJson === 'string'
            ? JSON.parse(r.latestMessageJson)
            : r.latestMessageJson;
        } catch {
          latestMessage = null;
        }
      }

      return {
        id: r.id,
        listing: {
          id: r.listingId,
          title: r.listingTitle,
          price: r.listingPrice,
          status: r.listingStatus,
        },
        otherParticipant: other,
        latestMessage,
        unreadCount: Number(r.unreadCount || 0),
        updatedAt: r.updatedAt,
      };
    });

    res.json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/conversations
 * Start or retrieve an existing conversation linked to a listing
 */
export async function getOrCreateConversation(req, res, next) {
  try {
    const buyerId = req.user.id;
    const { listingId, initialMessage } = req.body;

    const [listings] = await query(
      'SELECT id, seller_id, title FROM listings WHERE id = ?',
      [listingId]
    );

    if (listings.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Listing not found.' } });
    }

    const listing = listings[0];
    const sellerId = listing.seller_id;

    if (sellerId === buyerId) {
      return res.status(400).json({
        success: false,
        error: { code: 'SELF_CONVERSATION', message: 'You cannot start a conversation on your own listing.' },
      });
    }

    // Check if conversation already exists
    const [existing] = await query(
      'SELECT id FROM conversations WHERE listing_id = ? AND buyer_id = ? AND seller_id = ?',
      [listingId, buyerId, sellerId]
    );

    let conversationId;

    if (existing.length > 0) {
      conversationId = existing[0].id;
    } else {
      conversationId = 'conv-' + crypto.randomUUID();
      await query(
        `INSERT INTO conversations (id, listing_id, buyer_id, seller_id)
         VALUES (?, ?, ?, ?)`,
        [conversationId, listingId, buyerId, sellerId]
      );
    }

    // If an initial message was supplied, send it
    if (initialMessage && initialMessage.trim()) {
      const msgId = 'msg-' + crypto.randomUUID();
      await withTransaction(async (conn) => {
        await conn.query(
          `INSERT INTO messages (id, conversation_id, sender_id, body)
           VALUES (?, ?, ?, ?)`,
          [msgId, conversationId, buyerId, initialMessage.trim()]
        );
        await conn.query('UPDATE conversations SET updated_at = NOW() WHERE id = ?', [conversationId]);

        // Send notification to seller
        const notifId = 'notif-' + crypto.randomUUID();
        await conn.query(
          `INSERT INTO notifications (id, recipient_id, type, title, message, link)
           VALUES (?, ?, 'MESSAGE', 'New Message', ?, ?)`,
          [notifId, sellerId, `${req.user.name} sent a message regarding "${listing.title}".`, `/messages?id=${conversationId}`]
        );
      });
    }

    res.json({
      success: true,
      data: {
        conversationId,
        listingId,
        sellerId,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/v1/conversations/:id/messages
 * Retrieve messages in a conversation and mark as read
 */
export async function getMessages(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const isAdmin = req.user.role === 'ADMIN';

    // Verify conversation and participation
    const [convs] = await query(
      `SELECT c.id, c.listing_id AS listingId, c.buyer_id AS buyerId, c.seller_id AS sellerId,
              l.title AS listingTitle, l.price AS listingPrice,
              u_buyer.name AS buyerName, u_seller.name AS sellerName
       FROM conversations c
       JOIN listings l ON c.listing_id = l.id
       JOIN users u_buyer ON c.buyer_id = u_buyer.id
       JOIN users u_seller ON c.seller_id = u_seller.id
       WHERE c.id = ?`,
      [id]
    );

    if (convs.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Conversation not found.' } });
    }

    const conv = convs[0];
    if (conv.buyerId !== userId && conv.sellerId !== userId && !isAdmin) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied.' } });
    }

    // Mark messages from other user as read
    await query(
      `UPDATE messages
       SET is_read = TRUE, read_at = NOW()
       WHERE conversation_id = ? AND sender_id != ? AND is_read = FALSE`,
      [id, userId]
    );

    // Fetch message history
    const [messages] = await query(
      `SELECT
        m.id, m.sender_id AS senderId, m.body, m.is_read AS isRead,
        m.read_at AS readAt, m.created_at AS createdAt,
        u.name AS senderName, u.avatar AS senderAvatar
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.conversation_id = ?
       ORDER BY m.created_at ASC`,
      [id]
    );

    res.json({
      success: true,
      data: {
        conversation: conv,
        messages,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/conversations/:id/messages
 * Send a message within a conversation
 */
export async function sendMessage(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { body } = req.body;

    const [convs] = await query(
      `SELECT c.id, c.listing_id, c.buyer_id, c.seller_id, l.title AS listingTitle
       FROM conversations c
       JOIN listings l ON c.listing_id = l.id
       WHERE c.id = ?`,
      [id]
    );

    if (convs.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Conversation not found.' } });
    }

    const conv = convs[0];
    if (conv.buyer_id !== userId && conv.seller_id !== userId) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied.' } });
    }

    const recipientId = conv.buyer_id === userId ? conv.seller_id : conv.buyer_id;
    const msgId = 'msg-' + crypto.randomUUID();

    await withTransaction(async (conn) => {
      await conn.query(
        `INSERT INTO messages (id, conversation_id, sender_id, body)
         VALUES (?, ?, ?, ?)`,
        [msgId, id, userId, body.trim()]
      );

      await conn.query('UPDATE conversations SET updated_at = NOW() WHERE id = ?', [id]);

      // Create notification for recipient
      const notifId = 'notif-' + crypto.randomUUID();
      await conn.query(
        `INSERT INTO notifications (id, recipient_id, type, title, message, link)
         VALUES (?, ?, 'MESSAGE', 'New Message', ?, ?)`,
        [notifId, recipientId, `${req.user.name}: "${body.slice(0, 50)}${body.length > 50 ? '...' : ''}"`, `/messages?id=${id}`]
      );
    });

    res.status(201).json({
      success: true,
      message: 'Message sent.',
      data: {
        id: msgId,
        conversationId: id,
        senderId: userId,
        body: body.trim(),
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
}
