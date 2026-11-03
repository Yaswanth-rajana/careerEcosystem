export const adminWorkflowData = {
  title: "Admin Portal — End-to-End Backend Workflow Architecture",
  subtitle: "System Governance, Mentor Dossier Vetting, Employer Verification, Course Builder & Audit Trail",
  themeName: "SLATE & AMBER",
  theme: {
    primary: "#D97706",
    dark: "#B45309",
    light: "#FDE68A",
    badgeBg: "#FEF3C7",
    border: "#FDE68A"
  },
  portBadge: "PORTAL: ADMIN (:3003)",
  verifiedBadge: "VERIFIED: 17 PAGES / 24 ROUTES",
  pipelineTitle: "EXECUTION PIPELINE: 8 SEQUENTIAL PHASES FROM GOVERNANCE & VETTING TO LMS & AUDIT",
  pipelineSubtitle: "STRICT STEP ORDER & ACTOR RESPONSIBILITIES",
  pipelineSteps: [
    {
      stepNum: "4.1",
      title: "Zero-Trust Admin Auth",
      actorBadge: "SUPER ADMIN",
      actorPort: "Admin Portal (:3003)",
      bullets: [
        {
          header: "Admin Authentication",
          sublines: [
            { text: "POST /api/admin/auth/login", color: "#D97706", bold: true },
            { text: "Bcrypt hash match (12 rounds)" }
          ]
        },
        {
          header: "Strict Role Gate",
          sublines: [
            { text: "ServerAuth: user.role === 'ADMIN'", color: "#E11D48", bold: true },
            { text: "Non-admins rejected with HTTP 403" }
          ]
        },
        {
          header: "Isolated Admin Cookie",
          sublines: [
            { text: "career_admin_session cookie issued" }
          ]
        }
      ],
      outcomeTitle: "PRIMARY OUTCOME:",
      outcomeDesc: [
        "Super-admin access authorized",
        "Session strictly isolated from candidate/mentor"
      ]
    },
    {
      stepNum: "4.2",
      title: "Platform KPI Engine",
      actorBadge: "ANALYTICS",
      actorPort: "Admin Dashboard (:3003)",
      bullets: [
        {
          header: "Real-Time Metrics",
          sublines: [
            { text: "GET /api/admin/metrics", color: "#D97706", bold: true },
            { text: "Parallel database count aggregations" }
          ]
        },
        {
          header: "Monitored Platform Entities",
          sublines: [
            { text: "• Total active candidates & resumes" },
            { text: "• Verified companies & active jobs" },
            { text: "• Approved mentors & booked sessions" }
          ]
        }
      ],
      outcomeTitle: "PRIMARY OUTCOME:",
      outcomeDesc: [
        "Comprehensive system health dashboard",
        "Tracks ecosystem growth and activity"
      ]
    },
    {
      stepNum: "4.3",
      title: "User Identity Governance",
      actorBadge: "SUPER ADMIN",
      actorPort: "Admin Portal (:3003)",
      bullets: [
        {
          header: "Directory Inspection",
          sublines: [
            { text: "GET /api/admin/users", color: "#D97706", bold: true },
            { text: "Faceted search: email, role, status" }
          ]
        },
        {
          header: "Account State Mutation",
          sublines: [
            { text: "PATCH /api/admin/users/[id]", color: "#B45309", bold: true },
            { text: "Sets status: ACTIVE / SUSPENDED" }
          ]
        },
        {
          header: "Role Elevation Guard",
          sublines: [
            { text: "Admin can elevate roles manually" }
          ]
        }
      ],
      outcomeTitle: "PRIMARY OUTCOME:",
      outcomeDesc: [
        "User state immediately synced in database",
        "Suspended accounts blocked by auth middleware"
      ]
    },
    {
      stepNum: "4.4",
      title: "Mentor Dossier Vetting",
      actorBadge: "REVIEWER",
      actorPort: "Admin Portal (:3003)",
      bullets: [
        {
          header: "Application Dossier Review",
          sublines: [
            { text: "GET /api/admin/mentors/applications/[id]", color: "#D97706", bold: true },
            { text: "Vets resume, LinkedIn, credentials" }
          ]
        },
        {
          header: "Status Decision",
          sublines: [
            { text: "POST /api/admin/mentors/.../status", color: "#059669", bold: true },
            { text: "Transitions SUBMITTED -> APPROVED" }
          ]
        },
        {
          header: "Profile Initialization",
          sublines: [
            { text: "Creates MentorProfile with default stats" }
          ]
        }
      ],
      outcomeTitle: "PRIMARY OUTCOME:",
      outcomeDesc: [
        "Mentor profile activated for candidate bookings",
        "Triggers 24h cryptographic onboarding workflow"
      ]
    },
    {
      stepNum: "4.5",
      title: "24h Cryptographic Token",
      actorBadge: "SECURITY",
      actorPort: "IdentityService (:3003)",
      bullets: [
        {
          header: "Token Generation",
          sublines: [
            { text: "crypto.randomBytes(32).toString('hex')", color: "#059669", bold: true },
            { text: "SHA-256 hashed and stored in User" }
          ]
        },
        {
          header: "Strict Expiration",
          sublines: [
            { text: "setupTokenExpiresAt = now + 24 hours", color: "#E11D48", bold: true },
            { text: "Hard window halts stale activation" }
          ]
        },
        {
          header: "ZeptoMail Dispatch",
          sublines: [
            { text: "E-mails one-time password setup link" }
          ]
        }
      ],
      outcomeTitle: "PRIMARY OUTCOME:",
      outcomeDesc: [
        "Tamper-proof activation email delivered",
        "Mentor self-service password setup ready"
      ]
    },
    {
      stepNum: "4.6",
      title: "Employer Verification",
      actorBadge: "SUPER ADMIN",
      actorPort: "Admin Portal (:3003)",
      bullets: [
        {
          header: "Company Vetting",
          sublines: [
            { text: "GET /api/admin/companies/[id]", color: "#D97706", bold: true },
            { text: "Validates business domain & tax ID" }
          ]
        },
        {
          header: "Verification Badge Toggle",
          sublines: [
            { text: "PATCH /api/admin/companies/[id]", color: "#059669", bold: true },
            { text: "Toggles isVerified: true / false" }
          ]
        },
        {
          header: "Fraud Protection",
          sublines: [
            { text: "Allows freezing rogue employer accounts" }
          ]
        }
      ],
      outcomeTitle: "PRIMARY OUTCOME:",
      outcomeDesc: [
        "Verified badge applied to company listings",
        "Candidate trust score elevated"
      ]
    },
    {
      stepNum: "4.7",
      title: "Job Compliance & Cron",
      actorBadge: "MODERATOR",
      actorPort: "Admin Portal (:3003)",
      bullets: [
        {
          header: "Content Moderation",
          sublines: [
            { text: "GET /api/admin/jobs", color: "#D97706", bold: true },
            { text: "Inspects job descriptions & salaries" }
          ]
        },
        {
          header: "Force Close Action",
          sublines: [
            { text: "PATCH /api/admin/jobs/[id] (CLOSED)", color: "#E11D48", bold: true },
            { text: "Removes deceptive job postings" }
          ]
        },
        {
          header: "Cron Health Monitor",
          sublines: [
            { text: "Monitors 30-day auto-expiration worker" }
          ]
        }
      ],
      outcomeTitle: "PRIMARY OUTCOME:",
      outcomeDesc: [
        "Policy-violating postings eliminated",
        "Continuous 30-day cleanup verified"
      ]
    },
    {
      stepNum: "4.8",
      title: "LMS Curriculum & Audit",
      actorBadge: "SUPER ADMIN",
      actorPort: "Admin Portal (:3003)",
      bullets: [
        {
          header: "Course Tree Authoring",
          sublines: [
            { text: "POST /api/admin/courses", color: "#D97706", bold: true },
            { text: "Creates Course -> Modules -> Lessons" }
          ]
        },
        {
          header: "Audit Trail Emission",
          sublines: [
            { text: "Writes immutable AuditLog entry", color: "#059669", bold: true },
            { text: "Captures adminId, action, IP, timestamp" }
          ]
        },
        {
          header: "System Settings",
          sublines: [
            { text: "Manages platform feature flags" }
          ]
        }
      ],
      outcomeTitle: "PRIMARY OUTCOME:",
      outcomeDesc: [
        "Curriculum published to candidate portal",
        "Complete tamper-evident audit history stored"
      ]
    }
  ],
  apiHandlers: [
    {
      method: "POST",
      methodColor: "#059669",
      path: "/api/admin/mentors/applications/[id]/status (Approval Pipeline)",
      height: 250,
      details: [
        { title: "Auth Guard", value: "career_admin_session cookie; strictly asserts user.role === 'ADMIN'", valColor: "#D97706" },
        { title: "Zod Schema", value: "MentorApplicationStatusSchema.parse(body)", valColor: "#059669", subtext: "Payload: { status: 'APPROVED' | 'REJECTED', rejectionReason?: string }" },
        { title: "Atomic Transaction", value: "Creates User (or elevates existing) + MentorProfile + 24h setupToken", bold: true },
        { title: "ZeptoMail Dispatch", value: "Dispatches welcome email with secure 24-hour setup password URL", valColor: "#0D9488" }
      ]
    },
    {
      method: "PATCH",
      methodColor: "#D97706",
      path: "/api/admin/companies/[id] (Employer Verification)",
      height: 250,
      details: [
        { title: "Auth Guard", value: "career_admin_session cookie; validates super-admin identity", valColor: "#D97706" },
        { title: "Zod Schema", value: "CompanyVerifySchema.parse(body)", valColor: "#059669", subtext: "Payload: { isVerified: boolean, status?: 'ACTIVE' | 'SUSPENDED' }" },
        { title: "Ecosystem Impact", value: "Toggling isVerified updates badge across all company's published jobs", bold: true },
        { title: "Audit Log", value: "Emits AuditLog (ADMIN_COMPANY_VERIFIED) recording previous/new status", valColor: "#B45309" }
      ]
    },
    {
      method: "POST",
      methodColor: "#4338CA",
      path: "/api/admin/courses (LMS Curriculum Authoring)",
      height: 250,
      details: [
        { title: "Auth Guard", value: "career_admin_session cookie -> user.role === 'ADMIN'", valColor: "#D97706" },
        { title: "Zod Schema", value: "CourseCreateSchema.parse(body)", valColor: "#059669", subtext: "Payload: { title, slug, description, level, modules: Array<{ title, lessons: [...] }> }" },
        { title: "Relational Tree", value: "Prisma writes nested Course -> Module -> Lesson documents atomically", bold: true },
        { title: "Publishing Control", value: "Supports draft mode and instantaneous publication to candidate portal", valColor: "#059669" }
      ]
    }
  ],
  safetyRules: {
    title: "ADMIN PORTAL GOVERNANCE & PRIVILEGE ENFORCEMENT RULES",
    height: 230,
    items: [
      { label: "Zero-Trust Admin Isolation", text: "Admin session cookie (career_admin_session) is distinct from all portal cookies; requires user.role === 'ADMIN'." },
      { label: "Tamper-Evident Audit Logging", text: "Every mutating admin API route appends an unalterable record to db.auditLog." },
      { label: "24-Hour Setup Token TTL", text: "Crypto activation tokens automatically expire in 24 hours, preventing dormant link hijacking." },
      { label: "Immediate Suspension Cutoff", text: "Suspending a user or company immediately revokes active session validity across portals." }
    ]
  },
  prismaModels: [
    {
      modelTitle: "model User & MentorApplication",
      height: 480,
      fields: [
        { text: "id                    String             @id @default(auto()) @map(\"_id\") @db.ObjectId" },
        { text: "email                 String             @unique" },
        { text: "role                  Role               @default(CANDIDATE) (CANDIDATE, MENTOR, ADMIN)", color: "#D97706" },
        { text: "status                UserStatus         @default(ACTIVE) (ACTIVE, SUSPENDED)" },
        { text: "setupToken            String?            (SHA-256 hash of 32-byte crypto token)", color: "#059669" },
        { text: "setupTokenExpiresAt   DateTime?          (Enforces strict 24-hour expiration window)", color: "#E11D48" },
        {
          isHighlight: true,
          boxHeight: 125,
          highlightTitle: "RELATED MODEL: MentorApplication (Applicant Vetting Dossier):",
          highlightFields: [
            "id                    String             @id @default(auto()) @map(\"_id\") @db.ObjectId",
            "name                  String             (Applicant full name)",
            "email                 String             @unique",
            "status                ApplicationStatus  @default(SUBMITTED) (SUBMITTED, APPROVED...)",
            "linkedIn              String?",
            "yearsOfExperience     Int"
          ]
        },
        { text: "createdAt             DateTime           @default(now())" }
      ],
      indexConstraint: "CONSTRAINT: @@unique([email]) & @@index([role, status]) — Protects identity integrity"
    },
    {
      modelTitle: "model AuditLog & Course (LMS)",
      height: 380,
      fields: [
        { text: "id               String             @id @default(auto()) @map(\"_id\") @db.ObjectId" },
        { text: "userId           String             @db.ObjectId (Admin actor reference)", color: "#D97706" },
        { text: "action           String             (\"ADMIN_MENTOR_APPROVED\", \"ADMIN_USER_SUSPENDED\")" },
        { text: "entityType       String             (\"MentorApplication\", \"Company\", \"User\")" },
        { text: "entityId         String             (Target entity ObjectId)" },
        { text: "metadata         Json?              (Diff of changed attributes and IP address)" },
        {
          isHighlight: true,
          boxHeight: 90,
          highlightTitle: "RELATED MODEL: Course (LMS Curriculum Tree):",
          highlightFields: [
            "id               String             @id @default(auto()) @map(\"_id\") @db.ObjectId",
            "title            String             (Course curriculum title)",
            "slug             String             @unique",
            "isPublished      Boolean            @default(false)"
          ]
        }
      ],
      indexConstraint: "INDEX: @@index([userId, createdAt]) & @@index([entityType, entityId]) — Powers security audit investigations"
    }
  ],
  stateAnalysis: {
    badge: "STATE MACHINE",
    title: "Application Dossier & Company Verification States",
    height: 250,
    items: [
      { label: "Application Vetting", text: "Applicant submits -> SUBMITTED -> Admin opens dossier -> APPROVED / REJECTED." },
      { label: "Token Lifecycle", text: "Admin approval generates 24h SHA-256 token -> Emailed via ZeptoMail -> Consumed on setup." },
      { label: "Company Verification", text: "Company registered -> isVerified: false -> Admin audits domain -> isVerified: true." },
      { label: "User Account States", text: "User registered -> ACTIVE -> Admin flags suspicious activity -> SUSPENDED (stops login)." }
    ]
  },
  securityItems: {
    title: "Zero-Trust Admin Isolation & Audit Framework",
    height: 260,
    details: [
      { label: "Dedicated Admin Cookie", text: "career_admin_session cookie cannot be used to impersonate other portal roles." },
      { label: "Zero-Trust Role Check", text: "Every admin route validates user.role === 'ADMIN'; no implicit session inheritance.", bold: true },
      { label: "Cryptographic Salts", text: "Admin passwords hashed with bcrypt 12 rounds; tokens generated with secure PRNG." },
      { label: "Tamper-Evident Auditing", text: "All admin mutations write non-deletable AuditLog entries with source IP and user agent." }
    ]
  },
  externalIntegrations: {
    title: "External Services & Scheduled Infrastructure",
    height: 240,
    details: [
      { service: "ZeptoMail REST API", action: "Delivers mentor activation credentials and employer verification notifications." },
      { service: "Scheduled Cron System", action: "Oversees hourly execution of /api/jobs/cron/expire for automated platform cleanup." },
      { service: "MongoDB Atlas Engine", action: "Executes optimized aggregation pipelines for real-time KPI metrics." }
    ]
  },
  gapsAndMocks: {
    title: "VERIFIED CODEBASE GAPS, MOCKS & UNCONNECTED FLOWS",
    height: 380,
    items: [
      {
        severity: "HIGH",
        code: "G-10",
        title: "Mock Financial Revenue Analytics",
        description: "admin/app/dashboard revenue chart and gross merchandise value (GMV) metrics display simulated statistics; no live Stripe balance or payout ledger is connected.",
        location: "admin/app/dashboard/page.tsx (Simulated financial metric cards)"
      },
      {
        severity: "MEDIUM",
        code: "G-11",
        title: "Single-Tier Admin Privileges",
        description: "All admin users possess full super-admin access; no sub-admin permission granularity (e.g. Support Admin vs Billing Admin) exists in the schema.",
        location: "backend/prisma/schema.prisma (Enum Role has single ADMIN tier)"
      },
      {
        severity: "LOW",
        code: "G-12",
        title: "Missing Atomic Bulk User Moderation",
        description: "Admin user moderation operates strictly on single user records; batch suspending or elevating multiple accounts lacks a bulk backend transaction endpoint.",
        location: "admin/app/users/page.tsx (Single user PATCH calls)"
      }
    ]
  }
};
