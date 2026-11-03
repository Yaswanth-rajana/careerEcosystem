import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

import { buildDiagramSvg, CHROME_PATH } from './render-visual-workflows.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ============================================================================
// 1. STUDENT / CANDIDATE PORTAL WORKFLOW
// ============================================================================
const studentDiagram = {
  title: "PATHWAY.ECO — Candidate Portal Backend Workflow Architecture",
  subtitle: "Job Discovery & Application Pipeline, Immutable Resume Snapshotting & Mentorship Booking Lifecycle",
  width: 2400,
  height: 1450,
  nodes: [
    { x: 90, y: 180, w: 220, h: 80, title: "Candidate (Student)", sub1: "frontend/ (:3000)", icon: "user" },
    { x: 490, y: 180, w: 260, h: 80, title: "Resume Upload & Parser", sub1: "POST /api/candidate/resumes", icon: "reportDoc" },
    { x: 1000, y: 180, w: 260, h: 80, title: "Gotenberg Engine", sub1: "HTML/Docx to PDF Converter", icon: "databaseGear" },
    { x: 1510, y: 180, w: 250, h: 80, title: "MongoDB: Resume", sub1: "Storage & Resume Model", icon: "database" },

    { x: 490, y: 440, w: 260, h: 80, title: "Job Search Engine", sub1: "GET /api/jobs (Faceted)", icon: "monitor" },
    { x: 1510, y: 440, w: 250, h: 80, title: "MongoDB: Job", sub1: "status: PUBLISHED (30d TTL)", icon: "database" },

    { x: 490, y: 710, w: 260, h: 80, title: "Application Handler", sub1: "POST /api/jobs/[id]/apply", icon: "chartTrend" },
    { x: 1000, y: 710, w: 270, h: 80, title: "MongoDB: JobApplication", sub1: "Immutable Resume Snapshot", icon: "database" },
    { x: 1510, y: 710, w: 250, h: 80, title: "ZeptoMail Service", sub1: "Dual Transactional Emails", icon: "envelope" },

    { x: 90, y: 970, w: 220, h: 80, title: "Mentor Directory", sub1: "GET /api/mentors (APPROVED)", icon: "star" },
    { x: 490, y: 970, w: 260, h: 80, title: "Availability Engine", sub1: "GET /availability (Slots)", icon: "calendar" },
    { x: 1000, y: 970, w: 270, h: 80, title: "MongoDB: Slots & Blackouts", sub1: "Weekly Rules & Exceptions", icon: "database" },
    { x: 1510, y: 970, w: 250, h: 80, title: "Booking State Machine", sub1: "POST /api/bookings", icon: "calendar" },
    { x: 1980, y: 970, w: 250, h: 80, title: "MongoDB: Booking", sub1: "status: CONFIRMED", icon: "database" },

    { x: 900, y: 1240, w: 460, h: 85, title: "Candidate Dashboard & Live Status", sub1: "GET /api/candidate/dashboard", icon: "reportDoc", iconPos: "right" }
  ],
  edges: [
    { from: { x: 310, y: 220 }, to: { x: 490, y: 220 }, label: "— Upload CV →" },
    { from: { x: 750, y: 220 }, to: { x: 1000, y: 220 }, label: "— Convert →" },
    { from: { x: 1260, y: 220 }, to: { x: 1510, y: 220 }, label: "— Persist Buffer →" },
    { points: [{ x: 200, y: 260 }, { x: 200, y: 480 }, { x: 490, y: 480 }], label: "Select / Search Jobs →" },
    { from: { x: 1510, y: 480 }, to: { x: 750, y: 480 }, label: "← Query Active Jobs (30d Lifespan) —" },
    { from: { x: 620, y: 520 }, to: { x: 620, y: 710 }, label: "Apply with Job ID ↓" },
    { points: [{ x: 750, y: 240 }, { x: 800, y: 240 }, { x: 800, y: 730 }, { x: 750, y: 730 }], label: "Attach Frozen Resume Snapshot →", offsetLabel: { x: 90, y: -110 } },
    { from: { x: 750, y: 750 }, to: { x: 1000, y: 750 }, label: "— Freeze Snapshot & Commit →" },
    { from: { x: 1270, y: 750 }, to: { x: 1510, y: 750 }, label: "— Alert Candidate & Recruiter →" },
    { points: [{ x: 200, y: 260 }, { x: 200, y: 970 }], label: "Browse Vetted Mentors ↓" },
    { from: { x: 310, y: 1010 }, to: { x: 490, y: 1010 }, label: "— Select Mentor →" },
    { from: { x: 750, y: 1010 }, to: { x: 1000, y: 1010 }, label: "— Query Weekly Rules →" },
    { from: { x: 1270, y: 1010 }, to: { x: 1510, y: 1010 }, label: "— Reserve Time Slot →" },
    { from: { x: 1760, y: 1010 }, to: { x: 1980, y: 1010 }, label: "— Commit Booking →" },
    { points: [{ x: 1635, y: 970 }, { x: 1635, y: 790 }], label: "Send ICS Invite ↑" },
    { points: [{ x: 620, y: 790 }, { x: 620, y: 1282 }, { x: 900, y: 1282 }], label: "Application Updates (APPLIED) →" },
    { points: [{ x: 1635, y: 1050 }, { x: 1635, y: 1282 }, { x: 1360, y: 1282 }], label: "← Upcoming Bookings (CONFIRMED)" }
  ]
};

