import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import {
  CAREER_GROWTH_TRAJECTORIES,
  getCareerGrowthTrajectory,
  getCareerGrowthLevel,
  STANDARD_TRAJECTORY_KEYS,
} from '../career-growth-trajectory';
import { CAREER_PATHS } from '../career-data';

console.log('🧪 Starting Career Growth Trajectory Verification Suite...\n');

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

const targetCareers = [
  'cloud-engineer',
  'devops-engineer',
  'site-reliability-engineer',
  'virtualization-engineer',
  'server-engineer',
  'network-security-engineer',
  'backup-storage-engineer',
  'it-infrastructure-engineer',
  'microsoft-administrator',
  'it-service-management',
];

console.log('--- Test Group 1: 10 Careers Have Exactly 3 Standardized Growth Levels ---');

it('All 10 target careers exist in CAREER_GROWTH_TRAJECTORIES', () => {
  targetCareers.forEach((slug) => {
    assert.ok(CAREER_GROWTH_TRAJECTORIES[slug], `Missing trajectory config for ${slug}`);
  });
});

it('Every career has exactly 3 growth levels: Fresher, Associate, Senior', () => {
  targetCareers.forEach((slug) => {
    const trajectory = getCareerGrowthTrajectory(slug);
    assert.strictEqual(
      trajectory.length,
      3,
      `Career ${slug} must have exactly 3 growth levels, found ${trajectory.length}`
    );

    assert.strictEqual(trajectory[0].level, 'Fresher');
    assert.strictEqual(trajectory[0].levelKey, 'fresher');
    assert.strictEqual(trajectory[0].experienceRange, '0–1 years');

    assert.strictEqual(trajectory[1].level, 'Associate');
    assert.strictEqual(trajectory[1].levelKey, 'associate');
    assert.strictEqual(trajectory[1].experienceRange, '1–3 years');

    assert.strictEqual(trajectory[2].level, 'Senior');
    assert.strictEqual(trajectory[2].levelKey, 'senior');
    assert.strictEqual(trajectory[2].experienceRange, '3–5+ years');
  });
});

console.log('\n--- Test Group 2: Strict Prohibition of Architect/4th Tier Across Trajectories ---');

it('No Architect or Lead Architect titles exist across any of the 10 careers', () => {
  targetCareers.forEach((slug) => {
    const trajectory = getCareerGrowthTrajectory(slug);
    trajectory.forEach((lvl) => {
      assert.ok(
        !lvl.title.toLowerCase().includes('architect'),
        `Career ${slug} level ${lvl.level} contains "architect": ${lvl.title}`
      );
    });
  });
});

it('All 10 careers in career-data.ts have exactly 3 items in typicalTrajectory without Architect', () => {
  targetCareers.forEach((slug) => {
    const career = CAREER_PATHS.find((c) => c.slug === slug);
    assert.ok(career, `Career ${slug} not found in CAREER_PATHS`);
    assert.strictEqual(
      career.typicalTrajectory.length,
      3,
      `career.typicalTrajectory for ${slug} must have 3 items, found ${career.typicalTrajectory.length}`
    );
    career.typicalTrajectory.forEach((title) => {
      assert.ok(
        !title.toLowerCase().includes('architect'),
        `typicalTrajectory for ${slug} contains Architect: ${title}`
      );
    });
  });
});

console.log('\n--- Test Group 3: Accurate Titles for All 10 Careers ---');

const expectedTitles: Record<string, [string, string, string]> = {
  'cloud-engineer': ['Cloud Support Associate', 'Cloud Engineer', 'Senior Cloud Engineer'],
  'devops-engineer': ['DevOps Trainee', 'DevOps Engineer', 'Senior DevOps Engineer'],
  'site-reliability-engineer': ['SRE Trainee', 'Site Reliability Engineer', 'Senior Site Reliability Engineer'],
  'virtualization-engineer': ['Virtualization Support Associate', 'Virtualization Engineer', 'Senior Virtualization Engineer'],
  'server-engineer': ['Server Support Associate', 'Server Engineer', 'Senior Server Engineer'],
  'network-security-engineer': ['Network Support Associate', 'Network & Security Engineer', 'Senior Network & Security Engineer'],
  'backup-storage-engineer': ['Storage Support Associate', 'Backup & Storage Engineer', 'Senior Backup & Storage Engineer'],
  'it-infrastructure-engineer': ['IT Infrastructure Support Associate', 'IT Infrastructure Engineer', 'Senior IT Infrastructure Engineer'],
  'microsoft-administrator': ['Microsoft 365 Support Associate', 'Microsoft Administrator', 'Senior Microsoft Administrator'],
  'it-service-management': ['IT Service Desk Associate', 'ITSM Analyst', 'Senior ITSM Specialist'],
};

it('Job titles match user specification exactly for all 3 levels across 10 careers', () => {
  targetCareers.forEach((slug) => {
    const trajectory = getCareerGrowthTrajectory(slug);
    const expected = expectedTitles[slug];
    assert.strictEqual(trajectory[0].title, expected[0]);
    assert.strictEqual(trajectory[1].title, expected[1]);
    assert.strictEqual(trajectory[2].title, expected[2]);
  });
});

console.log('\n--- Test Group 4: UI Component CareerDetailHero Conformance ---');

it('CareerDetailHero renders 3-column desktop grid with dynamic 3-level data', () => {
  const heroPath = path.resolve(
    __dirname,
    '../../../components/career/CareerDetailHero.tsx'
  );
  const heroSource = fs.readFileSync(heroPath, 'utf8');

  // Verify responsive 3-column desktop grid
  assert.ok(
    heroSource.includes('grid-cols-1 md:grid-cols-3 gap-2.5 pt-1'),
    'Must use 3-column responsive desktop layout (md:grid-cols-3)'
  );

  // Verify no 4-column layout
  assert.ok(
    !heroSource.includes('lg:grid-cols-4'),
    'Must not have 4-column layout'
  );

  // Verify dynamic trajectory integration
  assert.ok(
    heroSource.includes('getCareerGrowthTrajectory(career.slug)'),
    'Must fetch trajectory via getCareerGrowthTrajectory'
  );
  assert.ok(
    heroSource.includes('getCareerGrowthLevel(career.slug, selectedLevel)'),
    'Must fetch active level via getCareerGrowthLevel'
  );

  // Verify Personalized Plan banner elements
  assert.ok(
    heroSource.includes('Target Level Focus:'),
    'Must display Target Level Focus heading'
  );
  assert.ok(
    heroSource.includes('Personalized Plan'),
    'Must include Personalized Plan pill'
  );
  assert.ok(
    heroSource.includes('Key Competencies:'),
    'Must include Key Competencies section'
  );
});

console.log('\n========================================');
console.log(`Summary: Passed: ${passed} | Failed: ${failed}`);
console.log('========================================\n');

if (failed > 0) {
  process.exit(1);
}

