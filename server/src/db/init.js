import mysql from 'mysql2/promise';
import { config } from '../config/index.js';
import { runSeed } from './seed.js';

export async function initDatabase() {
  console.log('🔄 Initializing CampusMart MySQL Database...');
  console.log(`Connecting to MySQL host: ${config.db.host}:${config.db.port} as user '${config.db.user}'...`);

  let rootConn;
  try {
    // 1. Attempt to connect without database to ensure database exists (for local MySQL)
    rootConn = await mysql.createConnection({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      ssl: config.db.ssl,
    });

    console.log(`Checking/Creating database '${config.db.database}'...`);
    await rootConn.query(
      `CREATE DATABASE IF NOT EXISTS \`${config.db.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    await rootConn.end();
  } catch (err) {
    if (rootConn) {
      try { await rootConn.end(); } catch (_) {}
    }
    // Managed databases like Aiven already create the database (e.g. 'defaultdb') and restrict CREATE DATABASE
    console.log(`ℹ️ Root connection note: (${err.message}). Connecting directly to target database '${config.db.database}'...`);
  }

  // 2. Connect to the target database and build tables
  const dbConn = await mysql.createConnection({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
    ssl: config.db.ssl,
  });

  try {
    console.log('📦 Creating schema tables according to PRD.md specifications...');

    // Users table
    await dbConn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        email VARCHAR(191) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('STUDENT', 'ADMIN') DEFAULT 'STUDENT',
        is_verified BOOLEAN DEFAULT FALSE,
        verified_at DATETIME NULL,
        verification_code VARCHAR(20) NULL,
        verification_code_expires_at DATETIME NULL,
        status ENUM('ACTIVE', 'SUSPENDED') DEFAULT 'ACTIVE',
        department VARCHAR(150) NULL,
        hostel VARCHAR(150) NULL,
        phone VARCHAR(50) NULL,
        avatar TEXT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_users_email (email),
        INDEX idx_users_role (role)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Password resets table
    await dbConn.query(`
      CREATE TABLE IF NOT EXISTS password_resets (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        token VARCHAR(191) NOT NULL UNIQUE,
        expires_at DATETIME NOT NULL,
        used_at DATETIME NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_pw_resets_token (token),
        CONSTRAINT fk_pw_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Categories table
    await dbConn.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        slug VARCHAR(100) NOT NULL UNIQUE,
        icon VARCHAR(50) NULL,
        color VARCHAR(50) NULL,
        description TEXT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        sort_order INT DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Listings table
    await dbConn.query(`
      CREATE TABLE IF NOT EXISTS listings (
        id VARCHAR(64) PRIMARY KEY,
        seller_id VARCHAR(64) NOT NULL,
        category_id VARCHAR(64) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        price INT NOT NULL DEFAULT 0,
        \`condition\` ENUM('NEW', 'LIKE_NEW', 'GOOD', 'FAIR') NOT NULL DEFAULT 'GOOD',
        is_negotiable BOOLEAN DEFAULT FALSE,
        pickup_location VARCHAR(255) NOT NULL,
        status ENUM('ACTIVE', 'SOLD', 'ARCHIVED', 'HIDDEN') DEFAULT 'ACTIVE',
        moderation_state ENUM('APPROVED', 'PENDING_REVIEW', 'REJECTED') DEFAULT 'APPROVED',
        view_count INT DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_listings_seller (seller_id),
        INDEX idx_listings_category (category_id),
        INDEX idx_listings_status (status),
        INDEX idx_listings_moderation (moderation_state),
        INDEX idx_listings_created (created_at),
        INDEX idx_listings_price (price),
        CONSTRAINT fk_listing_seller FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_listing_category FOREIGN KEY (category_id) REFERENCES categories(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Listing Images table
    await dbConn.query(`
      CREATE TABLE IF NOT EXISTS listing_images (
        id VARCHAR(64) PRIMARY KEY,
        listing_id VARCHAR(64) NOT NULL,
        url TEXT NOT NULL,
        alt_text VARCHAR(255) NULL,
        display_order INT DEFAULT 0,
        INDEX idx_img_listing (listing_id),
        CONSTRAINT fk_image_listing FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Wishlist table
    await dbConn.query(`
      CREATE TABLE IF NOT EXISTS wishlist (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        listing_id VARCHAR(64) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_user_listing (user_id, listing_id),
        INDEX idx_wishlist_user (user_id),
        INDEX idx_wishlist_listing (listing_id),
        CONSTRAINT fk_wishlist_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_wishlist_listing FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Conversations table
    await dbConn.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id VARCHAR(64) PRIMARY KEY,
        listing_id VARCHAR(64) NOT NULL,
        buyer_id VARCHAR(64) NOT NULL,
        seller_id VARCHAR(64) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_conv_participants (listing_id, buyer_id, seller_id),
        INDEX idx_conv_buyer (buyer_id),
        INDEX idx_conv_seller (seller_id),
        CONSTRAINT fk_conv_listing FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
        CONSTRAINT fk_conv_buyer FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_conv_seller FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Messages table
    await dbConn.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id VARCHAR(64) PRIMARY KEY,
        conversation_id VARCHAR(64) NOT NULL,
        sender_id VARCHAR(64) NOT NULL,
        body TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        read_at DATETIME NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_msg_conv (conversation_id),
        INDEX idx_msg_sender (sender_id),
        CONSTRAINT fk_msg_conv FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
        CONSTRAINT fk_msg_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Reports table
    await dbConn.query(`
      CREATE TABLE IF NOT EXISTS reports (
        id VARCHAR(64) PRIMARY KEY,
        reporter_id VARCHAR(64) NOT NULL,
        target_type ENUM('LISTING', 'USER') NOT NULL,
        target_listing_id VARCHAR(64) NULL,
        target_user_id VARCHAR(64) NULL,
        reason VARCHAR(150) NOT NULL,
        details TEXT NULL,
        status ENUM('OPEN', 'RESOLVED', 'DISMISSED') DEFAULT 'OPEN',
        moderator_id VARCHAR(64) NULL,
        resolution_note TEXT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        resolved_at DATETIME NULL,
        INDEX idx_reports_status (status),
        INDEX idx_reports_reporter (reporter_id),
        CONSTRAINT fk_report_reporter FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_report_listing FOREIGN KEY (target_listing_id) REFERENCES listings(id) ON DELETE CASCADE,
        CONSTRAINT fk_report_target_user FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_report_moderator FOREIGN KEY (moderator_id) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Notifications table
    await dbConn.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id VARCHAR(64) PRIMARY KEY,
        recipient_id VARCHAR(64) NOT NULL,
        type ENUM('INTEREST', 'MESSAGE', 'SYSTEM', 'MODERATION') NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        link VARCHAR(255) NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_notif_recipient (recipient_id),
        INDEX idx_notif_read (is_read),
        CONSTRAINT fk_notif_recipient FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Moderation Audits table
    await dbConn.query(`
      CREATE TABLE IF NOT EXISTS moderation_audits (
        id VARCHAR(64) PRIMARY KEY,
        admin_id VARCHAR(64) NOT NULL,
        action VARCHAR(100) NOT NULL,
        target_type VARCHAR(50) NOT NULL,
        target_id VARCHAR(64) NOT NULL,
        reason TEXT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_audit_admin (admin_id),
        INDEX idx_audit_target (target_type, target_id),
        CONSTRAINT fk_audit_admin FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log('✅ All database tables created successfully!');

    // 3. Seed data
    await runSeed(dbConn);

    console.log('🎉 Database initialization complete!');
  } finally {
    await dbConn.end();
  }
}

// Allow direct CLI invocation: node src/db/init.js
if (process.argv[1] && process.argv[1].endsWith('init.js')) {
  initDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
