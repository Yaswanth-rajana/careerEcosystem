import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import {
  getSavedTargetRoles,
  setSavedTargetRole,
  toggleTargetRole,
  isTargetRoleSelected,
  findCareerSlugByTitle,
  getSavedRoleBySlug,
  CURATED_ROLES,
} from '../saved-roles';

console.log('🧪 Starting Saved-Roles Isolation & Header Sync Test Suite...\n');

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

// In-memory mock localStorage and window event system
function setupMockBrowser() {
  const store: Record<string, string> = {};
  const eventListeners: Record<string, Function[]> = {};

  const mockLocalStorage = {
    getItem: (key: string) => (key in store ? store[key] : null),
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      for (const k of Object.keys(store)) delete store[k];
    },
  };

  const mockWindow = {
    localStorage: mockLocalStorage,
    dispatchEvent: (event: { type: string }) => {
      const listeners = eventListeners[event.type] || [];
      listeners.forEach((fn) => fn(event));
      return true;
    },
    addEventListener: (type: string, fn: Function) => {
      if (!eventListeners[type]) eventListeners[type] = [];
      eventListeners[type].push(fn);
    },
    removeEventListener: (type: string, fn: Function) => {
      if (eventListeners[type]) {
        eventListeners[type] = eventListeners[type].filter((f) => f !== fn);
      }
    },
    Event: class {
      type: string;
      constructor(type: string) {
        this.type = type;
      }
    },
  };

  (globalThis as any).window = mockWindow;
  (globalThis as any).localStorage = mockLocalStorage;
  (globalThis as any).Event = mockWindow.Event;

  return { store, eventListeners };
}

