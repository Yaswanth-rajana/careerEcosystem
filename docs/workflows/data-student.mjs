export const studentWorkflowData = {
  title: "Student & Candidate Portal — End-to-End Backend Workflow Architecture",
  subtitle: "Authentication, Resume Management, Job Applications, Mentor Discovery, Availability Slots & Booking State Machine",
  themeName: "INDIGO",
  theme: {
    primary: "#4F46E5",
    dark: "#312E81",
    light: "#C7D2FE",
    badgeBg: "#EEF2FF",
    border: "#C7D2FE"
  },
  portBadge: "PORTAL: FRONTEND (:3000)",
  verifiedBadge: "VERIFIED: 25 PAGES / 22 ROUTES",
  pipelineTitle: "EXECUTION PIPELINE: 8 SEQUENTIAL PHASES FROM DISCOVERY TO MENTORSHIP & JOBS",
  pipelineSubtitle: "STRICT STEP ORDER & ACTOR RESPONSIBILITIES",
  pipelineSteps: [
    {
      stepNum: "1.1",
      title: "Auth & Session Guard",
      actorBadge: "CANDIDATE",
      actorPort: "Candidate Portal (:3000)",
      bullets: [
        {
          header: "Registration & Login",
          sublines: [
            { text: "POST /api/auth/login", color: "#4338CA", bold: true },
            { text: "Bcrypt hash match (12 rounds)" }
          ]
        },
        {
          header: "Session Cookie Issuance",
          sublines: [
            { text: "career_session JWT set (httpOnly)", color: "#059669", bold: true },
            { text: "7-day sliding expiry window" }
          ]
        },
        {
          header: "Role Assertion",
          sublines: [
            { text: "Middleware verifies role: CANDIDATE" }
          ]
        }
      ],
      outcomeTitle: "PRIMARY OUTCOME:",
      outcomeDesc: [
        "Authenticated candidate session created",
        "CandidateProfile initialized on first access"
      ]
    },
    {
      stepNum: "1.2",
      title: "Profile & Resume Upload",
      actorBadge: "CANDIDATE",
      actorPort: "Candidate Portal (:3000)",
      bullets: [
        {
          header: "Multi-Part CV Upload",
          sublines: [
            { text: "POST /api/candidate/resumes", color: "#4338CA", bold: true },
            { text: "StorageFactory writes to disk buffer" }
          ]
        },
        {
          header: "Format Conversion",
          sublines: [
            { text: "Gotenberg converts HTML/docx -> PDF", color: "#0D9488" }
          ]
        },
        {
          header: "Profile Enrichment",
          sublines: [
            { text: "PATCH /api/candidate/profile", color: "#4338CA" },
            { text: "Updates skills, education, bio" }
          ]
        }
      ],
      outcomeTitle: "PRIMARY OUTCOME:",
      outcomeDesc: [
        "Resume record saved with disk path & metadata",
        "Searchable candidate skills indexed"
      ]
    },
    {
      stepNum: "1.3",
      title: "Dashboard Aggregation",
      actorBadge: "GATEWAY",
      actorPort: "CandidateService (:3000)",
      bullets: [
        {
          header: "Composite Data Fetch",
          sublines: [
            { text: "GET /api/candidate/dashboard", color: "#4338CA", bold: true },
            { text: "CandidateDashboardService aggregates" }
          ]
        },
        {
          header: "Parallel Metric Queries",
          sublines: [
            { text: "• Applications status counts (APPLIED...)" },
            { text: "• Upcoming booked mentorship sessions" },
            { text: "• Profile completeness score (0-100%)" }
          ]
        }
      ],
      outcomeTitle: "PRIMARY OUTCOME:",
      outcomeDesc: [
        "Unified dashboard JSON returned in 1 call",
        "Zero redundant multi-roundtrip frontend requests"
      ]
    },
    {
      stepNum: "1.4",
      title: "Job Faceted Search",
      actorBadge: "CANDIDATE",
      actorPort: "Candidate Portal (:3000)",
      bullets: [
        {
          header: "Public Job Browsing",
          sublines: [
            { text: "GET /api/jobs", color: "#4338CA", bold: true },
            { text: "Filters: location, workMode, minSalary" }
          ]
        },
        {
          header: "Lifespan & Status Guard",
          sublines: [
            { text: "status: 'PUBLISHED' & non-expired", color: "#059669", bold: true },
            { text: "publishedAt > now - 30 days" }
          ]
        },
        {
          header: "Skill Matching Score",
          sublines: [
            { text: "Computes candidate match percentage" }
          ]
        }
      ],
      outcomeTitle: "PRIMARY OUTCOME:",
      outcomeDesc: [
        "Curated list of verified active job postings",
        "Rejects expired jobs automatically"
      ]
    },
    {
      stepNum: "1.5",
      title: "Application Snapshot",
      actorBadge: "PIPELINE",
      actorPort: "ApplicationService (:3000)",
      bullets: [
        {
          header: "Application Submission",
          sublines: [
            { text: "POST /api/jobs/[id]/apply", color: "#4338CA", bold: true },
            { text: "JobApplySchema.parse(body)" }
          ]
        },
        {
          header: "Immutable CV Snapshot",
          sublines: [
            { text: "Freezes resumeId, size, filename, type", color: "#312E81", bold: true },
            { text: "@@unique([candidateId, jobId]) guard" }
          ]
        },
        {
          header: "ZeptoMail Dispatch",
          sublines: [
            { text: "Dual email: candidate confirmation & recruiter" }
          ]
        }
      ],
      outcomeTitle: "PRIMARY OUTCOME:",
      outcomeDesc: [
        "Tamper-proof JobApplication created (APPLIED)",
        "Candidate moves into Recruiter pipeline"
      ]
    },
    {
      stepNum: "1.6",
      title: "Mentor Discovery",
      actorBadge: "CANDIDATE",
      actorPort: "Candidate Portal (:3000)",
      bullets: [
        {
          header: "Directory Search",
          sublines: [
            { text: "GET /api/mentors", color: "#4338CA", bold: true },
            { text: "Filters: expertise, rating, maxRate" }
          ]
        },
        {
          header: "Approval State Check",
          sublines: [
            { text: "where: { status: 'APPROVED' }", color: "#059669", bold: true },
            { text: "Vetted profiles only shown to candidates" }
          ]
        },
        {
          header: "Service Catalog",
          sublines: [
            { text: "GET /api/mentors/[id] includes active services" }
          ]
        }
      ],
      outcomeTitle: "PRIMARY OUTCOME:",
      outcomeDesc: [
        "Verified mentor profile details returned",
        "Active mentorship services & rates visible"
      ]
    },
    {
      stepNum: "1.7",
      title: "Availability Engine",
      actorBadge: "CALENDAR",
      actorPort: "AvailabilityEngine (:3000)",
      bullets: [
        {
          header: "Slot Calculation",
          sublines: [
            { text: "GET /api/mentors/[id]/availability", color: "#4338CA", bold: true },
            { text: "Calculates bookable UTC timestamps" }
          ]
        },
        {
          header: "Constraint Reconciliation",
          sublines: [
            { text: "• Reads weekly MentorAvailabilitySlot" },
            { text: "• Subtracts MentorBlackoutDate periods", color: "#E11D48" },
            { text: "• Prunes existing active Bookings" }
          ]
        }
      ],
      outcomeTitle: "PRIMARY OUTCOME:",
      outcomeDesc: [
        "Collision-free bookable time slots array",
        "Timezone adjusted to candidate local clock"
      ]
    },
    {
      stepNum: "1.8",
      title: "Booking State Machine",
      actorBadge: "BOOKING",
      actorPort: "BookingService (:3000)",
      bullets: [
        {
          header: "Atomic Reservation",
          sublines: [
            { text: "POST /api/bookings (CONFIRMED)", color: "#059669", bold: true },
            { text: "Creates Booking & MentorshipSession" }
          ]
        },
        {
          header: "Reschedule & Cancel",
          sublines: [
            { text: "PATCH /api/bookings/[id]/reschedule", color: "#D97706" },
            { text: "Transitions to RESCHEDULE_REQUESTED" }
          ]
        },
        {
          header: "Calendar Notifications",
          sublines: [
            { text: "ZeptoMail delivers ICS calendar invite" }
          ]
        }
      ],
      outcomeTitle: "PRIMARY OUTCOME:",
      outcomeDesc: [
        "Booking committed with price and meeting URL",
        "Mentor alerted for acceptance/reschedule"
      ]
    }
  ],
  apiHandlers: [
    {
      method: "POST",
      methodColor: "#4F46E5",
      path: "/api/jobs/[id]/apply (Candidate Application)",
      height: 250,
      details: [
        { title: "Auth Guard", value: "career_session cookie resolved via ServerAuth -> User.id (CANDIDATE)", valColor: "#4338CA" },
        { title: "Zod Schema", value: "JobApplySchema.parse(body)", valColor: "#059669", subtext: "Payload: { resumeId?, resumeUrl?, coverNote?, answers?: Record<string, any> }" },
        { title: "Integrity Guard", value: "Validates resume belongs to candidate; snapshots metadata to prevent later tampering", bold: true },
        { title: "Service Delegation", value: "ApplicationService.applyToJob(candidateId, jobId, payload)", valColor: "#4338CA" }
      ]
    },
    {
      method: "POST",
      methodColor: "#059669",
      path: "/api/bookings (Mentorship Reservation)",
      height: 250,
      details: [
        { title: "Auth Guard", value: "career_session cookie -> candidate User.id", valColor: "#4338CA" },
        { title: "Zod Schema", value: "BookingCreateSchema.parse(body)", valColor: "#059669", subtext: "Payload: { mentorId, serviceId, startTime: ISOString, notes?: string }" },
        { title: "Concurrency Guard", value: "Atomic check for conflicting Booking overlapping startTime..endTime", bold: true },
        { title: "Service Delegation", value: "BookingService.createBooking(candidateId, payload) -> status: CONFIRMED", valColor: "#4338CA" }
      ]
    },
    {
      method: "PATCH",
      methodColor: "#D97706",
      path: "/api/bookings/[id]/reschedule (Reschedule Request)",
      height: 250,
      details: [
        { title: "Auth Guard", value: "career_session cookie; verifies booking.candidateId === auth.candidateId", valColor: "#4338CA" },
        { title: "Zod Schema", value: "BookingRescheduleSchema.parse(body)", valColor: "#059669", subtext: "Payload: { proposedStartTime: ISOString, reason?: string }" },
        { title: "State Transition", value: "CONFIRMED -> RESCHEDULE_REQUESTED (locks slot pending mentor approval)", bold: true },
        { title: "Notification", value: "ZeptoMail sends reschedule approval link to mentor portal (:3001)", valColor: "#0D9488" }
      ]
    }
  ],
  safetyRules: {
    title: "CANDIDATE PORTAL SAFETY & IDEMPOTENCY CONTROLS",
    height: 230,
    items: [
      { label: "Unique Application Constraint", text: "Compound unique index @@unique([candidateId, jobId]) halts duplicate applications." },
      { label: "Reschedule Anti-Race Guard", text: "Cannot reschedule within 2 hours of session start; blocks conflicting double-bookings." },
      { label: "Resume Cleanup on Failure", text: "If application creation fails after upload, newly orphaned storage file is purged." },
      { label: "Withdrawn Re-Apply", text: "Withdrawn applications can be cleanly re-submitted without database key collisions." }
    ]
  },
  prismaModels: [
    {
      modelTitle: "model JobApplication & CandidateProfile",
      height: 480,
      fields: [
        { text: "id               String             @id @default(auto()) @map(\"_id\") @db.ObjectId" },
        { text: "candidateId      String             @db.ObjectId (Foreign key -> User.id)" },
        { text: "jobId            String             @db.ObjectId (Foreign key -> Job.id)" },
        { text: "status           ApplicationStatus  @default(APPLIED) (Enum: APPLIED, SHORTLISTED...)" },
        { text: "coverNote        String?" },
        {
          isHighlight: true,
          boxHeight: 125,
          highlightTitle: "IMMUTABLE RESUME SNAPSHOT FIELDS (Preserved Even If Profile Is Updated):",
          highlightFields: [
            "resumeId         String?            @db.ObjectId (Active resume ID at apply time)",
            "resumeFilename   String?            (Exact original filename: \"Candidate_CV.pdf\")",
            "resumeFileSize   Int?               (Exact byte length: 1,420,512 bytes)",
            "resumeFileType   String?            (MIME type: \"application/pdf\")"
          ]
        },
        { text: "resumeUrl        String?            (\"/api/recruiter/applications/:id/resume\")" },
        { text: "createdAt        DateTime           @default(now())" }
      ],
      indexConstraint: "CONSTRAINT: @@unique([candidateId, jobId]) — Guarantees atomic candidate submission uniqueness"
    },
    {
      modelTitle: "model Booking & MentorshipSession",
      height: 380,
      fields: [
        { text: "id               String             @id @default(auto()) @map(\"_id\") @db.ObjectId" },
        { text: "candidateId      String             @db.ObjectId (Candidate user reference)" },
        { text: "mentorId         String             @db.ObjectId (Mentor user reference)" },
        { text: "serviceId        String             @db.ObjectId (MentorService reference)" },
        { text: "startTime        DateTime           (UTC session start)" },
        { text: "endTime          DateTime           (UTC session end: startTime + duration)" },
        { text: "status           BookingStatus      @default(CONFIRMED)" },
        { text: "priceCents       Int                (Immutable fee snapshot at booking time)" },
        { text: "rescheduleReason String?" },
        { text: "proposedStartTime DateTime?         (Populated during RESCHEDULE_REQUESTED)" }
      ],
      indexConstraint: "INDEX: @@index([mentorId, startTime]) — Accelerates conflict detection queries"
    }
  ],
  stateAnalysis: {
    badge: "STATE MACHINE",
    title: "Booking State Transitions & Lifecycle Guards",
    height: 250,
    items: [
      { label: "Created (CONFIRMED)", text: "Slot validated, price snapshotted, candidate & mentor notified via ZeptoMail." },
      { label: "Reschedule Request", text: "Candidate proposes new slot -> status moves to RESCHEDULE_REQUESTED." },
      { label: "Mentor Decision", text: "Mentor accepts -> status returns to CONFIRMED with new startTime; Mentor declines -> reverts." },
      { label: "Session Delivery", text: "Session completed by mentor -> status COMPLETED -> opens Candidate Review prompt." }
    ]
  },
  securityItems: {
    title: "Authentication, Cookies & Multi-Tenant Isolation",
    height: 260,
    details: [
      { label: "Cookie Lifecycle", text: "career_session cookie issued with httpOnly: true, secure: true, sameSite: 'lax'." },
      { label: "Payload Protection", text: "Signed JWT containing { userId, role: 'CANDIDATE', email, exp: 7d }." },
      { label: "Tenant Scoping", text: "All candidate routes strictly scoped with where: { candidateId: auth.userId }; cross-user access impossible.", bold: true },
      { label: "CSRF & Header Guards", text: "Next.js server actions validate origin; mutation endpoints verify Content-Type: application/json." }
    ]
  },
  externalIntegrations: {
    title: "External Integrations & Document Services",
    height: 240,
    details: [
      { service: "ZeptoMail REST API", action: "Transactional email delivery for applications, bookings & reschedule alerts." },
      { service: "Gotenberg Engine", action: "Docker microservice at /forms/chromium/convert/html for pixel-perfect PDF rendering." },
      { service: "Local Storage Provider", action: "StorageFactory writes uploaded CVs to isolated local disk directory with hash names." }
    ]
  },
  gapsAndMocks: {
    title: "VERIFIED CODEBASE GAPS, MOCKS & UNCONNECTED FLOWS",
    height: 380,
    items: [
      {
        severity: "HIGH",
        code: "G-01",
        title: "Mock Password Reset Endpoint",
        description: "frontend/app/reset-password page exists with full form UI, but has no real email reset token backend integration; submitting the form triggers no database update or ZeptoMail token.",
        location: "frontend/app/reset-password/page.tsx (Missing backend handler POST /api/auth/reset-password)"
      },
      {
        severity: "MEDIUM",
        code: "G-02",
        title: "Client-Only Career Path State",
        description: "/my-path interactive career pathway wizard stores progress strictly in browser localStorage; no backend Prisma model or API route persists candidate milestones to MongoDB.",
        location: "frontend/app/my-path/page.tsx (Relies on window.localStorage)"
      },
      {
        severity: "MEDIUM",
        code: "G-03",
        title: "Static Chat Messaging Mock",
        description: "/messages route displays hardcoded UI conversations; no live Socket.io or WebSockets backend gateway connects candidates with mentors in real time.",
        location: "frontend/app/messages/page.tsx (Mock conversation state array)"
      }
    ]
  }
};
