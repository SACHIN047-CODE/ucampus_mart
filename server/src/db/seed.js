import bcrypt from 'bcryptjs';
import { config } from '../config/index.js';

export async function runSeed(connection) {
  console.log('🌱 Seeding database...');

  // 1. Seed Categories
  const categories = [
    { id: 'books', name: 'Books', slug: 'books', icon: '📚', color: '#2563EB', description: 'Textbooks, reference materials, novels and notes', sortOrder: 1 },
    { id: 'electronics', name: 'Electronics', slug: 'electronics', icon: '💻', color: '#1E40AF', description: 'Laptops, headphones, monitors, chargers and gadgets', sortOrder: 2 },
    { id: 'hostel', name: 'Hostel Essentials', slug: 'hostel', icon: '🛏️', color: '#F59E0B', description: 'Mattresses, kettles, buckets, lamps, hangers', sortOrder: 3 },
    { id: 'cycles', name: 'Cycles', slug: 'cycles', icon: '🚲', color: '#22C55E', description: 'Bicycles, gear locks, helmets and pumps', sortOrder: 4 },
    { id: 'lab', name: 'Lab Equipment', slug: 'lab', icon: '🧪', color: '#3B82F6', description: 'Lab coats, drafters, calculators and test tools', sortOrder: 5 },
    { id: 'furniture', name: 'Furniture', slug: 'furniture', icon: '🪑', color: '#EF4444', description: 'Study tables, ergonomic chairs, bookshelves', sortOrder: 6 },
    { id: 'fashion', name: 'Fashion', slug: 'fashion', icon: '👕', color: '#2563EB', description: 'Hoodies, college merchandise, jackets and shoes', sortOrder: 7 },
    { id: 'calculators', name: 'Calculators', slug: 'calculators', icon: '🖩', color: '#1E40AF', description: 'Scientific, graphing and financial calculators', sortOrder: 8 },
    { id: 'sports', name: 'Sports', slug: 'sports', icon: '🏸', color: '#22C55E', description: 'Badminton racquets, cricket bats, footballs and gym gear', sortOrder: 9 },
    { id: 'other', name: 'Other', slug: 'other', icon: '📦', color: '#64748B', description: 'Miscellaneous campus supplies and accessories', sortOrder: 10 },
  ];

  for (const cat of categories) {
    await connection.query(
      `INSERT INTO categories (id, name, slug, icon, color, description, is_active, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, TRUE, ?)
       ON DUPLICATE KEY UPDATE name = VALUES(name), icon = VALUES(icon), color = VALUES(color), description = VALUES(description);`,
      [cat.id, cat.name, cat.slug, cat.icon, cat.color, cat.description, cat.sortOrder]
    );
  }
  console.log(`✓ Seeded ${categories.length} categories.`);

  // 2. Seed Admin User
  const adminPasswordHash = await bcrypt.hash(config.admin.password, 10);
  const adminId = 'user-admin-01';

  await connection.query(
    `INSERT INTO users (id, name, email, password_hash, role, is_verified, verified_at, status, department)
     VALUES (?, 'CampusMart Admin', ?, ?, 'ADMIN', TRUE, NOW(), 'ACTIVE', 'Marketplace Administration')
     ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), role = 'ADMIN', is_verified = TRUE;`,
    [adminId, config.admin.email, adminPasswordHash]
  );
  console.log(`✓ Seeded Admin account: ${config.admin.email} (Password: ${config.admin.password})`);

  // 3. Seed Demo Students
  const studentPwHash = await bcrypt.hash('student123', 10);

  const students = [
    {
      id: 'user-sachin-01',
      name: 'Sachin Sharma',
      email: 'sachin.sharma@chitkara.edu.in',
      department: 'B.Tech CSE, 2nd Year',
      hostel: 'CS Dept Hostel',
      phone: '+91 98765 43210',
    },
    {
      id: 'user-ananya-02',
      name: 'Ananya Sharma',
      email: 'ananya.sharma@chitkara.edu.in',
      department: 'B.Tech Mechanical, 3rd Year',
      hostel: 'Kasturba Hostel',
      phone: '+91 98111 22233',
    },
    {
      id: 'user-rohan-03',
      name: 'Rohan Mehta',
      email: 'rohan.mehta@chitkara.edu.in',
      department: 'B.Tech IT, 4th Year',
      hostel: 'Vivekananda Block C',
      phone: '+91 98222 33344',
    },
    {
      id: 'user-ishaan-04',
      name: 'Ishaan Verma',
      email: 'ishaan.verma@chitkara.edu.in',
      department: 'B.Des, 1st Year',
      hostel: 'Tagore Bhawan',
      phone: '+91 98333 44455',
    }
  ];

  for (const s of students) {
    await connection.query(
      `INSERT INTO users (id, name, email, password_hash, role, is_verified, verified_at, status, department, hostel, phone)
       VALUES (?, ?, ?, ?, 'STUDENT', TRUE, NOW(), 'ACTIVE', ?, ?, ?)
       ON DUPLICATE KEY UPDATE name = VALUES(name), department = VALUES(department), hostel = VALUES(hostel), phone = VALUES(phone);`,
      [s.id, s.name, s.email, studentPwHash, s.department, s.hostel, s.phone]
    );
  }
  console.log(`✓ Seeded ${students.length} verified demo students (Password: student123).`);

  // 4. Seed sample listings
  const listings = [
    {
      id: 'list-001',
      sellerId: 'user-ananya-02',
      categoryId: 'books',
      title: 'Engineering Mathematics — B.S. Grewal (3rd Yr)',
      description: 'Well-maintained copy with handwritten notes in the margins for tricky derivations. No missing pages, minimal highlighting. Great for 2nd/3rd year mechanical and civil students.',
      price: 350,
      condition: 'GOOD',
      isNegotiable: true,
      pickupLocation: 'North Campus Library / Kasturba Hostel',
      status: 'ACTIVE',
      moderationState: 'APPROVED',
      viewCount: 142,
      images: [
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&auto=format&fit=crop',
      ],
    },
    {
      id: 'list-002',
      sellerId: 'user-rohan-03',
      categoryId: 'electronics',
      title: 'MacBook Air M1 2020, 8GB/256GB — Space Grey',
      description: 'Battery health 94%. Barely used this semester, upgrading to a Pro for CAD work. Comes with original charger and box. Screen and body flawless — always kept in a sleeve.',
      price: 46000,
      condition: 'LIKE_NEW',
      isNegotiable: true,
      pickupLocation: 'Vivekananda Block C / Tech Canteen',
      status: 'ACTIVE',
      moderationState: 'APPROVED',
      viewCount: 512,
      images: [
        'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop',
      ],
    },
    {
      id: 'list-003',
      sellerId: 'user-ishaan-04',
      categoryId: 'cycles',
      title: 'Hero Sprint Pro Cycle — Single Speed',
      description: 'Sturdy steel frame, front suspension, newly replaced brake pads and chain. Ridden daily to North Campus. Included free wire-lock and bell.',
      price: 2800,
      condition: 'FAIR',
      isNegotiable: true,
      pickupLocation: 'Gate No. 2 Parking / Sports Ground',
      status: 'ACTIVE',
      moderationState: 'APPROVED',
      viewCount: 289,
      images: [
        'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=600&auto=format&fit=crop',
      ],
    },
    {
      id: 'list-004',
      sellerId: 'user-sachin-01',
      categoryId: 'calculators',
      title: 'Casio fx-991EX ClassWiz Scientific Calculator',
      description: 'Natural textbook display, 552 functions, solar powered + battery. Allowed in all university semester exams. Fully functional, no scratches on screen.',
      price: 900,
      condition: 'LIKE_NEW',
      isNegotiable: false,
      pickupLocation: 'CS Dept Hostel / Turing Block',
      status: 'ACTIVE',
      moderationState: 'APPROVED',
      viewCount: 198,
      images: [
        'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600&auto=format&fit=crop',
      ],
    },
    {
      id: 'list-005',
      sellerId: 'user-ananya-02',
      categoryId: 'hostel',
      title: 'Pigeon 1.5L Stainless Steel Electric Kettle',
      description: 'Used for one semester in hostel for late-night Maggie and green tea. Auto shut-off feature, clean inside with no scaling. Working in perfect order.',
      price: 450,
      condition: 'GOOD',
      isNegotiable: true,
      pickupLocation: 'Kasturba Hostel Mess',
      status: 'ACTIVE',
      moderationState: 'APPROVED',
      viewCount: 174,
      images: [
        'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=600&auto=format&fit=crop',
      ],
    },
    {
      id: 'list-006',
      sellerId: 'user-sachin-01',
      categoryId: 'lab',
      title: 'Engineering Mini Drafter + Sheet Tube Combo',
      description: 'Omega mini drafter with steel clamp and adjustable angle scale. Included waterproof plastic chart sheet container tube. Required for 1st year ED.',
      price: 550,
      condition: 'GOOD',
      isNegotiable: false,
      pickupLocation: 'Mechanical Workshop / CS Hostel',
      status: 'ACTIVE',
      moderationState: 'APPROVED',
      viewCount: 95,
      images: [
        'https://images.unsplash.com/photo-1581291518655-9523c932edcf?w=600&auto=format&fit=crop',
      ],
    }
  ];

  for (const item of listings) {
    await connection.query(
      `INSERT INTO listings (id, seller_id, category_id, title, description, price, \`condition\`, is_negotiable, pickup_location, status, moderation_state, view_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE title = VALUES(title), price = VALUES(price), description = VALUES(description);`,
      [
        item.id,
        item.sellerId,
        item.categoryId,
        item.title,
        item.description,
        item.price,
        item.condition,
        item.isNegotiable,
        item.pickupLocation,
        item.status,
        item.moderationState,
        item.viewCount,
      ]
    );

    // Delete existing images for this listing to re-seed clean
    await connection.query('DELETE FROM listing_images WHERE listing_id = ?', [item.id]);

    for (let i = 0; i < item.images.length; i++) {
      const imgId = `img-${item.id}-${i + 1}`;
      await connection.query(
        `INSERT INTO listing_images (id, listing_id, url, alt_text, display_order)
         VALUES (?, ?, ?, ?, ?)`,
        [imgId, item.id, item.images[i], item.title, i]
      );
    }
  }
  console.log(`✓ Seeded ${listings.length} marketplace listings with image galleries.`);

  // 5. Seed sample notifications
  const sampleNotifications = [
    {
      id: 'notif-001',
      recipientId: 'user-sachin-01',
      type: 'INTEREST',
      title: 'Buyer Interest',
      message: 'Ananya Sharma showed interest in your "Engineering Mini Drafter".',
      link: '/product/list-006',
    },
    {
      id: 'notif-002',
      recipientId: 'user-sachin-01',
      type: 'MESSAGE',
      title: 'New Message',
      message: 'Rohan Mehta sent you a message: "Hey, is the Casio calculator still available?"',
      link: '/messages',
    },
    {
      id: 'notif-003',
      recipientId: 'user-sachin-01',
      type: 'SYSTEM',
      title: 'Listing Published',
      message: 'Your listing "Casio fx-991EX ClassWiz" has been successfully approved and published.',
      link: '/product/list-004',
    }
  ];

  for (const n of sampleNotifications) {
    await connection.query(
      `INSERT INTO notifications (id, recipient_id, type, title, message, link, is_read)
       VALUES (?, ?, ?, ?, ?, ?, FALSE)
       ON DUPLICATE KEY UPDATE message = VALUES(message);`,
      [n.id, n.recipientId, n.type, n.title, n.message, n.link]
    );
  }
  console.log(`✓ Seeded sample notifications.`);
}
