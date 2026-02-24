# SkillHunt IntelliTrack 🎯

**SkillHunt IntelliTrack** is an enterprise-grade **Talent Intelligence & Recruitment Orchestration** platform. It empowers recruitment teams to source, track, and manage developers globally using real-time GitHub activity signals, automated engagement readiness scoring, and robust campaign-driven hiring funnels.

> Built with Next.js 16, React 19, MongoDB, and NextAuth.js — following a feature-based modular architecture with repository pattern, SWR-powered data fetching, and a dark-first premium UI.

---

## Table of Contents

- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Architecture & Design Patterns](#-architecture--design-patterns)
- [Database Schema](#-database-schema)
- [API Reference](#-api-reference)
- [Authentication & Authorization](#-authentication--authorization)
- [Page Routes](#-page-routes)
- [Feature Modules](#-feature-modules)
- [Shared UI Components](#-shared-ui-components)
- [Utilities & Libraries](#-utilities--libraries)
- [Setup & Installation](#️-setup--installation)
- [Scripts](#-scripts)
- [Environment Variables](#-environment-variables)

---

## 🚀 Key Features

### 📊 Recruitment Intelligence Dashboard
- **Pipeline Funnel** — high-fidelity visualization of the recruitment funnel (`New → Contacted → Interviewing → Hired/Rejected`).
- **Network Stats** — real-time KPIs for total talent pool, active campaigns, placement rates, and weekly active developers.
- **Geo-Distribution & Tech Trends** — analyze talent concentration (top 8 locations) and tech stack density (top 5 languages) across the global developer pool.
- **Top Talent Spotlight** — automatically highlights the top 5 "Rising Stars" ranked by activity score and readiness level.
- **Campaign Performance** — per-campaign conversion rates and pipeline velocity with `$lookup` aggregation.
- **Activity Timeline** — 30-day rolling activity chart showing ingestion, status changes, and activity spikes.
- **Recent Activity Feed** — global real-time feed of all recruiter actions with developer context lookups.

### 👥 Global Developer Directory
- **Unified Registry** — shared talent pool across all recruiters. No data partitioning — everyone works from the same pool.
- **Idempotent GitHub Ingestion** — import developers from GitHub with automatic profile deduplication via SHA-256 `profileHash` (hash of `source:username`).
- **Readiness Scoring** — automated engagement levels (🟢 High, 🟡 Medium, 🔴 Low) based on a composite activity score (0–100) calculated from repos, stars, contributions, and recency.
- **Advanced Filtering** — search by name/username/bio, filter by tech stack, location, and recruitment status, with configurable sort and pagination.
- **Bulk Orchestration** — bulk assign/remove developers to/from campaigns with activity logging for each developer.
- **Ownership Lock** — when a recruiter moves a developer to `contacted`/`interviewing`/`hired`, they claim ownership. Other recruiters cannot change the status unless they are an admin. Moving to `new` or `rejected` releases the lock.
- **Developer Profiles** — detailed profile view with overview (tech stack, repos, stats), recruitment notes (cross-instance via `profileHash`), and activity history chart.

### 🎯 Campaign Orchestration
- **Campaign Registry** — create and manage professional-grade hiring pipelines with title, role, description, tech stack, salary range, location, and priority level.
- **Campaign Lifecycle** — campaigns follow a `draft → active → closed` status flow.
- **Placement Tracking** — monitor conversion rates and pipeline velocity per campaign via aggregated analytics.
- **Smart Assignment** — rapidly assign developers to specific campaigns with bulk operations and activity audit trails.
- **Optimistic UI** — SWR-powered CRUD with optimistic updates and automatic rollback on failure.

### 🤝 Team Coordination & Security
- **RBAC (Role Based Access Control)** — four distinct roles enforced at both API and UI levels:
  | Role | Permissions |
  |------|------------|
  | **Admin** | Full access. Manage users, approve onboarding, all CRUD operations. |
  | **Recruiter** | Import developers, manage campaigns, update statuses, add notes. |
  | **Analyst** | Read-only access to developers, campaigns, and analytics. |
  | **Viewer** | Base role. Must request and receive approval for elevated access. |
- **Onboarding Guard** — controlled access for new team members. New users register as `viewer` → request recruiter access → admin approves/rejects. The guard polls every 5 seconds for status updates.
- **Contact History Lock** — prevent double-contacting candidates with recruiter-level ownership locks and "Recently Contacted" warnings.
- **Authorship-Locked Notes** — shared recruitment notes on developers. Only the note author can edit or delete their own notes. Notes are shared cross-instance via `profileHash` lookup.

---

## 🛠 Tech Stack

| Category | Technology | Version |
|----------|-----------|---------|
| **Framework** | [Next.js](https://nextjs.org/) (App Router, Turbopack) | 16.1.6 |
| **UI Library** | [React](https://react.dev/) | 19.2.3 |
| **Database** | [MongoDB](https://www.mongodb.com/) (native driver, no Mongoose) | 7.1.0 |
| **Authentication** | [NextAuth.js](https://next-auth.js.org/) (JWT strategy, 30-day sessions) | 4.24.13 |
| **Data Fetching** | [SWR](https://swr.vercel.app/) (Stale-While-Revalidate) | 2.4.0 |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) + [DaisyUI](https://daisyui.com/) | 4.x |
| **Charts** | [Recharts](https://recharts.org/) | 3.7.0 |
| **Forms** | [React Hook Form](https://react-hook-form.com/) | 7.71.2 |
| **Alerts** | [SweetAlert2](https://sweetalert2.github.io/) | 11.26.20 |
| **Icons** | [React Icons](https://react-icons.github.io/react-icons/) (Heroicons Outline set) | 5.5.0 |
| **Password Hashing** | [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | 3.0.3 |
| **Date Utilities** | [date-fns](https://date-fns.org/) | 4.1.0 |
| **Fonts** | Inter (sans-serif), Geist Mono (monospace) | Google Fonts |

---

## 🏗 Project Structure

```text
skillhunt/
├── public/                          # Static assets
├── scripts/                         # Database setup, seeding, and utility scripts
│   ├── setup-db.mjs                 # Create MongoDB indexes (compound, text, unique)
│   ├── create_indexes.js            # Weighted text search indexes
│   ├── seed_campaigns.js            # Seed 18+ sample campaigns
│   └── test_aggregation.js          # Debug aggregation pipeline
│
├── src/
│   ├── proxy.js                     # Next.js middleware (auth redirects, route protection)
│   │
│   ├── app/                         # Next.js App Router
│   │   ├── layout.jsx               # Root layout (fonts, metadata, Providers, server session)
│   │   ├── globals.css              # Theme variables, Tailwind config, custom scrollbar
│   │   │
│   │   ├── (auth)/                  # Authentication routes (no sidebar/header)
│   │   │   ├── login/page.jsx       # Login (Credentials, Google, GitHub)
│   │   │   └── register/page.jsx    # User registration
│   │   │
│   │   ├── (dashboard)/             # Dashboard routes (with Sidebar + Header + OnboardingGuard)
│   │   │   ├── layout.jsx           # Dashboard layout shell
│   │   │   ├── page.jsx             # Dashboard overview (/)
│   │   │   ├── analytics/page.jsx   # Detailed analytics (/analytics)
│   │   │   ├── developers/          # Developer directory (/developers, /developers/[id])
│   │   │   ├── campaigns/           # Campaign management (/campaigns, /campaigns/[id])
│   │   │   └── users/page.jsx       # Admin user management (/users)
│   │   │
│   │   └── api/                     # API route handlers
│   │       ├── auth/                # NextAuth + register + seed + setup
│   │       ├── developers/          # Developer CRUD, ingest, notes, status, bulk-campaign
│   │       ├── campaigns/           # Campaign CRUD
│   │       ├── analytics/           # Aggregated dashboard analytics
│   │       ├── activity/recent/     # Global activity feed
│   │       ├── users/               # User management, role requests
│   │       ├── recruitment/         # (Placeholder — 501)
│   │       └── workers/sync/        # Background GitHub data sync worker
│   │
│   ├── features/                    # Feature-based domain modules
│   │   ├── analytics/               # Dashboard & analytics charts, hooks, services
│   │   ├── auth/                    # Login, Register, AuthContext, guards (RoleGate, OnboardingGuard)
│   │   ├── campaigns/               # Campaign list, detail, form modal, context, services
│   │   ├── dashboard/               # Recent activity widget, dashboard-specific analytics hook
│   │   ├── developers/              # Developer list, profile, filters, import modal, context, services
│   │   └── users/                   # User management table, hooks, services
│   │
│   ├── components/                  # Shared reusable UI components
│   │   ├── layout/                  # Header, Sidebar, Providers (context composition)
│   │   ├── modals/                  # Generic Modal component
│   │   └── ui/                      # Badge, Button, Card, Input, Select, KPICard, Skeletons, etc.
│   │
│   ├── lib/                         # Core application libraries
│   │   ├── db.js                    # MongoDB singleton connection (pooled, cached globally)
│   │   ├── auth.js                  # NextAuth configuration (providers, callbacks, JWT)
│   │   ├── api-guard.js             # API route auth verification & role checking
│   │   ├── cache.js                 # In-memory TTL cache (Map-based)
│   │   ├── rate-limiter.js          # Per-IP rate limiter with auto-cleanup
│   │   ├── github.js               # GitHub REST API client (profile + repos fetcher)
│   │   ├── models/
│   │   │   └── developer.model.js   # Developer schema, validation, scoring algorithms
│   │   └── repositories/            # Data access layer (Repository Pattern)
│   │       ├── developer.repository.js
│   │       ├── campaign.repository.js
│   │       ├── analytics.repository.js
│   │       ├── activity.repository.js
│   │       └── recruitment.repository.js
│   │
│   └── providers/                   # Global React Context providers
│       ├── ThemeContext.jsx          # Dark/light theme toggle (localStorage-persisted)
│       └── UIContext.jsx            # Mobile sidebar state management
│
├── eslint.config.mjs                # ESLint 9 flat config (next/core-web-vitals)
├── jsconfig.json                    # Path alias: @/* → ./src/*
├── next.config.mjs                  # Remote image patterns (GitHub, Google avatars)
├── postcss.config.mjs               # Tailwind CSS PostCSS plugin
└── package.json                     # Dependencies and scripts
```

---

## 🔐 Architecture & Design Patterns

### Feature-Based Modular Architecture
Code is organized by **business domain** rather than technical role. Each feature module (`auth`, `developers`, `campaigns`, `analytics`, `users`, `dashboard`) contains its own `components/`, `hooks/`, `services/`, and `context/` directories. This ensures high cohesion and low coupling between domains.

### Repository Pattern
All MongoDB interactions are abstracted into dedicated repository files under `src/lib/repositories/`. API route handlers never contain raw database queries — they delegate to repository functions, keeping route handlers thin and focused on request validation, auth, and response formatting.

### Service Layer (Client-Side)
Each feature has a `services/` directory containing functions that make `fetch()` calls to the API. Components never call `fetch` directly — they use hooks that call services.

### SWR (Stale-While-Revalidate)
All client-side data fetching uses SWR for aggressive caching with background revalidation. Key patterns:
- **Optimistic updates** — UI updates immediately, rolls back on API failure.
- **Auto-refresh** — analytics dashboard refreshes every 5 minutes, user status polls every 5 seconds during onboarding.
- **Global mutation** — cache invalidation via `mutate` after CRUD operations.

### Standardized API Responses
All API endpoints return a consistent shape via `apiSuccess` and `apiError` helpers:
```json
{ "success": true, "data": { ... } }
{ "success": false, "error": "...", "message": "..." }
```

### Middleware-Based Route Protection
`src/proxy.js` acts as Next.js middleware:
- Redirects unauthenticated users to `/login` for protected routes.
- Public paths: `/login`, `/register`, `/api/auth`, `/api/workers`.
- Admin-only: `/api/workers` endpoints.

### Dark-First Theming
The UI defaults to a dark theme (`data-theme="dark"` on `<html>`) with a toggle to light mode. Theme preference is persisted in `localStorage` and applied via CSS custom properties mapped to Tailwind utilities.

### Provider Composition
The `Providers` component composes all context providers in the correct dependency order:
```
SessionProvider → ThemeProvider → UIProvider → AuthProvider → Suspense → DeveloperProvider → CampaignProvider
```

---

## 🗄 Database Schema

### MongoDB Collections

#### `users`
| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | Auto-generated |
| `name` | String | Display name |
| `email` | String | Unique, lowercase, trimmed |
| `password` | String | bcrypt-hashed (null for OAuth users) |
| `role` | String | `admin` \| `recruiter` \| `analyst` \| `viewer` |
| `onboardingStatus` | String | `none` \| `pending` \| `approved` \| `rejected` |
| `provider` | String | `credentials` \| `google` \| `github` |
| `image` | String | Avatar URL (from OAuth provider) |
| `createdAt` | Date | Registration timestamp |
| `updatedAt` | Date | Last modification |

#### `developers`
| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | Auto-generated |
| `username` | String | GitHub username (unique) |
| `name` | String | Display name |
| `profileHash` | String | SHA-256 of `source:username` (unique, for deduplication) |
| `source` | String | Source platform (default: `github`) |
| `sourceUrl` | String | e.g., `https://github.com/username` |
| `avatarUrl` | String | GitHub avatar URL |
| `addedBy` | String | User ID who imported this developer |
| `addedByName` | String | Name of the user who imported |
| `bio` | String | GitHub bio |
| `location` | String | Geographic location |
| `company` | String | Company affiliation |
| `blog` | String | Blog/website URL |
| `techStack` | Array\<String\> | Top 10 programming languages |
| `languages` | Object | Language → usage frequency map |
| `topRepos` | Array\<Object\> | Top 5 repos by stars (name, description, stars, forks, language, url) |
| `totalRepos` | Number | Total repository count |
| `totalStars` | Number | Sum of stars across all repos |
| `totalForks` | Number | Sum of forks across all repos |
| `activityScore` | Number | 0–100 composite score |
| `contributionCount` | Number | Total contributions |
| `lastActivityAt` | Date | Last push/activity timestamp |
| `readinessLevel` | String | `High` \| `Medium` \| `Low` |
| `lastFetchedAt` | Date | Last GitHub data sync |
| `currentStatus` | String | `new` \| `contacted` \| `interviewing` \| `hired` \| `rejected` |
| `ownerId` | String | Recruiter who owns this candidate |
| `ownerName` | String | Name of the owning recruiter |
| `campaignId` | String | Assigned campaign ID |
| `lastContact` | Date | Last contact timestamp |
| `createdAt` | Date | First import timestamp |
| `updatedAt` | Date | Last modification |

**Activity Score Formula (0–100):**
| Component | Max Points | Calculation |
|-----------|-----------|-------------|
| Repositories | 25 | `min(totalRepos / 4, 25)` |
| Stars | 25 | `min(totalStars / 4, 25)` |
| Contributions | 30 | `min(contributionCount / 33, 30)` |
| Recency | 20 | `max(20 - daysSinceLastPush, 0)` |

**Readiness Level Logic:**
| Level | Criteria |
|-------|---------|
| 🟢 High | Last push ≤ 14 days AND activity score ≥ 40 |
| 🟡 Medium | Last push ≤ 45 days OR activity score ≥ 70 |
| 🔴 Low | Everything else |

#### `campaigns`
| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | Auto-generated |
| `title` | String | Campaign name |
| `role` | String | Target role (e.g., "Senior Frontend Architect") |
| `description` | String | Campaign details |
| `status` | String | `draft` \| `active` \| `closed` |
| `techStack` | Array\<String\> | Required technologies |
| `salary` | String | Salary range |
| `location` | String | Job location |
| `priority` | String | Priority level |
| `createdBy` | Object | `{ id, name }` of the creator |
| `createdAt` | Date | Creation timestamp |
| `updatedAt` | Date | Last modification |

#### `activityLogs`
| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | Auto-generated |
| `developerId` | ObjectId | Reference to developer |
| `type` | String | `new_repo` \| `skills_updated` \| `activity_spike` \| `status_change` \| `campaign_assignment` |
| `details` | Object | Type-specific payload |
| `createdAt` | Date | Log timestamp |

#### `recruitmentRecords`
| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | Auto-generated |
| `developerId` | ObjectId | Reference to developer |
| `author` | Object | `{ id, name, role }` of the note author |
| `text` | String | Note content |
| `createdAt` | Date | Creation timestamp |
| `updatedAt` | Date | Last edit |

### Database Indexes

Created via `scripts/setup-db.mjs`:

| Collection | Index | Type |
|------------|-------|------|
| `users` | `email` | Unique |
| `users` | `role` | Standard |
| `users` | `provider` | Standard |
| `users` | `createdAt` | Standard |
| `developers` | `profileHash` | Unique |
| `developers` | `username` | Unique |
| `developers` | `name, username, techStack, location, bio` | Text (weighted: name=10, username=8, techStack=5, location=3, bio=1) |
| `developers` | `techStack` | Standard |
| `developers` | `currentStatus` | Standard |
| `developers` | `location` | Standard |
| `developers` | `activityScore` | Standard |
| `developers` | `lastActivityAt` | Standard |
| `developers` | `createdAt` | Standard |
| `campaigns` | `createdBy.id` | Standard |
| `campaigns` | `status` | Standard |
| `campaigns` | `createdAt` | Standard |
| `campaigns` | `title, role, description` | Text (weighted: title=10, role=8, description=2) |
| `activityLogs` | `developerId, createdAt` | Compound |
| `activityLogs` | `type` | Standard |
| `activityLogs` | `createdAt` | Standard |
| `recruitmentRecords` | `developerId, campaignId` | Compound |
| `recruitmentRecords` | `recruiterId` | Standard |
| `recruitmentRecords` | `status` | Standard |
| `recruitmentRecords` | `updatedAt` | Standard |

---

## 📡 API Reference

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET/POST | `/api/auth/[...nextauth]` | No | NextAuth.js handler (Google, GitHub, Credentials) |
| POST | `/api/auth/register` | No | Register a new user. Rate limited: 5 requests/minute. Creates user with `role: viewer`, `onboardingStatus: none`. |
| POST | `/api/auth/seed` | No | Create the initial admin user. Only works when no admin account exists in the database. |
| POST | `/api/auth/setup` | No | Initialize database (create indexes, test connection). |

### Developers

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/api/developers` | Yes | admin, recruiter, analyst | List developers with search, filter, sort, pagination. Query params: `search`, `techStack`, `location`, `status`, `sortBy`, `sortOrder`, `page`, `limit`. |
| GET | `/api/developers/[id]` | Yes | admin, recruiter, analyst | Get a single developer by ID. |
| DELETE | `/api/developers/[id]` | Yes | admin, recruiter | Delete a developer and all related `activityLogs` and `recruitmentRecords`. |
| PATCH | `/api/developers/[id]/status` | Yes | admin, recruiter | Update recruitment status. Enforces ownership lock. Logs `status_change` activity. Updates `lastContact`. |
| GET | `/api/developers/[id]/activity` | Yes | admin, recruiter, analyst | Get activity logs for a developer. Optional `limit` param. |
| GET | `/api/developers/[id]/notes` | Yes | admin, recruiter, analyst | Get recruitment notes (cross-instance via `profileHash`). |
| POST | `/api/developers/[id]/notes` | Yes | admin, recruiter | Add a recruitment note with author info. |
| PATCH | `/api/developers/[id]/notes/[noteId]` | Yes | admin, recruiter | Edit a note (own notes only). |
| DELETE | `/api/developers/[id]/notes/[noteId]` | Yes | admin, recruiter | Delete a note (own notes only). |
| POST | `/api/developers/ingest` | Yes | admin, recruiter | Import a developer from GitHub. Rate limited: 20 requests/minute. Fetches profile + repos, calculates activity score and readiness, upserts via `profileHash`. |
| POST | `/api/developers/bulk-campaign` | Yes | admin, recruiter | Bulk assign/remove developers to/from a campaign. Logs activity for each developer. |

### Campaigns

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/api/campaigns` | Yes | admin, recruiter, analyst | List campaigns. Query params: `own` (boolean), `status`, `search`. |
| POST | `/api/campaigns` | Yes | admin, recruiter | Create a campaign. Required fields: `title`, `role`. |
| GET | `/api/campaigns/[id]` | Yes | admin, recruiter, analyst | Get a single campaign by ID. |
| PATCH | `/api/campaigns/[id]` | Yes | admin, recruiter | Update a campaign. |
| DELETE | `/api/campaigns/[id]` | Yes | admin, recruiter | Delete a campaign. |

### Analytics & Activity

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/api/analytics` | Yes | admin, recruiter, analyst | Aggregated dashboard data: KPIs, status distribution, tech stack breakdown, geo distribution, top talent, campaign performance, activity timeline, throughput metrics. |
| GET | `/api/activity/recent` | Yes | admin, recruiter, analyst | Global recent activity feed with `$lookup` to developers for name/avatar context. |

### Users

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/api/users` | Yes | admin | List all users with search, role filter, pagination. Excludes password fields. |
| PATCH | `/api/users` | Yes | admin | Update user role or onboarding status. Cannot demote self. Valid roles: `admin`, `recruiter`, `viewer`. |
| DELETE | `/api/users` | Yes | admin | Permanently delete a user. Cannot delete self. |
| GET | `/api/users/me/status` | Yes | any | Get current user's `onboardingStatus` and `role`. Force-dynamic (no caching). Used for onboarding polling. |
| POST | `/api/users/request-recruiter` | Yes | any | Request recruiter access. Sets `onboardingStatus: pending`. Rejects if already recruiter/admin or already pending. |

### Workers

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/workers/sync` | Cron secret (optional) | Background sync worker. Re-fetches GitHub data for the 5 stalest developers. Detects new repos and activity spikes, logs activities accordingly. |

---

## 🔑 Authentication & Authorization

### Authentication Providers
1. **Credentials** — email/password with bcrypt hashing.
2. **Google OAuth** — via `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`.
3. **GitHub OAuth** — via `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`.

### Session Strategy
- **JWT-based** sessions with 30-day maximum age.
- Token contains: `id`, `email`, `name`, `role`, `onboardingStatus`.
- Token is refreshed from the database on `session` trigger or when role is missing.

### Role Hierarchy & Permissions

```
Admin ──────── Full platform access, user management, approve onboarding
Recruiter ──── Developer CRUD, campaign management, notes, status changes
Analyst ────── Read-only access to developers, campaigns, analytics
Viewer ─────── Base role. Dashboard blocked until onboarding approved
```

### Onboarding Flow

```
Register (viewer, status=none)
  │
  ▼
Request Recruiter Access (status=pending)
  │
  ▼
Admin Reviews ──→ Approve (role=recruiter, status=approved)
              └─→ Reject (status=rejected)
```

The `OnboardingGuard` component wraps all dashboard pages and polls `/api/users/me/status` every 5 seconds to detect approval in real-time.

### Recruitment Status Flow & Ownership

```
new ──→ contacted ──→ interviewing ──→ hired
                                   └──→ rejected
```

When a recruiter moves a developer to `contacted`, `interviewing`, or `hired`, they **claim ownership** (`ownerId`, `ownerName`). Other recruiters cannot change the status unless they are an admin. Moving to `new` or `rejected` releases the ownership lock.

---

## 🗺 Page Routes

| Route | Component | Access | Description |
|-------|-----------|--------|-------------|
| `/login` | `LoginPage` | Public | Sign in with credentials, Google, or GitHub. Redirects authenticated users away. |
| `/register` | `RegisterPage` | Public | User registration form. Redirects authenticated users away. |
| `/` | `DashboardOverview` | Authenticated | Main dashboard with KPIs, funnel chart, geo distribution, tech trends, top talent, recent activity. |
| `/analytics` | `AnalyticsDashboard` | Authenticated | Detailed recruitment analytics with multiple visualization widgets. |
| `/developers` | `DeveloperList` | Authenticated | Searchable, filterable developer directory with table/card views. |
| `/developers/[id]` | `DeveloperProfile` | Authenticated | Developer detail view with tabs: Overview, Notes, Activity. |
| `/campaigns` | `CampaignList` | Authenticated | List and manage recruitment campaigns with create/edit modals. |
| `/campaigns/[id]` | `CampaignDetail` | Authenticated | Campaign detail view with assigned developers. |
| `/users` | `UserManagement` | Admin only | User management: approve/reject onboarding, change roles, delete users. |

All dashboard routes are wrapped in `DashboardLayout` (Sidebar + Header) and `OnboardingGuard`.

---

## 📦 Feature Modules

### `features/analytics/`
Analytics visualizations and data hooks for the dashboard.

| Type | Items |
|------|-------|
| **Components** | `DashboardOverview`, `AnalyticsDashboard`, `StatCard`, `TopTechChart`, `FunnelChart`, `ActivityTimelineChart`, `TalentGeoChart`, `TopTalentSpotlight`, `CampaignPerformanceCard` |
| **Hooks** | `useAnalytics` — fetches `/api/analytics` via SWR |
| **Services** | `analytics.service.js` — `fetchAnalyticsData()` |

### `features/auth/`
Authentication pages, context, and guard components.

| Type | Items |
|------|-------|
| **Components** | `LoginPage`, `RegisterPage`, `AuthRedirect`, `RoleGate`, `OnboardingGuard` |
| **Context** | `AuthContext` — wraps NextAuth `useSession`, exposes `user`, `loading`, `isAuthenticated`, `isAdmin`, `isRecruiter`, `isAnalyst`, `onboardingStatus` |
| **Hooks** | `useAuth`, `useAuthHook` |

### `features/campaigns/`
Campaign CRUD with context-driven state management.

| Type | Items |
|------|-------|
| **Components** | `CampaignList`, `CampaignDetail`, `CampaignFormModal` |
| **Context** | `CampaignContext` — SWR-powered CRUD with optimistic updates, SweetAlert2 confirmations. Exposes `addCampaign`, `editCampaign`, `removeCampaign`, search/status filters. |
| **Hooks** | `useCampaigns` |
| **Services** | `campaign.service.js` — `fetchCampaigns()`, `fetchCampaignById()`, `createCampaign()` |

### `features/developers/`
Developer directory, profile views, GitHub import, and bulk operations.

| Type | Items |
|------|-------|
| **Components** | `DeveloperList`, `DeveloperProfile`, `DeveloperTableRow`, `DeveloperCardMobile`, `DeveloperFilters`, `ImportDeveloperModal`, `ProfileHeader`, `ProfileOverviewTab`, `ProfileNotesTab`, `ProfileActivityChart`, `ActivityFeed` |
| **Context** | `DeveloperContext` — wraps `useDevelopers` hook |
| **Hooks** | `useDevelopers` — search/filter/sort/pagination, SWR fetching, `changeStatus`, `importDeveloper`, `removeDeveloper`, `bulkAssignCampaign` |
| **Services** | `developer.service.js` — full CRUD + notes + bulk operations; `activity.service.js` — `getDeveloperActivity()`, `getRecentGlobalActivity()` |

### `features/dashboard/`
Dashboard-specific widgets and analytics.

| Type | Items |
|------|-------|
| **Components** | `RecentActivityWidget` — live feed of recent recruiter actions |
| **Hooks** | `useAnalytics` — SWR with 5-minute auto-refresh, toast error handling |
| **Services** | `analytics.service.js` — `fetchAnalyticsData()` |

### `features/users/`
Admin user management interface.

| Type | Items |
|------|-------|
| **Components** | `UserManagement`, `UserTableRow`, `UserCardMobile` |
| **Hooks** | `useUsers` — SWR with 5-second polling, `approveUser`, `rejectUser`, `blockUser`, `unblockUser`, `removeUser`, `changeRole` |
| **Services** | `users.service.js` — `fetchUsers()`, `updateUser()`, `requestRecruiterAccess()`, `updateUserRole()`, `deleteUser()` |

---

## 🧩 Shared UI Components

### Layout Components (`src/components/layout/`)

| Component | Description |
|-----------|-------------|
| `Header` | Top bar with mobile menu toggle, brand logo, dark/light theme toggle, user avatar with role badge. |
| `Sidebar` | Navigation sidebar with links: Dashboard, Developers, Campaigns, Users (admin-only). Mobile-responsive with backdrop overlay. Includes sign-out button. |
| `Providers` | Composes all context providers in dependency order: `SessionProvider → ThemeProvider → UIProvider → AuthProvider → Suspense → DeveloperProvider → CampaignProvider`. |

### UI Primitives (`src/components/ui/`)

| Component | Key Props | Description |
|-----------|-----------|-------------|
| `Badge` | `variant`, `size`, `dot` | Semantic status badge. Variants: `new`, `contacted`, `interviewing`, `hired`, `rejected`, `info`, `success`, `warning`, `danger`, `default`. Sizes: `sm`, `md`, `lg`. |
| `Button` | `variant`, `size`, `loading`, `icon`, `disabled` | Styled button. Variants: `primary`, `secondary`, `danger`, `ghost`, `outline`. Includes loading spinner state. |
| `Card` | `title`, `subtitle`, `action`, `padding` | Container card with optional header section and action slot. |
| `Input` | `label`, `error`, `icon` | Form input with label, leading icon support, and error message display. |
| `Select` | `label`, `error`, `options`, `placeholder` | Form select dropdown with validation error support. |
| `KPICard` | `title`, `value`, `change`, `changeType`, `icon` | Key Performance Indicator display. Change types: `positive`, `negative`, `neutral`. |
| `Modal` | `isOpen`, `onClose`, `title`, `size` | Generic modal overlay. Sizes: `sm`, `md`, `lg`, `xl`. Includes backdrop and close button. |
| `DashboardSkeleton` | — | Loading skeleton for the dashboard page (4 KPI cards, 2 charts, table). |
| `ProfileSkeleton` | — | Loading skeleton for developer profile pages. |
| `TableSkeleton` | `rows`, `columns` | Configurable loading skeleton for data tables. |
| `ErrorDisplay` | `error`, `reset` | Error boundary fallback UI with retry button. |
| `NotFoundDisplay` | `message` | 404 display with navigation link back to dashboard. |

---

## ⚙️ Utilities & Libraries

### `src/lib/db.js` — Database Connection
Singleton MongoDB connection using the native `MongoClient` driver. Connection is cached globally via `global._mongoClientPromise` to survive hot reloads. Connection pool: min 2, max 10 connections. Database name defaults to `skillhunt` (configurable via `DB_NAME` env).

### `src/lib/auth.js` — NextAuth Configuration
Full NextAuth setup with three providers (Google, GitHub, Credentials), JWT session strategy (30-day max age), and custom callbacks:
- **`signIn`** — auto-creates user for OAuth logins, updates avatar/name on repeat sign-ins.
- **`jwt`** — attaches `role`, `onboardingStatus`, `id` to the JWT token. Refreshes from DB when needed.
- **`session`** — exposes user metadata on the client-side session object.

### `src/lib/api-guard.js` — API Route Protection
- `verifyAuth(request, requiredRole)` — verifies JWT token, checks role against allowed roles (single string or array). Returns `{ user }` or `{ error: NextResponse }`.
- `apiSuccess(data, status)` — standardized success response.
- `apiError(message, status)` — standardized error response with semantic error types.

### `src/lib/cache.js` — In-Memory Cache
Map-based TTL cache with predefined keys and durations:
| Cache Key | TTL |
|-----------|-----|
| `DEVELOPER_LIST` | 5 minutes |
| `DEVELOPER_PROFILE` | 10 minutes |
| `ANALYTICS` | 2 minutes |
| `CAMPAIGNS` | 5 minutes |

Functions: `getFromCache(key)`, `setInCache(key, data, ttl)`, `invalidateCache(pattern)`.

### `src/lib/rate-limiter.js` — Rate Limiting
In-memory per-IP rate limiter. `rateLimit(request, limit, windowMs)` returns a `429 Too Many Requests` response or `null` (allowed). Auto-cleans expired entries every 5 minutes.

### `src/lib/github.js` — GitHub API Client
GitHub REST API integration:
- `fetchGithub(endpoint)` — authenticated requests with optional `GITHUB_TOKEN`, 1-hour revalidation.
- `getGithubUserProfile(username)` — fetches user profile + up to 100 repos (forks excluded). Calculates `totalStars`, `totalForks`, `languages`, `topRepos` (top 5 by stars), `daysSinceLastPush`, `contributionCount`.

### `src/proxy.js` — Next.js Middleware
Route-level middleware that:
- Redirects unauthenticated users to `/login`.
- Allows public paths: `/login`, `/register`, `/api/auth`, `/api/workers`.
- Restricts `/api/workers` to admin-only access.

### `src/providers/ThemeContext.jsx` — Theme Provider
Dark/light theme toggle with `localStorage` persistence (key: `skillhunt-theme`). Applies the theme via the `data-theme` attribute on `<html>`. Default: dark.

### `src/providers/UIContext.jsx` — UI State Provider
Manages mobile sidebar state: `isSidebarOpen`, `toggleSidebar`, `closeSidebar`, `openSidebar`. Auto-closes sidebar on route changes.

---

## ⚙️ Setup & Installation

### Prerequisites
- **Node.js** 18+ 
- **MongoDB** instance (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- **GitHub Personal Access Token** (optional — increases GitHub API rate limit from 60 to 5000 requests/hour)

### 1. Clone the Repository
```bash
git clone https://github.com/jihanurrahman33/SkillHunt-Developer-Intelligence-Platform.git
cd SkillHunt-Developer-Intelligence-Platform
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the project root:
```env
# MongoDB
MONGODB_URI=your_mongodb_connection_string
DB_NAME=skillhunt

# NextAuth
NEXTAUTH_SECRET=your_random_secret_string
NEXTAUTH_URL=http://localhost:3000

# OAuth Providers (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret

# GitHub API (optional — for higher rate limits)
GITHUB_TOKEN=your_github_personal_access_token
```

### 4. Initialize Database & Create Indexes
```bash
node scripts/setup-db.mjs
```
This creates optimized compound, text (weighted), and unique indexes across all collections.

### 5. Seed Initial Admin User
```bash
# Via the API after starting the server:
curl -X POST http://localhost:3000/api/auth/seed
```
This creates the first admin account. Only works when no admin exists in the database.

### 6. Seed Sample Campaigns (Optional)
```bash
node scripts/seed_campaigns.js
```
Seeds 18+ sample campaigns with realistic hiring data.

### 7. Run Development Server
```bash
npm run dev
```
The app starts at [http://localhost:3000](http://localhost:3000) with Turbopack for fast refresh.

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (Turbopack) |
| `npm run build` | Create production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## 📜 Scripts

| Script | File | Description |
|--------|------|-------------|
| **Database Setup** | `scripts/setup-db.mjs` | Creates all MongoDB indexes (unique, compound, text with weights). Run once before first use. |
| **Create Indexes** | `scripts/create_indexes.js` | Alternative index creation script with weighted text search indexes and filter indexes. |
| **Seed Campaigns** | `scripts/seed_campaigns.js` | Seeds 18+ sample recruitment campaigns with realistic data (roles, tech stacks, salary ranges, priorities). |
| **Test Aggregation** | `scripts/test_aggregation.js` | Debug utility to test the campaign ↔ developer `$lookup` aggregation pipeline. |

---

## 🌐 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `DB_NAME` | No | Database name (default: `skillhunt`) |
| `NEXTAUTH_SECRET` | Yes | Secret key for JWT signing |
| `NEXTAUTH_URL` | Yes | Base URL of the application |
| `GOOGLE_CLIENT_ID` | No | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth client secret |
| `GITHUB_CLIENT_ID` | No | GitHub OAuth app client ID |
| `GITHUB_CLIENT_SECRET` | No | GitHub OAuth app client secret |
| `GITHUB_TOKEN` | No | GitHub Personal Access Token (for higher API rate limits) |

---

Built with 🎯 by the SkillHunt Engineering Team.
