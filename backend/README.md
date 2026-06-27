# Zimco Cooperative Society Portal - Full-Stack Production Backend 🚀

This folder contains the complete production-ready, highly secure **Node.js (Express)** and **PostgreSQL** backend system engineered to pair with your Zimco Cooperative React frontend.

---

## 📂 Recommended Monorepo Folder Organization

To bundle everything in **one GitHub Repository** and deploy cleanly to separate hosting clouds, structure your project like this:

```text
zimco-cooperative-portal/ (Git Root)
├── backend/                  # <-- THIS COMPREHENSIVE BACKEND DIRECTORY
│   ├── src/
│   │   ├── config/db.js      # DB Connection pooling with pg
│   │   ├── controllers/      # Route controllers (Auth, Loans, Bursary, Members)
│   │   ├── middleware/       # JWT Authentication & Role Authorization
│   │   ├── routes/api.js     # Master API endpoints map
│   │   └── index.js          # Express entry point
│   ├── .env.example
│   ├── package.json          # Node.js backend build & dependency definitions
│   └── README.md
│
└── frontend/                 # <-- MOVE YOUR EXISTING VITE/REACT FILES HERE
    ├── src/
    ├── public/
    ├── index.html
    ├── package.json
    └── vite.config.ts
```

---

## 🗄️ Database Schema Design (PostgreSQL)

Your database layer resides in `backend/src/db/schema.sql`. It matches the exact forms, loans rules, and bursary ledger inputs of the frontend:

1. **`members`**: Stores user profiles, roles, and password hashes safely using `bcryptjs`.
2. **`savings_balances`**: Tracks real-time Ordinary Savings, Special Savings, Investment pools, and outstanding loan balances.
3. **`loan_applications`**: Manages member loan requests with interest, duration, repayment weight, underwriting comments, and decision statuses.
4. **`deduction_records`**: Houses salary deductions parsed and edited inside the Bursary Dashboard per payroll period cycle (e.g. `June 2026`).
5. **`audit_logs`**: Preserves systemic compliance trails (logins, files uploaded, loans decision changes).

---

## 📡 Core API Endpoints Map

All endpoints are guarded by JWT state verification (`Bearer <Token>`) and restricted to specific corporate cooperative roles:

### 🔐 Authentication Channels
* `POST /api/auth/register` - Creates a new member, assigns a staff ID (or formats custom `ZIM-YYYY-XXX`), and instantiates their default savings rows.
* `POST /api/auth/login` - Handshakes credentials and returns a JWT signed with user metadata and role scopes.

### 👤 Member Balances & Ledgers
* `GET /api/members/profile` - Fetches active balances and profile attributes.
* `GET /api/members/deductions` - Pulls historical monthly deductions associated with the authenticated member.
* `GET /api/members/list` - (*Admins, Bursary, Credit Officers, Auditors*) Retrieves a directory of all registered member rosters.

### 💼 Salary Deductions Ingestion (Bursary)
* `GET /api/bursary/deductions?cycle=June 2026` - Pulls the central worksheet data for a specific cycle.
* `POST /api/bursary/deductions/batch` - Processes batch upload payloads with full validation rules (matches Staff ID formats, calculates math mismatch warnings, verifies debt limits).
* `PUT /api/bursary/deductions/:cycle/:memberId` - Adjusts individual table cells live in the workbench grid.
* `DELETE /api/bursary/deductions/:cycle/:memberId` - Excises a row from the current month's workbook.

### 💰 Loan Underwriting
* `POST /api/loans/apply` - Evaluates credit eligibility (3x of total savings minus current debt), calculates a flat 6% amortized rate, and queues application.
* `GET /api/loans/my` - Member checks on outstanding loan statuses.
* `GET /api/loans/list` - (*Credit Officers/Admins*) Master review stream of all submitted loan applications.
* `PUT /api/loans/:id/decision` - Credit decision trigger. If approved, loan is activated and principal is credited automatically to outstanding debt calculations.

---

## ⚡ Setup & Local Run Guide

### 1. Database Provisioning
Install PostgreSQL locally or create a database cluster on **Supabase** / **ElephantSQL** / **Render**.
Run the contents of `/backend/src/db/schema.sql` inside your query tool (e.g., pgAdmin, psql, or Supabase SQL Editor). This will build the schemas and load seed data for test drives.

### 2. Configure Local Variables
Copy `.env.example` into a new `.env` file:
```bash
cp .env.example .env
```
Fill in your database URL connection string:
```env
DATABASE_URL=postgresql://your_db_user:password@localhost:5432/zimco_cooperative
JWT_SECRET=set_your_own_custom_secure_secret_key
PORT=5000
```

### 3. Bootstrap Backend
Install dependencies and run:
```bash
cd backend
npm install
npm run dev
```

---

## 🌍 Production Deployment Playbook

### Backend (Railway or Render)
1. **Source Connection**: Link your GitHub repo.
2. **Root Directory**: Set build settings root to `/backend`.
3. **Environment**: Add `DATABASE_URL` (provision Postgres add-on if on Railway), `JWT_SECRET`, and set `NODE_ENV` to `production`.
4. **Command**:
   - Build Command: `npm install`
   - Start Command: `npm start`

### Frontend (Vercel or Netlify)
1. **Build Directory**: Set root to `/frontend` (or your folder name).
2. **Configuration**:
   - Build command: `npm run build`
   - Output directory: `dist`
3. **Variables**: Define `VITE_API_URL` pointing to your deployed backend (e.g. `https://your-backend.railway.app/api`).
4. **Rewrite Rule (Vercel `vercel.json`)**: If using browser routing fallbacks, place this in your frontend root:
   ```json
   {
     "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
   }
   ```
