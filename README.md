<div align="center">

# 📖 BookNest

**A warm, literary sanctuary for curious readers and book circles.**

*“I have always imagined that Paradise will be a kind of library.”*  
— Jorge Luis Borges

<br/>

[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript_5.8-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite_6-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![NestJS](https://img.shields.io/badge/NestJS_12-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma_ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/Supabase_PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)

<br/>

[Features](#-key-features) • [Tech Stack](#-technology-stack) • [Architecture](#-system-architecture) • [Getting Started](#-getting-started) • [Environment Setup](#-environment-variables) • [API Reference](#-api-reference)

</div>

---

## ☕ Overview

**BookNest** is a full-stack reading companion and literary community platform. Designed with a timeless, warm-paper editorial aesthetic, it blends seamless book discovery, personal library curation, and interactive reading circles with live discussion salons.

Whether you're cataloging personal reading goals or hosting a book club discussion on chapter highlights, BookNest provides an elegant, distraction-free space for literary lovers.

---

## ✨ Key Features

### 🔍 Literary Discovery & Open Library Integration
- **Live Search**: Instant query resolution powered by the Open Library API.
- **Rich Metadata**: High-resolution book covers, authors, publication history, and edition IDs.
- **Curated Recommendations**: Pre-populated classical and modern literature highlights.

### 📚 Personal Bookshelf ("My Shelf")
- **Reading Status Tracking**: Organize books into *Want to Read*, *Currently Reading*, and *Finished*.
- **Personal Ratings & Notes**: 5-star ratings and reflective reading notes stored securely.
- **Dynamic Filtering**: Tabbed filtering with real-time counters and empty-state guidance.

### 🏛️ Book Clubs & Reading Circles
- **Public & Private Circles**: Discover community clubs or create private, invite-only spaces.
- **Thematic Inspiration**: Built-in prompts for Classic Literature, Speculative Sci-Fi, Memoirs, and more.
- **1-Click Membership**: Join public circles to share books and participate in salons.

### 💬 Salon Discussions
- **Threaded Reflections**: Post questions, quotes, and reading impressions (up to 2,000 characters).
- **Inline Moderation**: Delete discussions created by yourself, or moderate any post if you are the club owner.
- **Delightful Micro-interactions**: Inline confirmation prompts, animated feedback, and background scroll locking when viewing modals.

### 🔐 Secure Authentication
- **Google OAuth**: Fast sign-in powered by Google Identity Services (`@react-oauth/google`).
- **HttpOnly Cookies**: Session tokens secured against XSS and stored in partitioned `booknest_session` cookies.
- **State Synchronization**: Automatic user session restoration on page refreshes via Zustand.

---

## 🛠️ Technology Stack

| Layer | Technologies | Highlights |
| :--- | :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite | Fast HMR, component modularity, strict typing |
| **Styling** | Tailwind CSS v4, Lucide Icons | Vintage editorial palette (`#fcfaf7`, `#8b4513`, `#2b2420`), serif typography |
| **State** | Zustand | Lightweight client stores (`authStore`, `shelfStore`) |
| **Backend** | NestJS 12, Express | Modular controllers, dependency injection, session guards |
| **Database** | PostgreSQL via Supabase | Managed cloud Postgres with transaction pooling |
| **ORM** | Prisma ORM 6 | Type-safe migrations, connection resilience & retries |
| **Auth** | Google Auth Library, `@nestjs/jwt` | Token verification, signed JWT sessions |
| **Quality** | Vitest, ESLint, Oxlint, Prettier | Fast unit testing, static analysis, code formatting |

---

## 📐 System Architecture

```
BookClub/
├── book-club-api/               # NestJS Backend API
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema (Users, Clubs, Books, Discussions)
│   │   └── migrations/          # SQL migration files
│   ├── src/
│   │   ├── auth/                # Google OAuth verification & session handlers
│   │   ├── books/               # Open Library search proxy & normalization
│   │   ├── bookshelf/           # User shelf CRUD endpoints
│   │   ├── clubs/               # Book clubs, members, books & discussion salon
│   │   ├── prisma/              # Prisma client service with cold-start retry loop
│   │   └── app.module.ts        # Root NestJS module configuration
│   └── package.json
│
├── book-club-frontend/          # React + Vite Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── books/           # Book cards, search results, status toggles
│   │   │   ├── clubs/           # Club cards, discussion tabs, create/add modals
│   │   │   ├── layout/          # Header, Sidebar, Navigation
│   │   │   └── ui/              # Buttons, badges, tabs, dialogs
│   │   ├── pages/               # Explore, MyShelf, BookClubs, ClubDetails
│   │   ├── stores/              # Zustand stores (authStore, shelfStore)
│   │   ├── types/               # TypeScript models (auth, book, shelf)
│   │   └── constants/           # Base URLs and endpoints
│   └── package.json
│
└── README.md                    # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have installed:
- [Node.js](https://nodejs.org/) (v20 or v22 LTS recommended)
- [pnpm](https://pnpm.io/) (`corepack enable && corepack prepare pnpm@latest --activate` or `npm i -g pnpm`)
- A [Supabase](https://supabase.com/) PostgreSQL database project
- A [Google Cloud Console](https://console.cloud.google.com/) OAuth 2.0 Web Client ID

---

### 1. Clone the Repository

```bash
git clone https://github.com/MikiZenebe/Book-Club-API.git BookClub
cd BookClub
```

---

### 2. Configure the Backend (`book-club-api`)

Navigate to the API directory and install dependencies:

```bash
cd book-club-api
pnpm install
```

Create `.env` in `book-club-api/`:

```env
PORT=3000
NODE_ENV=development

# Google OAuth Credentials
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"

# Supabase PostgreSQL connection strings (IPv4 Pooler recommended)
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require&connect_timeout=30"
DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-eu-west-1.pooler.supabase.com:5432/postgres?sslmode=require&connect_timeout=30"

# Random 64-char secret for JWT cookies
JWT_SECRET="generate-a-secure-random-secret"
```

Push schema to your database:

```bash
pnpm exec prisma db push
```

Start the API development server:

```bash
pnpm run start:dev
```

*The API will start at `http://localhost:3000/api`.*

---

### 3. Configure the Frontend (`book-club-frontend`)

In a new terminal window:

```bash
cd book-club-frontend
pnpm install
```

Create `.env` in `book-club-frontend/`:

```env
VITE_API_URL=http://localhost:3000/api
VITE_GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
```

Start the frontend dev server:

```bash
pnpm run dev
```

*Open your browser and navigate to `http://localhost:5173`.*

---

## 🔑 Environment Variables

### Backend (`book-club-api/.env`)

| Variable | Description | Example |
| :--- | :--- | :--- |
| `PORT` | HTTP port the NestJS server listens on | `3000` |
| `GOOGLE_CLIENT_ID` | OAuth 2.0 Client ID from Google Cloud Console | `*.apps.googleusercontent.com` |
| `DATABASE_URL` | PostgreSQL pooler URL with `pgbouncer=true` & `sslmode=require` | `postgresql://...:6543/...` |
| `DIRECT_URL` | Direct connection string for Prisma migrations (port 5432) | `postgresql://...:5432/...` |
| `JWT_SECRET` | Secret key used for signing session JWT tokens | `73a910a55...` |

### Frontend (`book-club-frontend/.env`)

| Variable | Description | Default |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base endpoint URL for the backend API | `http://localhost:3000/api` |
| `VITE_GOOGLE_CLIENT_ID` | Google Client ID matching the backend | `*.apps.googleusercontent.com` |

---

## 📡 API Reference

All protected endpoints require the `booknest_session` cookie sent with `credentials: include`.

### Authentication
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/google` | Verify Google ID token & issue session cookie | Public |
| `GET` | `/api/auth/me` | Fetch currently authenticated user profile | Required |
| `POST` | `/api/auth/logout` | Clear session cookie and sign out | Public |

### Book Catalog
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/books/search?q=:query` | Search Open Library books with parsed metadata | Public |

### Personal Bookshelf
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/bookshelf` | Get all books saved on user's shelf | Required |
| `POST` | `/api/bookshelf` | Add a book to user's shelf | Required |
| `PATCH` | `/api/bookshelf/:id` | Update status, star rating, or private notes | Required |
| `DELETE` | `/api/bookshelf/:id` | Remove a book from user's shelf | Required |

### Reading Clubs & Salons
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/clubs/public` | Discover all public reading circles | Public |
| `GET` | `/api/clubs/mine` | List clubs where current user is a member/owner | Required |
| `POST` | `/api/clubs` | Create a new reading club | Required |
| `POST` | `/api/clubs/:id/join` | Join a public reading club | Required |
| `GET` | `/api/clubs/:id/books` | Retrieve shared reading list for a club | Required |
| `POST` | `/api/clubs/:id/books` | Add a book to a club's shelf | Required |
| `GET` | `/api/clubs/:id/discussions` | List discussion salon timeline | Required |
| `POST` | `/api/clubs/:id/discussions` | Post a reflection or question | Required |
| `DELETE` | `/api/clubs/:id/discussions/:discussionId` | Delete a discussion (author or club owner) | Required |

---

## 🧪 Testing & Code Quality

### Backend Tests
```bash
cd book-club-api

# Run unit tests (Vitest)
pnpm run test

# Run linter (Oxlint)
pnpm run lint

# Build production bundle
pnpm run build
```

### Frontend Build & Lint
```bash
cd book-club-frontend

# Typecheck and production bundle (Vite)
pnpm run build

# Code formatting
pnpm run format
```

---

## 🎨 Design Philosophy

BookNest embraces an **editorial, literary aesthetic**:
- **Palette**: Warm cream paper parchment (`#fcfaf7`), antique leather brown (`#8b4513`), deep espresso text (`#2b2420`), and muted forest accents.
- **Typography**: Paired with *Playfair Display* for classic book headings and *DM Sans* for clean, modern readability.
- **Atmosphere**: Avoids sterile SaaS templates in favor of tactile warmth, subtle shadows, and intentional whitespace.

---

## 📄 License

This project is licensed under the [UNLICENSED](LICENSE) license. All rights reserved.
