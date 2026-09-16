import { CareerPath } from './career-types';

export const CAREER_PATHS: CareerPath[] = [
  // ================= TECHNOLOGY =================
  {
    id: 'software-engineer',
    slug: 'software-engineer',
    title: 'Software Engineer',
    category: 'Technology',
    tagline: 'Design, build, test, and maintain software that solves real problems.',
    shortDescription: 'Build applications and software used by people and businesses.',
    typicalTrajectory: ['Beginner', 'Junior Developer', 'Mid-Level Software Engineer', 'Senior Engineer'],
    roleOverview: {
      whatYouDo: 'Software Engineers research user needs, design software applications, write clean code, test features, and maintain scalable backend systems and web applications.',
      youWillWorkOn: ['User Interfaces', 'REST APIs', 'Databases', 'Authentication', 'System Performance', 'Code Testing'],
      whereCanYouWork: ['SaaS Companies', 'FinTech', 'Consumer Tech Apps', 'E-commerce', 'Enterprise Software', 'Digital Agencies'],
    },
    salaryRange: {
      min: 800000,
      max: 2000000,
      currency: 'INR',
      period: 'LPA',
      formatted: '₹8–20 LPA',
      source: 'Industry Benchmark',
      updatedAt: '2026',
    },
    responsibilities: [
      'Write clean, testable, maintainable code in JavaScript, TypeScript, Python, or Java.',
      'Design REST APIs, GraphQL endpoints, and relational database schemas.',
      'Optimize application performance, SQL queries, and code complexity.',
    ],
    commonIndustries: ['Software & SaaS', 'FinTech', 'Consumer Tech', 'E-commerce'],
    skillGroups: {
      mustKnow: [
        { name: 'JavaScript', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'Modern ES6+ syntax, async/await, closures, and promises.' },
        { name: 'React', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'Hooks, component architecture, props, and state management.' },
        { name: 'Node.js', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'Event loop, Express routing, and backend server development.' },
        { name: 'SQL', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'Relational database queries, joins, and schema design.' },
      ],
      goodToKnow: [
        { name: 'TypeScript', level: 'INTERMEDIATE', importance: 'GOOD_TO_KNOW', description: 'Static typing, interfaces, and generic types.' },
        { name: 'Git', level: 'INTERMEDIATE', importance: 'GOOD_TO_KNOW', description: 'Version control, feature branching, and pull requests.' },
      ],
      advanced: [
        { name: 'System Design', level: 'ADVANCED', importance: 'ADVANCED', description: 'Scalability, microservices, caching, and message queues.' },
      ],
    },
    learningPhases: [
      {
        phaseNumber: '01',
        title: 'FOUNDATIONS',
        subtitle: 'Programming & Logic',
        description: 'Master core programming fundamentals and problem solving.',
        topics: ['Programming fundamentals', 'Git & GitHub', 'Data structures basics', 'Problem solving'],
        skills: ['JavaScript', 'Git', 'Problem Solving'],
        recommendedCourse: { id: 'c-se-01', title: 'JavaScript & Algorithms Foundations', provider: 'PATHWAY Academy', level: 'Beginner', available: true },
      },
      {
        phaseNumber: '02',
        title: 'CORE SKILLS',
        subtitle: 'Web & APIs',
        description: 'Build dynamic frontend UIs and backend APIs.',
        topics: ['React framework', 'Node.js & Express', 'RESTful API design', 'SQL & relational databases'],
        skills: ['React', 'Node.js', 'SQL', 'APIs'],
        recommendedCourse: { id: 'c-se-02', title: 'Full-Stack Web Development with React & Node', provider: 'PATHWAY Academy', level: 'Intermediate', available: true },
      },
      {
        phaseNumber: '03',
        title: 'ADVANCED',
        subtitle: 'Architecture & Scale',
        description: 'Engineer high-throughput distributed systems.',
        topics: ['System Design', 'Caching & Redis', 'Docker Basics', 'Code Security'],
        skills: ['System Design', 'TypeScript', 'Docker'],
      },
    ],
    projects: [
      {
        id: 'p-se-01',
        title: 'Full-Stack Task Management Application',
        difficulty: 'Beginner',
        skillsRequired: ['JavaScript', 'React', 'Node.js', 'SQL'],
        description: 'A complete task management platform with user auth, real-time board updates, and database storage.',
        expectedOutcome: 'A live interactive web application with frontend, backend API, and database.',
      },
      {
        id: 'p-se-02',
        title: 'E-Commerce API Service & Payment Gateways',
        difficulty: 'Intermediate',
        skillsRequired: ['TypeScript', 'Node.js', 'Express', 'SQL'],
        description: 'Build a production-style REST API with product inventory, shopping cart state, and Stripe payment integration.',
        expectedOutcome: 'Documented Swagger API endpoints with unit tests.',
      },
    ],
    certifications: [
      { id: 'cert-meta-fs', name: 'Meta Full-Stack Software Engineer Certificate', issuingOrganization: 'Meta', level: 'Intermediate' },
    ],
    practiceAreas: [
      { id: 'prac-se-tech', title: 'Technical Challenges', category: 'Technical Challenges', description: 'Data structures, algorithm complexity, and array manipulation.', questionCount: 25 },
      { id: 'prac-se-[#]', title: 'Portfolio Challenges', category: 'Portfolio Challenges', description: 'Build interactive UI components and clean API structures.', questionCount: 15 },
      { id: 'prac-se-scen', title: 'Scenario Questions', category: 'Scenario Questions', description: 'Debugging memory leaks, API latency, and database query locks.', questionCount: 20 },
      { id: 'prac-se-int', title: 'Interview Questions', category: 'Interview Questions', description: 'Core technical questions asked by software engineering hiring panels.', questionCount: 30 },
    ],
    interviewTopics: [
      { id: 'int-se-01', topic: 'Technical Fundamentals', category: 'Technical', questionCount: 15, keyQuestions: ['What is the event loop in Node.js?', 'Explain the virtual DOM in React.'] },
      { id: 'int-se-02', topic: 'Role-Specific Questions', category: 'Role Specific', questionCount: 12, keyQuestions: ['How do you optimize SQL database joins?'] },
      { id: 'int-se-03', topic: 'Scenario Questions', category: 'Technical', questionCount: 10, keyQuestions: ['How do you handle a production server spike?'] },
      { id: 'int-se-04', topic: 'Behavioral', category: 'Behavioral', questionCount: 10, keyQuestions: ['Describe a time you resolved a technical dispute with a team member.'] },
      { id: 'int-se-05', topic: 'Portfolio Discussion', category: 'Role Specific', questionCount: 8, keyQuestions: ['Walk us through the architecture of your full-stack project.'] },
    ],
  },

  {
    id: 'cloud-engineer',
    slug: 'cloud-engineer',
    title: 'Cloud Engineer',
    category: 'Technology',
    tagline: 'Build and manage scalable, secure modern cloud infrastructure and automated services.',
    shortDescription: 'Build and manage scalable cloud infrastructure and services.',
    typicalTrajectory: ['Beginner', 'Junior Cloud Specialist', 'Cloud Engineer', 'Senior Cloud Architect'],
    roleOverview: {
      whatYouDo: 'Cloud Engineers architect, provision, automate, monitor, and maintain cloud infrastructure on platforms like AWS, GCP, and Azure.',
      youWillWorkOn: ['Cloud Compute (EC2)', 'Identity & Access (IAM)', 'Virtual Networks (VPC)', 'Containers (Docker)', 'CI/CD Pipelines', 'Cloud Security'],
      whereCanYouWork: ['Cloud Service Providers', 'SaaS Enterprises', 'FinTech', 'Healthcare Tech', 'Consulting & IT Services'],
    },
    salaryRange: { min: 1000000, max: 1800000, currency: 'INR', period: 'LPA', formatted: '₹10–18 LPA', source: 'Industry Benchmark', updatedAt: '2026' },
    responsibilities: [
      'Provision AWS cloud resources using Infrastructure as Code (Terraform).',
      'Automate CI/CD pipelines with Docker and GitHub Actions.',
      'Configure VPC networking, subnets, and IAM security controls.',
    ],
    commonIndustries: ['SaaS', 'FinTech', 'HealthTech', 'E-commerce'],
    skillGroups: {
      mustKnow: [
        { name: 'Linux', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'Shell navigation, permissions, bash scripts.' },
        { name: 'AWS', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'EC2, S3, IAM, VPC, and CloudWatch basics.' },
        { name: 'Docker', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'Containerization, Dockerfiles, and compose.' },
        { name: 'Networking', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'TCP/IP, DNS, VPC subnets, and firewalls.' },
      ],
      goodToKnow: [
        { name: 'Terraform', level: 'INTERMEDIATE', importance: 'GOOD_TO_KNOW', description: 'Infrastructure as Code state and modules.' },
        { name: 'CI/CD', level: 'INTERMEDIATE', importance: 'GOOD_TO_KNOW', description: 'GitHub Actions and deployment pipelines.' },
      ],
      advanced: [
        { name: 'Kubernetes', level: 'ADVANCED', importance: 'ADVANCED', description: 'Cluster deployment, Helm, and pod scaling.' },
      ],
    },
    learningPhases: [
      { phaseNumber: '01', title: 'FOUNDATIONS', subtitle: 'Linux & Networks', description: 'Master OS command line and cloud networking.', topics: ['Linux command line', 'Shell scripting', 'Networking fundamentals', 'Git'], skills: ['Linux', 'Networking', 'Git'] },
      { phaseNumber: '02', title: 'CORE SKILLS', subtitle: 'AWS & Compute', description: 'Learn core cloud services and identity access.', topics: ['AWS EC2 & S3', 'IAM security', 'VPC subnets', 'CloudWatch monitoring'], skills: ['AWS', 'VPC', 'IAM', 'Docker'], recommendedCourse: { id: 'c-[#]', title: 'AWS Cloud Architect Practitioner', provider: 'PATHWAY Academy', level: 'Intermediate', available: true } },
      { phaseNumber: '03', title: 'ADVANCED', subtitle: 'DevOps & IaC', description: 'Automate infrastructure with code.', topics: ['Terraform IaC', 'Kubernetes basics', 'CI/CD automation'], skills: ['Terraform', 'Kubernetes', 'CI/CD'] },
    ],
    projects: [
      { id: 'p-cloud-01', title: 'Deploy a Web Application on AWS', difficulty: 'Beginner', skillsRequired: ['AWS', 'Linux', 'Networking'], description: 'Provision an EC2 web server connected to RDS database and S3 storage with security groups.', expectedOutcome: 'A running web server on AWS with secure networking.' },
      { id: 'p-cloud-02', title: 'Containerized Microservice with CI/CD', difficulty: 'Intermediate', skillsRequired: ['Docker', 'AWS', 'CI/CD'], description: 'Build a Dockerized API with automated GitHub Actions pipeline deploying to AWS.', expectedOutcome: 'Automated deployment pipeline to cloud containers.' },
    ],
    certifications: [{ id: 'cert-aws-saa', name: 'AWS Certified Solutions Architect – Associate', issuingOrganization: 'Amazon Web Services', level: 'Intermediate' }],
    practiceAreas: [
      { id: 'prac-cloud-01', title: 'Technical Challenges', category: 'Technical Challenges', description: 'Linux permissions, networking subnets, and AWS CLI.', questionCount: 20 },
      { id: 'prac-cloud-02', title: 'Scenario Questions', category: 'Scenario Questions', description: 'VPC security breaches and load balancer troubleshooting.', questionCount: 15 },
    ],
    interviewTopics: [
      { id: 'int-cloud-01', topic: 'Technical Fundamentals', category: 'Technical', questionCount: 15, keyQuestions: ['What is the difference between S3 and EBS?'] },
    ],
  },

  {
    id: 'devops-engineer',
    slug: 'devops-engineer',
    title: 'DevOps Engineer',
    category: 'Technology',
    tagline: 'Bridge software development and operations through automation, CI/CD, and reliability.',
    shortDescription: 'Streamline continuous delivery pipelines, container orchestration, and platform automation.',
    typicalTrajectory: ['Beginner', 'Junior DevOps Engineer', 'DevOps Specialist', 'Senior SRE / Platform Lead'],
    roleOverview: {
      whatYouDo: 'DevOps Engineers build continuous delivery pipelines, orchestrate containerized applications, manage cloud automation, and enforce reliability engineering.',
      youWillWorkOn: ['CI/CD Pipelines', 'Kubernetes Clusters', 'Terraform IaC', 'Monitoring & Alerting', 'Security Automation'],
      whereCanYouWork: ['SaaS Scale-ups', 'FinTech', 'Cloud Infrastructure Platforms', 'Gaming Enterprises'],
    },
    salaryRange: { min: 1100000, max: 2200000, currency: 'INR', period: 'LPA', formatted: '₹11–22 LPA', source: 'Industry Benchmark', updatedAt: '2026' },
    responsibilities: ['Build CI/CD pipelines', 'Orchestrate Kubernetes workloads', 'Automate infrastructure with Terraform'],
    commonIndustries: ['SaaS', 'FinTech', 'E-commerce'],
    skillGroups: {
      mustKnow: [
        { name: 'Linux', level: 'INTERMEDIATE', importance: 'MUST_KNOW' },
        { name: 'Docker', level: 'INTERMEDIATE', importance: 'MUST_KNOW' },
        { name: 'CI/CD', level: 'INTERMEDIATE', importance: 'MUST_KNOW' },
        { name: 'Terraform', level: 'INTERMEDIATE', importance: 'MUST_KNOW' },
      ],
      goodToKnow: [
        { name: 'Kubernetes', level: 'INTERMEDIATE', importance: 'GOOD_TO_KNOW' },
        { name: 'Python / Bash', level: 'INTERMEDIATE', importance: 'GOOD_TO_KNOW' },
      ],
      advanced: [{ name: 'GitOps & ArgoCD', level: 'ADVANCED', importance: 'ADVANCED' }],
    },
    learningPhases: [
      { phaseNumber: '01', title: 'CONTAINERS & CI/CD', subtitle: 'Docker & GitHub Actions', description: 'Learn containerization and delivery pipelines.', topics: ['Dockerfiles', 'Container networking', 'CI/CD pipelines'], skills: ['Docker', 'CI/CD', 'Linux'] },
    ],
    projects: [
      { id: 'p-do-01', title: 'GitOps Pipeline with ArgoCD & EKS', difficulty: 'Intermediate', skillsRequired: ['Kubernetes', 'ArgoCD', 'Terraform'], description: 'Automate Kubernetes app delivery driven by git commits.', expectedOutcome: 'Automated GitOps pipeline.' },
    ],
    certifications: [{ id: 'cert-cka', name: 'Certified Kubernetes Administrator (CKA)', issuingOrganization: 'CNCF', level: 'Advanced' }],
    practiceAreas: [{ id: 'prac-do-01', title: 'Technical Challenges', category: 'Technical Challenges', description: 'Docker optimization and Kubernetes manifests.', questionCount: 20 }],
    interviewTopics: [{ id: 'int-do-01', topic: 'Technical Fundamentals', category: 'Technical', questionCount: 12, keyQuestions: ['How do you minimize Docker image sizes?'] }],
  },

  {
    id: 'cybersecurity-engineer',
    slug: 'cybersecurity-engineer',
    title: 'Cybersecurity Engineer',
    category: 'Cybersecurity',
    tagline: 'Protect digital assets, networks, and applications against threats and vulnerability vectors.',
    shortDescription: 'Assess vulnerabilities, secure networks, and mitigate digital security breaches.',
    typicalTrajectory: ['Beginner', 'Security Analyst', 'Cybersecurity Engineer', 'Senior Security Architect'],
    roleOverview: {
      whatYouDo: 'Cybersecurity Engineers safeguard applications, cloud infrastructure, and network perimeters against cyber threats and security vulnerabilities.',
      youWillWorkOn: ['Vulnerability Scanning', 'Penetration Testing', 'SIEM Log Analysis', 'Firewalls & IDS', 'Identity & Access'],
      whereCanYouWork: ['Banking & Finance', 'Defense', 'Healthcare', 'Enterprise SaaS'],
    },
    salaryRange: { min: 900000, max: 1900000, currency: 'INR', period: 'LPA', formatted: '₹9–19 LPA', source: 'Industry Benchmark', updatedAt: '2026' },
    responsibilities: ['Perform vulnerability assessments', 'Configure network firewalls and SIEM', 'Conduct incident response'],
    commonIndustries: ['FinTech', 'Healthcare', 'Government'],
    skillGroups: {
      mustKnow: [
        { name: 'Networking', level: 'INTERMEDIATE', importance: 'MUST_KNOW' },
        { name: 'Linux Security', level: 'INTERMEDIATE', importance: 'MUST_KNOW' },
        { name: 'Ethical Hacking', level: 'INTERMEDIATE', importance: 'MUST_KNOW' },
        { name: 'Python', level: 'INTERMEDIATE', importance: 'MUST_KNOW' },
      ],
      goodToKnow: [{ name: 'SIEM Tools', level: 'INTERMEDIATE', importance: 'GOOD_TO_KNOW' }],
      advanced: [{ name: 'Penetration Testing', level: 'ADVANCED', importance: 'ADVANCED' }],
    },
    learningPhases: [
      { phaseNumber: '01', title: 'SECURITY CORE', subtitle: 'Networking & Ethical Hacking', description: 'Master network protocols and vulnerability scanning.', topics: ['TCP/IP security', 'Linux hardening', 'Vulnerability scanning'], skills: ['Networking', 'Linux', 'Ethical Hacking'] },
    ],
    projects: [
      { id: 'p-sec-01', title: 'Automated Port & Vulnerability Scanner', difficulty: 'Intermediate', skillsRequired: ['Python', 'Networking'], description: 'Build a Python tool leveraging Nmap to audit network perimeters.', expectedOutcome: 'Automated port auditing script.' },
    ],
    certifications: [{ id: 'cert-sec-plus', name: 'CompTIA Security+', issuingOrganization: 'CompTIA', level: 'Foundation' }],
    practiceAreas: [{ id: 'prac-sec-01', title: 'Technical Challenges', category: 'Technical Challenges', description: 'Network packet analysis and OWASP Top 10.', questionCount: 18 }],
    interviewTopics: [{ id: 'int-sec-01', topic: 'Technical Fundamentals', category: 'Technical', questionCount: 15, keyQuestions: ['Explain how SQL Injection works and how to remediate it.'] }],
  },

  // ================= DATA & AI =================
  {
    id: 'data-analyst',
    slug: 'data-analyst',
    title: 'Data Analyst',
    category: 'Data & AI',
    tagline: 'Transform raw data into strategic insights that drive business decisions.',
    shortDescription: 'Analyze complex datasets, build dashboards, and deliver data insights.',
    typicalTrajectory: ['Beginner', 'Junior Analyst', 'Data Analyst', 'Senior Analytics Manager'],
    roleOverview: {
      whatYouDo: 'Data Analysts query relational data warehouses, clean raw datasets, conduct exploratory analysis, and present dashboards in Power BI/Tableau.',
      youWillWorkOn: ['SQL Queries', 'Interactive Dashboards', 'Data Cleaning', 'A/B Test Analytics', 'Business Metrics'],
      whereCanYouWork: ['E-commerce', 'FinTech', 'Consulting', 'Retail', 'EdTech'],
    },
    salaryRange: { min: 600000, max: 1200000, currency: 'INR', period: 'LPA', formatted: '₹6–12 LPA', source: 'Industry Benchmark', updatedAt: '2026' },
    responsibilities: ['Write complex SQL queries', 'Build dashboards in Power BI / Tableau', 'Present insights to business leaders'],
    commonIndustries: ['E-commerce', 'FinTech', 'Retail'],
    skillGroups: {
      mustKnow: [
        { name: 'SQL', level: 'INTERMEDIATE', importance: 'MUST_KNOW' },
        { name: 'Excel', level: 'INTERMEDIATE', importance: 'MUST_KNOW' },
        { name: 'Python', level: 'INTERMEDIATE', importance: 'MUST_KNOW' },
        { name: 'Power BI', level: 'INTERMEDIATE', importance: 'MUST_KNOW' },
      ],
      goodToKnow: [{ name: 'Tableau', level: 'INTERMEDIATE', importance: 'GOOD_TO_KNOW' }],
      advanced: [{ name: 'Data Warehousing', level: 'ADVANCED', importance: 'ADVANCED' }],
    },
    learningPhases: [
      { phaseNumber: '01', title: 'SQL & DASHBOARDS', subtitle: 'Queries & Visualization', description: 'Master relational data extraction and reporting.', topics: ['SQL joins & CTEs', 'Power BI / Tableau', 'Excel analysis'], skills: ['SQL', 'Excel', 'Power BI'] },
    ],
    projects: [
      { id: 'p-da-01', title: 'Customer Churn Analytics Dashboard', difficulty: 'Intermediate', skillsRequired: ['SQL', 'Python', 'Power BI'], description: 'Analyze customer churn data and present executive recommendations.', expectedOutcome: 'Interactive executive dashboard.' },
    ],
    certifications: [{ id: 'cert-google-da', name: 'Google Data Analytics Certificate', issuingOrganization: 'Google', level: 'Foundation' }],
    practiceAreas: [{ id: 'prac-da-01', title: 'Technical Challenges', category: 'Technical Challenges', description: 'SQL window functions and CTE queries.', questionCount: 25 }],
    interviewTopics: [{ id: 'int-da-01', topic: 'Technical Fundamentals', category: 'Technical', questionCount: 15, keyQuestions: ['How do you calculate customer LTV using SQL?'] }],
  },

  {
    id: 'data-scientist',
    slug: 'data-scientist',
    title: 'Data Scientist',
    category: 'Data & AI',
    tagline: 'Combine statistical modeling, machine learning, and domain knowledge to solve complex problems.',
    shortDescription: 'Develop predictive models, statistical frameworks, and machine learning algorithms.',
    typicalTrajectory: ['Beginner', 'Associate Data Scientist', 'Data Scientist', 'Lead AI Scientist'],
    roleOverview: {
      whatYouDo: 'Data Scientists apply statistical methods, machine learning algorithms, and predictive modeling to solve business problems.',
      youWillWorkOn: ['Predictive Modeling', 'Machine Learning', 'Statistical Analysis', 'Feature Engineering'],
      whereCanYouWork: ['AI Tech Platforms', 'FinTech Risk', 'Biotech', 'E-commerce'],
    },
    salaryRange: { min: 900000, max: 2200000, currency: 'INR', period: 'LPA', formatted: '₹9–22 LPA', source: 'Industry Benchmark', updatedAt: '2026' },
    responsibilities: ['Build predictive ML models', 'Perform statistical hypothesis testing', 'Engineers features from raw data'],
    commonIndustries: ['AI & Tech', 'FinTech', 'Healthcare'],
    skillGroups: {
      mustKnow: [
        { name: 'Python', level: 'INTERMEDIATE', importance: 'MUST_KNOW' },
        { name: 'Statistics', level: 'INTERMEDIATE', importance: 'MUST_KNOW' },
        { name: 'Machine Learning', level: 'INTERMEDIATE', importance: 'MUST_KNOW' },
        { name: 'SQL', level: 'INTERMEDIATE', importance: 'MUST_KNOW' },
      ],
      goodToKnow: [{ name: 'Scikit-Learn', level: 'INTERMEDIATE', importance: 'GOOD_TO_KNOW' }],
      advanced: [{ name: 'Deep Learning', level: 'ADVANCED', importance: 'ADVANCED' }],
    },
    learningPhases: [
      { phaseNumber: '01', title: 'STATISTICS & ML', subtitle: 'Math & Python Core', description: 'Master statistics and machine learning algorithms.', topics: ['Probability & linear algebra', 'Scikit-Learn', 'Pandas & NumPy'], skills: ['Python', 'Statistics', 'Machine Learning'] },
    ],
    projects: [
      { id: 'p-ds-01', title: 'Real Estate Price Prediction Model', difficulty: 'Intermediate', skillsRequired: ['Python', 'Scikit-Learn', 'Pandas'], description: 'Train a regression algorithm to predict property valuations.', expectedOutcome: 'Trained ML prediction model.' },
    ],
    certifications: [{ id: 'cert-ibm-ds', name: 'IBM Data Science Certificate', issuingOrganization: 'IBM', level: 'Intermediate' }],
    practiceAreas: [{ id: 'prac-ds-01', title: 'Technical Challenges', category: 'Technical Challenges', description: 'Random forests, regression, and gradient boosting.', questionCount: 20 }],
    interviewTopics: [{ id: 'int-ds-01', topic: 'Technical Fundamentals', category: 'Technical', questionCount: 15, keyQuestions: ['Explain Precision vs Recall.'] }],
  },

  {
    id: 'ml-engineer',
    slug: 'ml-engineer',
    title: 'Machine Learning Engineer',
    category: 'Data & AI',
    tagline: 'Engineer, deploy, and scale machine learning models into production systems.',
    shortDescription: 'Build MLOps pipelines, model serving APIs, and real-time AI systems.',
    typicalTrajectory: ['Beginner', 'Junior ML Engineer', 'Machine Learning Engineer', 'Senior MLOps Architect'],
    roleOverview: {
      whatYouDo: 'Machine Learning Engineers build MLOps pipelines, containerize models, and deploy real-time AI inference APIs.',
      youWillWorkOn: ['Model Serving APIs', 'MLOps Pipelines', 'PyTorch Models', 'GPU Inferencing'],
      whereCanYouWork: ['AI Platforms', 'Autonomous Tech', 'Search & Recommendation Engines'],
    },
    salaryRange: { min: 1100000, max: 2400000, currency: 'INR', period: 'LPA', formatted: '₹11–24 LPA', source: 'Industry Benchmark', updatedAt: '2026' },
    responsibilities: ['Deploy ML models via REST APIs', 'Build MLOps pipelines with MLflow', 'Optimize inferencing latency'],
    commonIndustries: ['AI Tech', 'Automotive', 'FinTech'],
    skillGroups: {
      mustKnow: [
        { name: 'Python', level: 'ADVANCED', importance: 'MUST_KNOW' },
        { name: 'PyTorch', level: 'INTERMEDIATE', importance: 'MUST_KNOW' },
        { name: 'Docker', level: 'INTERMEDIATE', importance: 'MUST_KNOW' },
        { name: 'Machine Learning', level: 'INTERMEDIATE', importance: 'MUST_KNOW' },
      ],
      goodToKnow: [{ name: 'MLOps', level: 'INTERMEDIATE', importance: 'GOOD_TO_KNOW' }],
      advanced: [{ name: 'Distributed Training', level: 'ADVANCED', importance: 'ADVANCED' }],
    },
    learningPhases: [
      { phaseNumber: '01', title: 'MLOPS CORE', subtitle: 'PyTorch & Serving', description: 'Learn model serving and MLOps.', topics: ['PyTorch modeling', 'FastAPI serving', 'Docker containerization'], skills: ['Python', 'PyTorch', 'Docker'] },
    ],
    projects: [
      { id: 'p-mle-01', title: 'Real-Time Sentiment Analysis Inference API', difficulty: 'Intermediate', skillsRequired: ['PyTorch', 'FastAPI', 'Docker'], description: 'Deploy a fine-tuned NLP model via Dockerized API.', expectedOutcome: 'Deployed AI endpoint.' },
    ],
    certifications: [{ id: 'cert-aws-ml', name: 'AWS Machine Learning – Specialty', issuingOrganization: 'AWS', level: 'Advanced' }],
    practiceAreas: [{ id: 'prac-mle-01', title: 'Technical Challenges', category: 'Technical Challenges', description: 'Model quantization and inference latency optimization.', questionCount: 15 }],
    interviewTopics: [{ id: 'int-mle-01', topic: 'Technical Fundamentals', category: 'Technical', questionCount: 12, keyQuestions: ['How do you deploy a Transformer model to production?'] }],
  },

  // ================= PRODUCT & DESIGN =================
  {
    id: 'ui-ux-designer',
    slug: 'ui-ux-designer',
    title: 'UI/UX Designer',
    category: 'Product & Design',
    tagline: 'Design digital products that are easy, useful, and enjoyable to use.',
    shortDescription: 'Design digital products that are easy, useful, and enjoyable to use.',
    typicalTrajectory: ['Beginner', 'Junior Designer', 'UI/UX Designer', 'Senior Product Designer'],
    roleOverview: {
      whatYouDo: 'UI/UX Designers research user needs, wireframe digital concepts, design visual interfaces in Figma, and build interactive prototypes.',
      youWillWorkOn: ['User Research', 'Wireframes', 'Interactive Prototypes', 'Visual Design', 'Design Systems', 'Developer Handoff'],
      whereCanYouWork: ['Product Companies', 'SaaS Enterprises', 'FinTech', 'E-commerce', 'Creative Agencies'],
    },
    salaryRange: { min: 600000, max: 1500000, currency: 'INR', period: 'LPA', formatted: '₹6–15 LPA', source: 'Industry Benchmark', updatedAt: '2026' },
    responsibilities: ['Conduct user research & interviews', 'Create wireframes & prototypes in Figma', 'Build scalable UI design systems'],
    commonIndustries: ['SaaS', 'FinTech', 'Consumer Apps', 'E-commerce'],
    skillGroups: {
      mustKnow: [
        { name: 'Figma', level: 'ADVANCED', importance: 'MUST_KNOW', description: 'Components, auto-layout, variants, and prototyping.' },
        { name: 'User Research', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'Usability testing, user personas, and interviews.' },
        { name: 'Wireframing', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'Low-fidelity user flows and wireframes.' },
        { name: 'Design Systems', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'Typography, color tokens, and UI guidelines.' },
      ],
      goodToKnow: [{ name: 'Prototyping', level: 'INTERMEDIATE', importance: 'GOOD_TO_KNOW' }],
      advanced: [{ name: 'Micro-interactions', level: 'ADVANCED', importance: 'ADVANCED' }],
    },
    learningPhases: [
      { phaseNumber: '01', title: 'UX FOUNDATIONS', subtitle: 'Principles & Flows', description: 'Master user research and wireframing.', topics: ['UX principles', 'User research', 'User flows', 'Information architecture'], skills: ['User Research', 'Wireframing'] },
      { phaseNumber: '02', title: 'UI DESIGN', subtitle: 'Figma & Components', description: 'Design visual layouts and design systems.', topics: ['Figma auto-layout', 'Typography & color', 'Design tokens', 'Components'], skills: ['Figma', 'Design Systems'], recommendedCourse: { id: 'c-ux-01', title: 'Figma UI/UX Design System Mastery', provider: 'PATHWAY Academy', level: 'Intermediate', available: true } },
    ],
    projects: [
      { id: 'p-ux-01', title: 'Mobile Banking App Experience Design', difficulty: 'Intermediate', skillsRequired: ['Figma', 'User Research', 'Prototyping'], description: 'A complete mobile banking experience from research to interactive prototype.', expectedOutcome: 'Interactive Figma design file and prototype.' },
    ],
    certifications: [{ id: 'cert-ux-google', name: 'Google UX Design Professional Certificate', issuingOrganization: 'Google', level: 'Foundation' }],
    practiceAreas: [{ id: 'prac-ux-01', title: 'Portfolio Challenges', category: 'Portfolio Challenges', description: 'Design mobile checkout funnels and onboardings.', questionCount: 15 }],
    interviewTopics: [{ id: 'int-ux-01', topic: 'Portfolio Discussion', category: 'Role Specific', questionCount: 10, keyQuestions: ['Walk us through a design decision where business goals conflicted with UX.'] }],
  },

  {
    id: 'product-manager',
    slug: 'product-manager',
    title: 'Product Manager',
    category: 'Product & Design',
    tagline: 'Define product vision, strategy, roadmap, and align engineering and design teams.',
    shortDescription: 'Lead product strategy, user research, and feature prioritization.',
    typicalTrajectory: ['Beginner', 'Associate PM', 'Product Manager', 'Senior PM / Group PM'],
    roleOverview: {
      whatYouDo: 'Product Managers define product strategy, write PRDs, manage backlogs, and align tech, design, and business teams.',
      youWillWorkOn: ['Product Vision', 'PRDs & User Stories', 'Feature Prioritization', 'Product Analytics', 'User Research'],
      whereCanYouWork: ['SaaS Startups', 'Consumer Tech', 'FinTech', 'E-commerce'],
    },
    salaryRange: { min: 1200000, max: 2500000, currency: 'INR', period: 'LPA', formatted: '₹12–25 LPA', source: 'Industry Benchmark', updatedAt: '2026' },
    responsibilities: ['Write PRDs and user stories', 'Prioritize product backlogs', 'Analyze user churn and metrics'],
    commonIndustries: ['SaaS', 'FinTech', 'Consumer Apps'],
    skillGroups: {
      mustKnow: [
        { name: 'Product Strategy', level: 'INTERMEDIATE', importance: 'MUST_KNOW' },
        { name: 'User Research', level: 'INTERMEDIATE', importance: 'MUST_KNOW' },
        { name: 'Agile & Scrum', level: 'INTERMEDIATE', importance: 'MUST_KNOW' },
        { name: 'PRD Writing', level: 'INTERMEDIATE', importance: 'MUST_KNOW' },
      ],
      goodToKnow: [{ name: 'Product Analytics', level: 'INTERMEDIATE', importance: 'GOOD_TO_KNOW' }],
      advanced: [{ name: 'GTM Strategy', level: 'ADVANCED', importance: 'ADVANCED' }],
    },
    learningPhases: [
      { phaseNumber: '01', title: 'PRODUCT DISCOVERY', subtitle: 'Strategy & PRDs', description: 'Learn product discovery and specification.', topics: ['Customer discovery', 'PRD writing', 'Backlog grooming'], skills: ['Product Strategy', 'PRD Writing'] },
    ],
    projects: [
      { id: 'p-pm-01', title: 'SaaS Onboarding Redesign PRD', difficulty: 'Intermediate', skillsRequired: ['PRD Writing', 'Figma', 'Product Analytics'], description: 'Draft a full PRD for onboarding activation.', expectedOutcome: 'Documented product requirement document.' },
    ],
    certifications: [{ id: 'cert-pspo', name: 'Professional Scrum Product Owner (PSPO I)', issuingOrganization: 'Scrum.org', level: 'Foundation' }],
    practiceAreas: [{ id: 'prac-pm-01', title: 'Scenario Questions', category: 'Scenario Questions', description: 'Product metrics, metric drops, and feature trade-offs.', questionCount: 20 }],
    interviewTopics: [{ id: 'int-pm-01', topic: 'Technical Fundamentals', category: 'Technical', questionCount: 15, keyQuestions: ['How do you prioritize features using RICE score?'] }],
  },

  // ================= BUSINESS & GROWTH =================
  {
    id: 'business-analyst',
    slug: 'business-analyst',
    title: 'Business Analyst',
    category: 'Business & Growth',
    tagline: 'Bridge business strategy and technology execution to optimize process efficiency.',
    shortDescription: 'Analyze business workflows, write requirements, and recommend process improvements.',
    typicalTrajectory: ['Beginner', 'Junior Business Analyst', 'Business Analyst', 'Lead Systems Analyst'],
    roleOverview: {
      whatYouDo: 'Business Analysts document business requirements (BRDs), model operational processes in BPMN, and bridge tech and business teams.',
      youWillWorkOn: ['Business Requirements (BRD)', 'Process Modeling (BPMN)', 'Data Extraction (SQL)', 'Stakeholder Alignment'],
      whereCanYouWork: ['Consulting', 'Banking', 'IT Services', 'Logistics'],
    },
    salaryRange: { min: 700000, max: 1500000, currency: 'INR', period: 'LPA', formatted: '₹7–15 LPA', source: 'Industry Benchmark', updatedAt: '2026' },
    responsibilities: ['Draft BRD and FRS documents', 'Model AS-IS and TO-BE workflows', 'Extract business data using SQL'],
    commonIndustries: ['Consulting', 'Banking', 'IT Services'],
    skillGroups: {
      mustKnow: [
        { name: 'BRD Writing', level: 'INTERMEDIATE', importance: 'MUST_KNOW' },
        { name: 'Process Modeling', level: 'INTERMEDIATE', importance: 'MUST_KNOW' },
        { name: 'SQL', level: 'INTERMEDIATE', importance: 'MUST_KNOW' },
        { name: 'Excel', level: 'INTERMEDIATE', importance: 'MUST_KNOW' },
      ],
      goodToKnow: [{ name: 'Jira', level: 'INTERMEDIATE', importance: 'GOOD_TO_KNOW' }],
      advanced: [{ name: 'Financial Modeling', level: 'ADVANCED', importance: 'ADVANCED' }],
    },
    learningPhases: [
      { phaseNumber: '01', title: 'BUSINESS PROCESSES', subtitle: 'Requirements & BPMN', description: 'Learn process mapping and requirements.', topics: ['BRD writing', 'BPMN flowcharts', 'SQL query basics'], skills: ['BRD Writing', 'Process Modeling', 'SQL'] },
    ],
    projects: [
      { id: 'p-ba-01', title: 'Fulfillment Operations BRD & Process Map', difficulty: 'Intermediate', skillsRequired: ['Process Modeling', 'BRD Writing'], description: 'Document AS-IS and TO-BE process workflows for an e-commerce warehouse.', expectedOutcome: 'Complete BRD documentation.' },
    ],
    certifications: [{ id: 'cert-cbap', name: 'Certified Business Analysis Professional (CBAP)', issuingOrganization: 'IIBA', level: 'Intermediate' }],
    practiceAreas: [{ id: 'prac-ba-01', title: 'Scenario Questions', category: 'Scenario Questions', description: 'Stakeholder alignment and bottleneck resolution.', questionCount: 15 }],
    interviewTopics: [{ id: 'int-ba-01', topic: 'Role-Specific Questions', category: 'Role Specific', questionCount: 12, keyQuestions: ['How do you resolve conflicting requirements?'] }],
  },

  {
    id: 'digital-marketing-specialist',
    slug: 'digital-marketing-specialist',
    title: 'Digital Marketing Specialist',
    category: 'Business & Growth',
    tagline: 'Drive brand awareness, customer acquisition, and campaign performance across digital channels.',
    shortDescription: 'Manage SEO, Google Ads, paid social media campaigns, and digital conversion funnels.',
    typicalTrajectory: ['Beginner', 'Marketing Executive', 'Digital Marketing Specialist', 'Growth Marketing Lead'],
    roleOverview: {
      whatYouDo: 'Digital Marketing Specialists run Google Ads, optimize website SEO, manage social media campaigns, and analyze conversion performance in GA4.',
      youWillWorkOn: ['Google Search Ads', 'SEO Content', 'GA4 Analytics', 'Email Automation', 'Conversion Rate Optimization'],
      whereCanYouWork: ['D2C Brands', 'Digital Agencies', 'SaaS', 'EdTech'],
    },
    salaryRange: { min: 500000, max: 1200000, currency: 'INR', period: 'LPA', formatted: '₹5–12 LPA', source: 'Industry Benchmark', updatedAt: '2026' },
    responsibilities: ['Run Google Search & Meta ad campaigns', 'Perform SEO keyword audits', 'Track GA4 conversion funnels'],
    commonIndustries: ['E-commerce', 'Agencies', 'SaaS'],
    skillGroups: {
      mustKnow: [
        { name: 'SEO', level: 'INTERMEDIATE', importance: 'MUST_KNOW' },
        { name: 'Google Ads', level: 'INTERMEDIATE', importance: 'MUST_KNOW' },
        { name: 'GA4 Analytics', level: 'INTERMEDIATE', importance: 'MUST_KNOW' },
        { name: 'Content Marketing', level: 'INTERMEDIATE', importance: 'MUST_KNOW' },
      ],
      goodToKnow: [{ name: 'Email Automation', level: 'INTERMEDIATE', importance: 'GOOD_TO_KNOW' }],
      advanced: [{ name: 'Conversion Optimization', level: 'ADVANCED', importance: 'ADVANCED' }],
    },
    learningPhases: [
      { phaseNumber: '01', title: 'DIGITAL CHANNELS', subtitle: 'SEO & Paid Ads', description: 'Master organic and paid acquisition.', topics: ['SEO audits', 'Google Search ads', 'GA4 conversion tracking'], skills: ['SEO', 'Google Ads', 'GA4 Analytics'] },
    ],
    projects: [
      { id: 'p-dm-01', title: 'E-Commerce Ad Campaign Audit & Plan', difficulty: 'Intermediate', skillsRequired: ['Google Ads', 'GA4 Analytics'], description: 'Draft a mock $5,000 search ad strategy and analytics report.', expectedOutcome: 'Campaign audit and proposal deck.' },
    ],
    certifications: [{ id: 'cert-gads', name: 'Google Search Ads Certification', issuingOrganization: 'Google', level: 'Foundation' }],
    practiceAreas: [{ id: 'prac-dm-01', title: 'Technical Challenges', category: 'Technical Challenges', description: 'Calculate ROAS, CTR, and CPA math.', questionCount: 15 }],
    interviewTopics: [{ id: 'int-dm-01', topic: 'Role-Specific Questions', category: 'Role Specific', questionCount: 12, keyQuestions: ['How do you optimize cost per acquisition (CPA)?'] }],
  },

  // ================= ELECTRONICS & SYSTEMS =================
  {
    id: 'embedded-systems-engineer',
    slug: 'embedded-systems-engineer',
    title: 'Embedded Systems Engineer',
    category: 'Electronics & Systems',
    tagline: 'Design firmware, microcontrollers, and hardware-software integration for smart devices.',
    shortDescription: 'Develop firmware in C/C++, PCB interfaces, and real-time operating systems (RTOS).',
    typicalTrajectory: ['Beginner', 'Firmware Engineer', 'Embedded Systems Engineer', 'Senior Hardware Architect'],
    roleOverview: {
      whatYouDo: 'Embedded Systems Engineers write low-level microcontroller firmware in C/C++, interface hardware sensors over SPI/I2C, and configure RTOS tasks.',
      youWillWorkOn: ['Embedded C/C++', 'STM32 Microcontrollers', 'FreeRTOS', 'SPI / I2C / UART Protocols', 'Oscilloscope Debugging'],
      whereCanYouWork: ['Automotive & EV', 'Robotics', 'Consumer Electronics', 'Medical Devices'],
    },
    salaryRange: { min: 700000, max: 1600000, currency: 'INR', period: 'LPA', formatted: '₹7–16 LPA', source: 'Industry Benchmark', updatedAt: '2026' },
    responsibilities: ['Write C/C++ firmware for STM32/ESP32', 'Configure FreeRTOS tasks and queues', 'Debug hardware buses using oscilloscopes'],
    commonIndustries: ['Automotive', 'Robotics', 'IoT Hardware'],
    skillGroups: {
      mustKnow: [
        { name: 'Embedded C', level: 'ADVANCED', importance: 'MUST_KNOW' },
        { name: 'STM32 Microcontrollers', level: 'INTERMEDIATE', importance: 'MUST_KNOW' },
        { name: 'SPI & I2C Protocols', level: 'INTERMEDIATE', importance: 'MUST_KNOW' },
        { name: 'FreeRTOS', level: 'INTERMEDIATE', importance: 'MUST_KNOW' },
      ],
      goodToKnow: [{ name: 'PCB Reading', level: 'INTERMEDIATE', importance: 'GOOD_TO_KNOW' }],
      advanced: [{ name: 'Embedded Linux', level: 'ADVANCED', importance: 'ADVANCED' }],
    },
    learningPhases: [
      { phaseNumber: '01', title: 'FIRMWARE CORE', subtitle: 'Embedded C & RTOS', description: 'Learn hardware registers and multi-tasking.', topics: ['Embedded C register bitwise', 'STM32 GPIO & timers', 'FreeRTOS tasks & queues'], skills: ['Embedded C', 'STM32 Microcontrollers', 'FreeRTOS'] },
    ],
    projects: [
      { id: 'p-emb-01', title: 'FreeRTOS Sensor Acquisition System', difficulty: 'Intermediate', skillsRequired: ['Embedded C', 'FreeRTOS', 'SPI & I2C Protocols'], description: 'Write multi-threaded firmware to sample accelerometer data and transmit via UART.', expectedOutcome: 'Tested FreeRTOS firmware code.' },
    ],
    certifications: [{ id: 'cert-arm-emb', name: 'ARM Accredited Engineer Certification', issuingOrganization: 'ARM', level: 'Intermediate' }],
    practiceAreas: [{ id: 'prac-emb-01', title: 'Technical Challenges', category: 'Technical Challenges', description: 'Register bit-masking and interrupt service routines.', questionCount: 20 }],
    interviewTopics: [{ id: 'int-emb-01', topic: 'Technical Fundamentals', category: 'Technical', questionCount: 15, keyQuestions: ['Explain Priority Inversion in RTOS.'] }],
  },

  // ================= MECHANICAL & MANUFACTURING =================
  {
    id: 'mechanical-design-engineer',
    slug: 'mechanical-design-engineer',
    title: 'Mechanical Design Engineer',
    category: 'Mechanical & Manufacturing',
    tagline: 'Design 3D mechanical components, assemblies, and physical products using CAD and FEA.',
    shortDescription: 'Create precision 3D CAD models, stress FEA simulations, and manufacturing drawings.',
    typicalTrajectory: ['Beginner', 'Junior CAD Engineer', 'Mechanical Design Engineer', 'Senior Design Architect'],
    roleOverview: {
      whatYouDo: 'Mechanical Design Engineers concept, model, analyze, and test physical products and machinery using SolidWorks, GD&T, and FEA simulation.',
      youWillWorkOn: ['3D Parametric CAD', 'GD&T 2D Drawings', 'FEA Stress Simulation', 'Prototyping & DFM', 'Material Selection'],
      whereCanYouWork: ['Automotive & Aerospace', 'Robotics', 'Consumer Hardware', 'Industrial Machinery'],
    },
    salaryRange: { min: 600000, max: 1400000, currency: 'INR', period: 'LPA', formatted: '₹6–14 LPA', source: 'Industry Benchmark', updatedAt: '2026' },
    responsibilities: ['Create 3D assemblies in SolidWorks', 'Generate 2D drawings with GD&T', 'Perform FEA stress analysis'],
    commonIndustries: ['Automotive', 'Robotics', 'Aerospace'],
    skillGroups: {
      mustKnow: [
        { name: 'SolidWorks', level: 'ADVANCED', importance: 'MUST_KNOW' },
        { name: 'GD&T', level: 'INTERMEDIATE', importance: 'MUST_KNOW' },
        { name: 'FEA Simulation', level: 'INTERMEDIATE', importance: 'MUST_KNOW' },
        { name: 'Materials Selection', level: 'INTERMEDIATE', importance: 'MUST_KNOW' },
      ],
      goodToKnow: [{ name: '3D Printing', level: 'INTERMEDIATE', importance: 'GOOD_TO_KNOW' }],
      advanced: [{ name: 'CFD Fluid Simulation', level: 'ADVANCED', importance: 'ADVANCED' }],
    },
    learningPhases: [
      { phaseNumber: '01', title: 'CAD & DRAFTING', subtitle: 'SolidWorks & GD&T', description: 'Master parametric 3D modeling and 2D drafting.', topics: ['SolidWorks 3D parts & assemblies', 'GD&T tolerance standards', 'FEA static stress simulation'], skills: ['SolidWorks', 'GD&T', 'FEA Simulation'] },
    ],
    projects: [
      { id: 'p-mech-01', title: 'Robotic Arm End-Effector Mechanism', difficulty: 'Intermediate', skillsRequired: ['SolidWorks', 'GD&T', 'FEA Simulation'], description: 'Design a 3D printable mechanical gripper assembly with stress simulation.', expectedOutcome: 'FEA stress report and SolidWorks CAD files.' },
    ],
    certifications: [{ id: 'cert-cwp', name: 'CSWP – Certified SOLIDWORKS Professional', issuingOrganization: 'Dassault Systèmes', level: 'Intermediate' }],
    practiceAreas: [{ id: 'prac-mech-01', title: 'Technical Challenges', category: 'Technical Challenges', description: 'Tolerance stack-up calculations and material stress curves.', questionCount: 20 }],
    interviewTopics: [{ id: 'int-mech-01', topic: 'Technical Fundamentals', category: 'Technical', questionCount: 15, keyQuestions: ['How do you select between Aluminum 6061 and Stainless Steel 304?'] }],
  },
];
