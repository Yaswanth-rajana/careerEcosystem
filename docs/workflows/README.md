# PATHWAY.ECO — Portal Backend Workflow Diagrams & Architecture Index

This directory contains four comprehensive, high-resolution (3840 × 2160 4K) visual workflow diagrams for the PATHWAY.ECO ecosystem. Each diagram is directly grounded in the repository's active codebase, tracing user actions through Next.js App Router handlers, authentication/authorization middleware, backend domain services, Prisma MongoDB models, external integrations, and UI state responses.

---

## 1. Generated Workflow Image Index

| Portal | Target Image Deliverable | Vector Source | Primary Theme | Port | Verified Scope |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Student / Candidate** | [`student-backend-workflow.png`](./student-backend-workflow.png) | [`student-backend-workflow.svg`](./student-backend-workflow.svg) | Indigo (`#4F46E5`) | `:3000` | 25 Pages, 22 API Endpoints, 11 Prisma Models |
| **Mentor** | [`mentor-backend-workflow.png`](./mentor-backend-workflow.png) | [`mentor-backend-workflow.svg`](./mentor-backend-workflow.svg) | Teal (`#0D9488`) | `:3001` | 15 Pages, 18 API Endpoints, 8 Prisma Models |
| **Recruiter** | [`recruiter-backend-workflow.png`](./recruiter-backend-workflow.png) | [`recruiter-backend-workflow.svg`](./recruiter-backend-workflow.svg) | Sky Blue / Rose (`#0284C7`) | `:3002` | 17 Pages, 26 API Endpoints, 9 Prisma Models |
| **Admin** | [`admin-backend-workflow.png`](./admin-backend-workflow.png) | [`admin-backend-workflow.svg`](./admin-backend-workflow.svg) | Slate & Amber (`#D97706`) | `:3003` | 17 Pages, 24 API Endpoints, 10 Prisma Models |

---

## 2. Diagram Visual Architecture & Layout Standard

Each diagram is rendered at native **3840 × 2160 UHD (4K)** resolution with crisp typography and distinct visual zones:

1. **Top Header**: System branding, portal title, core workflow description, and verified badges (`CODEBASE VERIFIED`, portal theme, port allocation).
2. **Section 1: Execution Pipeline (Top Half)**:
   - 8 sequential process cards (`x.1` through `x.8`) connected by directional arrows.
   - Actor roles and origin port badges.
   - Specific API endpoints, HTTP verbs, payload schemas, and service method invocations.
   - Primary outcome blocks highlighting exact database state mutations.
3. **Section 2: Technical Deep Dive (Bottom Half — 3 Structured Columns)**:
   - **Column 1 — API Route Handlers & Validation Guards**: Real Next.js route handlers (`app/api/...`), Zod validation schemas, session cookie extraction, and safety/idempotency rules.
   - **Column 2 — Data Persistence & Prisma Schema Group**: 3D database cylinder icons, exact Prisma model field definitions, relations, unique constraints, and state machine transition lifecycle diagrams.
   - **Column 3 — Security, Multi-Tenant Isolation & Gaps**: Session cookie configuration, role assertion checks, external services (`ZeptoMail`, `Gotenberg`), and dedicated **Verified Codebase Gaps & Mocks** warning cards.

---

## 3. Portal Coverage Breakdown

### Diagram 1: Student & Candidate Portal (`frontend/`)
- **File**: `docs/workflows/student-backend-workflow.png`
- **Execution Phases**:
  1. `1.1 Auth & Session Guard`: Registration & login via `POST /api/auth/login`, bcrypt 12-round verification, `career_session` cookie issuance.
  2. `1.2 Profile & Resume Upload`: Multi-part CV upload via `POST /api/candidate/resumes`, Gotenberg PDF conversion, disk buffer persistence via `StorageFactory`.
  3. `1.3 Dashboard Aggregation`: Single composite data fetch via `GET /api/candidate/dashboard` returning application counts, booked sessions, and completeness score.
  4. `1.4 Job Faceted Search`: Job discovery via `GET /api/jobs` enforcing `status: 'PUBLISHED'` and non-expired 30-day window (`publishedAt > now - 30d`).
  5. `1.5 Job Application Snapshot`: Application submission via `POST /api/jobs/[id]/apply`, creating an immutable resume snapshot (`resumeId`, `resumeFilename`, `resumeFileSize`, `resumeFileType`) and enforcing `@@unique([candidateId, jobId])`.
  6. `1.6 Mentor Discovery`: Browsing vetted mentors via `GET /api/mentors` with `where: { status: 'APPROVED' }` and service offerings catalog.
  7. `1.7 Availability Engine`: Bookable slot calculations via `GET /api/mentors/[id]/availability` reconciling weekly recurring slots, blackout dates, and booked sessions.
  8. `1.8 Booking State Machine`: Atomic reservation via `POST /api/bookings` (`CONFIRMED`), reschedule requests (`RESCHEDULE_REQUESTED`), and ZeptoMail calendar invite dispatch.

