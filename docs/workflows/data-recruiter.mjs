export const recruiterWorkflowData = {
  title: "Recruiter Portal — End-to-End Backend Workflow Architecture",
  subtitle: "Multi-Tenant Company Isolation, Job Publishing Lifecycle, Resume Streaming & 28-Permission RBAC",
  themeName: "SKY BLUE & ROSE",
  theme: {
    primary: "#0284C7",
    dark: "#0369A1",
    light: "#BAE6FD",
    badgeBg: "#F0F9FF",
    border: "#BAE6FD"
  },
  portBadge: "PORTAL: RECRUITER (:3002)",
  verifiedBadge: "VERIFIED: 17 PAGES / 26 ROUTES",
  pipelineTitle: "EXECUTION PIPELINE: 8 SEQUENTIAL PHASES FROM AUTH & JOBS TO PIPELINE & HIRES",
  pipelineSubtitle: "STRICT STEP ORDER & ACTOR RESPONSIBILITIES",
  pipelineSteps: [
    {
      stepNum: "3.1",
      title: "Auth & Tenant Binding",
      actorBadge: "RECRUITER",
      actorPort: "Recruiter Portal (:3002)",
      bullets: [
        {
          header: "Multi-Tenant Login",
          sublines: [
            { text: "POST /api/recruiter/auth/login", color: "#0284C7", bold: true },
            { text: "Resolves User + CompanyMember" }
          ]
        },
        {
          header: "Company Isolation Bound",
          sublines: [
            { text: "Injects auth.company.id into session", color: "#059669", bold: true },
            { text: "Binds all queries to tenant company" }
          ]
        },
        {
          header: "Session Cookie Issuance",
          sublines: [
            { text: "career_recruiter_session cookie set" }
          ]
        }
      ],
      outcomeTitle: "PRIMARY OUTCOME:",
      outcomeDesc: [
        "Authenticated recruiter session established",
        "Strict multi-tenant security boundary locked"
      ]
    },
    {
      stepNum: "3.2",
      title: "Employer Brand Profile",
      actorBadge: "COMPANY ADMIN",
      actorPort: "Recruiter Portal (:3002)",
      bullets: [
        {
          header: "Company Profile Edit",
          sublines: [
            { text: "PATCH /api/recruiter/company", color: "#0284C7", bold: true },
            { text: "Updates logo, website, bio, size" }
          ]
        },
        {
          header: "Verification Badge Check",
          sublines: [
            { text: "Reads company.isVerified flag", color: "#059669", bold: true },
            { text: "Verified badge shown to candidates" }
          ]
        },
        {
          header: "Domain Authorization",
          sublines: [
            { text: "Enforces corporate email domain match" }
          ]
        }
      ],
      outcomeTitle: "PRIMARY OUTCOME:",
      outcomeDesc: [
        "Company branding updated in MongoDB",
        "Public job postings display company crest"
      ]
    },
    {
      stepNum: "3.3",
      title: "Job Drafting & Publish",
      actorBadge: "RECRUITER",
      actorPort: "Recruiter Portal (:3002)",
      bullets: [
        {
          header: "Job Creation",
          sublines: [
            { text: "POST /api/recruiter/jobs", color: "#0284C7", bold: true },
            { text: "RecruiterJobCreateSchema.parse(body)" }
          ]
        },
        {
          header: "30-Day Lifespan Rule",
          sublines: [
            { text: "status: 'PUBLISHED', publishedAt = now", color: "#059669", bold: true },
            { text: "expiresAt = now + 30 days" }
          ]
        },
        {
          header: "Company Scoping Guard",
          sublines: [
            { text: "Injected: { companyId: auth.company.id }" }
          ]
        }
      ],
      outcomeTitle: "PRIMARY OUTCOME:",
      outcomeDesc: [
        "Job published to candidate search index",
        "30-day expiration timer initiated"
      ]
    },
    {
      stepNum: "3.4",
      title: "30-Day Cron Expiration",
      actorBadge: "CRON DAEMON",
      actorPort: "Scheduled Worker (:3002)",
      bullets: [
        {
          header: "Scheduled Expiration Job",
          sublines: [
            { text: "GET /api/jobs/cron/expire", color: "#E11D48", bold: true },
            { text: "Scans jobs where expiresAt < now()" }
          ]
        },
        {
          header: "Status Transition",
          sublines: [
            { text: "status: PUBLISHED -> EXPIRED", color: "#D97706", bold: true },
            { text: "Atomic updateMany query executed" }
          ]
        },
        {
          header: "Application Freeze",
          sublines: [
            { text: "Blocks new applies; preserves pipeline" }
          ]
        }
      ],
      outcomeTitle: "PRIMARY OUTCOME:",
      outcomeDesc: [
        "Stale jobs removed from search results",
        "Existing candidate applications preserved"
      ]
    },
    {
      stepNum: "3.5",
      title: "Pipeline Kanban",
      actorBadge: "HIRING TEAM",
      actorPort: "Recruiter Portal (:3002)",
      bullets: [
        {
          header: "Pipeline Stage Progression",
          sublines: [
            { text: "PATCH /api/recruiter/applications/[id]/status", color: "#0284C7", bold: true },
            { text: "RBAC guard: 'pipeline:transition'" }
          ]
        },
        {
          header: "Supported Transitions",
          sublines: [
            { text: "APPLIED -> UNDER_REVIEW -> SHORTLISTED", color: "#059669" },
            { text: "-> INTERVIEW -> OFFER / REJECTED" }
          ]
        },
        {
          header: "Candidate Notification",
          sublines: [
            { text: "ZeptoMail alerts candidate on stage change" }
          ]
        }
      ],
      outcomeTitle: "PRIMARY OUTCOME:",
      outcomeDesc: [
        "Application state transitioned in database",
        "AuditLog record written with recruiter ID"
      ]
    },
    {
      stepNum: "3.6",
      title: "Secure Resume Stream",
      actorBadge: "RECRUITER",
      actorPort: "Recruiter Portal (:3002)",
      bullets: [
        {
          header: "Inline PDF Streaming",
          sublines: [
            { text: "GET /api/recruiter/applications/[id]/resume", color: "#0284C7", bold: true },
            { text: "Streams PDF buffer directly to viewer" }
          ]
        },
        {
          header: "Multi-Tenant Ownership Guard",
          sublines: [
            { text: "where: { job.companyId: auth.company.id }", color: "#E11D48", bold: true },
            { text: "Cross-company access blocked (403)" }
          ]
        },
        {
          header: "Immutable Snapshot Source",
          sublines: [
            { text: "Reads frozen application resumeId" }
          ]
        }
      ],
      outcomeTitle: "PRIMARY OUTCOME:",
      outcomeDesc: [
        "Inline PDF rendered in browser viewer",
        "Zero temporary files exposed to public web"
      ]
    },
    {
      stepNum: "3.7",
      title: "Interview Rounds & Notes",
      actorBadge: "INTERVIEWER",
      actorPort: "Recruiter Portal (:3002)",
      bullets: [
        {
          header: "Round Scheduling",
          sublines: [
            { text: "POST /api/recruiter/interviews", color: "#0284C7", bold: true },
            { text: "Assigns round, date, interviewer, link" }
          ]
        },
        {
          header: "Scorecard Evaluation",
          sublines: [
            { text: "PATCH /api/recruiter/interviews/[id]", color: "#059669" },
            { text: "Submits rating (1-5), strengths, notes" }
          ]
        },
        {
          header: "Interview Calendar Invite",
          sublines: [
            { text: "ZeptoMail sends calendar invite to candidate" }
          ]
        }
      ],
      outcomeTitle: "PRIMARY OUTCOME:",
      outcomeDesc: [
        "Interview rounds recorded in MongoDB",
        "Collaborative feedback visible to hiring team"
      ]
    },
    {
      stepNum: "3.8",
      title: "Team RBAC & Invites",
      actorBadge: "COMPANY ADMIN",
      actorPort: "Recruiter Portal (:3002)",
      bullets: [
        {
          header: "Team Member Invite",
          sublines: [
            { text: "POST /api/recruiter/team", color: "#E11D48", bold: true },
            { text: "Enforces 28-permission RBAC matrix" }
          ]
        },
        {
          header: "Cryptographic Invite Token",
          sublines: [
            { text: "32-byte crypto token; 7-day expiration", color: "#059669", bold: true },
            { text: "ZeptoMail delivers invitation URL" }
          ]
        },
        {
          header: "Member Role Assignment",
          sublines: [
            { text: "Roles: OWNER, ADMIN, RECRUITER, INTERVIEWER" }
          ]
        }
      ],
      outcomeTitle: "PRIMARY OUTCOME:",
      outcomeDesc: [
        "CompanyMember account created on accept",
        "Granular permissions scoped to assigned jobs"
      ]
    }
  ],
  apiHandlers: [
    {
      method: "POST",
      methodColor: "#0284C7",
      path: "/api/recruiter/jobs (Job Authoring & 30d Rule)",
      height: 250,
      details: [
        { title: "Auth Guard", value: "career_recruiter_session cookie; verifies auth.company.id is active", valColor: "#0284C7" },
        { title: "RBAC Guard", value: "RecruiterRbacService.assertPermission('jobs:write')", valColor: "#059669" },
        { title: "Zod Schema", value: "RecruiterJobCreateSchema.parse(body)", valColor: "#059669", subtext: "Payload: { title, description, workMode, location, minSalary, maxSalary, skills }" },
        { title: "Lifespan Logic", value: "Sets status: 'PUBLISHED', publishedAt: now(), expiresAt: now() + 30 days", bold: true }
      ]
    },
    {
      method: "PATCH",
      methodColor: "#E11D48",
      path: "/api/recruiter/applications/[id]/status (Kanban Transition)",
      height: 250,
      details: [
        { title: "Auth Guard", value: "career_recruiter_session cookie; enforces job.companyId === auth.company.id", valColor: "#0284C7" },
        { title: "RBAC Guard", value: "assertPermission('pipeline:transition'); checks assignedJobIds if restricted", valColor: "#E11D48", bold: true },
        { title: "Stage Transition", value: "APPLIED -> UNDER_REVIEW -> SHORTLISTED -> INTERVIEW -> OFFER / REJECTED", valColor: "#059669" },
        { title: "Event Emission", value: "Logs AuditLog (RECRUITER_APPLICATION_STATUS_UPDATED); sends ZeptoMail alert", valColor: "#0284C7" }
      ]
    },
    {
      method: "GET",
      methodColor: "#0D9488",
      path: "/api/recruiter/applications/[id]/resume (Secure PDF Stream)",
      height: 250,
      details: [
        { title: "Auth Guard", value: "career_recruiter_session cookie; resolves company and user identity", valColor: "#0284C7" },
        { title: "Tenant Isolation", value: "Verifies application.job.companyId === auth.company.id (Throws 403 on mismatch)", bold: true },
        { title: "Storage Provider", value: "StorageFactory.getProvider() reads local disk buffer from uploads directory", valColor: "#0D9488" },
        { title: "Response Headers", value: "Content-Type: application/pdf, Content-Disposition: inline (streams directly)", valColor: "#059669" }
      ]
    }
  ],
  safetyRules: {
    title: "RECRUITER PORTAL MULTI-TENANT ISOLATION & RBAC RULES",
    height: 230,
    items: [
      { label: "Tenant Isolation Mandate", text: "Every MongoDB query explicitly includes where: { companyId: auth.company.id }; zero cross-tenant bleed." },
      { label: "28-Permission Matrix", text: "Fine-grained permissions separate read-only recruiters, interviewers, and full company admins." },
      { label: "Job-Level Scoping", text: "Recruiters with assignedJobIds can only view and manage candidates for their assigned postings." },
      { label: "Invite Token Security", text: "Team invitation tokens hashed with SHA-256; automatically expire after 7 calendar days." }
    ]
  },
  prismaModels: [
    {
      modelTitle: "model Company & CompanyMember",
      height: 480,
      fields: [
        { text: "id               String             @id @default(auto()) @map(\"_id\") @db.ObjectId" },
        { text: "name             String             (Company legal name)" },
        { text: "slug             String             @unique (URL slug: \"acme-corp\")" },
        { text: "domain           String             (Official email domain: \"acme.com\")" },
        { text: "isVerified       Boolean            @default(false) (Admin verified badge)" },
        { text: "logoUrl          String?" },
        { text: "industry         String?" },
        {
          isHighlight: true,
          boxHeight: 125,
          highlightTitle: "RELATED MODEL: CompanyMember (Multi-Tenant RBAC Association):",
          highlightFields: [
            "id               String             @id @default(auto()) @map(\"_id\") @db.ObjectId",
            "companyId        String             @db.ObjectId (Foreign key -> Company.id)",
            "userId           String             @db.ObjectId (Foreign key -> User.id)",
            "role             MemberRole         (OWNER, ADMIN, RECRUITER, INTERVIEWER)",
            "assignedJobIds   String[]           (Job-level scoping array for interviewers)",
            "status           MemberStatus       @default(ACTIVE)"
          ]
        },
        { text: "createdAt        DateTime           @default(now())" }
      ],
      indexConstraint: "CONSTRAINT: @@unique([companyId, userId]) & @@unique([slug]) — Enforces tenant isolation integrity"
    },
    {
      modelTitle: "model Job & Interview / Offer",
      height: 380,
      fields: [
        { text: "id               String             @id @default(auto()) @map(\"_id\") @db.ObjectId" },
        { text: "companyId        String             @db.ObjectId (Foreign key -> Company.id)", color: "#0284C7" },
        { text: "title            String             (Job role title)" },
        { text: "status           JobStatus          @default(DRAFT) (DRAFT, PUBLISHED, EXPIRED, CLOSED)" },
        { text: "publishedAt      DateTime?" },
        { text: "expiresAt        DateTime?          (Enforces 30-day cron expiration)", color: "#E11D48" },
        {
          isHighlight: true,
          boxHeight: 90,
          highlightTitle: "RELATED MODEL: Interview (Evaluation Rounds & Feedback):",
          highlightFields: [
            "id               String             @id @default(auto()) @map(\"_id\") @db.ObjectId",
            "applicationId    String             @db.ObjectId (Linked JobApplication)",
            "roundName        String             (\"Technical Screen\", \"System Design\")",
            "scheduledAt      DateTime           (UTC interview timestamp)",
            "scorecard        Json?              (Interviewer rating and feedback)"
          ]
        }
      ],
      indexConstraint: "INDEX: @@index([companyId, status]) & @@index([expiresAt]) — Optimizes cron scanning"
    }
  ],
  stateAnalysis: {
    badge: "STATE MACHINE",
    title: "Application Pipeline Kanban & Offer Lifecycle",
    height: 250,
    items: [
      { label: "Application Intake", text: "Candidate submits -> APPLIED -> Recruiter opens profile -> UNDER_REVIEW." },
      { label: "Screening & Interview", text: "Recruiter flags match -> SHORTLISTED -> Schedules interview rounds -> INTERVIEW." },
      { label: "Offer Generation", text: "Hiring committee approves -> Recruiter drafts offer -> OFFER -> Candidate accepts/declines." },
      { label: "Rejection Terminal", text: "At any stage, recruiter can select REJECTED -> Emits audit event and optional feedback email." }
    ]
  },
  securityItems: {
    title: "Multi-Tenant Isolation, RBAC & Token Security",
    height: 260,
    details: [
      { label: "Cookie Isolation", text: "career_recruiter_session cookie strictly isolated from candidate and mentor sessions." },
      { label: "Multi-Tenant Boundary", text: "Every query requires { companyId: auth.company.id }; unauthorized tenant access throws 403.", bold: true },
      { label: "28-Permission Matrix", text: "RecruiterRbacService verifies caller privileges before executing any state mutation." },
      { label: "Audit Emission", text: "All recruiter actions recorded in AuditLog with actorId, companyId, and previous/new state." }
    ]
  },
  externalIntegrations: {
    title: "External Services & Scheduled Workers",
    height: 240,
    details: [
      { service: "Scheduled 30-day Cron", action: "Background cron calls /api/jobs/cron/expire every hour to automatically expire jobs." },
      { service: "ZeptoMail REST API", action: "Delivers stage updates, interview invites, and team onboarding emails." },
      { service: "Storage Provider", action: "Streams protected PDF resumes inline to recruiter browser without disk duplication." }
    ]
  },
  gapsAndMocks: {
    title: "VERIFIED CODEBASE GAPS, MOCKS & UNCONNECTED FLOWS",
    height: 380,
    items: [
      {
        severity: "MEDIUM",
        code: "G-07",
        title: "Partial Bulk Applicant Status Updates",
        description: "Multi-select applicant batch status update operates as optimistic client-side UI loop; no atomic bulk-transition MongoDB transaction endpoint exists.",
        location: "recruiter/app/applications/page.tsx (Sequential per-application API calls)"
      },
      {
        severity: "MEDIUM",
        code: "G-08",
        title: "Missing Proactive Candidate Talent Sourcing",
        description: "Recruiter search is strictly confined to candidates who have already applied to their company jobs; no talent database search for un-applied candidates exists.",
        location: "recruiter/app/candidates/page.tsx (Only queries applied candidates)"
      },
      {
        severity: "LOW",
        code: "G-09",
        title: "Manual Offer Acceptance Without E-Signature",
        description: "Offer stage transitions depend on manual recruiter button clicks; no DocuSign or HelloSign embedded webhook signature capture is integrated.",
        location: "recruiter/app/offers/page.tsx (Manual status toggle)"
      }
    ]
  }
};
