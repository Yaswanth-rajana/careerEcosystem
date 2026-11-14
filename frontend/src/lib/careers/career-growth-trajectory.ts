/**
 * Standardized 3-Level Career Growth Trajectories for PATHWAY.ECO.
 * Standard progression: Fresher (0–1 yrs) → Associate (1–3 yrs) → Senior (3–5+ yrs).
 * Architect/Lead-level tiers are eliminated across all career paths.
 */

export type TrajectoryLevelKey = 'fresher' | 'associate' | 'senior';

export interface CareerGrowthLevel {
  level: 'Fresher' | 'Associate' | 'Senior';
  levelKey: TrajectoryLevelKey;
  title: string;
  experienceRange: string;
  description: string;
  learningFocus: string;
  competencies: string[];
}

export const CAREER_GROWTH_TRAJECTORIES: Record<
  string,
  Record<TrajectoryLevelKey, CareerGrowthLevel>
> = {
  'cloud-engineer': {
    fresher: {
      level: 'Fresher',
      levelKey: 'fresher',
      title: 'Cloud Support Associate',
      experienceRange: '0–1 years',
      description:
        'Understand cloud fundamentals, provision basic compute instances and configure cloud storage.',
      learningFocus:
        'Understand cloud fundamentals, provision basic compute instances and configure cloud storage.',
      competencies: [
        'AWS EC2 basics',
        'S3',
        'Azure fundamentals',
        'Linux CLI',
        'IAM basics',
      ],
    },
    associate: {
      level: 'Associate',
      levelKey: 'associate',
      title: 'Cloud Engineer',
      experienceRange: '1–3 years',
      description:
        'Deploy cloud infrastructure, manage cloud resources, configure networking and automate routine operations.',
      learningFocus:
        'Deploy cloud infrastructure, manage cloud resources, configure networking and automate routine operations.',
      competencies: [
        'AWS/Azure services',
        'VPC',
        'IAM',
        'Terraform',
        'Cloud Monitoring',
      ],
    },
    senior: {
      level: 'Senior',
      levelKey: 'senior',
      title: 'Senior Cloud Engineer',
      experienceRange: '3–5+ years',
      description:
        'Design scalable cloud environments, optimize performance and costs, and manage cloud security and reliability.',
      learningFocus:
        'Design scalable cloud environments, optimize performance and costs, and manage cloud security and reliability.',
      competencies: [
        'Cloud Architecture',
        'Infrastructure as Code',
        'High Availability',
        'Cost Optimization',
        'Cloud Security',
      ],
    },
  },

  'devops-engineer': {
    fresher: {
      level: 'Fresher',
      levelKey: 'fresher',
      title: 'DevOps Trainee',
      experienceRange: '0–1 years',
      description:
        'Learn version control, Linux fundamentals and basic software deployment workflows.',
      learningFocus:
        'Learn version control, Linux fundamentals and basic software deployment workflows.',
      competencies: [
        'Git',
        'Linux',
        'Shell Scripting',
        'Docker fundamentals',
        'CI/CD basics',
      ],
    },
    associate: {
      level: 'Associate',
      levelKey: 'associate',
      title: 'DevOps Engineer',
      experienceRange: '1–3 years',
      description:
        'Build CI/CD pipelines, manage containers and automate application deployment.',
      learningFocus:
        'Build CI/CD pipelines, manage containers and automate application deployment.',
      competencies: [
        'Jenkins',
        'GitHub Actions',
        'Docker',
        'Kubernetes',
        'Terraform',
      ],
    },
    senior: {
      level: 'Senior',
      levelKey: 'senior',
      title: 'Senior DevOps Engineer',
      experienceRange: '3–5+ years',
      description:
        'Design deployment strategies, optimize delivery pipelines and manage scalable infrastructure automation.',
      learningFocus:
        'Design deployment strategies, optimize delivery pipelines and manage scalable infrastructure automation.',
      competencies: [
        'Kubernetes',
        'GitOps',
        'Infrastructure as Code',
        'Cloud Automation',
        'DevSecOps',
      ],
    },
  },

  'site-reliability-engineer': {
    fresher: {
      level: 'Fresher',
      levelKey: 'fresher',
      title: 'SRE Trainee',
      experienceRange: '0–1 years',
      description:
        'Learn Linux administration, system monitoring and basic troubleshooting.',
      learningFocus:
        'Learn Linux administration, system monitoring and basic troubleshooting.',
      competencies: [
        'Linux',
        'Networking',
        'Python',
        'Monitoring Fundamentals',
      ],
    },
    associate: {
      level: 'Associate',
      levelKey: 'associate',
      title: 'Site Reliability Engineer',
      experienceRange: '1–3 years',
      description:
        'Monitor production systems, investigate incidents and improve service reliability.',
      learningFocus:
        'Monitor production systems, investigate incidents and improve service reliability.',
      competencies: [
        'Prometheus',
        'Grafana',
        'Logging',
        'Incident Management',
        'Automation',
      ],
    },
    senior: {
      level: 'Senior',
      levelKey: 'senior',
      title: 'Senior Site Reliability Engineer',
      experienceRange: '3–5+ years',
      description:
        'Improve large-scale system reliability, establish SLOs and automate operational processes.',
      learningFocus:
        'Improve large-scale system reliability, establish SLOs and automate operational processes.',
      competencies: [
        'SLI/SLO',
        'Distributed Systems',
        'Observability',
        'Capacity Planning',
        'Reliability Engineering',
      ],
    },
  },

  'virtualization-engineer': {
    fresher: {
      level: 'Fresher',
      levelKey: 'fresher',
      title: 'Virtualization Support Associate',
      experienceRange: '0–1 years',
      description:
        'Understand virtualization fundamentals and create and manage basic virtual machines.',
      learningFocus:
        'Understand virtualization fundamentals and create and manage basic virtual machines.',
      competencies: [
        'Virtual Machines',
        'VMware Fundamentals',
        'Hyper-V Basics',
        'Networking',
      ],
    },
    associate: {
      level: 'Associate',
      levelKey: 'associate',
      title: 'Virtualization Engineer',
      experienceRange: '1–3 years',
      description:
        'Configure and maintain virtual environments and manage virtual infrastructure resources.',
      learningFocus:
        'Configure and maintain virtual environments and manage virtual infrastructure resources.',
      competencies: [
        'VMware vSphere',
        'Hyper-V',
        'Virtual Networking',
        'Resource Management',
      ],
    },
    senior: {
      level: 'Senior',
      levelKey: 'senior',
      title: 'Senior Virtualization Engineer',
      experienceRange: '3–5+ years',
      description:
        'Optimize enterprise virtualization environments, manage high availability and plan infrastructure capacity.',
      learningFocus:
        'Optimize enterprise virtualization environments, manage high availability and plan infrastructure capacity.',
      competencies: [
        'VMware Infrastructure',
        'Hyper-V Administration',
        'High Availability',
        'Virtualization Security',
        'Capacity Planning',
      ],
    },
  },

  'server-engineer': {
    fresher: {
      level: 'Fresher',
      levelKey: 'fresher',
      title: 'Server Support Associate',
      experienceRange: '0–1 years',
      description:
        'Learn server operating systems, installation, configuration and basic troubleshooting.',
      learningFocus:
        'Learn server operating systems, installation, configuration and basic troubleshooting.',
      competencies: [
        'Linux Basics',
        'Windows Server Basics',
        'Command Line',
        'Hardware Fundamentals',
      ],
    },
    associate: {
      level: 'Associate',
      levelKey: 'associate',
      title: 'Server Engineer',
      experienceRange: '1–3 years',
      description:
        'Administer servers, manage users and permissions, monitor system performance and troubleshoot server issues.',
      learningFocus:
        'Administer servers, manage users and permissions, monitor system performance and troubleshoot server issues.',
      competencies: [
        'Linux Administration',
        'Windows Server',
        'Active Directory',
        'PowerShell',
        'Server Monitoring',
      ],
    },
    senior: {
      level: 'Senior',
      levelKey: 'senior',
      title: 'Senior Server Engineer',
      experienceRange: '3–5+ years',
      description:
        'Manage enterprise server environments, improve availability and implement server security and performance strategies.',
      learningFocus:
        'Manage enterprise server environments, improve availability and implement server security and performance strategies.',
      competencies: [
        'Advanced Linux',
        'Windows Server Administration',
        'Server Hardening',
        'High Availability',
        'Automation',
      ],
    },
  },

  'network-security-engineer': {
    fresher: {
      level: 'Fresher',
      levelKey: 'fresher',
      title: 'Network Support Associate',
      experienceRange: '0–1 years',
      description:
        'Understand networking fundamentals, configure basic network devices and troubleshoot connectivity.',
      learningFocus:
        'Understand networking fundamentals, configure basic network devices and troubleshoot connectivity.',
      competencies: [
        'TCP/IP',
        'DNS',
        'DHCP',
        'Routing Fundamentals',
        'Switching Fundamentals',
      ],
    },
    associate: {
      level: 'Associate',
      levelKey: 'associate',
      title: 'Network & Security Engineer',
      experienceRange: '1–3 years',
      description:
        'Configure enterprise networks, manage firewall policies and monitor network security.',
      learningFocus:
        'Configure enterprise networks, manage firewall policies and monitor network security.',
      competencies: [
        'Routing',
        'Switching',
        'Firewalls',
        'VPN',
        'Network Security Monitoring',
      ],
    },
    senior: {
      level: 'Senior',
      levelKey: 'senior',
      title: 'Senior Network & Security Engineer',
      experienceRange: '3–5+ years',
      description:
        'Design secure enterprise networks, implement security controls and manage network infrastructure reliability.',
      learningFocus:
        'Design secure enterprise networks, implement security controls and manage network infrastructure reliability.',
      competencies: [
        'Network Architecture',
        'Advanced Firewall Management',
        'Zero Trust',
        'IDS/IPS',
        'Network Security Auditing',
      ],
    },
  },

  'backup-storage-engineer': {
    fresher: {
      level: 'Fresher',
      levelKey: 'fresher',
      title: 'Storage Support Associate',
      experienceRange: '0–1 years',
      description:
        'Understand storage fundamentals, backup procedures and basic data protection operations.',
      learningFocus:
        'Understand storage fundamentals, backup procedures and basic data protection operations.',
      competencies: [
        'Storage Fundamentals',
        'Backup Basics',
        'NAS',
        'SAN Fundamentals',
      ],
    },
    associate: {
      level: 'Associate',
      levelKey: 'associate',
      title: 'Backup & Storage Engineer',
      experienceRange: '1–3 years',
      description:
        'Configure backup solutions, monitor storage systems and perform recovery operations.',
      learningFocus:
        'Configure backup solutions, monitor storage systems and perform recovery operations.',
      competencies: [
        'Backup Administration',
        'NAS/SAN',
        'Disaster Recovery',
        'Storage Monitoring',
      ],
    },
    senior: {
      level: 'Senior',
      levelKey: 'senior',
      title: 'Senior Backup & Storage Engineer',
      experienceRange: '3–5+ years',
      description:
        'Design enterprise data protection strategies, optimize storage infrastructure and manage disaster recovery.',
      learningFocus:
        'Design enterprise data protection strategies, optimize storage infrastructure and manage disaster recovery.',
      competencies: [
        'Enterprise Storage',
        'Backup Architecture',
        'Disaster Recovery Planning',
        'Data Replication',
        'Business Continuity',
      ],
    },
  },

  'it-infrastructure-engineer': {
    fresher: {
      level: 'Fresher',
      levelKey: 'fresher',
      title: 'IT Infrastructure Support Associate',
      experienceRange: '0–1 years',
      description:
        'Learn IT infrastructure fundamentals, hardware, operating systems and network support.',
      learningFocus:
        'Learn IT infrastructure fundamentals, hardware, operating systems and network support.',
      competencies: [
        'Computer Hardware',
        'Linux Basics',
        'Windows',
        'Networking Fundamentals',
      ],
    },
    associate: {
      level: 'Associate',
      levelKey: 'associate',
      title: 'IT Infrastructure Engineer',
      experienceRange: '1–3 years',
      description:
        'Maintain enterprise infrastructure, monitor systems and manage infrastructure-related incidents.',
      learningFocus:
        'Maintain enterprise infrastructure, monitor systems and manage infrastructure-related incidents.',
      competencies: [
        'Server Administration',
        'Networking',
        'Virtualization',
        'Monitoring',
        'Cloud Fundamentals',
      ],
    },
    senior: {
      level: 'Senior',
      levelKey: 'senior',
      title: 'Senior IT Infrastructure Engineer',
      experienceRange: '3–5+ years',
      description:
        'Improve enterprise infrastructure reliability, manage capacity and coordinate infrastructure upgrades.',
      learningFocus:
        'Improve enterprise infrastructure reliability, manage capacity and coordinate infrastructure upgrades.',
      competencies: [
        'Infrastructure Automation',
        'Enterprise Networking',
        'Hybrid Infrastructure',
        'High Availability',
        'Infrastructure Security',
      ],
    },
  },

  'microsoft-administrator': {
    fresher: {
      level: 'Fresher',
      levelKey: 'fresher',
      title: 'Microsoft 365 Support Associate',
      experienceRange: '0–1 years',
      description:
        'Learn Microsoft 365 administration, user management and basic enterprise support.',
      learningFocus:
        'Learn Microsoft 365 administration, user management and basic enterprise support.',
      competencies: [
        'Microsoft 365 Fundamentals',
        'Outlook',
        'Teams',
        'Active Directory Basics',
      ],
    },
    associate: {
      level: 'Associate',
      levelKey: 'associate',
      title: 'Microsoft Administrator',
      experienceRange: '1–3 years',
      description:
        'Manage Microsoft 365 environments, user identities, access policies and cloud administration.',
      learningFocus:
        'Manage Microsoft 365 environments, user identities, access policies and cloud administration.',
      competencies: [
        'Microsoft 365 Administration',
        'Microsoft Entra ID',
        'Azure Administration',
        'PowerShell',
      ],
    },
    senior: {
      level: 'Senior',
      levelKey: 'senior',
      title: 'Senior Microsoft Administrator',
      experienceRange: '3–5+ years',
      description:
        'Manage enterprise Microsoft environments, strengthen identity security and optimize cloud administration.',
      learningFocus:
        'Manage enterprise Microsoft environments, strengthen identity security and optimize cloud administration.',
      competencies: [
        'Microsoft Entra ID',
        'Identity Governance',
        'Microsoft Intune',
        'Security Policies',
        'PowerShell Automation',
      ],
    },
  },

  'it-service-management': {
    fresher: {
      level: 'Fresher',
      levelKey: 'fresher',
      title: 'IT Service Desk Associate',
      experienceRange: '0–1 years',
      description:
        'Understand IT service operations, manage basic service requests and provide user support.',
      learningFocus:
        'Understand IT service operations, manage basic service requests and provide user support.',
      competencies: [
        'ITIL Fundamentals',
        'Ticket Management',
        'Incident Logging',
        'Communication',
      ],
    },
    associate: {
      level: 'Associate',
      levelKey: 'associate',
      title: 'ITSM Analyst',
      experienceRange: '1–3 years',
      description:
        'Manage incidents, service requests, problems and change workflows using ITSM platforms.',
      learningFocus:
        'Manage incidents, service requests, problems and change workflows using ITSM platforms.',
      competencies: [
        'ServiceNow',
        'Incident Management',
        'Problem Management',
        'Change Management',
        'ITIL Practices',
      ],
    },
    senior: {
      level: 'Senior',
      levelKey: 'senior',
      title: 'Senior ITSM Specialist',
      experienceRange: '3–5+ years',
      description:
        'Improve IT service delivery, optimize service management processes and manage service performance.',
      learningFocus:
        'Improve IT service delivery, optimize service management processes and manage service performance.',
      competencies: [
        'ITIL Practices',
        'ServiceNow Administration',
        'Service Improvement',
        'SLA Management',
        'Service Operations',
      ],
    },
  },
};

