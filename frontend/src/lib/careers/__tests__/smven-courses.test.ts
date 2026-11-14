import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import {
  SMVEN_COURSES,
  SMVEN_BASE_URL,
  SMVEN_IT_INFRASTRUCTURE_URL,
  CAREER_TO_SMVEN_COURSES_MAP,
  getSmvenCoursesForCareer,
  getPrimarySmvenCourseForCareer,
  getSmvenCourseById,
  getAllSmvenCourses,
} from '../smven-courses';

console.log('🧪 Starting SMVEN Courses Direct Integration Verification Suite...\n');

let passed = 0;
let failed = 0;

function it(description: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✓ PASSED: ${description}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ FAILED: ${description}`);
    console.error('   ', err);
    failed++;
  }
}

console.log('--- Test Group 1: 6 SMVEN Training Programs & Dedicated URLs ---');

const expectedDedicatedUrls: Record<string, string> = {
  'cloud-computing': 'https://smven.com/cloud-computing',
  'devops-engineering': 'https://smven.com/devops-engineering',
  'virtualization-engineering': 'https://smven.com/virtualization-engineering',
  'server-engineering': 'https://smven.com/server-engineering',
  'storage-engineering': 'https://smven.com/storage-engineering',
  'backup-engineering': 'https://smven.com/backup-engineering',
};

const expectedCourses = Object.keys(expectedDedicatedUrls);

it('Exactly 6 official SMVEN courses are configured', () => {
  assert.strictEqual(getAllSmvenCourses().length, 6);
  assert.strictEqual(Object.keys(SMVEN_COURSES).length, 6);
});

it('SMVEN_IT_INFRASTRUCTURE_URL defaults to https://smven.com/', () => {
  assert.strictEqual(SMVEN_IT_INFRASTRUCTURE_URL, 'https://smven.com/');
  assert.strictEqual(SMVEN_BASE_URL, 'https://smven.com/');
});

it('All 6 courses point to their exact confirmed dedicated URLs', () => {
  expectedCourses.forEach((id) => {
    const course = getSmvenCourseById(id);
    assert.ok(course, `Missing course configuration for ${id}`);
    assert.strictEqual(course.provider, 'SMVEN');
    assert.strictEqual(course.url, expectedDedicatedUrls[id]);
    assert.strictEqual(course.isDedicatedUrlVerified, true);
    assert.ok(course.title && course.title.length > 0, `Course ${id} missing title`);
    assert.ok(course.skills && course.skills.length > 0, `Course ${id} missing skills`);
  });
});

console.log('\n--- Test Group 2: Career-to-Course Mapping Integrity ---');

it('Cloud Engineer maps to Cloud Computing', () => {
  const courses = getSmvenCoursesForCareer('cloud-engineer');
  assert.strictEqual(courses.length, 1);
  assert.strictEqual(courses[0].slug, 'cloud-computing');
  assert.strictEqual(courses[0].url, 'https://smven.com/cloud-computing');
});

it('DevOps Engineer maps to DevOps Engineering', () => {
  const courses = getSmvenCoursesForCareer('devops-engineer');
  assert.strictEqual(courses.length, 1);
  assert.strictEqual(courses[0].slug, 'devops-engineering');
  assert.strictEqual(courses[0].url, 'https://smven.com/devops-engineering');
});

it('Site Reliability Engineer maps to DevOps Engineering and Cloud Computing', () => {
  const courses = getSmvenCoursesForCareer('site-reliability-engineer');
  assert.strictEqual(courses.length, 2);
  const slugs = courses.map((c) => c.slug);
  assert.ok(slugs.includes('devops-engineering'));
  assert.ok(slugs.includes('cloud-computing'));
  assert.strictEqual(courses.find((c) => c.slug === 'devops-engineering')?.url, 'https://smven.com/devops-engineering');
  assert.strictEqual(courses.find((c) => c.slug === 'cloud-computing')?.url, 'https://smven.com/cloud-computing');
});

it('Virtualization Engineer maps to Virtualization Engineering', () => {
  const courses = getSmvenCoursesForCareer('virtualization-engineer');
  assert.strictEqual(courses.length, 1);
  assert.strictEqual(courses[0].slug, 'virtualization-engineering');
  assert.strictEqual(courses[0].url, 'https://smven.com/virtualization-engineering');
});

it('Server Engineer maps to Server Engineering', () => {
  const courses = getSmvenCoursesForCareer('server-engineer');
  assert.strictEqual(courses.length, 1);
  assert.strictEqual(courses[0].slug, 'server-engineering');
  assert.strictEqual(courses[0].url, 'https://smven.com/server-engineering');
});

it('Network & Security Engineer has no directly matching course currently', () => {
  const courses = getSmvenCoursesForCareer('network-security-engineer');
  assert.strictEqual(courses.length, 0);
  assert.strictEqual(getPrimarySmvenCourseForCareer('network-security-engineer'), undefined);
});

it('Backup & Storage Engineer maps to Storage Engineering and Backup Engineering', () => {
  const courses = getSmvenCoursesForCareer('backup-storage-engineer');
  assert.strictEqual(courses.length, 2);
  const slugs = courses.map((c) => c.slug);
  assert.ok(slugs.includes('storage-engineering'));
  assert.ok(slugs.includes('backup-engineering'));
  assert.strictEqual(courses.find((c) => c.slug === 'storage-engineering')?.url, 'https://smven.com/storage-engineering');
  assert.strictEqual(courses.find((c) => c.slug === 'backup-engineering')?.url, 'https://smven.com/backup-engineering');
});

it('IT Infrastructure Engineer maps to relevant infrastructure courses', () => {
  const courses = getSmvenCoursesForCareer('it-infrastructure-engineer');
  assert.ok(courses.length >= 4);
  const slugs = courses.map((c) => c.slug);
  assert.ok(slugs.includes('cloud-computing'));
  assert.ok(slugs.includes('server-engineering'));
  assert.ok(slugs.includes('virtualization-engineering'));
});

it('Microsoft Administrator maps to Server Engineering', () => {
  const courses = getSmvenCoursesForCareer('microsoft-administrator');
  assert.strictEqual(courses.length, 1);
  assert.strictEqual(courses[0].slug, 'server-engineering');
  assert.strictEqual(courses[0].url, 'https://smven.com/server-engineering');
});

it('IT Service Management has no directly matching course currently', () => {
  const courses = getSmvenCoursesForCareer('it-service-management');
  assert.strictEqual(courses.length, 0);
  assert.strictEqual(getPrimarySmvenCourseForCareer('it-service-management'), undefined);
});

console.log('\n--- Test Group 3: Component Integration & Target Blank Preservation ---');

it('LearningRoadmapSection renders target="_blank", rel="noopener noreferrer", and SMVEN_IT_INFRASTRUCTURE_URL', () => {
  const filePath = path.resolve(__dirname, '../../../components/career/LearningRoadmapSection.tsx');
  const src = fs.readFileSync(filePath, 'utf8');
  assert.ok(src.includes('getSmvenCoursesForCareer'), 'Must use getSmvenCoursesForCareer');
  assert.ok(src.includes('SMVEN_IT_INFRASTRUCTURE_URL'), 'Must use SMVEN_IT_INFRASTRUCTURE_URL');
  assert.ok(src.includes('target="_blank"'), 'Must open external links in new tab');
  assert.ok(src.includes('rel="noopener noreferrer"'), 'Must include security attributes');
  assert.ok(src.includes('View Course on SMVEN'), 'Must render SMVEN view course CTA');
});

it('YourNextStepCard supports external redirection and recommendedCourse', () => {
  const filePath = path.resolve(__dirname, '../../../components/career/YourNextStepCard.tsx');
  const src = fs.readFileSync(filePath, 'utf8');
  assert.ok(src.includes('target="_blank"'), 'Must open recommended course in new tab');
  assert.ok(src.includes('rel="noopener noreferrer"'), 'Must include security attributes');
  assert.ok(src.includes('recommendedCourse'), 'Must support recommendedCourse prop');
});

it('SkillGapSection conditionally renders SMVEN recommendations and SMVEN_IT_INFRASTRUCTURE_URL', () => {
  const filePath = path.resolve(__dirname, '../../../components/career/SkillGapSection.tsx');
  const src = fs.readFileSync(filePath, 'utf8');
  assert.ok(src.includes('getSmvenCoursesForCareer'), 'Must use getSmvenCoursesForCareer');
  assert.ok(src.includes('SMVEN_IT_INFRASTRUCTURE_URL'), 'Must use SMVEN_IT_INFRASTRUCTURE_URL');
  assert.ok(src.includes('target="_blank"'), 'Must open course links in new tab');
  assert.ok(src.includes('Recommended SMVEN Training'), 'Must label training as SMVEN');
});

it('LearnPage (/learn) renders all 6 SMVEN courses, smvenLogo.png, and SMVEN_IT_INFRASTRUCTURE_URL with new tab redirection', () => {
  const filePath = path.resolve(__dirname, '../../../app/learn/page.tsx');
  const src = fs.readFileSync(filePath, 'utf8');
  assert.ok(src.includes('getAllSmvenCourses'), 'Must fetch all SMVEN courses');
  assert.ok(src.includes('SMVEN_IT_INFRASTRUCTURE_URL'), 'Must use SMVEN_IT_INFRASTRUCTURE_URL');
  assert.ok(src.includes('/smvenLogo.png'), 'Must render official smvenLogo.png');
  assert.ok(src.includes('target="_blank"'), 'Must open external course pages in new tab');
  assert.ok(src.includes('rel="noopener noreferrer"'), 'Must include security rel attributes');
  assert.ok(src.includes('SMVEN Training Programs'), 'Must have clear page title');

  // Verify asset exists in frontend/public
  const logoPath = path.resolve(__dirname, '../../../../public/smvenLogo.png');
  assert.ok(fs.existsSync(logoPath), 'smvenLogo.png must exist in frontend/public');
});

console.log('\n========================================');
console.log(`Summary: Passed: ${passed} | Failed: ${failed}`);
console.log('========================================\n');

if (failed > 0) {
  process.exit(1);
}


