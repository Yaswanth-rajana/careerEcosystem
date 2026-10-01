import { NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/serverAuth';
import { AuditService } from '@backend/services/auditService';
import { Permission } from '@backend/types/rbac';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await getAuthenticatedAdmin(Permission.AUDIT_LOGS_READ);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '25', 10);
    const q = searchParams.get('q') || '';
    const action = searchParams.get('action') || undefined;
    const resourceType = searchParams.get('resourceType') || undefined;
    const actorId = searchParams.get('actorId') || undefined;

    const data = await AuditService.listLogs({
      page,
      limit,
      q,
      action,
      resourceType,
      actorId,
    });

    return NextResponse.json(data);
  } catch (err: any) {
    const status = err.statusCode || 500;
    return NextResponse.json({ error: err.message || 'Failed to list audit logs' }, { status });
  }
}
