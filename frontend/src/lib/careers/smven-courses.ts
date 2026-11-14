/**
 * Centralized SMVEN Training Courses Configuration & Career Mapping for PATHWAY.ECO.
 *
 * PATHWAY.ECO handles career exploration, guidance, skill-gap analysis, and learning roadmaps.
 * SMVEN (https://smven.com) handles course delivery, curriculum details, and registrations.
 * All external redirections open in a new browser tab without altering PATHWAY.ECO state.
 */

export interface SmvenCourse {
  id: string;
  slug: string;
  title: string;
  provider: 'SMVEN';
  url: string;
  isDedicatedUrlVerified: boolean;
  targetCareers: string[];
  skills: string[];
  tagline: string;
}

export const SMVEN_BASE_URL = process.env.NEXT_PUBLIC_SMVEN_URL || 'https://smven.com/';
export const SMVEN_IT_INFRASTRUCTURE_URL =
  process.env.NEXT_PUBLIC_SMVEN_IT_INFRASTRUCTURE_URL || 'https://smven.com/';

/**
 * 6 Official SMVEN IT Infrastructure Training Programs with verified dedicated landing pages.
 * Dedicated course paths can be overridden via environment variables if deployed to alternative domains.
 */
export const SMVEN_COURSES: Record<string, SmvenCourse> = {
  'cloud-computing': {
    id: 'cloud-computing',
    slug: 'cloud-computing',
    title: 'Cloud Computing',
    provider: 'SMVEN',
    url: process.env.NEXT_PUBLIC_SMVEN_CLOUD_URL || 'https://smven.com/cloud-computing',
    isDedicatedUrlVerified: true,
    targetCareers: ['cloud-engineer', 'site-reliability-engineer', 'it-infrastructure-engineer'],
    skills: ['AWS', 'Microsoft Azure', 'Cloud Architecture', 'Linux', 'IAM', 'VPC'],
    tagline: 'Multi-cloud administration, compute scaling, VPC networking, and enterprise cloud architecture.',
  },
  'devops-engineering': {
    id: 'devops-engineering',
    slug: 'devops-engineering',
    title: 'DevOps Engineering',
    provider: 'SMVEN',
    url: process.env.NEXT_PUBLIC_SMVEN_DEVOPS_URL || 'https://smven.com/devops-engineering',
    isDedicatedUrlVerified: true,
    targetCareers: ['devops-engineer', 'site-reliability-engineer', 'it-infrastructure-engineer'],
    skills: ['Docker', 'Kubernetes', 'CI/CD', 'Git', 'Terraform', 'Linux', 'Ansible'],
    tagline: 'CI/CD automation pipelines, container orchestration, and Infrastructure as Code.',
  },
  'virtualization-engineering': {
    id: 'virtualization-engineering',
    slug: 'virtualization-engineering',
    title: 'Virtualization Engineering',
    provider: 'SMVEN',
    url:
      process.env.NEXT_PUBLIC_SMVEN_VIRTUALIZATION_URL ||
      'https://smven.com/virtualization-engineering',
    isDedicatedUrlVerified: true,
    targetCareers: ['virtualization-engineer', 'it-infrastructure-engineer'],
    skills: ['VMware', 'Hyper-V', 'Virtual Machines', 'vCenter', 'vMotion', 'High Availability'],
    tagline: 'Enterprise hypervisor clustering, VMware ESXi administration, and datacenter hardware abstraction.',
  },
  'server-engineering': {
    id: 'server-engineering',
    slug: 'server-engineering',
    title: 'Server Engineering',
    provider: 'SMVEN',
    url: process.env.NEXT_PUBLIC_SMVEN_SERVER_URL || 'https://smven.com/server-engineering',
    isDedicatedUrlVerified: true,
    targetCareers: ['server-engineer', 'microsoft-administrator', 'it-infrastructure-engineer'],
    skills: ['Windows Server', 'Linux', 'Active Directory', 'PowerShell', 'Server Administration'],
    tagline: 'Enterprise Windows & Linux fleets, Active Directory domain services, and PowerShell automation.',
  },
  'storage-engineering': {
    id: 'storage-engineering',
    slug: 'storage-engineering',
    title: 'Storage Engineering',
    provider: 'SMVEN',
    url: process.env.NEXT_PUBLIC_SMVEN_STORAGE_URL || 'https://smven.com/storage-engineering',
    isDedicatedUrlVerified: true,
    targetCareers: ['backup-storage-engineer', 'it-infrastructure-engineer'],
    skills: ['SAN', 'NAS', 'Storage Management', 'RAID', 'Fibre Channel', 'iSCSI'],
    tagline: 'Enterprise SAN/NAS arrays, LUN provisioning, storage tiering, and high data availability.',
  },
  'backup-engineering': {
    id: 'backup-engineering',
    slug: 'backup-engineering',
    title: 'Backup Engineering',
    provider: 'SMVEN',
    url: process.env.NEXT_PUBLIC_SMVEN_BACKUP_URL || 'https://smven.com/backup-engineering',
    isDedicatedUrlVerified: true,
    targetCareers: ['backup-storage-engineer', 'it-infrastructure-engineer'],
    skills: ['Backup Solutions', 'Disaster Recovery', 'Data Protection', 'Veeam', 'Commvault'],
    tagline: 'Data durability, immutable 3-2-1 backup strategies, ransomware defense, and DR simulations.',
  },
};

/**
 * Strict Career-to-Course Mapping conforming to Business Requirements.
 */
export const CAREER_TO_SMVEN_COURSES_MAP: Record<string, string[]> = {
  'cloud-engineer': ['cloud-computing'],
  'devops-engineer': ['devops-engineering'],
  'site-reliability-engineer': ['devops-engineering', 'cloud-computing'],
  'virtualization-engineer': ['virtualization-engineering'],
  'server-engineer': ['server-engineering'],
  'network-security-engineer': [], // No directly matching course currently
  'backup-storage-engineer': ['storage-engineering', 'backup-engineering'],
  'it-infrastructure-engineer': [
    'cloud-computing',
    'server-engineering',
    'virtualization-engineering',
    'storage-engineering',
    'backup-engineering',
  ], // Relevant infrastructure courses
  'microsoft-administrator': ['server-engineering'], // Only where relevant to the required skills
  'it-service-management': [], // No directly matching course currently
};

/**
 * Retrieves all SMVEN courses recommended for a specific career path slug.
 */
export function getSmvenCoursesForCareer(careerSlug: string): SmvenCourse[] {
  const courseIds = CAREER_TO_SMVEN_COURSES_MAP[careerSlug] || [];
  return courseIds
    .map((id) => SMVEN_COURSES[id])
    .filter((course): course is SmvenCourse => Boolean(course));
}

/**
 * Retrieves the primary SMVEN course recommended for a career path slug.
 */
export function getPrimarySmvenCourseForCareer(careerSlug: string): SmvenCourse | undefined {
  const courses = getSmvenCoursesForCareer(careerSlug);
  return courses[0];
}

/**
 * Retrieves a single SMVEN course by its identifier.
 */
export function getSmvenCourseById(id: string): SmvenCourse | undefined {
  return SMVEN_COURSES[id];
}

/**
 * Returns all configured SMVEN courses as an array.
 */
export function getAllSmvenCourses(): SmvenCourse[] {
  return Object.values(SMVEN_COURSES);
}

