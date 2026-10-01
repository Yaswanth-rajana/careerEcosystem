import {
  JobCardDTO,
  JobDetailDTO,
  ApplicationDTO,
  JobSearchParams,
  PaginatedResult,
} from '@backend/types/jobs';

export class JobsApiClient {
  /**
   * Search and filter jobs with AbortSignal support
   */
  static async searchJobs(
    params: JobSearchParams,
    signal?: AbortSignal
  ): Promise<PaginatedResult<JobCardDTO>> {
    const searchParams = new URLSearchParams();

    if (params.q) searchParams.set('q', params.q);
    if (params.location) searchParams.set('location', params.location);
    if (params.postedWithin) searchParams.set('postedWithin', params.postedWithin);
    if (params.sort) searchParams.set('sort', params.sort);
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.salaryMin) searchParams.set('salaryMin', params.salaryMin.toString());
    if (params.salaryMax) searchParams.set('salaryMax', params.salaryMax.toString());

    if (params.workMode) {
      const arr = Array.isArray(params.workMode) ? params.workMode : [params.workMode];
      if (arr.length > 0) searchParams.set('workMode', arr.join(','));
    }

    if (params.employmentType) {
      const arr = Array.isArray(params.employmentType) ? params.employmentType : [params.employmentType];
      if (arr.length > 0) searchParams.set('employmentType', arr.join(','));
    }

    if (params.experienceLevel) {
      const arr = Array.isArray(params.experienceLevel) ? params.experienceLevel : [params.experienceLevel];
      if (arr.length > 0) searchParams.set('experienceLevel', arr.join(','));
    }

    if (params.skills) {
      const arr = Array.isArray(params.skills) ? params.skills : [params.skills];
      if (arr.length > 0) searchParams.set('skills', arr.join(','));
    }

    const res = await fetch(`/api/jobs?${searchParams.toString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal,
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to search jobs');
    }

    return {
      items: data.items || [],
      total: data.total || 0,
      page: data.page || 1,
      limit: data.limit || 20,
      totalPages: data.totalPages || 1,
      hasNextPage: Boolean(data.hasNextPage),
      hasPrevPage: Boolean(data.hasPrevPage),
    };
  }

  /**
   * Fetch deterministic recommended jobs
   */
  static async getRecommendedJobs(limit: number = 3): Promise<JobCardDTO[]> {
    const res = await fetch(`/api/jobs/recommended?limit=${limit}`);
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to fetch recommendations');
    }
    return data.items || [];
  }

  /**
   * Fetch job details by ID
   */
  static async getJobById(id: string): Promise<JobDetailDTO> {
    const res = await fetch(`/api/jobs/${id}`);
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to fetch job details');
    }
    return data.job;
  }

  /**
   * Toggle save state for a job (PUT to save, DELETE to unsave)
   */
  static async toggleSaveJob(jobId: string, currentSaved: boolean): Promise<boolean> {
    const method = currentSaved ? 'DELETE' : 'PUT';
    const res = await fetch(`/api/jobs/${jobId}/save`, {
      method,
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to update saved state');
    }

    return data.isSaved;
  }

  /**
   * Fetch user's saved jobs
   */
  static async getSavedJobs(page: number = 1, limit: number = 20): Promise<PaginatedResult<JobCardDTO>> {
    const res = await fetch(`/api/jobs/saved?page=${page}&limit=${limit}`);
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to fetch saved jobs');
    }
    return data;
  }

  /**
   * Apply to a job
   */
  static async applyToJob(
    jobId: string,
    payload?: { coverNote?: string; answers?: any; resumeUrl?: string }
  ): Promise<ApplicationDTO> {
    const res = await fetch(`/api/jobs/${jobId}/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload || {}),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to submit application');
    }

    return data.application;
  }

  /**
   * Fetch candidate's applications
   */
  static async getApplications(page: number = 1, limit: number = 20): Promise<PaginatedResult<ApplicationDTO>> {
    const res = await fetch(`/api/jobs/applications?page=${page}&limit=${limit}`);
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to fetch applications');
    }
    return data;
  }

  /**
   * Withdraw an application
   */
  static async withdrawApplication(applicationId: string): Promise<ApplicationDTO> {
    const res = await fetch(`/api/jobs/applications/${applicationId}/withdraw`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to withdraw application');
    }

    return data.application;
  }
}
