# 🎓 SkillPulse — Learning Management System

> A full-stack Learning Management System (LMS) with role-based dashboards, course authoring, lesson consumption, interactive quizzing, progress tracking, and a built-in blog CMS.

**🔗 Live Demo:** [https://skill-pulse-one.vercel.app/](https://skill-pulse-one.vercel.app/)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16 (App Router), React 19, Tailwind CSS v4, lucide-react |
| **Backend** | Strapi v5 (headless CMS + REST API) |
| **Database** | PostgreSQL 16 |
| **Media** | Cloudinary (video uploads) |
| **Deployment** | Vercel (client), Railway/Strapi Cloud (server) |

---

## Features

### Roles & Authentication
- **4 roles** — Student, Instructor, Content Manager, Admin — each with its own dashboard.
- JWT + refresh token auth stored in HTTP-only cookies.
- All role/ownership checks enforced **server-side**, not just in the UI.

| Role | Capabilities |
|------|--------------|
| **Student** | Browse catalog, enroll, watch lessons, complete lessons, take quizzes, view history, track progress |
| **Instructor** | Author courses, lessons & quizzes (own courses only), view student progress |
| **Content Manager** | Manage platform courses + author/publish blog posts |
| **Admin** | Platform stats, user management, role assignment, full content oversight |

### Course & Lesson Management
- Full CRUD for courses (title, description, thumbnail, category, draft/published status).
- Full CRUD for lessons (title, description, video URL, ordering).
- Video uploads to Cloudinary (students blocked).
- Course catalog with **search + category filters** and one-click enrollment.
- Role-based visibility: students see published only, instructors own only, admins all.

### Quiz Engine
- Author quizzes with questions (4 options + correct answer, strict validation).
- **Student take flow** — sanitized questions, correct answers never exposed.
- **Server-side grading** — `submit` endpoint scores automatically and creates an immutable attempt.
- Attempt history + detailed per-question review.

### Progress Tracking
- Mark lessons complete (idempotent, validates enrollment + lesson ownership).
- Real-time progress percentage (completed ÷ total × 100).
- Students see their own progress; instructors/admins see all students' progress.

### Blog CMS
- Public blog listing + detail pages (published posts only, strict draft protection).
- Admin/Content Manager authoring with draft/published status and cover images.

### Admin Platform Management
- Dashboard with aggregate stats (users by role, courses, enrollments).
- User management: pagination, search, role filtering, inline role editing.

### Public Marketing Site
- Landing page with WebGL 3D prism hero, feature cards, live course showcase, interactive roadmap + quiz previews, testimonials, CTA.

---

## Run Locally

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | `>=20.0.0` |
| npm | `>=6.0.0` |
| Docker Desktop | Latest |
| Git | Latest |
| Cloudinary account *(optional, for video uploads)* | Free tier |

### 1. Clone & install

```bash
git clone <your-repo-url>
cd SkillPulse

cd server && npm install
cd ../client && npm install
```

### 2. Start the database

```bash
docker compose up -d
```

Creates a PostgreSQL container (`skillpulse_postgres`):

| Setting | Value |
|---------|-------|
| DB name | `skillpulse_db` |
| Username | `admin_skillpulse` |
| Password | `11223344` |
| Port | `5432` |

Verify: `docker ps` → container shows `Up`. Stop it anytime with `docker compose down`.

### 3. Run the server (Strapi) — port 1337

```bash
cd server
cp .env.example .env   # pre-configured for local dev
npm run develop
```

- Ensure the `DATABASE_*` values in `.env` match the Docker setup above.
- First run auto-creates tables and grants API permissions (no manual setup).
- Admin panel: **http://localhost:1337/admin**

### 4. Run the client (Next.js) — port 3000

Create `client/.env.local`:

```env
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
STRAPI_URL=http://localhost:1337

# Only needed for video uploads
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

Then:

```bash
cd client
npm run dev
```

Open **http://localhost:3000** 🎉

### 5. Create accounts

- **Student / Instructor:** register at `/register` (only these two roles are publicly registrable).
- **Admin / Content Manager:** at the Strapi admin panel (`:1337/admin`), create the super admin on first run, then set a user's **User Role** field to `admin` or `content_manager` via Content Manager → User. Log back in at `/login`.

### Troubleshooting

| Problem | Fix |
|---------|-----|
| `ECONNREFUSED ... 5432` | Run `docker compose up -d` and confirm the container is up |
| Database schema errors | `docker compose down -v`, then `docker compose up -d` and restart Strapi |
| Port 3000/1337 in use | Change the port (`next dev -p 3001` / `PORT` in `server/.env`) and update the client `.env` |
| Video upload fails | Set `CLOUDINARY_*` in `client/.env.local` |
| CORS errors | Check `CORS_ORIGIN` includes your client origin (defaults include `http://localhost:3000`) |

---

## Project Structure

```
SkillPulse/
├── docker-compose.yaml      # PostgreSQL service
├── client/                  # Next.js 16 frontend (marketing + dashboards)
│   └── src/
│       ├── app/             # Pages + API proxy routes
│       ├── components/      # Layout, home, courses, lessons, quizzes, blog, dashboard
│       ├── context/         # AuthContext
│       └── lib/             # auth + role navigation config
└── server/                  # Strapi v5 backend
    └── src/
        ├── index.js         # Bootstrap: auto-grants API permissions
        ├── extensions/      # users-permissions (roles) + documentation
        └── api/             # course, lesson, quiz, question, quiz-attempt,
                             #   enrollment, progress, blog
```

---

## Scripts

### Client (`client/`)
```bash
npm run dev     # Start Next.js dev server
npm run build   # Build for production
npm run start   # Start production build
npm run lint    # Run ESLint
```

### Server (`server/`)
```bash
npm run develop   # Strapi dev server (hot reload)
npm run build     # Build Strapi
npm run start     # Start production build
npm run console   # Strapi interactive console
npm run upgrade   # Upgrade Strapi
```
