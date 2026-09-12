# EduBatch – Education Batch Management Platform

EduBatch is a production-ready, full-stack SaaS platform designed for coaching institutes, coding bootcamps, tuition centers, and educational organizations to streamline batch scheduling, student enrollments, attendance registers, fee collection with Razorpay, instant receipt generation, and role-based analytics.

---

## 🌟 Key Highlights & Architecture

- **Three-Tier Architecture**:
  - **Frontend**: React 18 SPA built with Vite, Tailwind CSS, React Router v6, Axios interceptors, React Hook Form, Zod validation, and Recharts.
  - **Backend**: Node.js & Express REST API with TypeScript, Controller-Service-Repository pattern, centralized error handling, and robust security middleware.
  - **Database**: MongoDB with Mongoose ODM, optimized compound indexes, and relational population.
- **Enterprise RBAC (Role-Based Access Control)**:
  - **Admin**: Create teachers, students, manage all batches, enrollments, view all payments & revenue charts, manage notices and attendance.
  - **Teacher**: View assigned batches, mark student attendance, create batch-specific and global announcements, view student rosters.
  - **Student**: View enrolled courses, track attendance percentages, execute Razorpay tuition fee payments, and download/print official receipts.
- **Payment Lifecycle**:
  - Integrated with **Razorpay** SDK for cryptographic order generation and HMAC-SHA256 signature verification.
  - Generates itemized tax receipts and triggers HTML receipt emails using **Nodemailer**.
  - Built-in sandbox testing fallback allows complete testing without live merchant keys.

---

## 🚀 Demo Credentials

The database seeder automatically creates the following accounts:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@edubatch.com` | `Password@123` | Full Administrative & Analytics Access |
| **Teacher** | `teacher@edubatch.com` | `Password@123` | Faculty Access (Dr. Priya Sharma) |
| **Student** | `student@edubatch.com` | `Password@123` | Student Portal (Aarav Mehta) |

> **Note**: The login screen features a **1-Click Demo Fill** button to instantly authenticate as any role for testing.

---

## 📁 Project Structure

```
edubatch/
├── client/                     # Frontend SPA (React 18 + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── api/                # Typed Axios API clients (auth, batches, payments, etc.)
│   │   ├── components/         # Modals, Toast, Sidebar, Navbar, StatCard, Checkout
│   │   ├── context/            # AuthContext with token refresh and demo login
│   │   ├── hooks/              # Custom React hooks (useAuth)
│   │   ├── layouts/            # DashboardLayout & AuthLayout
│   │   ├── pages/
│   │   │   ├── auth/           # Login, Register, Forgot Password, Reset Password
│   │   │   ├── dashboard/      # Admin, Teacher, and Student role dashboards
│   │   │   ├── batches/        # Batch directory & Batch Details page
│   │   │   ├── students/       # Student management & directory
│   │   │   ├── enrollments/    # Capacity cards & enrollment workflows
│   │   │   ├── payments/       # Fee history, Razorpay checkout, Receipt printer
│   │   │   ├── attendance/     # Daily register, bulk marking, presence stats
│   │   │   ├── notices/        # Pinned notices, announcements, category tags
│   │   │   ├── profile/        # Personal details & password change
│   │   │   └── settings/       # Localization & notification preferences
│   │   ├── utils/              # INR currency & date formatters
│   │   ├── App.tsx             # React Router v6 tree
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── server/                     # Backend REST API (Node.js + Express + TypeScript)
│   ├── src/
│   │   ├── config/             # DB connection and validated environment variables
│   │   ├── controllers/        # Auth, Batch, Enrollment, Payment, Attendance, Notices
│   │   ├── middleware/         # JWT Auth, RBAC Role guard, Zod validator, Rate limiters
│   │   ├── models/             # Mongoose schemas (User, Batch, Enrollment, Payment, Attendance, Notice)
│   │   ├── routes/             # Express v1 modular routes
│   │   ├── seed/               # Database seeder (5 batches, 25 students, 4 teachers)
│   │   ├── services/           # Razorpay, Nodemailer, Token, and PDF services
│   │   ├── utils/              # Standardized API response and ApiError handlers
│   │   ├── validators/         # Zod schemas for all request payloads
│   │   └── server.ts           # Express server entry point
│   ├── package.json
│   └── tsconfig.json
│
├── postman/                    # Postman collection for all API endpoints
│   └── EduBatch_API.postman_collection.json
├── .env.example
├── vercel.json                 # Frontend deployment configuration
├── render.yaml                 # Backend deployment configuration
└── README.md
```

---

## 🛠️ Local Installation & Development

### 1. Prerequisites
- Node.js `v18+` or `v20+` installed
- MongoDB installed locally OR a free MongoDB Atlas connection URI

### 2. Configure Environment Variables
Copy `.env.example` into `server/.env`:
```bash
cp .env.example server/.env
```
Default parameters in `server/.env`:
```ini
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/edubatch
JWT_SECRET=your_jwt_secret_key_here
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here
CLIENT_URL=http://localhost:5173
RAZORPAY_KEY_ID=rzp_test_edubatch_demo_key
RAZORPAY_KEY_SECRET=rzp_test_edubatch_demo_secret
```

### 3. Backend Setup & Database Seeding
```bash
cd server
npm install