### Diagram 2: Mentor Portal (`mentor/`)
- **File**: `docs/workflows/mentor-backend-workflow.png`
- **Execution Phases**:
  1. `2.1 Public Vetting Gate`: Public application via `POST /api/mentor-applications` (`status: SUBMITTED`), queuing for admin vetting.
  2. `2.2 Admin Approval Dossier`: Admin evaluates credentials, transitions status to `APPROVED`, and generates a 32-byte cryptographic setup token.
  3. `2.3 Password Setup & Hash`: One-time activation via `POST /api/auth/setup-password`, verifying token against SHA-256 hash, bcrypt hashing password, and elevating role to `MENTOR`.
  4. `2.4 Auth & Approval Guard`: Mentor login via `POST /api/auth/login`, issuing `career_mentor_session` cookie with strict middleware approval check.
  5. `2.5 Mentorship Services CRUD`: Service catalog authoring via `GET/POST/PATCH/DELETE /api/mentor/services` (duration, priceCents, title).
  6. `2.6 Availability Rules & Blackout`: Atomic weekly recurring slot configuration via `PUT /api/mentor/availability` with date-specific blackout overrides (`POST /api/mentor/availability/blackout`).
  7. `2.7 Reschedule Approvals`: Reschedule management via `PATCH /api/mentor/bookings/[id]/accept-reschedule` / `decline-reschedule` updating start time.
  8. `2.8 Live Session & Completion`: Delivery via `GET /api/mentor/sessions/[id]`, session notes persistence, completion toggle (`COMPLETED`), and candidate review trigger.

### Diagram 3: Recruiter Portal (`recruiter/`)
- **File**: `docs/workflows/recruiter-backend-workflow.png`
- **Execution Phases**:
  1. `3.1 Auth & Tenant Binding`: Multi-tenant login via `POST /api/recruiter/auth/login`, resolving company membership and locking queries to `auth.company.id`.
  2. `3.2 Employer Brand Profile`: Profile updates via `PATCH /api/recruiter/company` with verification badge checks (`company.isVerified`).
  3. `3.3 Job Drafting & Publish`: Job authoring via `POST /api/recruiter/jobs`, setting `publishedAt = now` and `expiresAt = +30 days`.
  4. `3.4 30-Day Cron Expiration`: Automated cleanup via `GET /api/jobs/cron/expire`, atomically transitioning expired jobs to `EXPIRED`.
  5. `3.5 Pipeline Kanban`: Stage transitions via `PATCH /api/recruiter/applications/[id]/status` (`APPLIED` → `UNDER_REVIEW` → `SHORTLISTED` → `INTERVIEW` → `OFFER` / `REJECTED`) with audit event emission.
  6. `3.6 Secure Resume Stream`: Inline PDF streaming via `GET /api/recruiter/applications/[id]/resume` verifying `application.job.companyId === auth.company.id` to prevent cross-tenant data leaks.
  7. `3.7 Interview Rounds & Notes`: Interview scheduling via `POST /api/recruiter/interviews` and evaluator scorecard ratings submission.
  8. `3.8 Team RBAC & Invites`: Team management via `POST /api/recruiter/team` enforcing 28-permission matrix and dispatching 7-day cryptographic invite links.

### Diagram 4: Admin Portal (`admin/`)
- **File**: `docs/workflows/admin-backend-workflow.png`
- **Execution Phases**:
  1. `4.1 Zero-Trust Admin Auth`: Admin login via `POST /api/admin/auth/login`, issuing isolated `career_admin_session` cookie and strictly checking `user.role === 'ADMIN'`.
  2. `4.2 Platform KPI Engine`: Real-time system health metrics via `GET /api/admin/metrics` aggregating users, jobs, applications, and bookings.
  3. `4.3 User Identity Governance`: User administration via `GET/PATCH /api/admin/users`, toggling account suspension and role elevation.
  4. `4.4 Mentor Dossier Vetting`: Application evaluation via `POST /api/admin/mentors/applications/[id]/status`, approving candidates and creating `MentorProfile`.
  5. `4.5 24h Cryptographic Token`: Secure token generator hashing with SHA-256 (`setupTokenExpiresAt = now + 24h`) and emailing activation link via ZeptoMail.
  6. `4.6 Employer Verification`: Company auditing via `PATCH /api/admin/companies/[id]` toggling `isVerified` badge and fraud protections.
  7. `4.7 Job Compliance & Cron`: Moderation via `PATCH /api/admin/jobs/[id]` force-closing violating postings and monitoring 30-day cron health.
  8. `4.8 LMS Curriculum & Audit`: Course builder via `POST /api/admin/courses` and tamper-evident audit logging via `GET /api/admin/audit-logs`.

