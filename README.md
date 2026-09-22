# Hostel Management System

A full-stack capstone project for managing a student hostel — room allocation, resident
records, maintenance requests, billing, financial/occupancy reporting, and notifications,
all behind role-based access for admins, staff, and residents.


## Demo credentials

No need to register — these seeded accounts (password `Password123` for all of them) are
ready to use on the live deployment or a local instance seeded with `npm run seed`:

| Role     | Email                     | Password      |
|----------|---------------------------|----------------|
| Admin    | indira@hostel.test        | Password123    |
| Staff    | bruce.wayne@hostel.test   | Password123    |
| Staff    | clark.kent@hostel.test    | Password123    |
| Resident | balaji@hostel.test        | Password123    |
| Resident | prithvi@hostel.test       | Password123    |

## What this project is

A hostel (or PG/dorm) has three kinds of people who need different things from a
management system:

- **Admins** run the place — they manage room inventory, oversee staff, and pull
  financial/occupancy reports.
- **Staff** handle day-to-day operations — checking residents in and out of rooms,
  triaging and resolving maintenance requests, and recording payments.
- **Residents** just need to see their own room, raise a maintenance request when
  something breaks, and check what they owe.

This app gives each of those three roles their own view of the same underlying data,
instead of three separate systems that fall out of sync.

## Tech stack

**Backend**
- Node.js + Express 5, written in plain JavaScript (CommonJS — `require`/`module.exports`)
- MongoDB + Mongoose (hosted on MongoDB Atlas, free M0 tier)
- JWT-based authentication (`jsonwebtoken`) + `bcryptjs` password hashing
- Zod for request validation
- Nodemailer (Gmail SMTP) for transactional email

**Frontend**
- React 19 + TypeScript, built with Vite
- Tailwind CSS v4 for styling (hand-built UI kit — buttons, inputs, modals, cards —
  styled with `class-variance-authority` + `tailwind-merge`, no external component library)
- TanStack Query for server state (fetching, caching, mutations)
- Zustand for client state (auth session, persisted to `localStorage`)
- React Router for routing
- Recharts for the financial/occupancy charts on the Reports page

**Tooling**
- Two independent `npm` projects (`client/` and `server/`) — no shared monorepo package.
  The server is plain JavaScript, so the client's TypeScript types for API responses are
  hand-written to match the server's Mongoose shapes rather than shared/generated, which
  is a deliberate trade-off for a project this size (see *Future improvements*).

## Features

**Authentication & roles.** Email/password auth with JWTs. Every account has exactly one
role — `admin`, `staff`, or `resident` — and both the API (route middleware) and the UI
(protected routes, conditional nav) enforce what each role can see and do.

**Room allocation.** Admins manage the room inventory (number, type, floor, capacity,
rent, amenities). Staff check residents in and out, transfer a resident to a different
room, and see a live occupancy view — rooms filtered by available/full/under-maintenance,
with real-time occupied/capacity counts.

**Resident information management.** Every resident account has a profile with contact
details and an emergency contact, plus their current room and a full check-in/check-out
history pulled from the allocation records.

**Maintenance requests.** Residents submit a request (title, description, category,
priority). Staff/admins see every open request, assign it to a staff member, and move it
through a status pipeline (`open → in_progress → resolved → closed`) — every status
change is timestamped and kept in the request's history.

**Billing & payments.** Admins/staff create invoices per resident per billing period,
made up of line items plus an optional discount/late fee. Payments are recorded with a
single "mark as paid / partially paid / overdue" action that also stores the payment
method (cash, UPI, bank transfer, card, other) and a note — every update is appended to
the invoice's payment history, so there's a full paper trail. Residents see their own
invoices and payment history.

**Financial & occupancy reporting.** An admin-only Reports page with revenue by billing
period (invoiced vs. collected), invoices broken down by status, occupancy by room type,
and a check-ins-over-time trend — all computed from real data via MongoDB aggregation
pipelines, charted with Recharts.

**Notifications.** In-app notifications (with an unread count and a bell dropdown) fire
on the events people actually care about: a resident being checked in/out or moved to a
new room, a new maintenance request landing in the queue, a request being assigned or
having its status change, and an invoice being created or updated. Email notifications
(via Gmail SMTP) go out for the higher-signal events — room assignment, maintenance
status updates, and billing — so residents don't have to be in the app to know something
happened.

**Dashboard.** A role-aware landing page: admins/staff get occupancy, a pending-maintenance
count, outstanding billing, and a "needs attention" queue; residents get their room,
open-request count, and amount due.

## Setup and running the project

### Prerequisites

