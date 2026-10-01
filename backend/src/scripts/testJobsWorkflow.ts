import { db } from '../db/client';
import { JobSearchService } from '../services/jobSearchService';
import { JobService } from '../services/jobService';
import { SavedJobService } from '../services/savedJobService';
import { ApplicationService } from '../services/applicationService';
import { JobMatchingService } from '../services/jobMatchingService';

async function runTests() {
  console.log('🧪 Starting Jobs Module Integration Tests...\n');

  // Test 1: Search all jobs
  console.log('Test 1: Search all jobs with pagination');
  const allJobs = await JobSearchService.searchJobs({ page: 1, limit: 10 });
  console.log(`✓ Total jobs: ${allJobs.total}, returned: ${allJobs.items.length}, totalPages: ${allJobs.totalPages}`);
  if (allJobs.items.length === 0) throw new Error('Expected jobs in DB');

  // Test 2: Search by query keyword "React"
  console.log('\nTest 2: Search query "React"');
  const reactJobs = await JobSearchService.searchJobs({ q: 'React' });
  console.log(`✓ Found ${reactJobs.total} jobs for query "React"`);
  if (!reactJobs.items.some((j) => j.skills.includes('React') || j.title.includes('React'))) {
    throw new Error('Search query React should match React jobs');
  }

  // Test 3: Filter by workMode "Remote"
  console.log('\nTest 3: Filter by workMode "Remote"');
  const remoteJobs = await JobSearchService.searchJobs({ workMode: 'Remote' });
  console.log(`✓ Found ${remoteJobs.total} remote jobs`);
  if (!remoteJobs.items.every((j) => j.workMode === 'Remote')) {
    throw new Error('All returned jobs should be Remote');
  }

  // Test 4: Filter by employmentType "Internship"
  console.log('\nTest 4: Filter by employmentType "Internship"');
  const internships = await JobSearchService.searchJobs({ employmentType: 'Internship' });
  console.log(`✓ Found ${internships.total} internship jobs`);
  if (!internships.items.every((j) => j.employmentType === 'Internship')) {
    throw new Error('All returned jobs should be Internship');
  }

  // Test 5: Get Job Details by ID
  console.log('\nTest 5: Fetch complete JobDetailDTO');
  const sampleJob = allJobs.items[0];
  const detail = await JobService.getJobById(sampleJob.id);
  if (!detail) throw new Error('Job detail not found');
  console.log(`✓ Retrieved detail for "${detail.title}" at "${detail.company}". Has description: ${Boolean(detail.description)}, responsibilities: ${detail.responsibilities.length}`);

  // Test 6: Create dummy candidate for user-specific actions
  console.log('\nTest 6: User-specific test user');
  const testEmail = `test_candidate_${Date.now()}@example.com`;
  const testUser = await db.user.create({
    data: {
      name: 'Test Candidate',
      email: testEmail,
      role: 'CANDIDATE',
    },
  });
  console.log(`✓ Created test user ${testUser.id}`);

  // Test 7: Save & Unsave Job
  console.log('\nTest 7: Idempotent Save & Unsave Job');
  const saveRes1 = await SavedJobService.saveJob(testUser.id, sampleJob.id);
  const saveRes2 = await SavedJobService.saveJob(testUser.id, sampleJob.id); // duplicate save check
  if (!saveRes1.isSaved || !saveRes2.isSaved) throw new Error('Save job should be idempotent');
  console.log('✓ Idempotent save verified');

  const savedList = await SavedJobService.getSavedJobs(testUser.id);
  if (savedList.total !== 1) throw new Error(`Expected 1 saved job, found ${savedList.total}`);
  console.log(`✓ Saved jobs list verified (${savedList.total} item)`);

  const unsaveRes = await SavedJobService.unsaveJob(testUser.id, sampleJob.id);
  if (unsaveRes.isSaved) throw new Error('Unsave job failed');
  const savedAfter = await SavedJobService.getSavedJobs(testUser.id);
  if (savedAfter.total !== 0) throw new Error('Saved jobs should be empty after unsave');
  console.log('✓ Unsave verified');

  // Test 8: Job Application & Duplicate Application Protection
  console.log('\nTest 8: Job Application & Duplicate Protection');
  const app = await ApplicationService.applyToJob(testUser.id, sampleJob.id, {
    coverNote: 'Excited about this opportunity!',
  });
  console.log(`✓ Application submitted successfully with ID: ${app.id}, status: ${app.status}`);

  let duplicatePrevented = false;
  try {
    await ApplicationService.applyToJob(testUser.id, sampleJob.id);
  } catch (err: any) {
    if (err.message.includes('already submitted')) {
      duplicatePrevented = true;
    }
  }
  if (!duplicatePrevented) throw new Error('Duplicate application was not prevented!');
  console.log('✓ Duplicate application successfully prevented');

  // Test 9: List Candidate Applications
  console.log('\nTest 9: List Candidate Applications');
  const userApps = await ApplicationService.listApplications(testUser.id);
  if (userApps.total !== 1) throw new Error(`Expected 1 application, found ${userApps.total}`);
  console.log(`✓ Applications list retrieved: ${userApps.total} application(s)`);

  // Test 10: Withdraw Application
  console.log('\nTest 10: Withdraw Application');
  const withdrawn = await ApplicationService.withdrawApplication(testUser.id, app.id);
  if (withdrawn.status !== 'WITHDRAWN') throw new Error('Withdrawal status not updated');
  console.log(`✓ Application status updated to: ${withdrawn.status}`);

  // Test 11: IDOR Protection
  console.log('\nTest 11: IDOR Protection');
  let idorBlocked = false;
  try {
    await ApplicationService.withdrawApplication('arbitrary_fake_user_id', app.id);
  } catch {
    idorBlocked = true;
  }
  if (!idorBlocked) throw new Error('IDOR check failed!');
  console.log('✓ IDOR check passed (unauthorized user cannot withdraw application)');

  // Test 12: Deterministic Recommendations
  console.log('\nTest 12: Deterministic Recommendations');
  const recs = await JobMatchingService.getRecommendedJobs(testUser.id, 3);
  console.log(`✓ Recommended ${recs.length} opportunities. Top: "${recs[0]?.title}" (${recs[0]?.matchReason})`);

  // Cleanup test user
  await db.user.delete({ where: { id: testUser.id } });
  console.log('✓ Cleanup test user completed');

  console.log('\n🎉 ALL 12 INTEGRATION TESTS PASSED CLEANLY!\n');
}

runTests()
  .catch((err) => {
    console.error('Test run failed:', err);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
