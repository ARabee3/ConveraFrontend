# Convera Frontend — MVP Completion Plan

> **Scope:** This plan takes the existing Next.js 14 skeleton and builds it into a functional MVP frontend for the Convera NestJS backend.
> **Backend:** `../ConveraProjectBackend` (NestJS, Prisma, MySQL 8, Redis 7).
> **Last analyzed:** 2026-05-31.

---

## Infrastructure Setup

### Database Containers
The `db-up` alias (`docker compose -f ~/dev-env/docker-compose.yml up -d`) now includes Convera-specific services:

- **convera_mysql** — MySQL 8.0, port `3307`
  - Root password: `convera_root_password`
  - Database: `convera`
  - User: `convera_user` / `convera_password`
- **convera_redis** — Redis 7, port `6380`
  - Password: `convera_redis_secret`

Both containers are verified healthy and match the backend `.env` (`DATABASE_URL` and `REDIS_URL`).

---

## Current State Audit

### What Exists (Skeleton)
| Domain | Pages | Status |
|---|---|---|
| Auth | `/login`, `/register`, `/verify-email`, `/forgot-password` | Implemented |
| Properties (Public) | `/properties`, `/properties/[id]` | Implemented |
| Events (Public) | `/events`, `/events/[id]` | Implemented |
| Host | `/host/properties`, `/host/properties/new` | Implemented (no edit/availability) |
| Admin (Events) | `/admin/events`, `/admin/events/new` | Implemented |
| Payments | `/bookings/[id]/payment` | Implemented (provider selection) |

### What's Missing / Placeholder
| Gap | Impact |
|---|---|
| No `GET /bookings/me` endpoint in backend | `/bookings` page is a static empty-state with no real data. |
| No payment return pages | Stripe/Paymob redirects have nowhere to land. |
| No review submission UI | Customers can't leave reviews on property detail. |
| No property edit page | Hosts can only create/delete, not update. |
| No availability override UI | Hosts can't block dates or set seasonal prices. |
| No chat UI | Backend WebSocket gateway is fully ready but unused. |
| Admin users/properties pages missing | Only event admin exists. |
| No metrics dashboard | `/admin/metrics` data is unused. |
| No activity logs page | `/admin/activity-logs` data is unused. |
| No notification preferences page | `/notifications/preferences` endpoints unused. |
| Event creation uses raw UUID for category | Bad UX; needs category picker. |

---

## Execution Tracks

### Track 0: Backend Foundation — `GET /bookings/me`
**Goal:** Close the data gap so the frontend can display real booking history.

1. **Backend:** Add `findByCustomer(customerId)` to `BookingService`.
   - Query `prisma.booking.findMany` with `include: { property: {...}, transactions: {...} }`.
   - Order by `createdAt: 'desc'`.
2. **Backend:** Add `@Get('me')` to `BookingController` with `JwtAuthGuard`.
3. **Verify:** Hit endpoint with Bearer token, confirm JSON shape.
4. **Frontend:** Add `bookingsApi.listMe()` in `src/lib/api.ts`.
5. **Frontend:** Rewrite `/bookings` page with real `useQuery` fetch, booking cards, status badges, property thumbnails, and actions.

### Phase 1: Verification & Audit
**Goal:** Confirm every existing page is wired correctly to the backend before building new features.

| Page(s) | Audit Checklist |
|---|---|
| Auth flows | Zod schemas match backend DTOs; Zustand hydration works; `middleware.ts` role guards align with backend RBAC (`CUSTOMER`/`HOST`/`ADMIN`/`SYSTEM_ADMIN`). |
| `/properties` | Query params map to `SearchPropertiesDto`; filters (price, type, rating) are sent correctly. |
| `/properties/[id]` | Uses all fields returned by `GET /properties/:id` (`avgRating`, `reviews`, `amenities`); booking widget date math is correct. |
| `/events` | Cursor pagination logic is sound; `nextCursor` is passed correctly. |
| `/events/[id]` | Handles `eligibility`, `galleryImages`, `isSoldOut`; ticket purchase calls `POST /bookings` correctly. |
| Host pages | `CreatePropertyDto` shape matches form; delete works; role guards match backend. |
| Admin events | Import/delete wired; `CreateEventDto` fields match form. |
| Payment page | `paymentsApi.initialize` payload matches backend (`bookingId`, `provider: STRIPE|PAYMOB`). |

**Deliverable:** List of "Confirmed Correct" vs "Needs Fix". Fix any issues before proceeding.

### Track A: Core User Experience (Must-Have)
**Goal:** Complete the booking loop and give hosts full property management.

1. **My Bookings Page** (`/bookings`)
   - Fetch from `GET /bookings/me`.
   - Cards: property image, title, dates, total price, status badge.
   - Actions: "Complete Payment" for `PENDING_PAYMENT`, "View Property" for others.
2. **Payment Return Pages**
   - `/bookings/[id]/success` — Confirmation with booking summary.
   - `/bookings/[id]/cancel` — Failure message with retry option.
3. **Review Submission**
   - On `/properties/[id]`, conditionally show review form for logged-in customers with a `CONFIRMED` booking who haven't reviewed yet.
   - POST to `/properties/:propertyId/reviews`.
4. **Host Property Edit**
   - `/host/properties/[id]/edit` — Pre-filled form, `PATCH /host/properties/:id`.
