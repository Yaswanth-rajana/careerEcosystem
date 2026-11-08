import { EducationLevel, EmploymentType, SkillCategory } from './types';

/**
 * Platforms and learning providers that represent courses, bootcamps, or training,
 * and must NEVER be promoted to formal university or secondary degrees.
 */
export const NON_DEGREE_PLATFORMS = [
  'apna college',
  'scaler',
  'scaler academy',
  'coursera',
  'udemy',
  'edx',
  'udacity',
  'freecodecamp',
  'codecademy',
  'wipro talentnext',
  'great learning',
  'simplilearn',
  'geeksforgeeks',
  'hackerrank',
  'leetcode',
  'codechef',
  'khan academy',
  'linkedin learning',
  'pluralsight',
  'skillshare',
  'datacamp',
  'nptel',
  'swayam',
  'upgrad',
  'springboard',
  'frontend masters',
  'interviewbit',
  'coding ninjas',
  'acciojob',
  'masai',
  'masai school',
];

export function isNonDegreePlatform(text: string): boolean {
  const lower = text.toLowerCase();
  return NON_DEGREE_PLATFORMS.some((platform) => lower.includes(platform));
}

/**
 * Classifies education degree strings into recognized educational levels.
 */
export function classifyEducationLevel(degreeStr: string, institutionStr?: string): EducationLevel {
  const combined = `${degreeStr} ${institutionStr || ''}`.toLowerCase();

  if (/\b(?:ph\.?d|doctorate|doctor of philosophy|d\.?phil)\b/i.test(combined)) {
    return 'DOCTORATE';
  }
  if (/\b(?:master|m\.?tech|m\.?e|m\.?s|m\.?sc|m\.?a|mba|mca|post\s*graduate)\b/i.test(combined)) {
    return 'POSTGRADUATE';
  }
  if (/\b(?:bachelor|b\.?tech|b\.?e|b\.?s|b\.?sc|b\.?a|bba|bca|b\.?com|undergraduate)\b/i.test(combined)) {
    return 'UNDERGRADUATE';
  }
  if (/\b(?:intermediate|junior college|\+2|higher secondary|hsc|12th|mpc|bipc|mec)\b/i.test(combined)) {
    return 'INTERMEDIATE';
  }
  if (/\b(?:secondary school certificate|ssc|10th|matriculation|icse|cbse\s*10th|high school)\b/i.test(combined)) {
    return 'HIGH_SCHOOL';
  }
  if (/\b(?:diploma|polytechnic)\b/i.test(combined)) {
    return 'DIPLOMA';
  }
  return 'OTHER';
}

/**
 * Classifies role or experience text into an employment type.
 */
export function classifyEmploymentType(roleTitle: string, fullContext = '', sourceSection = ''): EmploymentType {
  const combined = `${roleTitle} ${fullContext}`.toLowerCase();

  if (/\b(?:intern|internship|summer intern|graduate intern|trainee|apprentice)\b/i.test(combined)) {
    return 'Internship';
  }
  if (/\b(?:part[-\s]?time)\b/i.test(combined)) {
    return 'Part-time';
  }
  if (/\b(?:contract|contractor|freelance|consultant)\b/i.test(combined)) {
    return 'Contract';
  }
  if (/\b(?:self[-\s]?employed|founder|co[-\s]?founder)\b/i.test(combined)) {
    return 'Self-employed';
  }
  return 'Full-time';
}

/**
 * Determines whether an entry belongs to Work Experience or Internships.
 * Rule: The source resume section takes absolute precedence:
 * - Entries under EXPERIENCE remain in the Work Experience category.
 * - Entries under INTERNSHIPS remain in the Internships category.
 * - An 'Intern' keyword in the title does NOT override the source section.
 */
export function determineExperienceCategory(
  sourceSection: 'EXPERIENCE' | 'INTERNSHIPS' | string,
  roleTitle = '',
  fullContext = ''
): 'EXPERIENCE' | 'INTERNSHIPS' {
  if (sourceSection === 'INTERNSHIPS') {
    return 'INTERNSHIPS';
  }
  if (sourceSection === 'EXPERIENCE') {
    return 'EXPERIENCE';
  }
  // Fallback for ambiguous or UNKNOWN source section
  const combined = `${roleTitle} ${fullContext}`.toLowerCase();
  if (/\b(?:intern|internship|trainee|apprentice)\b/i.test(combined)) {
    return 'INTERNSHIPS';
  }
  return 'EXPERIENCE';
}

