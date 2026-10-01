export type EmployerApplicationStatus =
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'NEEDS_INFORMATION'
  | 'APPROVED'
  | 'REJECTED'
  | 'SUSPENDED';

export interface EmployerApplicationSubmissionDTO {
  // Step 1: About You
  fullName: string;
  workEmail: string;
  phone: string;
  designation: string;
  linkedInUrl?: string | null;

  // Step 2: Company
  companyName: string;
  companyWebsite: string;
  companyLinkedIn?: string | null;
  industry: string;
  companySize: string;
  headquartersLocation: string;

  // Step 3: Hiring
  rolesHired: string[];
  hiringVolume?: string | null;
  preferredExperienceLevels: string[];
  hiringLocations: string[];
  workModes: string[];

  // Step 4: Verification
  verificationNotes?: string | null;
}

export interface EmployerApplicationListDTO {
  id: string;
  referenceId: string;
  fullName: string;
  workEmail: string;
  phone: string;
  designation: string;
  companyName: string;
  companyWebsite: string;
  industry: string;
  companySize: string;
  status: EmployerApplicationStatus;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  approvedAt?: string | null;
  createdAt: string;
}

export interface EmployerApplicationDetailDTO extends EmployerApplicationListDTO {
  linkedInUrl?: string | null;
  companyLinkedIn?: string | null;
  headquartersLocation: string;
  rolesHired: string[];
  hiringVolume?: string | null;
  preferredExperienceLevels: string[];
  hiringLocations: string[];
  workModes: string[];
  verificationNotes?: string | null;
  decisionReason?: string | null;
  internalAdminNotes?: string | null;
  userId?: string | null;
  companyId?: string | null;
}
