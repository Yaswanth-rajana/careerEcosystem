import { CareerPath } from './career-types';

export const CAREER_PATHS: CareerPath[] = [
  // ================= TECHNOLOGY =================
  {
    id: 'software-engineer',
    slug: 'software-engineer',
    title: 'Software Engineer',
    category: 'Technology',
    domainType: 'software',
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
    domainType: 'cloud_devops',
    tagline: 'Build and manage scalable, secure modern cloud infrastructure and automated services.',
    shortDescription: 'Build and manage scalable cloud infrastructure and services.',
    typicalTrajectory: ['Cloud Support Associate', 'Cloud Engineer', 'Senior Cloud Engineer'],
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
    domainType: 'cloud_devops',
    tagline: 'Bridge software development and operations through automation, CI/CD, and reliability.',
    shortDescription: 'Streamline continuous delivery pipelines, container orchestration, and platform automation.',
    typicalTrajectory: ['DevOps Trainee', 'DevOps Engineer', 'Senior DevOps Engineer'],
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
    domainType: 'security',
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
    domainType: 'data',
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
    domainType: 'data',
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

  // ================= ELECTRONICS & SYSTEMS =================
  {
    id: 'embedded-hardware-engineer',
    slug: 'embedded-hardware-engineer',
    title: 'Embedded Systems & Hardware Engineer',
    category: 'Electronics & Systems',
    domainType: 'hardware',
    tagline: 'Design electronic circuits, printed circuit boards, and write bare-metal firmware for smart hardware.',
    shortDescription: 'Engineer electronic schematics, PCB layouts, and low-level firmware for IoT and physical devices.',
    typicalTrajectory: ['Beginner', 'Junior Hardware Engineer', 'Embedded Systems Engineer', 'Senior Hardware Architect'],
    roleOverview: {
      whatYouDo: 'Embedded Systems & Hardware Engineers design electronic circuit schematics, layout printed circuit boards (PCBs), develop bare-metal C/C++ firmware, and validate physical hardware in laboratories.',
      youWillWorkOn: ['Circuit Schematic Capture', 'PCB Layout & Gerber Files', 'Microcontroller Firmware in C', 'Hardware Protocols (I2C, SPI, CAN)', 'Oscilloscope Signal Debugging', 'EMI/EMC Compliance'],
      whereCanYouWork: ['Semiconductor Companies', 'Automotive & EV Platforms', 'Consumer Electronics', 'Medical Devices', 'Aerospace & Defense', 'Industrial Automation & Robotics'],
    },
    salaryRange: { min: 700000, max: 1800000, currency: 'INR', period: 'LPA', formatted: '₹7–18 LPA', source: 'Industry Benchmark', updatedAt: '2026' },
    responsibilities: [
      'Design electronic schematics and multi-layer PCB layouts using KiCad or Altium Designer.',
      'Write bare-metal and RTOS firmware in Embedded C/C++ for ARM Cortex microcontrollers.',
      'Validate circuits using oscilloscopes, logic analyzers, and digital bench instruments.',
      'Perform board bring-up, signal integrity testing, and EMC compliance pre-scans.',
    ],
    commonIndustries: ['Automotive & EV', 'Consumer Electronics', 'Semiconductors', 'Industrial IoT', 'Medical Hardware'],
    skillGroups: {
      mustKnow: [
        { name: 'Circuit Fundamentals', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'Analog/digital circuits, Ohm’s and Kirchhoff’s laws, and component analysis.' },
        { name: 'Embedded C', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'Pointers, bit manipulation, register mapping, and volatile memory.' },
        { name: 'PCB Design (KiCad / Altium)', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'Schematic capture, PCB routing, layer stackup, and DFM rules.' },
        { name: 'Hardware Protocols (I2C, SPI, UART)', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'Serial bus timing, pull-up sizing, clock synchronization, and packet framing.' },
      ],
      goodToKnow: [
        { name: 'RTOS (FreeRTOS)', level: 'INTERMEDIATE', importance: 'GOOD_TO_KNOW', description: 'Multitasking, queues, semaphores, and priority inversion prevention.' },
        { name: 'Lab Instrumentation', level: 'INTERMEDIATE', importance: 'GOOD_TO_KNOW', description: 'Oscilloscope probing, logic analyzers, and signal generator usage.' },
      ],
      advanced: [
        { name: 'High-Speed PCB Design', level: 'ADVANCED', importance: 'ADVANCED', description: 'Controlled impedance, differential pair length tuning, and EMC suppression.' },
      ],
    },
    learningPhases: [
      {
        phaseNumber: '01',
        title: 'CIRCUITS & EMBEDDED C',
        subtitle: 'Analog & Digital Foundations',
        description: 'Master circuit theory, bench instrumentation, and register-level Embedded C programming.',
        topics: ['Circuit laws & passive filters', 'Embedded C bitwise operations', 'Microcontroller GPIO & timer interrupts', 'Bench multimeter & oscilloscope probing'],
        skills: ['Circuit Fundamentals', 'Embedded C', 'Lab Instrumentation'],
      },
      {
        phaseNumber: '02',
        title: 'PCB DESIGN & PROTOCOLS',
        subtitle: 'Schematic to Assembled Board',
        description: 'Design manufactured printed circuit boards and interface with real-world sensor protocols.',
        topics: ['KiCad schematic capture & routing', 'Ground plane return paths', 'I2C, SPI, and UART protocol buses', 'Surface-mount soldering & board bring-up'],
        skills: ['PCB Design (KiCad / Altium)', 'Hardware Protocols (I2C, SPI, UART)', 'RTOS (FreeRTOS)'],
      },
      {
        phaseNumber: '03',
        title: 'HIGH-SPEED & EMC DESIGN',
        subtitle: 'Signal Integrity & Compliance',
        description: 'Design multi-layer high-speed circuits meeting international regulatory standards.',
        topics: ['Controlled impedance routing', 'Radiated & conducted EMI suppression', 'Hardware-in-the-loop automated testing', 'Functional safety (ISO 26262)'],
        skills: ['High-Speed PCB Design', 'EMC Compliance', 'Hardware Systems Architecture'],
      },
    ],
    projects: [
      {
        id: 'p-hw-01',
        title: 'Custom Environmental Sensor Gateway PCB',
        difficulty: 'Intermediate',
        skillsRequired: ['PCB Design (KiCad / Altium)', 'Circuit Fundamentals', 'Hardware Protocols (I2C, SPI, UART)'],
        description: 'Design a 2-layer PCB integrating an ARM Cortex microcontroller, power regulation, and I2C sensors with complete Gerber exports.',
        expectedOutcome: 'Manufactured PCB with documented schematic, BOM, and board bring-up validation notes.',
      },
      {
        id: 'p-hw-02',
        title: 'FreeRTOS Multi-Sensor Data Logger & Telemetry Node',
        difficulty: 'Intermediate',
        skillsRequired: ['Embedded C', 'RTOS (FreeRTOS)', 'Microcontroller Peripherals'],
        description: 'Implement a multitasking firmware architecture on STM32 managing sensor reading, flash storage queues, and low-power sleep cycles.',
        expectedOutcome: 'Tested firmware repository with register-level drivers and oscilloscope timing captures.',
      },
    ],
    certifications: [
      { id: 'cert-ipc', name: 'IPC Certified IPC Specialist (CIS) in PCB Assembly', issuingOrganization: 'IPC', level: 'Intermediate' },
      { id: 'cert-arm', name: 'Arm Accredited Engineer (AAE)', issuingOrganization: 'Arm', level: 'Intermediate' },
    ],
    practiceAreas: [
      { id: 'prac-hw-01', title: 'Schematic & Circuit Math Drills', category: 'Technical Challenges', description: 'Calculate voltage dividers, transistor bias points, and RC time constants.', questionCount: 15 },
      { id: 'prac-hw-02', title: 'Protocol Decoding & Logic Analysis', category: 'Technical Challenges', description: 'Decode I2C and SPI timing diagrams with missing ACK flags.', questionCount: 12 },
      { id: 'prac-hw-03', title: 'Board Bring-Up & Power Triage', category: 'Scenario Questions', description: 'Diagnose shorted power rails, clock oscillator failures, and floating pins.', questionCount: 10 },
    ],
    interviewTopics: [
      {
        id: 'int-hw-01',
        topic: 'Electronic Circuits & Microcontroller Architecture',
        category: 'Technical',
        questionCount: 3,
        keyQuestions: [
          'What is the purpose of the volatile keyword in Embedded C and what happens if it is omitted in interrupt routines?',
          'How do you size pull-up resistors for an I2C bus considering bus capacitance and operating frequency?',
          'Explain the difference between analog and digital grounds on a mixed-signal PCB and how they should be connected.',
        ],
      },
      {
        id: 'int-hw-02',
        topic: 'Hardware Troubleshooting & Laboratory Debugging',
        category: 'Role Specific',
        questionCount: 2,
        keyQuestions: [
          'Walk me through the systematic diagnostic steps you take when a newly fabricated board fails to power up.',
          'How do you identify and mitigate ringing or overshoot observed on a high-speed clock line using an oscilloscope?',
        ],
      },
    ],
  },

  {
    id: 'site-reliability-engineer',
    slug: 'site-reliability-engineer',
    title: 'Site Reliability Engineer',
    category: 'Technology',
    domainType: 'cloud_devops',
    tagline: 'Bridge development and operations with software engineering to build ultra-reliable systems.',
    shortDescription: 'Improve system reliability, availability and performance through automation, monitoring and incident management.',
    typicalTrajectory: ['SRE Trainee', 'Site Reliability Engineer', 'Senior Site Reliability Engineer'],
    roleOverview: {
      whatYouDo: 'Site Reliability Engineers apply software engineering practices to system administration and infrastructure operations, ensuring high availability, scalable observability, and rapid incident response.',
      youWillWorkOn: ['Prometheus & Grafana', 'Incident Management & Postmortems', 'Chaos Engineering', 'SLO & SLI Engineering', 'Linux Automation'],
      whereCanYouWork: ['High-Scale SaaS', 'FinTech & Payments', 'Cloud Platform Providers', 'E-Commerce Giants'],
    },
    salaryRange: { min: 1200000, max: 2400000, currency: 'INR', period: 'LPA', formatted: '₹12–24 LPA', source: 'Industry Benchmark', updatedAt: '2026' },
    responsibilities: [
      'Instrument metrics and monitoring with Prometheus and Grafana.',
      'Automate incident triage and mitigation using Python and Bash.',
      'Define and enforce Service Level Objectives (SLOs) and Error Budgets.',
    ],
    commonIndustries: ['SaaS', 'FinTech', 'Cloud Platforms', 'E-commerce'],
    skillGroups: {
      mustKnow: [
        { name: 'Linux', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'Kernel tuning, systemd, process debugging, and networking.' },
        { name: 'Prometheus', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'Metrics collection, PromQL queries, and Alertmanager routing.' },
        { name: 'Grafana', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'Telemetry dashboards, synthetic monitoring, and alerting.' },
        { name: 'Monitoring', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'APM, distributed tracing, log aggregation, and health checks.' },
        { name: 'Python', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'Incident automation scripts, custom exporters, and tooling.' },
        { name: 'Incident Management', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'On-call escalation, incident command, and blameless postmortems.' },
      ],
      goodToKnow: [
        { name: 'Kubernetes', level: 'INTERMEDIATE', importance: 'GOOD_TO_KNOW' },
        { name: 'Terraform', level: 'INTERMEDIATE', importance: 'GOOD_TO_KNOW' },
      ],
      advanced: [
        { name: 'Chaos Engineering', level: 'ADVANCED', importance: 'ADVANCED' },
      ],
    },
    learningPhases: [
      { phaseNumber: '01', title: 'OBSERVABILITY CORE', subtitle: 'Prometheus, Grafana & Metrics', description: 'Master telemetry pipelines, metric exporters, and dashboarding.', topics: ['Prometheus architecture', 'PromQL queries', 'Grafana alerting', 'Linux sysstat'], skills: ['Linux', 'Prometheus', 'Grafana'] },
      { phaseNumber: '02', title: 'RELIABILITY & AUTOMATION', subtitle: 'Incident Triage & Scripting', description: 'Automate runbooks and configure incident alerts.', topics: ['Python automation', 'PagerDuty / Alertmanager', 'SLO / SLI definitions', 'Blameless postmortems'], skills: ['Monitoring', 'Python', 'Incident Management'] },
    ],
    projects: [
      { id: 'p-sre-01', title: 'Production Observability & Alerting Stack', difficulty: 'Intermediate', skillsRequired: ['Prometheus', 'Grafana', 'Linux'], description: 'Deploy Prometheus and Grafana monitoring for microservices with custom PromQL alerts and automated notifications.', expectedOutcome: 'Full-stack production monitoring dashboard with automated alert rules.' },
    ],
    certifications: [{ id: 'cert-sre-01', name: 'Google Cloud Certified Professional Cloud DevOps Engineer', issuingOrganization: 'Google Cloud', level: 'Intermediate' }],
    practiceAreas: [
      { id: 'prac-sre-01', title: 'Scenario Questions', category: 'Scenario Questions', description: 'High latency triage, memory leak diagnostics, and cascading failure containment.', questionCount: 15 },
    ],
    interviewTopics: [
      { id: 'int-sre-01', topic: 'Technical Fundamentals', category: 'Technical', questionCount: 10, keyQuestions: ['How do you differentiate between SLI, SLO, and SLA?', 'What is an error budget and how do you handle budget exhaustion?'] },
    ],
  },

  {
    id: 'virtualization-engineer',
    slug: 'virtualization-engineer',
    title: 'Virtualization Engineer',
    category: 'Technology',
    domainType: 'general',
    tagline: 'Architect and maintain enterprise virtual machines, hypervisors, and private cloud clusters.',
    shortDescription: 'Design and manage virtualized computing environments, virtual machines and enterprise infrastructure platforms.',
    typicalTrajectory: ['Virtualization Support Associate', 'Virtualization Engineer', 'Senior Virtualization Engineer'],
    roleOverview: {
      whatYouDo: 'Virtualization Engineers deploy, configure, cluster, and optimize virtualized compute environments across VMware ESXi, vCenter, and Microsoft Hyper-V to maximize hardware utilization and high availability.',
      youWillWorkOn: ['VMware vSphere & ESXi', 'Microsoft Hyper-V', 'Virtual Networking (vSwitch)', 'SAN/NAS Datastores', 'Virtual Machine Migration (vMotion)'],
      whereCanYouWork: ['Enterprise Data Centers', 'Managed Service Providers', 'Financial Institutions', 'Government & Healthcare IT'],
    },
    salaryRange: { min: 700000, max: 1500000, currency: 'INR', period: 'LPA', formatted: '₹7–15 LPA', source: 'Industry Benchmark', updatedAt: '2026' },
    responsibilities: [
      'Deploy and cluster VMware ESXi and vCenter environments.',
      'Configure vSwitch networks and shared datastores.',
      'Manage VM snapshots, template cloning, and live migration.',
    ],
    commonIndustries: ['Enterprise IT', 'Data Centers', 'Banking', 'Healthcare'],
    skillGroups: {
      mustKnow: [
        { name: 'VMware', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'vSphere, ESXi hosts, vCenter Server, and cluster configuration.' },
        { name: 'Hyper-V', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'Microsoft Hyper-V clustering, virtual hard disks, and failover.' },
        { name: 'Virtual Machines', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'Provisioning, resource allocation, snapshots, and vMotion migration.' },
        { name: 'Networking', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'Virtual switches, VLAN tagging, and uplink bonding.' },
        { name: 'Virtualization Management', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'High availability (HA), DRS load balancing, and capacity planning.' },
      ],
      goodToKnow: [
        { name: 'Storage Area Networks (SAN)', level: 'INTERMEDIATE', importance: 'GOOD_TO_KNOW' },
      ],
      advanced: [
        { name: 'VMware NSX Software-Defined Networking', level: 'ADVANCED', importance: 'ADVANCED' },
      ],
    },
    learningPhases: [
      { phaseNumber: '01', title: 'HYPERVISOR FOUNDATIONS', subtitle: 'ESXi & Hyper-V Setup', description: 'Install bare-metal hypervisors and configure host networking.', topics: ['Bare-metal ESXi install', 'Virtual machine lifecycle', 'vSwitch configurations', 'Host resource allocation'], skills: ['VMware', 'Hyper-V', 'Virtual Machines'] },
      { phaseNumber: '02', title: 'CLUSTER ARCHITECTURE', subtitle: 'vCenter HA & vMotion', description: 'Configure shared datastores, live VM migration, and fault tolerance.', topics: ['vCenter management', 'vMotion migrations', 'DRS and HA clustering', 'Virtualization security'], skills: ['Networking', 'Virtualization Management'] },
    ],
    projects: [
      { id: 'p-virt-01', title: 'High-Availability VMware Cluster with Shared Storage', difficulty: 'Beginner', skillsRequired: ['VMware', 'Virtual Machines', 'Networking'], description: 'Build a multi-host vSphere cluster with vCenter, configuring redundant virtual switches and automated VM failover.', expectedOutcome: 'A functioning HA virtualization cluster demonstrating seamless vMotion migration.' },
    ],
    certifications: [{ id: 'cert-virt-01', name: 'VMware Certified Professional – Data Center Virtualization (VCP-DCV)', issuingOrganization: 'VMware by Broadcom', level: 'Intermediate' }],
    practiceAreas: [
      { id: 'prac-virt-01', title: 'Technical Challenges', category: 'Technical Challenges', description: 'vSwitch VLAN tagging, datastore latency bottlenecks, and CPU overcommitment.', questionCount: 15 },
    ],
    interviewTopics: [
      { id: 'int-virt-01', topic: 'Technical Fundamentals', category: 'Technical', questionCount: 8, keyQuestions: ['What is the difference between Type-1 and Type-2 hypervisors?', 'Explain how VMware High Availability (HA) handles a physical host crash.'] },
    ],
  },

  {
    id: 'server-engineer',
    slug: 'server-engineer',
    title: 'Server Engineer',
    category: 'Technology',
    domainType: 'general',
    tagline: 'Configure, secure, and maintain enterprise Windows and Linux server fleets.',
    shortDescription: 'Install, configure, maintain and troubleshoot enterprise servers and operating systems to ensure reliable infrastructure operations.',
    typicalTrajectory: ['Server Support Associate', 'Server Engineer', 'Senior Server Engineer'],
    roleOverview: {
      whatYouDo: 'Server Engineers deploy operating systems, administer Active Directory environments, automate administrative tasks with PowerShell, and manage enterprise server hardware and patch compliance.',
      youWillWorkOn: ['Windows Server 2022/2025', 'RHEL / Ubuntu Server', 'Active Directory Domain Services (AD DS)', 'Group Policy Objects (GPOs)', 'PowerShell Scripting'],
      whereCanYouWork: ['Corporations', 'Government Agencies', 'Higher Education', 'Financial Systems'],
    },
    salaryRange: { min: 600000, max: 1400000, currency: 'INR', period: 'LPA', formatted: '₹6–14 LPA', source: 'Industry Benchmark', updatedAt: '2026' },
    responsibilities: [
      'Install, patch, and manage Windows Server and Linux operating systems.',
      'Configure Active Directory users, groups, and Group Policy Objects.',
      'Automate recurring server management tasks using PowerShell scripts.',
    ],
    commonIndustries: ['Enterprise IT', 'Financial Services', 'Retail', 'Telecommunications'],
    skillGroups: {
      mustKnow: [
        { name: 'Linux', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'Package management, systemd services, SSH hardening, and cron jobs.' },
        { name: 'Windows Server', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'Roles & features, DNS, DHCP, IIS, and failover clustering.' },
        { name: 'Server Administration', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'Hardware management, IPMI/iDRAC, OS patching, and performance tuning.' },
        { name: 'Active Directory', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'Domain controllers, trust relationships, schema, and Group Policy.' },
        { name: 'PowerShell', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'Cmdlets, automated user provisioning, and remote server management.' },
      ],
      goodToKnow: [
        { name: 'Bash Scripting', level: 'INTERMEDIATE', importance: 'GOOD_TO_KNOW' },
      ],
      advanced: [
        { name: 'Ansible Server Automation', level: 'ADVANCED', importance: 'ADVANCED' },
      ],
    },
    learningPhases: [
      { phaseNumber: '01', title: 'SERVER CORE & OS DEPLOYMENT', subtitle: 'Windows Server & Linux Admin', description: 'Master operating system provisioning, user privileges, and core server roles.', topics: ['Windows Server installation', 'DNS and DHCP server roles', 'Linux daemon management', 'SSH and security baselines'], skills: ['Linux', 'Windows Server', 'Server Administration'] },
      { phaseNumber: '02', title: 'DIRECTORY SERVICES & SCRIPTING', subtitle: 'Active Directory & PowerShell', description: 'Build enterprise domain architectures and automate operations.', topics: ['Active Directory Forests & Domains', 'Group Policy Objects (GPOs)', 'PowerShell cmdlets and loops', 'Patch management (WSUS)'], skills: ['Active Directory', 'PowerShell'] },
    ],
    projects: [
      { id: 'p-srv-01', title: 'Enterprise Active Directory Domain & GPO Hardening', difficulty: 'Beginner', skillsRequired: ['Windows Server', 'Active Directory', 'PowerShell'], description: 'Deploy redundant domain controllers, configure DNS/DHCP, and script automated onboarding of 50 users via PowerShell.', expectedOutcome: 'A fully functional enterprise Active Directory environment with baseline security GPOs.' },
    ],
    certifications: [{ id: 'cert-srv-01', name: 'CompTIA Server+', issuingOrganization: 'CompTIA', level: 'Foundation' }],
    practiceAreas: [
      { id: 'prac-srv-01', title: 'Technical Challenges', category: 'Technical Challenges', description: 'DNS replication errors, corrupted user profiles, and disk volume expansion.', questionCount: 15 },
    ],
    interviewTopics: [
      { id: 'int-srv-01', topic: 'Technical Fundamentals', category: 'Technical', questionCount: 10, keyQuestions: ['What are FSMO roles in Active Directory and why are they critical?', 'Explain the order of Group Policy processing (LSDOU).'] },
    ],
  },

  {
    id: 'network-security-engineer',
    slug: 'network-security-engineer',
    title: 'Network & Security Engineer',
    category: 'Technology',
    domainType: 'security',
    tagline: 'Architect, route, secure, and defend mission-critical enterprise networks.',
    shortDescription: 'Design, secure and maintain enterprise networks while protecting systems against network-based threats and vulnerabilities.',
    typicalTrajectory: ['Network Support Associate', 'Network & Security Engineer', 'Senior Network & Security Engineer'],
    roleOverview: {
      whatYouDo: 'Network & Security Engineers configure routers, enterprise switches, next-generation firewalls, and encrypted VPN tunnels to ensure resilient, threat-free connectivity across distributed corporate and cloud sites.',
      youWillWorkOn: ['Cisco / Juniper Routing & Switching', 'Palo Alto / Fortinet Firewalls', 'IPsec & SSL VPNs', 'VLANs, OSPF & BGP', 'IDS/IPS Threat Prevention'],
      whereCanYouWork: ['Telecom Providers', 'FinTech & Banking', 'Cloud Infrastructure Platforms', 'Enterprise IT'],
    },
    salaryRange: { min: 800000, max: 1800000, currency: 'INR', period: 'LPA', formatted: '₹8–18 LPA', source: 'Industry Benchmark', updatedAt: '2026' },
    responsibilities: [
      'Configure enterprise routing protocols (OSPF, BGP) and switching topologies.',
      'Deploy and maintain Next-Gen Firewalls with deep packet inspection.',
      'Establish and monitor site-to-site IPsec and remote-access VPN tunnels.',
    ],
    commonIndustries: ['Banking', 'Telecom', 'Defense', 'Enterprise SaaS'],
    skillGroups: {
      mustKnow: [
        { name: 'TCP/IP', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'Subnetting, packet encapsulation, TCP handshakes, and Wireshark decoding.' },
        { name: 'Routing', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'OSPF, BGP, static routes, and inter-VLAN routing.' },
        { name: 'Switching', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'Spanning Tree Protocol (STP), 802.1Q VLAN trunking, and LACP.' },
        { name: 'Firewalls', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'Stateful inspection, NAT/PAT rules, security zones, and application control.' },
        { name: 'VPN', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'IPsec Phase 1/2 negotiation, IKEv2, and SSL VPN clients.' },
        { name: 'Network Security', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'Zero Trust network access, IDS/IPS, ACLs, and DDoS mitigation.' },
      ],
      goodToKnow: [
        { name: 'Wireshark Packet Analysis', level: 'INTERMEDIATE', importance: 'GOOD_TO_KNOW' },
      ],
      advanced: [
        { name: 'Software-Defined WAN (SD-WAN)', level: 'ADVANCED', importance: 'ADVANCED' },
      ],
    },
    learningPhases: [
      { phaseNumber: '01', title: 'ROUTING & SWITCHING ESSENTIALS', subtitle: 'TCP/IP & Network Topologies', description: 'Master IP subnetting, VLAN segmentation, and routing protocols.', topics: ['IPv4/IPv6 subnetting', 'VLAN trunking and STP', 'OSPF multi-area routing', 'Access Control Lists (ACLs)'], skills: ['TCP/IP', 'Routing', 'Switching'] },
      { phaseNumber: '02', title: 'PERIMETER DEFENSE & ENCRYPTION', subtitle: 'Firewalls & VPN Architectures', description: 'Deploy firewall policies, threat inspection, and encrypted tunnels.', topics: ['Next-Gen Firewall policies', 'NAT and port forwarding', 'Site-to-Site IPsec VPNs', 'IDS/IPS signature tuning'], skills: ['Firewalls', 'VPN', 'Network Security'] },
    ],
    projects: [
      { id: 'p-net-01', title: 'Secure Branch Office Network with Site-to-Site VPN', difficulty: 'Intermediate', skillsRequired: ['Routing', 'Firewalls', 'VPN'], description: 'Configure an enterprise router and firewall topology linking two simulated offices via an encrypted IPsec tunnel with strict zone policies.', expectedOutcome: 'A verified encrypted branch interconnect with comprehensive firewall inspection.' },
    ],
    certifications: [{ id: 'cert-net-01', name: 'Cisco Certified Network Associate (CCNA)', issuingOrganization: 'Cisco Systems', level: 'Intermediate' }],
    practiceAreas: [
      { id: 'prac-net-01', title: 'Technical Challenges', category: 'Technical Challenges', description: 'Subnet masking calculations, routing loops, and firewall drop packet triage.', questionCount: 20 },
    ],
    interviewTopics: [
      { id: 'int-net-01', topic: 'Technical Fundamentals', category: 'Technical', questionCount: 12, keyQuestions: ['Explain the 3-way TCP handshake and TCP reset flags.', 'What is the difference between stateful firewall filtering and stateless ACLs?'] },
    ],
  },

  {
    id: 'backup-storage-engineer',
    slug: 'backup-storage-engineer',
    title: 'Backup & Storage Engineer',
    category: 'Technology',
    domainType: 'general',
    tagline: 'Guarantee enterprise data durability, storage performance, and business continuity.',
    shortDescription: 'Manage enterprise storage systems, backup infrastructure and disaster recovery solutions to protect critical business data.',
    typicalTrajectory: ['Storage Support Associate', 'Backup & Storage Engineer', 'Senior Backup & Storage Engineer'],
    roleOverview: {
      whatYouDo: 'Backup & Storage Engineers provision high-speed storage arrays (SAN/NAS), schedule automated enterprise backups, test disaster recovery runbooks, and protect corporate data from ransomware and hardware failure.',
      youWillWorkOn: ['Storage Area Networks (SAN - Fibre Channel/iSCSI)', 'Network Attached Storage (NAS - NFS/SMB)', 'Enterprise Backup Software (Veeam / Commvault)', 'Snapshot Management & Replication', 'Disaster Recovery RTO / RPO Compliance'],
      whereCanYouWork: ['Financial Enterprises', 'Healthcare & Biotech', 'Cloud Service Providers', 'Telecoms'],
    },
    salaryRange: { min: 700000, max: 1600000, currency: 'INR', period: 'LPA', formatted: '₹7–16 LPA', source: 'Industry Benchmark', updatedAt: '2026' },
    responsibilities: [
      'Provision SAN LUNs and NAS storage pools for database and virtual workloads.',
      'Design and schedule incremental, differential, and synthetic full backups.',
      'Execute periodic disaster recovery simulations and maintain RTO/RPO metrics.',
    ],
    commonIndustries: ['Banking', 'Healthcare', 'Enterprise IT', 'Data Centers'],
    skillGroups: {
      mustKnow: [
        { name: 'NAS', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'NFS exports, SMB/CIFS shares, quotas, and permissions.' },
        { name: 'SAN', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'Fibre Channel zoning, iSCSI initiators, LUN masking, and multipathing.' },
        { name: 'Backup Solutions', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'Veeam, Commvault, backup repositories, and deduplication appliances.' },
        { name: 'Disaster Recovery', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'RTO / RPO definitions, replication, failover runbooks, and testing.' },
        { name: 'Data Protection', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'Immutable backups, air-gapped copies, encryption in flight and at rest.' },
        { name: 'Storage Management', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'RAID configurations, storage tiering, thin provisioning, and monitoring.' },
      ],
      goodToKnow: [
        { name: 'Cloud Object Storage (S3)', level: 'INTERMEDIATE', importance: 'GOOD_TO_KNOW' },
      ],
      advanced: [
        { name: 'Automated DR Orchestration', level: 'ADVANCED', importance: 'ADVANCED' },
      ],
    },
    learningPhases: [
      { phaseNumber: '01', title: 'STORAGE ARCHITECTURE', subtitle: 'SAN, NAS & RAID', description: 'Configure enterprise storage arrays, protocols, and volume provisioning.', topics: ['SAN vs NAS architecture', 'RAID levels & resilience', 'iSCSI and Fibre Channel', 'LUN presentation to hosts'], skills: ['SAN', 'NAS', 'Storage Management'] },
      { phaseNumber: '02', title: 'DATA PROTECTION & RECOVERY', subtitle: 'Backups & DR Orchestration', description: 'Implement 3-2-1 backup policies, immutability, and disaster recovery.', topics: ['3-2-1 backup rule', 'Veeam / Commvault backup jobs', 'Immutable storage against ransomware', 'Disaster recovery failover plans'], skills: ['Backup Solutions', 'Disaster Recovery', 'Data Protection'] },
    ],
    projects: [
      { id: 'p-bck-01', title: 'Automated Enterprise Backup & DR Simulation Lab', difficulty: 'Beginner', skillsRequired: ['Backup Solutions', 'Disaster Recovery', 'Storage Management'], description: 'Deploy an automated backup pipeline using Veeam for virtualized workloads with immutable storage and perform a bare-metal recovery drill.', expectedOutcome: 'A complete backup configuration with documented RTO/RPO verification results.' },
    ],
    certifications: [{ id: 'cert-bck-01', name: 'Veeam Certified Engineer (VMCE)', issuingOrganization: 'Veeam Software', level: 'Intermediate' }],
    practiceAreas: [
      { id: 'prac-bck-01', title: 'Technical Challenges', category: 'Technical Challenges', description: 'Storage multipathing failover, backup repository exhaustion, and deduplication ratio tuning.', questionCount: 15 },
    ],
    interviewTopics: [
      { id: 'int-bck-01', topic: 'Technical Fundamentals', category: 'Technical', questionCount: 8, keyQuestions: ['What is the difference between RTO and RPO?', 'Explain the 3-2-1-1-0 backup rule and how it protects against ransomware.'] },
    ],
  },

  {
    id: 'it-infrastructure-engineer',
    slug: 'it-infrastructure-engineer',
    title: 'IT Infrastructure Engineer',
    category: 'Technology',
    domainType: 'general',
    tagline: 'Unify network connectivity, compute systems, and cloud infrastructure for the modern enterprise.',
    shortDescription: 'Build, maintain and monitor IT infrastructure, ensuring reliable connectivity, computing resources and enterprise systems.',
    typicalTrajectory: ['IT Infrastructure Support Associate', 'IT Infrastructure Engineer', 'Senior IT Infrastructure Engineer'],
    roleOverview: {
      whatYouDo: 'IT Infrastructure Engineers oversee end-to-end technology operations, integrating on-premise hardware, virtualized environments, network links, and hybrid cloud services with centralized monitoring.',
      youWillWorkOn: ['Hybrid Cloud Compute', 'Core Enterprise Networking', 'Linux & Windows Fleet Management', 'Datacenter Racks & Power', 'Telemetry & Health Monitoring'],
      whereCanYouWork: ['Large Enterprises', 'Tech Startups', 'Logistics & Supply Chain', 'Healthcare & Hospital Networks'],
    },
    salaryRange: { min: 700000, max: 1600000, currency: 'INR', period: 'LPA', formatted: '₹7–16 LPA', source: 'Industry Benchmark', updatedAt: '2026' },
    responsibilities: [
      'Oversee physical, virtual, and cloud infrastructure availability.',
      'Implement proactive telemetry and automated alerting across all infrastructure layers.',
      'Maintain cross-platform operating systems and network hardware configurations.',
    ],
    commonIndustries: ['Enterprise IT', 'Manufacturing', 'Supply Chain', 'Financial Services'],
    skillGroups: {
      mustKnow: [
        { name: 'Networking', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'IP addressing, switching topologies, DNS, and remote site connectivity.' },
        { name: 'Linux', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'Server configuration, shell scripts, and daemon troubleshooting.' },
        { name: 'Windows Server', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'Enterprise identity, role administration, and group policy.' },
        { name: 'Cloud Infrastructure', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'Hybrid integration with AWS / Azure compute and storage.' },
        { name: 'Monitoring', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'Nagios, Zabbix, PRTG, and SNMP device telemetry.' },
        { name: 'Infrastructure Management', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'Hardware lifecycle, asset tracking, rack topology, and capacity planning.' },
      ],
      goodToKnow: [
        { name: 'Infrastructure as Code', level: 'INTERMEDIATE', importance: 'GOOD_TO_KNOW' },
      ],
      advanced: [
        { name: 'Hybrid Cloud Architecture', level: 'ADVANCED', importance: 'ADVANCED' },
      ],
    },
    learningPhases: [
      { phaseNumber: '01', title: 'INFRASTRUCTURE FOUNDATIONS', subtitle: 'Networks, Compute & Systems', description: 'Connect network layers, provision servers, and configure identity services.', topics: ['Network switches and VLANs', 'Windows & Linux dual environment setup', 'Storage connectivity', 'Hardware power and rack units'], skills: ['Networking', 'Linux', 'Windows Server'] },
      { phaseNumber: '02', title: 'HYBRID OPERATIONS & TELEMETRY', subtitle: 'Cloud & Proactive Monitoring', description: 'Integrate hybrid cloud resources and deploy unified monitoring.', topics: ['AWS / Azure hybrid connectivity', 'SNMP and syslog aggregation', 'Automated health alerting', 'Disaster recovery coordination'], skills: ['Cloud Infrastructure', 'Monitoring', 'Infrastructure Management'] },
    ],
    projects: [
      { id: 'p-inf-01', title: 'Hybrid Enterprise Infrastructure & Telemetry Hub', difficulty: 'Beginner', skillsRequired: ['Networking', 'Windows Server', 'Monitoring'], description: 'Deploy a multi-tier IT infrastructure environment connecting local server nodes to cloud storage with comprehensive SNMP monitoring and SMS alerts.', expectedOutcome: 'A fully monitored hybrid infrastructure testbed with real-time health dashboards.' },
    ],
    certifications: [{ id: 'cert-inf-01', name: 'CompTIA Network+ / Security+', issuingOrganization: 'CompTIA', level: 'Foundation' }],
    practiceAreas: [
      { id: 'prac-inf-01', title: 'Technical Challenges', category: 'Technical Challenges', description: 'Diagnose intermittent packet loss across gateways and correlate server memory spikes.', questionCount: 15 },
    ],
    interviewTopics: [
      { id: 'int-inf-01', topic: 'Technical Fundamentals', category: 'Technical', questionCount: 10, keyQuestions: ['How do you architect high availability across dual ISP internet links?', 'Describe your approach to infrastructure capacity planning for annual business expansion.'] },
    ],
  },

  {
    id: 'microsoft-administrator',
    slug: 'microsoft-administrator',
    title: 'Microsoft Administrator',
    category: 'Technology',
    domainType: 'general',
    tagline: 'Administer Microsoft 365, Entra ID, and Azure cloud services across the enterprise.',
    shortDescription: 'Manage Microsoft enterprise environments, user identities, collaboration tools and cloud-based administration services.',
    typicalTrajectory: ['Microsoft 365 Support Associate', 'Microsoft Administrator', 'Senior Microsoft Administrator'],
    roleOverview: {
      whatYouDo: 'Microsoft Administrators manage tenant identity lifecycle in Microsoft Entra ID (Azure AD), deploy Microsoft 365 services (Exchange, Teams, SharePoint), configure Intune endpoint policies, and automate tasks with PowerShell.',
      youWillWorkOn: ['Microsoft 365 Admin Center', 'Microsoft Entra ID (User & App Identity)', 'Microsoft Intune (MDM / MAM)', 'Exchange Online & Teams Governance', 'PowerShell for Graph API'],
      whereCanYouWork: ['Global Corporations', 'Consulting & MSPs', 'Financial Services', 'Public Sector & Non-Profits'],
    },
    salaryRange: { min: 600000, max: 1400000, currency: 'INR', period: 'LPA', formatted: '₹6–14 LPA', source: 'Industry Benchmark', updatedAt: '2026' },
    responsibilities: [
      'Administer Microsoft Entra ID users, conditional access policies, and MFA.',
      'Configure and support Exchange Online mailboxes, SharePoint, and Teams.',
      'Automate tenant governance and reporting with Microsoft Graph PowerShell.',
    ],
    commonIndustries: ['Corporate Enterprises', 'Consulting', 'Financial Institutions', 'Healthcare'],
    skillGroups: {
      mustKnow: [
        { name: 'Microsoft 365', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'Exchange Online, Teams, OneDrive, SharePoint, and licensing management.' },
        { name: 'Azure', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'Azure resource groups, virtual networks, and subscription administration.' },
        { name: 'Active Directory', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'On-premises AD DS, hybrid Azure AD Connect, and directory sync.' },
        { name: 'Microsoft Entra ID', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'Identity protection, Single Sign-On (SSO), and Conditional Access.' },
        { name: 'PowerShell', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'Microsoft.Graph cmdlets, Exchange Online modules, and batch user scripts.' },
      ],
      goodToKnow: [
        { name: 'Microsoft Intune', level: 'INTERMEDIATE', importance: 'GOOD_TO_KNOW' },
      ],
      advanced: [
        { name: 'Zero Trust Security with Defender', level: 'ADVANCED', importance: 'ADVANCED' },
      ],
    },
    learningPhases: [
      { phaseNumber: '01', title: 'M365 & IDENTITY LIFECYCLE', subtitle: 'Entra ID & Collaboration Tools', description: 'Configure Microsoft 365 tenants, Entra ID users, and collaboration tools.', topics: ['M365 Tenant setup', 'Entra ID user/group administration', 'Exchange Online mail routing', 'Teams governance policies'], skills: ['Microsoft 365', 'Microsoft Entra ID', 'Active Directory'] },
      { phaseNumber: '02', title: 'HYBRID AZURE & POWERSHELL', subtitle: 'Conditional Access & Scripting', description: 'Enforce Conditional Access, configure Azure VMs, and script administrative tasks.', topics: ['Azure subscription management', 'Conditional Access and MFA enforcement', 'Microsoft Graph PowerShell scripting', 'Intune device compliance'], skills: ['Azure', 'PowerShell'] },
    ],
    projects: [
      { id: 'p-ms-01', title: 'M365 Zero-Trust Tenant Configuration & Conditional Access', difficulty: 'Beginner', skillsRequired: ['Microsoft 365', 'Microsoft Entra ID', 'PowerShell'], description: 'Set up an enterprise Microsoft 365 tenant, enforce risk-based Conditional Access with MFA, and write PowerShell scripts to audit external guest sharing.', expectedOutcome: 'A hardened Microsoft 365 cloud environment with automated compliance reporting.' },
    ],
    certifications: [{ id: 'cert-ms-01', name: 'Microsoft Certified: Enterprise Administrator Expert (MS-102)', issuingOrganization: 'Microsoft', level: 'Intermediate' }],
    practiceAreas: [
      { id: 'prac-ms-01', title: 'Technical Challenges', category: 'Technical Challenges', description: 'Azure AD Connect sync conflicts, locked user accounts, and mail flow transport rule errors.', questionCount: 15 },
    ],
    interviewTopics: [
      { id: 'int-ms-01', topic: 'Technical Fundamentals', category: 'Technical', questionCount: 10, keyQuestions: ['Explain how Conditional Access policies work in Microsoft Entra ID.', 'What is the difference between Azure AD Joined and Hybrid Azure AD Joined devices?'] },
    ],
  },

  {
    id: 'it-service-management',
    slug: 'it-service-management',
    title: 'IT Service Management',
    category: 'Technology',
    domainType: 'general',
    tagline: 'Orchestrate IT service delivery, incident triage, and change enablement with ITIL.',
    shortDescription: 'Manage IT service operations, service requests, incidents, problems and changes to ensure efficient IT service delivery.',
    typicalTrajectory: ['IT Service Desk Associate', 'ITSM Analyst', 'Senior ITSM Specialist'],
    roleOverview: {
      whatYouDo: 'IT Service Management specialists manage IT service operations, handle incident escalations in ServiceNow, coordinate change advisory boards (CAB), and lead root cause problem investigations following ITIL frameworks.',
      youWillWorkOn: ['ServiceNow ITSM Platform', 'ITIL 4 Service Value System', 'Incident & Major Incident Management', 'Change Advisory Board (CAB) Governance', 'SLA Tracking & Reporting'],
      whereCanYouWork: ['Global IT Services', 'Financial Institutions', 'Government Agencies', 'Enterprise Corporations'],
    },
    salaryRange: { min: 700000, max: 1500000, currency: 'INR', period: 'LPA', formatted: '₹7–15 LPA', source: 'Industry Benchmark', updatedAt: '2026' },
    responsibilities: [
      'Manage incident lifecycle to minimize service downtime and adhere to SLAs.',
      'Facilitate Change Advisory Board (CAB) meetings and assess change risk.',
      'Lead root cause analysis (RCA) on recurring problems to prevent future incidents.',
    ],
    commonIndustries: ['Consulting & Managed Services', 'Banking & Finance', 'Healthcare Systems', 'Retail Logistics'],
    skillGroups: {
      mustKnow: [
        { name: 'ITIL', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'ITIL 4 practices, Service Desk, Service Level Management, and continuous improvement.' },
        { name: 'ServiceNow', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'Incident, Problem, Change, Service Catalog, and CMDB administration.' },
        { name: 'Incident Management', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'Ticket triage, major incident swarming, priority matrices, and communication.' },
        { name: 'Problem Management', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'Root cause analysis (RCA), known error database (KEDB), and preventative fixes.' },
        { name: 'Change Management', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'Change enablement, risk scoring, rollback planning, and CAB scheduling.' },
      ],
      goodToKnow: [
        { name: 'CMDB & Asset Management', level: 'INTERMEDIATE', importance: 'GOOD_TO_KNOW' },
      ],
      advanced: [
        { name: 'ServiceNow Workflow Automation', level: 'ADVANCED', importance: 'ADVANCED' },
      ],
    },
    learningPhases: [
      { phaseNumber: '01', title: 'ITIL & SERVICENOW FUNDAMENTALS', subtitle: 'Service Desk & Incident Triage', description: 'Master ITIL service frameworks and ServiceNow ticket workflows.', topics: ['ITIL 4 guiding principles', 'ServiceNow navigation and tables', 'Incident categorization and prioritization', 'SLA breach calculation'], skills: ['ITIL', 'ServiceNow', 'Incident Management'] },
      { phaseNumber: '02', title: 'PROBLEM & CHANGE GOVERNANCE', subtitle: 'Root Cause & CAB Enablement', description: 'Coordinate change management, CAB approvals, and root cause investigations.', topics: ['Change request lifecycle & risk matrices', 'CAB meeting governance', 'Problem investigation & 5 Whys', 'CMDB relationship mapping'], skills: ['Problem Management', 'Change Management'] },
    ],
    projects: [
      { id: 'p-itsm-01', title: 'ServiceNow ITSM Lifecycle Implementation & SLA Dashboard', difficulty: 'Beginner', skillsRequired: ['ITIL', 'ServiceNow', 'Incident Management'], description: 'Configure an end-to-end incident, change, and problem management workflow in ServiceNow Developer Instance with automated SLA triggers.', expectedOutcome: 'A tested ServiceNow portal demonstrating automated ticket routing, CAB approval flows, and SLA reporting.' },
    ],
    certifications: [{ id: 'cert-itsm-01', name: 'ITIL 4 Foundation', issuingOrganization: 'PeopleCert / AXELOS', level: 'Foundation' }],
    practiceAreas: [
      { id: 'prac-itsm-01', title: 'Scenario Questions', category: 'Scenario Questions', description: 'Major outage emergency change authorization, SLA breach dispute, and vendor escalation.', questionCount: 15 },
    ],
    interviewTopics: [
      { id: 'int-itsm-01', topic: 'Role-Specific Questions', category: 'Role Specific', questionCount: 10, keyQuestions: ['What is the difference between an Incident and a Problem in ITIL?', 'How do you handle an emergency change during an active P1 production outage?'] },
    ],
  },
];
