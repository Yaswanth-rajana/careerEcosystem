import {
  CareerPath,
  CareerLevelId,
  CareerLevelDefinition,
  CandidateCareerContext,
  CareerSkillGroup,
  CareerLearningPhase,
  CareerProject,
  CareerPracticeArea,
  CareerInterviewTopic,
} from './career-types';

export const DEFAULT_CAREER_LEVELS: Array<{
  id: CareerLevelId;
  label: string;
  range: string;
  order: number;
}> = [
  { id: 'entry', label: 'Beginner / Entry Level', range: '0–1 yrs', order: 1 },
  { id: 'junior', label: 'Junior', range: '1–3 yrs', order: 2 },
  { id: 'mid', label: 'Mid-Level', range: '3–5 yrs', order: 3 },
  { id: 'senior', label: 'Senior', range: '5+ yrs', order: 4 },
];

/**
 * Domain-specific level data for all primary careers.
 */
export const CAREER_LEVEL_CONFIGS: Record<string, Record<CareerLevelId, CareerLevelDefinition>> = {
  // ==========================================
  // SOFTWARE ENGINEER
  // ==========================================
  'software-engineer': {
    entry: {
      id: 'entry',
      label: 'Beginner / Entry Level',
      roleTitle: 'Associate Software Engineer',
      experienceRange: '0–1 yrs',
      description: 'Focuses on programming syntax, core data structures, writing clean functions, and building simple components.',
      focusSummary: 'Master fundamental programming syntax, Git workflows, basic REST APIs, and structured debugging techniques.',
      expectedCompetencies: [
        'JavaScript / TypeScript basics & ES6+',
        'HTML5 semantic markup and CSS layouts',
        'Basic React component state & props',
        'Git clone, branching, and pull requests',
        'Simple SQL SELECT and JOIN queries',
      ],
      responsibilities: [
        'Implement small, well-defined frontend UI components and bug fixes.',
        'Write clean, readable code conforming to team linting and style guides.',
        'Submit pull requests with clear descriptions and unit test coverage.',
        'Collaborate with senior engineers during code reviews to learn patterns.',
      ],
      practicalWorkTitle: 'Projects & Portfolio',
      practicalWorkDescription: 'Build foundational web applications showcasing clean syntax, state management, and API consumption.',
      skillGroups: {
        mustKnow: [
          { name: 'JavaScript', level: 'BEGINNER', importance: 'MUST_KNOW', description: 'ES6+ syntax, functions, arrays, objects, and async/await basics.' },
          { name: 'HTML & CSS', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'Semantic tags, Flexbox, CSS Grid, and responsive styling.' },
          { name: 'Git', level: 'BEGINNER', importance: 'MUST_KNOW', description: 'Version control basics, branching, commits, and pull requests.' },
          { name: 'React', level: 'BEGINNER', importance: 'MUST_KNOW', description: 'Functional components, useState, useEffect, and JSX syntax.' },
        ],
        goodToKnow: [
          { name: 'TypeScript', level: 'BEGINNER', importance: 'GOOD_TO_KNOW', description: 'Basic types, interfaces, and function signatures.' },
          { name: 'SQL', level: 'BEGINNER', importance: 'GOOD_TO_KNOW', description: 'Basic SELECT, INSERT, UPDATE, and JOIN operations.' },
        ],
        advanced: [
          { name: 'Data Structures', level: 'BEGINNER', importance: 'ADVANCED', description: 'Arrays, hash maps, linked lists, and time complexity.' },
        ],
      },
      learningPhases: [
        {
          phaseNumber: '01',
          title: 'PROGRAMMING FOUNDATIONS',
          subtitle: 'Core Syntax & Logic',
          description: 'Master core JavaScript syntax, data types, control flow, and algorithmic thinking.',
          topics: ['Variables & data types', 'Loops & array methods', 'Functions & closures', 'Git & GitHub basics'],
          skills: ['JavaScript', 'Git', 'Problem Solving'],
          recommendedCourse: { id: 'c-se-01', title: 'JavaScript & Algorithms Foundations', provider: 'PATHWAY Academy', level: 'Beginner', available: true },
        },
        {
          phaseNumber: '02',
          title: 'FRONTEND ESSENTIALS',
          subtitle: 'UI Components & State',
          description: 'Build interactive user interfaces using modern React and component architectures.',
          topics: ['React JSX & components', 'State & props management', 'Fetching data from REST APIs', 'CSS responsive layouts'],
          skills: ['React', 'HTML & CSS', 'REST APIs'],
          recommendedCourse: { id: 'c-se-02', title: 'Full-Stack Web Development with React & Node', provider: 'PATHWAY Academy', level: 'Intermediate', available: true },
        },
      ],
      practicalWork: [
        {
          id: 'p-se-e1',
          title: 'Personal Portfolio & Project Showcase',
          difficulty: 'Beginner',
          skillsRequired: ['HTML & CSS', 'JavaScript', 'React', 'Git'],
          description: 'A responsive personal developer portfolio featuring project cards, bio, and live contact form integration.',
          expectedOutcome: 'Deployed web portfolio with clean, accessible markup and responsive layout.',
        },
        {
          id: 'p-se-e2',
          title: 'Interactive Task & Habit Tracker',
          difficulty: 'Beginner',
          skillsRequired: ['JavaScript', 'React', 'Local Storage'],
          description: 'A client-side task tracker featuring task filtering, local storage persistence, and dynamic state updates.',
          expectedOutcome: 'Interactive single-page application with zero external framework dependencies.',
        },
      ],
      certifications: [
        { id: 'cert-se-meta-fe', name: 'Meta Front-End Developer Professional Certificate', issuingOrganization: 'Meta', level: 'Foundation' },
      ],
      practiceAreas: [
        { id: 'prac-se-e1', title: 'JavaScript Syntax & Array Drills', category: 'Technical Challenges', description: 'Solve 15 essential algorithm and array manipulation challenges.', questionCount: 15 },
        { id: 'prac-se-e2', title: 'Component Debugging Scenarios', category: 'Scenario Questions', description: 'Identify and fix common React re-render and state-mutation bugs.', questionCount: 10 },
      ],
      interviewTopics: [
        {
          id: 'int-se-e1',
          topic: 'JavaScript Fundamentals & Async Execution',
          category: 'Technical',
          questionCount: 3,
          keyQuestions: [
            'What is the difference between let, const, and var?',
            'Explain how JavaScript promises and async/await work.',
            'What is the difference between == and === in JavaScript?',
          ],
        },
        {
          id: 'int-se-e2',
          topic: 'Behavioral & Learning Agility',
          category: 'Behavioral',
          questionCount: 2,
          keyQuestions: [
            'Tell me about a time you encountered a bug you did not know how to fix initially.',
            'How do you approach learning a new framework or technology quickly?',
          ],
        },
      ],
      readinessChecklist: [
        { id: 'chk-1', label: 'Resume with Education & Technical Skills', status: 'Essential', type: 'resume' },
        { id: 'chk-2', label: 'GitHub Profile with 2+ Clean Repositories', status: 'Essential', type: 'links' },
        { id: 'chk-3', label: '1 Deployed Web Application with Live URL', status: 'Recommended', type: 'practical' },
        { id: 'chk-4', label: 'Verified Core JavaScript & React Skills', status: 'Essential', type: 'skills' },
      ],
      roadmapStageDescriptions: {
        learn: 'Learn modern JavaScript, React components, and Git version control.',
        practice: 'Complete syntax drills, DOM manipulation challenges, and bug-fix exercises.',
        mentorship: 'Get 1-on-1 resume feedback and code review on your starter repositories.',
        prepare: 'Practice common junior technical screening questions and behavioral answers.',
        jobReady: 'Organize your GitHub repository links, live demos, and formatted resume.',
        opportunities: 'Discover entry-level and associate software engineering openings.',
      },
    },
    junior: {
      id: 'junior',
      label: 'Junior',
      roleTitle: 'Junior Software Engineer',
      experienceRange: '1–3 yrs',
      description: 'Designs feature logic, connects backend APIs, structures database tables, and maintains automated test suites.',
      focusSummary: 'Master full-stack API integration, database schema design, TypeScript safety, and maintainable unit testing.',
      expectedCompetencies: [
        'TypeScript strict typing & interfaces',
        'Node.js & Express RESTful API routing',
        'Relational database querying with SQL & ORMs',
        'Unit testing with Vitest or Jest',
        'Authentication patterns (JWT, cookies, OAuth)',
      ],
      responsibilities: [
        'Deliver complete full-stack features from UI mockup to backend database storage.',
        'Design and document RESTful endpoints following standard HTTP conventions.',
        'Write automated unit and integration tests for critical business logic.',
        'Troubleshoot production error logs and resolve reported customer defects.',
      ],
      practicalWorkTitle: 'Projects & Portfolio',
      practicalWorkDescription: 'Build full-stack applications with authenticated APIs, relational databases, and automated testing.',
      skillGroups: {
        mustKnow: [
          { name: 'TypeScript', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'Generics, union types, strict null checks, and API contract interfaces.' },
          { name: 'React', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'Custom hooks, Context API, performance optimization, and routing.' },
          { name: 'Node.js', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'Express middleware, request validation, and asynchronous stream handling.' },
          { name: 'SQL', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'Schema migrations, indexing, aggregate queries, and Prisma/TypeORM usage.' },
        ],
        goodToKnow: [
          { name: 'Docker', level: 'BEGINNER', importance: 'GOOD_TO_KNOW', description: 'Containerizing local full-stack environments with docker-compose.' },
          { name: 'Automated Testing', level: 'INTERMEDIATE', importance: 'GOOD_TO_KNOW', description: 'Unit testing React components and API endpoints.' },
        ],
        advanced: [
          { name: 'Redis Caching', level: 'BEGINNER', importance: 'ADVANCED', description: 'Key-value cache layers and rate limiting primitives.' },
        ],
      },
      learningPhases: [
        {
          phaseNumber: '01',
          title: 'FULL-STACK INTEGRATION',
          subtitle: 'REST APIs & Data Models',
          description: 'Build robust backend services, connect relational databases, and implement secure user sessions.',
          topics: ['Express REST routing', 'Prisma ORM & PostgreSQL', 'JWT authentication', 'TypeScript server contracts'],
          skills: ['Node.js', 'SQL', 'TypeScript', 'APIs'],
          recommendedCourse: { id: 'c-se-02', title: 'Full-Stack Web Development with React & Node', provider: 'PATHWAY Academy', level: 'Intermediate', available: true },
        },
        {
          phaseNumber: '02',
          title: 'TESTING & CODE QUALITY',
          subtitle: 'Unit & Integration Suites',
          description: 'Ensure regression-proof applications with comprehensive automated test suites and linting pipelines.',
          topics: ['Unit testing with Vitest', 'API integration tests', 'CI workflow automation', 'Error handling middleware'],
          skills: ['Automated Testing', 'Docker', 'Git'],
        },
      ],
      practicalWork: [
        {
          id: 'p-se-j1',
          title: 'Full-Stack E-Commerce API & Storefront',
          difficulty: 'Intermediate',
          skillsRequired: ['TypeScript', 'React', 'Node.js', 'PostgreSQL'],
          description: 'A complete product inventory catalog with cart management, order checkout, and relational database schema.',
          expectedOutcome: 'Tested REST API documented with Swagger alongside a responsive client storefront.',
        },
        {
          id: 'p-se-j2',
          title: 'Real-Time Team Collaboration Workspace',
          difficulty: 'Intermediate',
          skillsRequired: ['React', 'Node.js', 'WebSockets', 'SQL'],
          description: 'A multi-user board application supporting real-time status changes, notifications, and role permissions.',
          expectedOutcome: 'Deployed full-stack app featuring real-time socket connections and session auth.',
        },
      ],
      certifications: [
        { id: 'cert-se-meta-fs', name: 'Meta Full-Stack Software Engineer Certificate', issuingOrganization: 'Meta', level: 'Intermediate' },
      ],
      practiceAreas: [
        { id: 'prac-se-j1', title: 'REST API Error Handling & Validation', category: 'Technical Challenges', description: 'Handle edge cases, malformed payloads, and database constraints.', questionCount: 18 },
        { id: 'prac-se-j2', title: 'SQL Query Optimization Scenarios', category: 'Scenario Questions', description: 'Diagnose N+1 query patterns and create appropriate table indexes.', questionCount: 12 },
      ],
      interviewTopics: [
        {
          id: 'int-se-j1',
          topic: 'API Design & Relational Databases',
          category: 'Technical',
          questionCount: 3,
          keyQuestions: [
            'How do you design a REST API to handle pagination and filtering efficiently?',
            'What is the N+1 database query problem and how do you prevent it?',
            'Explain how React custom hooks help encapsulate stateful logic.',
          ],
        },
        {
          id: 'int-se-j2',
          topic: 'Production Debugging & Collaboration',
          category: 'Behavioral',
          questionCount: 2,
          keyQuestions: [
            'Describe how you tracked down a tricky bug that only occurred in production.',
            'How do you resolve a disagreement with a peer during code review?',
          ],
        },
      ],
      readinessChecklist: [
        { id: 'chk-1', label: 'Updated Resume Highlighting Production Features', status: 'Essential', type: 'resume' },
        { id: 'chk-2', label: 'Full-Stack Application with Relational DB', status: 'Essential', type: 'practical' },
        { id: 'chk-3', label: 'Automated Test Suite (Unit / Integration)', status: 'Essential', type: 'practical' },
        { id: 'chk-4', label: 'Documented API Specs (Swagger / Postman)', status: 'Recommended', type: 'links' },
      ],
      roadmapStageDescriptions: {
        learn: 'Deepen TypeScript safety, relational database modeling, and clean API design.',
        practice: 'Drill complex database joins, API error handling, and component testing.',
        mentorship: 'Review architecture trade-offs and code maintainability with mid/senior mentors.',
        prepare: 'Master practical live-coding interviews, API design rounds, and STAR questions.',
        jobReady: 'Ensure your portfolio demonstrates end-to-end full-stack capabilities with tests.',
        opportunities: 'Target Junior and Software Engineer roles with 1–3 years experience.',
      },
    },
    mid: {
      id: 'mid',
      label: 'Mid-Level',
      roleTitle: 'Software Engineer II',
      experienceRange: '3–5 yrs',
      description: 'Owns end-to-end service design, performance tuning, microservice integration, and guides junior teammates.',
      focusSummary: 'Master scalable backend patterns, distributed caching, database indexing, and robust system integration.',
      expectedCompetencies: [
        'Microservices & modular monolith architectures',
        'Distributed caching (Redis, CDN caching strategies)',
        'Database query tuning, indexing, and transaction isolation',
        'CI/CD pipeline configuration and containerization',
        'Security best practices (OWASP, RBAC, input sanitization)',
      ],
      responsibilities: [
        'Architect and implement scalable backend services and responsive client web applications.',
        'Optimize slow SQL queries, database indexing, and server response latencies.',
        'Conduct rigorous code reviews and uphold engineering standards across the team.',
        'Participate in on-call rotation, incident triage, and root-cause post-mortems.',
      ],
      practicalWorkTitle: 'Projects & Portfolio',
      practicalWorkDescription: 'Design production-grade distributed services featuring caching layers, background jobs, and performance benchmarks.',
      skillGroups: {
        mustKnow: [
          { name: 'System Architecture', level: 'ADVANCED', importance: 'MUST_KNOW', description: 'Layered architecture, domain separation, and API boundary design.' },
          { name: 'Database Optimization', level: 'ADVANCED', importance: 'MUST_KNOW', description: 'Execution plans, composite indexes, query locking, and migrations.' },
          { name: 'Redis & Caching', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'Cache invalidation strategies, TTL management, and distributed locks.' },
          { name: 'Docker & CI/CD', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'Multi-stage container builds and automated delivery pipelines.' },
        ],
        goodToKnow: [
          { name: 'Message Queues', level: 'INTERMEDIATE', importance: 'GOOD_TO_KNOW', description: 'Asynchronous task processing with RabbitMQ, Kafka, or BullMQ.' },
          { name: 'Observability', level: 'INTERMEDIATE', importance: 'GOOD_TO_KNOW', description: 'Structured logging, tracing (OpenTelemetry), and metrics collection.' },
        ],
        advanced: [
          { name: 'High Availability', level: 'ADVANCED', importance: 'ADVANCED', description: 'Circuit breakers, failover mechanisms, and zero-downtime deployments.' },
        ],
      },
      learningPhases: [
        {
          phaseNumber: '01',
          title: 'SYSTEM ARCHITECTURE & CACHING',
          subtitle: 'Scalable Service Design',
          description: 'Design distributed architectures resilient to traffic spikes with multi-tiered caching.',
          topics: ['Domain-driven design', 'Cache invalidation strategies', 'Asynchronous job queues', 'API rate limiting'],
          skills: ['System Architecture', 'Redis & Caching', 'Message Queues'],
        },
        {
          phaseNumber: '02',
          title: 'PERFORMANCE & OBSERVABILITY',
          subtitle: 'Latency Tuning & Telemetry',
          description: 'Profile runtime bottlenecks, optimize SQL execution plans, and implement structured telemetry.',
          topics: ['Database index optimization', 'Distributed tracing', 'Memory leak detection', 'Load testing'],
          skills: ['Database Optimization', 'Observability', 'Docker & CI/CD'],
        },
      ],
      practicalWork: [
        {
          id: 'p-se-m1',
          title: 'High-Throughput Ingestion & Background Processing Service',
          difficulty: 'Intermediate',
          skillsRequired: ['TypeScript', 'Redis', 'Message Queues', 'PostgreSQL'],
          description: 'Build an event ingestion pipeline that buffers bursts of webhooks, processes them in workers, and handles retries.',
          expectedOutcome: 'Production-ready service benchmarked at 2,000+ RPS with dead-letter queue handling.',
        },
        {
          id: 'p-se-m2',
          title: 'Microservices Gateway with Rate Limiting & Auth Caching',
          difficulty: 'Advanced',
          skillsRequired: ['Node.js', 'Docker', 'Redis', 'System Architecture'],
          description: 'Implement a reverse-proxy API gateway featuring token bucket rate limiting, JWT validation cache, and health checks.',
          expectedOutcome: 'Multi-container Docker Compose architecture with end-to-end integration tests.',
        },
      ],
      certifications: [
        { id: 'cert-se-aws-dva', name: 'AWS Certified Developer – Associate', issuingOrganization: 'Amazon Web Services', level: 'Intermediate' },
      ],
      practiceAreas: [
        { id: 'prac-se-m1', title: 'System Design: URL Shortener & Caching', category: 'Scenario Questions', description: 'Design a scalable URL service with high read-to-write ratios and Redis TTLs.', questionCount: 15 },
        { id: 'prac-se-m2', title: 'Production Incident Simulation', category: 'Scenario Questions', description: 'Diagnose database connection pool exhaustion and memory leak stacktraces.', questionCount: 12 },
      ],
      interviewTopics: [
        {
          id: 'int-se-m1',
          topic: 'System Design & Scalability Trade-offs',
          category: 'System Design',
          questionCount: 3,
          keyQuestions: [
            'How would you design a distributed cache layer with strong consistency constraints?',
            'What strategies would you use to handle database migrations on a high-traffic production table without downtime?',
            'Compare REST, gRPC, and GraphQL for microservice communication.',
          ],
        },
        {
          id: 'int-se-m2',
          topic: 'Technical Leadership & Ownership',
          category: 'Behavioral',
          questionCount: 2,
          keyQuestions: [
            'Tell me about a technical decision you made that did not go as planned. What did you learn?',
            'How do you manage technical debt while maintaining rapid feature delivery velocity?',
          ],
        },
      ],
      readinessChecklist: [
        { id: 'chk-1', label: 'Resume Showcasing Measurable Architectural Impact', status: 'Essential', type: 'resume' },
        { id: 'chk-2', label: 'System Design Artifacts / Architecture Diagrams', status: 'Essential', type: 'practical' },
        { id: 'chk-3', label: 'Experience Leading Feature Spikes / On-Call', status: 'Recommended', type: 'experience' },
        { id: 'chk-4', label: 'Verified Database & Distributed Systems Expertise', status: 'Essential', type: 'skills' },
      ],
      roadmapStageDescriptions: {
        learn: 'Master distributed system primitives, query tuning, and caching trade-offs.',
        practice: 'Tackle system design scenarios, concurrency bugs, and performance optimization drills.',
        mentorship: 'Connect with staff/principal mentors to hone architecture review and leadership skills.',
        prepare: 'Simulate full system design rounds and complex scenario-based interview discussions.',
        jobReady: 'Highlight latency reductions, architectural trade-offs, and scaling wins on your profile.',
        opportunities: 'Target Mid-Level and Senior Software Engineer roles (3–5 years).',
      },
    },
    senior: {
      id: 'senior',
      label: 'Senior',
      roleTitle: 'Senior Software Engineer',
      experienceRange: '5+ yrs',
      description: 'Drives technical vision, cross-service architecture, fault tolerance, engineering standards, and mentors squads.',
      focusSummary: 'Master enterprise distributed system design, multi-region availability, technical leadership, and strategic trade-offs.',
      expectedCompetencies: [
        'Distributed systems architecture (CAP theorem, consensus, partitioning)',
        'Event-driven architectures (Kafka, CQRS, event sourcing)',
        'Resilience engineering (circuit breakers, bulkhead patterns, chaos testing)',
        'Cost optimization and cloud infrastructure economics',
        'Technical roadmap planning, RFC authorship, and staff mentoring',
      ],
      responsibilities: [
        'Define long-term technical architecture and write comprehensive RFCs / design docs.',
        'Mentor mid-level and junior engineers across multiple squads to elevate team craft.',
        'Partner with product managers and engineering directors to scope multi-quarter roadmaps.',
        'Lead high-severity incident post-mortems and establish organizational resilience standards.',
      ],
      practicalWorkTitle: 'Projects & Portfolio',
      practicalWorkDescription: 'Author technical RFCs, multi-region architecture blueprints, and benchmarked fault-tolerant systems.',
      skillGroups: {
        mustKnow: [
          { name: 'Distributed Systems', level: 'EXPERT', importance: 'MUST_KNOW', description: 'Consensus protocols, eventual consistency, replication lag, and network partitions.' },
          { name: 'System Design', level: 'EXPERT', importance: 'MUST_KNOW', description: 'Multi-region architectures, sharding strategies, and enterprise security boundaries.' },
          { name: 'Technical Leadership', level: 'ADVANCED', importance: 'MUST_KNOW', description: 'RFC authoring, stakeholder consensus building, and developer mentorship.' },
        ],
        goodToKnow: [
          { name: 'Event-Driven Systems', level: 'ADVANCED', importance: 'GOOD_TO_KNOW', description: 'Apache Kafka event streams, idempotency keys, and outbox patterns.' },
          { name: 'Cost Optimization', level: 'INTERMEDIATE', importance: 'GOOD_TO_KNOW', description: 'Cloud capacity modeling, instance sizing, and data tiering.' },
        ],
        advanced: [
          { name: 'Chaos Engineering', level: 'ADVANCED', importance: 'ADVANCED', description: 'Failure injection, disaster recovery drills, and RPO/RTO verification.' },
        ],
      },
      learningPhases: [
        {
          phaseNumber: '01',
          title: 'DISTRIBUTED SYSTEMS MASTERY',
          subtitle: 'Consensus, Partitioning & Scale',
          description: 'Deep dive into distributed transactions, event streams, and fault-tolerant multi-region topologies.',
          topics: ['Two-phase commit vs Saga patterns', 'Event sourcing with Kafka', 'Multi-region active-active replication', 'Zero-trust network security'],
          skills: ['Distributed Systems', 'Event-Driven Systems', 'System Design'],
        },
        {
          phaseNumber: '02',
          title: 'ENGINEERING LEADERSHIP',
          subtitle: 'RFCs, Mentorship & Strategy',
          description: 'Build strategic alignment, author rigorous engineering proposals, and coach senior technical talent.',
          topics: ['Architecture decision records (ADRs)', 'Cross-team consensus building', 'Engineering metrics & DORA standards', 'Cost governance'],
          skills: ['Technical Leadership', 'Cost Optimization', 'Chaos Engineering'],
        },
      ],
      practicalWork: [
        {
          id: 'p-se-s1',
          title: 'Distributed Transaction Saga Orchestrator',
          difficulty: 'Advanced',
          skillsRequired: ['Distributed Systems', 'TypeScript', 'Event-Driven Systems', 'PostgreSQL'],
          description: 'Design and simulate a distributed order fulfillment system using the Saga orchestration pattern with compensating transactions.',
          expectedOutcome: 'Comprehensive architecture whitepaper with code simulation and network partition tests.',
        },
        {
          id: 'p-se-s2',
          title: 'Multi-Tenant SaaS Data Isolation & Sharding Architecture',
          difficulty: 'Advanced',
          skillsRequired: ['System Design', 'SQL', 'Security', 'Technical Leadership'],
          description: 'Architect a database sharding blueprint supporting dynamic tenant routing, encryption at rest, and zero-downtime rebalancing.',
          expectedOutcome: 'Production RFC document with benchmarked routing benchmarks and failover plans.',
        },
      ],
      certifications: [
        { id: 'cert-se-aws-sap', name: 'AWS Certified Solutions Architect – Professional', issuingOrganization: 'Amazon Web Services', level: 'Advanced' },
      ],
      practiceAreas: [
        { id: 'prac-se-s1', title: 'Staff-Level System Design Loops', category: 'Scenario Questions', description: 'Design payment processing engines, real-time telemetry pipelines, and global CDNs.', questionCount: 16 },
        { id: 'prac-se-s2', title: 'Organizational Leadership Scenarios', category: 'Scenario Questions', description: 'Navigate conflicting stakeholder priorities and architectural trade-offs.', questionCount: 10 },
      ],
      interviewTopics: [
        {
          id: 'int-se-s1',
          topic: 'High-Scale Enterprise Architecture & Failure Scenarios',
          category: 'System Design',
          questionCount: 3,
          keyQuestions: [
            'How do you handle split-brain scenarios and network partitions in a multi-region distributed cluster?',
            'Walk me through the design of a globally distributed, idempotent payment processing pipeline.',
            'How do you evaluate whether to build an in-house platform tool versus adopting a vendor solution?',
          ],
        },
        {
          id: 'int-se-s2',
          topic: 'Strategic Influence & Squad Mentorship',
          category: 'Behavioral',
          questionCount: 2,
          keyQuestions: [
            'Tell me about an architectural initiative you drove across multiple squads. How did you align conflicting viewpoints?',
            'How do you identify and foster engineering talent within your team to transition mid-level engineers into seniors?',
          ],
        },
      ],
      readinessChecklist: [
        { id: 'chk-1', label: 'Executive / Staff-Level Resume Highlighting Business Impact', status: 'Essential', type: 'resume' },
        { id: 'chk-2', label: 'Public or Whitepaper Architectural Case Studies', status: 'Essential', type: 'practical' },
        { id: 'chk-3', label: 'Track Record of Mentorship & Cross-Team Impact', status: 'Essential', type: 'experience' },
        { id: 'chk-4', label: 'Demonstrated Distributed Systems Mastery', status: 'Essential', type: 'skills' },
      ],
      roadmapStageDescriptions: {
        learn: 'Explore distributed consensus, event sourcing, and high-availability patterns.',
        practice: 'Lead architecture reviews, analyze multi-region failure modes, and write RFCs.',
        mentorship: 'Engage with VP/Principal mentors on organizational leadership and strategic influence.',
        prepare: 'Master executive-level system design loops and strategic behavioral evaluations.',
        jobReady: 'Package your career accomplishments around business value, team growth, and uptime.',
        opportunities: 'Connect with Senior, Lead, and Staff Software Engineering roles (5+ years).',
      },
    },
  },

  // ==========================================
  // CLOUD ENGINEER
  // ==========================================
  'cloud-engineer': {
    entry: {
      id: 'entry',
      label: 'Beginner / Entry Level',
      roleTitle: 'Associate Cloud Engineer',
      experienceRange: '0–1 yrs',
      description: 'Provisioning basic cloud compute instances, configuring storage buckets, security groups, and learning Linux basics.',
      focusSummary: 'Master cloud fundamentals across AWS/Azure, basic Linux administration, and network security groups.',
      expectedCompetencies: ['AWS EC2 & S3 essentials', 'Linux CLI navigation', 'Basic IAM users & policies', 'VPC subnet basics'],
      responsibilities: [
        'Deploy and manage virtual machines and cloud storage resources.',
        'Configure network security group inbound and outbound firewall rules.',
        'Monitor basic resource consumption using CloudWatch or Azure Monitor.',
      ],
      practicalWorkTitle: 'Infrastructure Labs & Deployments',
      practicalWorkDescription: 'Hands-on cloud sandbox deployments configuring secure compute and storage services.',
      skillGroups: {
        mustKnow: [
          { name: 'AWS Basics', level: 'BEGINNER', importance: 'MUST_KNOW', description: 'EC2 instance types, S3 buckets, and IAM role assignment.' },
          { name: 'Linux OS', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'SSH, user management, file permissions, and systemd services.' },
          { name: 'Cloud Networking', level: 'BEGINNER', importance: 'MUST_KNOW', description: 'IP addressing, subnets, gateways, and security groups.' },
        ],
        goodToKnow: [
          { name: 'Bash Scripting', level: 'BEGINNER', importance: 'GOOD_TO_KNOW', description: 'Automating repetitive instance setup and log rotation.' },
          { name: 'Git', level: 'BEGINNER', importance: 'GOOD_TO_KNOW', description: 'Managing infrastructure scripts in version control.' },
        ],
        advanced: [
          { name: 'Terraform', level: 'BEGINNER', importance: 'ADVANCED', description: 'Basic infrastructure as code provider and resource syntax.' },
        ],
      },
      learningPhases: [
        {
          phaseNumber: '01',
          title: 'CLOUD & LINUX BASICS',
          subtitle: 'Compute & Storage',
          description: 'Learn fundamental cloud primitives and Linux system commands.',
          topics: ['Cloud architecture models', 'Linux system administration', 'AWS EC2 & EBS storage', 'S3 permissions & lifecycle'],
          skills: ['AWS Basics', 'Linux OS', 'Cloud Networking'],
        },
        {
          phaseNumber: '02',
          title: 'VPC NETWORKING & IDENTITY (IAM)',
          subtitle: 'Security & Connectivity',
          description: 'Configure public and private subnets, security groups, and IAM permissions.',
          topics: ['VPC routing tables & internet gateways', 'Security groups vs NACLs', 'IAM policies, users & roles', 'Billing alerts & cost budgets'],
          skills: ['Cloud Networking', 'AWS Basics'],
        },
      ],
      practicalWork: [
        {
          id: 'p-ce-e1',
          title: 'Secure Multi-Subnet VPC & Web Server Deployment',
          difficulty: 'Beginner',
          skillsRequired: ['AWS Basics', 'Linux OS', 'Cloud Networking'],
          description: 'Deploy a public/private VPC subnet configuration hosting a hardened Linux web server behind a security group.',
          expectedOutcome: 'Live reachable web service running on a secured private subnet with NAT gateway.',
        },
      ],
      certifications: [
        { id: 'cert-cl-aws-clf', name: 'AWS Certified Cloud Practitioner', issuingOrganization: 'Amazon Web Services', level: 'Foundation' },
      ],
      practiceAreas: [
        { id: 'prac-ce-e1', title: 'Linux CLI & Permission Drills', category: 'Technical Challenges', description: 'Configure chmod, chown, SSH keys, and system services.', questionCount: 15 },
        { id: 'prac-ce-e2', title: 'VPC Subnet & Security Group Routing Drills', category: 'Technical Challenges', description: 'Configure route tables, NAT gateways, and inbound firewall rules.', questionCount: 12 },
      ],
      interviewTopics: [
        {
          id: 'int-ce-e1',
          topic: 'Cloud Fundamentals & Security',
          category: 'Technical',
          questionCount: 3,
          keyQuestions: [
            'What is the difference between a public and private subnet in AWS?',
            'Explain the principle of least privilege in IAM configuration.',
            'How do security groups differ from Network Access Control Lists (NACLs)?',
          ],
        },
      ],
      readinessChecklist: [
        { id: 'chk-1', label: 'Cloud Foundations Resume', status: 'Essential', type: 'resume' },
        { id: 'chk-2', label: 'AWS Certified Cloud Practitioner (Optional)', status: 'Recommended', type: 'certifications' },
        { id: 'chk-3', label: 'Hands-On VPC Architecture Lab Documentation', status: 'Essential', type: 'practical' },
      ],
      roadmapStageDescriptions: {
        learn: 'Learn cloud services, Linux commands, and networking fundamentals.',
        practice: 'Provision VMs, configure firewall rules, and troubleshoot network access.',
        mentorship: 'Get guidance on cloud certifications and early-career cloud roles.',
        prepare: 'Practice technical screening questions on IAM, VPCs, and storage.',
        jobReady: 'Document your cloud lab deployments and showcase clean architectural diagrams.',
        opportunities: 'Discover entry-level Cloud Operations and Associate Cloud Engineer positions.',
      },
    },
    junior: {
      id: 'junior',
      label: 'Junior',
      roleTitle: 'Junior Cloud Engineer',
      experienceRange: '1–3 yrs',
      description: 'Automating cloud resources with Terraform IaC, containerizing services with Docker, and setting up CI/CD pipelines.',
      focusSummary: 'Master Infrastructure as Code (Terraform), Docker container workflows, and automated pipeline deployments.',
      expectedCompetencies: ['Terraform state & modules', 'Docker image builds', 'CI/CD pipeline automation', 'CloudWatch log metrics'],
      responsibilities: [
        'Write and maintain Terraform configuration files for reproducible infrastructure.',
        'Package applications into lightweight, secure Docker containers.',
        'Set up automated deployment steps in GitHub Actions or GitLab CI.',
      ],
      practicalWorkTitle: 'Infrastructure Labs & Deployments',
      practicalWorkDescription: 'Automate multi-tier application infrastructure using Terraform, Docker, and CI/CD.',
      skillGroups: {
        mustKnow: [
          { name: 'Terraform', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'Declarative IaC, remote state backends, variables, and outputs.' },
          { name: 'Docker', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'Dockerfile optimization, multi-stage builds, and container registries.' },
          { name: 'AWS Services', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'ECS, RDS databases, Application Load Balancers, and Route53.' },
        ],
        goodToKnow: [
          { name: 'CI/CD Pipelines', level: 'INTERMEDIATE', importance: 'GOOD_TO_KNOW', description: 'Automating Terraform plans and container deployments in GitHub Actions.' },
        ],
        advanced: [
          { name: 'Kubernetes', level: 'BEGINNER', importance: 'ADVANCED', description: 'Pod lifecycles, deployments, and service manifests.' },
        ],
      },
      learningPhases: [
        {
          phaseNumber: '01',
          title: 'INFRASTRUCTURE AS CODE',
          subtitle: 'Terraform & Containers',
          description: 'Codify infrastructure with Terraform and containerize applications with Docker.',
          topics: ['Terraform state management', 'Modular IaC patterns', 'Docker container optimization', 'Load balancing & auto-scaling'],
          skills: ['Terraform', 'Docker', 'AWS Services'],
        },
        {
          phaseNumber: '02',
          title: 'CONTAINERIZATION & CLUSTER DEPLOYMENTS',
          subtitle: 'Docker & ECS/EKS Services',
          description: 'Deploy multi-container applications to managed cloud container services.',
          topics: ['Docker multi-stage builds', 'AWS ECS task definitions & services', 'ALB path-based routing', 'Auto-scaling policies'],
          skills: ['Docker', 'AWS Services'],
        },
      ],
      practicalWork: [
        {
          id: 'p-ce-j1',
          title: 'Automated Multi-Environment Infrastructure with Terraform',
          difficulty: 'Intermediate',
          skillsRequired: ['Terraform', 'AWS Services', 'Docker'],
          description: 'Create reusable Terraform modules provisioning dev, staging, and prod environments with remote S3 state locking.',
          expectedOutcome: 'Version-controlled infrastructure repository deploying an ALB and ECS cluster.',
        },
      ],
      certifications: [
        { id: 'cert-cl-aws-saa', name: 'AWS Certified Solutions Architect – Associate', issuingOrganization: 'Amazon Web Services', level: 'Intermediate' },
      ],
      practiceAreas: [
        { id: 'prac-ce-j1', title: 'Terraform Drift & State Resolution', category: 'Technical Challenges', description: 'Resolve state lock errors and import unmanaged cloud resources.', questionCount: 12 },
        { id: 'prac-ce-j2', title: 'Container Build & ALB Routing Challenges', category: 'Technical Challenges', description: 'Configure multi-stage Dockerfiles and ALB target group health checks.', questionCount: 10 },
      ],
      interviewTopics: [
        {
          id: 'int-ce-j1',
          topic: 'Terraform & Container Orchestration',
          category: 'Technical',
          questionCount: 3,
          keyQuestions: [
            'How do you manage sensitive credentials safely in Terraform configuration?',
            'What is the purpose of a Terraform remote state lock with DynamoDB?',
            'Explain how an Application Load Balancer distributes traffic to container tasks.',
          ],
        },
      ],
      readinessChecklist: [
        { id: 'chk-1', label: 'Resume with Verified IaC & Container Deployments', status: 'Essential', type: 'resume' },
        { id: 'chk-2', label: 'AWS Solutions Architect Associate (Optional)', status: 'Recommended', type: 'certifications' },
        { id: 'chk-3', label: 'GitHub Repository with Terraform Modules', status: 'Essential', type: 'links' },
      ],
      roadmapStageDescriptions: {
        learn: 'Master Terraform IaC, Docker containers, and automated deployment pipelines.',
        practice: 'Drill state file recovery, module authoring, and container security scans.',
        mentorship: 'Review infrastructure code patterns with experienced cloud architects.',
        prepare: 'Practice technical interviews on IaC workflows and containerized deployments.',
        jobReady: 'Showcase reusable Terraform modules and clean infrastructure documentation.',
        opportunities: 'Target Junior and Cloud Systems Engineer roles (1–3 years experience).',
      },
    },
    mid: {
      id: 'mid',
      label: 'Mid-Level',
      roleTitle: 'Cloud Engineer II',
      experienceRange: '3–5 yrs',
      description: 'Architecting Kubernetes clusters, multi-region cloud networks, security governance, and cost optimization.',
      focusSummary: 'Master Kubernetes orchestration, cloud security posture, multi-account governance, and cloud cost management.',
      expectedCompetencies: ['Kubernetes cluster operations', 'Multi-account AWS Organizations', 'Transit Gateway networking', 'Cloud cost FinOps'],
      responsibilities: [
        'Deploy and manage production Kubernetes (EKS / GKE) clusters and ingress controllers.',
        'Design centralized networking topologies using Transit Gateway and VPN connections.',
        'Implement automated compliance guardrails and optimize monthly cloud spend.',
      ],
      practicalWorkTitle: 'Infrastructure Labs & Deployments',
      practicalWorkDescription: 'Deploy production Kubernetes infrastructure with automated scaling, ingress, and cost governance.',
      skillGroups: {
        mustKnow: [
          { name: 'Kubernetes', level: 'ADVANCED', importance: 'MUST_KNOW', description: 'EKS cluster operations, Helm charts, ingress controllers, and RBAC.' },
          { name: 'Advanced Cloud Networking', level: 'ADVANCED', importance: 'MUST_KNOW', description: 'Transit Gateway, VPC peering, direct connects, and hybrid DNS.' },
          { name: 'FinOps & Cost Optimization', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'Spot instances, savings plans, auto-scaling policies, and cost allocation.' },
        ],
        goodToKnow: [
          { name: 'Cloud Security', level: 'ADVANCED', importance: 'GOOD_TO_KNOW', description: 'KMS encryption keys, GuardDuty threat detection, and IAM permission boundaries.' },
        ],
        advanced: [
          { name: 'Service Mesh', level: 'INTERMEDIATE', importance: 'ADVANCED', description: 'Istio or Linkerd mTLS communication and traffic routing.' },
        ],
      },
      learningPhases: [
        {
          phaseNumber: '01',
          title: 'ENTERPRISE KUBERNETES & NETWORKING',
          subtitle: 'Cluster Scale & Security',
          description: 'Operate enterprise Kubernetes clusters and manage complex hybrid networking.',
          topics: ['EKS cluster administration', 'Helm packaging', 'Transit Gateway mesh', 'IAM permission boundaries'],
          skills: ['Kubernetes', 'Advanced Cloud Networking', 'Cloud Security'],
        },
        {
          phaseNumber: '02',
          title: 'FINOPS & CLOUD COST GOVERNANCE',
          subtitle: 'Resource Efficiency & Optimization',
          description: 'Analyze cloud bills, automate rightsizing, and configure commitment discounts.',
          topics: ['AWS Cost Explorer & CUR reports', 'Spot instances & Savings Plans', 'Automated compute scheduling', 'Tagging policies & cost allocation'],
          skills: ['FinOps & Cost Optimization'],
        },
      ],
      practicalWork: [
        {
          id: 'p-ce-m1',
          title: 'Production Kubernetes Cluster with Auto-Scaling & Ingress',
          difficulty: 'Intermediate',
          skillsRequired: ['Kubernetes', 'Terraform', 'Advanced Cloud Networking'],
          description: 'Deploy a highly-available EKS cluster utilizing Karpenter auto-scaling, cert-manager TLS, and AWS Load Balancer Controller.',
          expectedOutcome: 'Battle-tested Kubernetes infrastructure with automated scale-to-zero capabilities.',
        },
      ],
      certifications: [
        { id: 'cert-cl-aws-dop', name: 'AWS Certified DevOps Engineer – Professional', issuingOrganization: 'Amazon Web Services', level: 'Advanced' },
      ],
      practiceAreas: [
        { id: 'prac-ce-m1', title: 'Kubernetes Pod Scheduling & DNS Debugging', category: 'Scenario Questions', description: 'Diagnose CrashLoopBackOff, CoreDNS timeouts, and ingress 502 errors.', questionCount: 14 },
        { id: 'prac-ce-m2', title: 'Cloud Cost Analysis & Rightsizing Scenarios', category: 'Scenario Questions', description: 'Analyze underutilized compute instances and design a 25% cost reduction plan.', questionCount: 12 },
      ],
      interviewTopics: [
        {
          id: 'int-ce-m1',
          topic: 'Kubernetes Architecture & Cloud Networking',
          category: 'System Design',
          questionCount: 3,
          keyQuestions: [
            'How does Kubernetes handle pod-to-pod networking across worker nodes in AWS VPC CNI?',
            'What strategies do you use to reduce compute costs for batch processing workloads in cloud environments?',
            'Explain the implementation of a zero-trust network model within a multi-account cloud environment.',
          ],
        },
      ],
      readinessChecklist: [
        { id: 'chk-1', label: 'Resume Showcasing Multi-Account Infrastructure & FinOps Wins', status: 'Essential', type: 'resume' },
        { id: 'chk-2', label: 'Certified Kubernetes Administrator (CKA) (Optional)', status: 'Recommended', type: 'certifications' },
        { id: 'chk-3', label: 'Production EKS / Terraform Architecture Case Study', status: 'Essential', type: 'practical' },
      ],
      roadmapStageDescriptions: {
        learn: 'Deepen Kubernetes cluster administration, hybrid networking, and FinOps practices.',
        practice: 'Simulate cluster failures, network partition diagnostics, and cost optimization audits.',
        mentorship: 'Discuss enterprise cloud migration and multi-cloud strategies with senior architects.',
        prepare: 'Master scenario-based system design rounds covering cloud networking and disaster recovery.',
        jobReady: 'Highlight cost savings, uptime improvements, and Kubernetes migrations on your profile.',
        opportunities: 'Target Mid-Level and Senior Cloud Engineering opportunities (3–5 years).',
      },
    },
    senior: {
      id: 'senior',
      label: 'Senior',
      roleTitle: 'Senior Cloud Architect',
      experienceRange: '5+ yrs',
      description: 'Designing multi-region disaster recovery, hybrid enterprise cloud governance, zero-trust architectures, and executive strategy.',
      focusSummary: 'Master enterprise multi-region architecture, business continuity, zero-trust security, and cloud organizational leadership.',
      expectedCompetencies: ['Multi-region disaster recovery (RPO/RTO)', 'Landing zone automation', 'Zero-trust architecture', 'Executive stakeholder alignment'],
      responsibilities: [
        'Architect enterprise multi-region landing zones ensuring high availability and disaster recovery.',
        'Establish cloud governance policies, security baseline controls, and audit frameworks.',
        'Lead major cloud migration initiatives and mentor engineering teams across the organization.',
      ],
      practicalWorkTitle: 'Infrastructure Labs & Deployments',
      practicalWorkDescription: 'Architect multi-region landing zone blueprints, disaster recovery runbooks, and enterprise governance frameworks.',
      skillGroups: {
        mustKnow: [
          { name: 'Enterprise Cloud Architecture', level: 'EXPERT', importance: 'MUST_KNOW', description: 'Multi-region active-active design, disaster recovery topologies, and RTO/RPO SLA guarantees.' },
          { name: 'Landing Zones & Governance', level: 'EXPERT', importance: 'MUST_KNOW', description: 'AWS Control Tower, Service Control Policies (SCPs), and automated compliance enforcement.' },
          { name: 'Zero-Trust Cloud Security', level: 'ADVANCED', importance: 'MUST_KNOW', description: 'Identity-aware proxies, certificate management, and workload identity federation.' },
        ],
        goodToKnow: [
          { name: 'Multi-Cloud Strategy', level: 'ADVANCED', importance: 'GOOD_TO_KNOW', description: 'Cross-cloud workload portability and unified observability architectures.' },
        ],
        advanced: [
          { name: 'Disaster Recovery Automation', level: 'EXPERT', importance: 'ADVANCED', description: 'Automated multi-region database failover and global DNS health routing.' },
        ],
      },
      learningPhases: [
        {
          phaseNumber: '01',
          title: 'ENTERPRISE LANDING ZONES & DISASTER RECOVERY',
          subtitle: 'Global Scale & Resilience',
          description: 'Design global cloud foundations with automated disaster recovery and organizational governance.',
          topics: ['Control Tower & SCPs', 'Multi-region Aurora & DynamoDB global tables', 'Route53 ARC routing controls', 'SOC2 / ISO27001 automation'],
          skills: ['Enterprise Cloud Architecture', 'Landing Zones & Governance', 'Disaster Recovery Automation'],
        },
        {
          phaseNumber: '02',
          title: 'ZERO-TRUST ARCHITECTURE & MULTI-CLOUD STRATEGY',
          subtitle: 'Enterprise Security & Governance',
          description: 'Implement identity-based perimeters, workload identity federation, and cross-cloud governance.',
          topics: ['Workload identity federation (AWS IAM Roles Anywhere / OIDC)', 'Zero-trust network access (ZTNA)', 'Cross-cloud unified observability', 'Enterprise cloud exit and DR runbooks'],
          skills: ['Zero-Trust Cloud Security', 'Multi-Cloud Strategy'],
        },
      ],
      practicalWork: [
        {
          id: 'p-ce-s1',
          title: 'Automated Multi-Region Active-Active Disaster Recovery Architecture',
          difficulty: 'Advanced',
          skillsRequired: ['Enterprise Cloud Architecture', 'Disaster Recovery Automation', 'Terraform'],
          description: 'Design and validate an enterprise architecture supporting under 15-minute RPO/RTO across two geographic cloud regions.',
          expectedOutcome: 'Comprehensive architecture whitepaper with simulated regional failure drill reports.',
        },
      ],
      certifications: [
        { id: 'cert-cl-gcp-pca', name: 'Google Cloud Certified Professional Cloud Architect', issuingOrganization: 'Google Cloud', level: 'Advanced' },
      ],
      practiceAreas: [
        { id: 'prac-ce-s1', title: 'Global Cloud Disaster Recovery Drills', category: 'Scenario Questions', description: 'Coordinate automated failover during simulated regional outage events.', questionCount: 15 },
        { id: 'prac-ce-s2', title: 'Executive Cloud Migration & DR Defense', category: 'Scenario Questions', description: 'Defend multi-region cloud migration plans before an executive architecture board.', questionCount: 10 },
      ],
      interviewTopics: [
        {
          id: 'int-ce-s1',
          topic: 'Enterprise Cloud Strategy & Business Continuity',
          category: 'System Design',
          questionCount: 3,
          keyQuestions: [
            'How do you design a global active-active application architecture to handle complete cloud region failures?',
            'What governance controls do you put in place to prevent accidental data exfiltration across hundreds of AWS accounts?',
            'How do you balance security compliance requirements against developer velocity in a rapidly growing company?',
          ],
        },
      ],
      readinessChecklist: [
        { id: 'chk-1', label: 'Executive Cloud Architecture Resume', status: 'Essential', type: 'resume' },
        { id: 'chk-2', label: 'AWS Solutions Architect Professional (Optional)', status: 'Recommended', type: 'certifications' },
        { id: 'chk-3', label: 'Enterprise Multi-Region Architecture Whitepaper', status: 'Essential', type: 'practical' },
      ],
      roadmapStageDescriptions: {
        learn: 'Master multi-region active-active architectures and organizational cloud governance.',
        practice: 'Lead enterprise disaster recovery simulations and architecture design reviews.',
        mentorship: 'Consult with VP-level cloud leaders on cloud economics and organizational agility.',
        prepare: 'Master executive-level cloud architecture loops and cross-functional leadership interviews.',
        jobReady: 'Demonstrate multi-million dollar cloud migrations and high-availability track records.',
        opportunities: 'Connect with Principal Cloud Architect and Director of Cloud Engineering roles.',
      },
    },
  },

  // ==========================================
  // HARDWARE / EMBEDDED SYSTEMS ENGINEER
  // ==========================================
  'embedded-hardware-engineer': {
    entry: {
      id: 'entry',
      label: 'Beginner / Entry Level',
      roleTitle: 'Associate Hardware / Embedded Engineer',
      experienceRange: '0–1 yrs',
      description: 'Focuses on circuit fundamentals, schematic reading, microcontroller firmware in Embedded C, and basic lab tools.',
      focusSummary: 'Master basic circuit laws, schematic diagrams, Embedded C syntax, microcontroller GPIO, and oscilloscope measurements.',
      expectedCompetencies: [
        'Ohm’s & Kirchhoff’s laws & circuit analysis',
        'Reading schematic diagrams and component datasheets',
        'Embedded C programming & bitwise operations',
        'Basic microcontroller GPIO, timers, and interrupts',
        'Using digital multimeters & basic oscilloscopes',
      ],
      responsibilities: [
        'Assemble and prototype breadboard circuits following schematic drawings.',
        'Write basic device drivers in Embedded C for LEDs, buttons, and sensors.',
        'Measure voltages, currents, and signal frequencies using lab equipment.',
        'Document test measurements and bill of materials (BOM) in engineering logs.',
      ],
      practicalWorkTitle: 'Labs, Circuits & Simulations',
      practicalWorkDescription: 'Hands-on breadboard prototypes, circuit simulations (SPICE), and microcontroller sensor firmware.',
      skillGroups: {
        mustKnow: [
          { name: 'Circuit Fundamentals', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'Resistors, capacitors, diodes, transistors, and Ohm’s/Kirchhoff’s laws.' },
          { name: 'Embedded C', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'Pointers, bitwise masking, memory registers, and volatile keyword.' },
          { name: 'Microcontroller Basics', level: 'BEGINNER', importance: 'MUST_KNOW', description: 'STM32 / AVR architecture, GPIO pins, and interrupt service routines.' },
          { name: 'Lab Instrumentation', level: 'BEGINNER', importance: 'MUST_KNOW', description: 'Digital multimeter, oscilloscope voltage probing, and bench power supplies.' },
        ],
        goodToKnow: [
          { name: 'Circuit Simulation', level: 'BEGINNER', importance: 'GOOD_TO_KNOW', description: 'SPICE / LTspice analog circuit simulation.' },
          { name: 'PCB Schematic Capture', level: 'BEGINNER', importance: 'GOOD_TO_KNOW', description: 'KiCad schematic creation and component footprint association.' },
        ],
        advanced: [
          { name: 'Communication Protocols', level: 'BEGINNER', importance: 'ADVANCED', description: 'UART serial terminal communication fundamentals.' },
        ],
      },
      learningPhases: [
        {
          phaseNumber: '01',
          title: 'CIRCUIT THEORY & LAB ESSENTIALS',
          subtitle: 'Analog & Digital Foundations',
          description: 'Learn electrical fundamentals, component operation, and hands-on laboratory measurement techniques.',
          topics: ['Ohm’s & Kirchhoff’s circuit laws', 'Capacitive & inductive transient response', 'Diode & transistor switching circuits', 'Oscilloscope probing fundamentals'],
          skills: ['Circuit Fundamentals', 'Lab Instrumentation', 'Circuit Simulation'],
        },
        {
          phaseNumber: '02',
          title: 'MICROCONTROLLERS & EMBEDDED C',
          subtitle: 'Firmware & Peripherals',
          description: 'Program bare-metal microcontrollers to interface with real-world sensors and actuators.',
          topics: ['Embedded C bit manipulation', 'GPIO input/output configuration', 'Timer interrupts & PWM generation', 'UART serial logging'],
          skills: ['Embedded C', 'Microcontroller Basics', 'Communication Protocols'],
        },
      ],
      practicalWork: [
        {
          id: 'p-hw-e1',
          title: 'Regulated DC Power Supply & Circuit Simulation',
          difficulty: 'Beginner',
          skillsRequired: ['Circuit Fundamentals', 'Circuit Simulation', 'Lab Instrumentation'],
          description: 'Design and simulate an adjustable 5V/3.3V linear regulated power supply with thermal analysis in LTspice.',
          expectedOutcome: 'Complete SPICE simulation report with transient ripple analysis and assembled bench prototype.',
        },
        {
          id: 'p-hw-e2',
          title: 'Bare-Metal Sensor Ingestion & UART Logger',
          difficulty: 'Beginner',
          skillsRequired: ['Embedded C', 'Microcontroller Basics', 'Communication Protocols'],
          description: 'Write bare-metal Embedded C firmware on STM32/AVR to sample temperature sensor data via ADC and output serial telemetry.',
          expectedOutcome: 'Documented firmware repository with register-level peripheral configuration and oscilloscope waveform captures.',
        },
      ],
      certifications: [
        { id: 'cert-hw-ipc-cis', name: 'IPC Certified IPC Specialist (CIS) in PCB Assembly', issuingOrganization: 'IPC', level: 'Foundation' },
      ],
      practiceAreas: [
        { id: 'prac-hw-e1', title: 'Schematic Reading & Circuit Math Drills', category: 'Technical Challenges', description: 'Calculate voltage dividers, transistor bias points, and RC time constants.', questionCount: 15 },
        { id: 'prac-hw-e2', title: 'Embedded C Pointer & Bitmasking Drills', category: 'Technical Challenges', description: 'Manipulate microcontroller memory registers using bitwise operators.', questionCount: 12 },
      ],
      interviewTopics: [
        {
          id: 'int-hw-e1',
          topic: 'Circuit Theory & Embedded C Fundamentals',
          category: 'Technical',
          questionCount: 3,
          keyQuestions: [
            'What is the purpose of the volatile keyword in Embedded C and when must it be used?',
            'Explain how a pull-up resistor prevents floating inputs on a microcontroller GPIO pin.',
            'What is the difference between an open-collector and push-pull output stage?',
          ],
        },
        {
          id: 'int-hw-e2',
          topic: 'Laboratory Troubleshooting',
          category: 'Behavioral',
          questionCount: 2,
          keyQuestions: [
            'Walk me through the steps you take with an oscilloscope when a circuit does not power on as expected.',
            'Describe a situation where a physical component did not behave according to its datasheet.',
          ],
        },
      ],
      readinessChecklist: [
        { id: 'chk-1', label: 'Hardware Engineering Resume with Core Coursework', status: 'Essential', type: 'resume' },
        { id: 'chk-2', label: 'Circuit Simulation Reports (LTspice / Proteus)', status: 'Essential', type: 'practical' },
        { id: 'chk-3', label: 'Bare-Metal Embedded C Project Code on GitHub', status: 'Essential', type: 'links' },
        { id: 'chk-4', label: 'Oscilloscope Waveform Screenshots & Lab Notes', status: 'Recommended', type: 'practical' },
      ],
      roadmapStageDescriptions: {
        learn: 'Master circuit theory, Embedded C, and microcontroller peripheral registers.',
        practice: 'Complete circuit simulation tasks, bitmasking drills, and lab measurement exercises.',
        mentorship: 'Receive feedback on your schematic captures and firmware organization from hardware engineers.',
        prepare: 'Practice technical questions on electronic circuits, pointers, and oscilloscope diagnostics.',
        jobReady: 'Compile your circuit simulation reports, code repositories, and lab test measurements.',
        opportunities: 'Discover entry-level Embedded Firmware and Hardware Engineering openings.',
      },
    },
    junior: {
      id: 'junior',
      label: 'Junior',
      roleTitle: 'Junior Hardware / Firmware Engineer',
      experienceRange: '1–3 yrs',
      description: 'Designing custom PCBs, implementing I2C/SPI bus drivers, digital logic in Verilog, and board bring-up.',
      focusSummary: 'Master 2-layer PCB layout (KiCad/Altium), serial protocol debugging (I2C, SPI), and basic RTOS multitasking.',
      expectedCompetencies: [
        'PCB layout rules, trace impedance, and ground planes',
        'I2C, SPI, and CAN communication bus protocols',
        'Logic analyzer bus decoding & signal integrity',
        'FreeRTOS task scheduling & semaphores',
        'Soldering surface-mount devices (SMD) & board bring-up',
      ],
      responsibilities: [
        'Design 2-to-4 layer custom PCB layouts following manufacturing DRC guidelines.',
        'Write reliable peripheral drivers for flash memory, displays, and IMU sensors.',
        'Perform initial board bring-up, power rail verification, and hardware debugging.',
        'Generate manufacturing fabrication files (Gerbers, drill files, Pick & Place).',
      ],
      practicalWorkTitle: 'Labs, Circuits & Simulations',
      practicalWorkDescription: 'Design complete printed circuit boards, assemble prototype hardware, and write multi-threaded firmware.',
      skillGroups: {
        mustKnow: [
          { name: 'PCB Design (KiCad / Altium)', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'Schematic capture, PCB routing, component placement, and Gerber generation.' },
          { name: 'Hardware Protocols (I2C, SPI, UART)', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'Clock synchronization, bus contention, pull-up sizing, and protocol analyzers.' },
          { name: 'RTOS (FreeRTOS)', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'Tasks, queues, semaphores, mutexes, and priority inversion prevention.' },
          { name: 'Board Bring-Up & Debugging', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'Power sequencing, clock verification, JTAG/SWD debugging, and SMD soldering.' },
        ],
        goodToKnow: [
          { name: 'Digital Logic (Verilog)', level: 'BEGINNER', importance: 'GOOD_TO_KNOW', description: 'Synthesizable RTL, state machines, and FPGA simulation.' },
        ],
        advanced: [
          { name: 'Low Power Design', level: 'INTERMEDIATE', importance: 'ADVANCED', description: 'Sleep modes, power gating, and battery lifetime modeling.' },
        ],
      },
      learningPhases: [
        {
          phaseNumber: '01',
          title: 'PCB DESIGN & BUS PROTOCOLS',
          subtitle: 'Schematic to Manufactured Board',
          description: 'Design custom PCBs and interface with industry-standard communication buses.',
          topics: ['KiCad schematic & layout workflows', 'Ground planes & signal return paths', 'I2C & SPI timing diagrams', 'Logic analyzer bus capture'],
          skills: ['PCB Design (KiCad / Altium)', 'Hardware Protocols (I2C, SPI, UART)', 'Board Bring-Up & Debugging'],
        },
        {
          phaseNumber: '02',
          title: 'REAL-TIME OPERATING SYSTEMS',
          subtitle: 'FreeRTOS & Multitasking',
          description: 'Build responsive embedded systems utilizing RTOS task scheduling and inter-task communication.',
          topics: ['Preemptive scheduling algorithms', 'Mutex vs binary semaphore', 'Queue message buffers', 'Low-power tickless idle'],
          skills: ['RTOS (FreeRTOS)', 'Low Power Design', 'Digital Logic (Verilog)'],
        },
      ],
      practicalWork: [
        {
          id: 'p-hw-j1',
          title: 'Custom Sensor Gateway PCB Design & Manufacture',
          difficulty: 'Intermediate',
          skillsRequired: ['PCB Design (KiCad / Altium)', 'Hardware Protocols (I2C, SPI, UART)', 'Board Bring-Up & Debugging'],
          description: 'Design a 2-layer PCB integrating an ARM Cortex-M microcontroller, environmental sensors over I2C, and USB-C power delivery.',
          expectedOutcome: 'Manufactured and assembled PCB with documented board bring-up checklist and test waveforms.',
        },
        {
          id: 'p-hw-j2',
          title: 'FreeRTOS Multi-Sensor Acquisition & Telemetry Controller',
          difficulty: 'Intermediate',
          skillsRequired: ['RTOS (FreeRTOS)', 'Hardware Protocols (I2C, SPI, UART)', 'Low Power Design'],
          description: 'Implement a FreeRTOS application with separate tasks for sensor acquisition, queue processing, display refresh, and sleep transitions.',
          expectedOutcome: 'Fully tested firmware project demonstrating task synchronization with zero priority inversions.',
        },
      ],
      certifications: [
        { id: 'cert-hw-arm-aae', name: 'Arm Accredited Engineer (AAE)', issuingOrganization: 'Arm', level: 'Intermediate' },
      ],
      practiceAreas: [
        { id: 'prac-hw-j1', title: 'I2C & SPI Timing Analysis Drills', category: 'Technical Challenges', description: 'Diagnose bus collision, clock stretching, and missing ACK responses.', questionCount: 12 },
        { id: 'prac-hw-j2', title: 'FreeRTOS Deadlock & Priority Inversion Triage', category: 'Scenario Questions', description: 'Resolve thread deadlocks and configure priority inheritance.', questionCount: 10 },
      ],
      interviewTopics: [
        {
          id: 'int-hw-j1',
          topic: 'Hardware Protocols & Embedded OS',
          category: 'Technical',
          questionCount: 3,
          keyQuestions: [
            'Compare I2C and SPI in terms of pin count, speed, transmission distance, and multi-master support.',
            'What is priority inversion in an RTOS and how does priority inheritance solve it?',
            'How do you design a ground plane on a mixed-signal PCB to avoid digital noise in analog signals?',
          ],
        },
      ],
      readinessChecklist: [
        { id: 'chk-1', label: 'Resume Showcasing Fabricated PCBs & RTOS Projects', status: 'Essential', type: 'resume' },
        { id: 'chk-2', label: 'Manufactured PCB Photos & Gerber File Archive', status: 'Essential', type: 'practical' },
        { id: 'chk-3', label: 'GitHub Repository with Clean FreeRTOS Firmware', status: 'Essential', type: 'links' },
        { id: 'chk-4', label: 'Logic Analyzer Signal Decoding Screenshots', status: 'Recommended', type: 'practical' },
      ],
      roadmapStageDescriptions: {
        learn: 'Learn PCB layout best practices, high-speed buses, and FreeRTOS concurrency.',
        practice: 'Decode logic analyzer traces, configure RTOS semaphores, and route differential pairs.',
        mentorship: 'Conduct schematic reviews and PCB design rule checks with senior hardware engineers.',
        prepare: 'Practice technical interview problems on hardware protocols, memory layouts, and RTOS.',
        jobReady: 'Showcase photos of assembled PCBs, Gerber files, and verified oscilloscope traces.',
        opportunities: 'Target Junior Hardware Engineer, Embedded Software Engineer, and Firmware roles.',
      },
    },
    mid: {
      id: 'mid',
      label: 'Mid-Level',
      roleTitle: 'Hardware / Embedded Engineer II',
      experienceRange: '3–5 yrs',
      description: 'Designing high-speed multi-layer PCBs, EMI/EMC compliance, hardware-in-the-loop (HIL) testing, and Linux BSP drivers.',
      focusSummary: 'Master 4–6 layer high-speed PCB design, impedance control, EMC compliance testing, and Embedded Linux driver development.',
      expectedCompetencies: [
        'High-speed PCB routing (DDR, USB, differential pairs)',
        'EMC/EMI compliance design & pre-compliance testing',
        'Hardware-in-the-loop (HIL) automated test benches',
        'Embedded Linux device tree & kernel driver basics',
        'Thermal dissipation modeling & power integrity',
      ],
      responsibilities: [
        'Architect and route 4-to-6 layer PCBs with controlled impedance and length matching.',
        'Design circuits meeting FCC/CE regulatory emissions and ESD protection standards.',
        'Develop automated hardware validation test benches using Python and lab instruments.',
        'Write and debug device tree bindings and kernel drivers for Embedded Linux systems.',
      ],
      practicalWorkTitle: 'Labs, Circuits & Simulations',
      practicalWorkDescription: 'Design high-speed micro-controller boards, automated HIL test rigs, and Embedded Linux device drivers.',
      skillGroups: {
        mustKnow: [
          { name: 'High-Speed PCB Design', level: 'ADVANCED', importance: 'MUST_KNOW', description: 'Controlled impedance, length tuning, return path discontinuities, and decoupling capacitors.' },
          { name: 'EMC / EMI Compliance', level: 'ADVANCED', importance: 'MUST_KNOW', description: 'Radiated emissions suppression, ESD suppression, common-mode chokes, and shielding.' },
          { name: 'Hardware-in-the-Loop Testing', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'Automating instrument control via SCPI over USB/Ethernet in Python.' },
        ],
        goodToKnow: [
          { name: 'Embedded Linux & BSP', level: 'INTERMEDIATE', importance: 'GOOD_TO_KNOW', description: 'U-Boot bootloader, Device Tree configuration, and kernel module creation.' },
        ],
        advanced: [
          { name: 'FPGA & DSP Acceleration', level: 'INTERMEDIATE', importance: 'ADVANCED', description: 'Signal processing algorithms on Xilinx/Intel FPGAs using Verilog.' },
        ],
      },
      learningPhases: [
        {
          phaseNumber: '01',
          title: 'HIGH-SPEED DESIGN & EMC COMPLIANCE',
          subtitle: 'Signal Integrity & Regulations',
          description: 'Engineer high-speed printed circuits resistant to electromagnetic interference.',
          topics: ['Controlled impedance calculation', 'Differential pair routing rules', 'Radiated vs conducted emissions', 'Ferrite bead & filter selection'],
          skills: ['High-Speed PCB Design', 'EMC / EMI Compliance', 'Hardware-in-the-Loop Testing'],
        },
        {
          phaseNumber: '02',
          title: 'EMBEDDED LINUX & AUTOMATED HIL TEST RIGS',
          subtitle: 'Kernel Drivers & Validation',
          description: 'Develop Linux board support packages and automate bench instrument test validation.',
          topics: ['Device Tree bindings & pin muxing', 'Linux kernel driver modules (I2C/SPI)', 'SCPI instrument automation in Python', 'Environmental thermal chamber testing'],
          skills: ['Embedded Linux & BSP', 'Hardware-in-the-Loop Testing'],
        },
      ],
      practicalWork: [
        {
          id: 'p-hw-m1',
          title: '4-Layer High-Speed IoT Gateway with Cellular & BLE',
          difficulty: 'Intermediate',
          skillsRequired: ['High-Speed PCB Design', 'EMC / EMI Compliance', 'Embedded Linux & BSP'],
          description: 'Design a 4-layer compute board featuring an ARM Cortex-A core, controlled-impedance 50Ω RF traces, and power management IC (PMIC).',
          expectedOutcome: 'Complete manufacturing package, thermal simulation, and EMC pre-compliance test report.',
        },
      ],
      certifications: [
        { id: 'cert-hw-ipc-cid', name: 'IPC Certified Interconnect Designer (CID)', issuingOrganization: 'IPC', level: 'Intermediate' },
      ],
      practiceAreas: [
        { id: 'prac-hw-m1', title: 'Signal Integrity & Eye Diagram Analysis', category: 'Technical Challenges', description: 'Evaluate jitter, rise-time degradation, and reflections on high-speed traces.', questionCount: 14 },
        { id: 'prac-hw-m2', title: 'Automated Test Rig & SCPI Instrument Drills', category: 'Technical Challenges', description: 'Write Python scripts communicating with oscilloscopes and power supplies via SCPI.', questionCount: 12 },
      ],
      interviewTopics: [
        {
          id: 'int-hw-m1',
          topic: 'High-Speed PCB Design & Electromagnetic Compatibility',
          category: 'System Design',
          questionCount: 3,
          keyQuestions: [
            'How do you handle signal return paths when a high-speed trace must cross a split ground plane?',
            'What design techniques do you use to pass ESD contact discharge testing on external I/O ports?',
            'Explain how transmission line reflections occur and how series vs parallel termination mitigates them.',
          ],
        },
      ],
      readinessChecklist: [
        { id: 'chk-1', label: 'Resume Detailing Regulatory Compliance (FCC/CE) Experience', status: 'Essential', type: 'resume' },
        { id: 'chk-2', label: 'High-Speed PCB Design Portfolio with Layer Stackups', status: 'Essential', type: 'practical' },
        { id: 'chk-3', label: 'Automated Python Hardware Test Bench Script Repository', status: 'Recommended', type: 'links' },
      ],
      roadmapStageDescriptions: {
        learn: 'Deepen high-speed signal integrity, RF trace impedance, and EMC compliance design.',
        practice: 'Analyze eye diagrams, simulate high-frequency crosstalk, and build automated test scripts.',
        mentorship: 'Review RF layouts and compliance mitigation strategies with principal hardware architects.',
        prepare: 'Master technical interview rounds on signal integrity, board bring-up, and thermal design.',
        jobReady: 'Showcase complex 4–6 layer board designs, stackup documentation, and test reports.',
        opportunities: 'Target Mid-Level and Senior Hardware / Embedded Systems roles (3–5 years).',
      },
    },
    senior: {
      id: 'senior',
      label: 'Senior',
      roleTitle: 'Senior Hardware Systems Architect',
      experienceRange: '5+ yrs',
      description: 'System-level hardware architecture, safety-critical certification (ISO 26262/DO-254), SoC selection, and cross-functional leadership.',
      focusSummary: 'Master system-on-chip hardware architecture, safety-critical system compliance, thermal and power integrity, and engineering roadmap leadership.',
      expectedCompetencies: [
        'System-level hardware architecture & trade-off analysis',
        'Functional safety standards (ISO 26262 ASIL / IEC 61508)',
        'Design for Manufacturing (DFM) and Design for Test (DFT) at scale',
        'Vendor component qualification & supply chain resilience',
        'Cross-discipline technical leadership across mechanical, firmware, and software',
      ],
      responsibilities: [
        'Architect complete hardware platforms from initial product requirements to mass production.',
        'Define functional safety architectures and failure mode effects analyses (FMEA).',
        'Partner with contract manufacturers (CM) to transition designs into high-volume manufacturing.',
        'Mentor hardware, firmware, and validation engineers across product divisions.',
      ],
      practicalWorkTitle: 'Labs, Circuits & Simulations',
      practicalWorkDescription: 'Author system architecture specifications, FMEA safety assessments, and mass-production DFM packages.',
      skillGroups: {
        mustKnow: [
          { name: 'Hardware System Architecture', level: 'EXPERT', importance: 'MUST_KNOW', description: 'SoC selection, power budget modeling, bus architectures, and subsystem partitioning.' },
          { name: 'Functional Safety & FMEA', level: 'EXPERT', importance: 'MUST_KNOW', description: 'Hazard analysis, single-point fault metrics, redundancy design, and ISO 26262.' },
          { name: 'DFM & High-Volume Production', level: 'ADVANCED', importance: 'MUST_KNOW', description: 'Panelization, ICT test fixtures, automated optical inspection (AOI), and yield optimization.' },
        ],
        goodToKnow: [
          { name: 'Thermal & Power Integrity', level: 'ADVANCED', importance: 'GOOD_TO_KNOW', description: 'PDN impedance modeling, DC-DC phase design, and heat dissipation modeling.' },
        ],
        advanced: [
          { name: 'ASIC / FPGA System Integration', level: 'ADVANCED', importance: 'ADVANCED', description: 'High-speed SerDes, PCIe interfaces, and heterogeneous compute architectures.' },
        ],
      },
      learningPhases: [
        {
          phaseNumber: '01',
          title: 'SYSTEM ARCHITECTURE & FUNCTIONAL SAFETY',
          subtitle: 'Enterprise Hardware Architecture',
          description: 'Architect mission-critical hardware platforms compliant with international safety standards.',
          topics: ['FMEA risk analysis', 'Hardware fault tolerance & voting logic', 'High-volume DFM/DFT test fixtures', 'Supply chain second-sourcing'],
          skills: ['Hardware System Architecture', 'Functional Safety & FMEA', 'DFM & High-Volume Production'],
        },
        {
          phaseNumber: '02',
          title: 'HIGH-VOLUME DFM & POWER INTEGRITY',
          subtitle: 'Manufacturing & Silicon Integration',
          description: 'Optimize printed circuit boards for high-yield surface-mount manufacturing and power delivery networks.',
          topics: ['Power Distribution Network (PDN) impedance design', 'Panelization & bed-of-nails in-circuit test (ICT)', 'Design for Assembly (DFA) yield optimization', 'Second-source component qualification'],
          skills: ['DFM & High-Volume Production', 'Thermal & Power Integrity'],
        },
      ],
      practicalWork: [
        {
          id: 'p-hw-s1',
          title: 'Safety-Critical Dual-Redundant Automotive / Industrial Controller',
          difficulty: 'Advanced',
          skillsRequired: ['Hardware System Architecture', 'Functional Safety & FMEA', 'DFM & High-Volume Production'],
          description: 'Architect a dual-lockstep microcontroller system with isolated power rails, hardware watchdog circuits, and comprehensive FMEA report.',
          expectedOutcome: 'Complete architecture specification, schematic blueprint, and ISO 26262 compliance analysis.',
        },
      ],
      certifications: [
        { id: 'cert-hw-incose-csep', name: 'INCOSE Certified Systems Engineering Professional (CSEP)', issuingOrganization: 'INCOSE', level: 'Advanced' },
      ],
      practiceAreas: [
        { id: 'prac-hw-s1', title: 'System-Level Hardware Architecture Loops', category: 'Scenario Questions', description: 'Architect battery-powered autonomous systems and high-reliability industrial controllers.', questionCount: 16 },
        { id: 'prac-hw-s2', title: 'High-Volume Production Yield Optimization', category: 'Scenario Questions', description: 'Diagnose intermittent solder bridge and component failure trends on a factory SMT line.', questionCount: 12 },
      ],
      interviewTopics: [
        {
          id: 'int-hw-s1',
          topic: 'System Architecture & High-Volume Manufacturing',
          category: 'System Design',
          questionCount: 3,
          keyQuestions: [
            'How do you architect a safety-critical system to safely transition into a defined fail-safe state during single-point hardware failure?',
            'Walk through your component selection and thermal design process for an passively cooled outdoor enclosure.',
            'What strategies do you employ when designing for testability (DFT) on high-volume production lines producing 100,000 units/month?',
          ],
        },
      ],
      readinessChecklist: [
        { id: 'chk-1', label: 'Executive Hardware Leadership Resume Showing Products in Mass Production', status: 'Essential', type: 'resume' },
        { id: 'chk-2', label: 'Functional Safety (FMEA) or System Architecture Specification', status: 'Essential', type: 'practical' },
        { id: 'chk-3', label: 'Demonstrated High-Volume DFM / Yield Improvement Case Study', status: 'Essential', type: 'practical' },
      ],
      roadmapStageDescriptions: {
        learn: 'Master system-level hardware architecture, functional safety (ISO 26262), and DFM.',
        practice: 'Lead architecture reviews, FMEA failure simulations, and manufacturing test strategies.',
        mentorship: 'Engage with VP-level engineering leadership on hardware roadmaps and vendor strategy.',
        prepare: 'Master executive-level hardware architecture interviews and cross-discipline evaluations.',
        jobReady: 'Showcase products taken through mass manufacturing, patent filings, and reliability metrics.',
        opportunities: 'Connect with Principal Hardware Engineer and Director of Hardware Architecture roles.',
      },
    },
  },



  // ==========================================
  // DATA ANALYST
  // ==========================================
  'data-analyst': {
    entry: {
      id: 'entry',
      label: 'Beginner / Entry Level',
      roleTitle: 'Associate Data Analyst',
      experienceRange: '0–1 yrs',
      description: 'Focuses on relational database querying with SQL, spreadsheet data cleaning, exploratory analysis, and building interactive charts in Power BI or Excel.',
      focusSummary: 'Master relational SQL querying (SELECT, WHERE, GROUP BY, basic JOINs), Excel data transformation (XLOOKUP, PivotTables), and introductory business dashboard creation.',
      expectedCompetencies: [
        'Writing SQL queries to extract, filter, group, and aggregate tabular data',
        'Advanced spreadsheet data cleaning, XLOOKUP, and PivotTable summaries',
        'Exploratory data analysis (EDA) and descriptive statistics (mean, median, standard deviation)',
        'Building clear, interactive charts and KPI tiles in Power BI or Tableau',
        'Translating operational business questions into structured database queries',
      ],
      responsibilities: [
        'Write SQL queries to extract raw transactional and operational records from databases.',
        'Clean, normalize, and validate messy CSV and spreadsheet data for reporting accuracy.',
        'Build and maintain recurring team operational dashboards in Power BI or Tableau.',
        'Document data definitions, field calculations, and metric formulas in data dictionaries.',
      ],
      practicalWorkTitle: 'Applied Analytics, Dashboards & Datasets',
      practicalWorkDescription: 'Clean real-world transactional datasets, extract relational metrics via SQL, and build interactive KPI dashboards.',
      skillGroups: {
        mustKnow: [
          { name: 'SQL Queries & Joins', level: 'BEGINNER', importance: 'MUST_KNOW', description: 'SELECT statements, WHERE filters, GROUP BY aggregations, and INNER/LEFT joins.' },
          { name: 'Excel & Spreadsheets', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'XLOOKUP, INDEX/MATCH, PivotTables, and conditional logic.' },
          { name: 'Power BI / Tableau Basics', level: 'BEGINNER', importance: 'MUST_KNOW', description: 'Connecting data sources, building bar/line charts, and slicer interactions.' },
          { name: 'Data Cleaning & Validation', level: 'BEGINNER', importance: 'MUST_KNOW', description: 'Handling nulls, duplicate deduplication, text parsing, and type casting.' },
        ],
        goodToKnow: [
          { name: 'Python for Data Analysis (Pandas)', level: 'BEGINNER', importance: 'GOOD_TO_KNOW', description: 'Reading CSVs, DataFrame filtering, and summary statistics.' },
          { name: 'Descriptive Statistics', level: 'BEGINNER', importance: 'GOOD_TO_KNOW', description: 'Distributions, variance, percentiles, and outlier detection.' },
        ],
        advanced: [
          { name: 'Data Storytelling & Presentation', level: 'BEGINNER', importance: 'ADVANCED', description: 'Executive summary formatting, visual hierarchy, and actionable insights.' },
        ],
      },
      learningPhases: [
        {
          phaseNumber: '01',
          title: 'SQL & RELATIONAL QUERYING',
          subtitle: 'Database Extraction Fundamentals',
          description: 'Master writing queries to extract, filter, and summarize transactional database tables.',
          topics: ['Relational schema models', 'WHERE, AND, OR conditions', 'GROUP BY and HAVING clauses', 'INNER and LEFT OUTER joins'],
          skills: ['SQL Queries & Joins', 'Data Cleaning & Validation'],
          recommendedCourse: { id: 'c-da-e1', title: 'SQL Fundamentals for Data Analytics', provider: 'PATHWAY Academy', level: 'Beginner', available: true },
        },
        {
          phaseNumber: '02',
          title: 'DATA WRANGLING & SPREADSHEET ANALYSIS',
          subtitle: 'Cleaning & Preparing Data',
          description: 'Transform raw, imperfect business datasets into reliable analytical tables.',
          topics: ['Excel XLOOKUP & nested formulas', 'PivotTable data summaries', 'Text and date cleaning functions', 'Basic Pandas DataFrame operations'],
          skills: ['Excel & Spreadsheets', 'Python for Data Analysis (Pandas)'],
        },
        {
          phaseNumber: '03',
          title: 'BUSINESS DASHBOARD CREATION',
          subtitle: 'Power BI & Visual Storytelling',
          description: 'Build interactive dashboards that clearly communicate business KPI performance.',
          topics: ['Data modeling in Power BI', 'Building intuitive charts & KPI cards', 'Interactive slicers and drill-downs', 'Publishing and sharing reports'],
          skills: ['Power BI / Tableau Basics', 'Data Storytelling & Presentation'],
        },
      ],
      practicalWork: [
        {
          id: 'p-da-e1',
          title: 'E-Commerce Sales Performance Dashboard',
          difficulty: 'Beginner',
          skillsRequired: ['Excel & Spreadsheets', 'Power BI / Tableau Basics'],
          description: 'Clean an unformatted multi-year retail transaction dataset, compute sales margins and monthly revenue, and build an interactive Power BI dashboard featuring executive KPI tiles and regional breakdown slicers.',
          expectedOutcome: 'Published interactive dashboard with documented data cleaning steps and business takeaways.',
        },
        {
          id: 'p-da-e2',
          title: 'Customer Demographic & Retention SQL Query Suite',
          difficulty: 'Beginner',
          skillsRequired: ['SQL Queries & Joins', 'Data Cleaning & Validation'],
          description: 'Write a suite of SQL queries on a relational database calculating monthly active users, customer cohort counts, order frequency distributions, and identifying churn risk accounts.',
          expectedOutcome: 'Well-commented SQL script repository with schema diagrams and sample query outputs.',
        },
      ],
      certifications: [
        { id: 'cert-da-google', name: 'Google Data Analytics Professional Certificate', issuingOrganization: 'Google', level: 'Foundation' },
        { id: 'cert-da-pl300-assoc', name: 'Microsoft Certified: Power BI Data Analyst Associate (PL-300)', issuingOrganization: 'Microsoft', level: 'Foundation' },
      ],
      practiceAreas: [
        { id: 'prac-da-e1', title: 'SQL Aggregations & Multi-Table Joins', category: 'Technical Challenges', description: 'Solve 15 real-world queries calculating sales metrics and customer counts.', questionCount: 15 },
        { id: 'prac-da-e2', title: 'Excel Nested Formulas & Pivot Challenges', category: 'Technical Challenges', description: 'Clean messy text fields and calculate weighted margins in spreadsheets.', questionCount: 12 },
        { id: 'prac-da-e3', title: 'Metric Anomaly Root Cause Analysis', category: 'Scenario Questions', description: 'Diagnose why a reported daily active user metric dropped unexpectedly.', questionCount: 10 },
      ],
      interviewTopics: [
        {
          id: 'int-da-e1',
          topic: 'SQL Querying & Database Basics',
          category: 'Technical',
          questionCount: 3,
          keyQuestions: [
            'What is the fundamental difference between the WHERE and HAVING clauses in SQL?',
            'When would you choose a LEFT JOIN instead of an INNER JOIN, and what happens to non-matching records?',
            'How do you identify and remove duplicate rows in a database table using SQL?',
          ],
        },
        {
          id: 'int-da-e2',
          topic: 'Analytical Mindset & Metric Interpretation',
          category: 'Role Specific',
          questionCount: 2,
          keyQuestions: [
            'If revenue increased by 20% this month but net profit decreased by 5%, what analytical steps would you take to investigate why?',
            'How do you determine whether a spike in daily traffic is a genuine user trend versus a data tracking error?',
          ],
        },
      ],
      readinessChecklist: [
        { id: 'chk-1', label: 'Analytics Resume Highlighting SQL, Excel & Dashboard Portfolio Projects', status: 'Essential', type: 'resume' },
        { id: 'chk-2', label: 'Interactive Public Power BI or Tableau Dashboard Link with Real Business Context', status: 'Essential', type: 'practical' },
        { id: 'chk-3', label: 'Documented SQL Query Repository Solving E-Commerce or Business Scenarios', status: 'Essential', type: 'practical' },
      ],
      roadmapStageDescriptions: {
        learn: 'Master relational SQL queries, spreadsheet cleaning, descriptive statistics, and Power BI dashboarding.',
        practice: 'Write multi-table SQL queries, build dynamic PivotTables, and troubleshoot data discrepancies.',
        mentorship: 'Connect with Senior Data Analysts to review portfolio dashboards and analytical presentation techniques.',
        prepare: 'Master entry-level data analytics interview questions on SQL joins, aggregations, and business metrics.',
        jobReady: 'Publish a clean portfolio dashboard and well-documented SQL scripts answering key business questions.',
        opportunities: 'Target Junior Data Analyst, BI Assistant, and Operations Reporting Analyst roles (0–1 years).',
      },
    },

    junior: {
      id: 'junior',
      label: 'Junior',
      roleTitle: 'Junior Data Analyst',
      experienceRange: '1–3 yrs',
      description: 'Focuses on advanced SQL with window functions and Common Table Expressions (CTEs), Python data analysis with Pandas, cohort retention, and dimensional modeling.',
      focusSummary: 'Write advanced analytical SQL (Window functions: ROW_NUMBER, RANK, LAG/LEAD, CTEs), automate ETL scripts with Python, conduct customer retention analyses, and model dimensional data.',
      expectedCompetencies: [
        'Advanced SQL (Window functions, CTEs, self-joins, query optimization)',
        'Python data analysis stack (Pandas, NumPy, Matplotlib/Seaborn)',
        'Customer cohort retention tracking, churn rate calculations, and funnel analytics',
        'Dimensional data modeling (Fact and Dimension tables, Star schemas)',
        'Designing department-level operational KPI dashboards in Power BI or Tableau',
      ],
      responsibilities: [
        'Write optimized, scalable SQL queries on cloud data warehouses (BigQuery, Snowflake, PostgreSQL).',
        'Develop Python scripts to automate routine data extraction, transformation, and validation tasks.',
        'Perform cohort analysis and funnel conversion tracking to support product and marketing teams.',
        'Present analytical findings, trend forecasts, and actionable recommendations directly to stakeholders.',
      ],
      practicalWorkTitle: 'Applied Analytics, Dashboards & Datasets',
      practicalWorkDescription: 'Perform customer cohort retention analysis, author dimensional data models, and build automated Python ETL pipelines.',
      skillGroups: {
        mustKnow: [
          { name: 'Advanced SQL & CTEs', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'Window functions (ROW_NUMBER, DENSE_RANK, LAG, LEAD), CTEs, and index optimization.' },
          { name: 'Python (Pandas & NumPy)', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'Vectorized DataFrame operations, groupby transformations, and merging.' },
          { name: 'Cohort & Funnel Analysis', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'Retention curves, drop-off rates, churn metrics, and customer lifetime value (LTV).' },
          { name: 'Dimensional Data Modeling', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'Star schemas, snowflake schemas, fact tables, and slowly changing dimensions.' },
        ],
        goodToKnow: [
          { name: 'DAX & Advanced Power BI', level: 'INTERMEDIATE', importance: 'GOOD_TO_KNOW', description: 'CALCULATE, FILTER, time-intelligence functions, and relationship modeling.' },
          { name: 'Cloud Data Warehouses (BigQuery / Snowflake)', level: 'INTERMEDIATE', importance: 'GOOD_TO_KNOW', description: 'Partitioning, clustering, and cost-effective query syntax.' },
        ],
        advanced: [
          { name: 'A/B Testing Fundamentals', level: 'INTERMEDIATE', importance: 'ADVANCED', description: 'Sample sizing, p-values, hypothesis framing, and statistical significance.' },
        ],
      },
      learningPhases: [
        {
          phaseNumber: '01',
          title: 'ADVANCED SQL & ANALYTICAL FUNCTIONS',
          subtitle: 'Window Functions & Performance',
          description: 'Leverage window functions and CTEs to execute sophisticated analytical calculations.',
          topics: ['ROW_NUMBER, RANK, DENSE_RANK', 'LAG & LEAD for period-over-period metrics', 'Running totals & moving averages', 'Query execution plans & indexing'],
          skills: ['Advanced SQL & CTEs'],
          recommendedCourse: { id: 'c-da-j1', title: 'Advanced SQL and Dimensional Modeling for Analytics', provider: 'PATHWAY Academy', level: 'Intermediate', available: true },
        },
        {
          phaseNumber: '02',
          title: 'PYTHON DATA WRANGLING & AUTOMATION',
          subtitle: 'Pandas & Exploratory Analysis',
          description: 'Automate analytical workflows, clean complex datasets, and visualize statistical patterns.',
          topics: ['Pandas transformations & aggregations', 'Handling missing values and outliers', 'Exploratory data visualization with Seaborn', 'Automated data extraction scripts'],
          skills: ['Python (Pandas & NumPy)'],
        },
        {
          phaseNumber: '03',
          title: 'DIMENSIONAL MODELING & RETENTION',
          subtitle: 'Star Schemas & Cohort Analysis',
          description: 'Structure analytics-ready schemas and measure customer retention over time.',
          topics: ['Designing fact and dimension tables', 'Cohort retention matrices', 'Funnel drop-off analytics', 'Customer Lifetime Value (LTV) modeling'],
          skills: ['Cohort & Funnel Analysis', 'Dimensional Data Modeling'],
        },
      ],
      practicalWork: [
        {
          id: 'p-da-j1',
          title: 'SaaS Customer Cohort Retention & Churn Analysis',
          difficulty: 'Intermediate',
          skillsRequired: ['Advanced SQL & CTEs', 'Python (Pandas & NumPy)', 'Cohort & Funnel Analysis'],
          description: 'Perform a comprehensive cohort retention analysis on a multi-year subscription dataset using advanced SQL and Python, generating heatmap retention matrices and calculating Net Revenue Retention (NRR).',
          expectedOutcome: 'Documented Jupyter notebook with retention heatmaps, SQL query scripts, and executive summary.',
        },
        {
          id: 'p-da-j2',
          title: 'Marketing Multi-Touch Attribution Dimensional Data Model',
          difficulty: 'Intermediate',
          skillsRequired: ['Dimensional Data Modeling', 'DAX & Advanced Power BI'],
          description: 'Design a star schema data warehouse model connecting marketing touchpoints, customer sessions, and sales conversions, deployed into an interactive Power BI dashboard tracking first-touch vs last-touch ROI.',
          expectedOutcome: 'Star schema architecture diagram, SQL DDL scripts, and interactive Power BI report with DAX measures.',
        },
      ],
      certifications: [
        { id: 'cert-da-pl300', name: 'Microsoft Certified: Power BI Data Analyst Associate (PL-300)', issuingOrganization: 'Microsoft', level: 'Intermediate' },
        { id: 'cert-da-snowpro', name: 'Snowflake SnowPro Core Certification', issuingOrganization: 'Snowflake', level: 'Intermediate' },
      ],
      practiceAreas: [
        { id: 'prac-da-j1', title: 'SQL Window Function & Period-over-Period Drills', category: 'Technical Challenges', description: 'Calculate month-over-month growth, rolling 7-day averages, and customer rank.', questionCount: 15 },
        { id: 'prac-da-j2', title: 'Cohort Retention Matrix & Churn Rate Calculations', category: 'Technical Challenges', description: 'Compute customer cohort retention and annualized churn rates.', questionCount: 12 },
        { id: 'prac-da-j3', title: 'Dimensional Schema Design Scenarios', category: 'Scenario Questions', description: 'Design star schemas with fact and dimension tables for an e-commerce platform.', questionCount: 12 },
      ],
      interviewTopics: [
        {
          id: 'int-da-j1',
          topic: 'Advanced SQL & Window Functions',
          category: 'Technical',
          questionCount: 3,
          keyQuestions: [
            'What is the difference between RANK(), DENSE_RANK(), and ROW_NUMBER() in SQL?',
            'How do you write a query to find the second highest order value for each customer using window functions?',
            'How do Common Table Expressions (CTEs) improve query readability and maintainability over nested subqueries?',
          ],
        },
        {
          id: 'int-da-j2',
          topic: 'Customer Analytics & Retention Metrics',
          category: 'Role Specific',
          questionCount: 2,
          keyQuestions: [
            'How do you calculate customer churn rate, and why can calculating simple monthly averages produce misleading results?',
            'Explain how you would design a data model to support both first-touch and multi-touch marketing attribution.',
          ],
        },
      ],
      readinessChecklist: [
        { id: 'chk-1', label: 'Resume Demonstrating Advanced SQL, Python Automation, and Cohort Analysis Experience', status: 'Essential', type: 'resume' },
        { id: 'chk-2', label: 'GitHub Repository with Documented SQL Window Functions & Reusable Python Analysis Scripts', status: 'Essential', type: 'practical' },
        { id: 'chk-3', label: 'Comprehensive Cohort Retention or Marketing Attribution Case Study Write-Up', status: 'Essential', type: 'practical' },
      ],
      roadmapStageDescriptions: {
        learn: 'Master advanced SQL window functions, Python data automation, cohort analytics, and dimensional modeling.',
        practice: 'Calculate rolling averages, author cohort retention heatmaps, and design star schema data models.',
        mentorship: 'Engage with Analytics Managers to review business attribution models and stakeholder communication.',
        prepare: 'Master technical interviews on SQL window functions, execution plans, and customer retention metrics.',
        jobReady: 'Showcase advanced SQL scripts, cohort retention analyses, and dimensional schema designs.',
        opportunities: 'Target Junior and Mid Data Analyst, Business Intelligence Analyst, and Marketing Analyst roles (1–3 years).',
      },
    },

    mid: {
      id: 'mid',
      label: 'Mid-Level',
      roleTitle: 'Senior Data Analyst / Analytics Specialist',
      experienceRange: '3–5 yrs',
      description: 'Focuses on analytics engineering with dbt, rigorous A/B experiment evaluation, data warehouse architecture, and executive stakeholder partnership.',
      focusSummary: 'Build version-controlled data transformation pipelines using dbt, design and evaluate statistically sound A/B tests, lead data governance, and partner with senior leadership.',
      expectedCompetencies: [
        'Data transformation and analytics engineering using dbt (data build tool)',
        'Experimental design, A/B test power analysis, hypothesis testing, and statistical significance',
        'Cloud data warehouse optimization and query cost management (Snowflake / BigQuery)',
        'Partnering with Director and VP stakeholders to define strategic measurement frameworks',
        'Automated data quality testing, anomaly detection, and schema change monitoring',
      ],
      responsibilities: [
        'Author maintainable, version-controlled dbt models transforming raw events into clean marts.',
        'Design A/B test experiments, compute sample sizes, and evaluate statistical confidence for product launches.',
        'Partner with product, sales, and finance executives to translate business strategy into metrics driver trees.',
        'Implement automated data quality assertions and monitor data warehouse compute spend and query latency.',
      ],
      practicalWorkTitle: 'Applied Analytics, Dashboards & Datasets',
      practicalWorkDescription: 'Build modular dbt analytics engineering pipelines, evaluate live A/B experiment results, and model metrics trees.',
      skillGroups: {
        mustKnow: [
          { name: 'dbt (Data Build Tool)', level: 'ADVANCED', importance: 'MUST_KNOW', description: 'Staging/intermediate/marts layering, jinja macros, incremental models, and schema tests.' },
          { name: 'A/B Testing & Statistics', level: 'ADVANCED', importance: 'MUST_KNOW', description: 'Hypothesis testing, p-values, sample sizing, power analysis, and experiment bias detection.' },
          { name: 'Warehouse Optimization', level: 'ADVANCED', importance: 'MUST_KNOW', description: 'Partitioning, clustering, materialization strategies, and cost-per-query governance.' },
          { name: 'Executive Storytelling', level: 'ADVANCED', importance: 'MUST_KNOW', description: 'Metric driver trees, strategic business reviews, and executive visual communication.' },
        ],
        goodToKnow: [
          { name: 'Data Pipeline Orchestration (Airflow)', level: 'INTERMEDIATE', importance: 'GOOD_TO_KNOW', description: 'DAG scheduling, dependency management, and retry handling.' },
          { name: 'Reverse ETL & CDPs', level: 'INTERMEDIATE', importance: 'GOOD_TO_KNOW', description: 'Syncing warehouse models into CRM and marketing tools (Census, Hightouch).' },
        ],
        advanced: [
          { name: 'Predictive Forecasting (Prophet / ARIMA)', level: 'ADVANCED', importance: 'ADVANCED', description: 'Time-series forecasting, seasonality decomposition, and trend analysis.' },
        ],
      },
      learningPhases: [
        {
          phaseNumber: '01',
          title: 'ANALYTICS ENGINEERING WITH DBT',
          subtitle: 'Modular Data Modeling & Testing',
          description: 'Transform raw data into trusted, documented, and tested dimensional data marts.',
          topics: ['dbt project structure (staging, intermediate, marts)', 'Jinja templating & custom macros', 'Automated data tests (unique, not_null, accepted_values)', 'Incremental model materializations'],
          skills: ['dbt (Data Build Tool)', 'Warehouse Optimization'],
          recommendedCourse: { id: 'c-da-m1', title: 'Analytics Engineering with dbt and Snowflake', provider: 'PATHWAY Academy', level: 'Intermediate', available: true },
        },
        {
          phaseNumber: '02',
          title: 'EXPERIMENTAL DESIGN & A/B TESTING',
          subtitle: 'Statistical Rigor & Business Decisioning',
          description: 'Design and evaluate rigorous product experiments that drive sound business decisions.',
          topics: ['Hypothesis formulation & primary metrics', 'Sample size calculation & power analysis', 'Evaluating p-values & confidence intervals', 'Detecting sample ratio mismatch (SRM) and novelty effects'],
          skills: ['A/B Testing & Statistics'],
        },
        {
          phaseNumber: '03',
          title: 'STRATEGIC METRIC GOVERNANCE & STORYTELLING',
          subtitle: 'Executive Partnership & Driver Trees',
          description: 'Partner with leadership to build metric driver trees and deliver data-backed strategy.',
          topics: ['Metric tree decomposition', 'Revenue driver modeling', 'Executive presentation design', 'Data governance & cataloging'],
          skills: ['Executive Storytelling', 'Predictive Forecasting (Prophet / ARIMA)'],
        },
      ],
      practicalWork: [
        {
          id: 'p-da-m1',
          title: 'Production dbt Analytics Warehouse Model with Automated Tests',
          difficulty: 'Advanced',
          skillsRequired: ['dbt (Data Build Tool)', 'Warehouse Optimization'],
          description: 'Construct a complete dbt project transforming messy clickstream and transaction logs into analytics-ready customer marts, with incremental models, custom Jinja macros, and automated schema tests.',
          expectedOutcome: 'Tested dbt repository with generated documentation, lineage graphs, and validated test execution logs.',
        },
        {
          id: 'p-da-m2',
          title: 'End-to-End A/B Experimentation Analysis & Decision Framework',
          difficulty: 'Advanced',
          skillsRequired: ['A/B Testing & Statistics', 'Executive Storytelling'],
          description: 'Evaluate an enterprise pricing experiment: calculate sample size, check for Sample Ratio Mismatch (SRM), compute statistical significance across conversion and revenue metrics, and author an executive recommendation.',
          expectedOutcome: 'Comprehensive experimentation report detailing statistical methodology, confidence intervals, and strategic recommendations.',
        },
      ],
      certifications: [
        { id: 'cert-da-dbt-dev', name: 'dbt Certified Developer', issuingOrganization: 'dbt Labs', level: 'Advanced' },
        { id: 'cert-da-aws-data', name: 'AWS Certified Data Analytics – Specialty', issuingOrganization: 'Amazon Web Services', level: 'Advanced' },
      ],
      practiceAreas: [
        { id: 'prac-da-m1', title: 'A/B Test Statistical Significance & Sample Sizing', category: 'Technical Challenges', description: 'Calculate minimum detectable effects (MDE), sample sizes, and p-values.', questionCount: 15 },
        { id: 'prac-da-m2', title: 'dbt Incremental Model & Macro Optimization', category: 'Technical Challenges', description: 'Author optimized dbt Jinja macros and configure incremental materializations.', questionCount: 14 },
        { id: 'prac-da-m3', title: 'Metric Tree Decomposition & Root-Cause Scenarios', category: 'Scenario Questions', description: 'Decompose revenue drop into conversion, traffic, and average order value drivers.', questionCount: 12 },
      ],
      interviewTopics: [
        {
          id: 'int-da-m1',
          topic: 'Experimental Design & Statistical Pitfalls',
          category: 'System Design',
          questionCount: 3,
          keyQuestions: [
            'What is Sample Ratio Mismatch (SRM) in an A/B test, what causes it, and why does it invalidate results?',
            'How do you handle multiple testing problems (e.g., peeking at experiment data early or testing multiple variants)?',
            'Explain Simpson\'s Paradox with a concrete e-commerce or product analytics example.',
          ],
        },
        {
          id: 'int-da-m2',
          topic: 'Analytics Engineering & Governance',
          category: 'Role Specific',
          questionCount: 2,
          keyQuestions: [
            'How do you architect dbt layers (staging, intermediate, and marts) to balance DRY modularity with warehouse query performance?',
            'How do you manage breaking schema changes in production upstream databases when downstream BI reports depend on them?',
          ],
        },
      ],
      readinessChecklist: [
        { id: 'chk-1', label: 'Senior Analyst Resume Showcasing dbt Analytics Engineering, A/B Testing & Executive Partnership', status: 'Essential', type: 'resume' },
        { id: 'chk-2', label: 'Production dbt Project Repository Featuring Lineage, Tests, and Documentation', status: 'Essential', type: 'practical' },
        { id: 'chk-3', label: 'Comprehensive A/B Experimentation Analysis Case Study Demonstrating Statistical Rigor', status: 'Essential', type: 'practical' },
      ],
      roadmapStageDescriptions: {
        learn: 'Master analytics engineering with dbt, rigorous experimental design (A/B testing), and executive communication.',
        practice: 'Build production dbt marts, calculate sample sizes and p-values, and conduct metric driver tree analyses.',
        mentorship: 'Meet with Lead Analytics Engineers and Heads of Data on scaling dbt projects and leading experiment reviews.',
        prepare: 'Master technical interviews on experimental pitfalls (SRM, peeking), dbt architecture, and warehouse performance.',
        jobReady: 'Showcase version-controlled dbt repositories, documented A/B test reports, and executive business recommendations.',
        opportunities: 'Target Senior Data Analyst, Analytics Engineer, and Product Analytics Specialist roles (3–5 years).',
      },
    },

    senior: {
      id: 'senior',
      label: 'Senior',
      roleTitle: 'Principal Analytics Lead / Head of BI',
      experienceRange: '5+ yrs',
      description: 'Focuses on enterprise data strategy, semantic layer architecture, company-wide KPI governance, and advising C-suite executives on strategic capital allocation.',
      focusSummary: 'Establish corporate data strategy, design unified semantic layers, govern company-wide metric standards, and advise C-suite leadership on business investments.',
      expectedCompetencies: [
        'Enterprise data strategy, semantic layer architecture (Cube, Looker, MetricFlow)',
        'Executive C-suite partnership, Board of Directors presentations, and financial modeling',
        'Data governance, data contracts, and master data management (MDM) frameworks',
        'Building, mentoring, and leading high-performing teams of analysts and analytics engineers',
        'Company-wide KPI standardization, single-source-of-truth governance, and driver trees',
      ],
      responsibilities: [
        'Author the corporate data strategy aligning analytics initiatives with enterprise revenue goals.',
        'Establish and govern the enterprise semantic layer guaranteeing consistent metric definitions across divisions.',
        'Lead, mentor, and scale a high-performing analytics and business intelligence organization.',
        'Present quarterly business reviews, market opportunity analyses, and data strategy updates to C-level executives.',
      ],
      practicalWorkTitle: 'Applied Analytics, Dashboards & Datasets',
      practicalWorkDescription: 'Design enterprise semantic layers, corporate data strategies, and company-wide metric governance frameworks.',
      skillGroups: {
        mustKnow: [
          { name: 'Enterprise Data Strategy', level: 'EXPERT', importance: 'MUST_KNOW', description: 'Data roadmaps, Modern Data Stack architecture, and aligning analytics with corporate P&L.' },
          { name: 'Semantic Layer Architecture', level: 'EXPERT', importance: 'MUST_KNOW', description: 'Decoupled metrics layers, code-defined dimensions, and universal access controls.' },
          { name: 'KPI Governance & Standardization', level: 'EXPERT', importance: 'MUST_KNOW', description: 'Data contracts, master metric dictionaries, and resolving cross-functional metric discrepancies.' },
          { name: 'Executive Leadership & Mentoring', level: 'ADVANCED', importance: 'MUST_KNOW', description: 'Team topology design, hiring, career development, and C-suite influence.' },
        ],
        goodToKnow: [
          { name: 'Modern Data Stack Evaluation', level: 'ADVANCED', importance: 'GOOD_TO_KNOW', description: 'Vendor selection, compute cost forecasting, and total cost of ownership (TCO) modeling.' },
          { name: 'Data Privacy & Regulatory Compliance', level: 'ADVANCED', importance: 'GOOD_TO_KNOW', description: 'GDPR, CCPA, data masking, and role-based access control policies.' },
        ],
        advanced: [
          { name: 'Capital Allocation & Commercial Modeling', level: 'ADVANCED', importance: 'ADVANCED', description: 'Financial unit economics, customer acquisition modeling, and market expansion forecasting.' },
        ],
      },
      learningPhases: [
        {
          phaseNumber: '01',
          title: 'SEMANTIC LAYERS & CODE-DEFINED METRICS',
          subtitle: 'Decoupled Metrics Architecture',
          description: 'Design a unified semantic layer serving dashboards, operational apps, and ad-hoc analytics.',
          topics: ['Decoupled metric layer design (MetricFlow / Cube)', 'Single-source-of-truth definitions for ARR and Churn', 'Row- and column-level security policies', 'Enabling self-service analytics safely'],
          skills: ['Semantic Layer Architecture', 'KPI Governance & Standardization'],
        },
        {
          phaseNumber: '02',
          title: 'ENTERPRISE DATA GOVERNANCE & DATA CONTRACTS',
          subtitle: 'Quality & Master Data Management',
          description: 'Implement automated data contracts and establish organizational data quality standards.',
          topics: ['Data contracts between engineering and analytics', 'Automated data lineage and observability', 'Master Data Management (MDM) workflows', 'Data privacy compliance (GDPR/CCPA)'],
          skills: ['Enterprise Data Strategy', 'Data Privacy & Regulatory Compliance'],
        },
        {
          phaseNumber: '03',
          title: 'EXECUTIVE LEADERSHIP & COMMERCIAL STRATEGY',
          subtitle: 'C-Suite Partnership & Org Design',
          description: 'Lead high-performing analytics teams and influence corporate capital allocation.',
          topics: ['Structuring analytics teams (centralized vs hub-and-spoke)', 'Measuring the commercial ROI of data investments', 'Authoring C-suite strategic memos', 'Mentoring analytics staff and managers'],
          skills: ['Executive Leadership & Mentoring', 'Capital Allocation & Commercial Modeling'],
        },
      ],
      practicalWork: [
        {
          id: 'p-da-s1',
          title: 'Enterprise Universal Semantic Layer Architecture Blueprint',
          difficulty: 'Advanced',
          skillsRequired: ['Semantic Layer Architecture', 'KPI Governance & Standardization'],
          description: 'Design and document an enterprise semantic layer serving BI tools, finance reporting, and automated operations, standardizing business definitions for Net Revenue Retention, Customer Acquisition Cost, and Gross Margin.',
          expectedOutcome: 'Comprehensive semantic model specification, governance policy document, and access control matrix.',
        },
        {
          id: 'p-da-s2',
          title: 'Corporate Data Strategy & Modernization Whitepaper',
          difficulty: 'Advanced',
          skillsRequired: ['Enterprise Data Strategy', 'Executive Leadership & Mentoring'],
          description: 'Author a 3-year enterprise data strategy whitepaper evaluating modern data stack total cost of ownership (TCO), organizational team topology, data contract governance, and expected revenue impact.',
          expectedOutcome: 'Executive whitepaper, team hiring roadmap, and vendor TCO financial spreadsheet ready for C-suite review.',
        },
      ],
      certifications: [
        { id: 'cert-da-cap', name: 'Certified Analytics Professional (CAP)', issuingOrganization: 'INFORMS', level: 'Advanced' },
        { id: 'cert-da-gcp-pde', name: 'Google Cloud Certified Professional Data Engineer', issuingOrganization: 'Google Cloud', level: 'Advanced' },
      ],
      practiceAreas: [
        { id: 'prac-da-s1', title: 'Board-Level Metric Discrepancy Reconciliation', category: 'Scenario Questions', description: 'Reconcile conflicting ARR figures reported by Sales and Finance before a board meeting.', questionCount: 14 },
        { id: 'prac-da-s2', title: 'Modern Data Stack TCO & Vendor Selection Scenario', category: 'Scenario Questions', description: 'Evaluate vendor trade-offs between Snowflake, Databricks, and BigQuery for an enterprise.', questionCount: 12 },
        { id: 'prac-da-s3', title: 'Cross-Functional Data Governance Conflict Resolution', category: 'Scenario Questions', description: 'Align product engineering and business intelligence teams on data contract enforcement.', questionCount: 10 },
      ],
      interviewTopics: [
        {
          id: 'int-da-s1',
          topic: 'Data Strategy & Organizational Alignment',
          category: 'System Design',
          questionCount: 3,
          keyQuestions: [
            'How do you resolve fundamental disagreements between executive leadership regarding metric definitions like Customer Churn or ARR?',
            'What are the advantages and drawbacks of a centralized vs embedded (hub-and-spoke) analytics team structure as a company scales from 100 to 1,000 employees?',
            'How do you design an enterprise semantic layer that prevents duplicate SQL logic across disparate BI and reporting tools?',
          ],
        },
        {
          id: 'int-da-s2',
          topic: 'Commercial Impact & Data Governance',
          category: 'Role Specific',
          questionCount: 2,
          keyQuestions: [
            'How do you measure and justify the financial ROI of investments in data infrastructure and analytics engineering?',
            'How do you implement data contracts between upstream software engineering teams and downstream analytics without slowing down feature releases?',
          ],
        },
      ],
      readinessChecklist: [
        { id: 'chk-1', label: 'Executive Analytics Leadership Resume Highlighting Strategic ROI, Team Building & Governance', status: 'Essential', type: 'resume' },
        { id: 'chk-2', label: 'Enterprise Data Strategy Whitepaper or Universal Semantic Layer Architecture Blueprint', status: 'Essential', type: 'practical' },
        { id: 'chk-3', label: 'Proven Track Record Leading Analytics Teams and Establishing Cross-Functional Data Standards', status: 'Essential', type: 'experience' },
      ],
      roadmapStageDescriptions: {
        learn: 'Master enterprise data strategy, semantic layer architecture, and company-wide metric governance.',
        practice: 'Author strategic data whitepapers, resolve executive metric discrepancies, and evaluate modern data stack TCO.',
        mentorship: 'Engage with Chief Data Officers and VP of Analytics mentors on executive influence and organizational design.',
        prepare: 'Master executive-level analytics interviews on team topologies, semantic layers, and commercial strategy.',
        jobReady: 'Showcase enterprise data strategy blueprints, semantic layer models, and team leadership case studies.',
        opportunities: 'Connect with Principal Analytics Lead, Director of Business Intelligence, and VP of Data roles (5+ years).',
      },
    },
  },

  // ==========================================
  // DATA SCIENTIST
  // ==========================================
  'data-scientist': {
    entry: {
      id: 'entry',
      label: 'Beginner / Entry Level',
      roleTitle: 'Associate Data Scientist',
      experienceRange: '0–1 yrs',
      description: 'Focuses on Python scientific computing (NumPy, Pandas), applied probability and statistics, exploratory data analysis, and baseline supervised ML models in Scikit-Learn.',
      focusSummary: 'Master the Python scientific stack, statistical hypothesis testing (t-tests, ANOVA), baseline classification/regression models, and metric evaluation (ROC-AUC, Precision, Recall).',
      expectedCompetencies: [
        'Python scientific stack fluency (NumPy, Pandas, Matplotlib, Seaborn)',
        'Probability distributions, hypothesis testing (t-tests, chi-squared, ANOVA)',
        'Supervised learning fundamentals (Linear/Logistic Regression, Decision Trees)',
        'Model evaluation metrics (Accuracy, Precision, Recall, F1-Score, ROC-AUC)',
        'Feature preprocessing (Missing value imputation, One-Hot Encoding, StandardScaler)',
      ],
      responsibilities: [
        'Explore, clean, and preprocess raw tabular datasets for machine learning model training.',
        'Train, evaluate, and benchmark baseline regression and classification models using Scikit-Learn.',
        'Conduct statistical hypothesis tests to validate experimental assumptions and data patterns.',
        'Document model evaluation metrics, feature importance, and cross-validation results in technical reports.',
      ],
      practicalWorkTitle: 'Machine Learning Labs, Models & Experiments',
      practicalWorkDescription: 'Perform exploratory data analysis, engineer feature pipelines, and train baseline supervised ML models.',
      skillGroups: {
        mustKnow: [
          { name: 'Python for Data Science', level: 'BEGINNER', importance: 'MUST_KNOW', description: 'NumPy array manipulation, Pandas data wrangling, and clean script writing.' },
          { name: 'Applied Statistics & Probability', level: 'BEGINNER', importance: 'MUST_KNOW', description: 'Probability distributions, p-values, hypothesis testing, and variance.' },
          { name: 'Scikit-Learn Baselines', level: 'BEGINNER', importance: 'MUST_KNOW', description: 'Linear/Logistic Regression, Decision Trees, and cross-validation splitting.' },
          { name: 'Model Evaluation Metrics', level: 'BEGINNER', importance: 'MUST_KNOW', description: 'Confusion matrices, Precision-Recall trade-offs, F1 score, and ROC-AUC curves.' },
        ],
        goodToKnow: [
          { name: 'Feature Engineering Basics', level: 'BEGINNER', importance: 'GOOD_TO_KNOW', description: 'Categorical encoding, scaling, handling class imbalance (SMOTE), and log transforms.' },
          { name: 'SQL for Feature Extraction', level: 'BEGINNER', importance: 'GOOD_TO_KNOW', description: 'Querying databases to extract training and test feature sets.' },
        ],
        advanced: [
          { name: 'Jupyter & Reproducible Workflows', level: 'BEGINNER', importance: 'ADVANCED', description: 'Reproducible seed setting, environment isolation, and notebook documentation.' },
        ],
      },
      learningPhases: [
        {
          phaseNumber: '01',
          title: 'APPLIED MATHEMATICS & PYTHON SCIENTIFIC STACK',
          subtitle: 'NumPy, Pandas & Probability Core',
          description: 'Build mathematical fluency in linear algebra, statistics, and scientific Python.',
          topics: ['Matrix operations with NumPy', 'Data exploration with Pandas & Seaborn', 'Probability distributions & Central Limit Theorem', 'Hypothesis testing & p-values'],
          skills: ['Python for Data Science', 'Applied Statistics & Probability'],
          recommendedCourse: { id: 'c-ds-e1', title: 'Mathematics and Python Foundations for Data Science', provider: 'PATHWAY Academy', level: 'Beginner', available: true },
        },
        {
          phaseNumber: '02',
          title: 'SUPERVISED MACHINE LEARNING BASICS',
          subtitle: 'Regression, Classification & Validation',
          description: 'Train baseline models, prevent data leakage, and validate model performance.',
          topics: ['Linear & Logistic regression mechanics', 'Decision Trees & entropy', 'Train/test splits & K-Fold cross-validation', 'Bias-Variance trade-off'],
          skills: ['Scikit-Learn Baselines', 'Model Evaluation Metrics'],
        },
        {
          phaseNumber: '03',
          title: 'FEATURE ENGINEERING & PIPELINES',
          subtitle: 'Preprocessing & Evaluation Rigor',
          description: 'Construct clean preprocessing pipelines and evaluate model trade-offs.',
          topics: ['Imputation strategies & scaling', 'One-Hot & Target encoding', 'Precision-Recall trade-offs', 'ROC-AUC & confusion matrix interpretation'],
          skills: ['Feature Engineering Basics', 'SQL for Feature Extraction'],
        },
      ],
      practicalWork: [
        {
          id: 'p-ds-e1',
          title: 'End-to-End Customer Loan Default Prediction Model',
          difficulty: 'Beginner',
          skillsRequired: ['Python for Data Science', 'Scikit-Learn Baselines', 'Model Evaluation Metrics'],
          description: 'Clean an unformatted credit dataset, handle class imbalance, train Logistic Regression and Decision Tree models, and benchmark performance using ROC-AUC and Precision-Recall curves.',
          expectedOutcome: 'Well-structured Jupyter notebook with exploratory analysis, cross-validated model comparisons, and metric evaluations.',
        },
        {
          id: 'p-ds-e2',
          title: 'Residential Property Valuation Regression Pipeline',
          difficulty: 'Beginner',
          skillsRequired: ['Python for Data Science', 'Feature Engineering Basics'],
          description: 'Construct a Scikit-Learn preprocessing pipeline with numerical scaling and categorical encoding to predict property prices, diagnosing heteroskedasticity and residual errors.',
          expectedOutcome: 'Tested Python modeling pipeline with cross-validated RMSE benchmarking and feature coefficient analysis.',
        },
      ],
      certifications: [
        { id: 'cert-ds-ibm', name: 'IBM Data Science Professional Certificate', issuingOrganization: 'IBM', level: 'Foundation' },
        { id: 'cert-ds-dl-ml', name: 'DeepLearning.AI Machine Learning Specialization', issuingOrganization: 'DeepLearning.AI', level: 'Foundation' },
      ],
      practiceAreas: [
        { id: 'prac-ds-e1', title: 'Scikit-Learn Preprocessing & Cross-Validation Drills', category: 'Technical Challenges', description: 'Build leak-free Pipeline objects with ColumnTransformer and cross-validation.', questionCount: 15 },
        { id: 'prac-ds-e2', title: 'Confusion Matrix & ROC-AUC Metric Calculations', category: 'Technical Challenges', description: 'Calculate precision, recall, and false positive rates from raw probability scores.', questionCount: 12 },
        { id: 'prac-ds-e3', title: 'Hypothesis Testing & Statistical Inference Scenarios', category: 'Scenario Questions', description: 'Select and interpret two-sample t-tests and chi-squared tests on experiment data.', questionCount: 10 },
      ],
      interviewTopics: [
        {
          id: 'int-ds-e1',
          topic: 'Statistics & Machine Learning Fundamentals',
          category: 'Technical',
          questionCount: 3,
          keyQuestions: [
            'Explain the bias-variance trade-off in machine learning and how regularization (L1 vs L2) affects it.',
            'When would you optimize for Recall rather than Precision, and what is a concrete industry example of this choice?',
            'What are the core mathematical assumptions of ordinary least squares (OLS) linear regression?',
          ],
        },
        {
          id: 'int-ds-e2',
          topic: 'Feature Engineering & Data Leakage',
          category: 'Role Specific',
          questionCount: 2,
          keyQuestions: [
            'How can data leakage occur during feature scaling or imputation, and how do Scikit-Learn Pipelines prevent it?',
            'How do you address extreme class imbalance when training a classification model on fraud or medical data?',
          ],
        },
      ],
      readinessChecklist: [
        { id: 'chk-1', label: 'Data Science Resume Highlighting Statistical Modeling, ML Baselines & Validation Metrics', status: 'Essential', type: 'resume' },
        { id: 'chk-2', label: 'Clean GitHub Repository with Documented Jupyter Notebooks & Reusable Python Modeling Scripts', status: 'Essential', type: 'practical' },
        { id: 'chk-3', label: 'End-to-End Classification or Regression Case Study with Model Evaluation Write-Up', status: 'Essential', type: 'practical' },
      ],
      roadmapStageDescriptions: {
        learn: 'Master scientific Python (NumPy, Pandas), applied statistics, hypothesis testing, and baseline ML models.',
        practice: 'Build Scikit-Learn pipelines, calculate confusion matrix metrics, and diagnose linear regression residuals.',
        mentorship: 'Connect with Senior Data Scientists to discuss model evaluation rigor and scientific problem framing.',
        prepare: 'Master entry-level data science interviews on probability distributions, bias-variance trade-offs, and metrics.',
        jobReady: 'Compile documented Jupyter notebooks and verified modeling projects into a technical data science portfolio.',
        opportunities: 'Target Junior and Associate Data Scientist, Applied Analytics, and Junior ML Specialist roles (0–1 years).',
      },
    },

    junior: {
      id: 'junior',
      label: 'Junior',
      roleTitle: 'Junior Data Scientist',
      experienceRange: '1–3 yrs',
      description: 'Focuses on gradient boosting tree models (XGBoost, LightGBM), hyperparameter optimization with Optuna, feature interpretability with SHAP, and deploying models as containerized REST APIs.',
      focusSummary: 'Train high-performance tabular ensemble models (XGBoost, LightGBM), optimize hyperparameters via Bayesian search (Optuna), explain predictions using SHAP, and deploy containerized inference APIs.',
      expectedCompetencies: [
        'Ensemble tree algorithms (Random Forests, Gradient Boosting, XGBoost, LightGBM)',
        'Bayesian hyperparameter optimization using Optuna',
        'Model interpretability and feature attribution using SHAP (SHapley Additive exPlanations)',
        'Packaging trained models into containerized REST APIs using FastAPI and Docker',
        'Experiment tracking and model artifact versioning using MLflow or Weights & Biases',
      ],
      responsibilities: [
        'Train and fine-tune gradient boosting models on large tabular datasets to beat baseline heuristics.',
        'Implement automated feature selection and interpret predictions to business partners using SHAP values.',
        'Deploy trained machine learning models as sub-50ms REST APIs using FastAPI and Docker.',
        'Track hyperparameters, code commits, and model artifacts using MLflow for full reproducibility.',
      ],
      practicalWorkTitle: 'Machine Learning Labs, Models & Experiments',
      practicalWorkDescription: 'Build explainable XGBoost models with Optuna tuning, track experiments in MLflow, and deploy FastAPI inference endpoints.',
      skillGroups: {
        mustKnow: [
          { name: 'Gradient Boosting (XGBoost / LightGBM)', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'Boosting theory, loss functions, learning rate, tree depth, and early stopping.' },
          { name: 'Hyperparameter Tuning (Optuna)', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'Bayesian search, pruning unpromising trials, and objective function definition.' },
          { name: 'Model Interpretability (SHAP)', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'TreeSHAP, summary plots, force plots, and local feature attribution.' },
          { name: 'Model Deployment (FastAPI & Docker)', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'Building REST endpoints, JSON payload validation (Pydantic), and Docker containerization.' },
        ],
        goodToKnow: [
          { name: 'Experiment Tracking (MLflow)', level: 'INTERMEDIATE', importance: 'GOOD_TO_KNOW', description: 'Logging metrics, parameters, artifacts, and model registry versioning.' },
          { name: 'Unsupervised Learning (PCA / K-Means)', level: 'INTERMEDIATE', importance: 'GOOD_TO_KNOW', description: 'Dimensionality reduction, customer clustering, and elbow methods.' },
        ],
        advanced: [
          { name: 'Time-Series Forecasting', level: 'INTERMEDIATE', importance: 'ADVANCED', description: 'ARIMA, Prophet, lag features, and rolling cross-validation.' },
        ],
      },
      learningPhases: [
        {
          phaseNumber: '01',
          title: 'ENSEMBLE METHODS & GRADIENT BOOSTING',
          subtitle: 'XGBoost & LightGBM Mechanics',
          description: 'Master boosting theory, regularization parameters, and handling missing data.',
          topics: ['Boosting algorithms & residual fitting', 'XGBoost vs LightGBM architecture', 'Handling categorical features natively', 'Early stopping & learning rate schedules'],
          skills: ['Gradient Boosting (XGBoost / LightGBM)'],
          recommendedCourse: { id: 'c-ds-j1', title: 'Gradient Boosting and Advanced Tabular Machine Learning', provider: 'PATHWAY Academy', level: 'Intermediate', available: true },
        },
        {
          phaseNumber: '02',
          title: 'MODEL INTERPRETABILITY & HYPERPARAMETER TUNING',
          subtitle: 'Optuna & SHAP Explanations',
          description: 'Tune model parameters efficiently and explain complex model predictions to stakeholders.',
          topics: ['Bayesian optimization with Optuna', 'TreeSHAP mathematical intuition', 'Global vs local feature attribution', 'MLflow experiment tracking'],
          skills: ['Hyperparameter Tuning (Optuna)', 'Model Interpretability (SHAP)', 'Experiment Tracking (MLflow)'],
        },
        {
          phaseNumber: '03',
          title: 'MODEL SERVING & CONTAINERIZED INFERENCE',
          subtitle: 'FastAPI & Docker Deployment',
          description: 'Package trained models into lightweight microservices for real-time application consumption.',
          topics: ['Serializing models (Joblib, ONNX)', 'Building low-latency inference APIs with FastAPI', 'Pydantic request/response schema validation', 'Docker containerization for ML serving'],
          skills: ['Model Deployment (FastAPI & Docker)'],
        },
      ],
      practicalWork: [
        {
          id: 'p-ds-j1',
          title: 'Explainable Customer Churn Prediction Engine with SHAP & MLflow',
          difficulty: 'Intermediate',
          skillsRequired: ['Gradient Boosting (XGBoost / LightGBM)', 'Model Interpretability (SHAP)', 'Experiment Tracking (MLflow)'],
          description: 'Train an optimized LightGBM model predicting customer churn, run Bayesian hyperparameter tuning with Optuna, track metrics in MLflow, and author SHAP force plots explaining churn risk for individual users.',
          expectedOutcome: 'Trained model artifact with MLflow tracking logs, SHAP visualization plots, and executive decision memo.',
        },
        {
          id: 'p-ds-j2',
          title: 'Real-Time Fraud Scoring REST API with FastAPI & Docker',
          difficulty: 'Intermediate',
          skillsRequired: ['Model Deployment (FastAPI & Docker)', 'Gradient Boosting (XGBoost / LightGBM)'],
          description: 'Package an optimized tabular fraud scoring model into a containerized FastAPI microservice with input validation, sub-50ms latency benchmarks, and an automated health check endpoint.',
          expectedOutcome: 'Production Dockerfile, FastAPI code repository with Pydantic validation, and documented curl inference requests.',
        },
      ],
      certifications: [
        { id: 'cert-ds-aws-ml', name: 'AWS Certified Machine Learning – Specialty', issuingOrganization: 'Amazon Web Services', level: 'Intermediate' },
        { id: 'cert-ds-databricks-assoc', name: 'Databricks Certified Machine Learning Associate', issuingOrganization: 'Databricks', level: 'Intermediate' },
      ],
      practiceAreas: [
        { id: 'prac-ds-j1', title: 'Optuna Hyperparameter Objective Function Authoring', category: 'Technical Challenges', description: 'Write custom Optuna trial objectives optimizing cross-validated log-loss.', questionCount: 15 },
        { id: 'prac-ds-j2', title: 'SHAP Feature Attribution Interpretation Challenges', category: 'Technical Challenges', description: 'Deconstruct SHAP summary and dependence plots to diagnose feature interactions.', questionCount: 12 },
        { id: 'prac-ds-j3', title: 'FastAPI Low-Latency Inference Profiling', category: 'Technical Challenges', description: 'Benchmark and profile memory and latency bottlenecks in Python model serving.', questionCount: 12 },
      ],
      interviewTopics: [
        {
          id: 'int-ds-j1',
          topic: 'Tree Ensembles & Regularization',
          category: 'Technical',
          questionCount: 3,
          keyQuestions: [
            'How does Gradient Boosting differ from Random Forest bagging mathematically and computationally?',
            'How do max_depth, learning_rate, and colsample_bytree interact to prevent overfitting in XGBoost?',
            'What are SHAP values based on mathematically (Shapley values from game theory), and why are they consistent across models?',
          ],
        },
        {
          id: 'int-ds-j2',
          topic: 'Production Machine Learning Serving',
          category: 'Role Specific',
          questionCount: 2,
          keyQuestions: [
            'What strategies do you employ to minimize model inference latency in a real-time web application serving 500 requests/sec?',
            'How do you manage schema evolution between the features expected by a trained model and dynamic production database fields?',
          ],
        },
      ],
      readinessChecklist: [
        { id: 'chk-1', label: 'Resume Demonstrating XGBoost/LightGBM Tabular Models, FastAPI Serving, and MLflow', status: 'Essential', type: 'resume' },
        { id: 'chk-2', label: 'Dockerized FastAPI Machine Learning Microservice Repository with Pydantic Validation', status: 'Essential', type: 'practical' },
        { id: 'chk-3', label: 'Model Interpretability Portfolio Piece Highlighting SHAP Value Visualizations & Business Impact', status: 'Essential', type: 'practical' },
      ],
      roadmapStageDescriptions: {
        learn: 'Advance in gradient boosting algorithms, Optuna tuning, SHAP explainability, and containerized API serving.',
        practice: 'Tune XGBoost hyperparameters, interpret SHAP dependence plots, and benchmark FastAPI latency.',
        mentorship: 'Meet with Senior Data Scientists to discuss production feature engineering and model serving trade-offs.',
        prepare: 'Master technical interviews on boosting theory, tree regularization, and low-latency API architecture.',
        jobReady: 'Showcase containerized inference microservices, Optuna study logs, and explainability case studies.',
        opportunities: 'Target Junior and Mid Data Scientist, Machine Learning Engineer, and Applied Scientist roles (1–3 years).',
      },
    },

    mid: {
      id: 'mid',
      label: 'Mid-Level',
      roleTitle: 'Data Scientist / Applied ML Specialist',
      experienceRange: '3–5 yrs',
      description: 'Focuses on deep learning with PyTorch, NLP and Transformer fine-tuning (Hugging Face), automated MLOps retraining pipelines, and continuous model drift monitoring.',
      focusSummary: 'Design deep learning architectures in PyTorch, fine-tune domain-specific Transformer models, build automated MLOps retraining pipelines, and monitor for covariate/concept drift.',
      expectedCompetencies: [
        'Deep learning architecture design using PyTorch (Custom neural networks, loss functions, GPU acceleration)',
        'Applied Natural Language Processing using Hugging Face Transformers and tokenization',
        'MLOps lifecycle (Automated retraining pipelines, feature stores, model registry)',
        'Continuous production monitoring for data drift and concept drift (Evidently AI / Great Expectations)',
        'Designing online A/B testing frameworks comparing ML models against baseline heuristics',
      ],
      responsibilities: [
        'Develop and fine-tune PyTorch deep learning models for unstructured text, image, or sequence data.',
        'Construct automated continuous training (CT) pipelines triggered by performance degradation or drift.',
        'Implement online A/B testing frameworks comparing new models against baseline production heuristics.',
        'Collaborate with platform engineers to optimize model inference latency and batch scoring throughput.',
      ],
      practicalWorkTitle: 'Machine Learning Labs, Models & Experiments',
      practicalWorkDescription: 'Fine-tune Transformer models, build automated MLOps retraining pipelines, and deploy drift monitoring.',
      skillGroups: {
        mustKnow: [
          { name: 'PyTorch & Deep Learning', level: 'ADVANCED', importance: 'MUST_KNOW', description: 'Tensors, autograd, custom Dataset/DataLoader, neural network modules, and GPU training.' },
          { name: 'Transformers & NLP (Hugging Face)', level: 'ADVANCED', importance: 'MUST_KNOW', description: 'Self-attention, BERT/RoBERTa fine-tuning, tokenizers, and text classification.' },
          { name: 'MLOps & Continuous Training', level: 'ADVANCED', importance: 'MUST_KNOW', description: 'Automated retraining pipelines, model registries, and reproducible feature stores.' },
          { name: 'Model Monitoring & Drift Detection', level: 'ADVANCED', importance: 'MUST_KNOW', description: 'Evidently AI, population stability index (PSI), Wasserstein distance, and concept drift.' },
        ],
        goodToKnow: [
          { name: 'Vector Databases & Embeddings', level: 'INTERMEDIATE', importance: 'GOOD_TO_KNOW', description: 'Pinecone, Qdrant, cosine similarity, and semantic retrieval.' },
          { name: 'Distributed ML Training (Ray / PyTorch DDP)', level: 'INTERMEDIATE', importance: 'GOOD_TO_KNOW', description: 'Distributed Data Parallel (DDP), multi-GPU training, and mixed-precision (FP16).' },
        ],
        advanced: [
          { name: 'Recommendation Systems Architecture', level: 'ADVANCED', importance: 'ADVANCED', description: 'Collaborative filtering, two-tower neural networks, and candidate generation.' },
        ],
      },
      learningPhases: [
        {
          phaseNumber: '01',
          title: 'DEEP LEARNING WITH PYTORCH',
          subtitle: 'Neural Networks & GPU Computing',
          description: 'Design, train, and optimize deep neural networks using PyTorch modules.',
          topics: ['PyTorch tensor operations & autograd', 'Custom loss functions & optimizers (AdamW)', 'DataLoader optimization & GPU memory management', 'Regularization (Dropout, BatchNorm, LayerNorm)'],
          skills: ['PyTorch & Deep Learning'],
          recommendedCourse: { id: 'c-ds-m1', title: 'Deep Learning with PyTorch and Transformers', provider: 'PATHWAY Academy', level: 'Intermediate', available: true },
        },
        {
          phaseNumber: '02',
          title: 'APPLIED NLP & TRANSFORMER MODELS',
          subtitle: 'Hugging Face & Transfer Learning',
          description: 'Fine-tune Transformer language models on domain-specific classification tasks.',
          topics: ['Self-attention mechanism & multi-head attention', 'BERT & RoBERTa architectures', 'Hugging Face Trainer API', 'Evaluation with BLEU, ROUGE, and F1'],
          skills: ['Transformers & NLP (Hugging Face)', 'Vector Databases & Embeddings'],
        },
        {
          phaseNumber: '03',
          title: 'MLOPS & PRODUCTION DRIFT MONITORING',
          subtitle: 'Continuous Retraining & Monitoring',
          description: 'Build automated pipelines detecting data drift and triggering retraining cycles.',
          topics: ['Detecting covariate shift vs concept drift', 'Evidently AI monitoring dashboards', 'Automated retraining triggers', 'Model canary evaluation in production'],
          skills: ['MLOps & Continuous Training', 'Model Monitoring & Drift Detection'],
        },
      ],
      practicalWork: [
        {
          id: 'p-ds-m1',
          title: 'Fine-Tuned Domain-Specific NLP Transformer Classifier',
          difficulty: 'Advanced',
          skillsRequired: ['PyTorch & Deep Learning', 'Transformers & NLP (Hugging Face)'],
          description: 'Fine-tune a pretrained RoBERTa model on domain-specific customer support or legal texts using Hugging Face, achieving superior F1 scores over baseline models with mixed-precision GPU training.',
          expectedOutcome: 'Trained model checkpoint, evaluation benchmark suite, and documented inference latency metrics.',
        },
        {
          id: 'p-ds-m2',
          title: 'Automated MLOps Pipeline with Data Drift Detection & Retraining',
          difficulty: 'Advanced',
          skillsRequired: ['MLOps & Continuous Training', 'Model Monitoring & Drift Detection'],
          description: 'Implement a continuous machine learning pipeline that monitors production prediction distributions using Evidently AI, alerts when Population Stability Index (PSI) exceeds thresholds, and triggers an automated retraining workflow.',
          expectedOutcome: 'End-to-end MLOps pipeline repository with automated drift reports and verified retraining triggers.',
        },
      ],
      certifications: [
        { id: 'cert-ds-gcp-ml', name: 'Google Cloud Certified Professional Machine Learning Engineer', issuingOrganization: 'Google Cloud', level: 'Advanced' },
        { id: 'cert-ds-databricks-pro', name: 'Databricks Certified Machine Learning Professional', issuingOrganization: 'Databricks', level: 'Advanced' },
      ],
      practiceAreas: [
        { id: 'prac-ds-m1', title: 'PyTorch Custom Neural Network & Training Loop Drills', category: 'Technical Challenges', description: 'Write custom PyTorch training loops with gradient clipping, mixed precision, and early stopping.', questionCount: 15 },
        { id: 'prac-ds-m2', title: 'Transformer Tokenization & Attention Mechanism Challenges', category: 'Technical Challenges', description: 'Compute self-attention weights and resolve out-of-vocabulary subword tokenization issues.', questionCount: 12 },
        { id: 'prac-ds-m3', title: 'Covariate Shift & Concept Drift Diagnosis Scenarios', category: 'Scenario Questions', description: 'Diagnose why a production model\'s accuracy declined despite static input data distributions.', questionCount: 12 },
      ],
      interviewTopics: [
        {
          id: 'int-ds-m1',
          topic: 'Deep Learning & Transformer Architecture',
          category: 'System Design',
          questionCount: 3,
          keyQuestions: [
            'Explain the self-attention mechanism in Transformers mathematically and why multi-head attention is superior to single-head attention.',
            'What is the difference between Layer Normalization and Batch Normalization, and why is LayerNorm preferred in Transformer architectures?',
            'How do you manage vanishing and exploding gradients in deep neural networks during backpropagation?',
          ],
        },
        {
          id: 'int-ds-m2',
          topic: 'MLOps & Production Model Drift',
          category: 'Role Specific',
          questionCount: 2,
          keyQuestions: [
            'How do you mathematically distinguish between covariate shift (feature drift) and concept drift (target distribution change)?',
            'How do you design an automated continuous retraining pipeline without risking catastrophic forgetting or deploying a degraded model?',
          ],
        },
      ],
      readinessChecklist: [
        { id: 'chk-1', label: 'Mid-Level Data Science Resume Highlighting PyTorch, Transformers, MLOps & Production Scale', status: 'Essential', type: 'resume' },
        { id: 'chk-2', label: 'Fine-Tuned Hugging Face Transformer or PyTorch Deep Learning Model Repository', status: 'Essential', type: 'practical' },
        { id: 'chk-3', label: 'Automated MLOps Pipeline Repository with Live Drift Detection and Retraining Logic', status: 'Essential', type: 'practical' },
      ],
      roadmapStageDescriptions: {
        learn: 'Master PyTorch deep learning, Transformer NLP architectures, automated MLOps, and model drift detection.',
        practice: 'Write custom PyTorch training loops, fine-tune RoBERTa models, and build automated drift detection suites.',
        mentorship: 'Consult with Staff ML Engineers on distributed training strategies, model monitoring, and online A/B testing.',
        prepare: 'Master technical interviews on Transformer attention mechanics, gradient dynamics, and MLOps architecture.',
        jobReady: 'Showcase fine-tuned Transformer repositories, automated MLOps pipelines, and drift monitoring dashboards.',
        opportunities: 'Target Senior Data Scientist, Applied Machine Learning Specialist, and NLP Engineer roles (3–5 years).',
      },
    },

    senior: {
      id: 'senior',
      label: 'Senior',
      roleTitle: 'Lead / Principal Data Scientist',
      experienceRange: '5+ yrs',
      description: 'Focuses on enterprise AI strategy, Retrieval-Augmented Generation (RAG) and LLM system architecture, AI governance and algorithmic fairness, and commercial ROI alignment.',
      focusSummary: 'Architect enterprise generative AI and RAG platforms, direct algorithmic fairness and AI governance programs, advise executive leadership, and translate corporate strategy into mathematical initiatives.',
      expectedCompetencies: [
        'Enterprise AI strategy, Foundation Model adaptation, and Retrieval-Augmented Generation (RAG)',
        'Algorithmic bias mitigation, fairness metrics (demographic parity, equalized odds), and AI governance',
        'High-scale distributed model training and inference optimization (Quantization: GGUF/AWQ, vLLM)',
        'Translating complex business opportunities into mathematical modeling objectives with measurable P&L impact',
        'Mentoring senior data scientists, establishing peer review standards, and guiding research roadmaps',
      ],
      responsibilities: [
        'Define enterprise machine learning strategy, technical standards, and foundational AI adoption roadmaps.',
        'Architect high-impact generative AI and retrieval-augmented generation (RAG) platforms with strict guardrails.',
        'Establish corporate AI ethics boards, bias auditing protocols, and compliance with emerging AI regulations.',
        'Partner with C-suite stakeholders to validate financial ROI and strategic feasibility on multi-million dollar AI initiatives.',
      ],
      practicalWorkTitle: 'Machine Learning Labs, Models & Experiments',
      practicalWorkDescription: 'Design enterprise RAG architectures, author corporate AI governance frameworks, and audit algorithmic bias.',
      skillGroups: {
        mustKnow: [
          { name: 'Enterprise AI Strategy', level: 'EXPERT', importance: 'MUST_KNOW', description: 'Translating business objectives into ML formulations, roadmap prioritization, and commercial impact.' },
          { name: 'LLM & RAG Architecture', level: 'EXPERT', importance: 'MUST_KNOW', description: 'Vector indexing, hybrid dense/sparse retrieval, cross-encoder re-ranking, and hallucination guardrails.' },
          { name: 'AI Governance & Algorithmic Fairness', level: 'EXPERT', importance: 'MUST_KNOW', description: 'Disparate impact analysis, equalized odds, explainable AI (XAI), and regulatory compliance.' },
          { name: 'Distributed ML & Inference Optimization', level: 'ADVANCED', importance: 'MUST_KNOW', description: 'Model quantization, vLLM, TensorRT-LLM, speculative decoding, and GPU serving clusters.' },
        ],
        goodToKnow: [
          { name: 'Agentic AI & Tool-Use Systems', level: 'ADVANCED', importance: 'GOOD_TO_KNOW', description: 'LangGraph, AutoGen, multi-agent coordination, and automated reasoning loops.' },
          { name: 'Executive C-Suite Partnership', level: 'ADVANCED', importance: 'GOOD_TO_KNOW', description: 'Business case development, presenting to the Board of Directors, and managing AI risk.' },
        ],
        advanced: [
          { name: 'Causal Inference & Econometrics', level: 'ADVANCED', importance: 'ADVANCED', description: 'Propensity score matching, instrumental variables, and synthetic control methods.' },
        ],
      },
      learningPhases: [
        {
          phaseNumber: '01',
          title: 'GENERATIVE AI & ENTERPRISE RAG ARCHITECTURE',
          subtitle: 'LLMs, Embeddings & Guardrails',
          description: 'Architect production-grade retrieval-augmented generation systems with low latency and high accuracy.',
          topics: ['Hybrid semantic and keyword search', 'Re-ranking with cross-encoders', 'Context window optimization & chunking', 'Hallucination detection & guardrail frameworks'],
          skills: ['LLM & RAG Architecture', 'Distributed ML & Inference Optimization'],
        },
        {
          phaseNumber: '02',
          title: 'AI ETHICS, BIAS MITIGATION & GOVERNANCE',
          subtitle: 'Algorithmic Fairness & Regulatory Auditing',
          description: 'Measure and mitigate bias in AI models to ensure fairness, transparency, and compliance.',
          topics: ['Fairness definitions (Demographic Parity, Equal Opportunity)', 'Fairlearn & AIF360 toolkits', 'EU AI Act & regulatory compliance frameworks', 'Establishing an organizational AI Ethics Board'],
          skills: ['AI Governance & Algorithmic Fairness'],
        },
        {
          phaseNumber: '03',
          title: 'EXECUTIVE AI LEADERSHIP & RESEARCH ROADMAPS',
          subtitle: 'Strategy, Team Topology & Commercial Impact',
          description: 'Lead enterprise data science organizations and maximize commercial return on AI investments.',
          topics: ['Prioritizing high-ROI ML initiatives', 'Structuring data science teams (research vs applied squads)', 'Authoring executive board proposals', 'Mentoring senior data scientists and technical staff'],
          skills: ['Enterprise AI Strategy', 'Executive C-Suite Partnership'],
        },
      ],
      practicalWork: [
        {
          id: 'p-ds-s1',
          title: 'Enterprise Retrieval-Augmented Generation (RAG) Architecture Blueprint',
          difficulty: 'Advanced',
          skillsRequired: ['LLM & RAG Architecture', 'Distributed ML & Inference Optimization'],
          description: 'Architect an enterprise RAG knowledge engine featuring hybrid dense/sparse vector retrieval, cross-encoder re-ranking, automated hallucination guardrails, and sub-second quantized inference serving.',
          expectedOutcome: 'Comprehensive Architecture Decision Record (ADR), system component diagrams, evaluation benchmark telemetry, and deployment code.',
        },
        {
          id: 'p-ds-s2',
          title: 'Corporate AI Governance Framework & Algorithmic Bias Audit',
          difficulty: 'Advanced',
          skillsRequired: ['AI Governance & Algorithmic Fairness', 'Enterprise AI Strategy'],
          description: 'Conduct a rigorous algorithmic fairness and bias assessment on a high-stakes automated credit scoring or recommendation model, measuring disparate impact across protected classes and implementing mitigation algorithms.',
          expectedOutcome: 'Comprehensive AI governance whitepaper, fairness audit report, and mitigation code repository.',
        },
      ],
      certifications: [
        { id: 'cert-ds-stanford-ai', name: 'Stanford Artificial Intelligence Professional Program', issuingOrganization: 'Stanford University', level: 'Advanced' },
        { id: 'cert-ds-aws-ml-pro', name: 'AWS Certified Machine Learning – Specialty', issuingOrganization: 'Amazon Web Services', level: 'Advanced' },
      ],
      practiceAreas: [
        { id: 'prac-ds-s1', title: 'Executive AI Investment ROI & Feasibility Scenario', category: 'Scenario Questions', description: 'Evaluate whether an enterprise should build, buy, or fine-tune an LLM for customer operations.', questionCount: 14 },
        { id: 'prac-ds-s2', title: 'Production Algorithmic Bias Crisis Tabletop', category: 'Scenario Questions', description: 'Address an algorithmic fairness discrepancy discovered in an active automated decisioning model.', questionCount: 12 },
        { id: 'prac-ds-s3', title: 'Large-Scale Distributed Training Outage & Recovery', category: 'Scenario Questions', description: 'Diagnose and recover a multi-node GPU cluster hang during a multi-week foundation model run.', questionCount: 10 },
      ],
      interviewTopics: [
        {
          id: 'int-ds-s1',
          topic: 'Enterprise AI Architecture & LLM Trade-Offs',
          category: 'System Design',
          questionCount: 3,
          keyQuestions: [
            'How do you architect an enterprise RAG system that balances vector retrieval latency, context token limits, and answer faithfulness?',
            'What are the critical trade-offs between prompt engineering, fine-tuning (LoRA/QLoRA), and full parameter pre-training for enterprise use cases?',
            'How do you optimize LLM inference throughput and cost using model quantization, continuous batching, and vLLM?',
          ],
        },
        {
          id: 'int-ds-s2',
          topic: 'AI Ethics, Strategy & Board Communication',
          category: 'Role Specific',
          questionCount: 2,
          keyQuestions: [
            'How do you mathematically measure and mitigate algorithmic bias in predictive models without completely sacrificing overall predictive accuracy?',
            'How do you guide a C-suite executive team through the decision to adopt generative AI while mitigating legal, copyright, and hallucination risks?',
          ],
        },
      ],
      readinessChecklist: [
        { id: 'chk-1', label: 'Executive AI Leadership Resume Highlighting Commercial ROI, Strategic Governance & Research Direction', status: 'Essential', type: 'resume' },
        { id: 'chk-2', label: 'Enterprise RAG System Architecture Blueprint or Foundation Model Technical Whitepaper', status: 'Essential', type: 'practical' },
        { id: 'chk-3', label: 'Documented AI Governance Framework or Algorithmic Fairness Audit Case Study', status: 'Essential', type: 'practical' },
      ],
      roadmapStageDescriptions: {
        learn: 'Master enterprise AI strategy, RAG system architecture, AI governance and fairness, and distributed inference.',
        practice: 'Architect enterprise RAG pipelines, audit algorithmic bias, and calculate business ROI for executive AI proposals.',
        mentorship: 'Engage with Chief AI Officers and VP of Data Science mentors on strategic vision and board advisory.',
        prepare: 'Master executive-level AI interviews on LLM system design, algorithmic ethics, and organizational leadership.',
        jobReady: 'Showcase enterprise AI architecture blueprints, algorithmic fairness audits, and business ROI case studies.',
        opportunities: 'Connect with Principal Data Scientist, Head of AI/ML, and VP of Data Science roles (5+ years).',
      },
    },
  },

  // ==========================================
  // CYBERSECURITY ENGINEER
  // ==========================================
  'cybersecurity-engineer': {
    entry: {
      id: 'entry',
      label: 'Beginner / Entry Level',
      roleTitle: 'Associate Cybersecurity Analyst',
      experienceRange: '0–1 yrs',
      description: 'Focuses on network protocol analysis with Wireshark, Linux/Windows security hardening, SIEM alert triage, and OWASP Top 10 web vulnerabilities.',
      focusSummary: 'Master fundamental TCP/IP networking, system event log analysis, basic vulnerability scanning, and entry-level SOC alert triage procedures.',
      expectedCompetencies: [
        'TCP/IP networking, subnetting, and Wireshark packet capture analysis',
        'Linux user permissions, SSH hardening, and Windows Event Viewer logs',
        'OWASP Top 10 web vulnerabilities (SQL Injection, XSS, CSRF)',
        'Basic vulnerability scanning using Nmap and OpenVAS',
        'Security Information and Event Management (SIEM) alert monitoring',
      ],
      responsibilities: [
        'Monitor SIEM dashboards and perform initial triage on alerts, suspicious logins, and malware flags.',
        'Conduct basic network reconnaissance and port scans on authorized lab environments using Nmap.',
        'Review application and web server logs to identify common web exploitation attempts.',
        'Assist incident response handlers with documenting timelines and containment steps.',
      ],
      practicalWorkTitle: 'Security Labs, Defense Audits & Simulations',
      practicalWorkDescription: 'Perform packet-level network forensics, audit web application vulnerabilities, and triage simulated security alerts.',
      skillGroups: {
        mustKnow: [
          { name: 'Networking & Wireshark', level: 'BEGINNER', importance: 'MUST_KNOW', description: 'OSI model, TCP/UDP ports, handshake packets, and Wireshark capture filters.' },
          { name: 'Linux Security', level: 'BEGINNER', importance: 'MUST_KNOW', description: 'Permissions, sudo controls, SSH hardening, and syslog review.' },
          { name: 'OWASP Top 10', level: 'BEGINNER', importance: 'MUST_KNOW', description: 'SQL injection, Cross-Site Scripting (XSS), and insecure direct object references.' },
          { name: 'SIEM Triage', level: 'BEGINNER', importance: 'MUST_KNOW', description: 'Log correlation, alert severity classification, and indicator of compromise (IOC) lookups.' },
        ],
        goodToKnow: [
          { name: 'Python for Security', level: 'BEGINNER', importance: 'GOOD_TO_KNOW', description: 'Writing scripts to parse log files, automate port checks, and query threat feeds.' },
          { name: 'Vulnerability Scanning (Nmap)', level: 'BEGINNER', importance: 'GOOD_TO_KNOW', description: 'Host discovery, service detection, and Nmap Scripting Engine (NSE).' },
        ],
        advanced: [
          { name: 'Applied Cryptography Basics', level: 'BEGINNER', importance: 'ADVANCED', description: 'Symmetric vs asymmetric encryption, hashing, and TLS certificates.' },
        ],
      },
      learningPhases: [
        {
          phaseNumber: '01',
          title: 'NETWORKING & PACKET ANALYSIS',
          subtitle: 'TCP/IP & Protocol Forensics',
          description: 'Understand network communication protocols and capture packet-level traffic.',
          topics: ['OSI 7-layer model', 'TCP handshake & teardown', 'DNS & HTTP protocol inspection', 'Wireshark display filters'],
          skills: ['Networking & Wireshark', 'Linux Security'],
          recommendedCourse: { id: 'c-sec-e1', title: 'Network Security and Packet Analysis with Wireshark', provider: 'PATHWAY Academy', level: 'Beginner', available: true },
        },
        {
          phaseNumber: '02',
          title: 'SYSTEM HARDENING & LOG TRIAGE',
          subtitle: 'Operating System Security',
          description: 'Harden Linux/Windows operating systems and analyze security event logs.',
          topics: ['Linux file permissions & auth.log', 'Windows Event Viewer Security IDs', 'Syslog aggregation', 'SIEM search syntax'],
          skills: ['Linux Security', 'SIEM Triage'],
        },
        {
          phaseNumber: '03',
          title: 'VULNERABILITY ASSESSMENT & OWASP',
          subtitle: 'Threat Vectors & Web Security',
          description: 'Identify common web application vulnerabilities and perform basic scans.',
          topics: ['OWASP Top 10 vulnerabilities', 'SQL injection mitigation & prepared statements', 'XSS prevention & sanitization', 'Port scanning with Nmap'],
          skills: ['OWASP Top 10', 'Vulnerability Scanning (Nmap)'],
        },
      ],
      practicalWork: [
        {
          id: 'p-sec-e1',
          title: 'Packet Capture Forensics & Attack Detection Lab',
          difficulty: 'Beginner',
          skillsRequired: ['Networking & Wireshark', 'Linux Security'],
          description: 'Analyze an authorized pcap capture file in Wireshark to identify port scanning activity, brute-force SSH logins, and plaintext credential transmission.',
          expectedOutcome: 'Documented forensic investigation report detailing IP addresses, timestamps, attack signatures, and defensive remediations.',
        },
        {
          id: 'p-sec-e2',
          title: 'OWASP Vulnerability Audit on Test Application',
          difficulty: 'Beginner',
          skillsRequired: ['OWASP Top 10', 'Python for Security'],
          description: 'Audit a vulnerable web application (DVWA/Juice Shop) for SQL injection and XSS vulnerabilities, authoring proof-of-concept payloads and verified code fixes.',
          expectedOutcome: 'Vulnerability assessment report with executive summary, CVSS scoring, and remediated code snippets.',
        },
      ],
      certifications: [
        { id: 'cert-sec-plus', name: 'CompTIA Security+', issuingOrganization: 'CompTIA', level: 'Foundation' },
        { id: 'cert-sec-isc2-cc', name: 'Certified in Cybersecurity (ISC2 CC)', issuingOrganization: 'ISC2', level: 'Foundation' },
      ],
      practiceAreas: [
        { id: 'prac-sec-e1', title: 'Wireshark Packet Forensics Drills', category: 'Technical Challenges', description: 'Analyze pcap streams to uncover covert channels and credential leaks.', questionCount: 15 },
        { id: 'prac-sec-e2', title: 'OWASP Top 10 Vulnerability Remediation', category: 'Technical Challenges', description: 'Review vulnerable code snippets and select secure implementation patterns.', questionCount: 14 },
        { id: 'prac-sec-e3', title: 'SOC Alert Priority Classification', category: 'Scenario Questions', description: 'Classify false positives versus true positive alerts under time constraints.', questionCount: 12 },
      ],
      interviewTopics: [
        {
          id: 'int-sec-e1',
          topic: 'Network Security & Protocols',
          category: 'Technical',
          questionCount: 3,
          keyQuestions: [
            'Explain the TCP three-way handshake and how a SYN flood attack attempts to exhaust server resources.',
            'What is the difference between asymmetric and symmetric encryption, and where is each used in HTTPS/TLS?',
            'How does a DNS amplification DDoS attack work and how can open resolvers be protected?',
          ],
        },
        {
          id: 'int-sec-e2',
          topic: 'Web Application Vulnerabilities',
          category: 'Role Specific',
          questionCount: 2,
          keyQuestions: [
            'What is the difference between Reflected, Stored, and DOM-based Cross-Site Scripting (XSS)?',
            'How do parameterized queries prevent SQL Injection attacks at the database driver level?',
          ],
        },
      ],
      readinessChecklist: [
        { id: 'chk-1', label: 'Security-Focused Resume Demonstrating Hands-On Lab Work (TryHackMe / HTB / Labs)', status: 'Essential', type: 'resume' },
        { id: 'chk-2', label: 'Completed Packet Analysis or Web Vulnerability Assessment Technical Report', status: 'Essential', type: 'practical' },
        { id: 'chk-3', label: 'Verified Foundation Security Certification or Lab Demonstration Badge', status: 'Essential', type: 'certifications' },
      ],
      roadmapStageDescriptions: {
        learn: 'Master networking protocols, Wireshark packet capture, Linux security hardening, and OWASP Top 10.',
        practice: 'Conduct packet forensic investigations, identify SQL injection vectors, and triage simulated SOC alerts.',
        mentorship: 'Connect with Cybersecurity Analysts to discuss real-world incident response protocols and certification strategy.',
        prepare: 'Master entry-level cybersecurity interview topics on network handshakes, port numbers, and web vulnerabilities.',
        jobReady: 'Compile documented security lab write-ups and vulnerability assessment reports into a technical portfolio.',
        opportunities: 'Target Junior SOC Analyst, Information Security Associate, and Security Specialist roles (0–1 years).',
      },
    },

    junior: {
      id: 'junior',
      label: 'Junior',
      roleTitle: 'Cybersecurity Operations Engineer',
      experienceRange: '1–3 yrs',
      description: 'Focuses on firewall and IDS/IPS rule authoring, Endpoint Detection & Response (EDR) telemetry, Python security automation, and incident handling.',
      focusSummary: 'Configure network security appliances, investigate endpoint threats with EDR tools, automate indicator of compromise (IOC) lookups, and execute incident response procedures.',
      expectedCompetencies: [
        'Authoring firewall and IDS/IPS detection signatures (Snort / Suricata)',
        'Endpoint Detection & Response (EDR) administration and host isolation',
        'Python security automation (querying REST APIs, parsing IOCs, updating blocklists)',
        'Incident handling and artifact containment following NIST SP 800-61',
        'Cloud security posture management (AWS IAM policies, CloudTrail audit logs)',
      ],
      responsibilities: [
        'Author and fine-tune Snort and Suricata detection rules to identify malicious network traffic.',
        'Investigate suspicious endpoint behavior using EDR agents and isolate compromised workstations.',
        'Develop Python scripts to automate threat intelligence ingestion and perimeter blocklist updates.',
        'Coordinate containment, eradication, and post-incident documentation during security events.',
      ],
      practicalWorkTitle: 'Security Labs, Defense Audits & Simulations',
      practicalWorkDescription: 'Implement automated threat intelligence feeds, author IDS detection rules, and execute incident response procedures.',
      skillGroups: {
        mustKnow: [
          { name: 'Incident Response (NIST)', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'Preparation, detection, containment, eradication, and lessons learned frameworks.' },
          { name: 'Firewalls & IDS/IPS', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'Stateful inspection, Snort syntax, Suricata rules, and egress filtering.' },
          { name: 'Python Security Automation', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'Automating IOC checks against VirusTotal, Shodan, and firewall APIs.' },
          { name: 'EDR & Endpoint Telemetry', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'Process trees, memory dumps, registry persistence, and host containment.' },
        ],
        goodToKnow: [
          { name: 'Cloud Security (AWS IAM & Logs)', level: 'INTERMEDIATE', importance: 'GOOD_TO_KNOW', description: 'Least privilege IAM roles, CloudTrail analysis, and S3 bucket security.' },
          { name: 'Active Directory Security', level: 'INTERMEDIATE', importance: 'GOOD_TO_KNOW', description: 'Kerberos tickets, Group Policy Objects, and pass-the-hash attack mechanics.' },
        ],
        advanced: [
          { name: 'Reverse Engineering Basics', level: 'INTERMEDIATE', importance: 'ADVANCED', description: 'Static analysis of malware strings, PE headers, and suspicious macros.' },
        ],
      },
      learningPhases: [
        {
          phaseNumber: '01',
          title: 'INCIDENT RESPONSE & ARTIFACT RECOVERY',
          subtitle: 'NIST 800-61 & Host Forensics',
          description: 'Execute systematic incident containment, evidence collection, and memory analysis.',
          topics: ['Incident response lifecycle', 'Memory artifact extraction (Volatility)', 'Timeline analysis & log correlation', 'Chain of custody standards'],
          skills: ['Incident Response (NIST)', 'EDR & Endpoint Telemetry'],
          recommendedCourse: { id: 'c-sec-j1', title: 'Hands-On Incident Response and Threat Triage', provider: 'PATHWAY Academy', level: 'Intermediate', available: true },
        },
        {
          phaseNumber: '02',
          title: 'DETECTION ENGINEERING & IDS/IPS',
          subtitle: 'Network Defense & Rule Tuning',
          description: 'Author custom detection rules to intercept malicious traffic and reduce alert noise.',
          topics: ['Snort / Suricata signature syntax', 'Zeek network security monitoring', 'Tuning false positives', 'Threat hunting methodologies'],
          skills: ['Firewalls & IDS/IPS', 'Python Security Automation'],
        },
        {
          phaseNumber: '03',
          title: 'CLOUD SECURITY & IDENTITY DEFENSE',
          subtitle: 'AWS Security & Active Directory',
          description: 'Secure cloud identities, audit CloudTrail logs, and detect credential abuse.',
          topics: ['AWS IAM policy boundaries', 'CloudTrail anomaly detection', 'Active Directory Kerberoasting basics', 'Multi-factor authentication enforcement'],
          skills: ['Cloud Security (AWS IAM & Logs)', 'Active Directory Security'],
        },
      ],
      practicalWork: [
        {
          id: 'p-sec-j1',
          title: 'Automated Threat Intelligence Feed & Firewall IOC Blocker',
          difficulty: 'Intermediate',
          skillsRequired: ['Python Security Automation', 'Firewalls & IDS/IPS'],
          description: 'Build a Python automation script that queries threat intelligence feeds (AlienVault OTX / AbuseIPDB), validates confidence scores, and dynamically updates firewall blocklists via REST API.',
          expectedOutcome: 'Tested automation script with logging, error handling, and documented API integration.',
        },
        {
          id: 'p-sec-j2',
          title: 'Simulated Ransomware Incident Response & Post-Mortem',
          difficulty: 'Intermediate',
          skillsRequired: ['Incident Response (NIST)', 'EDR & Endpoint Telemetry'],
          description: 'Investigate a simulated host infection: analyze process trees, identify the persistence mechanism in the Windows registry, isolate the host, and compile a formal incident post-mortem report.',
          expectedOutcome: 'Complete incident response report detailing timeline, root cause, IOC list, and mitigation recommendations.',
        },
      ],
      certifications: [
        { id: 'cert-sec-cysa', name: 'CompTIA CySA+ (Cybersecurity Analyst)', issuingOrganization: 'CompTIA', level: 'Intermediate' },
        { id: 'cert-sec-gsec', name: 'GIAC Security Essentials (GSEC)', issuingOrganization: 'GIAC', level: 'Intermediate' },
      ],
      practiceAreas: [
        { id: 'prac-sec-j1', title: 'Snort Rule Writing & Signature Optimization', category: 'Technical Challenges', description: 'Write detection rules to flag reverse shell handshakes and HTTP exploit payloads.', questionCount: 15 },
        { id: 'prac-sec-j2', title: 'Windows Registry & Persistence Analysis', category: 'Scenario Questions', description: 'Identify Run key persistence, scheduled tasks, and rogue service installations.', questionCount: 14 },
        { id: 'prac-sec-j3', title: 'Cloud IAM Privilege Escalation Remediation', category: 'Scenario Questions', description: 'Detect and patch overly permissive IAM policies allowing credential theft.', questionCount: 12 },
      ],
      interviewTopics: [
        {
          id: 'int-sec-j1',
          topic: 'Incident Handling & Threat Containment',
          category: 'Technical',
          questionCount: 3,
          keyQuestions: [
            'Walk through your diagnostic protocol when an EDR agent alerts on suspicious PowerShell beaconing from a domain controller.',
            'What are the critical trade-offs between immediately disconnecting a compromised host versus keeping it online for forensic memory analysis?',
            'How does Kerberoasting exploit Active Directory Service Principal Names (SPNs) to crack passwords offline?',
          ],
        },
        {
          id: 'int-sec-j2',
          topic: 'Detection Engineering & Cloud IAM',
          category: 'Role Specific',
          questionCount: 2,
          keyQuestions: [
            'How do you craft an IDS rule that reliably alerts on outbound C2 traffic while filtering out legitimate CDN traffic?',
            'How do you enforce least-privilege IAM policies in AWS to prevent lateral movement following access key leakage?',
          ],
        },
      ],
      readinessChecklist: [
        { id: 'chk-1', label: 'Resume Demonstrating EDR, Detection Rule Authoring, and Formal Incident Response Experience', status: 'Essential', type: 'resume' },
        { id: 'chk-2', label: 'Comprehensive Technical Incident Response Post-Mortem Report Following NIST Guidelines', status: 'Essential', type: 'practical' },
        { id: 'chk-3', label: 'Python Security Automation Repository (Threat Feed Ingestion / IOC Verification)', status: 'Essential', type: 'practical' },
      ],
      roadmapStageDescriptions: {
        learn: 'Advance in incident response, detection engineering, IDS/IPS rule authoring, and cloud IAM defense.',
        practice: 'Author Snort detection signatures, trace Windows persistence mechanisms, and automate threat feed ingestion.',
        mentorship: 'Meet with Senior Security Engineers to review threat hunting methodologies and detection engineering workflows.',
        prepare: 'Prepare for junior security engineer interviews on EDR triage, Active Directory attack paths, and cloud logs.',
        jobReady: 'Showcase incident response post-mortems, automation code repositories, and detection signatures.',
        opportunities: 'Target Cybersecurity Operations Engineer, Threat Hunter, and Incident Response Specialist roles (1–3 years).',
      },
    },

    mid: {
      id: 'mid',
      label: 'Mid-Level',
      roleTitle: 'Cybersecurity Engineer / Threat Specialist',
      experienceRange: '3–5 yrs',
      description: 'Focuses on offensive penetration testing, threat modeling with STRIDE, MITRE ATT&CK detection mapping, and Kubernetes cloud-native defense.',
      focusSummary: 'Conduct web and API penetration tests, perform threat modeling on cloud architectures, map enterprise detection coverage to MITRE ATT&CK, and implement container runtime security.',
      expectedCompetencies: [
        'Offensive penetration testing on web apps and APIs (Burp Suite Pro, Metasploit)',
        'Threat modeling cloud microservices using STRIDE and attack tree analysis',
        'Mapping organizational detection coverage against the MITRE ATT&CK enterprise matrix',
        'Kubernetes container security (Falco runtime detection, Trivy image scanning, OPA/Kyverno)',
        'Zero-trust network architecture and applied cryptography (PKI, TLS 1.3, KMS)',
      ],
      responsibilities: [
        'Conduct authorized penetration testing on web applications, GraphQL APIs, and internal microservices.',
        'Map detection controls to the MITRE ATT&CK framework and close visibility gaps across tactics.',
        'Implement container runtime security with Falco and enforce admission controllers in Kubernetes clusters.',
        'Partner with software engineering squads to integrate security testing into continuous delivery pipelines.',
      ],
      practicalWorkTitle: 'Security Labs, Defense Audits & Simulations',
      practicalWorkDescription: 'Execute full-scope penetration tests, build MITRE ATT&CK detection pipelines, and harden cloud-native Kubernetes environments.',
      skillGroups: {
        mustKnow: [
          { name: 'Penetration Testing (Burp Suite)', level: 'ADVANCED', importance: 'MUST_KNOW', description: 'Authentication bypass, IDOR, SSRF, BOLA, and business logic flaws.' },
          { name: 'Threat Modeling (STRIDE)', level: 'ADVANCED', importance: 'MUST_KNOW', description: 'Decomposing architectures, identifying threat boundaries, and selecting mitigations.' },
          { name: 'MITRE ATT&CK Mapping', level: 'ADVANCED', importance: 'MUST_KNOW', description: 'Technique mapping, adversary emulation plans, and detection coverage gap analysis.' },
          { name: 'Container & K8s Security', level: 'ADVANCED', importance: 'MUST_KNOW', description: 'Falco rules, rootless containers, secret injection, and admission controllers.' },
        ],
        goodToKnow: [
          { name: 'Applied Cryptography & PKI', level: 'ADVANCED', importance: 'GOOD_TO_KNOW', description: 'Mutual TLS, certificate revocation, KMS key rotation, and envelope encryption.' },
          { name: 'DevSecOps Pipeline Security', level: 'ADVANCED', importance: 'GOOD_TO_KNOW', description: 'SAST/DAST integration, secret scanning (Gitleaks), and software supply chain security.' },
        ],
        advanced: [
          { name: 'Red Team Adversary Emulation', level: 'ADVANCED', importance: 'ADVANCED', description: 'Caldera / Atomic Red Team, payload obfuscation, and defensive evasion analysis.' },
        ],
      },
      learningPhases: [
        {
          phaseNumber: '01',
          title: 'OFFENSIVE SECURITY & ADVANCED PEN TESTING',
          subtitle: 'Burp Suite & Web Exploitation',
          description: 'Identify and exploit complex business logic, authorization, and injection vulnerabilities.',
          topics: ['Server-Side Request Forgery (SSRF)', 'Broken Object Level Authorization (BOLA)', 'JWT attack vectors', 'Automating scans with Burp Extender'],
          skills: ['Penetration Testing (Burp Suite)', 'DevSecOps Pipeline Security'],
          recommendedCourse: { id: 'c-sec-m1', title: 'Advanced Web Application Penetration Testing', provider: 'PATHWAY Academy', level: 'Intermediate', available: true },
        },
        {
          phaseNumber: '02',
          title: 'THREAT MODELING & ATT&CK MAPPING',
          subtitle: 'Architectural Defense Strategy',
          description: 'Model adversary threats and map technical controls against MITRE ATT&CK techniques.',
          topics: ['STRIDE threat modeling methodology', 'Attack tree modeling', 'MITRE ATT&CK Navigator matrix', 'Atomic Red Team detection validation'],
          skills: ['Threat Modeling (STRIDE)', 'MITRE ATT&CK Mapping'],
        },
        {
          phaseNumber: '03',
          title: 'CLOUD-NATIVE & CONTAINER RUNTIME DEFENSE',
          subtitle: 'Kubernetes & Zero-Trust Defense',
          description: 'Secure microservices at runtime and enforce zero-trust identity across services.',
          topics: ['Falco behavioral detection rules', 'OPA Gatekeeper admission control', 'Mutual TLS with service meshes', 'Secrets management with Vault'],
          skills: ['Container & K8s Security', 'Applied Cryptography & PKI'],
        },
      ],
      practicalWork: [
        {
          id: 'p-sec-m1',
          title: 'Full-Scope Web Application & API Penetration Test',
          difficulty: 'Advanced',
          skillsRequired: ['Penetration Testing (Burp Suite)', 'Applied Cryptography & PKI'],
          description: 'Perform a comprehensive security assessment of a multi-tenant GraphQL and REST API platform, discovering authorization flaws (BOLA) and SSRF vulnerabilities with full proof-of-concept exploits.',
          expectedOutcome: 'Redacted penetration test report adhering to PTES guidelines with vulnerability severities, evidence, and code remediation.',
        },
        {
          id: 'p-sec-m2',
          title: 'Kubernetes Runtime Defense & Automated Threat Detection Pipeline',
          difficulty: 'Advanced',
          skillsRequired: ['Container & K8s Security', 'MITRE ATT&CK Mapping'],
          description: 'Deploy Falco runtime behavioral monitoring across an EKS cluster with custom rules detecting unauthorized shell spawns, container escapes, and sensitive file modifications with automated Slack alerting.',
          expectedOutcome: 'Live Kubernetes runtime security deployment with verified alert triggers, Falco rule repository, and detection documentation.',
        },
      ],
      certifications: [
        { id: 'cert-sec-oscp', name: 'Offensive Security Certified Professional (OSCP)', issuingOrganization: 'OffSec', level: 'Advanced' },
        { id: 'cert-sec-cissp-assoc', name: 'CISSP (Associate of ISC2)', issuingOrganization: 'ISC2', level: 'Advanced' },
      ],
      practiceAreas: [
        { id: 'prac-sec-m1', title: 'API BOLA & Broken Authentication Exploitation', category: 'Technical Challenges', description: 'Exploit and remediate complex object-level authorization vulnerabilities in GraphQL and REST endpoints.', questionCount: 15 },
        { id: 'prac-sec-m2', title: 'STRIDE Threat Modeling on Cloud Payment Architectures', category: 'Scenario Questions', description: 'Identify spoofing, tampering, and information disclosure boundaries in a fintech payment gateway.', questionCount: 14 },
        { id: 'prac-sec-m3', title: 'Container Escape & Privilege Escalation Triage', category: 'Scenario Questions', description: 'Diagnose and mitigate a container breakout exploiting misconfigured Linux capabilities.', questionCount: 12 },
      ],
      interviewTopics: [
        {
          id: 'int-sec-m1',
          topic: 'Threat Modeling & Architectural Security',
          category: 'System Design',
          questionCount: 3,
          keyQuestions: [
            'How do you lead a STRIDE threat modeling session with product engineers for a new microservices architecture?',
            'Explain how Server-Side Request Forgery (SSRF) works and how cloud metadata endpoints can be protected against it.',
            'How do you design a secure mutual TLS (mTLS) infrastructure between microservices using HashiCorp Vault PKI?',
          ],
        },
        {
          id: 'int-sec-m2',
          topic: 'Offensive Exploitation & Defense Gap Analysis',
          category: 'Role Specific',
          questionCount: 2,
          keyQuestions: [
            'How do you utilize the MITRE ATT&CK framework to identify defensive detection gaps in an enterprise SOC?',
            'What specific runtime indicators would alert you that an attacker is attempting to escape a container to the host node?',
          ],
        },
      ],
      readinessChecklist: [
        { id: 'chk-1', label: 'Mid-Level Security Resume Highlighting Penetration Tests, Threat Modeling, and Cloud Hardening', status: 'Essential', type: 'resume' },
        { id: 'chk-2', label: 'Comprehensive Redacted Penetration Testing Report Conforming to Professional PTES Standards', status: 'Essential', type: 'practical' },
        { id: 'chk-3', label: 'Threat Model Diagram and Risk Assessment Matrix for a Distributed Cloud Architecture', status: 'Essential', type: 'practical' },
      ],
      roadmapStageDescriptions: {
        learn: 'Master offensive penetration testing, architectural threat modeling (STRIDE), and Kubernetes runtime defense.',
        practice: 'Conduct API authorization tests, author Falco detection rules, and map threat coverage to MITRE ATT&CK.',
        mentorship: 'Consult with Lead Security Architects on threat modeling enterprise architectures and balancing engineering velocity.',
        prepare: 'Master technical security interviews on SSRF, container escapes, threat modeling, and cryptographic key management.',
        jobReady: 'Showcase penetration testing reports, threat model case studies, and Kubernetes runtime defense configurations.',
        opportunities: 'Target Senior Cybersecurity Engineer, Application Security Engineer, and Cloud Security Specialist roles (3–5 years).',
      },
    },

    senior: {
      id: 'senior',
      label: 'Senior',
      roleTitle: 'Principal Security Architect / CISO Advisor',
      experienceRange: '5+ yrs',
      description: 'Focuses on enterprise zero-trust architecture, regulatory compliance governance (SOC 2, ISO 27001), corporate risk management, and crisis leadership.',
      focusSummary: 'Architect enterprise zero-trust security postures, direct corporate compliance and risk management programs, advise C-suite executives, and lead major incident crisis command.',
      expectedCompetencies: [
        'Enterprise Zero-Trust Architecture & Software-Defined Perimeter design',
        'Regulatory Compliance frameworks (SOC 2 Type II, ISO 27001, HIPAA, GDPR, FedRAMP)',
        'Executive C-suite risk quantification, board presentations, and cyber insurance strategy',
        'Secure Software Development Lifecycle (SSDLC) governance and security champions programs',
        'Crisis leadership, major incident command, and regulatory breach notification management',
      ],
      responsibilities: [
        'Define enterprise cybersecurity strategy, risk tolerance guidelines, and zero-trust architectural standards.',
        'Present cyber risk metrics, threat landscape evaluations, and security capital budgets to executive leadership.',
        'Lead organization-wide audit readiness for SOC 2 Type II and ISO 27001 certification renewals.',
        'Serve as Incident Commander during critical security incidents, managing technical, legal, and executive communication.',
      ],
      practicalWorkTitle: 'Security Labs, Defense Audits & Simulations',
      practicalWorkDescription: 'Author enterprise zero-trust blueprints, corporate GRC frameworks, and crisis response tabletop exercises.',
      skillGroups: {
        mustKnow: [
          { name: 'Enterprise Zero-Trust Strategy', level: 'EXPERT', importance: 'MUST_KNOW', description: 'Identity governance, micro-segmentation, conditional access, and device posture checking.' },
          { name: 'Governance, Risk & Compliance (GRC)', level: 'EXPERT', importance: 'MUST_KNOW', description: 'SOC 2 Type II controls, ISO 27001 ISMS, third-party vendor risk, and compliance automation.' },
          { name: 'Executive Risk Communication', level: 'ADVANCED', importance: 'MUST_KNOW', description: 'Quantifying risk in financial terms (FAIR model), board presentations, and cyber insurance.' },
          { name: 'SSDLC Governance & DevSecOps', level: 'EXPERT', importance: 'MUST_KNOW', description: 'Establishing secure coding policies, security champions programs, and release gates.' },
        ],
        goodToKnow: [
          { name: 'Crisis Leadership & Incident Command', level: 'ADVANCED', importance: 'GOOD_TO_KNOW', description: 'FEMA ICS principles, legal disclosure obligations, and crisis public relations.' },
          { name: 'Supply Chain Risk Management', level: 'ADVANCED', importance: 'GOOD_TO_KNOW', description: 'Vendor risk assessments, open-source dependency auditing, and software bill of materials (SBOM).' },
        ],
        advanced: [
          { name: 'National Security & Regulatory Frameworks', level: 'ADVANCED', importance: 'ADVANCED', description: 'NIST CSF 2.0, FedRAMP, and cross-border data sovereignty compliance.' },
        ],
      },
      learningPhases: [
        {
          phaseNumber: '01',
          title: 'ENTERPRISE ZERO-TRUST ARCHITECTURE',
          subtitle: 'Identity-Driven Security Strategy',
          description: 'Design comprehensive zero-trust architectures spanning identity, endpoints, and micro-segmentation.',
          topics: ['Software-defined perimeters (SDP)', 'Conditional access policies & MFA federation', 'Network micro-segmentation', 'Continuous device trust verification'],
          skills: ['Enterprise Zero-Trust Strategy'],
        },
        {
          phaseNumber: '02',
          title: 'GOVERNANCE, RISK & REGULATORY COMPLIANCE',
          subtitle: 'SOC 2, ISO 27001 & Audit Readiness',
          description: 'Implement enterprise compliance frameworks and automate continuous audit evidence collection.',
          topics: ['ISO 27001 Information Security Management System (ISMS)', 'SOC 2 Type II trust principles', 'Automated compliance platforms (Vanta / Drata)', 'Third-party vendor risk management'],
          skills: ['Governance, Risk & Compliance (GRC)', 'Executive Risk Communication'],
        },
        {
          phaseNumber: '03',
          title: 'CRISIS LEADERSHIP & EXECUTIVE GOVERNANCE',
          subtitle: 'Major Incident Command & Board Reporting',
          description: 'Direct organizational crisis response, regulatory breach disclosures, and C-suite strategy.',
          topics: ['Incident Commander roles & responsibilities', 'Regulatory breach reporting timelines (SEC / GDPR)', 'Designing executive crisis tabletop exercises', 'Quantifying cyber risk for the Board of Directors'],
          skills: ['Crisis Leadership & Incident Command', 'SSDLC Governance & DevSecOps'],
        },
      ],
      practicalWork: [
        {
          id: 'p-sec-s1',
          title: 'Enterprise Zero-Trust Security Architecture Strategy & Blueprint',
          difficulty: 'Advanced',
          skillsRequired: ['Enterprise Zero-Trust Strategy', 'Governance, Risk & Compliance (GRC)'],
          description: 'Author an enterprise zero-trust architectural blueprint for an organization with 2,000+ employees and multi-cloud infrastructure, detailing identity federation, endpoint validation, and micro-segmentation.',
          expectedOutcome: 'Comprehensive Architecture Decision Record (ADR), threat boundary diagrams, and phased migration roadmap.',
        },
        {
          id: 'p-sec-s2',
          title: 'Enterprise SOC 2 Type II Readiness & Audit Automation Framework',
          difficulty: 'Advanced',
          skillsRequired: ['Governance, Risk & Compliance (GRC)', 'SSDLC Governance & DevSecOps'],
          description: 'Design and implement an automated compliance monitoring program mapping technical security controls to SOC 2 Type II trust criteria across engineering squads.',
          expectedOutcome: 'Complete corporate security policy suite, control implementation matrix, and automated audit evidence collection scripts.',
        },
      ],
      certifications: [
        { id: 'cert-sec-cissp', name: 'Certified Information Systems Security Professional (CISSP)', issuingOrganization: 'ISC2', level: 'Advanced' },
        { id: 'cert-sec-cism', name: 'Certified Information Security Manager (CISM)', issuingOrganization: 'ISACA', level: 'Advanced' },
      ],
      practiceAreas: [
        { id: 'prac-sec-s1', title: 'Board of Directors Cyber Risk Presentation Scenario', category: 'Scenario Questions', description: 'Present a strategic $5M security capital expenditure proposal and justify ROI using risk reduction models.', questionCount: 14 },
        { id: 'prac-sec-s2', title: 'Catastrophic Supply Chain Ransomware Tabletop Simulation', category: 'Scenario Questions', description: 'Serve as Incident Commander coordinating technical isolation, legal disclosure, and executive public relations.', questionCount: 12 },
        { id: 'prac-sec-s3', title: 'Vendor Security Review & SLA Contract Negotiation', category: 'Scenario Questions', description: 'Evaluate vendor security postures and negotiate binding cybersecurity SLA terms.', questionCount: 10 },
      ],
      interviewTopics: [
        {
          id: 'int-sec-s1',
          topic: 'Enterprise Security Strategy & Board Communication',
          category: 'System Design',
          questionCount: 3,
          keyQuestions: [
            'How do you mathematically quantify cybersecurity risk to a Board of Directors that primarily focuses on financial metrics?',
            'How do you design an enterprise zero-trust architecture that prevents lateral movement without degrading employee productivity?',
            'What specific governance controls do you institute across engineering teams to prevent secret sprawl and insecure code deployments?',
          ],
        },
        {
          id: 'int-sec-s2',
          topic: 'Major Breach Crisis Management & Legal Disclosure',
          category: 'Role Specific',
          questionCount: 2,
          keyQuestions: [
            'As Incident Commander during a confirmed customer data exfiltration incident, how do you balance forensic preservation with business recovery and legal notification mandates?',
            'How do you establish a high-impact security champions program that successfully shifts security responsibilities into product engineering squads?',
          ],
        },
      ],
      readinessChecklist: [
        { id: 'chk-1', label: 'Executive Security Leadership Resume Demonstrating C-Suite Advisory, Audit Leadership & Program Management', status: 'Essential', type: 'resume' },
        { id: 'chk-2', label: 'Enterprise Security Architecture Specification Whitepaper or Zero-Trust Migration Blueprint', status: 'Essential', type: 'practical' },
        { id: 'chk-3', label: 'Proven Track Record Leading SOC 2 Type II or ISO 27001 Audits & Incident Command Tabletop Exercises', status: 'Essential', type: 'experience' },
      ],
      roadmapStageDescriptions: {
        learn: 'Master enterprise zero-trust strategy, regulatory compliance governance, and executive risk management.',
        practice: 'Lead executive crisis tabletop simulations, author architectural blueprints, and model financial cyber risk.',
        mentorship: 'Engage with CISOs and Board-level advisors on enterprise governance, cyber insurance, and legal obligations.',
        prepare: 'Master executive-level cybersecurity interviews on board communication, zero-trust trade-offs, and crisis response.',
        jobReady: 'Showcase enterprise zero-trust whitepapers, compliance audit successes, and organizational governance frameworks.',
        opportunities: 'Connect with Principal Security Architect, Director of Information Security, and CISO roles (5+ years).',
      },
    },
  },

  // ==========================================
  // DEVOPS ENGINEER
  // ==========================================
  'devops-engineer': {
    entry: {
      id: 'entry',
      label: 'Beginner / Entry Level',
      roleTitle: 'Associate DevOps Engineer',
      experienceRange: '0–1 yrs',
      description: 'Focuses on Linux administration, Docker containerization, basic GitHub Actions CI workflows, and Git branching hygiene.',
      focusSummary: 'Master core Linux system administration, writing optimized Dockerfiles, setting up basic continuous integration pipelines, and cloud compute fundamentals.',
      expectedCompetencies: [
        'Linux command-line navigation, systemd, and Bash scripting',
        'Writing clean, multi-stage Dockerfiles',
        'Automating lint and test workflows in GitHub Actions',
        'Git branching, merging, and pull request hygiene',
        'Basic cloud compute (AWS EC2 / Virtual Machines)',
      ],
      responsibilities: [
        'Maintain automated linting and unit test execution in GitHub Actions pipelines.',
        'Package backend and frontend applications into secure, lightweight Docker containers.',
        'Provision cloud virtual machines and configure basic firewall and security groups.',
        'Assist software engineering teams with local Docker environment debugging and build errors.',
      ],
      practicalWorkTitle: 'Infrastructure Labs & CI/CD Pipelines',
      practicalWorkDescription: 'Construct reproducible development environments, multi-stage container builds, and automated CI pipelines.',
      skillGroups: {
        mustKnow: [
          { name: 'Linux & Bash', level: 'BEGINNER', importance: 'MUST_KNOW', description: 'File systems, permissions, process monitoring, and shell scripts.' },
          { name: 'Docker', level: 'BEGINNER', importance: 'MUST_KNOW', description: 'Images, containers, Dockerfiles, volumes, and port mapping.' },
          { name: 'Git & GitHub', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'Branch management, pull requests, merge conflict resolution, and tags.' },
          { name: 'CI/CD Automation', level: 'BEGINNER', importance: 'MUST_KNOW', description: 'GitHub Actions syntax, jobs, steps, environment secrets, and triggers.' },
        ],
        goodToKnow: [
          { name: 'Python Scripting', level: 'BEGINNER', importance: 'GOOD_TO_KNOW', description: 'Automating OS tasks, HTTP API queries, and log parsing.' },
          { name: 'Cloud Basics (AWS EC2 / S3)', level: 'BEGINNER', importance: 'GOOD_TO_KNOW', description: 'Virtual server provisioning, object storage, and security groups.' },
        ],
        advanced: [
          { name: 'Docker Compose', level: 'BEGINNER', importance: 'ADVANCED', description: 'Multi-container local service coordination and environment variables.' },
        ],
      },
      learningPhases: [
        {
          phaseNumber: '01',
          title: 'LINUX & BASH AUTOMATION',
          subtitle: 'Systems & Shell Foundations',
          description: 'Master the operating system foundation underlying modern cloud containers.',
          topics: ['Linux file permissions & chmod', 'Bash scripting & control flow', 'Process management (ps, kill, top)', 'SSH key authentication'],
          skills: ['Linux & Bash', 'Git & GitHub'],
          recommendedCourse: { id: 'c-do-e1', title: 'Linux Fundamentals for DevOps', provider: 'PATHWAY Academy', level: 'Beginner', available: true },
        },
        {
          phaseNumber: '02',
          title: 'CONTAINERS WITH DOCKER',
          subtitle: 'Packaging Applications',
          description: 'Containerize web applications with minimal footprint and non-root security.',
          topics: ['Docker layer caching', 'Multi-stage builds', 'Container networking', 'Volume persistence'],
          skills: ['Docker', 'Docker Compose'],
        },
        {
          phaseNumber: '03',
          title: 'AUTOMATED CI PIPELINES',
          subtitle: 'Continuous Integration',
          description: 'Automate build, lint, and unit test validation on every code commit.',
          topics: ['GitHub Actions workflows', 'Secret management in CI', 'Matrix builds', 'Publishing container images'],
          skills: ['CI/CD Automation', 'Python Scripting'],
        },
      ],
      practicalWork: [
        {
          id: 'p-do-e1',
          title: 'Multi-Stage Containerized Node & Python Microservice',
          difficulty: 'Beginner',
          skillsRequired: ['Docker', 'Linux & Bash'],
          description: 'Author an optimized multi-stage Dockerfile that drops build dependencies, creates a non-root system user, and yields a sub-80MB image.',
          expectedOutcome: 'Tested Dockerfile with security scan passing and verified container runtime.',
        },
        {
          id: 'p-do-e2',
          title: 'Automated Test & Docker Publish GitHub Actions Pipeline',
          difficulty: 'Beginner',
          skillsRequired: ['CI/CD Automation', 'Git & GitHub', 'Docker'],
          description: 'Configure a GitHub Actions workflow that executes tests on pull requests and pushes version-tagged images to Docker Hub on main merge.',
          expectedOutcome: 'Live GitHub Actions pipeline with build badges, secret management, and artifact caching.',
        },
      ],
      certifications: [
        { id: 'cert-do-lpic1', name: 'Linux Professional Institute LPIC-1', issuingOrganization: 'LPI', level: 'Foundation' },
        { id: 'cert-do-gha', name: 'GitHub Actions Foundations', issuingOrganization: 'GitHub', level: 'Foundation' },
      ],
      practiceAreas: [
        { id: 'prac-do-e1', title: 'Dockerfile Optimization & Layer Caching Drills', category: 'Technical Challenges', description: 'Solve 15 challenges reducing image bloat and caching intermediate stages.', questionCount: 15 },
        { id: 'prac-do-e2', title: 'Bash String & Log Parsing Drills', category: 'Technical Challenges', description: 'Extract IP addresses, response codes, and error metrics from web server logs.', questionCount: 12 },
        { id: 'prac-do-e3', title: 'CI/CD Pipeline Failure Triage', category: 'Scenario Questions', description: 'Diagnose secret credential errors, runner timeouts, and matrix build failures.', questionCount: 10 },
      ],
      interviewTopics: [
        {
          id: 'int-do-e1',
          topic: 'Linux & Containerization Fundamentals',
          category: 'Technical',
          questionCount: 3,
          keyQuestions: [
            'What is the difference between CMD and ENTRYPOINT in a Dockerfile?',
            'How do Docker multi-stage builds help optimize production container images?',
            'How do file permissions work in Linux (read, write, execute for user, group, other)?',
          ],
        },
        {
          id: 'int-do-e2',
          topic: 'CI/CD & Source Control Hygiene',
          category: 'Role Specific',
          questionCount: 2,
          keyQuestions: [
            'How do you pass artifacts and variables between stages in a continuous integration pipeline?',
            'How do you securely handle sensitive credentials and API keys in CI/CD runners?',
          ],
        },
      ],
      readinessChecklist: [
        { id: 'chk-1', label: 'DevOps-Focused Resume Highlighting Linux, Docker & CI/CD Labs', status: 'Essential', type: 'resume' },
        { id: 'chk-2', label: 'GitHub Repository with Documented GitHub Actions CI Workflows & Multi-Stage Dockerfiles', status: 'Essential', type: 'practical' },
        { id: 'chk-3', label: 'Demonstrated Linux Command-Line Fluency & Bash Automation Scripts', status: 'Essential', type: 'skills' },
      ],
      roadmapStageDescriptions: {
        learn: 'Master Linux administration, shell scripting, container packaging with Docker, and CI fundamentals.',
        practice: 'Build multi-stage Dockerfiles, write Bash log parsers, and resolve CI runner build failures.',
        mentorship: 'Connect with DevOps Engineers to review pipeline configurations and container security hygiene.',
        prepare: 'Prepare for entry-level DevOps technical interviews on Linux concepts, Dockerfiles, and Git branching.',
        jobReady: 'Showcase a public GitHub repository with automated CI workflows and lightweight Docker containers.',
        opportunities: 'Target Junior and Associate DevOps Engineer and Cloud Operations roles (0–1 years).',
      },
    },

    junior: {
      id: 'junior',
      label: 'Junior',
      roleTitle: 'Junior DevOps Engineer',
      experienceRange: '1–3 yrs',
      description: 'Focuses on Infrastructure as Code with Terraform, Kubernetes manifest authoring, multi-environment deployment pipelines, and Prometheus monitoring.',
      focusSummary: 'Provision reproducible cloud infrastructure via Terraform, orchestrate workloads in Kubernetes, implement staging/production deployment gates, and configure observability.',
      expectedCompetencies: [
        'Declarative infrastructure provisioning with Terraform modules & state locking',
        'Authoring Kubernetes Deployments, Services, ConfigMaps, and Ingress',
        'Multi-stage CI/CD pipelines deploying to staging and production clusters',
        'Prometheus metrics collection, Alertmanager rules, and Grafana dashboards',
        'Cloud networking basics (VPCs, subnets, NAT gateways, load balancers)',
      ],
      responsibilities: [
        'Write modular Terraform configurations provisioning VPCs, database instances, and compute clusters.',
        'Deploy and scale containerized backend applications on managed Kubernetes (EKS / GKE).',
        'Construct automated deployment pipelines with smoke testing, health checks, and approval gates.',
        'Configure Prometheus alerting rules and create operational Grafana dashboards for service uptime.',
      ],
      practicalWorkTitle: 'Infrastructure Labs & CI/CD Pipelines',
      practicalWorkDescription: 'Automate cloud infrastructure lifecycle with Terraform and orchestrate container workloads on Kubernetes.',
      skillGroups: {
        mustKnow: [
          { name: 'Terraform', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'HCL syntax, modules, remote state in S3/DynamoDB, and plan/apply workflows.' },
          { name: 'Kubernetes', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'Deployments, ReplicaSets, Services, Ingress, namespaces, and resource limits.' },
          { name: 'CI/CD Pipelines', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'Automated staging/production deployment gates, smoke tests, and rollback triggers.' },
          { name: 'Cloud Networking', level: 'INTERMEDIATE', importance: 'MUST_KNOW', description: 'VPCs, public/private subnets, route tables, and Application Load Balancers.' },
        ],
        goodToKnow: [
          { name: 'Prometheus & Grafana', level: 'INTERMEDIATE', importance: 'GOOD_TO_KNOW', description: 'PromQL queries, node_exporter metrics, and dashboard authoring.' },
          { name: 'Helm Package Manager', level: 'INTERMEDIATE', importance: 'GOOD_TO_KNOW', description: 'Chart templates, values files, and release versioning.' },
        ],
        advanced: [
          { name: 'Secret Management (Vault / KMS)', level: 'INTERMEDIATE', importance: 'ADVANCED', description: 'External secrets operator and KMS envelope encryption.' },
        ],
      },
      learningPhases: [
        {
          phaseNumber: '01',
          title: 'INFRASTRUCTURE AS CODE WITH TERRAFORM',
          subtitle: 'Automated Provisioning',
          description: 'Manage cloud lifecycle declaratively with version-controlled Terraform modules.',
          topics: ['Terraform state locking with S3 & DynamoDB', 'Module composition & inputs', 'Resource dependencies', 'Drift detection'],
          skills: ['Terraform', 'Cloud Networking'],
          recommendedCourse: { id: 'c-do-j1', title: 'Terraform Infrastructure as Code in Production', provider: 'PATHWAY Academy', level: 'Intermediate', available: true },
        },
        {
          phaseNumber: '02',
          title: 'KUBERNETES WORKLOAD ORCHESTRATION',
          subtitle: 'Cluster Deployments',
          description: 'Deploy, scale, and network containerized applications on Kubernetes clusters.',
          topics: ['Pod lifecycle & restart policies', 'ClusterIP vs NodePort vs LoadBalancer', 'ConfigMaps & Secrets', 'Horizontal Pod Autoscaler (HPA)'],
          skills: ['Kubernetes', 'Helm Package Manager'],
        },
        {
          phaseNumber: '03',
          title: 'OBSERVABILITY & MONITORING',
          subtitle: 'Metrics, Alerts & Dashboards',
          description: 'Instrument systems with Prometheus metrics and configure proactive alerting.',
          topics: ['Prometheus scraping architecture', 'PromQL metric expressions', 'Alertmanager routing', 'Grafana operational dashboards'],
          skills: ['Prometheus & Grafana'],
        },
      ],
      practicalWork: [
        {
          id: 'p-do-j1',
          title: 'Production Terraform Module: Multi-AZ VPC & Managed Kubernetes',
          difficulty: 'Intermediate',
          skillsRequired: ['Terraform', 'Cloud Networking'],
          description: 'Develop reusable Terraform modules provisioning a multi-AZ VPC with public/private subnets, NAT gateways, and an EKS cluster with remote S3 state locking.',
          expectedOutcome: 'Tested Terraform codebase with clean module interfaces and validated plan/apply execution.',
        },
        {
          id: 'p-do-j2',
          title: 'Automated Kubernetes Deployment with Helm & Canary Health Checks',
          difficulty: 'Intermediate',
          skillsRequired: ['Kubernetes', 'Helm Package Manager', 'CI/CD Pipelines'],
          description: 'Author a Helm chart deploying a web service with readiness/liveness probes, HPA autoscaling, and a CI/CD pipeline triggering automated rollbacks upon failed health checks.',
          expectedOutcome: 'Functioning continuous deployment pipeline with automated rollback verification.',
        },
      ],
      certifications: [
        { id: 'cert-do-hashi-ta', name: 'HashiCorp Certified: Terraform Associate', issuingOrganization: 'HashiCorp', level: 'Intermediate' },
        { id: 'cert-do-ckad', name: 'Certified Kubernetes Application Developer (CKAD)', issuingOrganization: 'CNCF', level: 'Intermediate' },
      ],
      practiceAreas: [
        { id: 'prac-do-j1', title: 'Kubernetes CrashLoopBackOff & OOMKilled Triage', category: 'Scenario Questions', description: 'Diagnose misconfigured resource limits, missing secrets, and failed readiness probes.', questionCount: 15 },
        { id: 'prac-do-j2', title: 'Terraform State Drift & Lock Recovery', category: 'Technical Challenges', description: 'Reconcile out-of-band resource modifications and recover stuck state lock IDs.', questionCount: 12 },
        { id: 'prac-do-j3', title: 'PromQL Alerting Expression Authoring', category: 'Technical Challenges', description: 'Write PromQL queries calculating error rates, 95th percentile latency, and disk consumption.', questionCount: 14 },
      ],
      interviewTopics: [
        {
          id: 'int-do-j1',
          topic: 'Kubernetes Networking & Pod Lifecycle',
          category: 'Technical',
          questionCount: 3,
          keyQuestions: [
            'How does a Kubernetes Service route network traffic to healthy pods?',
            'What is the precise difference between liveness, readiness, and startup probes?',
            'What happens when a pod exceeds its memory limit versus its CPU limit?',
          ],
        },
        {
          id: 'int-do-j2',
          topic: 'Terraform State & Disaster Recovery',
          category: 'Role Specific',
          questionCount: 2,
          keyQuestions: [
            'How does Terraform manage concurrent execution and prevent state corruption using DynamoDB?',
            'What steps do you take when terraform plan reports that resources were modified outside of Terraform?',
          ],
        },
      ],
      readinessChecklist: [
        { id: 'chk-1', label: 'Resume Showcasing Terraform Modules, Kubernetes Deployments & CI/CD Experience', status: 'Essential', type: 'resume' },
        { id: 'chk-2', label: 'Modular Terraform GitHub Repository with Clean Variables & S3 Remote State', status: 'Essential', type: 'practical' },
        { id: 'chk-3', label: 'Packaged Helm Chart with Production Readiness Probes & Autoscaling Rules', status: 'Essential', type: 'practical' },
      ],
      roadmapStageDescriptions: {
        learn: 'Deepen skills in Infrastructure as Code with Terraform, Kubernetes workload orchestration, and monitoring.',
        practice: 'Troubleshoot CrashLoopBackOff errors, manage state drift in Terraform, and write PromQL alerts.',
        mentorship: 'Seek guidance from Senior DevOps Engineers on cluster scalability, Helm chart packaging, and networking.',
        prepare: 'Master junior-level DevOps interviews on Kubernetes pod life cycles, Terraform state, and CI/CD staging gates.',
        jobReady: 'Build a verified portfolio containing modular Terraform code and Helm charts deployed to a live cluster.',
        opportunities: 'Target Junior and Mid DevOps Engineer, Cloud Engineer, and SRE roles (1–3 years).',
      },
    },

    mid: {
      id: 'mid',
      label: 'Mid-Level',
      roleTitle: 'DevOps & Reliability Engineer',
      experienceRange: '3–5 yrs',
      description: 'Focuses on production Kubernetes administration, GitOps continuous delivery with ArgoCD, DevSecOps pipeline scanning, and SRE error budgets.',
      focusSummary: 'Architect high-availability Kubernetes platforms, automate deployment sync via GitOps (ArgoCD), enforce security scanning in pipelines, and lead incident resolution.',
      expectedCompetencies: [
        'Production Kubernetes cluster administration (ingress controllers, network policies, cert-manager)',
        'GitOps continuous delivery architecture using ArgoCD or Flux',
        'Integrating security scanning (Trivy, SonarQube, OPA/Kyverno) into CI/CD',
        'Site Reliability Engineering practices (SLIs, SLOs, error budgets, post-mortems)',
        'Centralized logging and distributed tracing (ELK / Loki, OpenTelemetry)',
      ],
      responsibilities: [
        'Architect and maintain multi-tenant Kubernetes clusters with automated node autoscaling (Karpenter / CAS).',
        'Implement GitOps workflows with ArgoCD ensuring Git is the single source of truth for all environment state.',
        'Integrate container vulnerability scanning, static code analysis, and license compliance into pipelines.',
        'Participate in on-call incident rotation, drive blameless post-mortems, and establish SLO error budget monitoring.',
      ],
      practicalWorkTitle: 'Infrastructure Labs & CI/CD Pipelines',
      practicalWorkDescription: 'Implement GitOps continuous delivery, DevSecOps supply chain security, and SRE observability platforms.',
      skillGroups: {
        mustKnow: [
          { name: 'Kubernetes Administration', level: 'ADVANCED', importance: 'MUST_KNOW', description: 'RBAC, NetworkPolicies, Ingress-Nginx, cert-manager, and cluster upgrades.' },
          { name: 'GitOps (ArgoCD / Flux)', level: 'ADVANCED', importance: 'MUST_KNOW', description: 'ApplicationSets, sync policies, automated rollbacks, and multi-cluster drift detection.' },
          { name: 'DevSecOps & Supply Chain', level: 'ADVANCED', importance: 'MUST_KNOW', description: 'Trivy container scanning, Cosign image signing, and OPA/Kyverno admission controllers.' },
          { name: 'SRE & SLO Monitoring', level: 'ADVANCED', importance: 'MUST_KNOW', description: 'Service Level Objectives, error budget alerts, and distributed tracing with OpenTelemetry.' },
        ],
        goodToKnow: [
          { name: 'Service Mesh (Istio / Linkerd)', level: 'INTERMEDIATE', importance: 'GOOD_TO_KNOW', description: 'Mutual TLS (mTLS), canary traffic splitting, and circuit breaking.' },
          { name: 'HashiCorp Vault', level: 'ADVANCED', importance: 'GOOD_TO_KNOW', description: 'Dynamic database secrets, transit encryption, and Kubernetes service account auth.' },
        ],
        advanced: [
          { name: 'Chaos Engineering & Load Testing', level: 'ADVANCED', importance: 'ADVANCED', description: 'Chaos Mesh / LitmusChaos, k6 load testing, and resilience verification.' },
        ],
      },
      learningPhases: [
        {
          phaseNumber: '01',
          title: 'PRODUCTION KUBERNETES & GITOPS',
          subtitle: 'ArgoCD & Cluster Management',
          description: 'Manage declarative multi-environment cluster state with ArgoCD GitOps.',
          topics: ['ArgoCD ApplicationSets', 'Kubernetes NetworkPolicies', 'Cluster node autoscaling (Karpenter)', 'Zero-downtime cluster upgrades'],
          skills: ['Kubernetes Administration', 'GitOps (ArgoCD / Flux)'],
          recommendedCourse: { id: 'c-do-m1', title: 'GitOps and Kubernetes Platform Administration', provider: 'PATHWAY Academy', level: 'Intermediate', available: true },
        },
        {
          phaseNumber: '02',
          title: 'DEVSECOPS & SUPPLY CHAIN SECURITY',
          subtitle: 'Zero-Trust Pipeline Security',
          description: 'Harden continuous delivery pipelines with vulnerability scanning and admission control.',
          topics: ['Container image signing with Cosign', 'OPA Gatekeeper / Kyverno policies', 'Secrets management with Vault', 'Software Bill of Materials (SBOM)'],
          skills: ['DevSecOps & Supply Chain', 'HashiCorp Vault'],
        },
        {
          phaseNumber: '03',
          title: 'SITE RELIABILITY ENGINEERING (SRE)',
          subtitle: 'Observability & Error Budgets',
          description: 'Establish SLOs, implement distributed tracing, and conduct blameless incident reviews.',
          topics: ['Defining SLIs/SLOs/Error budgets', 'OpenTelemetry instrumentation', 'Incident response & blameless post-mortems', 'Chaos engineering experiments'],
          skills: ['SRE & SLO Monitoring', 'Chaos Engineering & Load Testing'],
        },
      ],
      practicalWork: [
        {
          id: 'p-do-m1',
          title: 'Enterprise Multi-Cluster GitOps Platform with ArgoCD & HashiCorp Vault',
          difficulty: 'Advanced',
          skillsRequired: ['GitOps (ArgoCD / Flux)', 'Kubernetes Administration', 'HashiCorp Vault'],
          description: 'Design and deploy a GitOps repository structure managing staging and production EKS clusters, featuring automated sync, Helm values overrides, and Vault external secrets injection.',
          expectedOutcome: 'Multi-cluster GitOps architecture with zero manual kubectl intervention and automated sync verification.',
        },
        {
          id: 'p-do-m2',
          title: 'Zero-Downtime Canary Deployment & Automated Error Budget Rollback',
          difficulty: 'Advanced',
          skillsRequired: ['Service Mesh (Istio / Linkerd)', 'SRE & SLO Monitoring', 'CI/CD Pipelines'],
          description: 'Implement an automated canary release controller (Argo Rollouts / Istio) that shifts traffic incrementally and triggers an automated rollback if HTTP 5xx error rate exceeds 0.5%.',
          expectedOutcome: 'Production canary release pipeline with automated health verification and Prometheus metric telemetry.',
        },
      ],
      certifications: [
        { id: 'cert-do-cka', name: 'Certified Kubernetes Administrator (CKA)', issuingOrganization: 'CNCF', level: 'Advanced' },
        { id: 'cert-do-aws-devops', name: 'AWS Certified DevOps Engineer – Professional', issuingOrganization: 'Amazon Web Services', level: 'Advanced' },
      ],
      practiceAreas: [
        { id: 'prac-do-m1', title: 'Kubernetes ETCD Backup & Disaster Recovery Scenarios', category: 'Scenario Questions', description: 'Restore a corrupted cluster control plane from snapshot without data loss.', questionCount: 15 },
        { id: 'prac-do-m2', title: 'Admission Controller & OPA Policy Enforcement', category: 'Technical Challenges', description: 'Write Kyverno and OPA policies disallowing privileged containers and enforcing resource limits.', questionCount: 14 },
        { id: 'prac-do-m3', title: 'Cascading Failure & Circuit Breaker Simulation', category: 'Scenario Questions', description: 'Diagnose connection pool exhaustion, thread starvation, and configure Istio circuit breakers.', questionCount: 12 },
      ],
      interviewTopics: [
        {
          id: 'int-do-m1',
          topic: 'High-Availability Kubernetes Architecture',
          category: 'System Design',
          questionCount: 3,
          keyQuestions: [
            'How do you design an in-place zero-downtime Kubernetes cluster upgrade across multiple worker node groups?',
            'Explain how GitOps handles configuration drift when someone executes manual changes via kubectl.',
            'How do NetworkPolicies enforce zero-trust pod isolation inside a shared Kubernetes namespace?',
          ],
        },
        {
          id: 'int-do-m2',
          topic: 'SRE Principles & Incident Leadership',
          category: 'Role Specific',
          questionCount: 2,
          keyQuestions: [
            'How do you calculate an error budget for a 99.9% availability SLO and what actions do you enforce when it burns down?',
            'Walk through your incident response protocol when a major cloud region experiences packet loss affecting production API traffic.',
          ],
        },
      ],
      readinessChecklist: [
        { id: 'chk-1', label: 'Mid-Level SRE/DevOps Resume Highlighting Uptime Metrics, GitOps & Production Scale', status: 'Essential', type: 'resume' },
        { id: 'chk-2', label: 'GitOps Repository (ArgoCD/Flux) Demonstrating Multi-Cluster Management & Vault Secrets', status: 'Essential', type: 'practical' },
        { id: 'chk-3', label: 'Documented Post-Mortem and Incident Response Case Study Demonstrating SRE Leadership', status: 'Essential', type: 'experience' },
      ],
      roadmapStageDescriptions: {
        learn: 'Master advanced Kubernetes administration, GitOps continuous delivery, DevSecOps, and SRE error budgets.',
        practice: 'Simulate ETCD cluster recoveries, enforce OPA security guardrails, and build canary deployment pipelines.',
        mentorship: 'Engage with Principal Platform Engineers on GitOps workflows, disaster recovery planning, and SRE best practices.',
        prepare: 'Prepare for senior technical interviews on high-scale cluster design, supply chain security, and incident triage.',
        jobReady: 'Showcase real-world GitOps and canary deployment case studies with documented post-mortems.',
        opportunities: 'Target Senior DevOps Engineer, SRE, and Platform Engineer positions (3–5 years).',
      },
    },

    senior: {
      id: 'senior',
      label: 'Senior',
      roleTitle: 'Staff DevOps Architect / Platform Lead',
      experienceRange: '5+ yrs',
      description: 'Focuses on enterprise platform engineering strategy, multi-region cloud resilience, Internal Developer Platforms (IDPs), and organizational FinOps.',
      focusSummary: 'Direct enterprise platform engineering strategy, build self-service Internal Developer Platforms (Backstage), architect multi-region disaster recovery, and optimize multimillion-dollar cloud spend.',
      expectedCompetencies: [
        'Internal Developer Platform (IDP) architecture (Backstage, Kratix, self-service portals)',
        'Multi-region active-active cloud architecture and global disaster recovery (RTO < 5 min, RPO = 0)',
        'Enterprise FinOps governance, automated cloud cost optimization, and unit economics',
        'Zero-trust security compliance frameworks (SOC 2 Type II, ISO 27001, FedRAMP)',
        'Technical leadership, platform team topology design, and cross-functional mentoring',
      ],
      responsibilities: [
        'Define enterprise infrastructure architectural vision, platform standards, and reliability guidelines.',
        'Design self-service platform engineering portals empowering 100+ product engineers to provision resources securely.',
        'Direct cloud financial management (FinOps), auditing cloud expenditures and establishing rightsizing automation.',
        'Champion blameless engineering culture, author enterprise disaster recovery plans, and mentor staff engineers.',
      ],
      practicalWorkTitle: 'Infrastructure Labs & CI/CD Pipelines',
      practicalWorkDescription: 'Author enterprise platform architecture blueprints, disaster recovery plans, and FinOps frameworks.',
      skillGroups: {
        mustKnow: [
          { name: 'Platform Engineering & IDPs', level: 'EXPERT', importance: 'MUST_KNOW', description: 'Backstage software catalogs, golden path templates, and developer experience metrics.' },
          { name: 'Multi-Region Cloud Resilience', level: 'EXPERT', importance: 'MUST_KNOW', description: 'Global traffic management, cross-region replication, and automated failover orchestration.' },
          { name: 'Enterprise FinOps Strategy', level: 'ADVANCED', importance: 'MUST_KNOW', description: 'Cloud unit economics, commitment optimization (Savings Plans, RIs), and cost allocation tags.' },
          { name: 'Zero-Trust Infrastructure Architecture', level: 'EXPERT', importance: 'MUST_KNOW', description: 'Identity-based perimeters, automated compliance auditing, and cryptographic supply chain.' },
        ],
        goodToKnow: [
          { name: 'eBPF & Kernel Observability', level: 'ADVANCED', importance: 'GOOD_TO_KNOW', description: 'Cilium network routing, low-overhead kernel tracing, and runtime observability.' },
          { name: 'Executive Communication & Budgeting', level: 'ADVANCED', importance: 'GOOD_TO_KNOW', description: 'C-suite technology proposals, vendor contract negotiation, and ROI justification.' },
        ],
        advanced: [
          { name: 'Enterprise Regulatory Compliance (SOC2 / ISO)', level: 'ADVANCED', importance: 'ADVANCED', description: 'Automating audit evidence collection, immutable logging, and policy-as-code guardrails.' },
        ],
      },
      learningPhases: [
        {
          phaseNumber: '01',
          title: 'INTERNAL DEVELOPER PLATFORMS (IDPS)',
          subtitle: 'Golden Paths & Developer Self-Service',
          description: 'Architect self-service developer platforms that accelerate delivery velocity while enforcing guardrails.',
          topics: ['Backstage plugin architecture', 'Software catalog & template scaffolds', 'Measuring developer velocity (DORA & SPACE metrics)', 'Platform product management'],
          skills: ['Platform Engineering & IDPs'],
        },
        {
          phaseNumber: '02',
          title: 'GLOBAL MULTI-REGION RESILIENCE',
          subtitle: 'Disaster Recovery & High Availability',
          description: 'Engineer cross-region active-active architectures resilient to whole-cloud outages.',
          topics: ['Multi-region active-active Kubernetes federation', 'Cross-region database replication & latency', 'Automated Route53 / Cloudflare DNS failover', 'Chaos testing regional outages'],
          skills: ['Multi-Region Cloud Resilience', 'Zero-Trust Infrastructure Architecture'],
        },
        {
          phaseNumber: '03',
          title: 'FINOPS & ENTERPRISE COMPLIANCE',
          subtitle: 'Cost Optimization & Governance',
          description: 'Scale cloud operations financially and maintain continuous compliance across international standards.',
          topics: ['Cloud unit cost modeling', 'Automated resource rightsizing & scheduling', 'SOC 2 Type II continuous compliance automation', 'Executive stakeholder communication'],
          skills: ['Enterprise FinOps Strategy', 'Enterprise Regulatory Compliance (SOC2 / ISO)'],
        },
      ],
      practicalWork: [
        {
          id: 'p-do-s1',
          title: 'Enterprise Internal Developer Platform (IDP) Architecture Blueprint',
          difficulty: 'Advanced',
          skillsRequired: ['Platform Engineering & IDPs', 'Zero-Trust Infrastructure Architecture'],
          description: 'Author a comprehensive architectural design for an internal developer platform using Backstage and Kubernetes operators providing golden path templates for microservices, databases, and CI/CD.',
          expectedOutcome: 'Comprehensive Architecture Decision Record (ADR), component diagrams, and golden path template repository.',
        },
        {
          id: 'p-do-s2',
          title: 'Multi-Region Active-Active Cloud Disaster Recovery & FinOps Framework',
          difficulty: 'Advanced',
          skillsRequired: ['Multi-Region Cloud Resilience', 'Enterprise FinOps Strategy'],
          description: 'Design and validate an active-active multi-region cloud deployment architecture featuring cross-region data sync, DNS health routing, and an automated FinOps rightsizing framework reducing cloud spend by 25%.',
          expectedOutcome: 'Executive disaster recovery whitepaper, chaos engineering test plan, and FinOps cost modeling spreadsheet.',
        },
      ],
      certifications: [
        { id: 'cert-do-cks', name: 'Certified Kubernetes Security Specialist (CKS)', issuingOrganization: 'CNCF', level: 'Advanced' },
        { id: 'cert-do-focp', name: 'FinOps Certified Practitioner (FOCP)', issuingOrganization: 'FinOps Foundation', level: 'Advanced' },
      ],
      practiceAreas: [
        { id: 'prac-do-s1', title: 'Executive FinOps Cloud Cost Anomaly Resolution', category: 'Scenario Questions', description: 'Investigate and resolve a sudden $80,000 monthly cloud cost surge across distributed Kubernetes clusters.', questionCount: 14 },
        { id: 'prac-do-s2', title: 'Complete Regional Cloud Datacenter Outage Simulation', category: 'Scenario Questions', description: 'Coordinate automated multi-region failover when a primary cloud region experiences total network isolation.', questionCount: 12 },
        { id: 'prac-do-s3', title: 'Platform Engineering Golden Path vs Autonomy Defense', category: 'Scenario Questions', description: 'Defend platform architecture decisions before an executive engineering steering committee.', questionCount: 10 },
      ],
      interviewTopics: [
        {
          id: 'int-do-s1',
          topic: 'Platform Engineering Strategy & Architecture',
          category: 'System Design',
          questionCount: 3,
          keyQuestions: [
            'How do you balance developer autonomy with centralized infrastructure security and cost governance?',
            'Walk through your design for an Internal Developer Platform that abstracts cloud complexity without creating a bottleneck.',
            'How do you measure the business ROI and developer productivity impact of a platform engineering team?',
          ],
        },
        {
          id: 'int-do-s2',
          topic: 'Multi-Region Data Resilience & FinOps',
          category: 'Role Specific',
          questionCount: 2,
          keyQuestions: [
            'How do you achieve near-zero RTO and RPO across international regions while handling CAP theorem data consistency limits?',
            'How do you instill a culture of FinOps cost accountability among autonomous product engineering squads?',
          ],
        },
      ],
      readinessChecklist: [
        { id: 'chk-1', label: 'Executive Platform Engineering Resume Demonstrating Enterprise Scale, Team Leadership & FinOps ROI', status: 'Essential', type: 'resume' },
        { id: 'chk-2', label: 'Internal Developer Platform (IDP) Architecture Whitepaper or System Specification Blueprint', status: 'Essential', type: 'practical' },
        { id: 'chk-3', label: 'Demonstrated Multi-Region Disaster Recovery Strategy & Cloud Cost Optimization Portfolio', status: 'Essential', type: 'experience' },
      ],
      roadmapStageDescriptions: {
        learn: 'Master platform engineering strategy, multi-region cloud resilience, enterprise FinOps, and governance.',
        practice: 'Lead architecture reviews, simulate catastrophic regional outages, and design developer golden paths.',
        mentorship: 'Engage with VP of Infrastructure and CTO mentors on organizational team topologies and cloud strategy.',
        prepare: 'Master executive-level platform architecture evaluations and cross-functional leadership interviews.',
        jobReady: 'Showcase enterprise platform blueprints, FinOps savings case studies, and disaster recovery strategies.',
        opportunities: 'Connect with Staff DevOps Architect, Principal Platform Engineer, and VP of Infrastructure roles.',
      },
    },
  },

};

