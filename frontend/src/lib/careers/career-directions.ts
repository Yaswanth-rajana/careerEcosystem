/**
 * Structured career directions data configuration for PATHWAY.ECO.
 * Defines the 10 specific IT, Cloud, DevOps, and Infrastructure career directions,
 * their detailed card descriptions, required technical skills, experience levels,
 * salary benchmarks, and exploration routes.
 */

export interface CareerSalaryRange {
  min?: number;
  max?: number;
  currency: string;
  period?: string;
  formatted: string;
  source?: string;
}

export interface CareerDirectionItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  skills: string[];
  experienceLevel: 'Beginner' | 'Intermediate';
  salaryRange?: CareerSalaryRange;
  iconName: string;
  roles: string[];
  role: string;
  href: string;
  category: string;
  keywords: string[];
}

export const CAREER_DIRECTIONS: readonly CareerDirectionItem[] = [
  {
    id: 'cloud-engineer',
    slug: 'cloud-engineer',
    title: 'Cloud Engineer',
    description:
      'Design, deploy and manage scalable cloud infrastructure, services and applications using cloud platforms.',
    skills: ['AWS', 'Microsoft Azure', 'Linux', 'Networking', 'Cloud Architecture'],
    experienceLevel: 'Beginner',
    salaryRange: {
      min: 1000000,
      max: 1800000,
      currency: 'INR',
      period: 'LPA',
      formatted: '₹10–18 LPA',
      source: 'Industry Benchmark',
    },
    iconName: 'Cloud',
    roles: ['Cloud Engineer', 'Cloud Solutions Engineer'],
    role: 'Cloud Engineer, Cloud Solutions Engineer',
    href: '/careers/cloud-engineer',
    category: 'Technology',
    keywords: [
      'cloud',
      'aws',
      'azure',
      'amazon web services',
      'microsoft azure',
      'infrastructure',
      'ec2',
      's3',
      'vpc',
      'iam',
      'cloud architecture',
    ],
  },
  {
    id: 'devops-engineer',
    slug: 'devops-engineer',
    title: 'DevOps Engineer',
    description:
      'Automate software delivery pipelines, manage infrastructure and streamline application deployment and operations.',
    skills: ['Docker', 'Kubernetes', 'CI/CD', 'Git', 'Terraform', 'Linux'],
    experienceLevel: 'Beginner',
    salaryRange: {
      min: 1100000,
      max: 2200000,
      currency: 'INR',
      period: 'LPA',
      formatted: '₹11–22 LPA',
      source: 'Industry Benchmark',
    },
    iconName: 'GitBranch',
    roles: ['DevOps Engineer', 'Build & Release Engineer'],
    role: 'DevOps Engineer, Build & Release Engineer',
    href: '/careers/devops-engineer',
    category: 'Technology',
    keywords: [
      'devops',
      'docker',
      'kubernetes',
      'k8s',
      'ci/cd',
      'git',
      'terraform',
      'iac',
      'pipeline',
      'automation',
      'linux',
    ],
  },
  {
    id: 'site-reliability-engineer',
    slug: 'site-reliability-engineer',
    title: 'Site Reliability Engineer',
    description:
      'Improve system reliability, availability and performance through automation, monitoring and incident management.',
    skills: ['Linux', 'Prometheus', 'Grafana', 'Monitoring', 'Python', 'Incident Management'],
    experienceLevel: 'Intermediate',
    salaryRange: {
      min: 1200000,
      max: 2400000,
      currency: 'INR',
      period: 'LPA',
      formatted: '₹12–24 LPA',
      source: 'Industry Benchmark',
    },
    iconName: 'Activity',
    roles: ['Site Reliability Engineer', 'Reliability Engineer'],
    role: 'Site Reliability Engineer, Reliability Engineer',
    href: '/careers/site-reliability-engineer',
    category: 'Technology',
    keywords: [
      'sre',
      'site reliability engineer',
      'reliability',
      'prometheus',
      'grafana',
      'monitoring',
      'incident management',
      'python',
      'linux',
      'automation',
      'slo',
      'sli',
    ],
  },
  {
    id: 'virtualization-engineer',
    slug: 'virtualization-engineer',
    title: 'Virtualization Engineer',
    description:
      'Design and manage virtualized computing environments, virtual machines and enterprise infrastructure platforms.',
    skills: ['VMware', 'Hyper-V', 'Virtual Machines', 'Networking', 'Virtualization Management'],
    experienceLevel: 'Beginner',
    salaryRange: {
      min: 700000,
      max: 1500000,
      currency: 'INR',
      period: 'LPA',
      formatted: '₹7–15 LPA',
      source: 'Industry Benchmark',
    },
    iconName: 'Layers',
    roles: ['Virtualization Engineer', 'Virtual Infrastructure Administrator'],
    role: 'Virtualization Engineer, Virtual Infrastructure Administrator',
    href: '/careers/virtualization-engineer',
    category: 'Technology',
    keywords: [
      'virtualization',
      'vmware',
      'hyper-v',
      'virtual machines',
      'vms',
      'esxi',
      'vcenter',
      'hypervisor',
      'virtualization management',
      'networking',
      'storage',
    ],
  },
  {
    id: 'server-engineer',
    slug: 'server-engineer',
    title: 'Server Engineer',
    description:
      'Install, configure, maintain and troubleshoot enterprise servers and operating systems to ensure reliable infrastructure operations.',
    skills: ['Linux', 'Windows Server', 'Server Administration', 'Active Directory', 'PowerShell'],
    experienceLevel: 'Beginner',
    salaryRange: {
      min: 600000,
      max: 1400000,
      currency: 'INR',
      period: 'LPA',
      formatted: '₹6–14 LPA',
      source: 'Industry Benchmark',
    },
    iconName: 'Server',
    roles: ['Server Engineer', 'Systems Administrator'],
    role: 'Server Engineer, Systems Administrator',
    href: '/careers/server-engineer',
    category: 'Technology',
    keywords: [
      'server',
      'server engineer',
      'systems administrator',
      'sysadmin',
      'windows server',
      'linux',
      'server administration',
      'active directory',
      'ad',
      'powershell',
      'operating systems',
    ],
  },
  {
    id: 'network-security-engineer',
    slug: 'network-security-engineer',
    title: 'Network & Security Engineer',
    description:
      'Design, secure and maintain enterprise networks while protecting systems against network-based threats and vulnerabilities.',
    skills: ['TCP/IP', 'Routing', 'Switching', 'Firewalls', 'VPN', 'Network Security'],
    experienceLevel: 'Intermediate',
    salaryRange: {
      min: 800000,
      max: 1800000,
      currency: 'INR',
      period: 'LPA',
      formatted: '₹8–18 LPA',
      source: 'Industry Benchmark',
    },
    iconName: 'ShieldCheck',
    roles: ['Network Engineer', 'Network Security Engineer'],
    role: 'Network Engineer, Network Security Engineer',
    href: '/careers/network-security-engineer',
    category: 'Technology',
    keywords: [
      'network',
      'security',
      'firewalls',
      'firewall',
      'tcp/ip',
      'routing',
      'switching',
      'vpn',
      'cisco',
      'network security',
      'threats',
      'vulnerabilities',
    ],
  },
  {
    id: 'backup-storage-engineer',
    slug: 'backup-storage-engineer',
    title: 'Backup & Storage Engineer',
    description:
      'Manage enterprise storage systems, backup infrastructure and disaster recovery solutions to protect critical business data.',
    skills: ['NAS', 'SAN', 'Backup Solutions', 'Disaster Recovery', 'Data Protection', 'Storage Management'],
    experienceLevel: 'Beginner',
    salaryRange: {
      min: 700000,
      max: 1600000,
      currency: 'INR',
      period: 'LPA',
      formatted: '₹7–16 LPA',
      source: 'Industry Benchmark',
    },
    iconName: 'HardDrive',
    roles: ['Backup Engineer', 'Storage Administrator'],
    role: 'Backup Engineer, Storage Administrator',
    href: '/careers/backup-storage-engineer',
    category: 'Technology',
    keywords: [
      'backup',
      'storage',
      'san',
      'nas',
      'backup solutions',
      'disaster recovery',
      'dr',
      'data protection',
      'storage management',
      'recovery',
    ],
  },
  {
    id: 'it-infrastructure-engineer',
    slug: 'it-infrastructure-engineer',
    title: 'IT Infrastructure Engineer',
    description:
      'Build, maintain and monitor IT infrastructure, ensuring reliable connectivity, computing resources and enterprise systems.',
    skills: ['Networking', 'Linux', 'Windows Server', 'Cloud Infrastructure', 'Monitoring', 'Infrastructure Management'],
    experienceLevel: 'Beginner',
    salaryRange: {
      min: 700000,
      max: 1600000,
      currency: 'INR',
      period: 'LPA',
      formatted: '₹7–16 LPA',
      source: 'Industry Benchmark',
    },
    iconName: 'Network',
    roles: ['IT Infrastructure Engineer', 'Infrastructure Administrator'],
    role: 'IT Infrastructure Engineer, Infrastructure Administrator',
    href: '/careers/it-infrastructure-engineer',
    category: 'Technology',
    keywords: [
      'it infrastructure',
      'infrastructure',
      'monitoring',
      'networking',
      'linux',
      'windows server',
      'cloud infrastructure',
      'enterprise systems',
      'infrastructure management',
    ],
  },
  {
    id: 'microsoft-administrator',
    slug: 'microsoft-administrator',
    title: 'Microsoft Administrator',
    description:
      'Manage Microsoft enterprise environments, user identities, collaboration tools and cloud-based administration services.',
    skills: ['Microsoft 365', 'Azure', 'Active Directory', 'Microsoft Entra ID', 'PowerShell'],
    experienceLevel: 'Beginner',
    salaryRange: {
      min: 600000,
      max: 1400000,
      currency: 'INR',
      period: 'LPA',
      formatted: '₹6–14 LPA',
      source: 'Industry Benchmark',
    },
    iconName: 'LayoutGrid',
    roles: ['Microsoft 365 Administrator', 'Azure Administrator'],
    role: 'Microsoft 365 Administrator, Azure Administrator',
    href: '/careers/microsoft-administrator',
    category: 'Technology',
    keywords: [
      'microsoft',
      'microsoft 365',
      'm365',
      'azure',
      'active directory',
      'ad',
      'entra id',
      'microsoft entra id',
      'office 365',
      'powershell',
      'admin',
      'user identities',
    ],
  },
  {
    id: 'it-service-management',
    slug: 'it-service-management',
    title: 'IT Service Management',
    description:
      'Manage IT service operations, service requests, incidents, problems and changes to ensure efficient IT service delivery.',
    skills: ['ITIL', 'ServiceNow', 'Incident Management', 'Problem Management', 'Change Management'],
    experienceLevel: 'Beginner',
    salaryRange: {
      min: 700000,
      max: 1500000,
      currency: 'INR',
      period: 'LPA',
      formatted: '₹7–15 LPA',
      source: 'Industry Benchmark',
    },
    iconName: 'Workflow',
    roles: ['ITSM Analyst', 'IT Service Manager'],
    role: 'ITSM Analyst, IT Service Manager',
    href: '/careers/it-service-management',
    category: 'Technology',
    keywords: [
      'itsm',
      'it service management',
      'servicenow',
      'itil',
      'incident management',
      'change management',
      'problem management',
      'service desk',
      'service delivery',
    ],
  },
];