export const STANDARD_TRAJECTORY_KEYS: readonly TrajectoryLevelKey[] = [
  'fresher',
  'associate',
  'senior',
];

export function getCareerGrowthTrajectory(slug: string): CareerGrowthLevel[] {
  const trajectory = CAREER_GROWTH_TRAJECTORIES[slug];
  if (trajectory) {
    return [trajectory.fresher, trajectory.associate, trajectory.senior];
  }

  // Fallback progression for any legacy or unspecified roles
  return [
    {
      level: 'Fresher',
      levelKey: 'fresher',
      title: `Associate ${slug.replace(/-/g, ' ')}`,
      experienceRange: '0–1 years',
      description: 'Master core foundations, guided workflows, and hands-on practice.',
      learningFocus: 'Core technical fundamentals, tooling, and mentored delivery.',
      competencies: ['Foundations', 'Syntax & Workflows', 'Version Control', 'Guided Tasks'],
    },
    {
      level: 'Associate',
      levelKey: 'associate',
      title: slug.replace(/-/g, ' '),
      experienceRange: '1–3 years',
      description: 'Own features, automate tasks, and manage day-to-day operations independently.',
      learningFocus: 'Independent delivery, troubleshooting, and production workflows.',
      competencies: ['Core Stack Mastery', 'Troubleshooting', 'Automation', 'Feature Delivery'],
    },
    {
      level: 'Senior',
      levelKey: 'senior',
      title: `Senior ${slug.replace(/-/g, ' ')}`,
      experienceRange: '3–5+ years',
      description: 'Lead technical execution, optimize systems, and uphold best practices.',
      learningFocus: 'Scale, performance optimization, system resilience, and peer mentorship.',
      competencies: ['System Architecture', 'Optimization', 'Security & Scale', 'Mentorship'],
    },
  ];
}

export function getCareerGrowthLevel(
  slug: string,
  levelKeyOrId?: string | null
): CareerGrowthLevel {
  const trajectory = getCareerGrowthTrajectory(slug);
  const normalized = (levelKeyOrId || '').toLowerCase().trim();

  if (normalized === 'senior') {
    return trajectory[2];
  }
  if (
    normalized === 'associate' ||
    normalized === 'junior' ||
    normalized === 'mid' ||
    normalized === 'intermediate'
  ) {
    return trajectory[1];
  }

  // Default to Fresher (Level 1)
  return trajectory[0];
}