/**
 * Comprehensive mapping of canonical skills to technical and soft categories.
 */
export const SKILL_TAXONOMY: Record<string, { category: SkillCategory; aliases?: string[] }> = {
  // Programming Languages
  'Python': { category: 'LANGUAGE' },
  'JavaScript': { category: 'LANGUAGE', aliases: ['JS'] },
  'TypeScript': { category: 'LANGUAGE', aliases: ['TS'] },
  'Java': { category: 'LANGUAGE' },
  'C++': { category: 'LANGUAGE', aliases: ['CPP'] },
  'C': { category: 'LANGUAGE' },
  'C#': { category: 'LANGUAGE', aliases: ['CSharp', 'C Sharp'] },
  'Go': { category: 'LANGUAGE', aliases: ['Golang'] },
  'Rust': { category: 'LANGUAGE' },
  'PHP': { category: 'LANGUAGE' },
  'Ruby': { category: 'LANGUAGE' },
  'Swift': { category: 'LANGUAGE' },
  'Kotlin': { category: 'LANGUAGE' },
  'R': { category: 'LANGUAGE' },
  'Dart': { category: 'LANGUAGE' },
  'Scala': { category: 'LANGUAGE' },
  'SQL': { category: 'LANGUAGE' },
  'Bash': { category: 'LANGUAGE', aliases: ['Shell', 'Shell Scripting'] },

  // Frontend
  'Web Storage': { category: 'FRONTEND' },
  'React': { category: 'FRONTEND', aliases: ['React.js', 'ReactJS'] },
  'Next.js': { category: 'FRONTEND', aliases: ['Nextjs', 'Next'] },
  'Vue.js': { category: 'FRONTEND', aliases: ['Vue', 'VueJS'] },
  'Angular': { category: 'FRONTEND', aliases: ['AngularJS'] },
  'Svelte': { category: 'FRONTEND' },
  'HTML': { category: 'FRONTEND', aliases: ['HTML5'] },
  'CSS': { category: 'FRONTEND', aliases: ['CSS3'] },
  'Tailwind CSS': { category: 'FRONTEND', aliases: ['Tailwind', 'TailwindCSS'] },
  'Bootstrap': { category: 'FRONTEND' },
  'Redux': { category: 'FRONTEND', aliases: ['Redux Toolkit'] },
  'Webpack': { category: 'FRONTEND' },
  'Vite': { category: 'FRONTEND' },

  // Backend
  'Node.js': { category: 'BACKEND', aliases: ['Node', 'NodeJS'] },
  'Express.js': { category: 'BACKEND', aliases: ['Express', 'ExpressJS'] },
  'NestJS': { category: 'BACKEND' },
  'Django': { category: 'BACKEND' },
  'FastAPI': { category: 'BACKEND' },
  'Flask': { category: 'BACKEND' },
  'Spring Boot': { category: 'BACKEND', aliases: ['Spring'] },
  '.NET': { category: 'BACKEND', aliases: ['ASP.NET', 'DotNet'] },
  'GraphQL': { category: 'BACKEND' },
  'REST API': { category: 'BACKEND', aliases: ['REST APIs', 'RESTful API'] },
  'gRPC': { category: 'BACKEND' },
  'Kafka': { category: 'BACKEND', aliases: ['Apache Kafka'] },
  'RabbitMQ': { category: 'BACKEND' },

  // Database
  'IndexedDB': { category: 'DATABASE' },
  'PostgreSQL': { category: 'DATABASE', aliases: ['Postgres'] },
  'MySQL': { category: 'DATABASE' },
  'MongoDB': { category: 'DATABASE', aliases: ['Mongo'] },
  'Redis': { category: 'DATABASE' },
  'SQLite': { category: 'DATABASE' },
  'DynamoDB': { category: 'DATABASE' },
  'Firebase': { category: 'DATABASE', aliases: ['Firestore'] },
  'Snowflake': { category: 'DATABASE' },
  'Cassandra': { category: 'DATABASE' },
  'Elasticsearch': { category: 'DATABASE' },

  // Cloud & DevOps
  'AWS EC2': { category: 'CLOUD', aliases: ['EC2'] },
  'AWS': { category: 'CLOUD', aliases: ['Amazon Web Services'] },
  'Azure': { category: 'CLOUD', aliases: ['Microsoft Azure'] },
  'Google Cloud': { category: 'CLOUD', aliases: ['GCP'] },
  'Docker': { category: 'DEVOPS' },
  'Kubernetes': { category: 'DEVOPS', aliases: ['K8s'] },
  'CI/CD': { category: 'DEVOPS', aliases: ['Continuous Integration', 'GitHub Actions', 'GitLab CI'] },
  'Terraform': { category: 'DEVOPS' },
  'Ansible': { category: 'DEVOPS' },
  'Linux': { category: 'DEVOPS', aliases: ['Ubuntu', 'CentOS'] },
  'Git': { category: 'DEVOPS', aliases: ['GitHub', 'GitLab'] },

  // Testing
  'Jest': { category: 'TESTING' },
  'Cypress': { category: 'TESTING' },
  'Playwright': { category: 'TESTING' },
  'Selenium': { category: 'TESTING' },
  'JUnit': { category: 'TESTING' },
  'PyTest': { category: 'TESTING' },

  // AI & ML
  'Gemini API': { category: 'AI_ML', aliases: ['Gemini'] },
  'Machine Learning': { category: 'AI_ML', aliases: ['ML'] },
  'Deep Learning': { category: 'AI_ML', aliases: ['DL'] },
  'TensorFlow': { category: 'AI_ML' },
  'PyTorch': { category: 'AI_ML' },
  'Scikit-Learn': { category: 'AI_ML', aliases: ['sklearn'] },
  'Natural Language Processing': { category: 'AI_ML', aliases: ['NLP'] },
  'Computer Vision': { category: 'AI_ML', aliases: ['OpenCV'] },

  // Tools & Design
  'Cybersecurity': { category: 'SECURITY', aliases: ['Cyber Security', 'Information Security'] },
  'Figma': { category: 'TOOL' },
  'Postman': { category: 'TOOL' },
  'Jira': { category: 'TOOL' },

  // Soft Skills
  'Leadership': { category: 'SOFT_SKILL' },
  'Communication': { category: 'SOFT_SKILL' },
  'Problem Solving': { category: 'SOFT_SKILL' },
  'Team Collaboration': { category: 'SOFT_SKILL', aliases: ['Teamwork', 'Collaboration'] },
  'Agile Methodologies': { category: 'SOFT_SKILL', aliases: ['Agile', 'Scrum'] },
  'Critical Thinking': { category: 'SOFT_SKILL' },
  'Time Management': { category: 'SOFT_SKILL' },
  'Adaptability': { category: 'SOFT_SKILL' },
};

