# CampusMart

A premium, production-quality frontend for a campus marketplace — buy, sell, and exchange books, electronics, cycles, hostel essentials, and more with verified students.

## Tech Stack
React 18 · React Router DOM · Vite · Plain CSS (Flexbox/Grid, CSS variables) · No UI frameworks

## Getting Started
```bash
npm install
npm run dev
```
Then open the printed local URL (usually http://localhost:5173).

## Build
```bash
npm run build
npm run preview
```

## What's included
- Home, Categories, Marketplace (with filters/search/sort/pagination), Product Details, Sell Item (drag-and-drop upload), Wishlist
- Auth: Login, Register, Forgot Password, OTP Verification (split-screen layout)
- Profile Dashboard (listings, wishlist, messages, purchase history, settings)
- Messages (messenger-style chat UI)
- Admin Dashboard (users, listings, reports, categories, analytics — dummy data)
- Full dark mode with localStorage persistence
- Reusable component library in `src/components`
- Realistic dummy data in `src/data`

## Folder Structure
```
src/
  components/   reusable UI components
  pages/        route-level pages
  layouts/      shared page layout (navbar/footer)
  context/      ThemeContext (dark mode), AppContext (wishlist/toasts/products)
  data/         dummy products, categories, reviews
  utils/        small helpers (ScrollToTop)
  styles/       global CSS variables & resets
```

## Connecting a backend
This is a frontend-only build. All data lives in `src/data` and `AppContext`. To wire it to a Node.js + Express + MySQL backend, replace the seed data imports with API calls (e.g. inside `AppContext` or a new `src/services/api.js`) and swap `localStorage` wishlist persistence for authenticated user data.
