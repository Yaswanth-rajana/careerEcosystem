export const mentorWorkflowData = {
  title: "Mentor Portal — End-to-End Backend Workflow Architecture",
  subtitle: "Onboarding Gate, 24h Setup Token, Availability Engine, Service Catalog & Reschedule Lifecycle",
  themeName: "TEAL",
  theme: {
    primary: "#0D9488",
    dark: "#115E59",
    light: "#99F6E4",
    badgeBg: "#F0FDFA",
    border: "#99F6E4"
  },
  portBadge: "PORTAL: MENTOR (:3001)",
  verifiedBadge: "VERIFIED: 15 PAGES / 18 ROUTES",
  pipelineTitle: "EXECUTION PIPELINE: 8 SEQUENTIAL PHASES FROM APPLICATION TO LIVE SESSIONS",
  pipelineSubtitle: "STRICT STEP ORDER & ACTOR RESPONSIBILITIES",
  pipelineSteps: [
    {
      stepNum: "2.1",
      title: "Public Vetting Gate",
      actorBadge: "APPLICANT",
      actorPort: "Public Portal (:3001)",
      bullets: [
        {
          header: "Application Submission",
          sublines: [
            { text: "POST /api/mentor-applications", color: "#0D9488", bold: true },
            { text: "Bio, LinkedIn, experience years" }
          ]
        },
        {
          header: "Pending Status Set",
          sublines: [
            { text: "MentorApplication status: SUBMITTED", color: "#D97706", bold: true },
            { text: "Queued for admin dossier review" }
          ]
        },
        {
          header: "Acknowledgment Alert",
          sublines: [
            { text: "ZeptoMail sends applicant reference ID" }
          ]
        }
      ],
      outcomeTitle: "PRIMARY OUTCOME:",
      outcomeDesc: [
        "Application recorded in MongoDB",
        "Awaiting Administrator manual vetting"
      ]
    },
    {
      stepNum: "2.2",
      title: "Admin Approval Dossier",
      actorBadge: "ADMIN",
      actorPort: "Admin Portal (:3003)",
      bullets: [
        {
          header: "Dossier Evaluation",
          sublines: [
            { text: "POST /api/admin/mentors/.../status", color: "#4338CA", bold: true },
            { text: "Admin sets status to APPROVED" }
          ]
        },
        {
          header: "Identity Elevation",
          sublines: [
            { text: "Elevates User role to MENTOR", color: "#059669", bold: true },
            { text: "Creates MentorProfile record" }
          ]
        },
        {
          header: "24h Crypto Token Created",
          sublines: [
            { text: "32-byte crypto token hashed with SHA-256" }
          ]
        }
      ],
      outcomeTitle: "PRIMARY OUTCOME:",
      outcomeDesc: [
        "Cryptographic activation link generated",
        "Sent via ZeptoMail to mentor's email"
      ]
    },
    {
      stepNum: "2.3",
      title: "Password Setup & Hash",
      actorBadge: "MENTOR",
      actorPort: "Activation Portal (:3001)",
      bullets: [
        {
          header: "Activation Link Access",
          sublines: [
            { text: "/setup-password?token=...", color: "#0D9488", bold: true },
            { text: "Token validated against SHA-256 hash" }
          ]
        },
        {
          header: "Password Hash & Salt",
          sublines: [
            { text: "POST /api/auth/setup-password", color: "#0D9488" },
            { text: "Bcrypt 12 rounds; consumes token" }
          ]
        },
        {
          header: "Account Activation",
          sublines: [
            { text: "MentorProfile status: APPROVED" }
          ]
        }
      ],
      outcomeTitle: "PRIMARY OUTCOME:",
      outcomeDesc: [
        "Setup token permanently invalidated",
        "Mentor profile activated for candidate bookings"
      ]
    },
    {
      stepNum: "2.4",
      title: "Auth & Approval Guard",
      actorBadge: "SECURITY",
      actorPort: "MentorServerAuth (:3001)",
      bullets: [
        {
          header: "Mentor Login",
          sublines: [
            { text: "POST /api/auth/login", color: "#0D9488", bold: true },
            { text: "Issues career_mentor_session cookie" }
          ]
        },
        {
          header: "Approval Gate Enforced",
          sublines: [
            { text: "Checks mentorProfile.status === 'APPROVED'", color: "#059669", bold: true },
            { text: "Pending accounts blocked from portal" }
          ]
        },
        {
          header: "Dashboard Access",
          sublines: [
            { text: "Redirects to /dashboard on success" }
          ]
        }
      ],
      outcomeTitle: "PRIMARY OUTCOME:",
      outcomeDesc: [
        "Secure mentor session initiated",
        "Tenant context bound to mentor user ID"
      ]
    },
    {
      stepNum: "2.5",
      title: "Mentorship Services CRUD",
      actorBadge: "MENTOR",
      actorPort: "Mentor Portal (:3001)",
      bullets: [
        {
          header: "Service Catalog Setup",
          sublines: [
            { text: "POST /api/mentor/services", color: "#0D9488", bold: true },
            { text: "MentorServiceSchema.parse(body)" }
          ]
        },
        {
          header: "Offering Parameters",
          sublines: [
            { text: "• Title: (e.g. '1:1 Mock Interview')" },
            { text: "• Duration: 30, 45, or 60 minutes" },
            { text: "• Price in cents (e.g. 5000 = $50)" }
          ]
        },
        {
          header: "Catalog Toggle",
          sublines: [
            { text: "PATCH /api/mentor/services/[id] (isActive)" }
          ]
        }
      ],
      outcomeTitle: "PRIMARY OUTCOME:",
      outcomeDesc: [
        "Services published to public candidate catalog",
        "Enables dynamic booking duration calculations"
      ]
    },
    {
      stepNum: "2.6",
      title: "Availability Rules & Blackout",
      actorBadge: "CALENDAR",
      actorPort: "AvailabilityService (:3001)",
      bullets: [
        {
          header: "Weekly Recurring Slots",
          sublines: [
            { text: "PUT /api/mentor/availability", color: "#0D9488", bold: true },
            { text: "Slots: dayOfWeek (0-6), startTime, endTime" }
          ]
        },
        {
          header: "Blackout Date Overrides",
          sublines: [
            { text: "POST /api/mentor/availability/blackout", color: "#E11D48", bold: true },
            { text: "Overrides recurring slots for holidays/vacation" }
          ]
        },
        {
          header: "Atomic Slot Sync",
          sublines: [
            { text: "Prisma transaction replaces weekly rules" }
          ]
        }
      ],
      outcomeTitle: "PRIMARY OUTCOME:",
      outcomeDesc: [
        "Availability matrix synchronized in MongoDB",
        "Directly drives candidate booking calendar"
      ]
    },
    {
      stepNum: "2.7",
      title: "Reschedule Approvals",
      actorBadge: "MENTOR",
      actorPort: "BookingService (:3001)",
      bullets: [
        {
          header: "Incoming Reschedule",
          sublines: [
            { text: "GET /api/mentor/bookings", color: "#0D9488", bold: true },
            { text: "Flags status: RESCHEDULE_REQUESTED" }
          ]
        },
        {
          header: "Approval Decision",
          sublines: [
            { text: "PATCH /api/mentor/bookings/[id]/accept-reschedule", color: "#059669", bold: true },
            { text: "Sets startTime = proposedStartTime" }
          ]
        },
        {
          header: "Decline Fallback",
          sublines: [
            { text: "decline-reschedule restores original time" }
          ]
        }
      ],
      outcomeTitle: "PRIMARY OUTCOME:",
      outcomeDesc: [
        "Booking returned to status CONFIRMED",
        "ZeptoMail updates candidate calendar invite"
      ]
    },
    {
      stepNum: "2.8",
      title: "Live Session & Completion",
      actorBadge: "DELIVERY",
      actorPort: "SessionService (:3001)",
      bullets: [
        {
          header: "Session Room Entry",
          sublines: [
            { text: "GET /api/mentor/sessions/[id]", color: "#0D9488", bold: true },
            { text: "Opens meeting room with candidate" }
          ]
        },
        {
          header: "Session Conclusion",
          sublines: [
            { text: "POST /api/mentor/sessions/[id]/complete", color: "#059669", bold: true },
            { text: "Status -> COMPLETED; saves mentor notes" }
          ]
        },
        {
          header: "Review Dispatch",
          sublines: [
            { text: "Triggers candidate MentorReview prompt" }
          ]
        }
      ],
      outcomeTitle: "PRIMARY OUTCOME:",
      outcomeDesc: [
        "Mentorship session marked completed",
        "Mentor average rating & reviews updated"
      ]
    }
  ],
  apiHandlers: [
    {
      method: "POST",
      methodColor: "#0D9488",
      path: "/api/auth/setup-password (Cryptographic Mentor Activation)",
      height: 250,
      details: [
        { title: "Public Guard", value: "Validates 32-byte crypto token against SHA-256 hash in User.setupToken", valColor: "#0D9488" },
        { title: "Zod Schema", value: "SetupPasswordSchema.parse(body)", valColor: "#059669", subtext: "Payload: { token: string, password: string (min 8 chars, 1 uppercase, 1 symbol) }" },
        { title: "Security Operation", value: "Bcrypt hash (12 rounds); clears setupToken and setupTokenExpiresAt", bold: true },
        { title: "Activation Action", value: "Elevates User.role to 'MENTOR' and updates MentorProfile.status to 'APPROVED'", valColor: "#0D9488" }
      ]
    },
    {
      method: "PUT",
      methodColor: "#0D9488",
      path: "/api/mentor/availability (Recurring Weekly Slot Matrix)",
      height: 250,
      details: [
        { title: "Auth Guard", value: "career_mentor_session cookie -> verified mentor User.id", valColor: "#0D9488" },
        { title: "Zod Schema", value: "MentorAvailabilityUpdateSchema.parse(body)", valColor: "#059669", subtext: "Payload: { slots: Array<{ dayOfWeek: 0..6, startTime: 'HH:mm', endTime: 'HH:mm' }>, timezone: string }" },
        { title: "Transaction Safety", value: "Prisma transaction atomically deletes previous slots and inserts new slot records", bold: true },
        { title: "Conflict Guard", value: "Validates startTime < endTime and checks for intra-day overlapping time ranges", valColor: "#0D9488" }
      ]
    },
    {
      method: "PATCH",
      methodColor: "#059669",
      path: "/api/mentor/bookings/[id]/accept-reschedule (Reschedule Resolution)",
      height: 250,
      details: [
        { title: "Auth Guard", value: "career_mentor_session cookie; enforces booking.mentorId === auth.mentorId", valColor: "#0D9488" },
        { title: "State Pre-condition", value: "Requires booking.status === 'RESCHEDULE_REQUESTED' and non-null proposedStartTime", bold: true },
        { title: "State Transition", value: "Transitions status to 'CONFIRMED', sets startTime = proposedStartTime, clears proposedStartTime", valColor: "#059669" },
        { title: "Client Dispatch", value: "ZeptoMail delivers confirmed calendar modification alert to candidate inbox", valColor: "#0D9488" }
      ]
    }
  ],
  safetyRules: {
    title: "MENTOR PORTAL PRIVILEGE & SCHEDULING INTEGRITY RULES",
    height: 230,
    items: [
      { label: "Approval Gate Enforcement", text: "Unapproved applicants cannot access /dashboard; middleware halts pending accounts with 403." },
      { label: "Cryptographic Expiration", text: "Setup password tokens expire exactly 24 hours after admin approval; prevents token reuse." },
      { label: "Blackout Date Precedence", text: "Blackout date entries completely nullify recurring weekly slots during specified date intervals." },
      { label: "Reschedule Ownership Guard", text: "Only the assigned mentor can approve or decline a candidate's reschedule request." }
    ]
  },
  prismaModels: [
    {
      modelTitle: "model MentorProfile & MentorService",
      height: 480,
      fields: [
        { text: "id               String             @id @default(auto()) @map(\"_id\") @db.ObjectId" },
        { text: "userId           String             @unique @db.ObjectId (Linked User account)" },
        { text: "status           MentorStatus       @default(PENDING) (PENDING, APPROVED, REJECTED)" },
        { text: "headline         String?" },
        { text: "bio              String?" },
        { text: "expertise        String[]           (Indexed skills: [\"System Design\", \"React\"])" },
        { text: "hourlyRate       Int?               (Hourly base rate in cents)" },
        { text: "ratingAverage    Float              @default(5.0)" },
        { text: "totalReviews     Int                @default(0)" },
        {
          isHighlight: true,
          boxHeight: 110,
          highlightTitle: "RELATED MODEL: MentorService (Custom Offerings Catalog):",
          highlightFields: [
            "id               String             @id @default(auto()) @map(\"_id\") @db.ObjectId",
            "mentorId         String             @db.ObjectId (Foreign key -> MentorProfile.id)",
            "title            String             (\"1:1 Portfolio Review\", \"Mock Interview\")",
            "durationMinutes  Int                (30, 45, 60, 90 mins)",
            "priceCents       Int                (Immutable fee snapshot)",
            "isActive         Boolean            @default(true)"
          ]
        },
        { text: "createdAt        DateTime           @default(now())" }
      ],
      indexConstraint: "CONSTRAINT: @@unique([userId]) & @@index([status, ratingAverage]) — Drives candidate directory filters"
    },
    {
      modelTitle: "model MentorAvailabilitySlot & MentorBlackoutDate",
      height: 380,
      fields: [
        { text: "id               String             @id @default(auto()) @map(\"_id\") @db.ObjectId" },
        { text: "mentorId         String             @db.ObjectId (Foreign key -> MentorProfile.id)" },
        { text: "dayOfWeek        Int                (0 = Sunday, 1 = Monday, ... 6 = Saturday)" },
        { text: "startTime        String             (\"09:00\" in mentor timezone)" },
        { text: "endTime          String             (\"17:00\" in mentor timezone)" },
        { text: "timezone         String             @default(\"UTC\")" },
        {
          isHighlight: true,
          boxHeight: 90,
          highlightTitle: "RELATED MODEL: MentorBlackoutDate (Exception Calendar Overrides):",
          highlightFields: [
            "id               String             @id @default(auto()) @map(\"_id\") @db.ObjectId",
            "mentorId         String             @db.ObjectId",
            "startDate        DateTime           (Blackout interval begin)",
            "endDate          DateTime           (Blackout interval end)",
            "reason           String?            (\"Vacation\", \"Conference\")"
          ]
        }
      ],
      indexConstraint: "INDEX: @@index([mentorId, dayOfWeek]) — Powers instant slot generation queries"
    }
  ],
  stateAnalysis: {
    badge: "STATE MACHINE",
    title: "Mentor Onboarding & Session State Lifecycle",
    height: 250,
    items: [
      { label: "Application Gate", text: "Applicant submits form -> SUBMITTED -> Admin vets dossier -> APPROVED." },
      { label: "Cryptographic Setup", text: "24-hour SHA-256 token emailed -> Password chosen -> Role elevated to MENTOR." },
      { label: "Reschedule Request", text: "Candidate requests new date -> RESCHEDULE_REQUESTED -> Mentor accepts -> CONFIRMED." },
      { label: "Completion & Rating", text: "Mentor clicks Complete -> COMPLETED -> Triggers Candidate review submission prompt." }
    ]
  },
  securityItems: {
    title: "Authentication, Approval Verification & Security",
    height: 260,
    details: [
      { label: "Cookie Lifecycle", text: "career_mentor_session cookie with httpOnly: true, secure: true, sameSite: 'lax'." },
      { label: "Approval Verification", text: "Middleware asserts user.role === 'MENTOR' and mentorProfile.status === 'APPROVED'.", bold: true },
      { label: "Cryptographic Tokens", text: "Setup tokens generated with crypto.randomBytes(32); only SHA-256 hash stored in MongoDB." },
      { label: "Cross-Mentor Isolation", text: "All booking and service endpoints verify record.mentorId === auth.mentorId." }
    ]
  },
  externalIntegrations: {
    title: "External Integrations & Meeting Room Services",
    height: 240,
    details: [
      { service: "ZeptoMail REST API", action: "Delivers mentor onboarding setup token, booking confirmations, and reschedule alerts." },
      { service: "Meeting Room Dispatcher", action: "Generates secure meeting link injected into booking confirmation for live video call." },
      { service: "Calendar ICS Generator", action: "Builds RFC 5545 calendar invitations attached to confirmation emails." }
    ]
  },
  gapsAndMocks: {
    title: "VERIFIED CODEBASE GAPS, MOCKS & UNCONNECTED FLOWS",
    height: 380,
    items: [
      {
        severity: "HIGH",
        code: "G-04",
        title: "Mock Earnings Dashboard & Missing Payout Gateway",
        description: "mentor/app/earnings page displays simulated revenue charts and static balance cards; no Stripe Connect or Razorpay payout transfer API is connected in the backend.",
        location: "mentor/app/earnings/page.tsx (Missing payment processor integration)"
      },
      {
        severity: "MEDIUM",
        code: "G-05",
        title: "Static Video Meeting Links",
        description: "Session meeting URLs are generated as static strings without native WebRTC webhook tracking or Zoom/Google Meet API synchronization.",
        location: "backend/src/services/session.service.ts (Placeholder meeting URL generator)"
      },
      {
        severity: "HIGH",
        code: "G-06",
        title: "Missing Bank Account & Payout Schema",
        description: "No Prisma model exists to store mentor bank routing numbers, IBAN, or tax IDs for automated financial disbursements.",
        location: "backend/prisma/schema.prisma (No MentorPayout or BankAccount model)"
      }
    ]
  }
};