---

## 4. Complete Codebase Gap & Mock Inventory

Each diagram explicitly highlights verified implementation gaps, simulated endpoints, and missing backend models:

| Gap Code | Affected Portal & Path | Severity | Verified Codebase Status | Recommended Remediation |
| :--- | :--- | :--- | :--- | :--- |
| **G-01** | `frontend/app/reset-password/page.tsx` | **HIGH** | Page exists with full form UI, but has no backend `POST /api/auth/reset-password` endpoint. Submissions trigger no database updates or emails. | Implement reset token model in Prisma, generate 1-hour crypto token, and dispatch via ZeptoMail. |
| **G-02** | `frontend/app/my-path/page.tsx` | **MEDIUM** | "My Career Path" interactive wizard saves candidate progress solely to `localStorage`; no server-side Prisma persistence. | Create `CandidatePath` model in Prisma and sync progress via `PATCH /api/candidate/path`. |
| **G-03** | `frontend/app/messages/page.tsx` | **MEDIUM** | Messaging UI displays static mockup conversation threads; no live Socket.io / WebSocket server gateway. | Integrate WebSockets server gateway or Supabase Realtime / Pusher for bi-directional candidate-mentor chat. |
| **G-04** | `mentor/app/earnings/page.tsx` | **HIGH** | Earnings dashboard renders simulated revenue cards; no Stripe Connect or Razorpay payout transfer integration. | Integrate Stripe Connect Custom/Express accounts to track balances and automate payouts. |
| **G-05** | `backend/src/services/session.service.ts` | **MEDIUM** | Meeting room links are placeholder URLs without automated WebRTC or Zoom / Google Meet API webhook sync. | Implement Zoom OAuth integration or Daily.co / Jitsi API room generation on booking confirmation. |
| **G-06** | `backend/prisma/schema.prisma` | **HIGH** | No Prisma model exists to store mentor bank routing numbers, IBAN, or payout preferences. | Add `MentorPayoutAccount` model to schema with encrypted banking credentials. |
| **G-07** | `recruiter/app/applications/page.tsx` | **MEDIUM** | Multi-select candidate batch status update operates as optimistic client-side UI loop rather than atomic bulk backend transaction. | Add `POST /api/recruiter/applications/bulk-status` endpoint with atomic Prisma `$transaction`. |
| **G-08** | `recruiter/app/candidates/page.tsx` | **MEDIUM** | Candidate directory search only returns candidates who have already applied to company jobs; no proactive talent sourcing. | Implement candidate talent pool search endpoint with candidate opt-in privacy controls. |
| **G-09** | `recruiter/app/offers/page.tsx` | **LOW** | Offer acceptance/decline is a manual recruiter button toggle; no DocuSign / HelloSign embedded signing webhooks. | Integrate DocuSign or HelloSign webhook listeners to capture legally binding e-signatures. |
| **G-10** | `admin/app/dashboard/page.tsx` | **HIGH** | Platform revenue charts and gross merchandise value (GMV) display simulated mock data; no live ledger connection. | Connect platform transaction ledger aggregating booking fees and recruiter subscription revenue. |
| **G-11** | `backend/prisma/schema.prisma` | **MEDIUM** | Single `ADMIN` enum tier without sub-admin permissions (e.g., Support Admin vs Billing Admin). | Introduce granular admin permission matrix or `AdminRole` model in Prisma schema. |
| **G-12** | `admin/app/users/page.tsx` | **LOW** | User moderation operates strictly on single user records; bulk suspension lacks an atomic batch backend API. | Add `POST /api/admin/users/bulk-status` endpoint. |

---

## 5. Script & Reproduction Assets

To re-render or modify the workflow diagrams, use the included Node.js generation pipeline:

```bash
# Generate all 4 SVGs and render high-resolution 4K PNGs
node docs/workflows/run-generator.mjs
```

### Generator Script Assets
- `docs/workflows/generate-workflows.mjs` — Modular SVG renderer engine.
- `docs/workflows/data-student.mjs` — Student / Candidate portal data schema.
- `docs/workflows/data-mentor.mjs` — Mentor portal data schema.
- `docs/workflows/data-recruiter.mjs` — Recruiter portal data schema.
- `docs/workflows/data-admin.mjs` — Admin portal data schema.
- `docs/workflows/run-generator.mjs` — Pipeline executor and headless Google Chrome rendering script.
