# 🍽️ Delycia

> **A modern, multi-tenant restaurant management SaaS platform built with TanStack Start**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TanStack Start](https://img.shields.io/badge/TanStack-Start-orange.svg)](https://tanstack.com/start)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-lightgrey.svg)](https://expressjs.com/)

Delycia is a comprehensive restaurant management platform that enables restaurant owners to manage menus, orders, tables, staff, and customers from a centralized system with a per-restaurant subscription model. Built with modern web technologies and designed for scalability, security, and real-time operations.

---

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Applications](#-applications)
- [Authentication & Security](#-authentication--security)
- [Database Schema](#-database-schema)
- [API Documentation](#-api-documentation)
- [Real-Time Features](#-real-time-features)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### For Customers (Client App)
- 🔍 Browse restaurant menus with rich item details
- 🛒 Add items to cart with variants and addons
- 📱 QR code-based table ordering
- 💳 Multiple payment options
- 📦 Order tracking and history
- ⭐ Favorite items and restaurants
- 🔔 Real-time order status notifications

### For Restaurant Owners/Staff (Admin App)
- 📊 Real-time analytics dashboard
- 🍕 Complete menu management (items, categories, variants, addons)
- 📋 Live order management with WebSocket updates
- 🪑 Table management and status tracking
- 👥 Staff management with role-based access control
- 📈 Sales reports and inventory analytics
- 🎫 QR code generation for tables
- 💰 Subscription and billing management
- 🔊 Audio notifications for new orders
- 📱 Multi-device session management

### For Platform Administrators (SuperAdmin App)
- 🏢 Manage all restaurants on the platform
- 👤 User management across all tenants
- 💳 Subscription plan management
- 📋 Menu template management
- 🔧 System health monitoring
- 📊 Platform-wide analytics

---

## 🏗️ Architecture

Delycia follows a **multi-tenant SaaS architecture** with three independent frontend applications communicating with a centralized Express.js backend through a **BFF (Backend-for-Frontend)** pattern.

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Applications                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Client     │  │    Admin     │  │  SuperAdmin  │      │
│  │   :4000      │  │    :4500     │  │    :5000     │      │
│  │ (TanStack)   │  │ (TanStack)   │  │ (TanStack)   │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         └──────────────────┼──────────────────┘              │
│                            │                                 │
│                    BFF Proxy (/api/*)                        │
└────────────────────────────┼─────────────────────────────────┘
                             │
┌────────────────────────────┼─────────────────────────────────┐
│                    Backend Server                            │
│                   ┌────────┴────────┐                        │
│                   │  Express.js API │                        │
│                   │      :3000      │                        │
│                   └────────┬────────┘                        │
│                            │                                 │
│         ┌──────────────────┼──────────────────┐             │
│         │                  │                  │             │
│    ┌────▼────┐      ┌──────▼──────┐    ┌─────▼─────┐       │
│    │ MariaDB │      │    Redis    │    │ Socket.IO │       │
│    │  :3306  │      │    :6379    │    │ WebSocket │       │
│    └─────────┘      └─────────────┘    └───────────┘       │
└─────────────────────────────────────────────────────────────┘
```

### Key Architectural Patterns

| Pattern | Purpose |
|---------|---------|
| **BFF (Backend-for-Frontend)** | Secure httpOnly cookie management, transparent token refresh |
| **Dual JWT Token Strategy** | Short-lived access tokens (15min) + long-lived refresh tokens (30d) |
| **RefreshCoordinator Singleton** | Deduplicates concurrent token refresh attempts |
| **Circuit Breaker** | Prevents cascading failures in token refresh |
| **Graceful Degradation** | App continues working even if Redis is down |
| **Multi-tenant Scoping** | Restaurant isolation via `rid` parameter in all queries |
| **Role-Based Access Control** | 8-tier role system with middleware enforcement |

---

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js (ESM)
- **Framework**: Express.js v4
- **Database**: MariaDB 11.8 (connection pool: 50 connections)
- **Cache/Sessions**: Redis v5.6
- **Authentication**: JWT (jsonwebtoken) with dual token strategy
- **Real-time**: Socket.IO v4
- **Rate Limiting**: express-rate-limit + Redis-backed custom limiter
- **Security**: csrf-csrf (Double Submit Cookie), input sanitization
- **AI Integration**: Google GenAI, OpenAI
- **Vector Search**: Qdrant
- **Scheduled Jobs**: node-cron
- **QR Codes**: qrcode library

### Frontend (All Apps)
- **Framework**: TanStack Start (SSR with file-based routing)
- **Build Tool**: Vite v7
- **Routing**: TanStack Router (type-safe, file-based)
- **State Management**: TanStack Query v5 + Zustand
- **UI Components**: Radix UI primitives + shadcn/ui
- **Styling**: Tailwind CSS v4
- **Forms**: react-hook-form + Zod validation
- **HTTP Client**: Axios
- **Animation**: Framer Motion
- **Icons**: Lucide React, Tabler Icons, MUI Icons
- **Real-time**: Socket.IO Client

---

## 📁 Project Structure

```
Delycia/
├── server/                 # Express.js REST API + WebSocket server
│   ├── src/
│   │   ├── controller/v1/  # Route controllers (web, admin, superadmin)
│   │   ├── routes/v1/      # API routes
│   │   ├── middlewares/    # Auth, CSRF, rate limiting, sanitization
│   │   ├── services/       # Redis, session, token cache, rate limiter
│   │   ├── sockets/        # Socket.IO namespaces
│   │   ├── cron_jobs/      # Scheduled background tasks
│   │   └── config/         # Database connection and initialization
│   └── Dockerfile
│
├── client/                 # Customer-facing app (:4000)
│   ├── src/
│   │   ├── routes/         # TanStack Router file-based routes
│   │   │   ├── api/        # BFF server routes
│   │   │   ├── auth/       # Login, register
│   │   │   └── user/       # User profile
│   │   ├── lib/            # withAuth, refreshCoordinator, circuitBreaker
│   │   ├── hooks/          # TanStack Query hooks, custom hooks
│   │   ├── context/        # AuthProvider, StoreProvider
│   │   ├── store/          # Zustand state management
│   │   └── schemas/        # Zod validation schemas
│   └── Dockerfile
│
├── admin/                  # Restaurant admin panel (:4500)
│   ├── src/
│   │   ├── routes/         # Dashboard, inventory, orders, staff, reports
│   │   │   └── api/        # 50+ BFF server routes
│   │   ├── lib/            # Admin-specific withAuth, axios config
│   │   ├── hooks/          # useAuth, useDashboardData, useWebSocketManager
│   │   ├── services/       # sessionService, tokenService
│   │   └── middleware/     # Route-level auth middleware
│   └── Dockerfile
│
├── superadmin/             # Platform management panel (:5000)
│   ├── src/
│   │   ├── routes/         # Restaurants, users, subscriptions, menus
│   │   │   └── api/        # BFF routes
│   │   ├── services/       # Session and token management
│   │   └── hooks/          # Custom hooks
│   └── Dockerfile
│
├── landing/                # Marketing/landing page
├── design/                 # Design assets
├── skills/                 # AI/agent skills
└── delycia_db_structure.sql # Full MariaDB schema dump
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm
- MariaDB 11.8+
- Redis 5.6+
- Docker (optional, for containerized deployment)

### Environment Setup

Each application requires its own `.env` file. Sample files are provided:

```bash
# Server
cp server/.env.example server/.env

# Client
cp client/.env.sample client/.env

# Admin
cp admin/.env.sample admin/.env

# SuperAdmin
cp superadmin/.env.sample superadmin/.env
```

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/delycia.git
cd delycia
```

2. **Install dependencies for each app**
```bash
# Server
cd server && npm install

# Client
cd ../client && pnpm install

# Admin
cd ../admin && pnpm install

# SuperAdmin
cd ../superadmin && pnpm install
```

3. **Set up the database**
```bash
# Import the database schema
mysql -u root -p < delycia_db_structure.sql
```

4. **Start Redis**
```bash
redis-server
```

5. **Start the applications**

```bash
# Terminal 1 - Backend Server
cd server && npm run dev

# Terminal 2 - Client App
cd client && pnpm run dev

# Terminal 3 - Admin App
cd admin && pnpm run dev

# Terminal 4 - SuperAdmin App
cd superadmin && pnpm run dev
```

### Access the Applications

- **Client App**: http://localhost:4000
- **Admin App**: http://localhost:4500
- **SuperAdmin App**: http://localhost:5000
- **API Server**: http://localhost:3000

---

## 📱 Applications

### 1. Client App (Customer-Facing)

**Port**: 4000

The customer-facing application where users can:
- Browse restaurants by username (e.g., `/restaurant-name`)
- View menus with categories, items, variants, and addons
- Place orders via QR code scanning or direct browsing
- Track order status in real-time
- Manage their profile and order history

**Key Routes**:
- `/` - Home page
- `/:username` - Restaurant page (dynamic)
- `/cart` - Shopping cart
- `/checkout` - Order checkout
- `/orders` - Order history
- `/auth/login` - Customer login

### 2. Admin App (Restaurant Dashboard)

**Port**: 4500

The restaurant management dashboard for owners and staff:
- Real-time order management with WebSocket updates
- Complete menu management (CRUD for items, categories, variants, addons)
- Table management and status tracking
- Staff management with role-based permissions
- Analytics dashboard with sales reports
- QR code generation for tables
- Subscription and billing management
- Multi-restaurant support (for users with access to multiple restaurants)

**Key Routes**:
- `/dashboard` - Analytics overview
- `/inventory` - Menu management
- `/orders` - Live order management
- `/staff` - Staff management
- `/reports` - Sales and analytics reports
- `/settings` - Restaurant settings
- `/billing` - Subscription management
- `/qr-codes` - QR code generator

### 3. SuperAdmin App (Platform Management)

**Port**: 5000

The platform administration panel for managing the entire SaaS:
- Manage all restaurants on the platform
- User management across all tenants
- Subscription plan configuration
- Menu template management (shared across restaurants)
- System health monitoring
- Platform-wide analytics

**Key Routes**:
- `/dashboard` - Platform overview
- `/restaurants` - All restaurants
- `/users` - All users
- `/subscriptions` - Subscription management
- `/menus` - Menu templates
- `/staff` - Staff across restaurants

---

## 🔐 Authentication & Security

### Dual JWT Token Strategy

Delycia uses a sophisticated authentication system with two types of tokens:

| Token Type | Lifetime | Storage | Purpose |
|-----------|----------|---------|---------|
| **Access Token** | 15 minutes | httpOnly cookie | API authorization |
| **Refresh Token** | 30 days | httpOnly cookie + DB + Redis | Token renewal |

### Token Cookie Names

To prevent cookie collisions, each app uses different cookie names:

- **Client**: `access_token`, `refresh_token`
- **Admin**: `admin_access_token`, `admin_refresh_token`
- **SuperAdmin**: `superadmin_access_token`, `superadmin_refresh_token`

### Authentication Flow

1. **Login**: User submits credentials → Backend verifies → Issues token pair → Stores in httpOnly cookies
2. **Authenticated Request**: Browser sends cookies → BFF extracts token → Forwards to backend with Bearer token
3. **Token Refresh**: Access token expires → BFF detects 401 → Automatically refreshes using refresh token → Retries original request

### Security Features

- **httpOnly Cookies**: Tokens never exposed to JavaScript (XSS protection)
- **CSRF Protection**: Double Submit Cookie pattern for state-changing operations
- **Rate Limiting**: Redis-backed per-user and per-IP rate limiting
- **Input Sanitization**: XSS and injection prevention on all inputs
- **Role-Based Access Control**: 8-tier role system with middleware enforcement
- **Session Management**: Multi-device tracking with Redis + MariaDB dual storage
- **Circuit Breaker**: Prevents cascading failures in token refresh
- **Graceful Degradation**: App continues working even if Redis is down

### withAuth() Helper

The `withAuth()` function is the core BFF authentication helper that:
1. Extracts access token from httpOnly cookies
2. Passes it to your handler function
3. Catches 401/403 errors (token expired)
4. Automatically refreshes the token via RefreshCoordinator
5. Retries the original request with the new token
6. Sets updated cookies in the response

```typescript
// Example usage in a BFF route
export const ServerRoute = createServerFileRoute('/api/orders').methods({
  GET: async ({ request }) => {
    return withAuth(request, async (accessToken, authHeaders, req) => {
      const res = await axiosInstance.get('/admin/orders', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      return jsonResponse(res.data, 200, authHeaders)
    })
  },
})
```

---

## 🗄️ Database Schema

### Core Tables

| Table | Purpose |
|-------|---------|
| `users` | All user accounts (customers, admins, staff, superadmin) |
| `roles` | Role definitions (0=Customer, 1=SuperAdmin, 2=Admin, etc.) |
| `restaurants` | Restaurant profiles and settings |
| `restaurant_access` | Many-to-many: user access to restaurants |
| `categories` | Menu categories per restaurant |
| `inventories` | Menu items (food) |
| `variants` | Item size/price variants |
| `addons` | Extra toppings/sides |
| `orders` | Individual order line items |
| `carts` | Cart grouping for multi-item orders |
| `tables` | Restaurant table management |
| `subscriptions` | Active restaurant subscriptions |
| `subscription_plans` | Available plans (trial, monthly, yearly) |
| `user_sessions` | Persistent session tracking |
| `qr_codes` | Generated QR codes |

### Role Hierarchy

| Role | ID | Power | Capabilities |
|------|----|----|--------------|
| Customer | 0 | 0 | Browse, order, pay |
| Waiter | 5 | 60 | View/create/update orders |
| Kitchen Staff | 6 | 50 | Order management |
| Delivery | 7 | 40 | Track deliveries |
| Manager | 4 | 70 | Full restaurant operations |
| Owner | 3 | 80 | Full control of own restaurant |
| Admin | 2 | 90 | High-level management |
| SuperAdmin | 1/1000 | 100 | Full system control |

---

## 📡 API Documentation

### API Route Groups

| Prefix | Purpose | Auth Required |
|--------|---------|---------------|
| `/api/v1/users/auth` | Customer auth (login, register, OTP) | No |
| `/api/v1/users` | Customer profile | Yes (JWT) |
| `/api/v1/orders` | Customer orders | Yes (JWT) |
| `/api/v1/inventory` | Menu browsing (public data) | Partial |
| `/api/v1/restaurant` | Restaurant info (public) | No |
| `/api/v1/tables` | Table management | Yes (JWT) |
| `/api/v1/sessions` | Session management | Yes (JWT) |
| `/api/v1/admin/auth` | Admin login | No |
| `/api/v1/admin/*` | Admin dashboard, inventory, orders, CRM | Yes (JWT + Admin) |
| `/api/v1/superadmin/auth` | Superadmin login | No |
| `/api/v1/superadmin/*` | Platform management | Yes (JWT + Superadmin) |
| `/api/v1/app/*` | QR codes, temp sessions, voice | Varies |
| `/api/v1/system/*` | Embeddings, cron jobs, upsells | Internal |

### Middleware Chain

All requests flow through this middleware chain:

```
Request → express.json → cookieParser → CORS → Global Rate Limit
  → sanitizeInput → authMiddleware → roleMiddleware → Route Handler
```

---

## ⚡ Real-Time Features

### WebSocket (Socket.IO)

Real-time updates are powered by Socket.IO for:
- **New Order Notifications**: Instant alerts when customers place orders
- **Order Status Changes**: Live updates as orders move through preparation stages
- **Table Status Updates**: Real-time table availability tracking
- **Kitchen Display System**: Live order queue for kitchen staff

### Redis Implementation

Redis is used for three distinct purposes:

1. **Token Caching** (5s TTL)
   - Reduces backend auth load by ~80%
   - Key format: `delycia:token:{last-32-chars-of-refresh-token}`

2. **Session Management** (30d TTL)
   - Multi-device session tracking
   - Key format: `delycia:session:{uuid}`
   - Dual storage: Redis (fast) + MariaDB (persistent)

3. **Rate Limiting**
   - Sliding window counter algorithm
   - Per-user and per-IP limits
   - Key format: `delycia:ratelimit:{type}:{action}:{identifier}`

---

## 🐳 Deployment

### Docker Deployment

Each application has its own Dockerfile:

```bash
# Build and run with Docker Compose
docker-compose up -d
```

### Service Ports

| Service | Port | Container |
|---------|------|-----------|
| Server (API) | 3000 | `server/Dockerfile` |
| Client | 4000 | `client/Dockerfile` |
| Admin | 4500 | `admin/Dockerfile` |
| SuperAdmin | 5000 | `superadmin/Dockerfile` |
| MariaDB | 3306 | Managed service |
| Redis | 6379 | Managed service |

### Production Environment Variables

Ensure all production `.env` files are configured:
- `server/.env.production`
- `client/.env.production`
- `admin/.env.production`
- `superadmin/.env.production`

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and conventions
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with [TanStack Start](https://tanstack.com/start)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)

---

## 📞 Support

For support, email support@delycia.com or open an issue in this repository.

---

<div align="center">
  <strong>Made with ❤️ by Sayan</strong>
</div>