/**
 * Classifies a URL into a recognized professional platform.
 */
export function classifyProfessionalLinkPlatform(url: string): string {
  const lower = url.toLowerCase();
  if (lower.includes('linkedin.com')) return 'LinkedIn';
  if (lower.includes('github.com') || lower.includes('github.io')) return 'GitHub';
  if (lower.includes('gitlab.com')) return 'GitLab';
  if (lower.includes('bitbucket.org')) return 'Bitbucket';
  if (lower.includes('leetcode.com')) return 'LeetCode';
  if (lower.includes('codechef.com')) return 'CodeChef';
  if (lower.includes('hackerrank.com')) return 'HackerRank';
  if (lower.includes('kaggle.com')) return 'Kaggle';
  if (lower.includes('codeforces.com')) return 'Codeforces';
  if (lower.includes('stackoverflow.com')) return 'Stack Overflow';
  if (lower.includes('medium.com')) return 'Medium';
  if (lower.includes('dev.to')) return 'Dev.to';
  if (lower.includes('hashnode.') || lower.includes('hashnode.dev')) return 'Hashnode';
  if (lower.includes('twitter.com') || lower.includes('x.com')) return 'Twitter / X';
  if (lower.includes('behance.net')) return 'Behance';
  if (lower.includes('dribbble.com')) return 'Dribbble';
  if (lower.includes('youtube.com')) return 'YouTube';
  if (lower.includes('figma.com')) return 'Figma';
  return 'Portfolio';
}

