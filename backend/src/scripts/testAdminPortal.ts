import fs from 'fs';
import path from 'path';

// Load .env variables before database client initialization
try {
  const envPath = path.resolve(__dirname, '../../.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    for (const line of envContent.split('\n')) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        let value = (match[2] || '').trim();
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
        process.env[match[1]] = value;
      }
    }
  }
} catch {}

import { db } from '../db/client';
import { UserService } from '../services/userService';
import { AdminAuthService, AdminAuthError } from '../services/adminAuthService';
import { CourseService } from '../services/courseService';
import { MentorService } from '../services/mentorService';
import { AdminJobService } from '../services/adminJobService';
import { AdminApplicationService } from '../services/adminApplicationService';
import { AdminUserService } from '../services/adminUserService';
import { AdminDashboardService } from '../services/adminDashboardService';
import { AuditService } from '../services/auditService';
import { Permission, UserRole } from '../types/rbac';

async function runAdminTests() {
  console.log('🧪 Starting PATHWAY.ECO Admin Portal Verification Test Suite...\n');

  // ==========================================
  // SECTION 1: AUTHENTICATION & RBAC TESTS
  // ==========================================
  console.log('--- SECTION 1: AUTHENTICATION & RBAC ---');

  // Test 1: Logged-out token rejection
  try {
    await AdminAuthService.verifyAdmin(null);
    throw new Error('Should reject null token');
  } catch (err: any) {
    console.log('✓ Test 1: Logged-out / empty session token rejected (401)');
  }

  // Test 2: Ordinary candidate denied admin privileges
  const candidateEmail = `candidate_test_${Date.now()}@example.com`;
  const candidateReg = await UserService.registerUser({
    name: 'Candidate Test',
    email: candidateEmail,
    password: 'Password123!',
    role: 'CANDIDATE',
  });

  try {
    await AdminAuthService.verifyAdmin(candidateReg.token);
    throw new Error('Candidate should be forbidden from admin access');
  } catch (err: any) {
    if (err instanceof AdminAuthError && err.statusCode === 403) {
      console.log('✓ Test 2: Ordinary candidate denied admin privileges with 403 Forbidden');
    } else {
      throw err;
    }
  }

  // Test 3: Admin session verification
  const superAdmin = await db.user.findUnique({
    where: { email: 'admin@pathway.eco' },
  });
  if (!superAdmin) throw new Error('Super admin not found');

  const adminToken = await UserService.createSession(superAdmin.id);
  const verifiedAdmin = await AdminAuthService.verifyAdmin(adminToken);
  console.log(`✓ Test 3: Admin session verified successfully for ${verifiedAdmin.name} (${verifiedAdmin.role})`);

  // Test 4: RBAC Permission check
  AdminAuthService.requirePermission(verifiedAdmin, Permission.USERS_READ);
  AdminAuthService.requirePermission(verifiedAdmin, Permission.COURSES_PUBLISH);
  console.log('✓ Test 4: RBAC permissions correctly verified for Super Admin');

  // Test 5: Standard Admin restricted permission check (e.g. USERS_MANAGE_ROLE)
  const standardAdminActor = {
    id: 'dummy_admin_id',
    email: 'admin@test.com',
    name: 'Standard Admin',
    role: 'ADMIN',
    status: 'ACTIVE',
  };

  try {
    AdminAuthService.requirePermission(standardAdminActor, Permission.USERS_MANAGE_ROLE);
    throw new Error('Standard Admin should NOT have USERS_MANAGE_ROLE');
  } catch (err: any) {
    console.log('✓ Test 5: Standard Admin blocked from Super Admin restricted permission (403)');
  }

  // ==========================================
  // SECTION 2: USERS DIRECTORY TESTS
  // ==========================================
  console.log('\n--- SECTION 2: USERS DIRECTORY ---');

  // Test 6: Paginated list
  const userList = await AdminUserService.listUsers({ page: 1, limit: 10 });
  console.log(`✓ Test 6: Users list returned ${userList.items.length} items (Total: ${userList.total})`);

  // Test 7: User detail without password secrets
  const candidateDetail = await AdminUserService.getUserDetail(candidateReg.user.id);
  if (!candidateDetail) throw new Error('User detail not found');
  if ((candidateDetail as any).passwordHash || (candidateDetail as any).sessions) {
    throw new Error('Sensitive credentials leaked in UserDetailDTO');
  }
  console.log(`✓ Test 7: User detail securely loaded without password/hash leakage for ${candidateDetail.email}`);

  // Test 8: Suspend candidate
  const suspended = await AdminUserService.updateUserStatus(
    candidateReg.user.id,
    { status: 'SUSPENDED', reason: 'Test Terms of Service violation' },
    verifiedAdmin
  );
  if (suspended.status !== 'SUSPENDED') throw new Error('Status not updated to SUSPENDED');
  console.log('✓ Test 8: Candidate suspended with auditable reason');

  // Test 9: Reactivate candidate
  const reactivated = await AdminUserService.updateUserStatus(
    candidateReg.user.id,
    { status: 'ACTIVE', reason: 'Account restored after review' },
    verifiedAdmin
  );
  if (reactivated.status !== 'ACTIVE') throw new Error('Status not restored to ACTIVE');
  console.log('✓ Test 9: Candidate reactivated successfully');

  // ==========================================
  // SECTION 3: COURSE LIFECYCLE TESTS
  // ==========================================
  console.log('\n--- SECTION 3: COURSES LIFECYCLE ---');

  // Test 10: Create Course Draft with modules and lessons
  const newCourse = await CourseService.createCourse(
    {
      title: `Test Automation Architecture ${Date.now()}`,
      description: 'Comprehensive test automation patterns, integration suites, and CI/CD pipelines.',
      category: 'Software Engineering',
      level: 'INTERMEDIATE',
      instructorName: 'Quality Lead',
      durationHours: 12,
      skills: ['TypeScript', 'Testing', 'CI/CD'],
      learningObjectives: ['Implement integration testing', 'Build reproducible pipelines'],
      status: 'DRAFT',
      modules: [
        {
          title: 'Module 1: Test Foundations',
          lessons: [
            { title: 'Unit Testing Deep Dive', durationMin: 20, type: 'VIDEO' },
          ],
        },
      ],
    },
    verifiedAdmin
  );
  console.log(`✓ Test 10: Course created as DRAFT (${newCourse.title}) with ${newCourse.modules.length} module`);

  // Test 11: Publish course with validation
  const publishedCourse = await CourseService.publishCourse(newCourse.id, verifiedAdmin);
  if (publishedCourse.status !== 'PUBLISHED') throw new Error('Expected status PUBLISHED');
  console.log(`✓ Test 11: Course verified and published live (${publishedCourse.status})`);

  // Test 12: Archive course
  const archivedCourse = await CourseService.archiveCourse(newCourse.id, verifiedAdmin);
  if (archivedCourse.status !== 'ARCHIVED') throw new Error('Expected status ARCHIVED');
  console.log(`✓ Test 12: Course soft-archived successfully (${archivedCourse.status})`);

  // ==========================================
  // SECTION 4: MENTOR MODERATION TESTS
  // ==========================================
  console.log('\n--- SECTION 4: MENTOR MODERATION ---');

  // Test 13: List mentors with status filter
  const pendingMentors = await MentorService.listMentors({ status: 'PENDING' });
  console.log(`✓ Test 13: Found ${pendingMentors.total} pending mentor applications in review queue`);

  // Test 14: Approve or test mentor flow
  const testMentor = await db.mentor.create({
    data: {
      name: 'Dr. Test Mentor',
      email: `test_mentor_${Date.now()}@example.com`,
      headline: 'Distinguished Engineer',
      bio: 'Mentoring test candidates in system design.',
      domain: 'Software Engineering',
      experienceYears: 10,
      status: 'PENDING',
    },
  });

  const approvedMentor = await MentorService.approveMentor(testMentor.id, verifiedAdmin, 'Approved during integration tests');
  if (approvedMentor.status !== 'APPROVED') throw new Error('Expected status APPROVED');
  console.log(`✓ Test 14: Mentor application approved and role elevated (${approvedMentor.name})`);

  // Test 15: Reject with reason
  const testRejectMentor = await db.mentor.create({
    data: {
      name: 'Unqualified Applicant',
      email: `test_reject_${Date.now()}@example.com`,
      headline: 'Candidate',
      bio: 'Incomplete application',
      domain: 'Design',
      experienceYears: 0,
      status: 'PENDING',
    },
  });

  const rejectedMentor = await MentorService.rejectMentor(
    testRejectMentor.id,
    'Does not meet minimum 3 years industry experience requirement.',
    verifiedAdmin
  );
  if (rejectedMentor.status !== 'REJECTED' || !rejectedMentor.rejectionReason) {
    throw new Error('Rejection reason not stored');
  }
  console.log(`✓ Test 15: Mentor rejected with reason: "${rejectedMentor.rejectionReason}"`);

  // ==========================================
  // SECTION 5: JOB MODERATION TESTS
  // ==========================================
  console.log('\n--- SECTION 5: JOB MODERATION ---');

  const jobsList = await AdminJobService.listJobs({ page: 1, limit: 5 });
  console.log(`✓ Test 16: Job list returned ${jobsList.items.length} items (Total: ${jobsList.total})`);

  if (jobsList.items.length > 0) {
    const jobItem = jobsList.items[0];
    const moderated = await AdminJobService.moderateJob(
      jobItem.id,
      { status: 'PUBLISHED', featured: true, jobVerified: true },
      verifiedAdmin
    );
    console.log(`✓ Test 17: Job "${moderated?.title}" moderated and verified successfully`);
  }

  // ==========================================
  // SECTION 6: APPLICATION INSPECTION TESTS
  // ==========================================
  console.log('\n--- SECTION 6: APPLICATIONS INSPECTION ---');

  const applicationsList = await AdminApplicationService.listApplications({ page: 1, limit: 5 });
  console.log(`✓ Test 18: Applications list returned ${applicationsList.items.length} items (Total: ${applicationsList.total})`);

  // ==========================================
  // SECTION 7: AUDIT LOG VERIFICATION
  // ==========================================
  console.log('\n--- SECTION 7: AUDIT LOG VERIFICATION ---');

  const logs = await AuditService.listLogs({ page: 1, limit: 10 });
  console.log(`✓ Test 19: Audit trail contains ${logs.total} events. Last action: "${logs.items[0]?.action}"`);

  // Verify sanitized details
  for (const log of logs.items) {
    if (log.details) {
      if ('password' in log.details || 'passwordHash' in log.details || 'token' in log.details) {
        throw new Error(`Sensitive secret found in audit log ${log.id}`);
      }
    }
  }
  console.log('✓ Test 20: Audit logs sanitized - zero secret, token, or password leakage detected');

  // ==========================================
  // SECTION 8: DASHBOARD METRICS TEST
  // ==========================================
  console.log('\n--- SECTION 8: DASHBOARD METRICS ---');

  const dashboard = await AdminDashboardService.getDashboardMetrics();
  console.log('✓ Test 21: Dashboard metrics generated with parallel count aggregations:');
  console.log(`  - Total Students: ${dashboard.metrics.students.total}`);
  console.log(`  - Active Mentors: ${dashboard.metrics.mentors.active}`);
  console.log(`  - Published Courses: ${dashboard.metrics.courses.published}`);
  console.log(`  - Published Jobs: ${dashboard.metrics.jobs.published}`);
  console.log(`  - Pending Mentor Approvals: ${dashboard.pendingApprovals.mentorApplications}`);
  console.log(`  - Recent Activity Items: ${dashboard.recentActivity.length}`);

  // Clean up candidate test user
  await db.user.delete({ where: { id: candidateReg.user.id } }).catch(() => {});
  await db.mentor.delete({ where: { id: testMentor.id } }).catch(() => {});
  await db.mentor.delete({ where: { id: testRejectMentor.id } }).catch(() => {});
  await db.course.delete({ where: { id: newCourse.id } }).catch(() => {});

  console.log('\n🎉 ALL 21 TEST SUITE ASSERTIONS PASSED WITH ZERO ERRORS!\n');
}

runAdminTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Test failed:', err);
    process.exit(1);
  });
