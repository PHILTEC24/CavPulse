# CavPulse — Intelligent Attendance Management System

> **Cavendish University Uganda** | QR-Based Real-Time Attendance Tracking

[![Live Demo](https://img.shields.io/badge/Live%20Demo-cav--pulse.vercel.app-6366f1?style=for-the-badge&logo=vercel)](https://cav-pulse.vercel.app)
[![Backend](https://img.shields.io/badge/API-Render-46e3b7?style=for-the-badge&logo=render)](https://cavpulse-api.onrender.com)

---

## 🌐 Live Demo

| Service | URL |
|---------|-----|
| **Frontend** | [https://cav-pulse.vercel.app](https://cav-pulse.vercel.app) |
| **Backend API** | [https://cavpulse-api.onrender.com](https://cavpulse-api.onrender.com) |

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | `admin@cavpulse.ac.ug` | `Admin@123` |
| Academic Admin | `academic@cavpulse.ac.ug` | `Academic@123` |
| Head of Department | `hod.cs@cavpulse.ac.ug` | `Hod@123` |
| Lecturer | `lecturer@cavpulse.ac.ug` | `Lecturer@123` |
| Student | `student@cavpulse.ac.ug` | `Student@123` |

> ⚠️ The backend runs on Render's free tier and may take ~30 seconds to wake up after a period of inactivity.

---

## 🚀 Features

- **QR Code Attendance** — Lecturers generate a live QR code; students scan to register attendance in real time
- **Role-Based Access** — Super Admin, Academic Admin, HoD, Lecturer, and Student portals
- **Real-Time Updates** — WebSocket-powered live attendance feed during active sessions
- **Analytics & Reports** — Attendance trends, per-course stats, and exportable reports
- **Timetable Management** — Full academic timetable with lecture session scheduling
- **Secure Auth** — JWT access + refresh tokens with bcrypt password hashing

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router), Tailwind CSS, shadcn/ui |
| Backend | NestJS, Prisma ORM, WebSockets |
| Database | Neon Serverless PostgreSQL |
| Auth | JWT (access + refresh), bcryptjs |
| Monorepo | Turborepo, npm workspaces |
| Hosting | Vercel (frontend) + Render (backend) |

---

## 📁 Project Structure

```
CavPulse/
├── apps/
│   ├── api/          # NestJS backend
│   └── web/          # Next.js 15 frontend
├── packages/
│   └── shared/       # Shared TypeScript types & DTOs
├── prisma/
│   ├── schema.prisma # Database schema
│   └── seed.ts       # Demo data seed
└── turbo.json        # Turborepo config
```

---

## 🛠️ Local Development

### Prerequisites
- Node.js 18+
- npm 10+

### Setup

```bash
# Clone the repo
git clone https://github.com/PHILTEC24/CavPulse.git
cd CavPulse

# Install dependencies
npm install

# Set up environment variables
cp apps/api/.env.example apps/api/.env
# Fill in your DATABASE_URL, JWT secrets, etc.

# Run database migrations & seed
npx prisma migrate dev --schema=prisma/schema.prisma
npx ts-node prisma/seed.ts

# Start both apps in development
npm run dev
```

---

## 📄 License

This project was developed as part of an academic project at **Cavendish University Uganda**.