/**
 * Standalone platform/link labels that frequently appear in project sections
 * and must NEVER be treated as project titles.
 */
export const PLATFORM_LINK_LABELS = /^(?:github|gitlab|bitbucket|live\s*demo|demo|project\s*link|repository|repo|code|source\s*code|view\s*code|website|link|deployment|live\s*link)$/i;

export function isPlatformLinkLabel(text: string): boolean {
  const withoutUrl = text.replace(/https?:\/\/[^\s)]+/gi, '').replace(/^[•*–—\-\s,|:]+|[•*–—\-\s,|:]+$/g, '').trim();
  return PLATFORM_LINK_LABELS.test(withoutUrl) || (withoutUrl.length === 0 && /https?:\/\//i.test(text));
}

/**
 * Normalizes and deduplicates technologies extracted from a project.
 */
export function normalizeProjectTechnologies(techs: string[]): string[] {
  const result: string[] = [];
  const seen = new Set<string>();

  for (const t of techs) {
    const raw = t.trim();
    if (!raw) continue;

    let canonical = raw;
    if (/^react(?:\.js|js)?$/i.test(raw)) canonical = 'React.js';
    else if (/^node(?:\.js|js)?$/i.test(raw)) canonical = 'Node.js';
    else if (/^express(?:\.js|js)?$/i.test(raw)) canonical = 'Express.js';
    else if (/^rest(?:\s*apis?|\s*api)?$/i.test(raw)) canonical = 'REST API';
    else if (/^aws(?:\s*ec2)?$/i.test(raw)) canonical = raw.toUpperCase().includes('EC2') ? 'AWS EC2' : 'AWS';
    else if (/^gemini(?:\s*api)?$/i.test(raw)) canonical = 'Gemini API';

    const key = canonical.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(canonical);
    }
  }

  // Deduplicate superstrings if more specific variant exists
  if (result.includes('React.js') && result.includes('React')) {
    result.splice(result.indexOf('React'), 1);
  }
  if (result.includes('AWS EC2') && result.includes('AWS')) {
    result.splice(result.indexOf('AWS'), 1);
  }

  return result;
}

/**
 * Detects whether a string is likely an issuing organization for a certification.
 */
export function isLikelyCertificationIssuer(text: string): boolean {
  if (!text || text.trim().length < 2) return false;
  const clean = text.trim();
  if (isNonDegreePlatform(clean)) return true;

  // Organizational suffixes / keywords
  if (/\b(?:pvt\.?\s*ltd\.?|ltd\.?|inc\.?|llc|corp\.?|corporation|foundation|academy|institute|university|college|alliance|services|technologies|solutions|apsche|consortium|association|society|board|council)\b/i.test(clean)) {
    return true;
  }

  // Major tech providers & certification authorities
  if (/\b(?:amazon(?:\s*web\s*services)?|aws|google(?:\s*cloud)?|microsoft(?:\s*azure)?|cisco|comptia|oracle|ibm|linux\s*foundation|cncf|hashicorp|scrum(?:\.org|\s*alliance)?|deeplearning\.ai|meta|blackbucks|stanford|harvard|mit|iit|nptel|coursera|udemy|wipro|infosys|tcs|red\s*hat|salesforce)\b/i.test(clean)) {
    return true;
  }

  return false;
}

/**
 * Extracts issue date and expiry date from a certification line.
 */
