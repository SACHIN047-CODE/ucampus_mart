# 🎓 CampusMart

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4.1-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React Router](https://img.shields.io/badge/React_Router-v6-CA4245?logo=react-router&logoColor=white)](https://reactrouter.com/)
[![CSS3](https://img.shields.io/badge/Styling-Pure_CSS-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> A modern, responsive peer-to-peer campus marketplace designed for university students to buy, sell, and trade textbooks, electronics, bicycles, hostel essentials, and stationery within a verified student community.

---

## 🌐 Live Website

[![Live Website](https://img.shields.io/badge/🚀_Live_Website-Open_Now-blue?style=for-the-badge&logo=vercel)](https://ucampusmart.vercel.app/)

## 🌟 Key Features

### 🛍️ Marketplace & Product Discovery
- **Faceted Filtering & Search**: Instant keyword search, category filtering, price range sliders, item condition filters, and sorting (price, popularity, newest).
- **Interactive Product Cards**: Dynamic badges (Verified, Urgent, Featured, Negotiable), instant wishlist toggling, and rating indicators.
- **Quick View Modal**: Inspect product specifications, high-res image previews, seller badges, and location without leaving the catalog.
- **Detailed Product Pages**: Multi-image galleries, seller verification badges, condition breakdown, safety tips, similar product recommendations, and direct contact actions.

### 📦 Seamless Listing & Selling
- **Interactive Sell Flow**: Upload product photos with preview and removal capabilities.
- **Rich Metadata**: Categorization, condition tags (Brand New, Like New, Good, Fair), negotiable pricing flag, location/hostel details, and description inputs.
- **Form Validation & Notifications**: Real-time feedback with animated toast notifications.

### 💬 Real-Time In-App Messaging
- **Messenger-Style Chat UI**: Sidebar with conversation threads, unread counts, and active chat states.
- **Context-Aware Headers**: Direct product reference attached to chats for streamlined negotiations.

### 👤 Student Dashboard & Profile
- **Active Listings Management**: Monitor status (Active, Sold, Pending) with quick action controls.
- **Wishlist / Saved Items**: Dedicated wishlist section persisted to local storage.
- **Order & Transaction History**: Summary of past campus trades and purchases.
- **Account & Security Settings**: Manage profile details, campus verification status, and notification preferences.

### 🛡️ Admin Moderation Center
- **Overview Analytics**: Key performance metrics (Total Users, Active Listings, Resolved Reports, Gross Value).
- **Listing & User Management**: Review flagged items, verify student credentials, and manage category listings.

### 🌓 Adaptive Theming & UX Excellence
- **Full Dark / Light Mode**: Smooth theme transitions powered by CSS custom properties (variables) and persistent across browser sessions via `localStorage`.
- **Pure CSS Architecture**: Zero UI framework dependencies; handcrafted with modern CSS Grid, Flexbox, glassmorphic surfaces, and micro-interactions.
- **Responsive Layout**: Designed mobile-first, ensuring an optimal experience across phones, tablets, and desktops.

---

## 🛠️ Tech Stack

- **Core Framework**: [React 18](https://react.dev/)
- **Routing**: [React Router DOM v6](https://reactrouter.com/)
- **Build Tooling**: [Vite](https://vitejs.dev/)
- **Styling**: Vanilla CSS (CSS Variables, Flexbox, CSS Grid, Glassmorphism)
- **State Management**: React Context API (`AppContext`, `ThemeContext`)
- **Data Persistence**: Browser `localStorage` (theme preferences, wishlist state)

---

## 📁 Project Structure

```text
ucampus_mart/
├── index.html                  # HTML entry point
├── package.json                # Project dependencies and scripts
├── vite.config.js              # Vite configuration
└── src/
    ├── main.jsx                # Application root mount
    ├── App.jsx                 # Route definitions and layout wrappers
    ├── layouts/
    │   └── MainLayout.jsx      # Global layout (Navbar, Footer, Toast container)
    ├── pages/
    │   ├── Home/               # Hero banner, featured listings, categories
    │   ├── Marketplace/        # Search, faceted filters, product grid/list
    │   ├── ProductDetails/     # Image gallery, seller bio, safety guide
    │   ├── Categories/         # Category catalog & exploration
    │   ├── SellItem/           # Listing creation form with image upload
    │   ├── Wishlist/           # Saved products collection
    │   ├── Messages/           # Chat interface with sellers
    │   ├── Profile/            # Student dashboard, active listings, settings
    │   ├── Admin/              # Admin metrics, user & listing moderation
    │   ├── Auth/               # Split-screen Login, Register, Forgot Password, OTP
    │   └── NotFound/           # Custom 404 page
    ├── components/             # Reusable UI component library
    │   ├── Avatar/             # User avatar with fallback initials
    │   ├── Badge/              # Dynamic status and tag badges
    │   ├── Button/             # Multi-variant button component
    │   ├── CategoryCard/       # Category exploration cards
    │   ├── ChitkaraLogo/       # Campus branding SVG logo
    │   ├── EmptyState/         # Zero-data feedback displays
    │   ├── Footer/             # Main footer with links & newsletter
    │   ├── Navbar/             # Responsive header with search, theme switch & menu
    │   ├── ProductCard/        # Product presentation tile
    │   ├── QuickViewModal/     # Fast preview modal for product cards
    │   ├── ReviewCard/         # Customer reviews & ratings
    │   ├── SearchBar/          # Header search with suggestions
    │   ├── StatsCard/          # Metric card for dashboard statistics
    │   └── Toast/              # Animated toast notification manager
    ├── context/
    │   ├── AppContext.jsx      # Global state (wishlist, listings, notifications)
    │   └── ThemeContext.jsx    # Dark/Light mode theme state & toggling
    ├── data/
    │   ├── categories.js       # Predefined campus categories
    │   ├── mockData.js         # Initial mock products and reviews
    │   └── products.js         # Product seed dataset
    ├── styles/
    │   ├── index.css           # Global resets, typography & CSS tokens
    │   └── variables.css       # Color palettes, shadows, border-radii
    └── utils/
        └── ScrollToTop.jsx     # Route-change scroll restoration
```

---

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (version 18.0.0 or higher) installed on your system.

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/ucampus_mart.git
   cd ucampus_mart
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```

4. **Access the application**:
   Open your browser and navigate to `http://localhost:5173` (or the URL displayed in your terminal).

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts Vite development server with Hot Module Replacement (HMR) |
| `npm run build` | Compiles and optimizes assets for production into the `dist/` directory |
| `npm run preview` | Runs a local web server to preview the production build output |

---

## 🧭 Application Routes

| Path | View / Purpose |
| :--- | :--- |
| `/` | **Home**: Featured categories, recent listings, campus perks, call-to-actions |
| `/marketplace` | **Marketplace**: Complete catalog with filtering, search, sorting & quick views |
| `/product/:id` | **Product Details**: Complete listing info, image gallery & seller contact |
| `/categories` | **Categories**: Browse all product groups and departments |
| `/sell` | **Sell Item**: Create and publish a new campus listing |
| `/wishlist` | **Wishlist**: View and manage saved items |
| `/messages` | **Messages**: In-app chat interface with buyers and sellers |
| `/profile` | **Profile**: Student dashboard, listings manager, purchase history & settings |
| `/admin` | **Admin Dashboard**: Moderation, analytics, user & listing management |
| `/login` | **Login**: User sign-in with remember me & social auth options |
| `/register` | **Register**: New student account onboarding |
| `/forgot-password` | **Forgot Password**: Password reset request |
| `/verify-otp` | **OTP Verification**: One-time passcode security verification |

---

## 🔌 Backend Integration Guide

This project is currently structured as a client-side single-page application with mock datasets in `src/data/` and global state management in `AppContext.jsx`.

To integrate with a real backend (e.g., **Node.js / Express + PostgreSQL / MongoDB / Firebase**):

1. **Create an API Service Layer**:
   Add an API client (such as Axios or native `fetch`) under `src/services/api.js` configured with your base API URL and token interceptors:
   ```javascript
   const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
   ```
2. **Replace Mock Imports**:
   Update `AppContext.jsx` and page components to fetch listings, conversations, and user profiles from your REST or GraphQL endpoints using `useEffect` or React Query.
3. **Persist Authentication**:
   Replace mock authentication states with JWT / session storage tokens to secure user-specific routes (`/sell`, `/messages`, `/profile`, `/admin`).

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
