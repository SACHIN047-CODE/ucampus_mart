# CampusMart Express.js + MySQL REST API Backend

Production-ready Express.js REST API service for CampusMart built strictly conforming to **PRD.md**.

---

## 🛠 Tech Stack

- **Runtime & Framework:** Node.js (ES Modules) + Express.js 4.x
- **Database:** MySQL 8.0 with `mysql2/promise` connection pooling & transactions
- **Authentication:** JWT with secure HTTP-only cookies & `Authorization: Bearer <token>` support, bcrypt password hashing
- **Validation:** Zod schema validation on request bodies and queries
- **Security:** Helmet, CORS with client allowlisting, rate limiting (auth & API limiters)
- **File Uploads:** Multer with mime-type filtering, file size restrictions, and static serving under `/uploads`

---

## 🚀 Quick Setup & How to Run

### Step 1: Configure Your MySQL Credentials
Open [`server/.env`](file:///d:/UCart/ucampus_mart/server/.env) and set your local MySQL password:

```ini
# server/.env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_actual_mysql_password_here
DB_NAME=campusmart_db
```

### Step 2: Initialize Database and Seed Data
Run the database initialization script from the `server` directory (or from root):

```bash
# Option A: From server directory
cd server
npm run db:init

# Option B: From project root directory
npm run server:init
```

**What this automatically does:**
1. Connects to your local MySQL instance.
2. Creates the database `campusmart_db` (if it does not exist) with `utf8mb4` character set.
3. Creates all tables matching PRD Section 8 (`users`, `password_resets`, `categories`, `listings`, `listing_images`, `wishlist`, `conversations`, `messages`, `reports`, `notifications`, `moderation_audits`).
4. Seeds initial categories (Books, Electronics, Hostel, Cycles, Lab, etc.).
5. Seeds the Admin account and demo verified students.
6. Seeds marketplace product listings with images and seller info.

### Step 3: Start the Backend Server

```bash
# From server directory
npm run dev

# Or from project root
npm run server
```

The API server will start on **`http://localhost:5000`**.

---

## 🔑 Pre-seeded Accounts

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Administrator** | `admin@campusmart.edu` | `admin123` | Full moderation, reports review, users & listings management, analytics metrics |
| **Verified Student** | `sachin.sharma@chitkara.edu.in` | `student123` | Buy, sell, create listings, wishlist, message sellers |
| **Verified Student** | `ananya.sharma@chitkara.edu.in` | `student123` | Student account with pre-seeded listings |

---

## 📚 Complete REST API Reference (`/api/v1`)

### 1. Authentication (`/api/v1/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Register student with campus email domain check | Public |
| `POST` | `/api/v1/auth/verify-email` | Verify 6-digit OTP code | Public |
| `POST` | `/api/v1/auth/resend-code` | Resend verification code (rate-limited) | Public |
| `POST` | `/api/v1/auth/login` | Log in and receive JWT token + HTTP-only cookie | Public |
| `POST` | `/api/v1/auth/logout` | Log out and clear auth cookie | Public |
| `POST` | `/api/v1/auth/forgot-password` | Generate password reset token | Public |
| `POST` | `/api/v1/auth/reset-password` | Reset password using reset token | Public |
| `GET` | `/api/v1/auth/me` | Get current user profile and activity counts | Bearer / Cookie |
| `PATCH` | `/api/v1/auth/me` | Update profile fields (name, phone, hostel, etc.) | Bearer / Cookie |
| `POST` | `/api/v1/auth/change-password`| Change user password | Bearer / Cookie |

### 2. Listings (`/api/v1/listings`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/v1/listings` | Search & filter listings (`q`, `category`, `minPrice`, `maxPrice`, `condition`, `location`, `sortBy`, `page`, `limit`) | Public |
| `GET` | `/api/v1/listings/:id` | Get listing details, images, seller info, and related products | Public |
| `POST` | `/api/v1/listings` | Create listing (up to 6 images) | Verified Student |
| `PATCH` | `/api/v1/listings/:id` | Update listing | Owner or Admin |
| `POST` | `/api/v1/listings/:id/sold` | Mark listing as Sold | Owner or Admin |
| `POST` | `/api/v1/listings/:id/archive` | Archive listing | Owner or Admin |
| `DELETE` | `/api/v1/listings/:id` | Delete listing | Owner or Admin |
| `GET` | `/api/v1/listings/my/all` | Get my active, sold, and archived listings | Authenticated |
| `GET` | `/api/v1/listings/seller/:sellerId` | Get public listings of a specific seller | Public |

### 3. Categories (`/api/v1/categories`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/v1/categories` | List active categories with live product counts | Public |
| `POST` | `/api/v1/categories` | Create category | Admin |
| `PATCH` | `/api/v1/categories/:id` | Update category details | Admin |
| `DELETE` | `/api/v1/categories/:id` | Deactivate category | Admin |

### 4. Wishlist (`/api/v1/me/wishlist`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/v1/me/wishlist` | Get user's saved listings | Authenticated |
| `POST` | `/api/v1/me/wishlist/:listingId` | Add listing to wishlist | Authenticated |
| `DELETE` | `/api/v1/me/wishlist/:listingId` | Remove listing from wishlist | Authenticated |

### 5. Conversations & Messaging (`/api/v1/conversations`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/v1/conversations` | List user's conversations with unread counts & previews | Authenticated |
| `POST` | `/api/v1/conversations` | Start or get listing-linked conversation | Verified Student |
| `GET` | `/api/v1/conversations/:id/messages` | Get message history & auto-mark as read | Participants / Admin |
| `POST` | `/api/v1/conversations/:id/messages` | Send message (triggers in-app notification) | Participants |

### 6. Notifications (`/api/v1/me/notifications`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/v1/me/notifications` | List user's notifications | Authenticated |
| `GET` | `/api/v1/me/notifications/unread-count`| Get unread count | Authenticated |
| `PATCH` | `/api/v1/me/notifications/:id/read` | Mark single notification as read | Authenticated |
| `POST` | `/api/v1/me/notifications/read-all` | Mark all notifications as read | Authenticated |

### 7. Reports & Moderation (`/api/v1/reports`, `/api/v1/admin`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/v1/reports` | Report listing or user (prevents duplicate open reports) | Verified Student |
| `GET` | `/api/v1/admin/metrics` | Summary metrics (users, listings, reports, sales) | Admin |
| `GET` | `/api/v1/admin/reports` | List reports by status (OPEN/RESOLVED/DISMISSED) | Admin |
| `PATCH` | `/api/v1/admin/reports/:id` | Resolve report with note & record audit entry | Admin |
| `GET` | `/api/v1/admin/users` | List users with pagination and search | Admin |
| `PATCH` | `/api/v1/admin/users/:id/status`| Suspend or activate user | Admin |
| `GET` | `/api/v1/admin/listings` | List all listings with moderation filter | Admin |
| `PATCH` | `/api/v1/admin/listings/:id/moderate` | Hide, restore, or reject listing | Admin |
| `GET` | `/api/v1/admin/audits` | View moderation audit trail | Admin |

### 8. Media Uploads & Health
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/v1/uploads` | Upload listing images (multipart/form-data, max 6) | Verified Student |
| `POST` | `/api/v1/uploads/presign` | Storage presign metadata | Verified Student |
| `GET` | `/api/v1/health` | Health & MySQL connection status check | Public |

---

## 🗄️ Database Architecture Diagram

```
 users
  ├── password_resets (FK: user_id)
  ├── listings (FK: seller_id)
  │    ├── listing_images (FK: listing_id)
  │    └── categories (FK: category_id)
  ├── wishlist (FK: user_id, listing_id)
  ├── conversations (FK: buyer_id, seller_id, listing_id)
  │    └── messages (FK: conversation_id, sender_id)
  ├── reports (FK: reporter_id, target_listing_id, target_user_id, moderator_id)
  ├── notifications (FK: recipient_id)
  └── moderation_audits (FK: admin_id)
```