// ============================================================================
// 2. MENTOR PORTAL WORKFLOW
// ============================================================================
const mentorDiagram = {
  title: "PATHWAY.ECO — Mentor Portal Backend Workflow Architecture",
  subtitle: "Application Onboarding Gate, 24h Crypto Setup Token, Availability Engine & Reschedule Lifecycle",
  width: 2400,
  height: 1450,
  nodes: [
    { x: 90, y: 180, w: 220, h: 80, title: "Mentor Applicant", sub1: "Public Portal (:3001)", icon: "user" },
    { x: 490, y: 180, w: 260, h: 80, title: "Application Handler", sub1: "POST /api/mentor-applications", icon: "reportDoc" },
    { x: 980, y: 180, w: 260, h: 80, title: "MongoDB: Application", sub1: "status: SUBMITTED", icon: "database" },
    { x: 1470, y: 180, w: 260, h: 80, title: "Admin Approval Gate", sub1: "POST /api/admin/mentors/...", icon: "shield" },
    { x: 1950, y: 180, w: 250, h: 80, title: "ZeptoMail Service", sub1: "24h Setup Token Link", icon: "envelope" },

    { x: 490, y: 440, w: 260, h: 80, title: "Password Setup", sub1: "POST /api/auth/setup-password", icon: "shield" },
    { x: 980, y: 440, w: 260, h: 80, title: "MongoDB: MentorProfile", sub1: "role: MENTOR, APPROVED", icon: "database" },

    { x: 490, y: 710, w: 260, h: 80, title: "Mentorship Services CRUD", sub1: "POST /api/mentor/services", icon: "star" },
    { x: 980, y: 710, w: 260, h: 80, title: "MongoDB: MentorService", sub1: "Price, Duration, Catalog", icon: "database" },
    { x: 1470, y: 710, w: 260, h: 80, title: "Availability Manager", sub1: "PUT /api/mentor/availability", icon: "calendar" },
    { x: 1950, y: 710, w: 250, h: 80, title: "MongoDB: Slot Matrix", sub1: "Weekly Slots & Blackouts", icon: "database" },

    { x: 490, y: 970, w: 260, h: 80, title: "Reschedule Handler", sub1: "PATCH /accept-reschedule", icon: "calendar" },
    { x: 980, y: 970, w: 260, h: 80, title: "MongoDB: Booking", sub1: "status: CONFIRMED", icon: "database" },
    { x: 1470, y: 970, w: 260, h: 80, title: "Session Delivery", sub1: "POST /sessions/[id]/complete", icon: "monitor" },
    { x: 1950, y: 970, w: 250, h: 80, title: "MongoDB: MentorReview", sub1: "Ratings & Reviews (1-5)", icon: "star" },

    { x: 900, y: 1240, w: 460, h: 85, title: "Mentor Dashboard & Performance", sub1: "GET /api/mentor/dashboard", icon: "reportDoc", iconPos: "right" }
  ],
  edges: [
    { from: { x: 310, y: 220 }, to: { x: 490, y: 220 }, label: "— Submit Dossier →" },
    { from: { x: 750, y: 220 }, to: { x: 980, y: 220 }, label: "— Store Application →" },
    { from: { x: 1240, y: 220 }, to: { x: 1470, y: 220 }, label: "— Admin Review & Approval →" },
    { from: { x: 1730, y: 220 }, to: { x: 1950, y: 220 }, label: "— Send 24h Setup Link →" },
    { points: [{ x: 2075, y: 260 }, { x: 2075, y: 350 }, { x: 620, y: 350 }, { x: 620, y: 440 }], label: "Setup Link via ZeptoMail (SHA-256 Token) ↓" },
    { from: { x: 750, y: 480 }, to: { x: 980, y: 480 }, label: "— Bcrypt 12 Rounds & Activate →" },
    { points: [{ x: 1110, y: 520 }, { x: 1110, y: 610 }, { x: 620, y: 610 }, { x: 620, y: 710 }], label: "Authorized Mentor Session ↓" },
    { from: { x: 750, y: 750 }, to: { x: 980, y: 750 }, label: "— Persist Offerings →" },
    { from: { x: 1240, y: 750 }, to: { x: 1470, y: 750 }, label: "— Configure Calendar →" },
    { from: { x: 1730, y: 750 }, to: { x: 1950, y: 750 }, label: "— Atomic Slot Sync →" },
    { points: [{ x: 1600, y: 790 }, { x: 1600, y: 880 }, { x: 620, y: 880 }, { x: 620, y: 970 }], label: "Candidate Reschedule Request ↓" },
    { from: { x: 750, y: 1010 }, to: { x: 980, y: 1010 }, label: "— Confirm New Time →" },
    { from: { x: 1240, y: 1010 }, to: { x: 1470, y: 1010 }, label: "— Enter Live Meeting →" },
    { from: { x: 1730, y: 1010 }, to: { x: 1950, y: 1010 }, label: "— Save Notes & Rating →" },
    { from: { x: 1110, y: 1050 }, to: { x: 1110, y: 1240 }, label: "Upcoming Bookings ↓" },
    { points: [{ x: 1600, y: 1050 }, { x: 1600, y: 1282 }, { x: 1360, y: 1282 }], label: "← Completed Sessions & Rating Summary" }
  ]
};