export function extractCertificationDate(text: string): {
  issueDate?: string;
  expiryDate?: string;
  cleanedText: string;
} {
  let issueDate: string | undefined;
  let expiryDate: string | undefined;
  let cleanedText = text;

  // Date range: "Issued May 2023 - Expires May 2026" or "May 2023 – May 2026" or "2021 - 2024"
  const rangeMatch = text.match(/(?:issued:?\s*)?([A-Za-z]{3,9}\s+\d{4}|\b(?:19|20)\d{2}\b)\s*[-–—to]+\s*(?:expires:?\s*)?([A-Za-z]{3,9}\s+\d{4}|\b(?:19|20)\d{2}\b)/i);
  if (rangeMatch) {
    issueDate = rangeMatch[1].trim();
    expiryDate = rangeMatch[2].trim();
    cleanedText = cleanedText.replace(rangeMatch[0], '').replace(/^[•*–—\-\s,|:]+|[•*–—\-\s,|:]+$/g, '').trim();
    return { issueDate, expiryDate, cleanedText };
  }

  // Single date with month: "July 2026", "Dec 2024", etc.
  const monthYearMatch = text.match(/\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{4}\b/i);
  if (monthYearMatch) {
    issueDate = monthYearMatch[0].trim();
    cleanedText = cleanedText.replace(monthYearMatch[0], '').replace(/^[•*–—\-\s,|:]+|[•*–—\-\s,|:]+$/g, '').trim();
    return { issueDate, expiryDate, cleanedText };
  }

  // 4-digit year: "2024", "1941", etc.
  const yearMatch = text.match(/\b(19\d\d|20\d\d)\b/);
  if (yearMatch) {
    issueDate = yearMatch[0].trim();
    cleanedText = cleanedText.replace(new RegExp(`\\(?\\b${yearMatch[0]}\\b\\)?`), '').replace(/^[•*–—\-\s,|:]+|[•*–—\-\s,|:]+$/g, '').trim();
    return { issueDate, expiryDate, cleanedText };
  }

  return { issueDate, expiryDate, cleanedText };
}

/**
 * Infers an issuing organization from certification title when issuer was omitted.
 */
export function inferIssuerFromCertName(name: string): string | undefined {
  const lower = name.toLowerCase();
  if (/\b(?:aws|amazon\s*web\s*services)\b/i.test(lower)) return 'Amazon Web Services';
  if (/\b(?:google\s*cloud|gcp)\b/i.test(lower)) return 'Google Cloud';
  if (/\b(?:azure|microsoft)\b/i.test(lower)) return 'Microsoft';
  if (/\b(?:kubernetes|ckad|cka|cks|cncf)\b/i.test(lower)) return 'Cloud Native Computing Foundation (CNCF)';
  if (/\b(?:hashicorp|terraform)\b/i.test(lower)) return 'HashiCorp';
  if (/\b(?:cisco|ccna|ccnp|ccie)\b/i.test(lower)) return 'Cisco';
  if (/\b(?:comptia|security\+|network\+|a\+|linux\+)\b/i.test(lower)) return 'CompTIA';
  if (/\b(?:scrum\s*master|csm|psm|scrum\.org|scrum\s*alliance)\b/i.test(lower)) return 'Scrum Alliance';
  if (/\b(?:meta|facebook)\b/i.test(lower)) return 'Meta';
  if (/\b(?:oracle|java\s*certified)\b/i.test(lower)) return 'Oracle';
  if (/\b(?:red\s*hat|rhcsa|rhce)\b/i.test(lower)) return 'Red Hat';
  if (/\b(?:salesforce)\b/i.test(lower)) return 'Salesforce';
  return undefined;
}

/**
 * Detects whether a string is likely a certification title or course name
 * rather than an issuing organization.
 */
export function isCertificationTitleLikely(text: string): boolean {
  if (!text || text.trim().length < 3) return false;
  return /\b(?:certified|certification|certificate|practitioner|associate|professional|specialist|specialization|administrator|architect|developer|engineer|analyst|master|expert|fundamentals|dsa|full\s*stack|deep\s*learning|machine\s*learning|data\s*structures|algorithms|web\s*development)\b/i.test(text);
}

/**
 * Detects whether a line is a detail/sub-bullet or credential descriptor
 * rather than a new certification.
 */
export function isCertificationDetail(text: string): boolean {
  const lower = text.toLowerCase();
  if (/^(?:issued|expires|valid|date|completed)\b/i.test(lower)) return true;
  if (/\b(?:internship|week|month|hour|duration|credential\s*id|license|verify|grade|score|percentage|topics?|covered|hands-on|capstone|completed|expires)\b/i.test(lower)) {
    return true;
  }
  if (/https?:\/\//i.test(lower)) return true;
  return false;
}

