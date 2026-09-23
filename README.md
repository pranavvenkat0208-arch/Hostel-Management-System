# Hostel Management System

A full-stack web app for running a hostel: rooms and allocation, resident records, maintenance requests, billing with online payments, expenses, financial reports and notifications. It has separate views for **admins**, **staff** and **residents**.

Built with MongoDB, Express, React and Node.js. The API is JavaScript and the frontend is TypeScript.

---

## Contents

1. [Features](#features)
2. [Tech stack](#tech-stack)
3. [Project structure](#project-structure)
4. [Getting started](#getting-started)
5. [Demo accounts and sample data](#demo-accounts-and-sample-data)
6. [Testing guide](#testing-guide)
7. [Scripts](#scripts)
8. [API reference](#api-reference)
9. [Deploying to production](#deploying-to-production)
10. [Known limitations](#known-limitations)

---

## Features

**Accounts and roles**
- Email/password login with JWT. Passwords are hashed with bcrypt.
- Three roles: `admin`, `staff`, `resident`. Every API route checks the role on the server, and the UI hides anything the current role can't do.
- Public sign-up always creates a resident. Admins promote accounts from the Users page.
- Admins can change roles, deactivate/reactivate accounts and edit contact details. A deactivated user is logged out on their next request.
- Role changes reach the user's screen within about 30 seconds, without logging out.

**Rooms and allocation**
- Room inventory: number, type (single/double/triple/dormitory), floor, capacity, rent, amenities.
- Live occupancy, with filters for available, full and under maintenance.
- Check in, check out and change room. Full rooms and rooms under maintenance can't be allocated.
- Allocation history per room and per resident.
- A resident's preferred room type is shown to staff while allocating.

**Residents**
- Profile with contact details, emergency contact and preferred room type.
- Residents edit their own contact details. Staff and admins can edit everything except the name.

**Maintenance**
- Residents raise requests with a category and priority.
- Staff assign requests and move them through `open → in progress → resolved → closed`, with an optional note.
- Every change is kept in a timeline the resident can see (who changed it, when, and the note).

**Billing and payments**
- Monthly invoices with line items, discount and late fee.
- Staff record cash/UPI/bank/card payments. Invoice status (unpaid, partially paid, paid, overdue) is always calculated from the amounts, never set by hand.
- Payment plans: split the outstanding balance into installments with their own due dates.
- Residents pay online with Razorpay. Payments are verified on the server with the signature before they're recorded.
- Daily reminders for invoices due within 3 days or overdue, plus an optional automatic late fee.

**Expenses and reports**
- Log operating expenses by category (electricity, water, salaries, repairs, supplies, other).
- Admin reports: revenue by month (invoiced vs collected), invoices by status, expenses by category, net revenue, occupancy by room type, and check-ins over time.

**Notifications**
- In-app notifications with an unread count, for allocations, maintenance updates, invoices, payments and room changes.
- Email notifications through Gmail SMTP for the important events.

**Operations**
- Security headers (helmet), rate-limited login/register, input validation with Zod, escaped email templates.
- Weekly automatic database backup to JSON (keeps the last 10), plus an on-demand backup command.

---

## Tech stack

| Layer | Tools |
|---|---|
| Backend | Node.js 20+, Express 5, MongoDB with Mongoose 9, Zod, JWT, bcryptjs, Nodemailer, Razorpay, node-cron, helmet, express-rate-limit |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4, TanStack Query, Zustand, React Router, Recharts, lucide-react |
| Tooling | ESLint (typescript-eslint, react-hooks), nodemon |

The UI components (buttons, inputs, modals, cards) are built in-house with Tailwind, `class-variance-authority` and `tailwind-merge`. No component library is used.

---

## Project structure

```
.
├── server/                   Express API (JavaScript, CommonJS)
│   ├── scripts/              seed, backup, repair-invoices
│   └── src/
│       ├── config/           env validation, MongoDB connection
│       ├── controllers/      route handlers, one per resource
│       ├── middleware/       auth, role checks, validation, error handling
│       ├── models/           Mongoose schemas
│       ├── routes/           Express routers (mounted under /api)
│       ├── services/         email, notifications, payments, reminders, backup
│       ├── utils/            invoice status, HTML escaping, helpers
│       ├── validators/       Zod request schemas
│       ├── app.js            Express app
│       └── server.js         entry point, cron jobs, graceful shutdown
│
└── client/                   React app (TypeScript, Vite)
    └── src/
        ├── api/              axios calls per resource
        ├── hooks/            TanStack Query hooks
        ├── components/       ui/ kit, layout, and feature components
        ├── pages/            one folder per area, routed in App.tsx
        ├── routes/           ProtectedRoute (auth and role checks)
        ├── store/            Zustand stores (auth, toasts)
        ├── lib/              small helpers, Razorpay loader
        └── types/            shared TypeScript types
```

---

## Getting started

### Prerequisites

- Node.js 20 or newer
- A MongoDB database (a free MongoDB Atlas cluster works)
- Optional: a Gmail account with an [App Password](https://myaccount.google.com/apppasswords) for emails
- Optional: a [Razorpay](https://dashboard.razorpay.com/signup) account in Test Mode for online payments

The app runs without Gmail and Razorpay. Emails are skipped (and logged), and the Pay button shows a "not set up yet" message.

### 1. Install

```bash
cd server && npm install
cd ../client && npm install
```

### 2. Configure

Copy the example env files and fill them in:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

`server/.env`

| Key | Required | Notes |
|---|---|---|
| `MONGODB_URI` | yes | MongoDB connection string, including the database name |
| `JWT_SECRET` | yes | Long random string |
| `JWT_EXPIRES_IN` | no | Default `7d` |
| `CLIENT_URL` | no | Frontend URL for CORS. Default `http://localhost:5173` |
| `PORT` | no | Default `5000` |
| `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM` | no | Gmail address, App Password and sender name |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | no | Razorpay Test Mode keys |
| `LATE_FEE_AMOUNT` | no | Flat late fee in rupees added once to overdue invoices. `0` turns it off |

`client/.env`

```env
VITE_API_URL=http://localhost:5000/api
```

On MongoDB Atlas, allow your IP under **Network Access**. If Node can't resolve a `mongodb+srv://` address on your network, use the standard `mongodb://host1,host2,host3/...` connection string that Atlas also provides.

### 3. Load the demo data

```bash
cd server
npm run seed
```

> **This deletes everything in the database first**, then loads the demo accounts and six months of sample data. Run `npm run backup` beforehand if the current data matters. The seed refuses to run when `NODE_ENV=production` unless you pass `--force`.

### 4. Run

```bash
# terminal 1
cd server && npm run dev      # API on http://localhost:5000

# terminal 2
cd client && npm run dev      # app on http://localhost:5173
```

Open http://localhost:5173 and sign in with one of the demo accounts below.

---

## Demo accounts and sample data

All accounts use the password **`Password123`**.

| Role | Name | Email |
|---|---|---|
| Admin | Indira | `indira@hostel.test` |
| Staff | Sri Balaji | `sribalaji@hostel.test` |
| Staff | Sneha | `sneha@hostel.test` |
| Resident | Sanjai | `sanjai@hostel.test` |
| Resident | Muthukumar | `muthukumar@hostel.test` |

The sample data covers **April to September 2026**:

- **8 rooms**: 101 (single), 102 and 103 (double), 201 (triple), 202 (single), 203 (double, under maintenance), 301 (dormitory, 6 beds), 302 (triple).
- **Sanjai** has lived in room 102 since 3 April. He paid every month using UPI, cash and Razorpay. July was paid late with a ₹200 late fee, and August was paid in two parts.
- **Muthukumar** lived in room 201 until 1 July, then moved to single room 101. July was paid in two installments. **August is overdue** with ₹4,850 outstanding. **September is on a payment plan**: the first installment is paid and the second (₹4,890) is due 30 September.
- **6 maintenance requests** at every stage (open, in progress, resolved, closed), each with a timeline.
- **30 expense entries** and about 70 notifications.

Expected report totals: ₹93,180 invoiced, ₹83,440 collected, ₹9,740 outstanding, and net revenue of ₹1,470.

**Online payments (Razorpay Test Mode):** no real money moves. To make a test payment:

1. Enter card number **5267 3181 8797 5449**, any future expiry date, any CVV and any name.
2. If you're asked for an OTP, click **Skip OTP**.
3. On the bank page that opens next, click **Success** to complete the payment.

---

## Testing guide

This walks through every feature as each role, with what you should see. It assumes a freshly seeded database (`npm run seed`). Use a private/incognito window for a second account so you can watch two roles at once.

### 1. Sign-in and access control

| # | Steps | Expected |
|---|---|---|
| 1.1 | Sign in with a wrong password. | "Invalid email or password". |
| 1.2 | Sign in as each demo account. | The sidebar changes by role. Admin: Dashboard, Rooms, Residents, Users, Maintenance, Billing, Expenses, Reports, Notifications. Staff: the same without Users and Reports. Resident: Dashboard, My Room, Maintenance, Billing, Notifications. |
| 1.3 | As staff, open `/reports` or `/users` in the address bar. | "You don't have access to this page", with a link back to the dashboard. |
| 1.4 | As a resident, open `/rooms`. | Same access-denied page. |
| 1.5 | Log out, then open `/billing`. | Redirected to the login page. |
| 1.6 | Click **Register**, create an account (any name, a new email, a password of 6+ characters). | You're logged in as a **resident**. There's no way to choose a role at sign-up. |
| 1.7 | Log in with a wrong password many times in a row. | After 30 attempts in 15 minutes: "Too many attempts. Please try again in a few minutes." |

### 2. Admin (Indira)

**Dashboard**
- Occupancy 10%, 2 of 20 beds occupied, 2 pending maintenance requests, ₹9,740 outstanding billing.
- "Needs attention" lists the open "Room cleaning missed this week" request and the urgent "AC not cooling" request.

**Rooms**
| # | Steps | Expected |
|---|---|---|
| 2.1 | Open Rooms. | 8 rooms. 101 and 102 show 1 occupant each, and 203 shows "Maintenance". |
| 2.2 | Filter by Available / Full / Maintenance, and search "30". | The list filters correctly. The search matches 301 and 302. |
| 2.3 | **Add room**: number 104, type Double. | Capacity fills in as 2. Save and the room appears. |
| 2.4 | Add another room numbered 104. | "Room 104 already exists". |
| 2.5 | **Edit** room 104 and set the rent to 5000. | Saved. The form opens with the room's current values. |
| 2.6 | Edit room 101 and set capacity to 0, or 102 below its occupancy. | Rejected with a message. |
| 2.7 | **Toggle maintenance** on room 104, then again. | The status switches to Maintenance and back. Admin and staff get a notification. |
| 2.8 | **Allocation history** on room 101. | Muthukumar, checked in 1 July. On room 201: Muthukumar, April to July, checked out. |
| 2.9 | **Delete** room 101. | Blocked: it has a resident. Delete room 104 instead (confirm the dialog) and it disappears. |

**Residents**
| # | Steps | Expected |
|---|---|---|
| 2.10 | Open Residents. | Sanjai (102) and Muthukumar (101) are Active, plus any account you registered in 1.6 with no room. |
| 2.11 | **Allocate room** for the resident from 1.6. Pick room 103. | The resident now shows room 103. Room 103 shows 1/2. The resident gets a "Room assigned" notification (and an email if configured). |
| 2.12 | Try to allocate room 203. | Not offered, because it's under maintenance. |
| 2.13 | **Change room** for that resident to 202. | Room 103 goes back to 0/2 and 202 becomes 1/1 (Full). |
| 2.14 | **Check out** that resident. | Room 202 is free again. Because it was full, admin/staff get "Room now available", and any roomless resident whose preferred type is single is told too. |
| 2.15 | **Edit details** for Sanjai: change the emergency contact. | Saved with a confirmation toast. The name field is not editable. |
| 2.16 | **Delete resident** for Sanjai. | Not offered while he has a room. It's available for the checked-out resident from 2.14 and removes both the profile and the login. |

**Users**
| # | Steps | Expected |
|---|---|---|
| 2.17 | Open Users. | All accounts with role, status and phone. |
| 2.18 | Change Sneha's role to Admin. In another window, logged in as Sneha, wait up to 30 seconds or switch back to that tab. | Sneha's sidebar gains Users and Reports without logging out. Change her back to Staff afterwards. |
| 2.19 | **Deactivate** Muthukumar while he's logged in elsewhere. | His session is logged out on the next request, and he can't log in ("This account has been deactivated"). **Activate** him again. |
| 2.20 | Try to change your own role or deactivate yourself. | Rejected. |
| 2.21 | **Edit** a user's email to one that's already taken. | "Another account already uses this email". |

**Billing** (admin and staff)
| # | Steps | Expected |
|---|---|---|
| 2.22 | Open Billing. | 12 invoices. Muthukumar's August invoice is **Overdue**, September is **Partially paid**, and the rest are **Paid**. |
| 2.23 | **Create invoice**: choose Sanjai. | The "Room fee" line fills in with ₹4,500 from his room. Add a line "Laundry ₹300", set a billing period and due date, and create it. The total is correct, Sanjai is notified, and the status is Unpaid. |
| 2.24 | **Update payment status** on that invoice: Partially paid, ₹2,000, UPI. | Status Partially paid, ₹2,000 paid. |
| 2.25 | Try to record more than the remaining balance. | The amount field is capped at the balance, and the API rejects anything higher ("That's more than the ₹… still outstanding"). |
| 2.26 | Choose **Paid** with no amount. | The remaining balance is recorded automatically and the status becomes Paid. |
| 2.27 | **Edit discount & late fee** on Muthukumar's August invoice: late fee 250. | The total goes up by 250 and it stays Overdue. Setting a discount that drops the total below ₹5,000 (already paid) is rejected. |
| 2.28 | Create another unpaid invoice and open **Payment plan**. Split it into 2 installments that don't add up to the total. | Save is disabled, and the total shows in red. Fix the amounts and save. |
| 2.29 | **Mark paid manually** on the first installment. | The installment shows Paid and the invoice becomes Partially paid. |
| 2.30 | Open **Payment plan** on Muthukumar's September invoice. | Installment 1 paid (Razorpay), installment 2 pending. |

**Expenses**
| # | Steps | Expected |
|---|---|---|
| 2.31 | Open Expenses. | 30 entries from April to September. Filter by category. |
| 2.32 | **Log an expense**: Supplies, ₹500. | Added to the list. The net revenue on Reports drops by ₹500. |
| 2.33 | Delete that expense. | Removed (admins only). |

**Reports**
| # | Steps | Expected |
|---|---|---|
| 2.34 | Open Reports. | Totals match the figures above (plus anything you added). Revenue by month shows invoiced vs collected, with August and September collected lower. |
| 2.35 | Check the other charts. | Invoices by status, expenses by category, occupancy by room type, and check-ins per month (April 2, July 1). |

### 3. Staff (Sri Balaji or Sneha)

| # | Steps | Expected |
|---|---|---|
| 3.1 | Open Rooms. | The list and filters work, but there's no Add, Edit, Maintenance toggle or Delete (admin only). Allocation history is still available. |
| 3.2 | Open Residents. | Allocate, change room, check out and edit details are available. Delete is not. |
| 3.3 | Open Maintenance. | All 6 requests. Filter by status. |
| 3.4 | Assign "Room cleaning missed this week" to Sneha. | The status moves to **In progress** automatically, and Sneha gets an "assigned to you" notification. Sanjai's request now shows In progress. |
| 3.5 | **Update status** on "AC not cooling" to Resolved with the note "Gas refilled". | The status changes. Muthukumar gets a notification and email, and the note appears on his timeline. |
| 3.6 | Billing and Expenses. | Same as admin, except expenses can't be deleted. |
| 3.7 | Notifications. | New maintenance requests, assignments and room updates. Mark one as read, then **Mark all read**. The bell count updates. |

### 4. Resident (Sanjai or Muthukumar)

**Dashboard and My Room**
| # | Steps | Expected |
|---|---|---|
| 4.1 | Sign in as Muthukumar. | The dashboard shows Room 101, open requests, and the amount due (₹9,740 on fresh data). |
| 4.2 | Open **My Room**. | Room 101, single, floor 1, ₹6,500/month. |
| 4.3 | Change the emergency contact phone to something invalid, e.g. `123`. | Rejected: "Enter a 10-digit phone number…". Enter a valid number and save. You'll see "Contact details saved." |
| 4.4 | Change the preferred room type and save. | Saved. Staff see it as a hint while allocating. |

**Maintenance**
| # | Steps | Expected |
|---|---|---|
| 4.5 | Open Maintenance. | Only your own requests. |
| 4.6 | Click "Bathroom tap leaking". | Timeline: Opened by Muthukumar → In progress by Indira → Resolved by Sneha ("Washer and spindle replaced.") → Closed. |
| 4.7 | **New request**: "Window latch broken", Furniture, Medium. | It appears as Open. Admin and staff get a notification. |
| 4.8 | Sign in as a resident with no room (e.g. one you registered) and try to create a request. | "You need a room assignment before submitting a maintenance request". |

**Billing and online payment**
| # | Steps | Expected |
|---|---|---|
| 4.9 | Open Billing. | Only your own invoices, with line items, payment history and payment plans. |
| 4.10 | On the September invoice, click **Pay ₹4890 now**. | Razorpay Checkout opens for ₹4,890 (the next pending installment, not the full balance). |
| 4.11 | Pay with card 5267 3181 8797 5449, any future date, any CVV. Click **Skip OTP** if asked, then **Success** on the bank page. | The invoice becomes **Paid**, the installment shows Paid via Razorpay, and you get a "Payment received" notification and email. |
| 4.12 | Close the Checkout window without paying. | Nothing is recorded, and the button becomes clickable again. |
| 4.13 | On the overdue August invoice, click **Pay**. | Checkout opens for the full ₹4,850 balance (no plan on this invoice). |
| 4.14 | As admin, check Reports after paying. | Collected goes up and outstanding goes down by the amount paid. |

### 5. Background jobs

| Job | When | How to check |
|---|---|---|
| Billing reminders | Every day at 9 AM, and once 15 seconds after the server starts | Invoices due within 3 days or overdue get an in-app reminder and email, at most once every 24 hours per invoice. The seeded overdue invoice was last reminded on 22 September, so a restart the next day sends a new reminder. |
| Automatic late fee | During the reminder run | Set `LATE_FEE_AMOUNT=200`, create an invoice with a past due date, and restart the server. After about 15 seconds the invoice total goes up by ₹200, once only. |
| Weekly backup | Sundays at 3 AM | Run `npm run backup` to try it now. A timestamped folder with one JSON file per collection appears under `server/backups/`. Only the latest 10 are kept. |

### 6. Quick API checks (optional)

```bash
curl http://localhost:5000/api/health
# {"success":true,"message":"Hostel Management API is running"}

curl http://localhost:5000/api/rooms
# 401 {"success":false,"message":"Not authenticated: no token provided"}
```

---

## Scripts

**server/**

| Command | What it does |
|---|---|
| `npm run dev` | Start the API with nodemon (port 5000) |
| `npm start` | Start the API with node |
| `npm run seed` | **Wipe the database** and load the demo data |
| `npm run backup` | Dump every collection to `server/backups/<timestamp>/` |
| `npm run repair-invoices` | One-off fix for old invoices whose status and amount paid don't match. Safe to re-run |

**client/**

| Command | What it does |
|---|---|
| `npm run dev` | Start Vite (port 5173) |
| `npm run build` | Type-check and build to `client/dist` |
| `npm run lint` | ESLint |
| `npm run preview` | Serve the production build locally |

---

## API reference

All routes are under `/api`. Every route except register, login and health needs an `Authorization: Bearer <token>` header. Responses look like `{ success, ... }`, and errors look like `{ success: false, message }`.

| Method | Route | Roles |
|---|---|---|
| POST | `/auth/register` | public (creates a resident) |
| POST | `/auth/login` | public |
| GET | `/auth/me` | any |
| GET | `/rooms`, `/rooms/:id`, `/rooms/occupancy-summary` | admin, staff |
| POST / PATCH / DELETE | `/rooms`, `/rooms/:id` | admin |
| GET / PATCH | `/residents/me` | resident |
| GET / PATCH | `/residents`, `/residents/:id` | admin, staff |
| DELETE | `/residents/:id` | admin |
| GET | `/allocations` | admin, staff |
| POST | `/allocations/allocate`, `/allocations/check-out`, `/allocations/change-room` | admin, staff |
| POST | `/maintenance` | resident |
| GET | `/maintenance/my` | resident |
| GET | `/maintenance`, `/maintenance/:id` | admin, staff (residents: own request only) |
| PATCH | `/maintenance/:id/assign`, `/maintenance/:id/status` | admin, staff |
| GET | `/invoices/my` | resident |
| GET / POST | `/invoices` | admin, staff |
| GET | `/invoices/:id` | admin, staff, owning resident |
| PATCH | `/invoices/:id/payment-status`, `/invoices/:id/adjustments` | admin, staff |
| POST | `/invoices/:id/installments` | admin, staff |
| PATCH | `/invoices/:id/installments/:index/pay` | admin, staff |
| POST | `/invoices/:id/pay/order`, `/invoices/:id/pay/verify` | resident |
| GET / POST | `/expenses` | admin, staff |
| DELETE | `/expenses/:id` | admin |
| GET | `/users` | admin, staff |
| PATCH | `/users/:id/role`, `/users/:id/status`, `/users/:id/details` | admin |
| GET | `/reports/revenue`, `/reports/occupancy`, `/reports/expenses` | admin |
| GET | `/notifications` | any |
| PATCH | `/notifications/:id/read`, `/notifications/read-all` | any |
| GET | `/health` | public |

---

## Deploying to production

- Set `NODE_ENV=production`. The API then uses combined access logs, hides internal error details, and trusts the hosting platform's proxy so rate limiting sees real client IPs.
- Set `CLIENT_URL` to the frontend's URL. Only that origin is allowed by CORS.
- Use a long random `JWT_SECRET`, e.g. `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.
- Build the client with `VITE_API_URL` set to the deployed API, and serve `client/dist` with a fallback to `index.html` for all routes.
- The server shuts down cleanly on `SIGTERM`: it finishes in-flight requests and closes the database connection.
- Don't run `npm run seed` against the production database.
- On a free Render plan the API sleeps after about 15 minutes idle. The login and register pages wake it automatically and show a "server is starting up" notice until it responds. To avoid the wait, point an uptime monitor (e.g. UptimeRobot) at `/api/health` every 10 minutes.

---

## Known limitations

- No automated test suite yet. Features are tested manually with the guide above.
- Lists aren't paginated. That's fine at hostel scale but wouldn't scale to thousands of records.
- Updates use 30-second polling rather than WebSockets.
- Razorpay payments are confirmed through the Checkout callback only. A webhook would also catch payments completed after the browser tab closes.
- SMS notifications aren't implemented. In-app and email are.
- The client's TypeScript types are written by hand to match the server models.