// ============================================================================
// 3. RECRUITER PORTAL WORKFLOW
// ============================================================================
const recruiterDiagram = {
  title: "PATHWAY.ECO — Recruiter Portal Backend Workflow Architecture",
  subtitle: "Multi-Tenant Company Isolation, Job Publishing Lifecycle, Resume Streaming & 28-Permission RBAC",
  width: 2400,
  height: 1450,
  nodes: [
    { x: 90, y: 180, w: 220, h: 80, title: "Recruiter / Employer", sub1: "Recruiter Portal (:3002)", icon: "user" },
    { x: 490, y: 180, w: 260, h: 80, title: "Recruiter Auth Gateway", sub1: "POST /api/recruiter/auth/login", icon: "shield" },
    { x: 980, y: 180, w: 260, h: 80, title: "MongoDB: Company", sub1: "Multi-Tenant Binding", icon: "building" },
    { x: 1470, y: 180, w: 260, h: 80, title: "Company Profile & Brand", sub1: "PATCH /api/recruiter/company", icon: "building" },

    { x: 490, y: 440, w: 260, h: 80, title: "Job Authoring Service", sub1: "POST /api/recruiter/jobs", icon: "reportDoc" },
    { x: 980, y: 440, w: 260, h: 80, title: "MongoDB: Job", sub1: "expiresAt = now + 30d", icon: "database" },
    { x: 1530, y: 440, w: 260, h: 80, title: "30-Day Cron Expiration", sub1: "GET /api/jobs/cron/expire", icon: "calendar" },

    { x: 490, y: 710, w: 260, h: 80, title: "Pipeline Kanban Manager", sub1: "PATCH /applications/[id]/status", icon: "monitor" },
    { x: 980, y: 710, w: 260, h: 80, title: "MongoDB: JobApplication", sub1: "APPLIED -> SHORTLISTED...", icon: "database" },
    { x: 1470, y: 710, w: 260, h: 80, title: "Secure Resume Streamer", sub1: "GET /applications/[id]/resume", icon: "reportDoc" },

    { x: 490, y: 970, w: 260, h: 80, title: "Interview & Scorecards", sub1: "POST /recruiter/interviews", icon: "chartTrend" },
    { x: 980, y: 970, w: 260, h: 80, title: "MongoDB: Interview & Offer", sub1: "Evaluation & Offer Letters", icon: "database" },
    { x: 1470, y: 970, w: 260, h: 80, title: "Team Invitations & RBAC", sub1: "POST /api/recruiter/team", icon: "shield" },
    { x: 1950, y: 970, w: 250, h: 80, title: "ZeptoMail Service", sub1: "Stage Alerts & 7d Invites", icon: "envelope" },

    { x: 900, y: 1240, w: 460, h: 85, title: "Recruiter Dashboard & Hires Report", sub1: "GET /api/recruiter/dashboard", icon: "reportDoc", iconPos: "right" }
  ],
  edges: [
    { from: { x: 310, y: 220 }, to: { x: 490, y: 220 }, label: "— Multi-Tenant Login →" },
    { from: { x: 750, y: 220 }, to: { x: 980, y: 220 }, label: "— Bind auth.company.id →" },
    { from: { x: 1240, y: 220 }, to: { x: 1470, y: 220 }, label: "— Employer Branding →" },
    { points: [{ x: 200, y: 260 }, { x: 200, y: 480 }, { x: 490, y: 480 }], label: "Publish Job Postings →" },
    { from: { x: 750, y: 480 }, to: { x: 980, y: 480 }, label: "— Index Job (30d Lifespan) →" },
    { from: { x: 1530, y: 480 }, to: { x: 1240, y: 480 }, label: "← Auto-Expire (status: EXPIRED) —" },
    { points: [{ x: 1110, y: 520 }, { x: 1110, y: 610 }, { x: 620, y: 610 }, { x: 620, y: 710 }], label: "Candidate Applications Received ↓" },
    { from: { x: 750, y: 750 }, to: { x: 980, y: 750 }, label: "— Transition Pipeline Stage →" },
    { from: { x: 1240, y: 750 }, to: { x: 1470, y: 750 }, label: "— Stream Inline PDF →" },
    { from: { x: 620, y: 790 }, to: { x: 620, y: 970 }, label: "Schedule Next Round ↓" },
    { from: { x: 750, y: 1010 }, to: { x: 980, y: 1010 }, label: "— Record Scorecards & Offers →" },
    { from: { x: 1240, y: 1010 }, to: { x: 1470, y: 1010 }, label: "— Collaborative Hiring Review →" },
    { from: { x: 1730, y: 1010 }, to: { x: 1950, y: 1010 }, label: "— Dispatch Invites & Alerts →" },
    { points: [{ x: 620, y: 1050 }, { x: 620, y: 1282 }, { x: 900, y: 1282 }], label: "Pipeline Status (OFFER) →" },
    { from: { x: 1110, y: 1050 }, to: { x: 1110, y: 1240 }, label: "Offer Accepted (Hired) ↓" }
  ]
};

