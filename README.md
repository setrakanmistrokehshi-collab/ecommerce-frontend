# VitaCore Frontend — v1.0.0

Production-grade React storefront + Admin Dashboard for the VitaCore Health Supplements platform.

---

## Tech Stack

| Layer         | Technology                            |
|---------------|---------------------------------------|
| Framework     | React 18 + Vite 5                     |
| Routing       | React Router v6                       |
| State         | Zustand (auth + cart, persisted)      |
| API Client    | Axios (JWT auto-refresh, interceptors)|
| Forms         | React Hook Form                       |
| Charts        | Recharts                              |
| Styling       | Pure CSS (design system tokens)       |
| Toast         | React Hot Toast                       |
| Containerized | Docker + Nginx                        |
| CI/CD         | GitHub Actions → GHCR → SSH deploy    |

---

## Quick Start

```bash
# 1. Clone and install
git clone <repo-url>
cd vitacore-frontend
npm install

# 2. Configure environment
cp .env.example .env
# Set VITE_API_BASE_URL to your backend URL

# 3. Start dev server
npm run dev
# → http://localhost:5173
```

---

## Project Structure

```
src/
├── api/
│   └── client.js          # Axios instance + all endpoint wrappers
├── context/
│   ├── authStore.js        # Zustand auth store (persisted)
│   └── cartStore.js        # Zustand cart store (persisted)
├── components/
│   ├── layout/
│   │   ├── StorefrontLayout.jsx   # Navbar + footer
│   │   └── AdminLayout.jsx        # Admin sidebar + topbar
│   └── ui/
│       └── index.jsx       # ProductCard, Modal, Pagination, StatCard…
├── pages/
│   ├── HomePage.jsx
│   ├── ProductsPage.jsx
│   ├── ProductDetailPage.jsx
│   ├── CartPage.jsx
│   ├── CheckoutPage.jsx
│   ├── OrderSuccessPage.jsx
│   ├── LoginPage.jsx          # LoginPage + RegisterPage + ForgotPasswordPage
│   ├── ProfilePage.jsx
│   ├── OrdersPage.jsx
│   ├── WishlistPage.jsx
│   └── admin/
│       ├── AdminDashboard.jsx
│       ├── AdminAnalytics.jsx
│       ├── AdminProducts.jsx
│       ├── AdminOrders.jsx
│       └── AdminUsers.jsx
├── App.jsx                 # Router + guards
├── main.jsx
└── index.css               # Design system tokens + global styles
```

---

## API Coverage

All VitaCore backend v2.0 endpoints are wired:

| Module    | Coverage                                                  |
|-----------|-----------------------------------------------------------|
| Auth      | Register, Login, Logout, Refresh, Verify, Forgot/Reset   |
| Products  | List, Detail, Review, Create, Update, Delete             |
| Orders    | My Orders, Detail, Cancel, Admin All, Status Update      |
| Payments  | Validate Promo, Checkout (Nomba), Verify Status          |
| Users     | Profile, Update, Password, Addresses, Wishlist, Newsletter|
| Admin     | Dashboard, Revenue, Top Products, Categories, Users       |

---

## Storefront Routes

| Route               | Auth | Description                  |
|---------------------|------|------------------------------|
| `/`                 | —    | Homepage (hero, categories)   |
| `/products`         | —    | Product listing + filters     |
| `/products/:slug`   | —    | Product detail + reviews      |
| `/cart`             | —    | Shopping cart                 |
| `/checkout`         | ✅   | Checkout + Nomba payment      |
| `/order-success`    | ✅   | Post-payment confirmation     |
| `/orders`           | ✅   | Order history                 |
| `/profile`          | ✅   | Profile, addresses, password  |
| `/wishlist`         | ✅   | Saved products                |
| `/login`            | —    | Login                         |
| `/register`         | —    | Register                      |
| `/forgot-password`  | —    | Password reset                |

## Admin Routes

| Route               | Description                          |
|---------------------|--------------------------------------|
| `/admin/dashboard`  | Stats, charts, recent orders, alerts |
| `/admin/analytics`  | Revenue trends, top products, categories |
| `/admin/products`   | CRUD, stock management, review toggle |
| `/admin/orders`     | Order management, status updates, notifications |
| `/admin/users`      | User management, activate/deactivate  |

---

## Authentication

- **Access tokens** stored in `localStorage` via `TokenStore`
- **Auto-refresh**: Axios interceptor retries queued requests after refreshing (no flicker)
- **Session expiry**: `vc:session-expired` CustomEvent triggers logout + redirect
- **Role guards**: `RequireAuth` and `RequireAdmin` route wrappers

---

## Docker Deployment

```bash
# Build production image
docker build \
  --build-arg VITE_API_BASE_URL=https://api.vitacore.ng \
  -t vitacore-frontend:latest .

# Run
docker run -p 80:80 vitacore-frontend:latest

# Or with docker-compose (full stack)
docker compose up -d
```

---

## CI/CD Pipeline

On every push to `main`:

1. **Lint** — ESLint check
2. **Build** — Vite production build with secrets
3. **Docker** — Build + push to GitHub Container Registry
4. **Deploy** — SSH into server, pull image, restart container

Requires GitHub Secrets:
- `VITE_API_BASE_URL`
- `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_KEY`

---

## Environment Variables

| Variable              | Required | Default                    |
|-----------------------|----------|----------------------------|
| `VITE_API_BASE_URL`   | Yes      | `http://localhost:3000`    |
| `VITE_APP_NAME`       | No       | `VitaCore Health`          |
| `VITE_APP_VERSION`    | No       | `1.0.0`                    |

---

## Design System

The UI uses a custom CSS design system with:

- **Palette**: Forest green + warm cream + amber accents
- **Fonts**: Playfair Display (headings) + DM Sans (body) + JetBrains Mono (code/IDs)
- **Admin theme**: Dark (`#0f1117` bg) with green/amber accents
- **Tokens**: All values as CSS custom properties in `index.css`

---

## Scalability Notes

- **Code splitting**: Recharts, React Router, and utilities are in separate chunks
- **Image strategy**: Cloudinary-ready (images stored as URL arrays)
- **Cart persistence**: Zustand + localStorage (survives page refresh)
- **API client**: Single Axios instance — swap `VITE_API_BASE_URL` for any env
- **Nginx**: Aggressive asset caching with `immutable` header; HTML never cached
- **Docker multi-stage**: Final image is nginx-only (~25MB), no Node in prod
