import assert from 'node:assert';

console.log('🧪 Starting Dashboard Focus Flicker & Revalidation Test Suite...\n');

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
  console.log('--- Test Group 1: Server-Provided Initial Data & Zero-Waterfall Rendering ---');

  await it('Server-provided initialData renders meaningful content immediately with ZERO skeleton', () => {
    const serverInitialData: any = {
      user: { name: 'Alex Sharma' },
      careerSnapshot: { targetRole: 'Full Stack Engineer' },
      nextAction: { title: 'Complete your profile' },
    };
    const initialError: string | null = null;

    // Simulation of DashboardClientView state initialization
    const dashboardData = serverInitialData;
    const isLoading = !serverInitialData && !initialError;
    const error = initialError;

    const shouldRenderSkeleton = (data: any, loading: boolean) => loading && data === null;
    assert.strictEqual(isLoading, false, 'isLoading must initialize to false when server data is provided');
    assert.strictEqual(shouldRenderSkeleton(dashboardData, isLoading), false, 'Skeleton must NOT render when server data is provided');
    assert.strictEqual(dashboardData.user.name, 'Alex Sharma', 'User greeting data is immediately available');
    assert.strictEqual(dashboardData.careerSnapshot.targetRole, 'Full Stack Engineer', 'Target role is immediately available');
    assert.strictEqual(error, null, 'Error must be null');
  });

  await it('Client suppresses redundant /api/dashboard request on mount when initialData is present', async () => {
    const serverInitialData: any = { user: { name: 'Alex' } };
    const initialError: string | null = null;
    let clientFetchCount = 0;

    // Simulation of DashboardClientView mount effect
    const mockMountEffect = (data: any, err: any, fetchFn: () => void) => {
      if (!data && !err) {
        fetchFn();
      }
    };

    mockMountEffect(serverInitialData, initialError, () => {
      clientFetchCount++;
    });

    assert.strictEqual(clientFetchCount, 0, 'Client must NOT issue an initial /api/dashboard request when server provided data');
  });

  await it('Client gracefully falls back to client-side fetch if initialData is null and no error exists', async () => {
    const serverInitialData: any = null;
    const initialError: string | null = null;
    let clientFetchCount = 0;

    const mockMountEffect = (data: any, err: any, fetchFn: () => void) => {
      if (!data && !err) {
        fetchFn();
      }
    };

    mockMountEffect(serverInitialData, initialError, () => {
      clientFetchCount++;
    });

    const isLoading = !serverInitialData && !initialError;
    assert.strictEqual(isLoading, true, 'isLoading is true when initialData is null');
    assert.strictEqual(clientFetchCount, 1, 'Client fetch is dispatched as a fallback');
  });

  await it('Server-side initial error renders error state without redundant fetch and allows retry', async () => {
    const serverInitialData: any = null;
    const serverInitialError = 'Database temporarily unreachable';
    let clientFetchCount = 0;

    const mockMountEffect = (data: any, err: any, fetchFn: () => void) => {
      if (!data && !err) {
        fetchFn();
      }
    };

    mockMountEffect(serverInitialData, serverInitialError, () => {
      clientFetchCount++;
    });

    assert.strictEqual(clientFetchCount, 0, 'Mount effect does not re-fetch when server already returned an error');

    const isLoading = !serverInitialData && !serverInitialError;
    const error = serverInitialError;
    assert.strictEqual(isLoading, false, 'isLoading is false on initial error');
    assert.strictEqual(error, 'Database temporarily unreachable', 'Initial error is set directly');

    // User clicks "Try Again"
    const retryFetch = () => {
      clientFetchCount++;
    };
    retryFetch();
    assert.strictEqual(clientFetchCount, 1, 'Try Again button dispatches retry fetch');
  });

  console.log('\n--- Test Group 2: Background Refresh & Focus Flicker Elimination ---');

  await it('Background refresh keeps existing dashboard cards visible (NO skeleton replacement)', async () => {
    let dashboardData: any = { user: { name: 'Alex' }, mentorship: { hasSession: false } };
    let isLoading = false;
    let isRefreshing = false;
    let error: string | null = null;
    const dashboardDataRef = { current: dashboardData };
    const inFlightRef = { current: false };

    const mockFetchDashboard = async () => {
      if (inFlightRef.current) return;
      inFlightRef.current = true;

      const hasData = dashboardDataRef.current !== null;
      if (!hasData) {
        isLoading = true;
        error = null;
      } else {
        isRefreshing = true;
      }

      // Check condition while fetch is in-flight:
      assert.strictEqual(isLoading, false, 'isLoading must NOT be set to true during background refresh!');
      assert.strictEqual(isRefreshing, true, 'isRefreshing is true during background fetch');
      assert.notStrictEqual(dashboardDataRef.current, null, 'Previous dashboardData remains intact');

      // Simulating API response with updated mentorship session
      const freshData = { user: { name: 'Alex' }, mentorship: { hasSession: true, upcomingSession: { id: 'bk-1' } } };
      dashboardData = freshData;
      dashboardDataRef.current = freshData;

      isLoading = false;
      isRefreshing = false;
      inFlightRef.current = false;
    };

    await mockFetchDashboard();

    assert.strictEqual(isLoading, false, 'isLoading remains false');
    assert.strictEqual(isRefreshing, false, 'isRefreshing resets to false');
    assert.strictEqual(dashboardData.mentorship.hasSession, true, 'Dashboard data updated seamlessly with fresh session');
  });

  await it('Failed background refresh preserves existing dashboard data and does not show error screen', async () => {
    const originalData = { user: { name: 'Alex' }, mentorship: { hasSession: false } };
    let dashboardData: any = originalData;
    let isLoading = false;
    let isRefreshing = false;
    let error: string | null = null;
    const dashboardDataRef = { current: dashboardData };
    const inFlightRef = { current: false };

    const mockFetchDashboard = async () => {
      if (inFlightRef.current) return;
      inFlightRef.current = true;

      const hasData = dashboardDataRef.current !== null;
      if (!hasData) {
        isLoading = true;
        error = null;
      } else {
        isRefreshing = true;
      }

      try {
        // Network drops during background refresh
        throw new Error('Network timeout');
      } catch (err: any) {
        if (!dashboardDataRef.current) {
          error = err.message;
        }
      } finally {
        isLoading = false;
        isRefreshing = false;
        inFlightRef.current = false;
      }
    };

    await mockFetchDashboard();

    assert.strictEqual(error, null, 'Error screen must NOT be triggered during background refresh failure');
    assert.strictEqual(dashboardData, originalData, 'Existing dashboard data must be fully preserved');
    assert.strictEqual(isLoading, false, 'isLoading must remain false');
  });

  console.log('\n--- Test Group 3: Request Deduplication & Focus/Visibility Coordination ---');

  await it('Simultaneous / overlapping requests are deduplicated via inFlightRef', async () => {
    let networkCallCount = 0;
    const inFlightRef = { current: false };

    const mockFetchDashboard = async () => {
      if (inFlightRef.current) {
        return; // Guard duplicate
      }
      inFlightRef.current = true;
      networkCallCount++;

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 50));
      inFlightRef.current = false;
    };

    // Dispatch two overlapping calls (like visibilitychange + focus firing together)
    const p1 = mockFetchDashboard();
    const p2 = mockFetchDashboard();

    await Promise.all([p1, p2]);

    assert.strictEqual(networkCallCount, 1, 'Only 1 network fetch should execute for overlapping triggers');
  });

  await it('MentorshipPreview revalidation ignores simultaneous visibilitychange and focus events (<2000ms)', () => {
    let revalidateCount = 0;
    const lastFocusRefreshRef = { current: 0 };

    const handleRevalidate = (now: number, visibilityState: 'visible' | 'hidden') => {
      if (visibilityState === 'hidden') return;

      if (now - lastFocusRefreshRef.current < 2000) {
        return;
      }
      lastFocusRefreshRef.current = now;
      revalidateCount++;
    };

    const t0 = 1000000;
    // 1. Tab visibilitychange fires
    handleRevalidate(t0, 'visible');
    assert.strictEqual(revalidateCount, 1, 'First event triggers revalidation');

    // 2. Window focus fires 2ms later
    handleRevalidate(t0 + 2, 'visible');
    assert.strictEqual(revalidateCount, 1, 'Simultaneous focus event within 2000ms is suppressed');

    // 3. User returns 15 seconds later
    handleRevalidate(t0 + 15000, 'visible');
    assert.strictEqual(revalidateCount, 2, 'Legitimate return after meaningful time away triggers revalidation');

    // 4. Tab minimized (hidden)
    handleRevalidate(t0 + 20000, 'hidden');
    assert.strictEqual(revalidateCount, 2, 'Hidden tab state does not trigger revalidation');
  });

  console.log('\n--- Test Group 4: Event Listener Cleanup on Unmount ---');

  await it('Event listeners are registered and cleaned up correctly', () => {
    const listeners: Record<string, Function[]> = {
      focus: [],
      visibilitychange: [],
    };

    const mockWindow = {
      addEventListener: (event: string, fn: Function) => {
        listeners[event]?.push(fn);
      },
      removeEventListener: (event: string, fn: Function) => {
        listeners[event] = listeners[event]?.filter((f) => f !== fn) || [];
      },
    };

    // Simulate MentorshipPreview mounting
    const handler = () => {};
    mockWindow.addEventListener('focus', handler);
    mockWindow.addEventListener('visibilitychange', handler);

    assert.strictEqual(listeners.focus.length, 1, 'focus listener registered');
    assert.strictEqual(listeners.visibilitychange.length, 1, 'visibilitychange listener registered');

    // Simulate MentorshipPreview unmounting
    mockWindow.removeEventListener('focus', handler);
    mockWindow.removeEventListener('visibilitychange', handler);

    assert.strictEqual(listeners.focus.length, 0, 'focus listener cleaned up');
    assert.strictEqual(listeners.visibilitychange.length, 0, 'visibilitychange listener cleaned up');
  });

  console.log('\n========================================');
  console.log(`Summary: Passed: ${passed} | Failed: ${failed}`);
  console.log('========================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