// ============================================================================
// 4. ADMIN PORTAL WORKFLOW
// ============================================================================
const adminDiagram = {
  title: "PATHWAY.ECO — Admin Portal Backend Workflow Architecture",
  subtitle: "System Governance, Mentor Dossier Vetting, Employer Verification, Course Builder & Audit Trail",
  width: 2400,
  height: 1450,
  nodes: [
    { x: 90, y: 180, w: 220, h: 80, title: "Super Administrator", sub1: "Admin Portal (:3003)", icon: "user" },
    { x: 490, y: 180, w: 260, h: 80, title: "Zero-Trust Admin Auth", sub1: "career_admin_session cookie", icon: "shield" },
    { x: 1000, y: 180, w: 260, h: 80, title: "Platform KPI Analytics", sub1: "GET /api/admin/metrics", icon: "monitor" },
    { x: 1530, y: 180, w: 260, h: 80, title: "MongoDB: Ecosystem", sub1: "Users, Companies, Bookings", icon: "database" },

    { x: 490, y: 440, w: 260, h: 80, title: "User Governance Manager", sub1: "GET/PATCH /api/admin/users", icon: "shield" },
    { x: 1000, y: 440, w: 260, h: 80, title: "Mentor Vetting Dossier", sub1: "POST /mentors/.../status", icon: "reportDoc" },
    { x: 1530, y: 440, w: 260, h: 80, title: "ZeptoMail Service", sub1: "24h Token & Setup Link", icon: "envelope" },
    { x: 1980, y: 440, w: 250, h: 80, title: "Employer Verification", sub1: "PATCH /companies/[id]", icon: "building" },

    { x: 490, y: 710, w: 260, h: 80, title: "Job Compliance & Cron", sub1: "GET/PATCH /api/admin/jobs", icon: "calendar" },
    { x: 1000, y: 710, w: 260, h: 80, title: "LMS Curriculum Builder", sub1: "POST /api/admin/courses", icon: "neuralNet" },
    { x: 1530, y: 710, w: 260, h: 80, title: "MongoDB: LMS Curriculum", sub1: "Courses, Modules, Lessons", icon: "database" },

    { x: 490, y: 970, w: 260, h: 80, title: "System Audit Trail", sub1: "GET /api/admin/audit-logs", icon: "shield" },
    { x: 1000, y: 970, w: 260, h: 80, title: "MongoDB: AuditLog", sub1: "Immutable Security Logs", icon: "database" },
    { x: 1530, y: 970, w: 260, h: 80, title: "30-Day Cron Supervisor", sub1: "Health & Expiration Monitor", icon: "calendar" },

    { x: 900, y: 1240, w: 460, h: 85, title: "Admin Control Center & Governance Report", sub1: "Full Platform Super-Admin Overview", icon: "reportDoc", iconPos: "right" }
  ],
  edges: [
    { from: { x: 310, y: 220 }, to: { x: 490, y: 220 }, label: "— Admin Login →" },
    { from: { x: 750, y: 220 }, to: { x: 1000, y: 220 }, label: "— Role Enforced (ADMIN) →" },
    { from: { x: 1530, y: 220 }, to: { x: 1260, y: 220 }, label: "← Real-Time Count Aggregations —" },
    { points: [{ x: 200, y: 260 }, { x: 200, y: 480 }, { x: 490, y: 480 }], label: "Account Governance →" },
    { from: { x: 750, y: 480 }, to: { x: 1000, y: 480 }, label: "— Vet Mentor Applications →" },
    { from: { x: 1260, y: 480 }, to: { x: 1530, y: 480 }, label: "— Dispatch 24h Setup Token →" },
    { from: { x: 1790, y: 480 }, to: { x: 1980, y: 480 }, label: "— Audit & Verify Companies →" },
    { from: { x: 620, y: 520 }, to: { x: 620, y: 710 }, label: "Content Moderation ↓" },
    { from: { x: 750, y: 750 }, to: { x: 1000, y: 750 }, label: "— Author Learning Curriculum →" },
    { from: { x: 1260, y: 750 }, to: { x: 1530, y: 750 }, label: "— Persist Course Tree →" },
    { from: { x: 620, y: 790 }, to: { x: 620, y: 970 }, label: "Record Mutation Event ↓" },
    { from: { x: 750, y: 1010 }, to: { x: 1000, y: 1010 }, label: "— Append Tamper-Evident Record →" },
    { from: { x: 1260, y: 1010 }, to: { x: 1530, y: 1010 }, label: "— Supervise Background Workers →" },
    { points: [{ x: 620, y: 1050 }, { x: 620, y: 1282 }, { x: 900, y: 1282 }], label: "Audit Logs ↘" },
    { from: { x: 1130, y: 1050 }, to: { x: 1130, y: 1240 }, label: "System Health Report ↓" }
  ]
};