- Node.js 20+ and npm
- A MongoDB Atlas account (free M0 cluster is enough) — or a local MongoDB instance
- A Gmail account with an [App Password](https://myaccount.google.com/apppasswords)
  generated for it (regular Gmail passwords won't work with Nodemailer)

### 1. Clone/copy the project and install dependencies

```bash
cd server && npm install
cd ../client && npm install
```

### 2. Configure environment variables

Both `server/` and `client/` have a `.env.example` — copy each to `.env` in the same
folder and fill in real values. `.env` files are git-ignored and never committed.

**`server/.env`**

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster-host>/<dbname>?retryWrites=true&w=majority
JWT_SECRET=<a long random string>
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
EMAIL_USER=<your gmail address>
EMAIL_PASS=<your gmail app password, no spaces>
EMAIL_FROM="Hostel Management <your gmail address>"
```

**`client/.env`**

```env
VITE_API_URL=http://localhost:5000/api
```

If Atlas is being used, make sure the cluster's Network Access list allows the IP the
server will run from (for local development, either add your current IP or, for
convenience during development only, allow `0.0.0.0/0`).

### 3. Run both apps in development

```bash
# terminal 1
cd server && npm run dev

# terminal 2
cd client && npm run dev
```

The API runs on `http://localhost:5000` and the frontend on `http://localhost:5173`.

### 4. Create your first accounts

Register through the app's Register page — the role selector on that form is
intentionally left open (in a real deployment, only an existing admin would be able to
grant admin/staff roles) so you can create an admin, a staff, and a resident account
directly to try out every view.

To skip registering demo accounts by hand, `server/` also has a seed script that creates
2 staff and 2 resident accounts (skips any that already exist):

```bash
cd server && npm run seed
```

All seeded accounts share the password `Password123` — see *Demo credentials* above for
the exact emails, or just check the terminal output after running it.

### Production build

The server is plain JavaScript, so there's no build/compile step for it — `npm start`
just runs it directly with Node.

```bash
cd server && npm start
cd client && npm run build   # outputs static files to client/dist
```

## Folder structure

```
hostel-capstone/
├── server/                      Express + JavaScript (CommonJS) API
│   └── src/
│       ├── config/              Env loading/validation, MongoDB connection
│       ├── controllers/         Route handlers (one file per resource)
│       ├── middleware/          auth (JWT), role checks, Zod validation, error handling
│       ├── models/              Mongoose schemas (User, Resident, Room, Allocation,
│       │                        MaintenanceRequest, Invoice, Notification)
│       ├── routes/               Express routers, mounted under /api
│       ├── services/            Nodemailer email service, notification service
│       ├── utils/               ApiError, JWT helper
│       ├── validators/          Zod request schemas
│       ├── app.js               Express app setup (middleware, routes)
│       └── server.js            Entry point — connects to Mongo, starts the server
│
└── client/                      React + TypeScript frontend (Vite)
    └── src/
        ├── api/                 Axios calls per resource (thin wrappers, typed)
        ├── components/
        │   ├── ui/               Hand-built UI kit (Button, Input, Card, Modal, ...)
        │   ├── layout/           Sidebar, Topbar, DashboardLayout
        │   └── <feature>/        Feature-specific components (billing, maintenance, ...)
        ├── hooks/                TanStack Query hooks per resource
        ├── pages/                One folder per feature area, routed in App.tsx
        ├── routes/               ProtectedRoute (auth + role gating)
        ├── store/                Zustand auth store (persisted)
        ├── lib/                  Small shared utilities (cn(), error formatting)
        └── types/                Shared TypeScript interfaces (hand-duplicated from
                                   the server's shapes, not a shared package — see below)
```

## Future improvements

A few things were deliberately left out to keep this project focused and shippable as a
course capstone, but would be worth adding for a real deployment:

- **Automated tests** — unit tests for controllers/validators and component tests for
  the trickier frontend flows (billing status transitions, role-gated routes).
- **A shared types package** — right now `client/src/types` duplicates shapes defined by
  the server's Mongoose models by hand. Fine at this size; a monorepo with a shared
  `types` package would remove the duplication as the project grows.
- **A real payment gateway integration** (Razorpay/Stripe) instead of the manual
  "mark as paid" flow, for residents to pay online directly.
- **SMS notifications** — the notification system is already structured around
  pluggable channels (in-app + email); adding an SMS provider (Twilio, etc.) would slot
  in alongside the existing `emailService`/`notificationService` pattern.
- **WebSocket-based live updates** instead of the current 30-second polling for
  notifications, and a live-updating occupancy view.
- **File uploads** — attaching photos to a maintenance request, or a signed lease/ID
  document to a resident's profile.
- **Pagination** on list endpoints (rooms, residents, maintenance requests, invoices),
  which currently return everything — fine at hostel scale, not at real scale.
- **Data backup automation** — Atlas supports scheduled backups on paid tiers; worth
  documenting/automating for a production deployment.
- **Audit logging** — a record of who changed what (beyond the status/payment history
  already kept on maintenance requests and invoices).
