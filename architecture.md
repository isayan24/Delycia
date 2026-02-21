# Delycia — Full-Stack Architecture

> **Author**: Auto-generated from deep codebase analysis · **Date**: 2026-02-21  
> **Stack**: TanStack Start (Vite), Node.js/Express, MariaDB, Redis, Socket.IO  

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Application Breakdown](#2-application-breakdown)
3. [Authentication Architecture](#3-authentication-architecture)
4. [Database Schema](#4-database-schema)
5. [Server (API) Architecture](#5-server-api-architecture)
6. [Admin Application Architecture](#6-admin-application-architecture)
7. [Client Application Architecture](#7-client-application-architecture)
8. [Real-time Communication (WebSockets)](#8-real-time-communication-websockets)
9. [Roles & RBAC](#9-roles--rbac)
10. [Subscription & Billing](#10-subscription--billing)
11. [Feature Inventory](#11-feature-inventory)
12. [Infrastructure & Deployment](#12-infrastructure--deployment)
13. [Security Architecture](#13-security-architecture)
14. [Data Flow Diagrams](#14-data-flow-diagrams)

---

## 1. System Overview

Delycia is a **multi-tenant SaaS restaurant management platform**. It enables restaurants to manage menu, inventory, tables, staff, orders, and customers — all in real time. It also provides customers a mobile-friendly web interface to browse menus and place orders via QR code.

```
┌───────────────────────────┐    ┌────────────────────────────┐
│   Client App (TanStack)   │    │   Admin App (TanStack)     │
│   Port 4000 · Customer UI │    │   Port 4500 · Staff UI     │
└──────────┬────────────────┘    └────────────┬───────────────┘
           │ BFF /api/*                        │ BFF /api/*
           │ (Server-side routes)              │ (Server-side routes)
           ▼                                   ▼
┌──────────────────────────────────────────────────────────────┐
│                  Node.js / Express Server                     │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              REST API  /api/v1/...                      │ │
│  │  web/* · admin/* · app/* · superadmin/* · system/*     │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌──────────────────────┐ ┌──────────────────────────────┐   │
│  │  Socket.IO Namespaces│ │  Background Services         │   │
│  │  /orders             │ │  Redis SessionService        │   │
│  │  /qrcode             │ │  TokenCacheService           │   │
│  │  /temp-sessions      │ │  RateLimiterService          │   │
│  └──────────────────────┘ └──────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────┐   ┌──────────────────┐
│  MariaDB 11.8        │   │  Redis (Cache +  │
│  u419451251_Delycia  │   │  Sessions)       │
└──────────────────────┘   └──────────────────┘
```

Also in the ecosystem:
- **Landing** app (`/landing`) — public-facing marketing site
- **Superadmin** app (`/superadmin`) — platform-level admin panel
- **ImageKit** — CDN for all image hosting (logos, banners, inventory images)
- **ElevenLabs** — AI voice synthesis for QR order confirmation

---

## 2. Application Breakdown

| App | Framework | Default Port | Purpose |
|-----|-----------|-------------|---------|
| `admin` | TanStack Start (Vite + React) | 4500 | Restaurant staff dashboard (POS, orders, inventory, reports) |
| `client` | TanStack Start (Vite + React) | 4000 | Customer-facing menu & ordering web app |
| `server` | Node.js + Express | 3000 | REST API + WebSocket server |
| `superadmin` | TanStack Start (Vite + React) | 5000 | Platform-level admin panel |
| `landing` | TanStack Start / HTML | — | Public marketing site |

**Shared patterns:**
- Both `admin` and `client` use **TanStack Router** with file-based routing
- Both use **TanStack Query** for all data fetching/mutations
- Both implement a **BFF (Backend For Frontend)** layer via TanStack Start server-side handlers under `/api/` routes
- **Axios** with automatic token-refresh interceptors for all API calls

---

## 3. Authentication Architecture

Delycia implements a **dual-token, cookie-based JWT authentication** system with a BFF proxy layer to protect secrets.

### 3.1 Token Strategy

| Token | Storage | Lifetime | Purpose |
|-------|---------|---------|---------|
| Access Token (JWT) | `httpOnly` cookie | 15 min | API authentication |
| Refresh Token (JWT) | `httpOnly` cookie | 30 days | Silent access token renewal |
| Session ID | Redis | 30 days | Server-side session tracking per device |

JWT payload contains: `{ uid, id, role, iat, exp }`

### 3.2 Admin Auth Flow

```
User enters credentials (phone/username + password)
            │
            ▼
Admin App (React) ──POST /api/auth/login──► [BFF Server Route]
                                                    │
                                        ┌───────────▼────────────┐
                                        │ BFF: routes/api/auth/  │
                                        │ login.ts               │
                                        │ POST → backend         │
                                        │ /api/v1/admin/auth     │
                                        └───────────┬────────────┘
                                                    │
                                        ┌───────────▼────────────┐
                                        │ Express Server         │
                                        │ validates credentials, │
                                        │ creates JWT pair,      │
                                        │ creates Redis session  │
                                        └───────────┬────────────┘
                                                    │
                                        BFF sets httpOnly cookies:
                                        - delycia_admin_token
                                        - delycia_admin_refresh
                                        - session_id
                                            │
                                            ▼
                                User data stored in localStorage
                                (selected_rid, restaurant_rids)
```

### 3.3 Session Validation (BFF `withAuth` Pattern)

Every admin API call goes through `withAuth()`:

```
Request with httpOnly cookies
        │
        ▼
withAuth(request, callback)
        │
        ├─ Extract access token from cookie
        ├─ Try callback with current token
        │       │
        │       ├─ SUCCESS → return response + propagate fresh cookies
        │       │
        │       └─ 401 Error (token expired)
        │               │
        │               ▼
        │       RefreshCoordinator (singleton mutex)
        │       ├─ POST /api/v1/users/auth/refresh ← backend
        │       ├─ Receive new access + refresh tokens
        │       ├─ Retry original callback with new token
        │       └─ Set updated cookies in response
        │
        └─ Auth failure → 401 to client → useAuth.logout()
```

**Key files:**
- `admin/src/lib/withAuth.ts` — BFF proxy utility
- `admin/src/routes/api/auth/session.ts` — Session check endpoint
- `admin/src/routes/api/auth/refresh.ts` — Token refresh endpoint
- `admin/src/hooks/useAuth.ts` — Client-side auth state management
- `admin/src/services/sessionService.ts` — localStorage session persistence
- `admin/src/services/sessionCleanupService.ts` — Idle session cleanup
- `admin/src/services/tokenService.ts` — Axios token interceptors

### 3.4 Client Auth Flow (Customer)

```
Customer visits /:username (restaurant page)
        │
        ├─ QR Code scan → temp_sessions table (table_id + rid)
        │
        ├─ Phone number entry → OTP via login_tokens table
        │        └─ Token stored as SHA256 hash
        │
        ├─ OTP verified → JWT pair issued → httpOnly cookies
        │
        └─ Guest login → auto-created guest user record
```

**Key client auth files:**
- `client/src/routes/api/auth/` — 6 BFF auth handlers
- `client/src/routes/api/app.temp-session.ts` — QR session init
- `server/src/routes/v1/web/auth.routes.js` — OTP & JWT endpoints

### 3.5 Redis Session Service

```
SessionService (server/src/services/session.service.js)
│
├─ createSession(userId, refreshToken, req)
│     └─ Stores session object in Redis:
│           delycia:session:{sessionId}
│           delycia:user:sessions:{userId}  (list of session IDs)
│
├─ getSession(sessionId)
├─ updateSessionActivity(sessionId)
├─ deleteSession(sessionId) / deleteUserSessions(userId)
└─ cleanupExpiredSessions() — called by cron job
```

Session object includes: `{ sessionId, userId, refreshToken, deviceType, browser, os, ip, createdAt, lastActivity, expiresAt }`

---

## 4. Database Schema

**Database**: MariaDB 11.8 · `u419451251_Delycia_DB` · charset: `utf8mb4_unicode_ci`

### 4.1 Core Tables

```
┌─────────────────────┐    ┌─────────────────────┐
│      users          │    │    restaurants      │
├─────────────────────┤    ├─────────────────────┤
│ id (INT PK)         │    │ id (INT PK)         │
│ uid (VARCHAR UUID)  │◄───│ ← role-based access │
│ name                │    │ name, username      │
│ email               │    │ phone_number        │
│ username            │    │ address, city, state│
│ phone_number        │    │ tax_percent (INT)   │
│ country_code        │    │ commission_percent  │
│ password (hashed)   │    │ is_active           │
│ role (INT FK→roles) │    │ online_orders       │
│ access_token        │    │ open_time/close_time│
│ refresh_token       │    │ active_days (bitmask│
│ register_at         │    │   1=Mon…64=Sun)     │
└─────────────────────┘    └─────────────────────┘
         │                           │
         │                  ┌────────▼────────────┐
         │                  │  restaurant_access  │
         │                  ├─────────────────────┤
         │                  │ user_id (FK→users)  │
         └─────────────────►│ rid (FK→restaurants)│
                            └─────────────────────┘
```

### 4.2 Menu & Inventory

```
┌─────────────────────┐    ┌─────────────────────┐
│    categories       │    │    inventories      │
├─────────────────────┤    ├─────────────────────┤
│ id, rid, template_id│    │ id, rid, category_id│
│ name, description   │    │ name, description   │
│ img, is_active      │    │ images (JSON array) │
│ display_order       │    │ is_veg, cost, price │
└─────────────────────┘    │ status: available / │
         │                 │   out_of_stock /    │
         ▼                 │   low_stock /       │
┌─────────────────────┐    │   unavailable       │
│ category_templates  │    │ stock, recommend, ai│
├─────────────────────┤    └──────────┬──────────┘
│ id, name, cuisine   │               │
│ img, tags (JSON)    │    ┌──────────▼──────────┐
│ usage_count         │    │    variants         │
└─────────────────────┘    ├─────────────────────┤
                           │ id, inventory_id    │
                           │ name, price         │
                           └─────────────────────┘
                                      │
                           ┌──────────▼──────────┐
                           │   inventory_addons  │
                           ├─────────────────────┤
                           │ inventory_id        │
                           │ addon_id (FK→addons)│
                           │ is_default, max_qty │
                           └─────────────────────┘

┌─────────────────────┐    ┌─────────────────────┐
│      addons         │    │  inventory_stats    │
├─────────────────────┤    ├─────────────────────┤
│ id, rid, name       │    │ item_id (FK)        │
│ description, price  │    │ order_count         │
│ is_veg, is_active   │    │ units_sold          │
└─────────────────────┘    │ total_revenue       │
                           │ popularity_score    │
                           │ last_ordered_at     │
                           └─────────────────────┘
```

> **DB Trigger**: `trg_update_inventories_status_on_category_change` — auto-updates inventory `status` when a category is toggled active/inactive.

### 4.3 Orders & Carts

```
┌─────────────────────┐    ┌─────────────────────┐
│       carts         │    │       orders        │
├─────────────────────┤    ├─────────────────────┤
│ cart_id (VARCHAR PK)│◄───│ cart_id (FK)        │
│ customer_id         │    │ id, rid             │
│ discount_amount     │    │ customer_id         │
│ total_amount        │    │ placed_by_staff_id  │
│ payment_status:     │    │ placed_by_role_id   │
│   pending/completed │    │ item_id, variant_id │
│ payment_method:     │    │ display_name        │
│   upi/cash/card/    │    │ quantity            │
│   others            │    │ order_status:       │
│ delivery_type:      │    │   pending/ready/    │
│   dine-in/takeaway/ │    │   processing/       │
│   delivery          │    │   completed/settled/│
└─────────────────────┘    │   cancelled         │
                           │ payment_status      │
                           │ payment_method      │
                           │ special_instructions│
                           │ delivery_type       │
                           │ discount_amount     │
                           │ total_amount        │
                           │ preparation_time    │
                           │ table_id, table_no  │
                           │ party_size          │
                           └─────────────────────┘
                                      │
                           ┌──────────▼──────────┐
                           │    order_addons     │
                           ├─────────────────────┤
                           │ order_id, addon_id  │
                           │ quantity, price      │
                           └─────────────────────┘
```

> **Stored Procedure**: `sp_refresh_inventory_stats(p_rid)` — recalculates `inventory_stats` from completed orders, weighted by discount.  
> **Stored Procedure**: `sp_reset_occupied_tables()` — marks tables `available` if last updated > 1 hour ago.

### 4.4 Restaurant & Table Management

```
┌─────────────────────┐    ┌─────────────────────┐
│      tables         │    │  restaurant_hours   │
├─────────────────────┤    ├─────────────────────┤
│ id, rid             │    │ id, rid             │
│ table_number        │    │ day_of_week (enum)  │
│ capacity            │    │ open_time/close_time│
│ zone                │    └─────────────────────┘
│ status:             │
│  available/occupied/│    ┌─────────────────────┐
│  reserved           │    │  restaurant_status  │
└─────────────────────┘    │  (VIEW)             │
                           ├─────────────────────┤
                           │ + is_open_now (calc)│
                           │ + status_message    │
                           └─────────────────────┘
```

### 4.5 Users & Sessions

```
┌─────────────────────┐    ┌─────────────────────┐
│    user_sessions    │    │   temp_sessions     │
├─────────────────────┤    ├─────────────────────┤
│ (JWT session data)  │    │ user_id, table_no   │
│ access_token        │    │ rid, login_at       │
│ refresh_token       │    └─────────────────────┘
│ device info, IP     │    (Created when customer
└─────────────────────┘     scans a QR code)

┌─────────────────────┐    ┌─────────────────────┐
│    login_tokens     │    │      otps           │
├─────────────────────┤    ├─────────────────────┤
│ phone_number        │    │ (OTP storage for    │
│ user_id             │    │  phone verification)│
│ token_hash (SHA256) │    └─────────────────────┘
│ expires_at, used_at │
│ attempt_count       │
└─────────────────────┘
```

### 4.6 Notifications & CRM

```
┌─────────────────────────────────────┐
│            notifications            │
├─────────────────────────────────────┤
│ id, restaurant_id, user_id          │
│ type: low_stock / out_of_stock /    │
│   plan_expiring / plan_expired /    │
│   new_order / order_cancelled /     │
│   payment_failed / ...             │
│ title, message, data (JSON)         │
│ priority: low/medium/high/critical  │
│ is_read, read_at                    │
│ action_url, action_label            │
│ sent_via_app/email/sms              │
│ expires_at                          │
└─────────────────────────────────────┘

┌─────────────────────┐    ┌─────────────────────┐
│   favourite_list    │    │      memories       │
├─────────────────────┤    ├─────────────────────┤
│ uid, list (JSON)    │    │ uid, img, msg       │
└─────────────────────┘    │ rating (0-5)        │
                           └─────────────────────┘
```

### 4.7 Subscriptions

```
┌─────────────────────┐    ┌─────────────────────┐
│  subscription_plans │    │    subscriptions    │
├─────────────────────┤    ├─────────────────────┤
│ id, plan_code       │    │ id, restaurant_id   │
│ plan_name           │◄───│ plan_id (FK)        │
│ price, currency     │    │ plan_type:          │
│ billing_period:     │    │   trial/monthly/    │
│   month/year/trial  │    │   annual            │
│ billing_days        │    │ start_date/end_date │
│ savings             │    │ status:             │
│ is_popular          │    │   active/expired/   │
│ features (JSON)     │    │   cancelled         │
│ max_restaurants     │    │ amount, auto_renew  │
└─────────────────────┘    └─────────────────────┘
```

**Plans:**

| Plan | Code | Price | Duration |
|------|------|-------|----------|
| Free Trial | `trial` | ₹0 | 14 days |
| Monthly | `monthly` | ₹499 | 30 days |
| Multi-Restaurant | `monthly_multi` | ₹549 | 30 days |
| Yearly | `yearly` | ₹4,999 | 365 days |

### 4.8 QR Codes

```
┌─────────────────────┐
│      qr_codes       │
├─────────────────────┤
│ id (VARCHAR)        │ ← format: {hash}-{rid}-{table_no}
│ rid, table_no       │
│ status (0/1)        │
│ url (PNG URL)       │
└─────────────────────┘
```

### 4.9 Other Tables

| Table | Purpose |
|-------|---------|
| `roles` | Role definitions with power levels (0–1000) |
| `coupon_codes` | Discount coupons (fixed/percentage) |
| `cities` | Indian cities/states reference data |
| `config` | Global server config (ElevenLabs API key, voice script prompt) |
| `user_restaurant_visits` | CRM visit tracking |
| `v_staff_order_performance` | View for staff performance analytics |

---

## 5. Server (API) Architecture

**Location**: `server/src/app.js`  
**Runtime**: Node.js with ES Modules  
**Framework**: Express.js + Socket.IO

### 5.1 Middleware Stack (in order)

```
1. express.urlencoded + express.json (limit: 50kb)
2. Static files → /public
3. cookieParser
4. SyntaxError handler (malformed JSON → 400)
5. CORS (origin whitelist + *.delycia.com wildcard)
6. express-rate-limit (1000 req/min per IP)
7. sanitizeInput middleware (per-route, on sensitive endpoints)
```

**CORS allowed origins**: `localhost:4000`, `localhost:4500`, `localhost:5000`, `delycia.com`, `*.delycia.com`

### 5.2 Route Groups

#### Web Routes (Customer-facing) `/api/v1/`
| Route | Module |
|-------|--------|
| `/users` / `/users/auth` | User registration, OTP login |
| `/sessions` | Session management |
| `/` | Categories (public) |
| `/inventory` | Menu items (public) |
| `/variants` | Item variants |
| `/orders` | Place & track orders |
| `/search` | Menu search |
| `/restaurant` | Restaurant info |
| `/tables` | Table status |
| `/users/addons` | Item addons |

#### Admin Routes `/api/v1/admin/`
| Route | Feature |
|-------|---------|
| `/auth` | Admin login/logout/refresh |
| `/users` | User management |
| `/inventory` + `/inventory-stats` | Menu management + analytics |
| `/variants` | Variant CRUD |
| `/orders` | Order management |
| `/restaurants` | Restaurant settings |
| `/tables` | Table CRUD |
| `/dashboard` | Dashboard analytics |
| `/addons` | Addon management |
| `/crm` | Customer relationship management |
| `/staff-reports` | Staff performance reports |
| `/subscriptions` | Subscription management |
| `/notifications` | Notification center |

#### App Routes (Mobile Kiosk) `/api/v1/app/`
| Route | Purpose |
|-------|---------|
| `/qrcode` | QR code generation |
| `/temp-session` | Temporary session init from QR scan |
| `/voice` | ElevenLabs voice synthesis for order confirmation |

#### Superadmin Routes `/api/v1/superadmin/`
| Route | Purpose |
|-------|---------|
| `/auth` | Superadmin login |
| `/restaurants` | Manage all restaurants |
| `/subscriptions` | Manage all subscriptions |
| `/users` | Manage all users |
| `/menus` | Category templates |
| `/staff` | Staff CRUD across restaurants |
| `/dashboard` | Platform analytics |

#### System Routes `/api/v1/system/`
| Route | Purpose |
|-------|---------|
| `/upsells` | System upsell data |
| `/embedding` | AI embedding operations |
| `/cronJobs` | Manual cron trigger endpoints |

### 5.3 Middleware Modules

| File | Purpose |
|------|---------|
| `auth.middleware.js` | JWT verification from Bearer header |
| `admin.middleware.js` | Admin role check (role ≥ 3) |
| `adminFlag.middleware.js` | Admin header flag check |
| `superadmin.middleware.js` | Superadmin role check (role ≥ 1000) |
| `csrf.middleware.js` | CSRF token validation (double-submit pattern) |
| `rateLimiter.middleware.js` | Route-specific rate limiting via Redis |
| `sanitizeInputs.middleware.js` | Input sanitization (XSS/injection prevention) |
| `ws.auth.middleware.js` | WebSocket JWT authentication |

### 5.4 Services

| Service | Purpose |
|---------|---------|
| `redis.service.js` | Redis client wrapper with graceful degradation |
| `session.service.js` | Redis-backed session CRUD (30-day TTL) |
| `tokenCache.service.js` | In-memory JWT verification cache (reduces DB lookups) |
| `rateLimiter.service.js` | Configurable per-route rate limiting with Redis backend |

### 5.5 Cron Jobs

| Job | Schedule | Purpose |
|-----|----------|---------|
| `notification.cron.js` | Periodic | Sends low stock / plan expiry notifications |
| `otps.cron.js` | Periodic | Cleans expired OTPs |
| `tables.cron.js` | Periodic | Resets stale occupied tables (`sp_reset_occupied_tables`) |
| `temp_sessions.cron.js` | Periodic | Cleans expired temp sessions |

### 5.6 Health Endpoints

```
GET /health           → Server status
GET /health/redis     → Redis connectivity
GET /health/cache     → Token cache stats
GET /health/sessions  → Active session count
GET /health/ratelimit → Rate limiter stats
```

---

## 6. Admin Application Architecture

**Location**: `admin/src/`  
**Framework**: TanStack Start (Vite + React 18 + TanStack Router)  
**Port**: 4500  

### 6.1 Route Tree

```
__root.tsx (auth guard, RestaurantSelector context)
├── login.tsx                          Public
├── index.tsx → /dashboard            Protected
├── dashboard.tsx (layout)
│   └── /dashboard                    Dashboard overview + charts
├── orders.tsx (layout)
│   ├── /orders                       Order overview (live feed)
│   ├── /orders/overview              Pending/Processing/Ready tabs
│   └── /orders/history               Historical orders
├── inventory.tsx (layout)
│   ├── /inventory                    Menu grid + CRUD
│   ├── /inventory/menu               Full menu management
│   └── /inventory/stock              Stock levels
├── reports.tsx (layout)
│   ├── /reports                      Sales analytics
│   ├── /reports/sales                Revenue charts
│   ├── /reports/crm                  Customer activity
│   ├── /reports/inventory            Stock analytics + popularity
│   ├── /reports/inventory/index      Inventory overview
│   ├── /reports/inventory/details    Per-item stats
│   └── /reports/staff                Staff performance
├── settings.tsx (layout)
│   ├── /settings                     Restaurant general settings
│   ├── /settings/restaurant          Restaurant profile CRUD
│   ├── /settings/account             Admin account settings
│   └── /settings/subscription        Billing & plan management
├── staff.tsx (layout)
│   └── /staff                        Staff list + CRUD + roles
├── billing.tsx / /billing            Billing overview
├── affiliate.tsx / /affiliate        Affiliate program
├── support.tsx / /support            Support center
├── demo/ (7 routes)                  Feature demos
└── api/ (40 BFF server routes)       ← TanStack Start SSR handlers
```

### 6.2 BFF API Routes (`admin/src/routes/api/`)

The admin app acts as a BFF, proxying all requests with auth handling:

```
api/
├── auth/
│   ├── login.ts           POST → /api/v1/admin/auth/login
│   ├── logout.ts          POST → /api/v1/admin/auth/logout
│   ├── session.ts         GET  → /api/v1/admin/users?id={id}
│   ├── refresh.ts         POST → /api/v1/users/auth/refresh
│   └── create-admin.ts    POST → /api/v1/admin/auth/create
├── inventory.ts           CRUD → /api/v1/admin/inventory
├── inventory.bulk.ts      Bulk operations
├── inventory-stats.ts     GET  → /api/v1/admin/inventory-stats
├── category.ts + category/  CRUD → /api/v1/admin/categories
├── orders.ts + orders/    GET/PATCH → /api/v1/admin/orders
├── quick-bill.ts          POST → /api/v1/admin/orders (staff-placed)
├── waiter-orders.ts       GET/POST → waiter order context
├── tables.ts              CRUD → /api/v1/admin/tables
├── addons.ts              CRUD → /api/v1/admin/addons
├── variants.ts            CRUD → /api/v1/admin/variants
├── restaurant.ts          GET/PUT → /api/v1/admin/restaurants
├── dashboard.ts           GET → /api/v1/admin/dashboard
├── crm.ts + crm/          GET → /api/v1/admin/crm
├── staff-reports.ts       GET → /api/v1/admin/staff-reports
├── subscription.ts        GET/POST → /api/v1/admin/subscriptions
├── subscription.plans.ts  GET plans list
├── notifications.ts       GET/PATCH notifications
├── users.ts               GET/PATCH user profile
├── imagekit.ts            POST image upload via ImageKit
├── support.ts             POST support tickets
└── ws-token.ts            GET → WebSocket auth token
```

### 6.3 State Management

| Store | Library | Purpose |
|-------|---------|---------|
| `useMenuStore` | Zustand | Quick Bill cart state, item selection |
| `useCartStore` | Zustand | Cart items + totals |
| `useTableStore` | Zustand | Selected table context |
| `useGlobalOrderPopupStore` | Zustand | Order detail popup state |
| `useDateFilterStore` | Zustand | Date range for reports |

### 6.4 Key Custom Hooks

| Hook | Purpose |
|------|---------|
| `useAuth` | Auth state, login/logout/refresh |
| `useRestaurantSelector` | Multi-restaurant `selected_rid` management |
| `useRestaurantSession` | Restaurant session context |
| `useSessionStatus` | Session validity + activity tracking |
| `useWebSocketManager` | Socket.IO connection lifecycle |
| `useDashboardData` | Dashboard aggregate queries |
| `useOrderTaxCalculation` | Tax computation from restaurant tax% |
| `useVirtualizedOrders` | Virtualized list for large order sets |
| `useLoadMore` | Intersection Observer-based pagination |
| `useNetworkQuality` | Network quality detection |
| `useChangeTracking` | Form dirty state for unsaved changes |
| `useOptimizedCountdown` | Order preparation timer |

### 6.5 Query Architecture

TanStack Query with:
- `staleTime: 60_000` (1 min) for session/user queries  
- Background refetch on window focus  
- Optimistic updates for order status changes  
- `useInfiniteQuery` for order history pagination

---

## 7. Client Application Architecture

**Location**: `client/src/`  
**Framework**: TanStack Start (Vite + React 18 + TanStack Router)  
**Port**: 4000  

### 7.1 Route Tree

```
__root.tsx (global providers, session restoration)
├── index.tsx → /                     Discovery / landing
├── delycias.tsx / /delycias          Restaurant directory
├── $username.tsx / /:username        Restaurant home page
├── category.tsx / /category          Category-filtered menu
├── cart.tsx / /cart                  Cart review
├── checkout.tsx / /checkout           Checkout page
├── order-placed.tsx / /order-placed   Order confirmation
├── orders.tsx / /orders              Order history
├── user/
│   ├── profile.tsx                   User profile
│   ├── favorites.tsx                 Saved favorites
│   └── memories.tsx                  Past order memories
├── auth/
│   └── verify.tsx                    Phone OTP verification
├── res.$username.tsx                 Restaurant redirect
├── clear-cookies.tsx                 Cookie cleanup utility
└── api/ (18 BFF server routes)       ← TanStack Start SSR handlers
```

### 7.2 Client BFF API Routes (`client/src/routes/api/`)

```
api/
├── auth/                  (6 routes: login, logout, session, refresh, OTP, verify)
├── app.temp-session.ts    POST → /api/v1/app/temp-session (QR init)
├── categories.ts          GET  → /api/v1/categories
├── inventory.ts           GET  → /api/v1/inventory
├── orders.ts              GET/POST → /api/v1/orders
├── restaurant.ts          GET  → /api/v1/restaurant
├── restaurant.checkout.ts POST → checkout (multi-step: cart + orders)
├── tables.ts              GET  → /api/v1/tables
├── users.ts               GET  → /api/v1/users
├── user.update.ts         PATCH → user profile
├── reverification-code.ts POST → resend OTP
└── imagekit.ts            POST → profile image upload
```

### 7.3 State Management

| Store | Library | Purpose |
|-------|---------|---------|
| `useCartStore` | Zustand | Cart items, quantities, totals |
| `useUserStore` | Zustand | Authenticated user data |
| `useRestaurantStore` | Zustand | Current restaurant context |

### 7.4 Key Client Hooks

| Hook | Purpose |
|------|---------|
| `useScrollHide` | Hide header on scroll-down |
| `useMobileViewport` | Mobile viewport detection |
| `useLoadMore` | Infinite scroll pagination |
| `useNetworkStatus` | Offline/online detection |

---

## 8. Real-time Communication (WebSockets)

**Library**: Socket.IO  
**Mount**: Same HTTP server as Express

### 8.1 Namespaces

```
/orders         ← Order lifecycle events
/qrcode         ← QR code scan events
/temp-sessions  ← Temp session management events
```

### 8.2 Orders Namespace (`/orders`)

```
Events emitted by server:
  order:new      → new order placed
  order:updated  → status changed (pending→processing→ready→completed)
  order:settled  → order settled/paid

Client subscribes to:
  - Restaurant room: rid-{restaurantId}
  - Table room: table-{tableId}
```

### 8.3 QR Code Namespace (`/qrcode`)

```
Events:
  qr:scanned     → customer scanned QR → temp session created
  qr:session     → session info pushed to kiosk display
```

### 8.4 Temp Sessions Namespace (`/temp-sessions`)

```
Events:
  session:created   → temp session initialized
  session:expired   → cleanup event for expired sessions
```

### 8.5 Admin WebSocket Connection

```
Admin connects via useWebSocketManager hook:
  1. GET /api/ws-token → BFF fetches WebSocket auth token
  2. Connect to server with token in auth header
  3. Join restaurant room (rid-{selected_rid})
  4. Listen for order events → update TanStack Query cache
```

---

## 9. Roles & RBAC

| Role ID | Name | Power | Capabilities |
|---------|------|-------|-------------|
| 0 | Customer | 0 | Browse menu, place orders, order history |
| 1 | Super Admin | 100 | Full platform management |
| 2 | Admin | 90 | Manage restaurants, approve onboarding |
| 3 | Restaurant Owner | 80 | Full control of own restaurant(s) |
| 4 | Restaurant Manager | 70 | Manage operations, orders, staff scheduling |
| 5 | Waiter | 60 | View, create, update orders (Quick Bill) |
| 6 | Kitchen Staff | 50 | Order status management (kitchen display) |
| 7 | Delivery | 40 | View assigned orders, delivery status |
| 1000 | Super Administrator | 1000 | Root platform access |

**Access control enforcement:**
- **Server**: `admin.middleware.js` checks `role >= 3`, `superadmin.middleware.js` checks `role >= 1000`
- **Admin app**: `useAuth` + route middleware redirects unauthenticated users to `/login`
- **restaurant_access**: Maps users to their authorized restaurant IDs (supports multi-restaurant)

---

## 10. Subscription & Billing

```
Restaurant created
        │
        ▼
    Free Trial (14 days, plan_id: 1)
        │
        ├─ Trial expires → email/SMS notification
        │
        ▼
    Paid Plan selection
        │
        ├─ Monthly  (₹499/30 days) — single restaurant
        ├─ Monthly+ (₹549/30 days) — multi-restaurant (up to 999)
        └─ Yearly   (₹4,999/365 days) — multi-restaurant + savings
```

**Subscription checks:**
- `notification.cron.js` sends `plan_expiring` notifications before expiry
- Subscription status checked on admin app boot
- Expired subscriptions lock access to admin features

---

## 11. Feature Inventory

### Admin App Features

| Feature | Routes | Description |
|---------|--------|-------------|
| **Dashboard** | `/dashboard` | Revenue, orders, top items, staff overview |
| **Quick Bill (POS)** | `/orders` | Staff-placed orders with cart UI, table assign, payment |
| **Order Management** | `/orders/overview`, `/history` | Live order feed, status updates, thermal bill printing |
| **Inventory Management** | `/inventory/menu` | CRUD food items, images, pricing, stock |
| **Stock Management** | `/inventory/stock` | Stock level tracking, bulk updates |
| **Category Management** | Via inventory | Category CRUD, template library, display order |
| **Variant Management** | Inline | Item variant sizes/types (Half, Full etc.) |
| **Addon Management** | Inline | Add-ons per item (Extra Cheese, etc.) |
| **Table Management** | `/settings/restaurant` | Table CRUD, zone assignment, QR generation |
| **QR Code Generation** | Settings | Per-table QR code gen + PNG download |
| **Reports - Sales** | `/reports/sales` | Revenue trends, daily/weekly/monthly breakdown |
| **Reports - Inventory** | `/reports/inventory` | Popularity scores, low stock alerts, revenue per item |
| **Reports - CRM** | `/reports/crm` | Customer visits, order frequency, value |
| **Reports - Staff** | `/reports/staff` | Per-staff order counts, performance metrics |
| **Notifications** | Bell icon | Real-time alerts (low stock, plan expiry, new orders) |
| **Staff Management** | `/staff` | Staff CRUD, role assignment, name-confirm deletion |
| **Restaurant Settings** | `/settings/restaurant` | Profile, tax %, opening hours, active days, online ordering |
| **Account Settings** | `/settings/account` | Admin profile, password change, 2FA |
| **Subscription** | `/settings/subscription` | Current plan, upgrade options |
| **Multi-restaurant** | Top selector | Switch between owned/managed restaurants |
| **Waiter Mode** | Via role | Waiter-specific order placement interface |
| **Voice Announcement** | On order | ElevenLabs TTS announces order status |

### Client App Features

| Feature | Routes | Description |
|---------|--------|-------------|
| **Restaurant Discovery** | `/delycias` | Browse restaurants by location |
| **Public Menu** | `/:username` | Restaurant landing + menu browse |
| **Category Filter** | `/category` | Filter items by food category |
| **QR Order** | Via QR → temp session | Auto-fill table + restaurant context |
| **Cart Management** | `/cart` | Item qty, addon selection, discount display |
| **Checkout** | `/checkout` | Payment method, delivery type, table |
| **Order Confirmation** | `/order-placed` | Cart → orders → confirmation |
| **Order History** | `/orders` | Past orders with status + reorder |
| **User Profile** | `/user/profile` | Name, phone, profile pic management |
| **Favorites** | `/user/favorites` | Saved favorite items |
| **Memories** | `/user/memories` | Past dining photos + ratings |
| **OTP Auth** | `/auth/verify` | Phone-based OTP sign-in |
| **Guest Mode** | Auto | Anonymous ordering without login |
| **Online Ordering** | Configurable | Toggle per restaurant |
| **Delivery Types** | Cart/Checkout | Dine-in / Takeaway / Delivery |
| **Notifications** | Push/WebSocket | Order status updates in real time |

---

## 12. Infrastructure & Deployment

### 12.1 Docker Setup

Each app has individual `Dockerfile` + `docker-compose.yml`:

```
admin/Dockerfile        Multi-stage build (Node → Nginx serve)
client/Dockerfile       Multi-stage build (Node → Nginx serve)
server/Dockerfile       Single-stage Node.js
```

**Admin docker-compose** services: `admin-app` + optional reverse proxy  
**Server docker-compose** services: `server` + MariaDB + Redis

### 12.2 Environment Variables

**Admin `.env`:**
```
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_SERVER_URL=http://localhost:3000
VITE_SOCKET_URL=ws://localhost:3000
IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, IMAGEKIT_URL_ENDPOINT
```

**Client `.env`:**
```
VITE_API_BASE_URL=...
VITE_IMAGEKIT_*=...
```

**Server `.env`:**
```
DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
REDIS_URL
JWT_SECRET, JWT_REFRESH_SECRET
ELEVENLABS_API_KEY (also in DB config table)
```

### 12.3 POS Kiosk Mode

The admin app includes `start-pos-kiosk.sh` — a shell script to launch the admin in a locked-down kiosk browser session (Chromium fullscreen, no address bar), intended for dedicated POS terminals.

---

## 13. Security Architecture

### 13.1 CSRF Protection

Double-submit cookie pattern implemented in `csrf.middleware.js`:
- Server generates CSRF token on login
- Client sends token in `x-csrf-token` header on state-changing requests
- Superadmin routes enforce CSRF on all mutating operations

### 13.2 Input Sanitization

`sanitizeInputs.middleware.js` applied to all admin and web auth routes:
- Strips HTML tags from string inputs
- Prevents XSS via encoded chars
- Applied before route handlers

### 13.3 Rate Limiting

Two layers:
1. **Global**: `express-rate-limit` → 1000 req/min per IP on all routes
2. **Per-route**: `rateLimiter.service.js` via Redis → configurable per endpoint (e.g., tighter limits on `/auth` routes)

### 13.4 Token Security

- Access tokens: 15-minute expiry, short blast radius
- Refresh tokens: 30-day expiry, stored in httpOnly cookie (not accessible to JS)
- `tokenCache.service.js`: In-memory LRU cache for JWT verification → reduces redundant DB token lookups
- Tokens also persisted to `users.access_token` / `users.refresh_token` for server-side validation

---

## 14. Data Flow Diagrams

### 14.1 Customer Ordering Flow (QR)

```
1. Customer scans QR code (table-specific URL)
         │
         ▼
2. Client app loads /:username?table={id}
         │
         ▼
3. POST /api/app.temp-session → creates temp_sessions record
         │
         ▼
4. Customer browses menu (public data, no auth required)
         │
         ▼
5. Customer adds items → Cart (Zustand store)
         │
         ▼
6. Customer logs in via phone OTP (or continues as guest)
         │
         ▼
7. POST /api/restaurant.checkout
         │
         ├─ BFF creates cart record (carts table)
         ├─ BFF creates order records (orders table, one per item)
         └─ BFF emits order:new via Socket.IO
         │
         ▼
8. Admin app receives WebSocket event → order appears in feed
         │
         ▼
9. Staff processes order: pending → processing → ready
         (PATCH /api/v1/admin/orders/:id)
         │
         ▼
10. ElevenLabs voice announcement (if enabled)
```

### 14.2 Quick Bill Flow (Staff POS)

```
Staff selects table → useTableStore
         │
         ▼
Staff searches/browses menu → useMenuStore
         │
         ▼
Staff adds items → useCartStore (with variants, addons, quantities)
         │
         ▼
Staff selects payment method + delivery type
         │
         ▼
POST /api/quick-bill → BFF
         │
         ├─ Bearer token attached (admin access token)
         ├─ Calls POST /api/v1/admin/orders
         ├─ Server: placed_by_staff_id = decoded.id
         └─ Server emits order:new via Socket.IO
         │
         ▼
Order appears in live feed immediately
```

### 14.3 Token Refresh Flow

```
Axios request with expired access token
         │
         ▼
Server returns 401
         │
         ▼
Axios interceptor (tokenService.ts) intercepts
         │
         ▼
POST /api/auth/refresh (BFF)
         │
         ├─ BFF reads refresh token from httpOnly cookie
         ├─ Calls backend /api/v1/users/auth/refresh
         ├─ Receives new access + refresh tokens
         └─ Sets new httpOnly cookies in response
         │
         ▼
Original request retried with new token
         │
         ▼
Response returned to component
```

---

*This document reflects the application state as of **2026-02-21**. For DB schema reference see [`delycia_db_structure.sql`](./delycia_db_structure.sql).*