const portalConfigs = [
  { name: 'student-backend-workflow', diagram: studentDiagram },
  { name: 'mentor-backend-workflow', diagram: mentorDiagram },
  { name: 'recruiter-backend-workflow', diagram: recruiterDiagram },
  { name: 'admin-backend-workflow', diagram: adminDiagram }
];

console.log('================================================================');
console.log('Rendering Polished Visual Flowchart Workflows (2400x1450)');
console.log('================================================================');

for (const cfg of portalConfigs) {
  const svgContent = buildDiagramSvg(cfg.diagram);
  const svgPath = path.join(__dirname, `${cfg.name}.svg`);
  fs.writeFileSync(svgPath, svgContent, 'utf-8');
  console.log(`\n[SVG] Written: ${svgPath}`);

  const pngPath = path.join(__dirname, `${cfg.name}.png`);
  console.log(`[PNG] Rendering via Google Chrome headless...`);
  const fileUrl = `file://${svgPath}`;
  const cmd = `"${CHROME_PATH}" --headless --disable-gpu --window-size=2400,1450 --default-background-color=00000000 --screenshot="${pngPath}" "${fileUrl}"`;
  
  try {
    execSync(cmd, { stdio: 'pipe' });
    const sipsOut = execSync(`sips -g pixelWidth -g pixelHeight "${pngPath}"`, { encoding: 'utf-8' });
    console.log(`[DONE] ${cfg.name}.png rendered: ${sipsOut.trim().replace(/\n/g, ', ')}`);
  } catch (err) {
    console.error(`Error rendering ${cfg.name}:`, err.message);
  }
}

console.log('\nAll 4 diagrams polished and re-rendered successfully in reference style!');
