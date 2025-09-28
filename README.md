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
└─ backend/                       # Express API
   ├─ routes/                    # auth, products, categories, cart, orders, users, admin
   ├─ middleware/                # auth, adminAuth (role-based access)
   ├─ config/                    # database.js (mysql2 pool)
   ├─ services/                  # notificationService (WebSocket)
   ├─ socket/                    # socketServer.js (real-time notifications)
   ├─ scripts/                   # Database setup scripts and SQL files
   │  ├─ database/               # schema.sql, seeds.sql
   │  ├─ seed_users.js           # User seeding script
   │  ├─ setup-database.js       # Main setup script
   │  ├─ setup-database.bat      # Windows setup script
   │  └─ setup-database.sh       # Linux/macOS setup script
   └─ server.js                  # Express app, CORS, rate-limit
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

## Quick Setup

### Prerequisites

- Node.js 18+
- MySQL 8+
- Git

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd CNPMM_211110611_BT_week

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
cd ..
```

### 2. Environment Configuration

Create a `.env` file in the `backend` directory:

```bash
cd backend
copy .env.example .env   # Windows
# or
cp .env.example .env     # Linux/macOS
```

Edit the `.env` file with your database credentials:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=shopping_website
JWT_SECRET=your-secret-key
PORT=5000
BCRYPT_ROUNDS=10
```

### 3. Database Setup

**Option A: Automated Setup (Recommended)**

```bash
# Windows
backend\scripts\setup-database.bat

# Linux/macOS
./backend/scripts/setup-database.sh

# Or run directly with Node.js
cd backend/scripts
node setup-database.js
```

**Option B: Manual Setup**

```bash
# Create database and tables
mysql -u root -p < backend/scripts/database/schema.sql

# Seed users with proper password hashing
cd backend/scripts
node seed_users.js
cd ../..

# Insert sample data
mysql -u root -p < backend/scripts/database/seeds.sql
```

### 4. Start the Application

**Terminal 1 - Backend:**

```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

### Default Login Credentials

**Admin Account:**

- Email: `admin@gmail.com`
- Password: `password123`

**Test User Accounts:**

- Email: `john@example.com` | Password: `password123`
- Email: `jane@example.com` | Password: `password123`

## Useful Scripts

### Development

- **Backend**: `npm run dev` – starts Express with relaxed rate limit in dev
- **Frontend**: `npm run dev` – starts Next.js on http://localhost:3000

### Database Management

- **Setup Database**: `cd backend/scripts && node setup-database.js` – automated database setup
- **Seed Users**: `cd backend/scripts && node seed_users.js` – create/update user accounts
- **Reset Database**: Drop and recreate database, then run setup script

### Production

- **Backend**: `npm start` – starts Express in production mode
- **Frontend**: `npm run build && npm start` – builds and serves Next.js app

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