/**
 * Universal Fallback Level Generator.
 * Derives rich, domain-appropriate level definitions for any career path that does not have
 * a bespoke configuration yet, ensuring that future careers and secondary careers (e.g. Data Analyst,
 * Data Scientist, DevOps, Cybersecurity, Product Manager, UI/UX, etc.) work cleanly out-of-the-box.
 */
export function generateFallbackLevels(career: CareerPath): Record<CareerLevelId, CareerLevelDefinition> {
  const isDataRole = career.category === 'Data & AI' || career.title.toLowerCase().includes('data');
  const isSecurityRole = career.category === 'Cybersecurity' || career.title.toLowerCase().includes('security');
  const isDevOpsRole = career.slug.includes('devops') || career.slug.includes('cloud');
  const isDesignRole = career.category === 'Product & Design';
  const isHardwareRole = career.category === 'Electronics & Systems' || career.slug.includes('hardware');

  let practicalWorkTitle = 'Practical Experience & Portfolio';
  let practicalWorkDescription = 'Complete hands-on case studies and verified work to prove practical competence.';

  if (isHardwareRole) {
    practicalWorkTitle = 'Labs, Circuits & Simulations';
    practicalWorkDescription = 'Hands-on circuit design, microcontroller firmware development, and hardware test simulations.';
  } else if (isDataRole) {
    practicalWorkTitle = 'Data Analysis & ML Case Studies';
    practicalWorkDescription = 'Real-world dataset cleaning, statistical modeling, and interactive dashboards.';
  } else if (isSecurityRole) {
    practicalWorkTitle = 'Security Labs & Incident Simulations';
    practicalWorkDescription = 'Hands-on vulnerability scanning, threat hunting, and defensive hardening labs.';
  } else if (isDevOpsRole) {
    practicalWorkTitle = 'Pipelines, IaC & Automation Labs';
    practicalWorkDescription = 'Automate infrastructure provisioning, CI/CD pipelines, and monitoring alerts.';
  } else if (isDesignRole) {
    practicalWorkTitle = 'Design Systems & User Case Studies';
    practicalWorkDescription = 'Interactive Figma prototypes, user research reports, and design system components.';
  }

  const baseMustKnow = career.skillGroups.mustKnow || [];
  const baseGoodToKnow = career.skillGroups.goodToKnow || [];
  const baseAdvanced = career.skillGroups.advanced || [];

  return {
    entry: {
      id: 'entry',
      label: 'Beginner / Entry Level',
      roleTitle: `Associate ${career.title}`,
      experienceRange: '0–1 yrs',
      description: `Focuses on core ${career.title} principles, essential tools, guided tasks, and foundational methodologies.`,
      focusSummary: `Master the foundational tools, industry terminology, and standard workflows required for entry-level ${career.title} roles.`,
      expectedCompetencies: baseMustKnow.slice(0, 4).map((s) => `${s.name} fundamentals`),
      responsibilities: [
        `Complete guided tasks and assignments supporting ${career.title} workflows.`,
        'Learn team standards, documentation practices, and essential domain tools.',
        'Collaborate with team members and incorporate feedback during review sessions.',
      ],
      practicalWorkTitle,
      practicalWorkDescription,
      skillGroups: {
        mustKnow: baseMustKnow.slice(0, 3),
        goodToKnow: baseGoodToKnow.slice(0, 2),
        advanced: baseMustKnow.slice(3, 4),
      },
      learningPhases: career.learningPhases.slice(0, 1),
      practicalWork: career.projects.slice(0, 1).map((p) => ({ ...p, difficulty: 'Beginner' })),
      practiceAreas: career.practiceAreas.slice(0, 2),
      interviewTopics: career.interviewTopics.slice(0, 2),
      readinessChecklist: [
        { id: 'chk-1', label: `Formatted Resume Highlighting ${career.title} Fundamentals`, status: 'Essential', type: 'resume' },
        { id: 'chk-2', label: '1 Foundational Practical Case Study / Lab Report', status: 'Essential', type: 'practical' },
        { id: 'chk-3', label: 'Verified Core Domain Skills', status: 'Essential', type: 'skills' },
      ],
      roadmapStageDescriptions: {
        learn: `Learn essential ${career.title} concepts, core tools, and terminology.`,
        practice: 'Complete guided exercises, fundamental drills, and scenario assessments.',
        mentorship: `Get 1-on-1 resume feedback and career roadmap advice from ${career.title} mentors.`,
        prepare: 'Practice foundational technical questions and behavioral interview frameworks.',
        jobReady: 'Organize your resume, skill credentials, and proof of practical coursework.',
        opportunities: `Explore entry-level and associate ${career.title} job opportunities.`,
      },
    },
    junior: {
      id: 'junior',
      label: 'Junior',
      roleTitle: `Junior ${career.title}`,
      experienceRange: '1–3 yrs',
      description: `Owns daily ${career.title} tasks, applies core methodologies independently, and collaborates across project teams.`,
      focusSummary: `Build independence in daily ${career.title} execution, master primary industry software, and contribute to team deliverables.`,
      expectedCompetencies: [
        ...baseMustKnow.map((s) => s.name),
        ...baseGoodToKnow.slice(0, 2).map((s) => s.name),
      ],
      responsibilities: [
        `Deliver assigned ${career.title} project milestones on schedule.`,
        'Apply best practices, quality standards, and troubleshooting procedures.',
        'Participate in project reviews, client presentations, and team sprint planning.',
      ],
      practicalWorkTitle,
      practicalWorkDescription,
      skillGroups: {
        mustKnow: baseMustKnow,
        goodToKnow: baseGoodToKnow,
        advanced: baseAdvanced.slice(0, 1),
      },
      learningPhases: career.learningPhases.slice(0, 2),
      practicalWork: career.projects.slice(0, 2).map((p, idx) => ({
        ...p,
        difficulty: idx === 0 ? 'Beginner' : 'Intermediate',
      })),
      practiceAreas: career.practiceAreas.slice(0, 3),
      interviewTopics: career.interviewTopics.slice(0, 3),
      readinessChecklist: [
        { id: 'chk-1', label: 'Updated Resume Highlighting Practical Project Impact', status: 'Essential', type: 'resume' },
        { id: 'chk-2', label: '2 Completed Case Studies / Portfolio Artifacts', status: 'Essential', type: 'practical' },
        { id: 'chk-3', label: 'Verified Intermediate Domain Competencies', status: 'Essential', type: 'skills' },
      ],
      roadmapStageDescriptions: {
        learn: `Deepen your knowledge of professional ${career.title} tools and methodologies.`,
        practice: 'Tackle applied problem-solving tasks, troubleshooting, and team simulations.',
        mentorship: 'Discuss project architecture and career growth strategies with senior professionals.',
        prepare: 'Master practical scenario-based interviews and behavioral STAR responses.',
        jobReady: 'Ensure your portfolio artifacts clearly show end-to-end execution and measurable results.',
        opportunities: `Target Junior and intermediate ${career.title} positions (1–3 years experience).`,
      },
    },
    mid: {
      id: 'mid',
      label: 'Mid-Level',
      roleTitle: `${career.title} II`,
      experienceRange: '3–5 yrs',
      description: `Designs solutions, optimizes workflows, mentors junior team members, and ensures quality across ${career.title} deliverables.`,
      focusSummary: `Lead project initiatives, drive optimization and quality standards, and master advanced ${career.title} techniques.`,
      expectedCompetencies: [
        ...baseMustKnow.map((s) => s.name),
        ...baseGoodToKnow.map((s) => s.name),
        ...baseAdvanced.map((s) => s.name),
      ],
      responsibilities: [
        `Lead ${career.title} project tracks and coordinate cross-functional handoffs.`,
        'Evaluate technical trade-offs and drive quality, efficiency, and optimization.',
        'Mentor junior team members and conduct peer reviews.',
      ],
      practicalWorkTitle,
      practicalWorkDescription,
      skillGroups: {
        mustKnow: [...baseMustKnow, ...baseGoodToKnow.slice(0, 1)],
        goodToKnow: baseGoodToKnow.slice(1),
        advanced: baseAdvanced,
      },
      learningPhases: career.learningPhases,
      practicalWork: career.projects.map((p) => ({ ...p, difficulty: 'Intermediate' })),
      practiceAreas: career.practiceAreas,
      interviewTopics: career.interviewTopics,
      readinessChecklist: [
        { id: 'chk-1', label: 'Resume Demonstrating Quantifiable Results & Ownership', status: 'Essential', type: 'resume' },
        { id: 'chk-2', label: 'In-Depth Case Studies with Methodological Trade-offs', status: 'Essential', type: 'practical' },
        { id: 'chk-3', label: 'Demonstrated Mastery Across Core and Advanced Skills', status: 'Essential', type: 'skills' },
      ],
      roadmapStageDescriptions: {
        learn: `Master advanced ${career.title} patterns, optimization, and specialization topics.`,
        practice: 'Solve complex scenario challenges, trade-off evaluations, and simulated incidents.',
        mentorship: 'Refine leadership skills and strategic thinking with director-level mentors.',
        prepare: 'Prepare for deep-dive technical evaluations and senior behavioral rounds.',
        jobReady: 'Demonstrate project ownership, measurable impact, and leadership on your profile.',
        opportunities: `Target Mid-Level and Senior ${career.title} opportunities (3–5 years).`,
      },
    },
    senior: {
      id: 'senior',
      label: 'Senior',
      roleTitle: `Senior ${career.title}`,
      experienceRange: '5+ yrs',
      description: `Sets technical and strategic direction, architects complex solutions, leads cross-team initiatives, and drives organizational excellence.`,
      focusSummary: `Drive organizational strategy, guide high-impact initiatives, and set the quality bar for ${career.title} practices.`,
      expectedCompetencies: [
        ...baseAdvanced.map((s) => s.name),
        'Strategic decision making',
        'Cross-team leadership & mentorship',
      ],
      responsibilities: [
        `Define ${career.title} methodology, architecture, and quality standards company-wide.`,
        'Align project goals with strategic business objectives and executive leadership.',
        'Coach and develop mid-level and junior talent across teams.',
      ],
      practicalWorkTitle,
      practicalWorkDescription,
      skillGroups: {
        mustKnow: [...baseAdvanced, ...baseMustKnow.slice(0, 2)],
        goodToKnow: baseGoodToKnow,
        advanced: baseAdvanced,
      },
      learningPhases: career.learningPhases,
      practicalWork: career.projects.map((p) => ({ ...p, difficulty: 'Advanced' })),
      practiceAreas: career.practiceAreas,
      interviewTopics: career.interviewTopics,
      readinessChecklist: [
        { id: 'chk-1', label: 'Executive-Ready Resume Demonstrating High-Scale Impact', status: 'Essential', type: 'resume' },
        { id: 'chk-2', label: 'Strategic Case Studies & Architecture / Methodology Blueprints', status: 'Essential', type: 'practical' },
        { id: 'chk-3', label: 'Demonstrated Mentorship & Cross-Functional Leadership', status: 'Essential', type: 'experience' },
      ],
      roadmapStageDescriptions: {
        learn: `Explore executive strategy, systems architecture, and industry standards for ${career.title}.`,
        practice: 'Conduct strategic trade-off evaluations and organizational scenario simulations.',
        mentorship: 'Engage with VP and industry executive mentors on organizational leadership.',
        prepare: 'Prepare for executive-level scenario discussions and strategic leadership evaluations.',
        jobReady: 'Package your career accomplishments around business value, mentorship, and scale.',
        opportunities: `Target Senior, Lead, and Principal ${career.title} roles (5+ years).`,
      },
    },
  };
}