# Seed the database with demo users, 5 batches, 25 students, attendance, & notices
npm run seed

# Start development server
npm run dev
```
The backend will run on `http://localhost:5000` with API root at `http://localhost:5000/api/v1`.

### 4. Frontend Setup
In a new terminal:
```bash
cd client
npm install
npm run dev
```
The client will launch at `http://localhost:5173`.

---

## 📡 API Documentation

### Base URL: `/api/v1`

All responses follow the unified standard response format:
```json
{
  "success": true,
  "message": "Operation Successful",
  "data": { ... }
}
```

### Authentication (`/api/v1/auth`)
- `POST /register`: Register user (`name`, `email`, `password`, `role`)
- `POST /login`: Authenticate and obtain JWT access & refresh tokens
- `POST /refresh-token`: Exchange valid refresh token for a new access token
- `POST /logout`: Invalidate refresh token
- `POST /forgot-password`: Dispatch password reset token
- `POST /reset-password`: Set new password with token
- `GET /me`: Get authenticated user profile and permissions

### Batches (`/api/v1/batches`)
- `GET /`: List batches (supports `search`, `status`, `page`, `limit`, `sort`)
- `GET /:id`: Get batch details, enrolled students, and assigned faculty
- `POST /`: Create batch (Admin only)
- `PUT /:id`: Update batch (Admin only)
- `DELETE /:id`: Archive batch (Admin only)
- `PATCH /:id/status`: Update status (`active`, `upcoming`, `archived`)
- `GET /teacher/my-batches`: Teacher views assigned batches

### Enrollments (`/api/v1/enrollments`)
- `POST /`: Enroll student into batch (Enforces capacity limits: rejects when `enrolled >= capacity`)
- `GET /`: List all enrollments with student and batch details (Admin/Teacher)
- `GET /my`: Student views their own active enrollments
- `DELETE /:id`: Cancel/remove enrollment (Admin only)

### Payments (`/api/v1/payments`)
- `POST /create-order`: Create Razorpay order for tuition fee
- `POST /verify`: Verify Razorpay signature, mark payment `paid`, update enrollment `paymentStatus = paid`, send email
- `GET /history`: Get payment transaction history (Admin gets all, Student gets own)
- `GET /:id`: Get payment details
- `GET /:id/receipt`: Download or print formatted invoice receipt

### Attendance (`/api/v1/attendance`)
- `POST /`: Mark daily attendance for a batch (`Present`, `Absent`, `Late`)
- `GET /batch/:id`: Get attendance history and student percentages for a batch
- `GET /my`: Student retrieves own attendance statistics and session history

### Notices (`/api/v1/notices`)
- `GET /`: List notices with RBAC filtering (Admin: all, Teacher: assigned + global, Student: enrolled + global)
- `POST /`: Publish notice with category and optional batch targeting
- `PUT /:id`: Update notice
- `DELETE /:id`: Delete notice

### Analytics (`/api/v1/analytics`)
- `GET /admin`: Complete institute analytics (revenue, attendance trend, enrollment chart)
- `GET /teacher`: Teacher dashboard metrics and upcoming classes
- `GET /student`: Student dashboard metrics and fee alerts

---

## 🔒 Security Architecture

1. **Helmet**: Secures HTTP response headers against clickjacking, XSS, and sniffing.
2. **CORS**: Strict whitelisting of frontend client origin with credentials support.
3. **bcryptjs**: Password salted hashing with 10+ rounds.
4. **JWT Dual-Token System**: Short-lived access tokens (15m) paired with rotating refresh tokens (7d).
5. **Rate Limiting**: `express-rate-limit` prevents brute-force login attempts (30 requests/15m) and protects all API endpoints.
6. **Input Sanitization & Zod**: Every request payload is validated against strict Zod schemas before hitting controllers.
7. **Razorpay HMAC-SHA256 Verification**: Payments are verified server-side using secret cryptographic signatures before any balance or status updates.

---

## ☁️ Deployment Instructions

### Frontend (Vercel)
1. Push repository to GitHub.
2. Link project in Vercel. Set **Root Directory** to `client`.
3. Set **Framework Preset** to `Vite`.
4. Add Environment Variable:
   - `VITE_API_URL`: Your deployed backend URL (e.g. `https://edubatch-api.onrender.com/api/v1`).
5. Deploy. `vercel.json` already contains single-page application rewrites.

### Backend (Render / Railway)
1. In Render, select **New Web Service** and link the repository.
2. Set **Root Directory** to `server`.
3. Build Command: `npm install && npm run build`
4. Start Command: `npm start`
5. Configure Environment Variables:
   - `MONGO_URI`: Your MongoDB Atlas cluster connection string
   - `JWT_SECRET`: Random 64-character secret
   - `REFRESH_TOKEN_SECRET`: Random 64-character secret
   - `CLIENT_URL`: Your Vercel frontend URL
   - `RAZORPAY_KEY_ID`: Your Razorpay Key ID
   - `RAZORPAY_KEY_SECRET`: Your Razorpay Key Secret
6. Run `npm run seed` via Render shell or locally pointing to the Atlas URI to populate seed data.

---

## 🧪 Postman Collection
Import `postman/EduBatch_API.postman_collection.json` into Postman to test all endpoints with pre-configured parameters and sample bodies.