5. **Host Availability Management**
   - Modal/section on host dashboard to set blocked dates or price overrides.
   - `POST /host/properties/:id/availability`.

### Track B: Real-Time Chat
**Goal:** Enable customer-host messaging. The backend gateway is 100% ready.

1. **Socket.io Client Setup**
   - Install `socket.io-client`.
   - React context/hook: connect to `ws://localhost:3000/chat`, send Bearer token in `auth.token`.
   - Expose `subscribe`, `sendMessage`, `markAsRead`.
2. **Chat Session List** (`/chat` or `/messages`)
   - Derive sessions from confirmed bookings.
   - List conversations with property name and last message preview.
3. **Chat Thread** (`/chat/[sessionId]`)
   - On mount: `subscribe` to room + `GET /chat/:sessionId/history`.
   - Render messages with sender info, timestamps, read receipts.
   - Input box → `send_message` event.
   - Handle server events: `new_message`, `read_receipt`, `policy_violation`.

### Track C: Admin Dashboard Completion
**Goal:** Make the admin panel fully functional.

1. **Admin Users** (`/admin/users`)
   - Table with pagination/filters (`GET /admin/users`).
   - User detail (`GET /admin/users/:id`).
   - Suspend/Activate (`PATCH /admin/users/:id/status`).
2. **Admin Properties** (`/admin/properties`)
   - Table with pagination/filters (`GET /admin/properties`).
   - Change status dropdown (`PATCH /admin/properties/:id/status`).
3. **Metrics Dashboard** (`/admin`)
   - Cards for `/admin/metrics` (users by role, active properties, bookings by status, revenue).
   - Lightweight charts (styled HTML bars or minimal chart lib).
4. **Activity Logs** (`/admin/activity-logs`)
   - Filterable table (`GET /admin/activity-logs`).
   - Filters: action type, date range.

### Track D: Polish & Supporting Features
**Goal:** Close minor UX gaps.

1. **Notification Preferences** (`/settings/notifications`)
   - Fetch (`GET /notifications/preferences`), toggle (`PATCH /notifications/preferences`) for `REMINDERS` and `CHAT_ALERTS`.
2. **User Profile** (`/profile`)
   - Display email, role. "Become a Host" button (informational or wired if backend supports role change).
3. **Event Category Picker**
   - **Backend:** Add `GET /event-categories` (or similar) to return all categories.
   - **Frontend:** Replace raw UUID input in `/admin/events/new` with a dropdown.

---

## Execution Order

| # | Track | Why First? |
|---|---|---|
| 0 | Track 0: Backend `GET /bookings/me` | Unblocks the most critical missing user page. |
| 1 | Phase 1: Audit existing pages | Prevents building on a broken foundation. |
| 2 | Track A: Core UX | Completes the booking loop and host tools. |
| 3 | Track B: Chat | Major differentiator; backend is fully ready. |
| 4 | Track C: Admin completion | Makes admin tools usable. |
| 5 | Track D: Polish | Nice-to-have before launch. |

---

## Backend API Coverage Summary

All endpoints below exist in the backend and must be consumed by the frontend during this plan.

### Auth
- `POST /auth/register`
- `POST /auth/verify`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`

### Properties (Public)
- `GET /properties` (with `lat`, `lng`, `radius`, `priceMin`, `priceMax`, `checkIn`, `checkOut`, `ratingMin`)
- `GET /properties/:id`

### Host (Requires `HOST`/`ADMIN`/`SYSTEM_ADMIN`)
- `GET /host/properties`
- `POST /host/properties`
- `PATCH /host/properties/:id`
- `DELETE /host/properties/:id`
- `POST /host/properties/:id/availability`

### Reviews (Requires `CUSTOMER`)
- `POST /properties/:propertyId/reviews`

### Events (Public)
- `GET /events` (cursor pagination)
- `GET /events/:id`

### Admin Events (Requires `ADMIN`/`SYSTEM_ADMIN`)
- `POST /admin/events`
- `PUT /admin/events/:id`
- `DELETE /admin/events/:id`
- `POST /admin/events/import`

### Bookings (Requires `CUSTOMER`)
- `POST /bookings`
- **`GET /bookings/me` — To be built in Track 0**

### Payments (Requires `CUSTOMER`)
- `POST /payments/initialize`

### Chat (Requires Auth)
- `GET /chat/:sessionId/history`
- WebSocket: `ws://localhost:3000/chat` (namespace `/chat`)

### Notifications (Requires Auth)
- `GET /notifications/preferences`
- `PATCH /notifications/preferences`

### Admin (Requires `SYSTEM_ADMIN`)
- `GET /admin/users`
- `GET /admin/users/:id`
- `PATCH /admin/users/:id/status`
- `GET /admin/events`
- `GET /admin/properties`
- `PATCH /admin/properties/:id/status`
- `GET /admin/metrics`
- `GET /admin/activity-logs`

---

## Notes

- **No backend changes are needed** for Tracks A–C except the `GET /bookings/me` endpoint in Track 0 and a potential `GET /event-categories` in Track D.
- The backend already implements **optimistic locking**, **RBAC guards**, **payment webhooks**, **i18n**, **Redis caching**, and **BullMQ queues** — all transparent to the frontend.
- **New dependency:** `socket.io-client` (Track B).
