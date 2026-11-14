import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import {
  CAREER_DIRECTIONS,
  getCareerDirections,
  getCareerDirectionById,
  getExploreCareerDirections,
  type CareerDirectionItem,
} from '../career-directions';

console.log('🧪 Starting Career Directions & What Could You Become Verification Suite...\n');

let passed = 0;
let failed = 0;

function it(description: string, fn: () => void | Promise<void>) {
  try {
    const res = fn();
    if (res instanceof Promise) {
      return res
        .then(() => {
          console.log(`  ✓ PASSED: ${description}`);
          passed++;
        })
        .catch((err) => {
          console.error(`  ❌ FAILED: ${description}`);
          console.error('   ', err);
          failed++;
        });
    }
    console.log(`  ✓ PASSED: ${description}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ FAILED: ${description}`);
    console.error('   ', err);
    failed++;
  }
}

async function runTests() {
  console.log('--- Test Group 1: 10 Career Directions Configuration & Order ---');

  it('Exactly 10 career directions are configured in the structured data', () => {
    assert.strictEqual(CAREER_DIRECTIONS.length, 10);
    assert.strictEqual(getCareerDirections().length, 10);
  });

  const expectedDirections = [
    { id: 'cloud-engineer', title: 'Cloud Engineer' },
    { id: 'devops-engineer', title: 'DevOps Engineer' },
    { id: 'site-reliability-engineer', title: 'Site Reliability Engineer' },
    { id: 'virtualization-engineer', title: 'Virtualization Engineer' },
    { id: 'server-engineer', title: 'Server Engineer' },
    { id: 'network-security-engineer', title: 'Network & Security Engineer' },
    { id: 'backup-storage-engineer', title: 'Backup & Storage Engineer' },
    { id: 'it-infrastructure-engineer', title: 'IT Infrastructure Engineer' },
    { id: 'microsoft-administrator', title: 'Microsoft Administrator' },
    { id: 'it-service-management', title: 'IT Service Management' },
  ];

  it('All 10 directions match the specified titles and sequence', () => {
    expectedDirections.forEach((exp, idx) => {
      const actual = CAREER_DIRECTIONS[idx];
      assert.strictEqual(actual.id, exp.id, `Index ${idx} id mismatch`);
      assert.strictEqual(actual.title, exp.title, `Index ${idx} title mismatch`);
    });
  });

  it('Default first direction is Cloud Engineer', () => {
    assert.strictEqual(CAREER_DIRECTIONS[0].id, 'cloud-engineer');
    assert.strictEqual(CAREER_DIRECTIONS[0].title, 'Cloud Engineer');
  });

  console.log('\n--- Test Group 2: Roles and Skills Data Integrity ---');

  const expectedMappings: Record<string, { roles: string[]; skills: string[] }> = {
    'cloud-engineer': {
      roles: ['Cloud Engineer', 'Cloud Solutions Engineer'],
      skills: ['AWS', 'Microsoft Azure', 'Linux', 'Networking', 'Cloud Architecture'],
    },
    'devops-engineer': {
      roles: ['DevOps Engineer', 'Build & Release Engineer'],
      skills: ['Docker', 'Kubernetes', 'CI/CD', 'Git', 'Terraform', 'Linux'],
    },
    'site-reliability-engineer': {
      roles: ['Site Reliability Engineer', 'Reliability Engineer'],
      skills: ['Linux', 'Prometheus', 'Grafana', 'Monitoring', 'Python', 'Incident Management'],
    },
    'virtualization-engineer': {
      roles: ['Virtualization Engineer', 'Virtual Infrastructure Administrator'],
      skills: ['VMware', 'Hyper-V', 'Virtual Machines', 'Networking', 'Virtualization Management'],
    },
    'server-engineer': {
      roles: ['Server Engineer', 'Systems Administrator'],
      skills: ['Linux', 'Windows Server', 'Server Administration', 'Active Directory', 'PowerShell'],
    },
    'network-security-engineer': {
      roles: ['Network Engineer', 'Network Security Engineer'],
      skills: ['TCP/IP', 'Routing', 'Switching', 'Firewalls', 'VPN', 'Network Security'],
    },
    'backup-storage-engineer': {
      roles: ['Backup Engineer', 'Storage Administrator'],
      skills: ['NAS', 'SAN', 'Backup Solutions', 'Disaster Recovery', 'Data Protection', 'Storage Management'],
    },
    'it-infrastructure-engineer': {
      roles: ['IT Infrastructure Engineer', 'Infrastructure Administrator'],
      skills: ['Networking', 'Linux', 'Windows Server', 'Cloud Infrastructure', 'Monitoring', 'Infrastructure Management'],
    },
    'microsoft-administrator': {
      roles: ['Microsoft 365 Administrator', 'Azure Administrator'],
      skills: ['Microsoft 365', 'Azure', 'Active Directory', 'Microsoft Entra ID', 'PowerShell'],
    },
    'it-service-management': {
      roles: ['ITSM Analyst', 'IT Service Manager'],
      skills: ['ITIL', 'ServiceNow', 'Incident Management', 'Problem Management', 'Change Management'],
    },
  };

  it('Every career direction contains the exact expected roles and skills', () => {
    for (const [id, expected] of Object.entries(expectedMappings)) {
      const item = getCareerDirectionById(id);
      assert.ok(item, `Direction with id ${id} must exist`);
      assert.deepStrictEqual(item.roles, expected.roles, `Roles mismatch for ${id}`);
      assert.deepStrictEqual(item.skills, expected.skills, `Skills mismatch for ${id}`);
      assert.ok(item.role.length > 0, `Role display string must not be empty for ${id}`);
    }
  });

  console.log('\n--- Test Group 3: Navigation Routes & Link Integrity ---');

  it('All routes are non-empty and avoid placeholder / broken targets', () => {
    for (const item of CAREER_DIRECTIONS) {
      assert.ok(item.href, `href must exist for ${item.id}`);
      assert.ok(!item.href.includes('#'), `href must not contain placeholder '#' for ${item.id}`);
      assert.ok(
        item.href.startsWith('/careers/') || item.href.startsWith('/explore'),
        `href must be a valid internal path for ${item.id}`
      );
    }
  });

  console.log('\n--- Test Group 4: Search Functionality Across 10 Careers ---');

  it('Searching "AWS" returns Cloud Engineer', () => {
    const results = getExploreCareerDirections('AWS');
    assert.strictEqual(results.some((r) => r.id === 'cloud-engineer'), true);
  });

  it('Searching "Docker" returns DevOps Engineer', () => {
    const results = getExploreCareerDirections('Docker');
    assert.strictEqual(results.some((r) => r.id === 'devops-engineer'), true);
  });

  it('Searching "Prometheus" returns Site Reliability Engineer', () => {
    const results = getExploreCareerDirections('Prometheus');
    assert.strictEqual(results.some((r) => r.id === 'site-reliability-engineer'), true);
  });

  it('Searching "VMware" returns Virtualization Engineer', () => {
    const results = getExploreCareerDirections('VMware');
    assert.strictEqual(results.some((r) => r.id === 'virtualization-engineer'), true);
  });

  it('Searching "Firewall" returns Network & Security Engineer', () => {
    const results = getExploreCareerDirections('Firewall');
    assert.strictEqual(results.some((r) => r.id === 'network-security-engineer'), true);
  });

  it('Searching "ServiceNow" returns IT Service Management', () => {
    const results = getExploreCareerDirections('ServiceNow');
    assert.strictEqual(results.some((r) => r.id === 'it-service-management'), true);
  });

  it('Empty search returns all 10 careers', () => {
    assert.strictEqual(getExploreCareerDirections('').length, 10);
    assert.strictEqual(getExploreCareerDirections(undefined).length, 10);
  });

  console.log('\n--- Test Group 5: Explore Page & Header Verification ---');

  it('Explore page files adhere to all requirements (Jobs in navbar, category filter removed, 3-column grid)', () => {
    const pagePath = path.resolve(__dirname, '../../../app/explore/page.tsx');
    const pageSource = fs.readFileSync(pagePath, 'utf8');
    assert.ok(!pageSource.includes('hideJobsNav={true}'), 'Explore page retains Jobs nav');

    const clientPath = path.resolve(__dirname, '../../../app/explore/ExploreClientPage.tsx');
    const clientSource = fs.readFileSync(clientPath, 'utf8');
    assert.ok(!clientSource.includes('CareerCategorySelector'), 'CareerCategorySelector must be removed');
    assert.ok(!clientSource.includes('Explore by career direction'), 'Category header must be removed');
    assert.ok(clientSource.includes('lg:grid-cols-3'), 'Must use 3-column responsive grid on desktop');
    assert.ok(clientSource.includes('md:grid-cols-2'), 'Must use 2-column responsive grid on tablets');
    assert.ok(clientSource.includes('grid-cols-1'), 'Must use 1-column responsive grid on mobile');
    assert.ok(clientSource.includes('getExploreCareerDirections'), 'Uses getExploreCareerDirections');
  });

  console.log('\n--- Test Group 6: Component Integration & Template Requirements ---');

  it('Beat02Possibilities component source code adheres to all UI requirements', () => {
    const componentPath = path.resolve(
      __dirname,
      '../../../components/landing/beats/Beat02Possibilities.tsx'
    );
    const source = fs.readFileSync(componentPath, 'utf8');

    // Section headers and copies
    assert.ok(source.includes('What could you become?'), 'Must have heading "What could you become?"');
    assert.ok(
      source.includes(
        "Your starting point doesn't limit where you can go. Explore a direction and see where it could lead."
      ),
      'Must have required subtitle'
    );
    assert.ok(
      source.toLowerCase().includes('select a career direction'),
      'Must have "SELECT A CAREER DIRECTION" label'
    );
    assert.ok(source.includes('YOUR POSSIBLE PATH'), 'Must have "YOUR POSSIBLE PATH" preview header');
    assert.ok(source.includes('POSSIBLE ROLE'), 'Must have "POSSIBLE ROLE" label');
    assert.ok(source.includes('SKILLS TO BUILD'), 'Must have "SKILLS TO BUILD" label');

    // Progression
    assert.ok(source.includes('Learn'), 'Progression must have Learn');
    assert.ok(source.includes('Build'), 'Progression must have Build');
    assert.ok(source.includes('Prepare'), 'Progression must have Prepare');
    assert.ok(source.includes('Opportunity'), 'Progression must have Opportunity');

    // Two-column responsive grid on desktop
    assert.ok(source.includes('sm:grid-cols-2'), 'Must use 2-column responsive grid for the 10 cards');
    assert.ok(source.includes('CAREER_DIRECTIONS'), 'Must source cards from CAREER_DIRECTIONS');
    assert.ok(source.includes('Explore Path'), 'Must have Explore Path button');

    // Selected state classes
    assert.ok(source.includes('bg-black text-white border-black'), 'Selected card styling');
  });

  console.log('\n========================================');
  console.log(`Summary: Passed: ${passed} | Failed: ${failed}`);
  console.log('========================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
