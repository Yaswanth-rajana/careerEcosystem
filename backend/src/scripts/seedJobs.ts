import { db } from '../db/client';

export const INITIAL_JOBS = [
  {
    title: 'Frontend Developer',
    company: 'InnovateLab Tech',
    companyLogo: null,
    location: 'Bengaluru, Karnataka',
    workMode: 'Hybrid',
    employmentType: 'Full-time',
    experienceLevel: '1-3 years',
    skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'GraphQL'],
    salaryMin: 800000,
    salaryMax: 1600000,
    salaryCurrency: 'INR',
    salaryPeriod: 'YEAR',
    description: `InnovateLab is seeking a skilled and passionate Frontend Developer to create modern, responsive, and intuitive web applications. You will be joining our core engineering squad building scalable web platforms for enterprise clients across India and North America.

We believe in clean code, automated testing, and obsessive attention to user experience details. As part of our team, you'll have the autonomy to craft cutting-edge frontends while collaborating closely with product designers and backend engineers.`,
    responsibilities: [
      'Build performant, accessible, and responsive user interfaces using React, Next.js, and TypeScript.',
      'Collaborate with UI/UX designers to translate Figma design systems into pixel-perfect components.',
      'Optimize web vitals, bundle size, and rendering performance across devices.',
      'Write comprehensive unit and integration tests using Vitest and React Testing Library.',
      'Participate in code reviews, technical architecture discussions, and agile sprint ceremonies.',
    ],
    requirements: [
      '1–3 years of professional experience in frontend web development.',
      'Proficiency in React (functional components, custom hooks, context) and modern TypeScript.',
      'Solid command of CSS, responsive design patterns, and modern tooling (Tailwind, PostCSS).',
      'Hands-on experience with Next.js App Router and server-side rendering concepts.',
      'Familiarity with REST APIs, GraphQL, and client-side data caching strategies.',
    ],
    niceToHave: [
      'Experience with Framer Motion or GSAP animations.',
      'Contributions to open-source UI libraries or design systems.',
      'Understanding of web accessibility standards (WCAG 2.1 AA).',
    ],
    benefits: [
      'Competitive compensation package with annual performance incentives.',
      'Comprehensive health insurance for self and family.',
      'Flexible hybrid working policy (2 days office / 3 days remote).',
      'Annual learning and certification stipend (₹50,000/yr).',
      'Wellness and home office setup allowance.',
    ],
    status: 'PUBLISHED',
    jobVerified: true,
    companyVerified: true,
    featured: true,
  },
  {
    title: 'Software Engineer',
    company: 'TechCorp Solutions',
    companyLogo: null,
    location: 'Hyderabad, Telangana',
    workMode: 'Hybrid',
    employmentType: 'Full-time',
    experienceLevel: '0-1 years',
    skills: ['React', 'Node.js', 'MongoDB', 'JavaScript', 'REST APIs'],
    salaryMin: 650000,
    salaryMax: 1200000,
    salaryCurrency: 'INR',
    salaryPeriod: 'YEAR',
    description: `TechCorp Solutions is hiring early-career Software Engineers to work on high-throughput backend services and customer-facing dashboards. This role is ideal for ambitious junior engineers and recent graduates who have solid programming fundamentals and want to grow into full-stack engineering leaders.

You will receive dedicated mentorship from senior technical leads, participate in real-world system deployments, and work on problems spanning database optimization, microservices, and modern frontend interfaces.`,
    responsibilities: [
      'Design, build, and maintain RESTful APIs using Node.js, Express, and TypeScript.',
      'Develop interactive web features using React and state management libraries.',
      'Write optimized database queries, aggregations, and schema migrations with MongoDB.',
      'Write unit tests, automated integration tests, and participate in continuous integration pipelines.',
      'Debug application issues and improve system uptime and response latency.',
    ],
    requirements: [
      'Bachelor’s or Master’s degree in Computer Science, IT, or equivalent practical experience.',
      'Strong command of core JavaScript (ES6+), async/await, and event loops.',
      'Foundational understanding of data structures, algorithms, and object-oriented design.',
      'Experience building at least one full-stack project using React and Node.js.',
      'Understanding of Git version control and pull request workflows.',
    ],
    niceToHave: [
      'Familiarity with Docker and basic cloud deployment (AWS/GCP).',
      'Experience with Prisma ORM or Mongoose.',
      'Active GitHub portfolio or competitive programming background.',
    ],
    benefits: [
      'Mentorship program with designated Principal Engineers.',
      'Health, vision, and accidental insurance coverage.',
      'Hybrid schedule with flexible work hours.',
      'Sponsored technical certifications (AWS, GCP, Linux Foundation).',
      'Paid annual leave and wellness days.',
    ],
    status: 'PUBLISHED',
    jobVerified: true,
    companyVerified: true,
    featured: true,
  },
  {
    title: 'Backend Engineer (Node.js & Go)',
    company: 'Nexus Cloud Infrastructure',
    companyLogo: null,
    location: 'Remote',
    workMode: 'Remote',
    employmentType: 'Full-time',
    experienceLevel: '3-5 years',
    skills: ['Node.js', 'Go', 'PostgreSQL', 'Docker', 'Kubernetes', 'Redis'],
    salaryMin: 1800000,
    salaryMax: 3000000,
    salaryCurrency: 'INR',
    salaryPeriod: 'YEAR',
    description: `Nexus Cloud is building the next generation of automated developer tooling and cloud observability. We are looking for an experienced Backend Engineer to help scale our telemetry ingestion pipelines and distributed API gateways.

You will architect fault-tolerant distributed systems, profile and eliminate memory bottlenecks, and collaborate across globally distributed engineering teams.`,
    responsibilities: [
      'Architect and implement scalable microservices handling 50k+ requests per second.',
      'Manage PostgreSQL and Redis caching layers for sub-10ms query execution.',
      'Deploy and monitor containerized services on Kubernetes clusters across AWS and GCP.',
      'Maintain automated CI/CD pipelines and infrastructure as code using Terraform.',
      'Establish technical RFCs, architecture guidelines, and incident post-mortems.',
    ],
    requirements: [
      '3+ years of production experience building backend systems in Node.js or Go.',
      'Deep understanding of relational databases, indexing, locking, and distributed caching.',
      'Solid grasp of Linux systems, networking protocols (TCP/UDP, HTTP/2, gRPC), and Docker.',
      'Proven track record of designing and running services in cloud environments (AWS/GCP).',
    ],
    niceToHave: [
      'Experience with Kafka, RabbitMQ, or NATS event streaming.',
      'Knowledge of OpenTelemetry and Prometheus monitoring stacks.',
    ],
    benefits: [
      '100% remote working with home office reimbursement ($1,000 setup budget).',
      'Generous equity package with standard 4-year vesting schedule.',
      'Unlimited paid time off (minimum 20 days mandatory).',
      'Top-tier medical insurance for you and your dependents.',
    ],
    status: 'PUBLISHED',
    jobVerified: true,
    companyVerified: true,
    featured: false,
  },
  {
    title: 'Junior Data Scientist',
    company: 'DataVantage Analytics',
    companyLogo: null,
    location: 'Pune, Maharashtra',
    workMode: 'Hybrid',
    employmentType: 'Full-time',
    experienceLevel: 'Fresher',
    skills: ['Python', 'SQL', 'Pandas', 'Machine Learning', 'Scikit-Learn', 'Statistics'],
    salaryMin: 500000,
    salaryMax: 900000,
    salaryCurrency: 'INR',
    salaryPeriod: 'YEAR',
    description: `DataVantage Analytics is looking for motivated Junior Data Scientists to join our predictive modeling and customer intelligence group in Pune. You will work on real datasets, clean and transform messy data, engineer meaningful features, and train baseline machine learning models.

This position offers exceptional hands-on training under seasoned data science managers who will guide your career progression in statistics, machine learning, and data engineering.`,
    responsibilities: [
      'Extract, clean, and validate data from heterogeneous SQL and NoSQL sources.',
      'Perform exploratory data analysis (EDA) and visualize key distribution metrics.',
      'Train, evaluate, and benchmark supervised and unsupervised ML models.',
      'Build reproducible notebooks and automated data transformation scripts in Python.',
      'Communicate statistical insights clearly to product and business stakeholders.',
    ],
    requirements: [
      'Degree in Computer Science, Statistics, Mathematics, Data Science, or related quantitative field.',
      'Proficiency in Python programming, NumPy, Pandas, and Matplotlib/Seaborn.',
      'Strong grasp of probability, linear algebra, hypothesis testing, and regression analysis.',
      'Practical familiarity with Scikit-Learn algorithms (Decision Trees, Random Forests, Logistic Regression).',
      'Ability to write structured SQL queries including joins, window functions, and aggregations.',
    ],
    niceToHave: [
      'Kaggle competition participation or portfolio projects on GitHub.',
      'Familiarity with PyTorch or TensorFlow fundamentals.',
      'Experience with data visualization tools like PowerBI, Tableau, or Streamlit.',
    ],
    benefits: [
      'Comprehensive on-the-job training and assigned senior mentor.',
      'Flexible working hours with 2 days remote weekly.',
      'Annual book and course allowance for data science & AI.',
      'Group health and medical insurance.',
    ],
    status: 'PUBLISHED',
    jobVerified: false,
    companyVerified: true,
    featured: false,
  },
  {
    title: 'Product Designer (UI/UX)',
    company: 'CraftScale Studio',
    companyLogo: null,
    location: 'Bengaluru, Karnataka',
    workMode: 'Remote',
    employmentType: 'Full-time',
    experienceLevel: '1-3 years',
    skills: ['Figma', 'UI/UX Design', 'Design Systems', 'User Research', 'Prototyping'],
    salaryMin: 900000,
    salaryMax: 1800000,
    salaryCurrency: 'INR',
    salaryPeriod: 'YEAR',
    description: `CraftScale Studio creates delightful consumer and B2B SaaS software. We are searching for a talented Product Designer who cares deeply about user psychology, typography, interaction design, and cohesive design systems.

In this role, you will lead the design of new user journeys from rough discovery sketches to production-ready design tokens and interactive prototypes.`,
    responsibilities: [
      'Conduct user interviews, usability testing sessions, and synthesize user feedback into actionable design roadmaps.',
      'Design clean, accessible, and responsive user interfaces using Figma and design systems.',
      'Produce interactive micro-prototypes to validate complex interactions and user flows.',
      'Partner closely with frontend engineers to ensure high-fidelity implementation of designs.',
      'Maintain and expand our core component library and typography scale.',
    ],
    requirements: [
      '1–3 years of UX/UI design experience for web and mobile products.',
      'A strong online portfolio showcasing end-to-end design thinking, wireframing, and polished final visual design.',
      'Deep mastery of Figma (auto-layout, components, variants, design tokens).',
      'Solid understanding of interaction design principles, web accessibility (WCAG), and responsive grids.',
    ],
    niceToHave: [
      'Basic knowledge of HTML/CSS to facilitate engineering handoffs.',
      'Experience designing SaaS dashboards or data visualization tools.',
    ],
    benefits: [
      '100% remote setup with flexible working hours.',
      'MacBook Pro and ergonomic workspace allowance.',
      'Quarterly design retreat and annual conference budget.',
      'Comprehensive healthcare coverage.',
    ],
    status: 'PUBLISHED',
    jobVerified: true,
    companyVerified: true,
    featured: false,
  },
  {
    title: 'Full Stack Engineer Intern',
    company: 'Pathway Labs',
    companyLogo: null,
    location: 'Hyderabad, Telangana',
    workMode: 'Hybrid',
    employmentType: 'Internship',
    experienceLevel: 'Fresher',
    skills: ['React', 'JavaScript', 'TypeScript', 'Node.js', 'Git'],
    salaryMin: 25000,
    salaryMax: 40000,
    salaryCurrency: 'INR',
    salaryPeriod: 'MONTH',
    description: `Pathway Labs is opening applications for our 6-month Full Stack Engineering Internship. This program offers ambitious students and recent graduates real-world exposure to production web engineering, code reviews, and cloud deployments.

High performers in this internship program will be offered full-time software engineering roles upon completion.`,
    responsibilities: [
      'Develop responsive UI components in React and TypeScript.',
      'Write clean REST API endpoints using Node.js and Express.',
      'Fix bug tickets and assist senior developers with test coverage.',
      'Participate in sprint planning and daily standup discussions.',
    ],
    requirements: [
      'Currently enrolled in or recently graduated with a degree in Computer Science or related discipline.',
      'Familiarity with JavaScript, HTML, and CSS fundamentals.',
      'Basic experience with React and Node.js through academic or personal projects.',
      'Eagerness to learn, ask thoughtful questions, and receive constructive feedback.',
    ],
    niceToHave: [
      'Personal portfolio website or active GitHub repository.',
    ],
    benefits: [
      'Monthly stipend of ₹25,000 – ₹40,000.',
      'Direct path to full-time engineering offer.',
      'Certificate of internship completion and strong recommendations.',
      'Free lunches and snacks on in-office days.',
    ],
    status: 'PUBLISHED',
    jobVerified: true,
    companyVerified: true,
    featured: true,
  },
  {
    title: 'Cloud & DevOps Engineer',
    company: 'SkyGrid Systems',
    companyLogo: null,
    location: 'Mumbai, Maharashtra',
    workMode: 'On-site',
    employmentType: 'Full-time',
    experienceLevel: '3-5 years',
    skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'Linux'],
    salaryMin: 1400000,
    salaryMax: 2400000,
    salaryCurrency: 'INR',
    salaryPeriod: 'YEAR',
    description: `SkyGrid Systems manages resilient cloud operations for banking and enterprise fintech clients. We are seeking a Cloud & DevOps Engineer to design, automate, and harden our AWS infrastructure and CI/CD pipelines.

You will work closely with application development squads to minimize deployment cycle times, enforce infrastructure security policies, and maintain 99.99% system availability.`,
    responsibilities: [
      'Provision and manage cloud infrastructure using Terraform and AWS CloudFormation.',
      'Manage container orchestration using Amazon EKS (Kubernetes) and Helm charts.',
      'Build automated CI/CD pipelines with GitHub Actions and GitLab CI.',
      'Implement central logging, alerting, and metrics with Datadog and Grafana.',
      'Conduct disaster recovery drills, vulnerability scans, and security patch automation.',
    ],
    requirements: [
      '3+ years of experience managing production infrastructure on AWS or GCP.',
      'Extensive hands-on experience with Docker, Kubernetes, and container security best practices.',
      'Strong scripting skills in Bash and Python for automation.',
      'Deep knowledge of VPC networking, IAM, firewalls, and SSL/TLS certificate management.',
    ],
    niceToHave: [
      'AWS Certified Solutions Architect or CKA (Certified Kubernetes Administrator).',
      'Experience in PCI-DSS or SOC2 compliance environments.',
    ],
    benefits: [
      'Top-tier competitive base salary + performance bonuses.',
      'Comprehensive family medical cover.',
      'Annual training and certification sponsorship.',
      'Provident fund match and gratuity scheme.',
    ],
    status: 'PUBLISHED',
    jobVerified: true,
    companyVerified: true,
    featured: false,
  },
  {
    title: 'Cybersecurity Associate',
    company: 'VigilantShield Security',
    companyLogo: null,
    location: 'Gurugram, Haryana',
    workMode: 'Hybrid',
    employmentType: 'Full-time',
    experienceLevel: '0-1 years',
    skills: ['Network Security', 'Linux', 'Python', 'SIEM', 'Vulnerability Assessment'],
    salaryMin: 600000,
    salaryMax: 1000000,
    salaryCurrency: 'INR',
    salaryPeriod: 'YEAR',
    description: `VigilantShield Security is hiring a Cybersecurity Associate to support our 24/7 Security Operations Center (SOC). You will monitor network telemetry, investigate suspicious endpoint behaviors, triage security alerts, and execute incident containment procedures.

We offer intensive training in threat hunting, reverse engineering, and threat intelligence.`,
    responsibilities: [
      'Monitor and analyze alerts from SIEM platforms (Splunk, Elastic Security, Microsoft Sentinel).',
      'Investigate anomalous network traffic, malware indicators, and phishing incidents.',
      'Perform regular vulnerability scans and coordinate patching with sysadmins.',
      'Draft incident reports and document root cause analysis findings.',
    ],
    requirements: [
      'Degree in Cybersecurity, Information Technology, or Computer Science.',
      'Solid understanding of OSI model, TCP/IP networking, and common web vulnerabilities (OWASP Top 10).',
      'Familiarity with Linux command line and basic scripting in Python or Bash.',
      'Strong analytical mindset and keen attention to detail.',
    ],
    niceToHave: [
      'CompTIA Security+, CEH, or similar entry-level security certifications.',
      'Participation in CTF (Capture The Flag) competitions or TryHackMe labs.',
    ],
    benefits: [
      'Fast-track career advancement path into Threat Hunting or Penetration Testing.',
      'Full sponsorship for offensive security certifications.',
      'Generous shift allowance and comprehensive health coverage.',
    ],
    status: 'PUBLISHED',
    jobVerified: false,
    companyVerified: true,
    featured: false,
  },
];

export async function seedJobs() {
  console.log('Seeding initial jobs into MongoDB...');
  for (const jobData of INITIAL_JOBS) {
    const existing = await db.job.findFirst({
      where: {
        title: jobData.title,
        company: jobData.company,
      },
    });

    if (!existing) {
      await db.job.create({
        data: {
          ...jobData,
          publishedAt: new Date(),
        },
      });
      console.log(`Created job: ${jobData.title} at ${jobData.company}`);
    } else {
      console.log(`Job already exists: ${jobData.title} at ${jobData.company}`);
    }
  }
  console.log('Initial jobs seed completed successfully.');
}

if (require.main === module) {
  seedJobs()
    .catch((err) => {
      console.error('Seed jobs error:', err);
      process.exit(1);
    })
    .finally(() => {
      process.exit(0);
    });
}
