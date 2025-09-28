# Shopping Website – Next.js (App Router) + Express + MySQL

A full‑stack e‑commerce site featuring authentication, product catalog, cart, orders, profile management, and a comprehensive admin panel with role-based access control.

## Project Structure

```
CNPMM_211110611_BT_week/
├─ frontend/                      # Next.js 15 app (App Router)
│  ├─ src/
│  │  ├─ app/                    # Routes (e.g. products/, orders/, admin/)
│  │  ├─ components/             # Reusable UI (Header, AdminLayout, ConditionalLayout)
│  │  ├─ hooks/                  # Custom hooks (useAuth, useCartAPI, useInfiniteScroll, ...)
│  │  ├─ store/                  # Redux Toolkit + RTK Query
│  │  ├─ types/                  # Shared TS types (product, orderTypes, user, ...)
│  │  └─ utils/                  # Helpers (toast, etc.)
│  └─ next.config.ts             # Rewrites /api → backend
├─ backend/                       # Express API
│  ├─ routes/                    # auth, products, categories, cart, orders, users, admin
│  ├─ middleware/                # auth, adminAuth (role-based access)
│  ├─ config/                    # database.js (mysql2 pool)
│  ├─ services/                  # notificationService (WebSocket)
│  ├─ socket/                    # socketServer.js (real-time notifications)
│  └─ server.js                  # Express app, CORS, rate-limit
└─ database/                      # schema.sql, seeds.sql
```

## Highlights

### Customer Features

- **Authentication**: JWT-based auth with role-based access control (admin/user)
- **Product Catalog**: Infinite scroll via `useInfiniteScroll` (IntersectionObserver + fallback)
- **Shopping Cart**: Real-time cart management with debounced API calls
- **Orders**: Complete order lifecycle (pending → processing → shipped → delivered)
- **Profile Management**: User profiles with avatar support
- **Notifications**: Real-time notifications via WebSocket

### Admin Panel Features

- **Role-Based Access**: Automatic redirect based on user role (admin → `/admin`, user → `/`)
- **Dashboard**: Comprehensive statistics with real-time data
  - Monthly/Yearly revenue and order statistics
  - Top products and customers
  - Recent orders and new customer metrics
- **User Management**:
  - View all users (excluding admin accounts)
  - User detail pages with profile information
  - Ban/Unban user accounts
  - Send notifications to specific users
- **Order Management**:
  - View all orders with filtering and search
  - Order detail pages with customer information
  - Update order status (pending → processing → shipped → delivered)
- **Notification System**: Send broadcast notifications to all users
- **Responsive Design**: Mobile-friendly admin interface with sidebar navigation

### Technical Features

- **Centralized Types**: Shared TypeScript types in `frontend/src/types/`
- **State Management**: Redux Toolkit with RTK Query for API state
- **Real-time Updates**: WebSocket integration for live notifications
- **Security**: Admin-only routes protected by middleware
- **Currency Formatting**: USD currency display with proper formatting

## Requirements

- Node.js 18+
- MySQL 8+

## Setup

1. Database

```
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seeds.sql   # optional
```

2. Backend

```
cd backend
npm i
copy .env.example .env   # create if not present
# .env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=shopping_website
JWT_SECRET=dev-secret
PORT=5000

npm run dev
```

3. Frontend

```
cd frontend
npm i
npm run dev
```

The Next.js app proxies API calls to the backend via `next.config.ts` rewrites.

## Useful Scripts

- Backend: `npm run dev` – starts Express with relaxed rate limit in dev
- Frontend: `npm run dev` – starts Next.js on http://localhost:3000

## Admin Panel Usage

### Accessing the Admin Panel

1. Create an admin account by setting `is_admin = 1` in the database
2. Log in with admin credentials
3. You'll be automatically redirected to `/admin` dashboard

### Admin Routes

- `/admin` - Dashboard with statistics and overview
- `/admin/users` - User management (view, ban/unban, notify)
- `/admin/users/[id]` - Individual user details
- `/admin/orders` - Order management and status updates
- `/admin/orders/[id]` - Individual order details
- `/admin/notifications` - Send broadcast notifications

### Key Features

- **Automatic Role Detection**: Admins are redirected to admin panel, users to shop
- **Real-time Data**: Dashboard shows live statistics from the database
- **User Management**: Ban/unban users and send targeted notifications
- **Order Tracking**: View and update order statuses
- **Responsive Design**: Works on desktop and mobile devices

## Notes

- **Images**: External domains are configured in `next.config.ts`; `SmartImage` bypasses optimization for arbitrary URLs.
- **LocalStorage**: Avatar base64 is not persisted to avoid quota errors; profile fetch restores it after refresh.
- **Pagination**: Products lazy-load until the last page; duplicate IDs are deduped client-side.
- **Role-Based Routing**: Admin users cannot access regular user pages and vice versa.
- **Security**: All admin routes are protected by `requireAdmin` middleware.
- **Currency**: All prices are displayed in USD format.