/**
 * Returns structured level data for any career and selected level.
 * Falls back safely to generated level data if specific config does not exist.
 */
export function getCareerLevelData(
  career: CareerPath,
  levelId?: string | null
): CareerLevelDefinition {
  const safeLevelId: CareerLevelId =
    levelId === 'junior' || levelId === 'mid' || levelId === 'senior' ? levelId : 'entry';

  // 1. Check custom configured levels for this career
  const customLevels = CAREER_LEVEL_CONFIGS[career.slug] || career.levels;
  if (customLevels && customLevels[safeLevelId]) {
    return customLevels[safeLevelId]!;
  }

  // 2. Generate fallback levels from career baseline
  const fallback = generateFallbackLevels(career);
  return fallback[safeLevelId];
}

/**
 * Resolves the initial career level based on URL param or candidate profile.
 */
export function resolveInitialCareerLevel(
  candidate: CandidateCareerContext | null,
  urlParam?: string | null,
  careerSlug?: string
): CareerLevelId {
  // 1. Supported URL parameter takes priority
  if (urlParam) {
    const normalized = urlParam.toLowerCase().trim();
    if (normalized === 'entry' || normalized === 'beginner') return 'entry';
    if (normalized === 'junior') return 'junior';
    if (normalized === 'mid' || normalized === 'intermediate') return 'mid';
    if (normalized === 'senior') return 'senior';
  }

  // 2. Check client-side persistence if in browser
  if (typeof window !== 'undefined' && careerSlug) {
    try {
      const persisted = localStorage.getItem(`pathway_career_level_${careerSlug}`);
      if (
        persisted === 'entry' ||
        persisted === 'junior' ||
        persisted === 'mid' ||
        persisted === 'senior'
      ) {
        return persisted;
      }
    } catch {}
  }

  // 3. Check candidate profile experience
  if (candidate && candidate.experience && candidate.experience.length > 0) {
    const expCount = candidate.experience.length;
    if (expCount >= 3) return 'mid';
    if (expCount >= 1) return 'junior';
  }

  // 4. Default to Beginner / Entry Level
  return 'entry';
}