export function getCareerDirections(): readonly CareerDirectionItem[] {
  return CAREER_DIRECTIONS;
}

export function getCareerDirectionById(id: string): CareerDirectionItem | undefined {
  return CAREER_DIRECTIONS.find((d) => d.id === id);
}

export function getCareerDirectionBySlug(slug: string): CareerDirectionItem | undefined {
  return CAREER_DIRECTIONS.find((d) => d.slug === slug || d.id === slug);
}

/**
 * Filter the 10 core career directions by live search query across
 * title, skills, description, roles, and keywords.
 */
export function getExploreCareerDirections(searchQuery?: string): CareerDirectionItem[] {
  if (!searchQuery || !searchQuery.trim()) {
    return [...CAREER_DIRECTIONS];
  }

  const q = searchQuery.toLowerCase().trim();

  return CAREER_DIRECTIONS.filter((career) => {
    return (
      career.title.toLowerCase().includes(q) ||
      career.description.toLowerCase().includes(q) ||
      career.skills.some((s) => s.toLowerCase().includes(q)) ||
      career.roles.some((r) => r.toLowerCase().includes(q)) ||
      career.keywords.some((k) => k.toLowerCase().includes(q)) ||
      career.experienceLevel.toLowerCase().includes(q)
    );
  });
}
