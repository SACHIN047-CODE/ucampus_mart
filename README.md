# 🎓 CampusMart

[![Live Website](https://img.shields.io/badge/🚀_Live_Website-ucampus--mart.vercel.app-blue?style=for-the-badge&logo=vercel)](https://ucampus-mart.vercel.app/)

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4.21-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express-4.21-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Pure CSS](https://img.shields.io/badge/Styling-Pure_CSS-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> A modern, full-stack peer-to-peer campus marketplace designed for university students to buy, sell, and trade textbooks, electronics, bicycles, hostel essentials, and stationery within a verified student community.

---

## 🌟 Key Highlights

* **🔐 Dual Authentication Flow**:
  * **Google OAuth 2.0**: Instant, secure sign-in with campus/personal Google accounts. Automatically validates existing accounts before login.
  * **Campus Email & Password + 2FA OTP**: Real-time 6-digit one-time password (OTP) verification powered by **Brevo HTTPS API** and Nodemailer.
* **🛍️ Faceted Marketplace & Search**:
  * Instant search query filtering, category browsing, price range filters, item condition selectors, and sort orders.
  * Interactive product cards with dynamic badges (*Verified Student*, *Urgent*, *Featured*, *Negotiable*).
* **💬 Real-Time In-App Messaging**:
  * Built-in messaging system connecting buyers and sellers directly about specific listings.
* **🌓 Adaptive Theming (Pure CSS)**:
  * Zero heavy CSS framework dependencies. 100% handcrafted with custom CSS variables, glassmorphism, responsive grid/flexbox layouts, and instant Dark/Light mode switching.
* **🛡️ Security & Performance**:
  * HTTP-only JWT cookies, Helmet protection, CORS policy, and Express rate limiting with proxy trust for high-concurrency production deployments.

---

## 🛠️ Full-Stack Architecture

### Frontend (Client)
* **Framework**: React 18 with Vite
* **Routing**: React Router DOM v6
* **Styling**: Pure Vanilla CSS with Design System Tokens
* **State Management**: React Context (`AppContext`, `ThemeContext`)
* **Hosting**: [Vercel](https://ucampus-mart.vercel.app/)

### Backend (Server)
* **Runtime**: Node.js (ES Modules)
* **Server Framework**: Express.js
* **Database**: MySQL (Hosted on Aiven Cloud / Local MySQL)
* **Authentication**: JWT, bcryptjs, `@react-oauth/google` / `google-auth-library`
* **Email Delivery**: Brevo (Sendinblue) HTTPS API & Nodemailer SMTP
* **Hosting**: [Render](https://campusmart-api-0nz9.onrender.com/)

---

## 📁 Repository Structure

```text
ucampus_mart/
├── index.html                     # Frontend entry point
├── package.json                   # Frontend scripts & dependencies
├── vite.config.js                 # Vite bundler configuration
├── vercel.json                    # Single-Page Application rewrite rules
│
├── src/                           # Frontend React Application
│   ├── main.jsx                   # Application bootstrap
│   ├── App.jsx                    # Route definitions & layout wrappers
│   ├── context/                   # Global state (AppContext, ThemeContext)
│   ├── pages/                     # Application pages
│   │   ├── Home/                  # Hero showcase & category highlights
│   │   ├── Marketplace/           # Product catalog with faceted filters
│   │   ├── ProductDetails/        # Listing info, seller details & contact
│   │   ├── SellItem/              # New listing creation with photo upload
│   │   ├── Messages/              # In-app buyer/seller chat interface
│   │   ├── Wishlist/              # Saved favorites collection
│   │   ├── Profile/               # Student dashboard & listing manager
│   │   ├── Admin/                 # Moderation & marketplace metrics
│   │   └── Auth/                  # Login, Register, OTP Verification
│   ├── components/                # Reusable UI component library
│   ├── styles/                    # Global CSS variables & tokens
│   └── utils/                     # API fetch client & helpers
│
└── server/                        # Express.js REST API Backend
    ├── package.json               # Backend dependencies
    ├── .env                       # Local backend environment variables
    └── src/
        ├── server.js              # Server initialization, CORS & middleware
        ├── config/index.js        # Environment config loader
        ├── db/                    # MySQL connection pool & migration scripts
        │   ├── pool.js            # mysql2 promise pool
        │   ├── init.js            # Table schema creation script
        │   └── seed.js            # Pre-populated categories & demo seed
        ├── controllers/           # API request controllers (Auth, Listings, Chat)
        ├── middleware/            # JWT Auth, Rate limiting & Error handlers
        ├── routes/                # Versioned API routes (/api/v1)
        └── utils/mailer.js        # Email dispatch service (Brevo & Nodemailer)
```

---

## 🚀 Quick Start Guide

### Prerequisites
* [Node.js](https://nodejs.org/) (version 18.0.0 or higher)
* [MySQL](https://www.mysql.com/) (local database or cloud instance like Aiven)
* [Git](https://git-scm.com/)

---

### 1. Clone the Repository
```bash
git clone https://github.com/SACHIN047-CODE/ucampus_mart.git
cd ucampus_mart
```

---

### 2. Backend Setup (`server/`)

1. Navigate to the server directory:
   ```bash
   cd server
   npm install
   ```

2. Configure environment variables in `server/.env`:
   ```env
   PORT=5000
   NODE_ENV=development

   # MySQL Database
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=campusmart_db
   DB_SSL=false

   # JWT Auth
   JWT_SECRET=your_super_secret_jwt_key
   JWT_EXPIRES_IN=7d

   # CORS Allowed Client Origin
   CLIENT_URL=http://localhost:5173

   # Campus Email Domains Allowed (comma separated)
   CAMPUS_EMAIL_DOMAINS=chitkara.edu.in,edu.in,ac.in,edu,gmail.com

   # Brevo Email API (for real OTP delivery)
   BREVO_API_KEY=xkeysib-your-brevo-api-key
   BREVO_SENDER_EMAIL=your-brevo-registered-email@gmail.com
   ```

3. Initialize and seed the MySQL database:
   ```bash
   npm run db:init
   ```

4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *API will run at `http://localhost:5000`.*

---

### 3. Frontend Setup

1. Open a new terminal in the root project folder:
   ```bash
   cd ..
   npm install
   ```

2. Configure `.env` in the root folder:
   ```env
   VITE_API_URL=http://localhost:5000/api/v1
   VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *Frontend will run at `http://localhost:5173`.*

---

## 📡 REST API Reference

All API routes are versioned under `/api/v1`:

### 🔐 Authentication (`/api/v1/auth`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/auth/register` | Register new student account & trigger OTP |
| `POST` | `/auth/verify-email` | Verify 6-digit OTP code to activate account |
| `POST` | `/auth/resend-code` | Resend fresh 6-digit OTP to user email |
| `POST` | `/auth/login` | Email/password sign-in (dispatches login OTP) |
| `POST` | `/auth/google` | Google OAuth verification & instant login |
| `POST` | `/auth/logout` | Clear HTTP-only authentication cookie |
| `GET` | `/auth/me` | Fetch currently authenticated user session |

### 📦 Marketplace Listings (`/api/v1/listings`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/listings` | Query listings with search, category & price filters |
| `GET` | `/listings/:id` | Get full listing specifications & seller profile |
| `POST` | `/listings` | Create a new listing with image upload |
| `PUT` | `/listings/:id` | Update existing listing details |
| `DELETE`| `/listings/:id` | Remove a listing |

### 💬 In-App Messaging (`/api/v1/conversations`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/conversations` | List all active conversation threads for user |
| `POST` | `/conversations` | Start or retrieve conversation for a listing |
| `GET` | `/conversations/:id/messages` | Fetch chat history for a thread |
| `POST` | `/conversations/:id/messages` | Send message to buyer/seller |

---

## 🌐 Production Deployment

| Service | Platform | Configuration |
| :--- | :--- | :--- |
| **Frontend** | [Vercel](https://vercel.com/) | Build: `npm run build` & Output: `dist/`. SPA rewrites managed in [`vercel.json`](vercel.json). |
| **Backend** | [Render](https://render.com/) | Build: `npm install` & Start: `npm start` (Root: `server`). Configured with reverse proxy trust. |
| **Database** | [Aiven MySQL](https://aiven.io/) | Managed cloud MySQL with SSL encryption. |
| **Email API** | [Brevo](https://brevo.com/) | HTTPS REST API delivery bypassing cloud SMTP port restrictions. |

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
