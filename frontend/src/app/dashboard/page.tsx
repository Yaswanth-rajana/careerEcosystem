import { redirect } from 'next/navigation';
import { getAuthenticatedUser } from '@/lib/serverAuth';
import { DashboardService } from '@backend/services/dashboardService';
import { DashboardDTO } from '@backend/types/dashboard';
import { DashboardClientView } from '@/components/dashboard/DashboardClientView';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect('/login?from=/dashboard');
  }

  let initialData: DashboardDTO | null = null;
  let initialError: string | null = null;

  try {
    initialData = await DashboardService.getDashboardData(user.id);
  } catch (err: any) {
    console.error('[DashboardPage] Failed to fetch server-side dashboard data:', err);
    initialError = err.message || 'Failed to retrieve dashboard data';
  }

  return (
    <DashboardClientView
      initialData={initialData}
      initialError={initialError}
    />
  );
}