async function runTests() {
  console.log('--- Test Group 1: Bundle Isolation & Dependency Verification ---');

  await it('saved-roles.ts contains ZERO imports of career catalogs, level data, or mentor repository', () => {
    const filePath = path.resolve(__dirname, '../saved-roles.ts');
    const sourceCode = fs.readFileSync(filePath, 'utf8');

    assert(!sourceCode.includes("from './career-data'"), 'Must NOT import from career-data');
    assert(!sourceCode.includes("from './career-levels-data'"), 'Must NOT import from career-levels-data');
    assert(!sourceCode.includes("from '../mentors/mentor-repository'"), 'Must NOT import from mentor-repository');
    assert(!sourceCode.includes("from 'gsap'"), 'Must NOT import gsap');
    assert(!sourceCode.includes("from 'framer-motion'"), 'Must NOT import framer-motion');
    assert(sourceCode.length < 10000, `Module must remain lightweight (currently ${sourceCode.length} bytes)`);
  });

  await it('Curated roles catalog covers all primary career pathways with metadata only', () => {
    assert.strictEqual(CURATED_ROLES.length >= 8, true, 'At least 8 curated roles are defined');
    const software = getSavedRoleBySlug('software-engineer');
    assert(software, 'Software Engineer role must exist');
    assert.strictEqual(software?.title, 'Software Engineer');
    assert.strictEqual(software?.category, 'Technology');

    const cloud = getSavedRoleBySlug('cloud-engineer');
    assert(cloud, 'Cloud Engineer role must exist');
    assert.strictEqual(cloud?.title, 'Cloud Engineer');
  });

  console.log('\n--- Test Group 2: Saved-Role Storage Operations ---');

  await it('getSavedTargetRoles returns empty array when storage is empty or SSR', () => {
    const { store } = setupMockBrowser();
    assert.deepStrictEqual(getSavedTargetRoles(), []);
  });

  await it('setSavedTargetRole stores new role, updates legacy key, and dispatches event', () => {
    const { store, eventListeners } = setupMockBrowser();
    let eventFired = 0;
    (globalThis as any).window.addEventListener('pathway_selected_roles_changed', () => {
      eventFired++;
    });

    const newRole = { slug: 'cloud-engineer', title: 'Cloud Engineer', category: 'Technology' };
    const result = setSavedTargetRole(newRole);

    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].slug, 'cloud-engineer');
    assert.strictEqual(eventFired, 1, 'pathway_selected_roles_changed event must be dispatched');
    assert.strictEqual(JSON.parse(store['pathway_selected_roles'])[0].slug, 'cloud-engineer');
    assert.strictEqual(JSON.parse(store['pathway_selected_role']).slug, 'cloud-engineer');
  });

  await it('setSavedTargetRole moves existing role to end as primary active path', () => {
    setupMockBrowser();
    setSavedTargetRole({ slug: 'software-engineer', title: 'Software Engineer', category: 'Technology' });
    setSavedTargetRole({ slug: 'cloud-engineer', title: 'Cloud Engineer', category: 'Technology' });

    let current = getSavedTargetRoles();
    assert.strictEqual(current.length, 2);
    assert.strictEqual(current[current.length - 1].slug, 'cloud-engineer');

    // Re-set software-engineer
    setSavedTargetRole({ slug: 'software-engineer', title: 'Software Engineer', category: 'Technology' });
    current = getSavedTargetRoles();
    assert.strictEqual(current.length, 2, 'Count remains 2 (no duplicates)');
    assert.strictEqual(current[current.length - 1].slug, 'software-engineer', 'Re-selected role moves to end');
  });

  await it('toggleTargetRole adds, removes, and records explicit clearing flag', () => {
    const { store } = setupMockBrowser();
    const role = { slug: 'devops-engineer', title: 'DevOps Engineer', category: 'Technology' };

    // 1. Add
    const res1 = toggleTargetRole(role);
    assert.strictEqual(res1.isSelected, true);
    assert.strictEqual(res1.roles.length, 1);
    assert.strictEqual(store['pathway_user_explicitly_cleared_roles'], undefined);

    // 2. Remove (clears list)
    const res2 = toggleTargetRole(role);
    assert.strictEqual(res2.isSelected, false);
    assert.strictEqual(res2.roles.length, 0);
    assert.strictEqual(store['pathway_user_explicitly_cleared_roles'], 'true', 'Explicitly cleared flag is set when user deselects last role');

    // 3. Add again (unsets explicit clearing flag)
    const res3 = toggleTargetRole(role);
    assert.strictEqual(res3.isSelected, true);
    assert.strictEqual(store['pathway_user_explicitly_cleared_roles'], undefined, 'Explicit clearing flag removed when role re-selected');
  });

  await it('isTargetRoleSelected accurately checks selection state', () => {
    setupMockBrowser();
    assert.strictEqual(isTargetRoleSelected('data-analyst'), false);
    setSavedTargetRole({ slug: 'data-analyst', title: 'Data Analyst', category: 'Data & AI' });
    assert.strictEqual(isTargetRoleSelected('data-analyst'), true);
  });

  console.log('\n--- Test Group 3: Slug Lookup and Target Role Mapping ---');

  await it('findCareerSlugByTitle maps exact, fuzzy, and keyword inputs without loading full datasets', () => {
    assert.strictEqual(findCareerSlugByTitle('Software Engineer'), 'software-engineer');
    assert.strictEqual(findCareerSlugByTitle('software-engineer'), 'software-engineer');
    assert.strictEqual(findCareerSlugByTitle('Cloud Solutions Architect'), 'cloud-engineer');
    assert.strictEqual(findCareerSlugByTitle('Full Stack Web Developer'), 'software-engineer');
    assert.strictEqual(findCareerSlugByTitle('DevOps & SRE'), 'devops-engineer');
    assert.strictEqual(findCareerSlugByTitle('Senior Data Analyst'), 'data-analyst');
    assert.strictEqual(findCareerSlugByTitle('AI & Machine Learning Scientist'), 'data-scientist');
    assert.strictEqual(findCareerSlugByTitle('Product Lead'), 'product-manager');
    assert.strictEqual(findCareerSlugByTitle('Embedded Systems Engineer'), 'embedded-hardware-engineer');
    assert.strictEqual(findCareerSlugByTitle(''), null);
    assert.strictEqual(findCareerSlugByTitle(undefined), null);
    assert.strictEqual(findCareerSlugByTitle('Chef'), null);
  });

  console.log('\n--- Test Group 4: Header Sync Logic & Elimination of /api/onboarding Fetch ---');

  await it('Header synchronizes provided targetRole into localStorage with ZERO network calls', () => {
    const { store } = setupMockBrowser();
    let networkCallCount = 0;
    (globalThis as any).fetch = async () => {
      networkCallCount++;
      throw new Error('Network should never be called!');
    };

    // Simulate Header synchronization logic
    const currentUser = { id: 'u1', name: 'Alex' };
    const targetRole = 'Cloud Solutions Architect';

    const currentSaved = getSavedTargetRoles();
    const isUserExplicitlyCleared = store['pathway_user_explicitly_cleared_roles'] === 'true';

    if (currentUser && targetRole && currentSaved.length === 0 && !isUserExplicitlyCleared) {
      const matchedSlug = findCareerSlugByTitle(targetRole);
      if (matchedSlug) {
        const roleItem = getSavedRoleBySlug(matchedSlug);
        if (roleItem) {
          setSavedTargetRole(roleItem);
        }
      }
    }

    assert.strictEqual(networkCallCount, 0, 'No fetch calls made');
    const saved = getSavedTargetRoles();
    assert.strictEqual(saved.length, 1);
    assert.strictEqual(saved[0].slug, 'cloud-engineer');
    assert.strictEqual(saved[0].title, 'Cloud Engineer');
  });

  await it('Header respects pathway_user_explicitly_cleared_roles and does NOT silently restore cleared role', () => {
    const { store } = setupMockBrowser();
    store['pathway_user_explicitly_cleared_roles'] = 'true';

    const currentUser = { id: 'u1', name: 'Alex' };
    const targetRole = 'Software Engineer';

    const currentSaved = getSavedTargetRoles();
    const isUserExplicitlyCleared = store['pathway_user_explicitly_cleared_roles'] === 'true';

    if (currentUser && targetRole && currentSaved.length === 0 && !isUserExplicitlyCleared) {
      const matchedSlug = findCareerSlugByTitle(targetRole);
      if (matchedSlug) {
        const roleItem = getSavedRoleBySlug(matchedSlug);
        if (roleItem) {
          setSavedTargetRole(roleItem);
        }
      }
    }

    assert.strictEqual(getSavedTargetRoles().length, 0, 'Role must NOT be restored when explicitly cleared');
  });

  await it('Header with no targetRole and empty storage does not fetch /api/onboarding and falls back to /my-path', () => {
    setupMockBrowser();
    let networkCallCount = 0;
    (globalThis as any).fetch = async () => {
      networkCallCount++;
      return { ok: true, json: async () => ({}) };
    };

    const currentUser = { id: 'u1', name: 'Alex' };
    const targetRole = null; // No role provided

    const currentSaved = getSavedTargetRoles();
    const isUserExplicitlyCleared = localStorage.getItem('pathway_user_explicitly_cleared_roles') === 'true';

    if (currentUser && targetRole && currentSaved.length === 0 && !isUserExplicitlyCleared) {
      // Should not enter
      networkCallCount++;
    }

    // Verify navigation destination
    const primaryPathHref = currentSaved.length > 0
      ? `/careers/${currentSaved[currentSaved.length - 1].slug}`
      : '/my-path';

    assert.strictEqual(networkCallCount, 0, 'No network requests dispatched');
    assert.strictEqual(primaryPathHref, '/my-path', 'Navigation defaults to /my-path fallback');
  });

  console.log('\n========================================');
  console.log(`Summary: Passed: ${passed} | Failed: ${failed}`);
  console.log('========================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
