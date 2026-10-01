import { db } from '../db/client';
import { AuditLogDTO, PaginatedAdminResult } from '../types/admin';

export interface CreateAuditLogParams {
  actorId: string;
  actorEmail: string;
  actorName: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details?: Record<string, any>;
  ipAddress?: string | null;
}

export interface ListAuditLogsParams {
  page?: number;
  limit?: number;
  actorId?: string;
  action?: string;
  resourceType?: string;
  q?: string;
}

export class AuditService {
  /**
   * Records an immutable audit log entry.
   * Sanitizes payloads to ensure sensitive tokens/passwords are NEVER logged.
   */
  static async log(params: CreateAuditLogParams): Promise<void> {
    try {
      let sanitizedDetails: string | null = null;
      if (params.details) {
        const copy = { ...params.details };
        // Strip sensitive fields
        delete copy.password;
        delete copy.passwordHash;
        delete copy.token;
        delete copy.sessionToken;
        delete copy.secret;
        sanitizedDetails = JSON.stringify(copy);
      }

      await db.auditLog.create({
        data: {
          actorId: params.actorId,
          actorEmail: params.actorEmail,
          actorName: params.actorName,
          action: params.action,
          resourceType: params.resourceType,
          resourceId: params.resourceId,
          details: sanitizedDetails,
          ipAddress: params.ipAddress || null,
        },
      });
    } catch (err) {
      console.error('[AuditService.log] Failed to create audit log:', err);
      // Non-blocking in case of audit failure, but logged to stderr
    }
  }

  /**
   * Retrieves paginated audit logs with search and filtering.
   */
  static async listLogs(params: ListAuditLogsParams = {}): Promise<PaginatedAdminResult<AuditLogDTO>> {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 25));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.actorId) {
      where.actorId = params.actorId;
    }
    if (params.action) {
      where.action = params.action;
    }
    if (params.resourceType) {
      where.resourceType = params.resourceType;
    }
    if (params.q?.trim()) {
      const q = params.q.trim();
      where.OR = [
        { actorName: { contains: q, mode: 'insensitive' } },
        { actorEmail: { contains: q, mode: 'insensitive' } },
        { action: { contains: q, mode: 'insensitive' } },
        { resourceType: { contains: q, mode: 'insensitive' } },
        { resourceId: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [total, records] = await Promise.all([
      db.auditLog.count({ where }),
      db.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    const items: AuditLogDTO[] = records.map((r) => {
      let parsedDetails: Record<string, any> | null = null;
      if (r.details) {
        try {
          parsedDetails = JSON.parse(r.details);
        } catch {
          parsedDetails = { raw: r.details };
        }
      }
      return {
        id: r.id,
        actorId: r.actorId,
        actorEmail: r.actorEmail,
        actorName: r.actorName,
        action: r.action,
        resourceType: r.resourceType,
        resourceId: r.resourceId,
        details: parsedDetails,
        ipAddress: r.ipAddress,
        createdAt: r.createdAt.toISOString(),
      };
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }
}
