# EduBatch – Education Batch Management Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React 18](https://img.shields.io/badge/React_18-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB_Atlas-4EA94B?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Razorpay](https://img.shields.io/badge/Razorpay-02042B?style=flat-square&logo=razorpay&logoColor=3395FF)](https://razorpay.com/)

**EduBatch** is a production-ready, full-stack SaaS platform architected for coaching institutes, coding bootcamps, tuition centers, and educational organizations to streamline batch scheduling, student enrollments, capacity enforcement, date-wise attendance registers, Razorpay fee collections, instant invoice receipt generation, and role-based real-time analytics.

---

## 🌐 Live Deployments

- **Frontend Application (Vercel)**: [https://edubatch-seven.vercel.app](https://edubatch-seven.vercel.app)
- **Backend REST API (Render)**: [https://edubatch-api.onrender.com](https://edubatch-api.onrender.com)
- **API Health Check**: [https://edubatch-api.onrender.com/api/v1/health](https://edubatch-api.onrender.com/api/v1/health)

---

## 🔑 Verified Demo Credentials

The database comes pre-seeded with genuine production data:

| Role | Email | Password | Name / Faculty Details |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@edubatch.com` | `Password@123` | **Utsav Anand** (Super Administrator) |
| **Teacher** | `teacher@edubatch.com` | `Password@123` | **Dr. Priya Sharma** (Physics & Math Faculty) |
| **Student** | `student@edubatch.com` | `Password@123` | **Aarav Mehta** (Enrolled Student) |

> 💡 **Quick Login**: The login screen features a **1-Click Demo Fill** button to instantly authenticate as Admin, Teacher, or Student.

---

## 🌟 Key Features & Capabilities

### 1. Multi-Tier Role-Based Access Control (RBAC)
- **Admin**:
  - Full institute administration, batch creation, teacher assignment, capacity management.
  - Comprehensive revenue metrics, monthly breakdown charts, batch distribution graphs.
  - Institute-wide student and faculty management.
- **Teacher**:
  - View assigned batches, student rosters, and course schedules.
  - Date-wise attendance marking with `Present`, `Absent`, and `Late` status options.
  - Publish batch-specific or institute-wide announcements.
  - Enroll and remove students within their assigned batches.
- **Student**:
  - View enrolled courses, upcoming class schedules, and teacher contacts.
  - Personal attendance percentage tracking with attendance history.
  - In-app **Razorpay Checkout** for tuition fee payments.
  - Download official HTML/PDF fee receipts or print directly.

### 2. Batch Lifecycle & Capacity Enforcement
- Strict capacity checks reject new enrollments when `active_enrollments >= capacity`.
- Lifecycle status progression: `upcoming` ➔ `active` ➔ `archived`.
- Archived batches are automatically locked against new enrollments.
- Flexible schedules supporting custom weekly days, start times, and end times.

### 3. Fee Processing & Razorpay Integration
- Server-side order creation using Razorpay Node SDK.
- Flexible order creation accepting either `batchId` or `enrollmentId`.
- Server-side cryptographic HMAC-SHA256 signature verification.
- Bi-directional reference linking between `Enrollment` and `Payment` records.
- Asynchronous Razorpay webhook endpoint (`POST /api/v1/payments/webhook`) with raw body signature checks.
- Email delivery of branded payment receipts via Nodemailer.

### 4. Dynamic Dashboards (Zero Hardcoded Data)
- Every metric, chart, and counter queries live MongoDB aggregations.
- Zero static fallbacks or dummy mock numbers in dashboards.

---

## 📁 Repository Architecture

```
edubatch/
├── client/                         # Frontend React 18 SPA (Vite + TypeScript)
│   ├── src/
│   │   ├── api/                    # Typed Axios API client with token refresh & auto-normalization
│   │   ├── components/             # Modal, ReceiptModal, Toast, StatCard, Navbar, Sidebar
│   │   ├── context/                # AuthContext (JWT lifecycle, login, logout, demo fill)
│   │   ├── hooks/                  # Custom hooks (useAuth)
│   │   ├── layouts/                # DashboardLayout & AuthLayout
│   │   ├── pages/
│   │   │   ├── auth/               # Login, Register, Forgot Password, Reset Password
│   │   │   ├── dashboard/          # Role-specific Dashboards (Admin, Teacher, Student)
│   │   │   ├── batches/            # Batch roster & details
│   │   │   ├── students/           # Student directory & management
│   │   │   ├── enrollments/        # Capacity meters & batch enrollment modals
│   │   │   ├── payments/           # Financial counters, payment history, receipt generator
│   │   │   ├── attendance/         # Attendance register, bulk marking, presence stats
│   │   │   ├── notices/            # Pinned notices, category badges, authoring modal
│   │   │   └── profile/            # Profile editor, enrolled/assigned batches, password change
│   │   ├── utils/                  # Currency (INR) and date formatters
│   │   ├── App.tsx                 # Protected routes & role guards
│   │   └── main.tsx
│   ├── vercel.json                 # Vercel SPA rewrites & security headers
│   ├── package.json
│   └── vite.config.ts
│
├── server/                         # Backend REST API (Node.js + Express + TypeScript)
│   ├── src/
│   │   ├── config/                 # MongoDB connection & validated environment config
│   │   ├── controllers/            # Auth, Batch, Enrollment, Payment, Attendance, Notice, Profile
│   │   ├── middleware/             # JWT auth, RBAC role guard, Zod validator, rate limiters
│   │   ├── models/                 # Mongoose schemas: User, Batch, Enrollment, Payment, Attendance, Notice
│   │   ├── routes/                 # Modular API routes
│   │   ├── seed/                   # Production database seeder (4 teachers, 25 students, 5 batches)
│   │   ├── services/               # Razorpay, Nodemailer, Token, and PDF receipt services
│   │   ├── utils/                  # Unified API response & ApiError classes
│   │   ├── validators/             # Zod validation schemas
│   │   └── server.ts               # Server bootstrap, multi-prefix route mounting, CORS
│   ├── package.json
│   └── tsconfig.json
│
├── docs/                           # Detailed Technical Documentation Package
│   ├── ARCHITECTURE.md             # System architecture & Clean Architecture data flow
│   ├── API_SPECIFICATION.md        # Complete REST API endpoint reference
│   ├── DATABASE_DESIGN.md          # Entity-Relationship diagram & schema definitions
│   ├── DEPLOYMENT_GUIDE.md         # Production runbooks for Vercel, Render, and Atlas
│   ├── TESTING_CHECKLIST.md        # QA verification matrix across all features
│   └── ROADMAP.md                  # Product roadmap for v1.1, v1.2, and v2.0
│
├── postman/                        # Postman Collection
│   └── EduBatch_API.postman_collection.json
├── render.yaml                     # Render Infrastructure-as-Code blueprint
├── vercel.json                     # Root Vercel SPA routing
└── README.md
```

---

## 🛠️ Local Development & Setup

### 1. Prerequisites
- **Node.js**: `v18.0.0` or higher
- **MongoDB**: Local MongoDB instance OR MongoDB Atlas cluster URI
- **Git**

### 2. Configure Environment Files

#### Backend (`server/.env`):
```ini
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/test?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_64_characters_long
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your_refresh_token_secret_64_characters_long
REFRESH_TOKEN_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_pass
SMTP_FROM=EduBatch Support <no-reply@edubatch.com>
```

> ⚠️ **MongoDB Atlas IP Whitelist Requirement**:  
> If using MongoDB Atlas, make sure your IP is whitelisted. In the MongoDB Atlas Console, navigate to **Network Access** ➔ **Add IP Address** ➔ Select **Allow Access from Anywhere (`0.0.0.0/0`)** ➔ Click **Confirm**.

#### Frontend (`client/.env`):
```ini
VITE_API_URL=http://localhost:5000/api/v1
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id
```

### 3. Run Backend
```bash
cd server
npm install

# Seed the database with demo users, teachers, students, batches, attendance, & payments
npm run seed

# Start development server
npm run dev
```
Backend API will start on `http://localhost:5000` (API endpoint: `http://localhost:5000/api/v1`).

### 4. Run Frontend
In a separate terminal:
```bash
cd client
npm install
npm run dev
```
Frontend will launch on `http://localhost:5173`.

---

## 📡 REST API Reference

Base URL: `/api/v1` (also aliased at `/api` and `/` for seamless proxy compatibility)

| Module | Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/auth/register` | Public | Register student (Admin token required for other roles) |
| | `POST` | `/auth/login` | Public | Authenticate user & return tokens |
| | `GET` | `/auth/login` | Public | Status & usage information |
| | `POST` | `/auth/refresh` | Public | Exchange refresh token for new access token |
| | `POST` | `/auth/logout` | Auth | Invalidate refresh token |
| | `POST` | `/auth/forgot-password` | Public | Send password reset token email |
| | `POST` | `/auth/reset-password` | Public | Reset password with token |
| | `GET` | `/auth/me` | Auth | Fetch authenticated user profile |
| **Batches** | `GET` | `/batches` | Auth | List batches with search & status filters |
| | `GET` | `/batches/:id` | Auth | Get batch details, roster, & teacher |
| | `GET` | `/batches/teacher/my-batches` | Teacher | List batches assigned to teacher |
| | `POST` | `/batches` | Admin | Create a new batch |
| | `PUT` | `/batches/:id` | Admin | Update batch details |
| | `DELETE` | `/batches/:id` | Admin | Archive batch |
| | `PATCH` | `/batches/:id/status` | Admin | Update status (`upcoming`, `active`, `archived`) |
| **Enrollments** | `POST` | `/enrollments` | Admin, Teacher | Enroll student (checks capacity) |
| | `GET` | `/enrollments` | Admin, Teacher | List enrollments with filters |
| | `GET` | `/enrollments/my` | Student | View student's own active enrollments |
| | `DELETE` | `/enrollments/:id` | Admin, Teacher | Remove enrollment (`isActive: false`) |
| **Payments** | `POST` | `/payments/create-order` | Student | Create Razorpay order (`batchId` or `enrollmentId`) |
| | `POST` | `/payments/verify` | Student | Verify signature & mark payment completed |
| | `POST` | `/payments/webhook` | Public | Razorpay webhook notification listener |
| | `GET` | `/payments/history` | Admin, Student | List payments with filters |
| | `GET` | `/payments/:id` | Admin, Student | Get payment record details |
| | `GET` | `/payments/:id/receipt` | Admin, Student | Get receipt JSON or HTML invoice (`?format=html`) |
| **Attendance** | `POST` | `/attendance` | Admin, Teacher | Mark batch attendance (`Present`, `Absent`, `Late`) |
| | `GET` | `/attendance/:id` | Admin, Teacher | Get batch attendance sessions & student stats |
| | `GET` | `/attendance/my` | Student | Get personal attendance summary & history |
| | `GET` | `/attendance/student/:studentId` | Auth | Get attendance summary for specified student |
| **Notices** | `GET` | `/notices` | Auth | List notices scoped to user role |
| | `GET` | `/notices/batch/:batchId` | Auth | List notices for specific batch |
| | `POST` | `/notices` | Admin, Teacher | Publish notice |
| | `PUT` | `/notices/:id` | Admin, Author | Edit notice |
| | `DELETE` | `/notices/:id` | Admin, Author | Delete notice |
| **Analytics** | `GET` | `/analytics/admin` | Admin | Live revenue, attendance rate, & charts |
| | `GET` | `/analytics/teacher` | Teacher | Assigned batches, students count, & schedule |
| | `GET` | `/analytics/student` | Student | Enrolled batches, personal attendance %, & fees |
| **Profile** | `GET` | `/profile` | Auth | Get profile with enrolled/assigned batches |
| | `PUT` | `/profile` | Auth | Update personal profile details |
| | `PUT` | `/profile/password` | Auth | Change password |
| | `GET` | `/profile/users` | Admin, Teacher | User directory for batch assignment |

---

## 🔒 Security & Best Practices

1. **Stateless JWT Dual-Token Authentication**:
   - Short-lived Access Tokens (15m) paired with rotating Refresh Tokens (7d).
2. **Password Protection**:
   - `bcryptjs` salted hashing with 10 rounds; pre-save hooks strictly guard against double-hashing.
3. **HTTP Header Hardening**:
   - `helmet` protects against clickjacking, XSS, MIME sniffing, and frame injection.
4. **CORS Configuration**:
   - Whitelists frontend domains and `.vercel.app` deployments with credentials enabled.
5. **Rate Limiting**:
   - Brute-force protection on authentication routes (30 requests per 15 minutes) and API endpoints.
6. **Input Validation**:
   - All request bodies are strictly validated at the router level via Zod schemas.
7. **Payment Integrity**:
   - Cryptographic HMAC-SHA256 signature verification guarantees tamper-proof payment processing.

---

## 🚀 Production Deployment Guide

### Deploying Backend on Render
1. Create a **New Web Service** linked to your repository.
2. Root Directory: `server`
3. Build Command: `npm install && npm run build`
4. Start Command: `npm start`
5. Configure Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `MONGO_URI`: `mongodb+srv://...`
   - `JWT_SECRET`: `<random_64_bytes>`
   - `REFRESH_TOKEN_SECRET`: `<random_64_bytes>`
   - `CLIENT_URL`: `https://edubatch-seven.vercel.app`
   - `RAZORPAY_KEY_ID`: `<your_razorpay_key_id>`
   - `RAZORPAY_KEY_SECRET`: `<your_razorpay_key_secret>`
   - `RAZORPAY_WEBHOOK_SECRET`: `<your_razorpay_webhook_secret>`
6. Deploy service.

### Deploying Frontend on Vercel
1. Create a **New Project** linked to your repository.
2. Root Directory: `client`
3. Framework Preset: `Vite`
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Add Environment Variables:
   - `VITE_API_URL`: `https://edubatch-api.onrender.com/api/v1`
   - `VITE_RAZORPAY_KEY_ID`: `<your_razorpay_key_id>`
7. Deploy project.

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
