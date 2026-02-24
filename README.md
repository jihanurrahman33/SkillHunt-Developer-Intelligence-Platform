# SkillHunt IntelliTrack 🎯

SkillHunt IntelliTrack is an enterprise-grade Talent Intelligence & Recruitment Orchestration platform. It empowers recruitment teams to source, track, and manage developers globally with real-time signals, engagement readiness scores, and robust campaign funnels.

## 🚀 Key Features

### 📊 Recruitment Intelligence Dashboard
- **Pipeline Funnel**: High-fidelity visualization of the recruitment funnel (New ➡️ Hired).
- **Network Stats**: Real-time KPIs for total talent pool, active campaigns, and placement rates.
- **Geo-Distribution & Tech Trends**: Analyze talent concentration and tech stack density across the globe.
- **Top Talent Spotlight**: Automatically highlight "Rising Stars" based on activity and readiness.

### 👥 Global Developer Directory
- **Unified Registry**: Shared talent pool with system-wide deduplication (Profile Hash).
- **Readiness Scoring**: Automated AI-driven engagement levels (🟢 High, 🟡 Medium, 🔴 Low) based on GitHub activity signals.
- **Advanced Filtering**: Search by tech stack, location, readiness, and recruitment status.
- **Bulk Orchestration**: Perform bulk status updates, campaign assignments, and CSV exports.

### 🎯 Campaign Orchestration
- **Global Campaign Registry**: Collaborate on professional-grade hiring pipelines.
- **Placement Tracking**: Monitor conversion rates and pipeline velocity per campaign.
- **Smart Assignment**: Rapidly assign developers to specific hiring efforts.

### 🤝 Team Coordination & Security
- **RBAC (Role Based Access Control)**: Secure access for Admins, Recruiters, Analysts, and Viewers.
- **Onboarding Guard**: Controlled access for new team members with Admin approval flow.
- **Contact History Lock**: Prevent double-contacting candidates with recruiter-level locks and "Recently Contacted" warnings.
- **Real-time Notes**: Shared, authorship-locked developer notes with 5-second background sync.

## 🛠 Tech Stack

- **Framework**: [Next.js 16 (Turbopack)](https://nextjs.org/)
- **Database**: [MongoDB](https://www.mongodb.com/)
- **State Management & Data Fetching**: [SWR (Stale-While-Revalidate)](https://swr.vercel.app/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) & [DaisyUI](https://daisyui.com/)
- **Visualizations**: [Recharts](https://recharts.org/)
- **Interaction**: [SweetAlert2](https://sweetalert2.github.io/)

## 🏗 Project Structure

```text
skillhunt/
├── src/
│   ├── app/             # Next.js App Router (Routes & Layouts)
│   ├── components/      # Shared UI primitives (Buttons, Cards, Badges)
│   ├── features/        # Feature-based modules (Analytics, Auth, Developers, Campaigns, Users)
│   │   ├── [feature]/
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   └── hooks/
│   ├── lib/             # Core utilities, DB connection, and Repositories
│   ├── providers/       # Global context providers (Auth, UI, Development)
│   └── proxy.js         # API request boundary and standardizer
├── scripts/             # Administrative utilities (DB setup, indexing, seeding)
└── docs/                # SRS, Architecture, and Technical documentation
```

## ⚙️ Setup & Installation

### 1. Environment Variables
Create a `.env.local` file in the root directory:
```env
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
GITHUB_TOKEN=your_github_personal_access_token (optional, for higher rate limits)
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Initialize Database & Indexes
Run the setup script to create optimized MongoDB indexes (Compound & Text indexes):
```bash
node scripts/setup-db.mjs
```

### 4. Run Development Server
```bash
npm run dev
```

## 🔐 Architecture Principles
- **Standardized Repository Pattern**: All database interactions are decoupled from business logic via Repository classes in `src/lib/repositories`.
- **Request Boundary**: The `src/proxy.js` layer ensures all API responses follow a strict `{ success, data, error }` schema.
- **Stale-While-Revalidate (SWR)**: Aggressive caching and background polling provide a "real-time" feel without overloading the server.
- **Dark-First UX**: Premium aesthetic designed for modern talent teams.

---
Built with 🎯 by the SkillHunt Engineering Team.
