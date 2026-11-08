export interface CorpusScenario {
  id: string;
  name: string;
  headline: string;
  scenarioCategory: string;
  formattingStyle: string;
  fontFamily: 'Helvetica' | 'Times' | 'Courier';
  isTwoColumn?: boolean;
  intentionalOmissions: string[];
  docSections: Array<{
    heading?: string;
    subheading?: string;
    paragraphs?: string[];
    bullets?: string[];
    table?: string[][];
  }>;
  pdfLines: Array<{
    text: string;
    isHeader?: boolean;
    isSub?: boolean;
    isBullet?: boolean;
  }>;
  expected: {
    personalInfo: {
      name: string | null;
      email: string | null;
      phone: string | null;
      location: string | null;
      headline?: string | null;
      bio?: string | null;
    };
    education: Array<{
      institution: string;
      degree: string;
      fieldOfStudy: string;
      startYear: number;
      endYear: number | null;
      isCurrent: boolean;
      gpa?: string | null;
      educationLevel?: string;
    }>;
    experience: Array<{
      company: string;
      roleTitle: string;
      employmentType: string;
      location?: string | null;
      startDate: string;
      endDate: string | null;
      isCurrent: boolean;
      bulletsCount?: number;
      bullets?: string[];
      technologies?: string[];
    }>;
    internships: Array<{
      company: string;
      roleTitle: string;
      employmentType: string;
      location?: string | null;
      startDate: string;
      endDate: string | null;
      isCurrent: boolean;
      bulletsCount?: number;
      bullets?: string[];
      technologies?: string[];
    }>;
    projects: Array<{
      title: string;
      role?: string | null;
      technologies: string[];
      githubUrl?: string | null;
      projectUrl?: string | null;
      demoUrl?: string | null;
      bulletsCount?: number;
      bullets?: string[];
    }>;
    certifications: Array<{
      name: string;
      issuingOrganization: string;
      issueDate?: string | null;
      expiryDate?: string | null;
      credentialId?: string | null;
      credentialUrl?: string | null;
    }>;
    technicalSkills: string[];
    softSkills: string[];
    achievements: Array<{
      title: string;
      organization?: string | null;
      date?: string | null;
    }>;
    professionalLinks: Array<{
      platform: string;
      url: string;
    }>;
    languages: Array<{
      language: string;
      proficiency?: string;
    }>;
  };
}

export const SCENARIOS: CorpusScenario[] = [
  // =========================================================================
  // 1. College Student (No Experience)
  // =========================================================================
  {
    id: 'resume-01-student-no-exp',
    name: 'Kavya Ramesh',
    headline: 'Computer Science Undergraduate',
    scenarioCategory: 'student_no_experience',
    formattingStyle: 'clean_single_column',
    fontFamily: 'Helvetica',
    intentionalOmissions: ['phone', 'experience', 'internships', 'certifications'],
    docSections: [
      {
        paragraphs: ['kavya.ramesh@fictional-apex.org | Bengaluru, Karnataka, India | https://github.com/kavya-ramesh | https://linkedin.com/in/kavya-ramesh-mock'],
      },
      {
        heading: 'EDUCATION',
        paragraphs: [
          'Apex Institute of Technology | 2023 – 2027',
          'B.Tech in Computer Science – IoT & Cyber Security | CGPA: 9.1/10',
          'Vidya Mandir Junior College | 2021 – 2023',
          'Intermediate (MPC) | Percentage: 96.4%',
        ],
      },
      {
        heading: 'PROJECTS',
        paragraphs: ['Campus Smart Waste Segregator | Python, TensorFlow, OpenCV, Raspberry Pi | GitHub'],
        bullets: [
          'Developed an automated waste classification prototype achieving 92% visual sorting accuracy across recyclable items.',
          'Trained an edge-optimized convolutional neural network on 8,000 labeled waste images using TensorFlow and OpenCV.',
          'Integrated stepper motors and ultrasound sensors with Raspberry Pi GPIO for real-time robotic bin sorting.',
        ],
      },
      {
        paragraphs: ['Decentralized Attendance Register | Solidity, Node.js, React.js, Ethereum | GitHub'],
        bullets: [
          'Implemented tamper-proof student attendance logging on local Ethereum testnet with smart contracts in Solidity.',
          'Built a responsive React interface allowing professors to mark attendance cryptographically within 3 seconds.',
        ],
      },
      {
        heading: 'TECHNICAL SKILLS',
        paragraphs: [
          'Programming Languages: Python, C++, Java, Solidity, JavaScript',
          'Web & Frameworks: React.js, Node.js, Express.js, HTML5, CSS3',
          'Tools & Platforms: Git, GitHub, Linux, Raspberry Pi, Docker',
        ],
      },
      {
        heading: 'ACHIEVEMENTS',
        bullets: ['First Place — Campus Innovation Hackathon 2024 at Apex Institute of Technology.'],
      },
      {
        heading: 'LANGUAGES',
        paragraphs: ['English (Fluent), Kannada (Native), Hindi (Conversational)'],
      },
    ],
    pdfLines: [
      { text: 'kavya.ramesh@fictional-apex.org | Bengaluru, Karnataka, India | https://github.com/kavya-ramesh | https://linkedin.com/in/kavya-ramesh-mock' },
      { text: 'EDUCATION', isHeader: true },
      { text: 'Apex Institute of Technology | 2023 – 2027', isSub: true },
      { text: 'B.Tech in Computer Science – IoT & Cyber Security | CGPA: 9.1/10' },
      { text: 'Vidya Mandir Junior College | 2021 – 2023', isSub: true },
      { text: 'Intermediate (MPC) | Percentage: 96.4%' },
      { text: 'PROJECTS', isHeader: true },
      { text: 'Campus Smart Waste Segregator | Python, TensorFlow, OpenCV, Raspberry Pi | GitHub', isSub: true },
      { text: 'Developed an automated waste classification prototype achieving 92% visual sorting accuracy across recyclable items.', isBullet: true },
      { text: 'Trained an edge-optimized convolutional neural network on 8,000 labeled waste images using TensorFlow and OpenCV.', isBullet: true },
      { text: 'Integrated stepper motors and ultrasound sensors with Raspberry Pi GPIO for real-time robotic bin sorting.', isBullet: true },
      { text: 'Decentralized Attendance Register | Solidity, Node.js, React.js, Ethereum | GitHub', isSub: true },
      { text: 'Implemented tamper-proof student attendance logging on local Ethereum testnet with smart contracts in Solidity.', isBullet: true },
      { text: 'Built a responsive React interface allowing professors to mark attendance cryptographically within 3 seconds.', isBullet: true },
      { text: 'TECHNICAL SKILLS', isHeader: true },
      { text: 'Programming Languages: Python, C++, Java, Solidity, JavaScript' },
      { text: 'Web & Frameworks: React.js, Node.js, Express.js, HTML5, CSS3' },
      { text: 'Tools & Platforms: Git, GitHub, Linux, Raspberry Pi, Docker' },
      { text: 'ACHIEVEMENTS', isHeader: true },
      { text: 'First Place — Campus Innovation Hackathon 2024 at Apex Institute of Technology.', isBullet: true },
      { text: 'LANGUAGES', isHeader: true },
      { text: 'English (Fluent), Kannada (Native), Hindi (Conversational)' },
    ],
    expected: {
      personalInfo: {
        name: 'Kavya Ramesh',
        email: 'kavya.ramesh@fictional-apex.org',
        phone: null,
        location: 'Bengaluru, Karnataka, India',
        headline: null,
        bio: null,
      },
      education: [
        {
          institution: 'Apex Institute of Technology',
          degree: 'B.Tech in Computer Science',
          fieldOfStudy: 'IoT & Cyber Security',
          startYear: 2023,
          endYear: 2027,
          isCurrent: true,
          gpa: '9.1/10',
          educationLevel: 'UNDERGRADUATE',
        },
        {
          institution: 'Vidya Mandir Junior College',
          degree: 'Intermediate (MPC)',
          fieldOfStudy: 'MPC',
          startYear: 2021,
          endYear: 2023,
          isCurrent: false,
          gpa: '96.4%',
          educationLevel: 'INTERMEDIATE',
        },
      ],
      experience: [],
      internships: [],
      projects: [
        {
          title: 'Campus Smart Waste Segregator',
          technologies: ['Python', 'TensorFlow', 'OpenCV', 'Raspberry Pi'],
          bulletsCount: 3,
        },
        {
          title: 'Decentralized Attendance Register',
          technologies: ['Solidity', 'Node.js', 'React.js', 'Ethereum'],
          bulletsCount: 2,
        },
      ],
      certifications: [],
      technicalSkills: ['Python', 'C++', 'Java', 'Solidity', 'JavaScript', 'React.js', 'Node.js', 'Express.js', 'HTML5', 'CSS3', 'Git', 'GitHub', 'Linux', 'Docker'],
      softSkills: [],
      achievements: [
        {
          title: 'First Place — Campus Innovation Hackathon 2024 at Apex Institute of Technology.',
          organization: 'Apex Institute of Technology',
          date: '2024',
        },
      ],
      professionalLinks: [
        { platform: 'GitHub', url: 'https://github.com/kavya-ramesh' },
        { platform: 'LinkedIn', url: 'https://linkedin.com/in/kavya-ramesh-mock' },
      ],
      languages: [
        { language: 'English', proficiency: 'FLUENT' },
        { language: 'Kannada', proficiency: 'NATIVE' },
        { language: 'Hindi', proficiency: 'CONVERSATIONAL' },
      ],
    },
  },

  // =========================================================================
  // 2. Fresher with Academic Projects
  // =========================================================================
  {
    id: 'resume-02-fresher-academic-projects',
    name: 'Rohan Varma',
    headline: 'B.Tech Computer Science Graduate',
    scenarioCategory: 'fresher_academic_projects',
    formattingStyle: 'academic_serif',
    fontFamily: 'Times',
    intentionalOmissions: ['experience', 'internships'],
    docSections: [
      {
        paragraphs: ['rohan.varma@mock-univ.edu | +91 9845123456 | Hyderabad, Telangana, India | https://github.com/rohanvarma-dev | https://linkedin.com/in/rohan-varma-dev'],
      },
      {
        heading: 'EDUCATION',
        paragraphs: [
          'SRKR Engineering Institute | 2020 – 2024',
          'Bachelor of Technology in Information Technology | CGPA: 8.72/10',
        ],
      },
      {
        heading: 'ACADEMIC PROJECTS',
        paragraphs: ['Automated Radiology Diagnostics Tool — Final Year Capstone | Python, PyTorch, FastAPI, Docker | GitHub'],
        bullets: [
          'Engineered a deep learning microservice detecting pneumonia from frontal chest X-rays with 94.6% sensitivity.',
          'Implemented Grad-CAM saliency heatmaps to assist radiologists in verifying model focus regions during review.',
          'Packaged the complete inference pipeline into containerized FastAPI REST endpoints serving predictions under 450ms.',
        ],
      },
      {
        paragraphs: ['Cloud Resource Anomaly Detector — Mini Project | Go, Prometheus, Grafana, Docker'],
        bullets: [
          'Constructed an asynchronous agent in Go monitoring CPU and memory exhaustion metrics across Kubernetes nodes.',
          'Integrated Prometheus metric scrapers with automated alerting triggers delivered via Discord webhook bots.',
        ],
      },
      {
        heading: 'TECHNICAL SKILLS',
        paragraphs: [
          'Languages: Python, Go, SQL, C++',
          'Frameworks: PyTorch, FastAPI, Flask, Docker',
          'Database: PostgreSQL, MongoDB, Redis',
        ],
      },
      {
        heading: 'CERTIFICATIONS',
        paragraphs: [
          'Deep Learning Specialization – DeepLearning.AI',
          'Foundational Go Programming – Coursera',
        ],
      },
      {
        heading: 'LANGUAGES',
        paragraphs: ['English, Telugu, Hindi'],
      },
    ],
    pdfLines: [
      { text: 'rohan.varma@mock-univ.edu | +91 9845123456 | Hyderabad, Telangana, India | https://github.com/rohanvarma-dev | https://linkedin.com/in/rohan-varma-dev' },
      { text: 'EDUCATION', isHeader: true },
      { text: 'SRKR Engineering Institute | 2020 – 2024', isSub: true },
      { text: 'Bachelor of Technology in Information Technology | CGPA: 8.72/10' },
      { text: 'ACADEMIC PROJECTS', isHeader: true },
      { text: 'Automated Radiology Diagnostics Tool — Final Year Capstone | Python, PyTorch, FastAPI, Docker | GitHub', isSub: true },
      { text: 'Engineered a deep learning microservice detecting pneumonia from frontal chest X-rays with 94.6% sensitivity.', isBullet: true },
      { text: 'Implemented Grad-CAM saliency heatmaps to assist radiologists in verifying model focus regions during review.', isBullet: true },
      { text: 'Packaged the complete inference pipeline into containerized FastAPI REST endpoints serving predictions under 450ms.', isBullet: true },
      { text: 'Cloud Resource Anomaly Detector — Mini Project | Go, Prometheus, Grafana, Docker', isSub: true },
      { text: 'Constructed an asynchronous agent in Go monitoring CPU and memory exhaustion metrics across Kubernetes nodes.', isBullet: true },
      { text: 'Integrated Prometheus metric scrapers with automated alerting triggers delivered via Discord webhook bots.', isBullet: true },
      { text: 'TECHNICAL SKILLS', isHeader: true },
      { text: 'Languages: Python, Go, SQL, C++' },
      { text: 'Frameworks: PyTorch, FastAPI, Flask, Docker' },
      { text: 'Database: PostgreSQL, MongoDB, Redis' },
      { text: 'CERTIFICATIONS', isHeader: true },
      { text: 'Deep Learning Specialization – DeepLearning.AI' },
      { text: 'Foundational Go Programming – Coursera' },
      { text: 'LANGUAGES', isHeader: true },
      { text: 'English, Telugu, Hindi' },
    ],
    expected: {
      personalInfo: {
        name: 'Rohan Varma',
        email: 'rohan.varma@mock-univ.edu',
        phone: '+91 9845123456',
        location: 'Hyderabad, Telangana, India',
        headline: null,
      },
      education: [
        {
          institution: 'SRKR Engineering Institute',
          degree: 'Bachelor of Technology in Information Technology',
          fieldOfStudy: 'Information Technology',
          startYear: 2020,
          endYear: 2024,
          isCurrent: false,
          gpa: '8.72/10',
          educationLevel: 'UNDERGRADUATE',
        },
      ],
      experience: [],
      internships: [],
      projects: [
        {
          title: 'Automated Radiology Diagnostics Tool — Final Year Capstone',
          technologies: ['Python', 'PyTorch', 'FastAPI', 'Docker'],
          bulletsCount: 3,
        },
        {
          title: 'Cloud Resource Anomaly Detector — Mini Project',
          technologies: ['Go', 'Prometheus', 'Grafana', 'Docker'],
          bulletsCount: 2,
        },
      ],
      certifications: [
        {
          name: 'Deep Learning Specialization',
          issuingOrganization: 'DeepLearning.AI',
        },
        {
          name: 'Foundational Go Programming',
          issuingOrganization: 'Coursera',
        },
      ],
      technicalSkills: ['Python', 'Go', 'SQL', 'C++', 'PyTorch', 'FastAPI', 'Flask', 'Docker', 'PostgreSQL', 'MongoDB', 'Redis'],
      softSkills: [],
      achievements: [],
      professionalLinks: [
        { platform: 'GitHub', url: 'https://github.com/rohanvarma-dev' },
        { platform: 'LinkedIn', url: 'https://linkedin.com/in/rohan-varma-dev' },
      ],
      languages: [
        { language: 'English' },
        { language: 'Telugu' },
        { language: 'Hindi' },
      ],
    },
  },

  // =========================================================================
  // 3. Fresher with Multiple Internships (Dedicated INTERNSHIPS Section)
  // =========================================================================
  {
    id: 'resume-03-fresher-multi-internships',
    name: 'Sneha Deshmukh',
    headline: 'Software Engineering Trainee',
    scenarioCategory: 'fresher_multiple_internships',
    formattingStyle: 'modern_tech',
    fontFamily: 'Helvetica',
    intentionalOmissions: ['experience'],
    docSections: [
      {
        paragraphs: ['sneha.deshmukh@mocktalent.io | +91 9123456780 | Pune, Maharashtra, India | https://github.com/snehad-dev | https://linkedin.com/in/sneha-deshmukh-eng'],
      },
      {
        heading: 'EDUCATION',
        paragraphs: [
          'Pune Institute of Computer Technology | 2020 – 2024',
          'B.E. in Computer Engineering | CGPA: 9.35/10',
        ],
      },
      {
        heading: 'INTERNSHIPS',
        paragraphs: ['Software Engineering Intern — Zylker Solutions | Jan 2024 – June 2024 | Pune, India'],
        bullets: [
          'Developed 12 REST API endpoints in Node.js and Express for enterprise asset tracking workflows.',
          'Reduced PostgreSQL query execution latency by 35% via indexing composite foreign keys and Redis caching.',
          'Collaborated with senior engineers in bi-weekly Agile sprints to deliver unit-tested pull requests.',
        ],
      },
      {
        paragraphs: ['Frontend Developer Intern — Quanta Labs | May 2023 – July 2023 | Remote'],
        bullets: [
          'Built 8 reusable UI widgets using React.js, TypeScript, and Tailwind CSS for client dashboard.',
          'Integrated OAuth 2.0 authentication flows and JWT session validation handling over 5,000 daily active users.',
        ],
      },
      {
        heading: 'PROJECTS',
        paragraphs: ['Distributed Key-Value Store | Go, Raft Consensus, gRPC | GitHub'],
        bullets: [
          'Implemented leader election and log replication using the Raft distributed consensus protocol in Go.',
          'Benchmarked cluster throughput handling 15,000 read requests per second across 3 distributed nodes.',
        ],
      },
      {
        heading: 'TECHNICAL SKILLS',
        paragraphs: ['Node.js, Express.js, React.js, TypeScript, Go, PostgreSQL, Redis, Docker, Git, REST API'],
      },
      {
        heading: 'LANGUAGES',
        paragraphs: ['English (Fluent), Marathi (Native), Hindi (Professional)'],
      },
    ],
    pdfLines: [
      { text: 'sneha.deshmukh@mocktalent.io | +91 9123456780 | Pune, Maharashtra, India | https://github.com/snehad-dev | https://linkedin.com/in/sneha-deshmukh-eng' },
      { text: 'EDUCATION', isHeader: true },
      { text: 'Pune Institute of Computer Technology | 2020 – 2024', isSub: true },
      { text: 'B.E. in Computer Engineering | CGPA: 9.35/10' },
      { text: 'INTERNSHIPS', isHeader: true },
      { text: 'Software Engineering Intern — Zylker Solutions | Jan 2024 – June 2024 | Pune, India', isSub: true },
      { text: 'Developed 12 REST API endpoints in Node.js and Express for enterprise asset tracking workflows.', isBullet: true },
      { text: 'Reduced PostgreSQL query execution latency by 35% via indexing composite foreign keys and Redis caching.', isBullet: true },
      { text: 'Collaborated with senior engineers in bi-weekly Agile sprints to deliver unit-tested pull requests.', isBullet: true },
      { text: 'Frontend Developer Intern — Quanta Labs | May 2023 – July 2023 | Remote', isSub: true },
      { text: 'Built 8 reusable UI widgets using React.js, TypeScript, and Tailwind CSS for client dashboard.', isBullet: true },
      { text: 'Integrated OAuth 2.0 authentication flows and JWT session validation handling over 5,000 daily active users.', isBullet: true },
      { text: 'PROJECTS', isHeader: true },
      { text: 'Distributed Key-Value Store | Go, Raft Consensus, gRPC | GitHub', isSub: true },
      { text: 'Implemented leader election and log replication using the Raft distributed consensus protocol in Go.', isBullet: true },
      { text: 'Benchmarked cluster throughput handling 15,000 read requests per second across 3 distributed nodes.', isBullet: true },
      { text: 'TECHNICAL SKILLS', isHeader: true },
      { text: 'Node.js, Express.js, React.js, TypeScript, Go, PostgreSQL, Redis, Docker, Git, REST API' },
      { text: 'LANGUAGES', isHeader: true },
      { text: 'English (Fluent), Marathi (Native), Hindi (Professional)' },
    ],
    expected: {
      personalInfo: {
        name: 'Sneha Deshmukh',
        email: 'sneha.deshmukh@mocktalent.io',
        phone: '+91 9123456780',
        location: 'Pune, Maharashtra, India',
      },
      education: [
        {
          institution: 'Pune Institute of Computer Technology',
          degree: 'B.E. in Computer Engineering',
          fieldOfStudy: 'Computer Engineering',
          startYear: 2020,
          endYear: 2024,
          isCurrent: false,
          gpa: '9.35/10',
          educationLevel: 'UNDERGRADUATE',
        },
      ],
      experience: [],
      internships: [
        {
          company: 'Zylker Solutions',
          roleTitle: 'Software Engineering Intern',
          employmentType: 'Internship',
          location: 'Pune, India',
          startDate: 'Jan 2024',
          endDate: 'June 2024',
          isCurrent: false,
          bulletsCount: 3,
        },
        {
          company: 'Quanta Labs',
          roleTitle: 'Frontend Developer Intern',
          employmentType: 'Internship',
          location: 'Remote',
          startDate: 'May 2023',
          endDate: 'July 2023',
          isCurrent: false,
          bulletsCount: 2,
        },
      ],
      projects: [
        {
          title: 'Distributed Key-Value Store',
          technologies: ['Go', 'Raft Consensus', 'gRPC'],
          bulletsCount: 2,
        },
      ],
      certifications: [],
      technicalSkills: ['Node.js', 'Express.js', 'React.js', 'TypeScript', 'Go', 'PostgreSQL', 'Redis', 'Docker', 'Git', 'REST API'],
      softSkills: [],
      achievements: [],
      professionalLinks: [
        { platform: 'GitHub', url: 'https://github.com/snehad-dev' },
        { platform: 'LinkedIn', url: 'https://linkedin.com/in/sneha-deshmukh-eng' },
      ],
      languages: [
        { language: 'English', proficiency: 'FLUENT' },
        { language: 'Marathi', proficiency: 'NATIVE' },
        { language: 'Hindi', proficiency: 'PROFESSIONAL' },
      ],
    },
  },

  // =========================================================================
  // 4. Recent Graduate with One Internship & One Full-Time Role
  // =========================================================================
  {
    id: 'resume-04-recent-grad-intern-fulltime',
    name: 'Aditya Kulkarni',
    headline: 'Associate Software Engineer',
    scenarioCategory: 'recent_grad_intern_fulltime',
    formattingStyle: 'standard_chronological',
    fontFamily: 'Helvetica',
    intentionalOmissions: [],
    docSections: [
      {
        paragraphs: ['aditya.kulkarni@mockcorp.net | +91 9765432109 | Bengaluru, Karnataka, India | https://github.com/adityak-code | https://linkedin.com/in/aditya-kulkarni-eng'],
      },
      {
        heading: 'EXPERIENCE',
        paragraphs: ['Associate Software Engineer — NovaTech Systems | July 2024 – Present | Bengaluru, India'],
        bullets: [
          'Engineered backend telemetry aggregation microservices using Go and PostgreSQL processing 2M events daily.',
          'Built Kafka event producers and consumer groups ensuring at-least-once message delivery semantics.',
        ],
      },
      {
        paragraphs: ['Software Engineering Intern — Zylker Technologies | Jan 2024 – June 2024 | Hyderabad, India'],
        bullets: [
          'Automated data ingestion pipelines using Python, Docker, and AWS S3, decreasing manual data entry by 80%.',
          'Wrote unit and integration test suites in PyTest reaching 88% overall code coverage.',
        ],
      },
      {
        heading: 'EDUCATION',
        paragraphs: [
          'BITS Pilani | 2020 – 2024',
          'B.E. in Computer Science | CGPA: 8.85/10',
        ],
      },
      {
        heading: 'PROJECTS',
        paragraphs: ['Real-Time Stream Processing Engine | Go, Kafka, Redis | GitHub'],
        bullets: ['Constructed an in-memory streaming window aggregator calculating sliding quantile metrics across IoT feeds.'],
      },
      {
        heading: 'SKILLS',
        paragraphs: ['Go, Python, Kafka, PostgreSQL, Redis, Docker, AWS, Git, Unit Testing'],
      },
    ],
    pdfLines: [
      { text: 'aditya.kulkarni@mockcorp.net | +91 9765432109 | Bengaluru, Karnataka, India | https://github.com/adityak-code | https://linkedin.com/in/aditya-kulkarni-eng' },
      { text: 'EXPERIENCE', isHeader: true },
      { text: 'Associate Software Engineer — NovaTech Systems | July 2024 – Present | Bengaluru, India', isSub: true },
      { text: 'Engineered backend telemetry aggregation microservices using Go and PostgreSQL processing 2M events daily.', isBullet: true },
      { text: 'Built Kafka event producers and consumer groups ensuring at-least-once message delivery semantics.', isBullet: true },
      { text: 'Software Engineering Intern — Zylker Technologies | Jan 2024 – June 2024 | Hyderabad, India', isSub: true },
      { text: 'Automated data ingestion pipelines using Python, Docker, and AWS S3, decreasing manual data entry by 80%.', isBullet: true },
      { text: 'Wrote unit and integration test suites in PyTest reaching 88% overall code coverage.', isBullet: true },
      { text: 'EDUCATION', isHeader: true },
      { text: 'BITS Pilani | 2020 – 2024', isSub: true },
      { text: 'B.E. in Computer Science | CGPA: 8.85/10' },
      { text: 'PROJECTS', isHeader: true },
      { text: 'Real-Time Stream Processing Engine | Go, Kafka, Redis | GitHub', isSub: true },
      { text: 'Constructed an in-memory streaming window aggregator calculating sliding quantile metrics across IoT feeds.', isBullet: true },
      { text: 'SKILLS', isHeader: true },
      { text: 'Go, Python, Kafka, PostgreSQL, Redis, Docker, AWS, Git, Unit Testing' },
    ],
    expected: {
      personalInfo: {
        name: 'Aditya Kulkarni',
        email: 'aditya.kulkarni@mockcorp.net',
        phone: '+91 9765432109',
        location: 'Bengaluru, Karnataka, India',
      },
      education: [
        {
          institution: 'BITS Pilani',
          degree: 'B.E. in Computer Science',
          fieldOfStudy: 'Computer Science',
          startYear: 2020,
          endYear: 2024,
          isCurrent: false,
          gpa: '8.85/10',
          educationLevel: 'UNDERGRADUATE',
        },
      ],
      experience: [
        {
          company: 'NovaTech Systems',
          roleTitle: 'Associate Software Engineer',
          employmentType: 'Full-time',
          location: 'Bengaluru, India',
          startDate: 'July 2024',
          endDate: null,
          isCurrent: true,
          bulletsCount: 2,
        },
        {
          company: 'Zylker Technologies',
          roleTitle: 'Software Engineering Intern',
          employmentType: 'Internship',
          location: 'Hyderabad, India',
          startDate: 'Jan 2024',
          endDate: 'June 2024',
          isCurrent: false,
          bulletsCount: 2,
        },
      ],
      internships: [],
      projects: [
        {
          title: 'Real-Time Stream Processing Engine',
          technologies: ['Go', 'Kafka', 'Redis'],
          bulletsCount: 1,
        },
      ],
      certifications: [],
      technicalSkills: ['Go', 'Python', 'Kafka', 'PostgreSQL', 'Redis', 'Docker', 'AWS', 'Git'],
      softSkills: [],
      achievements: [],
      professionalLinks: [
        { platform: 'GitHub', url: 'https://github.com/adityak-code' },
        { platform: 'LinkedIn', url: 'https://linkedin.com/in/aditya-kulkarni-eng' },
      ],
      languages: [],
    },
  },

  // =========================================================================
  // 5. Full-Stack Developer with 2 Years Experience
  // =========================================================================
  {
    id: 'resume-05-fullstack-2y-exp',
    name: 'Pranav Nair',
    headline: 'Full Stack Engineer',
    scenarioCategory: 'fullstack_2y_exp',
    formattingStyle: 'compact_single_column',
    fontFamily: 'Helvetica',
    intentionalOmissions: ['internships'],
    docSections: [
      {
        paragraphs: ['pranav.nair@fictionaldev.co | +91 9988776655 | Kochi, Kerala, India | https://github.com/pranavnair-fullstack | https://linkedin.com/in/pranav-nair-dev'],
      },
      {
        heading: 'EXPERIENCE',
        paragraphs: ['Full Stack Engineer — SMVEN Technologies | August 2022 – Present | Kochi, India'],
        bullets: [
          'Architected responsive client portals using React.js, Next.js, TypeScript, and Tailwind CSS serving 40k monthly users.',
          'Developed 25+ REST APIs in Node.js and Express with MongoDB and Redis caching for lead routing and payments.',
          'Integrated Razorpay and Stripe checkout workflows with automated webhook reconciliation and error handling.',
          'Configured AWS ECS Fargate and CloudWatch CI/CD deployments with zero-downtime rolling updates.',
        ],
      },
      {
        heading: 'PROJECTS',
        paragraphs: ['Multi-Tenant CRM Platform | React.js, Node.js, MongoDB, Redis | GitHub'],
        bullets: [
          'Designed role-based access control (RBAC) supporting multi-tenant isolation across 15 organization accounts.',
          'Built background worker queues in BullMQ with Redis handling automated email reminders and invoice generation.',
        ],
      },
      {
        heading: 'EDUCATION',
        paragraphs: [
          'National Institute of Technology Calicut | 2018 – 2022',
          'B.Tech in Computer Science and Engineering | CGPA: 8.5/10',
        ],
      },
      {
        heading: 'TECHNICAL SKILLS',
        paragraphs: [
          'Frontend: React.js, Next.js, TypeScript, Tailwind CSS, Redux',
          'Backend: Node.js, Express.js, REST API, GraphQL',
          'Database & Cloud: MongoDB, Redis, PostgreSQL, AWS, Docker',
        ],
      },
      {
        heading: 'CERTIFICATIONS',
        paragraphs: ['AWS Certified Solutions Architect – Associate – Amazon Web Services | 2023'],
      },
    ],
    pdfLines: [
      { text: 'pranav.nair@fictionaldev.co | +91 9988776655 | Kochi, Kerala, India | https://github.com/pranavnair-fullstack | https://linkedin.com/in/pranav-nair-dev' },
      { text: 'EXPERIENCE', isHeader: true },
      { text: 'Full Stack Engineer — SMVEN Technologies | August 2022 – Present | Kochi, India', isSub: true },
      { text: 'Architected responsive client portals using React.js, Next.js, TypeScript, and Tailwind CSS serving 40k monthly users.', isBullet: true },
      { text: 'Developed 25+ REST APIs in Node.js and Express with MongoDB and Redis caching for lead routing and payments.', isBullet: true },
      { text: 'Integrated Razorpay and Stripe checkout workflows with automated webhook reconciliation and error handling.', isBullet: true },
      { text: 'Configured AWS ECS Fargate and CloudWatch CI/CD deployments with zero-downtime rolling updates.', isBullet: true },
      { text: 'PROJECTS', isHeader: true },
      { text: 'Multi-Tenant CRM Platform | React.js, Node.js, MongoDB, Redis | GitHub', isSub: true },
      { text: 'Designed role-based access control (RBAC) supporting multi-tenant isolation across 15 organization accounts.', isBullet: true },
      { text: 'Built background worker queues in BullMQ with Redis handling automated email reminders and invoice generation.', isBullet: true },
      { text: 'EDUCATION', isHeader: true },
      { text: 'National Institute of Technology Calicut | 2018 – 2022', isSub: true },
      { text: 'B.Tech in Computer Science and Engineering | CGPA: 8.5/10' },
      { text: 'TECHNICAL SKILLS', isHeader: true },
      { text: 'Frontend: React.js, Next.js, TypeScript, Tailwind CSS, Redux' },
      { text: 'Backend: Node.js, Express.js, REST API, GraphQL' },
      { text: 'Database & Cloud: MongoDB, Redis, PostgreSQL, AWS, Docker' },
      { text: 'CERTIFICATIONS', isHeader: true },
      { text: 'AWS Certified Solutions Architect – Associate – Amazon Web Services | 2023' },
    ],
    expected: {
      personalInfo: {
        name: 'Pranav Nair',
        email: 'pranav.nair@fictionaldev.co',
        phone: '+91 9988776655',
        location: 'Kochi, Kerala, India',
      },
      education: [
        {
          institution: 'National Institute of Technology Calicut',
          degree: 'B.Tech in Computer Science and Engineering',
          fieldOfStudy: 'Computer Science and Engineering',
          startYear: 2018,
          endYear: 2022,
          isCurrent: false,
          gpa: '8.5/10',
          educationLevel: 'UNDERGRADUATE',
        },
      ],
      experience: [
        {
          company: 'SMVEN Technologies',
          roleTitle: 'Full Stack Engineer',
          employmentType: 'Full-time',
          location: 'Kochi, India',
          startDate: 'August 2022',
          endDate: null,
          isCurrent: true,
          bulletsCount: 4,
        },
      ],
      internships: [],
      projects: [
        {
          title: 'Multi-Tenant CRM Platform',
          technologies: ['React.js', 'Node.js', 'MongoDB', 'Redis'],
          bulletsCount: 2,
        },
      ],
      certifications: [
        {
          name: 'AWS Certified Solutions Architect – Associate',
          issuingOrganization: 'Amazon Web Services',
          issueDate: '2023',
        },
      ],
      technicalSkills: ['React.js', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Redux', 'Node.js', 'Express.js', 'REST API', 'GraphQL', 'MongoDB', 'Redis', 'PostgreSQL', 'AWS', 'Docker'],
      softSkills: [],
      achievements: [],
      professionalLinks: [
        { platform: 'GitHub', url: 'https://github.com/pranavnair-fullstack' },
        { platform: 'LinkedIn', url: 'https://linkedin.com/in/pranav-nair-dev' },
      ],
      languages: [],
    },
  },

  // =========================================================================
  // 6. Backend Developer with Multiple Employers
  // =========================================================================
  {
    id: 'resume-06-backend-multi-employer',
    name: 'Meera Iyer',
    headline: 'Senior Backend Engineer',
    scenarioCategory: 'backend_multi_employer',
    formattingStyle: 'company_first',
    fontFamily: 'Helvetica',
    intentionalOmissions: ['internships'],
    docSections: [
      {
        paragraphs: ['meera.iyer@mockbackend.org | +91 9445566778 | Chennai, Tamil Nadu, India | https://github.com/meera-iyer-backend | https://linkedin.com/in/meera-iyer-tech'],
      },
      {
        heading: 'EXPERIENCE',
        paragraphs: ['CloudStream Networks | Backend Systems Engineer | March 2022 – Present | Chennai, India'],
        bullets: [
          'Engineered high-throughput video streaming ingestion services in Go and gRPC processing 100k requests/sec.',
          'Designed Cassandra partitioned column families optimizing read latency to p99 < 12ms for user history lookups.',
        ],
      },
      {
        paragraphs: ['HyperScale Solutions | Backend Developer | June 2020 – February 2022 | Bengaluru, India'],
        bullets: [
          'Developed microservices in Python and FastAPI communicating via RabbitMQ message brokers.',
          'Migrated legacy monolithic billing database from MySQL to PostgreSQL with zero data loss.',
        ],
      },
      {
        paragraphs: ['MicroData Analytics | Junior Software Engineer | July 2018 – May 2020 | Chennai, India'],
        bullets: [
          'Built RESTful API endpoints using Java and Spring Boot supporting enterprise analytics dashboards.',
          'Maintained CI/CD pipelines using Jenkins, Docker, and Kubernetes on AWS.',
        ],
      },
      {
        heading: 'EDUCATION',
        paragraphs: [
          'IIT Madras | 2014 – 2018',
          'B.Tech in Computer Science | CGPA: 9.0/10',
        ],
      },
      {
        heading: 'TECHNICAL SKILLS',
        paragraphs: ['Go, Python, Java, Spring Boot, PostgreSQL, Cassandra, Redis, RabbitMQ, gRPC, Docker, Kubernetes, AWS'],
      },
    ],
    pdfLines: [
      { text: 'meera.iyer@mockbackend.org | +91 9445566778 | Chennai, Tamil Nadu, India | https://github.com/meera-iyer-backend | https://linkedin.com/in/meera-iyer-tech' },
      { text: 'EXPERIENCE', isHeader: true },
      { text: 'CloudStream Networks | Backend Systems Engineer | March 2022 – Present | Chennai, India', isSub: true },
      { text: 'Engineered high-throughput video streaming ingestion services in Go and gRPC processing 100k requests/sec.', isBullet: true },
      { text: 'Designed Cassandra partitioned column families optimizing read latency to p99 < 12ms for user history lookups.', isBullet: true },
      { text: 'HyperScale Solutions | Backend Developer | June 2020 – February 2022 | Bengaluru, India', isSub: true },
      { text: 'Developed microservices in Python and FastAPI communicating via RabbitMQ message brokers.', isBullet: true },
      { text: 'Migrated legacy monolithic billing database from MySQL to PostgreSQL with zero data loss.', isBullet: true },
      { text: 'MicroData Analytics | Junior Software Engineer | July 2018 – May 2020 | Chennai, India', isSub: true },
      { text: 'Built RESTful API endpoints using Java and Spring Boot supporting enterprise analytics dashboards.', isBullet: true },
      { text: 'Maintained CI/CD pipelines using Jenkins, Docker, and Kubernetes on AWS.', isBullet: true },
      { text: 'EDUCATION', isHeader: true },
      { text: 'IIT Madras | 2014 – 2018', isSub: true },
      { text: 'B.Tech in Computer Science | CGPA: 9.0/10' },
      { text: 'TECHNICAL SKILLS', isHeader: true },
      { text: 'Go, Python, Java, Spring Boot, PostgreSQL, Cassandra, Redis, RabbitMQ, gRPC, Docker, Kubernetes, AWS' },
    ],
    expected: {
      personalInfo: {
        name: 'Meera Iyer',
        email: 'meera.iyer@mockbackend.org',
        phone: '+91 9445566778',
        location: 'Chennai, Tamil Nadu, India',
      },
      education: [
        {
          institution: 'IIT Madras',
          degree: 'B.Tech in Computer Science',
          fieldOfStudy: 'Computer Science',
          startYear: 2014,
          endYear: 2018,
          isCurrent: false,
          gpa: '9.0/10',
          educationLevel: 'UNDERGRADUATE',
        },
      ],
      experience: [
        {
          company: 'CloudStream Networks',
          roleTitle: 'Backend Systems Engineer',
          employmentType: 'Full-time',
          location: 'Chennai, India',
          startDate: 'March 2022',
          endDate: null,
          isCurrent: true,
          bulletsCount: 2,
        },
        {
          company: 'HyperScale Solutions',
          roleTitle: 'Backend Developer',
          employmentType: 'Full-time',
          location: 'Bengaluru, India',
          startDate: 'June 2020',
          endDate: 'February 2022',
          isCurrent: false,
          bulletsCount: 2,
        },
        {
          company: 'MicroData Analytics',
          roleTitle: 'Junior Software Engineer',
          employmentType: 'Full-time',
          location: 'Chennai, India',
          startDate: 'July 2018',
          endDate: 'May 2020',
          isCurrent: false,
          bulletsCount: 2,
        },
      ],
      internships: [],
      projects: [],
      certifications: [],
      technicalSkills: ['Go', 'Python', 'Java', 'Spring Boot', 'PostgreSQL', 'Cassandra', 'Redis', 'RabbitMQ', 'gRPC', 'Docker', 'Kubernetes', 'AWS'],
      softSkills: [],
      achievements: [],
      professionalLinks: [
        { platform: 'GitHub', url: 'https://github.com/meera-iyer-backend' },
        { platform: 'LinkedIn', url: 'https://linkedin.com/in/meera-iyer-tech' },
      ],
      languages: [],
    },
  },

  // =========================================================================
  // 7. Frontend Developer with Freelance & Contract Projects
  // =========================================================================
  {
    id: 'resume-07-frontend-freelance',
    name: 'Aarav Mehta',
    headline: 'Frontend & UI/UX Developer',
    scenarioCategory: 'frontend_freelance',
    formattingStyle: 'creative_portfolio',
    fontFamily: 'Helvetica',
    intentionalOmissions: ['internships'],
    docSections: [
      {
        paragraphs: ['aarav.mehta@mockui.design | +91 9321456789 | Mumbai, India | https://aarav-designs.dev | https://behance.net/aaravmehta | https://github.com/aaravm-frontend'],
      },
      {
        heading: 'EXPERIENCE',
        paragraphs: ['Freelance Frontend Developer — Self-Employed | Jan 2022 – Present | Mumbai, India'],
        bullets: [
          'Delivered 14 bespoke web applications for international e-commerce and fintech clients using Next.js and Tailwind CSS.',
          'Achieved 98+ Google Lighthouse performance scores across all client landings through image CDN pipelines and SSR.',
          'Authored accessible WCAG AA design systems in Figma and translated them into modular React component libraries.',
        ],
      },
      {
        paragraphs: ['Contract UI Developer — PixelCraft Studios | June 2021 – Dec 2021 | Remote'],
        bullets: [
          'Implemented animated interactive 3D product visualizers using Three.js, React Three Fiber, and WebGL.',
        ],
      },
      {
        heading: 'PROJECTS',
        paragraphs: ['NeoDesign UI Kit | React.js, Tailwind CSS, TypeScript, Figma | Live Demo: https://aarav-designs.dev/neokit'],
        bullets: [
          'Published an open-source accessible UI library with 45+ components adopted by 1,200+ GitHub developers.',
        ],
      },
      {
        heading: 'EDUCATION',
        paragraphs: [
          'DesignTech Institute of Technology | 2017 – 2021',
          'B.Des in Interaction Design | GPA: 3.8/4.0',
        ],
      },
      {
        heading: 'SKILLS',
        paragraphs: ['React.js, Next.js, TypeScript, Tailwind CSS, Three.js, Figma, UI/UX Design, HTML5, CSS3, Webpack'],
      },
    ],
    pdfLines: [
      { text: 'aarav.mehta@mockui.design | +91 9321456789 | Mumbai, India | https://aarav-designs.dev | https://behance.net/aaravmehta | https://github.com/aaravm-frontend' },
      { text: 'EXPERIENCE', isHeader: true },
      { text: 'Freelance Frontend Developer — Self-Employed | Jan 2022 – Present | Mumbai, India', isSub: true },
      { text: 'Delivered 14 bespoke web applications for international e-commerce and fintech clients using Next.js and Tailwind CSS.', isBullet: true },
      { text: 'Achieved 98+ Google Lighthouse performance scores across all client landings through image CDN pipelines and SSR.', isBullet: true },
      { text: 'Authored accessible WCAG AA design systems in Figma and translated them into modular React component libraries.', isBullet: true },
      { text: 'Contract UI Developer — PixelCraft Studios | June 2021 – Dec 2021 | Remote', isSub: true },
      { text: 'Implemented animated interactive 3D product visualizers using Three.js, React Three Fiber, and WebGL.', isBullet: true },
      { text: 'PROJECTS', isHeader: true },
      { text: 'NeoDesign UI Kit | React.js, Tailwind CSS, TypeScript, Figma | Live Demo: https://aarav-designs.dev/neokit', isSub: true },
      { text: 'Published an open-source accessible UI library with 45+ components adopted by 1,200+ GitHub developers.', isBullet: true },
      { text: 'EDUCATION', isHeader: true },
      { text: 'DesignTech Institute of Technology | 2017 – 2021', isSub: true },
      { text: 'B.Des in Interaction Design | GPA: 3.8/4.0' },
      { text: 'SKILLS', isHeader: true },
      { text: 'React.js, Next.js, TypeScript, Tailwind CSS, Three.js, Figma, UI/UX Design, HTML5, CSS3, Webpack' },
    ],
    expected: {
      personalInfo: {
        name: 'Aarav Mehta',
        email: 'aarav.mehta@mockui.design',
        phone: '+91 9321456789',
        location: 'Mumbai, India',
      },
      education: [
        {
          institution: 'DesignTech Institute of Technology',
          degree: 'B.Des in Interaction Design',
          fieldOfStudy: 'Interaction Design',
          startYear: 2017,
          endYear: 2021,
          isCurrent: false,
          gpa: '3.8/4.0',
        },
      ],
      experience: [
        {
          company: 'Self-Employed',
          roleTitle: 'Freelance Frontend Developer',
          employmentType: 'Freelance',
          location: 'Mumbai, India',
          startDate: 'Jan 2022',
          endDate: null,
          isCurrent: true,
          bulletsCount: 3,
        },
        {
          company: 'PixelCraft Studios',
          roleTitle: 'Contract UI Developer',
          employmentType: 'Contract',
          location: 'Remote',
          startDate: 'June 2021',
          endDate: 'Dec 2021',
          isCurrent: false,
          bulletsCount: 1,
        },
      ],
      internships: [],
      projects: [
        {
          title: 'NeoDesign UI Kit',
          technologies: ['React.js', 'Tailwind CSS', 'TypeScript', 'Figma'],
          demoUrl: 'https://aarav-designs.dev/neokit',
          bulletsCount: 1,
        },
      ],
      certifications: [],
      technicalSkills: ['React.js', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Three.js', 'Figma', 'UI/UX Design', 'HTML5', 'CSS3', 'Webpack'],
      softSkills: [],
      achievements: [],
      professionalLinks: [
        { platform: 'Portfolio', url: 'https://aarav-designs.dev' },
        { platform: 'Behance', url: 'https://behance.net/aaravmehta' },
        { platform: 'GitHub', url: 'https://github.com/aaravm-frontend' },
      ],
      languages: [],
    },
  },

  // =========================================================================
  // 8. Java Developer with Certifications & Training
  // =========================================================================
  {
    id: 'resume-08-java-certified',
    name: 'Vikram Joshi',
    headline: 'Java Backend Specialist',
    scenarioCategory: 'java_certified',
    formattingStyle: 'corporate_standard',
    fontFamily: 'Helvetica',
    intentionalOmissions: ['internships'],
    docSections: [
      {
        paragraphs: ['vikram.joshi@mockjava.com | +91 9820011223 | Bengaluru, Karnataka, India | https://github.com/vikramj-java | https://linkedin.com/in/vikram-joshi-java'],
      },
      {
        heading: 'EXPERIENCE',
        paragraphs: ['Java Backend Developer — Infosys Technologies | July 2022 – Present | Bengaluru, India'],
        bullets: [
          'Developed robust enterprise batch microservices using Java 17, Spring Boot, and Hibernate JPA.',
          'Integrated Oracle SQL database procedures processing over 500,000 banking ledger transactions daily.',
        ],
      },
      {
        heading: 'CERTIFICATIONS',
        paragraphs: [
          'Java with Data Structures & Algorithms',
          'Apna College',
          'Java Full Stack Development',
          'Wipro TalentNext',
          'Oracle Certified Professional: Java SE 11 Developer – Oracle | 2023',
        ],
      },
      {
        heading: 'EDUCATION',
        paragraphs: [
          'Bangalore University | 2018 – 2022',
          'Bachelor of Engineering in Computer Science | Percentage: 82.5%',
        ],
      },
      {
        heading: 'TECHNICAL SKILLS',
        paragraphs: ['Java, Spring Boot, Microservices, Hibernate, Oracle SQL, MySQL, Maven, Docker, REST API'],
      },
    ],
    pdfLines: [
      { text: 'vikram.joshi@mockjava.com | +91 9820011223 | Bengaluru, Karnataka, India | https://github.com/vikramj-java | https://linkedin.com/in/vikram-joshi-java' },
      { text: 'EXPERIENCE', isHeader: true },
      { text: 'Java Backend Developer — Infosys Technologies | July 2022 – Present | Bengaluru, India', isSub: true },
      { text: 'Developed robust enterprise batch microservices using Java 17, Spring Boot, and Hibernate JPA.', isBullet: true },
      { text: 'Integrated Oracle SQL database procedures processing over 500,000 banking ledger transactions daily.', isBullet: true },
      { text: 'CERTIFICATIONS', isHeader: true },
      { text: 'Java with Data Structures & Algorithms' },
      { text: 'Apna College' },
      { text: 'Java Full Stack Development' },
      { text: 'Wipro TalentNext' },
      { text: 'Oracle Certified Professional: Java SE 11 Developer – Oracle | 2023' },
      { text: 'EDUCATION', isHeader: true },
      { text: 'Bangalore University | 2018 – 2022', isSub: true },
      { text: 'Bachelor of Engineering in Computer Science | Percentage: 82.5%' },
      { text: 'TECHNICAL SKILLS', isHeader: true },
      { text: 'Java, Spring Boot, Microservices, Hibernate, Oracle SQL, MySQL, Maven, Docker, REST API' },
    ],
    expected: {
      personalInfo: {
        name: 'Vikram Joshi',
        email: 'vikram.joshi@mockjava.com',
        phone: '+91 9820011223',
        location: 'Bengaluru, Karnataka, India',
      },
      education: [
        {
          institution: 'Bangalore University',
          degree: 'Bachelor of Engineering in Computer Science',
          fieldOfStudy: 'Computer Science',
          startYear: 2018,
          endYear: 2022,
          isCurrent: false,
          gpa: '82.5%',
          educationLevel: 'UNDERGRADUATE',
        },
      ],
      experience: [
        {
          company: 'Infosys Technologies',
          roleTitle: 'Java Backend Developer',
          employmentType: 'Full-time',
          location: 'Bengaluru, India',
          startDate: 'July 2022',
          endDate: null,
          isCurrent: true,
          bulletsCount: 2,
        },
      ],
      internships: [],
      projects: [],
      certifications: [
        {
          name: 'Java with Data Structures & Algorithms',
          issuingOrganization: 'Apna College',
        },
        {
          name: 'Java Full Stack Development',
          issuingOrganization: 'Wipro TalentNext',
        },
        {
          name: 'Oracle Certified Professional: Java SE 11 Developer',
          issuingOrganization: 'Oracle',
          issueDate: '2023',
        },
      ],
      technicalSkills: ['Java', 'Spring Boot', 'Microservices', 'Hibernate', 'Oracle SQL', 'MySQL', 'Maven', 'Docker', 'REST API'],
      softSkills: [],
      achievements: [],
      professionalLinks: [
        { platform: 'GitHub', url: 'https://github.com/vikramj-java' },
        { platform: 'LinkedIn', url: 'https://linkedin.com/in/vikram-joshi-java' },
      ],
      languages: [],
    },
  },

  // =========================================================================
  // 9. Python / AI Research Engineer with Publications
  // =========================================================================
  {
    id: 'resume-09-python-ai-research',
    name: 'Ananya Sen',
    headline: 'AI Research Scientist',
    scenarioCategory: 'python_ai_research',
    formattingStyle: 'research_academic',
    fontFamily: 'Times',
    intentionalOmissions: ['internships'],
    docSections: [
      {
        paragraphs: ['ananya.sen@mockresearch.org | +91 9830112233 | Kolkata, West Bengal, India | https://github.com/ananya-sen-ai | https://linkedin.com/in/ananya-sen-research'],
      },
      {
        heading: 'EXPERIENCE',
        paragraphs: ['Machine Learning Research Engineer — DeepMind Labs Affiliate | August 2021 – Present | Kolkata, India'],
        bullets: [
          'Published 2 papers at top-tier NLP venues on parameter-efficient fine-tuning (PEFT) with LoRA and QLoRA adapters.',
          'Trained transformer models up to 13B parameters on multi-GPU compute clusters using PyTorch and DeepSpeed.',
        ],
      },
      {
        heading: 'EDUCATION',
        paragraphs: [
          'Indian Statistical Institute Kolkata | 2019 – 2021',
          'M.Tech in Computer Science | CGPA: 9.4/10',
          'Jadavpur University | 2015 – 2019',
          'B.E. in Information Technology | CGPA: 9.1/10',
        ],
      },
      {
        heading: 'RESEARCH PROJECTS',
        paragraphs: ['Quantized LLM Inference Runtime | Python, PyTorch, CUDA, C++ | GitHub'],
        bullets: [
          'Engineered a 4-bit INT4 quantization tensor library achieving 3.2x faster inference latency on NVIDIA GPUs.',
        ],
      },
      {
        heading: 'TECHNICAL SKILLS',
        paragraphs: ['Python, PyTorch, TensorFlow, DeepSpeed, CUDA, Transformers, HuggingFace, Linux, C++, Docker, Git'],
      },
    ],
    pdfLines: [
      { text: 'ananya.sen@mockresearch.org | +91 9830112233 | Kolkata, West Bengal, India | https://github.com/ananya-sen-ai | https://linkedin.com/in/ananya-sen-research' },
      { text: 'EXPERIENCE', isHeader: true },
      { text: 'Machine Learning Research Engineer — DeepMind Labs Affiliate | August 2021 – Present | Kolkata, India', isSub: true },
      { text: 'Published 2 papers at top-tier NLP venues on parameter-efficient fine-tuning (PEFT) with LoRA and QLoRA adapters.', isBullet: true },
      { text: 'Trained transformer models up to 13B parameters on multi-GPU compute clusters using PyTorch and DeepSpeed.', isBullet: true },
      { text: 'EDUCATION', isHeader: true },
      { text: 'Indian Statistical Institute Kolkata | 2019 – 2021', isSub: true },
      { text: 'M.Tech in Computer Science | CGPA: 9.4/10' },
      { text: 'Jadavpur University | 2015 – 2019', isSub: true },
      { text: 'B.E. in Information Technology | CGPA: 9.1/10' },
      { text: 'RESEARCH PROJECTS', isHeader: true },
      { text: 'Quantized LLM Inference Runtime | Python, PyTorch, CUDA, C++ | GitHub', isSub: true },
      { text: 'Engineered a 4-bit INT4 quantization tensor library achieving 3.2x faster inference latency on NVIDIA GPUs.', isBullet: true },
      { text: 'TECHNICAL SKILLS', isHeader: true },
      { text: 'Python, PyTorch, TensorFlow, DeepSpeed, CUDA, Transformers, HuggingFace, Linux, C++, Docker, Git' },
    ],
    expected: {
      personalInfo: {
        name: 'Ananya Sen',
        email: 'ananya.sen@mockresearch.org',
        phone: '+91 9830112233',
        location: 'Kolkata, West Bengal, India',
      },
      education: [
        {
          institution: 'Indian Statistical Institute Kolkata',
          degree: 'M.Tech in Computer Science',
          fieldOfStudy: 'Computer Science',
          startYear: 2019,
          endYear: 2021,
          isCurrent: false,
          gpa: '9.4/10',
          educationLevel: 'POSTGRADUATE',
        },
        {
          institution: 'Jadavpur University',
          degree: 'B.E. in Information Technology',
          fieldOfStudy: 'Information Technology',
          startYear: 2015,
          endYear: 2019,
          isCurrent: false,
          gpa: '9.1/10',
          educationLevel: 'UNDERGRADUATE',
        },
      ],
      experience: [
        {
          company: 'DeepMind Labs Affiliate',
          roleTitle: 'Machine Learning Research Engineer',
          employmentType: 'Full-time',
          location: 'Kolkata, India',
          startDate: 'August 2021',
          endDate: null,
          isCurrent: true,
          bulletsCount: 2,
        },
      ],
      internships: [],
      projects: [
        {
          title: 'Quantized LLM Inference Runtime',
          technologies: ['Python', 'PyTorch', 'CUDA', 'C++'],
          bulletsCount: 1,
        },
      ],
      certifications: [],
      technicalSkills: ['Python', 'PyTorch', 'TensorFlow', 'DeepSpeed', 'CUDA', 'Transformers', 'HuggingFace', 'Linux', 'C++', 'Docker', 'Git'],
      softSkills: [],
      achievements: [],
      professionalLinks: [
        { platform: 'GitHub', url: 'https://github.com/ananya-sen-ai' },
        { platform: 'LinkedIn', url: 'https://linkedin.com/in/ananya-sen-research' },
      ],
      languages: [],
    },
  },

  // =========================================================================
  // 10. Experienced Senior Software Engineer (7 Years Experience)
  // =========================================================================
  {
    id: 'resume-10-senior-engineer-7y',
    name: 'Tarun Singhania',
    headline: 'Staff Software Architect',
    scenarioCategory: 'senior_engineer_7y',
    formattingStyle: 'dense_multipage',
    fontFamily: 'Helvetica',
    intentionalOmissions: ['internships'],
    docSections: [
      {
        paragraphs: ['tarun.singhania@mocktech.org | +91 9811223344 | Gurugram, Haryana, India | https://github.com/taruns-tech | https://linkedin.com/in/tarun-singhania-lead'],
      },
      {
        heading: 'EXPERIENCE',
        paragraphs: ['Lead Systems Architect — FinServe Technologies | Jan 2022 – Present | Gurugram, India'],
        bullets: [
          'Spearheaded design of microservices infrastructure processing 15M transactions daily with 99.995% uptime.',
          'Mentored 18 engineers across 3 distributed squads and established company-wide architectural standards.',
        ],
      },
      {
        paragraphs: ['Senior Backend Engineer — FinServe Technologies | Jan 2020 – Dec 2021 | Gurugram, India'],
        bullets: [
          'Reduced AWS compute costs by $180,000 annually by migrating container fleets from EC2 to Kubernetes EKS.',
        ],
      },
      {
        paragraphs: ['Software Engineer — Global Retail Systems | July 2017 – Dec 2019 | Bengaluru, India'],
        bullets: [
          'Built order inventory management microservices in Java, Spring Boot, and PostgreSQL.',
        ],
      },
      {
        heading: 'EDUCATION',
        paragraphs: [
          'Delhi Technological University | 2013 – 2017',
          'Bachelor of Technology in Computer Engineering | CGPA: 8.9/10',
        ],
      },
      {
        heading: 'TECHNICAL SKILLS',
        paragraphs: ['Java, Go, Spring Boot, Kubernetes, AWS, PostgreSQL, Redis, Kafka, System Design, CI/CD, Microservices'],
      },
    ],
    pdfLines: [
      { text: 'tarun.singhania@mocktech.org | +91 9811223344 | Gurugram, Haryana, India | https://github.com/taruns-tech | https://linkedin.com/in/tarun-singhania-lead' },
      { text: 'EXPERIENCE', isHeader: true },
      { text: 'Lead Systems Architect — FinServe Technologies | Jan 2022 – Present | Gurugram, India', isSub: true },
      { text: 'Spearheaded design of microservices infrastructure processing 15M transactions daily with 99.995% uptime.', isBullet: true },
      { text: 'Mentored 18 engineers across 3 distributed squads and established company-wide architectural standards.', isBullet: true },
      { text: 'Senior Backend Engineer — FinServe Technologies | Jan 2020 – Dec 2021 | Gurugram, India', isSub: true },
      { text: 'Reduced AWS compute costs by $180,000 annually by migrating container fleets from EC2 to Kubernetes EKS.', isBullet: true },
      { text: 'Software Engineer — Global Retail Systems | July 2017 – Dec 2019 | Bengaluru, India', isSub: true },
      { text: 'Built order inventory management microservices in Java, Spring Boot, and PostgreSQL.', isBullet: true },
      { text: 'EDUCATION', isHeader: true },
      { text: 'Delhi Technological University | 2013 – 2017', isSub: true },
      { text: 'Bachelor of Technology in Computer Engineering | CGPA: 8.9/10' },
      { text: 'TECHNICAL SKILLS', isHeader: true },
      { text: 'Java, Go, Spring Boot, Kubernetes, AWS, PostgreSQL, Redis, Kafka, System Design, CI/CD, Microservices' },
    ],
    expected: {
      personalInfo: {
        name: 'Tarun Singhania',
        email: 'tarun.singhania@mocktech.org',
        phone: '+91 9811223344',
        location: 'Gurugram, Haryana, India',
      },
      education: [
        {
          institution: 'Delhi Technological University',
          degree: 'Bachelor of Technology in Computer Engineering',
          fieldOfStudy: 'Computer Engineering',
          startYear: 2013,
          endYear: 2017,
          isCurrent: false,
          gpa: '8.9/10',
          educationLevel: 'UNDERGRADUATE',
        },
      ],
      experience: [
        {
          company: 'FinServe Technologies',
          roleTitle: 'Lead Systems Architect',
          employmentType: 'Full-time',
          location: 'Gurugram, India',
          startDate: 'Jan 2022',
          endDate: null,
          isCurrent: true,
          bulletsCount: 2,
        },
        {
          company: 'FinServe Technologies',
          roleTitle: 'Senior Backend Engineer',
          employmentType: 'Full-time',
          location: 'Gurugram, India',
          startDate: 'Jan 2020',
          endDate: 'Dec 2021',
          isCurrent: false,
          bulletsCount: 1,
        },
        {
          company: 'Global Retail Systems',
          roleTitle: 'Software Engineer',
          employmentType: 'Full-time',
          location: 'Bengaluru, India',
          startDate: 'July 2017',
          endDate: 'Dec 2019',
          isCurrent: false,
          bulletsCount: 1,
        },
      ],
      internships: [],
      projects: [],
      certifications: [],
      technicalSkills: ['Java', 'Go', 'Spring Boot', 'Kubernetes', 'AWS', 'PostgreSQL', 'Redis', 'Kafka', 'System Design', 'CI/CD', 'Microservices'],
      softSkills: [],
      achievements: [],
      professionalLinks: [
        { platform: 'GitHub', url: 'https://github.com/taruns-tech' },
        { platform: 'LinkedIn', url: 'https://linkedin.com/in/tarun-singhania-lead' },
      ],
      languages: [],
    },
  },

  // =========================================================================
  // 11. Engineering Manager with Leadership Experience
  // =========================================================================
  {
    id: 'resume-11-engineering-manager',
    name: 'Nandita Roy',
    headline: 'Engineering Manager',
    scenarioCategory: 'engineering_manager',
    formattingStyle: 'executive_layout',
    fontFamily: 'Helvetica',
    intentionalOmissions: ['internships'],
    docSections: [
      {
        paragraphs: ['nandita.roy@mockmgmt.com | +91 9711224455 | Bengaluru, Karnataka, India | https://linkedin.com/in/nandita-roy-em | https://github.com/nanditaroy-mgmt'],
      },
      {
        heading: 'EXPERIENCE',
        paragraphs: ['Engineering Manager — OmniPlatform Cloud | August 2021 – Present | Bengaluru, India'],
        bullets: [
          'Directly lead, coach, and manage a high-performing squad of 12 full-stack and backend software engineers.',
          'Increased on-time feature delivery by 40% through implementing structured sprint planning and Scrum rituals.',
          'Hired and onboarded 15 software engineers, maintaining a 94% annualized team retention rate.',
        ],
      },
      {
        paragraphs: ['Technical Lead — CloudScale Systems | March 2018 – July 2021 | Bengaluru, India'],
        bullets: [
          'Led architecture of microservices in Node.js, TypeScript, and AWS Lambda handling 5M daily invocations.',
        ],
      },
      {
        heading: 'EDUCATION',
        paragraphs: [
          'Jadavpur University | 2012 – 2016',
          'Bachelor of Engineering in Computer Science | CGPA: 8.8/10',
        ],
      },
      {
        heading: 'SKILLS & LEADERSHIP',
        paragraphs: [
          'Leadership, Agile Methodologies, Scrum, Performance Reviews, Sprint Planning, Team Collaboration, Hiring',
          'Technical: Node.js, TypeScript, AWS, Microservices, System Architecture',
        ],
      },
    ],
    pdfLines: [
      { text: 'nandita.roy@mockmgmt.com | +91 9711224455 | Bengaluru, Karnataka, India | https://linkedin.com/in/nandita-roy-em | https://github.com/nanditaroy-mgmt' },
      { text: 'EXPERIENCE', isHeader: true },
      { text: 'Engineering Manager — OmniPlatform Cloud | August 2021 – Present | Bengaluru, India', isSub: true },
      { text: 'Directly lead, coach, and manage a high-performing squad of 12 full-stack and backend software engineers.', isBullet: true },
      { text: 'Increased on-time feature delivery by 40% through implementing structured sprint planning and Scrum rituals.', isBullet: true },
      { text: 'Hired and onboarded 15 software engineers, maintaining a 94% annualized team retention rate.', isBullet: true },
      { text: 'Technical Lead — CloudScale Systems | March 2018 – July 2021 | Bengaluru, India', isSub: true },
      { text: 'Led architecture of microservices in Node.js, TypeScript, and AWS Lambda handling 5M daily invocations.', isBullet: true },
      { text: 'EDUCATION', isHeader: true },
      { text: 'Jadavpur University | 2012 – 2016', isSub: true },
      { text: 'Bachelor of Engineering in Computer Science | CGPA: 8.8/10' },
      { text: 'SKILLS & LEADERSHIP', isHeader: true },
      { text: 'Leadership, Agile Methodologies, Scrum, Performance Reviews, Sprint Planning, Team Collaboration, Hiring' },
      { text: 'Technical: Node.js, TypeScript, AWS, Microservices, System Architecture' },
    ],
    expected: {
      personalInfo: {
        name: 'Nandita Roy',
        email: 'nandita.roy@mockmgmt.com',
        phone: '+91 9711224455',
        location: 'Bengaluru, Karnataka, India',
      },
      education: [
        {
          institution: 'Jadavpur University',
          degree: 'Bachelor of Engineering in Computer Science',
          fieldOfStudy: 'Computer Science',
          startYear: 2012,
          endYear: 2016,
          isCurrent: false,
          gpa: '8.8/10',
          educationLevel: 'UNDERGRADUATE',
        },
      ],
      experience: [
        {
          company: 'OmniPlatform Cloud',
          roleTitle: 'Engineering Manager',
          employmentType: 'Full-time',
          location: 'Bengaluru, India',
          startDate: 'August 2021',
          endDate: null,
          isCurrent: true,
          bulletsCount: 3,
        },
        {
          company: 'CloudScale Systems',
          roleTitle: 'Technical Lead',
          employmentType: 'Full-time',
          location: 'Bengaluru, India',
          startDate: 'March 2018',
          endDate: 'July 2021',
          isCurrent: false,
          bulletsCount: 1,
        },
      ],
      internships: [],
      projects: [],
      certifications: [],
      technicalSkills: ['Node.js', 'TypeScript', 'AWS', 'Microservices', 'System Architecture'],
      softSkills: ['Leadership', 'Agile Methodologies', 'Scrum', 'Team Collaboration', 'Hiring'],
      achievements: [],
      professionalLinks: [
        { platform: 'LinkedIn', url: 'https://linkedin.com/in/nandita-roy-em' },
        { platform: 'GitHub', url: 'https://github.com/nanditaroy-mgmt' },
      ],
      languages: [],
    },
  },

  // =========================================================================
  // 12. Career-Switching Candidate (Non-Tech to Tech via Bootcamp)
  // =========================================================================
  {
    id: 'resume-12-career-switcher',
    name: 'Deepak Chawla',
    headline: 'Junior Full Stack Developer',
    scenarioCategory: 'career_switcher',
    formattingStyle: 'hybrid_functional',
    fontFamily: 'Helvetica',
    intentionalOmissions: ['internships'],
    docSections: [
      {
        paragraphs: ['deepak.chawla@mockswitch.net | +91 9867012345 | Mumbai, Maharashtra, India | https://github.com/deepakc-dev | https://linkedin.com/in/deepak-chawla-sde'],
      },
      {
        heading: 'EXPERIENCE',
        paragraphs: ['Operations Manager — FastLogistics Pvt. Ltd. | June 2020 – July 2023 | Mumbai, India'],
        bullets: [
          'Managed fulfillment warehouse logistics teams and reduced inventory discrepancies by 22%.',
          'Automated daily Excel reconciliation by building customized Python data scripts.',
        ],
      },
      {
        heading: 'EDUCATION',
        paragraphs: [
          'University of Mumbai | 2017 – 2020',
          'Bachelor of Commerce (B.Com) | Percentage: 74.2%',
          'Masai School | 2023 – 2024',
          'Full Stack Web Development Intensive Bootcamp',
        ],
      },
      {
        heading: 'PROJECTS',
        paragraphs: ['SupplyChain Express — Logistics Portal | React.js, Node.js, Express.js, MongoDB | GitHub'],
        bullets: [
          'Constructed an inventory tracking portal supporting live order dispatch status updates and invoice downloads.',
        ],
      },
      {
        heading: 'TECHNICAL SKILLS',
        paragraphs: ['JavaScript, TypeScript, React.js, Node.js, Express.js, MongoDB, Git, HTML5, CSS3, Python'],
      },
    ],
    pdfLines: [
      { text: 'deepak.chawla@mockswitch.net | +91 9867012345 | Mumbai, Maharashtra, India | https://github.com/deepakc-dev | https://linkedin.com/in/deepak-chawla-sde' },
      { text: 'EXPERIENCE', isHeader: true },
      { text: 'Operations Manager — FastLogistics Pvt. Ltd. | June 2020 – July 2023 | Mumbai, India', isSub: true },
      { text: 'Managed fulfillment warehouse logistics teams and reduced inventory discrepancies by 22%.', isBullet: true },
      { text: 'Automated daily Excel reconciliation by building customized Python data scripts.', isBullet: true },
      { text: 'EDUCATION', isHeader: true },
      { text: 'University of Mumbai | 2017 – 2020', isSub: true },
      { text: 'Bachelor of Commerce (B.Com) | Percentage: 74.2%' },
      { text: 'Masai School | 2023 – 2024', isSub: true },
      { text: 'Full Stack Web Development Intensive Bootcamp' },
      { text: 'PROJECTS', isHeader: true },
      { text: 'SupplyChain Express — Logistics Portal | React.js, Node.js, Express.js, MongoDB | GitHub', isSub: true },
      { text: 'Constructed an inventory tracking portal supporting live order dispatch status updates and invoice downloads.', isBullet: true },
      { text: 'TECHNICAL SKILLS', isHeader: true },
      { text: 'JavaScript, TypeScript, React.js, Node.js, Express.js, MongoDB, Git, HTML5, CSS3, Python' },
    ],
    expected: {
      personalInfo: {
        name: 'Deepak Chawla',
        email: 'deepak.chawla@mockswitch.net',
        phone: '+91 9867012345',
        location: 'Mumbai, Maharashtra, India',
      },
      education: [
        {
          institution: 'University of Mumbai',
          degree: 'Bachelor of Commerce (B.Com)',
          fieldOfStudy: 'Commerce',
          startYear: 2017,
          endYear: 2020,
          isCurrent: false,
          gpa: '74.2%',
          educationLevel: 'UNDERGRADUATE',
        },
      ],
      experience: [
        {
          company: 'FastLogistics Pvt. Ltd.',
          roleTitle: 'Operations Manager',
          employmentType: 'Full-time',
          location: 'Mumbai, India',
          startDate: 'June 2020',
          endDate: 'July 2023',
          isCurrent: false,
          bulletsCount: 2,
        },
      ],
      internships: [],
      projects: [
        {
          title: 'SupplyChain Express — Logistics Portal',
          technologies: ['React.js', 'Node.js', 'Express.js', 'MongoDB'],
          bulletsCount: 1,
        },
      ],
      certifications: [
        {
          name: 'Full Stack Web Development Intensive Bootcamp',
          issuingOrganization: 'Masai School',
        },
      ],
      technicalSkills: ['JavaScript', 'TypeScript', 'React.js', 'Node.js', 'Express.js', 'MongoDB', 'Git', 'HTML5', 'CSS3', 'Python'],
      softSkills: [],
      achievements: [],
      professionalLinks: [
        { platform: 'GitHub', url: 'https://github.com/deepakc-dev' },
        { platform: 'LinkedIn', url: 'https://linkedin.com/in/deepak-chawla-sde' },
      ],
      languages: [],
    },
  },

  // =========================================================================
  // 13. Traditional Single-Column Resume
  // =========================================================================
  {
    id: 'resume-13-traditional-single-column',
    name: 'Harish Patel',
    headline: 'Software Engineer',
    scenarioCategory: 'traditional_single_column',
    formattingStyle: 'classic_times',
    fontFamily: 'Times',
    intentionalOmissions: ['internships'],
    docSections: [
      {
        paragraphs: ['harish.patel@mockpatel.com | +91 9911223344 | Ahmedabad, Gujarat, India | https://github.com/harishp-eng | https://linkedin.com/in/harish-patel-eng'],
      },
      {
        heading: 'EDUCATION',
        paragraphs: [
          'Nirma University | 2018 – 2022',
          'Bachelor of Technology in Computer Engineering | CGPA: 8.4/10',
        ],
      },
      {
        heading: 'EXPERIENCE',
        paragraphs: ['Software Engineer — Crest Data Systems | July 2022 – Present | Ahmedabad, India'],
        bullets: [
          'Built Splunk and Elasticsearch data monitoring plugins in Python and Go.',
          'Maintained CI pipelines across Linux virtual machines using Docker and GitHub Actions.',
        ],
      },
      {
        heading: 'PROJECTS',
        paragraphs: ['Network Packet Inspector | Go, libpcap, Docker | GitHub'],
        bullets: ['Constructed raw socket packet sniffer capturing TCP handshakes and bandwidth statistics.'],
      },
      {
        heading: 'SKILLS',
        paragraphs: ['Python, Go, Linux, Docker, Elasticsearch, Splunk, Git, REST API'],
      },
    ],
    pdfLines: [
      { text: 'harish.patel@mockpatel.com | +91 9911223344 | Ahmedabad, Gujarat, India | https://github.com/harishp-eng | https://linkedin.com/in/harish-patel-eng' },
      { text: 'EDUCATION', isHeader: true },
      { text: 'Nirma University | 2018 – 2022', isSub: true },
      { text: 'Bachelor of Technology in Computer Engineering | CGPA: 8.4/10' },
      { text: 'EXPERIENCE', isHeader: true },
      { text: 'Software Engineer — Crest Data Systems | July 2022 – Present | Ahmedabad, India', isSub: true },
      { text: 'Built Splunk and Elasticsearch data monitoring plugins in Python and Go.', isBullet: true },
      { text: 'Maintained CI pipelines across Linux virtual machines using Docker and GitHub Actions.', isBullet: true },
      { text: 'PROJECTS', isHeader: true },
      { text: 'Network Packet Inspector | Go, libpcap, Docker | GitHub', isSub: true },
      { text: 'Constructed raw socket packet sniffer capturing TCP handshakes and bandwidth statistics.', isBullet: true },
      { text: 'SKILLS', isHeader: true },
      { text: 'Python, Go, Linux, Docker, Elasticsearch, Splunk, Git, REST API' },
    ],
    expected: {
      personalInfo: {
        name: 'Harish Patel',
        email: 'harish.patel@mockpatel.com',
        phone: '+91 9911223344',
        location: 'Ahmedabad, Gujarat, India',
      },
      education: [
        {
          institution: 'Nirma University',
          degree: 'Bachelor of Technology in Computer Engineering',
          fieldOfStudy: 'Computer Engineering',
          startYear: 2018,
          endYear: 2022,
          isCurrent: false,
          gpa: '8.4/10',
          educationLevel: 'UNDERGRADUATE',
        },
      ],
      experience: [
        {
          company: 'Crest Data Systems',
          roleTitle: 'Software Engineer',
          employmentType: 'Full-time',
          location: 'Ahmedabad, India',
          startDate: 'July 2022',
          endDate: null,
          isCurrent: true,
          bulletsCount: 2,
        },
      ],
      internships: [],
      projects: [
        {
          title: 'Network Packet Inspector',
          technologies: ['Go', 'libpcap', 'Docker'],
          bulletsCount: 1,
        },
      ],
      certifications: [],
      technicalSkills: ['Python', 'Go', 'Linux', 'Docker', 'Elasticsearch', 'Splunk', 'Git', 'REST API'],
      softSkills: [],
      achievements: [],
      professionalLinks: [
        { platform: 'GitHub', url: 'https://github.com/harishp-eng' },
        { platform: 'LinkedIn', url: 'https://linkedin.com/in/harish-patel-eng' },
      ],
      languages: [],
    },
  },

  // =========================================================================
  // 14. Two-Column Layout Resume
  // =========================================================================
  {
    id: 'resume-14-two-column-layout',
    name: 'Ritu Sharma',
    headline: 'Frontend Engineer',
    scenarioCategory: 'two_column_layout',
    formattingStyle: 'two_column_visual',
    fontFamily: 'Helvetica',
    isTwoColumn: true,
    intentionalOmissions: ['internships'],
    docSections: [
      {
        paragraphs: ['ritu.sharma@mockprofile.in | +91 9654123456 | Jaipur, Rajasthan, India | https://github.com/ritusharma-ui | https://linkedin.com/in/ritu-sharma-ui'],
      },
      {
        heading: 'EXPERIENCE',
        paragraphs: ['Frontend Engineer — WebCraft Interactive | June 2022 – Present | Jaipur, India'],
        bullets: [
          'Engineered user interface components in React.js, TypeScript, and CSS3.',
          'Reduced time to interactive by 450ms across responsive mobile interfaces.',
        ],
      },
      {
        heading: 'EDUCATION',
        paragraphs: [
          'MNIT Jaipur | 2018 – 2022',
          'B.Tech in Computer Science | CGPA: 8.6/10',
        ],
      },
      {
        heading: 'PROJECTS',
        paragraphs: ['Interactive Portfolio Showcase | React.js, Tailwind CSS | GitHub'],
        bullets: ['Built client portfolio featuring animated case studies and dark mode support.'],
      },
      {
        heading: 'SKILLS',
        paragraphs: ['React.js, TypeScript, HTML5, CSS3, Tailwind CSS, Webpack, Git, Jest'],
      },
    ],
    pdfLines: [
      { text: 'ritu.sharma@mockprofile.in | +91 9654123456 | Jaipur, Rajasthan, India | https://github.com/ritusharma-ui | https://linkedin.com/in/ritu-sharma-ui' },
      { text: 'EXPERIENCE', isHeader: true },
      { text: 'Frontend Engineer — WebCraft Interactive | June 2022 – Present | Jaipur, India', isSub: true },
      { text: 'Engineered user interface components in React.js, TypeScript, and CSS3.', isBullet: true },
      { text: 'Reduced time to interactive by 450ms across responsive mobile interfaces.', isBullet: true },
      { text: 'EDUCATION', isHeader: true },
      { text: 'MNIT Jaipur | 2018 – 2022', isSub: true },
      { text: 'B.Tech in Computer Science | CGPA: 8.6/10' },
      { text: 'PROJECTS', isHeader: true },
      { text: 'Interactive Portfolio Showcase | React.js, Tailwind CSS | GitHub', isSub: true },
      { text: 'Built client portfolio featuring animated case studies and dark mode support.', isBullet: true },
      { text: 'SKILLS', isHeader: true },
      { text: 'React.js, TypeScript, HTML5, CSS3, Tailwind CSS, Webpack, Git, Jest' },
    ],
    expected: {
      personalInfo: {
        name: 'Ritu Sharma',
        email: 'ritu.sharma@mockprofile.in',
        phone: '+91 9654123456',
        location: 'Jaipur, Rajasthan, India',
      },
      education: [
        {
          institution: 'MNIT Jaipur',
          degree: 'B.Tech in Computer Science',
          fieldOfStudy: 'Computer Science',
          startYear: 2018,
          endYear: 2022,
          isCurrent: false,
          gpa: '8.6/10',
          educationLevel: 'UNDERGRADUATE',
        },
      ],
      experience: [
        {
          company: 'WebCraft Interactive',
          roleTitle: 'Frontend Engineer',
          employmentType: 'Full-time',
          location: 'Jaipur, India',
          startDate: 'June 2022',
          endDate: null,
          isCurrent: true,
          bulletsCount: 2,
        },
      ],
      internships: [],
      projects: [
        {
          title: 'Interactive Portfolio Showcase',
          technologies: ['React.js', 'Tailwind CSS'],
          bulletsCount: 1,
        },
      ],
      certifications: [],
      technicalSkills: ['React.js', 'TypeScript', 'HTML5', 'CSS3', 'Tailwind CSS', 'Webpack', 'Git', 'Jest'],
      softSkills: [],
      achievements: [],
      professionalLinks: [
        { platform: 'GitHub', url: 'https://github.com/ritusharma-ui' },
        { platform: 'LinkedIn', url: 'https://linkedin.com/in/ritu-sharma-ui' },
      ],
      languages: [],
    },
  },

  // =========================================================================
  // 15. Resume with Tables and Structured Sections
  // =========================================================================
  {
    id: 'resume-15-tables-structured',
    name: 'Sandeep Reddy',
    headline: 'Database & Cloud Engineer',
    scenarioCategory: 'tables_structured',
    formattingStyle: 'tabular_grid',
    fontFamily: 'Helvetica',
    intentionalOmissions: ['internships'],
    docSections: [
      {
        paragraphs: ['sandeep.reddy@mockdb.org | +91 9848011223 | Visakhapatnam, Andhra Pradesh, India | https://github.com/sandeep-reddy-db | https://linkedin.com/in/sandeep-reddy-dba'],
      },
      {
        heading: 'EDUCATION',
        table: [
          ['Institution', 'Degree', 'Specialization', 'Year', 'Grade'],
          ['Andhra University', 'B.Tech', 'Computer Science', '2019 – 2023', '8.5 CGPA'],
        ],
      },
      {
        heading: 'EXPERIENCE',
        paragraphs: ['Database Administrator — CoreData Systems | July 2023 – Present | Visakhapatnam, India'],
        bullets: [
          'Managed 40 production PostgreSQL and MySQL instances with automated automated replication and backup recovery.',
        ],
      },
      {
        heading: 'CERTIFICATIONS',
        table: [
          ['Certification Name', 'Issuer', 'Date'],
          ['AWS Certified Database – Specialty', 'Amazon Web Services', '2023'],
          ['Oracle Database SQL Certified Associate', 'Oracle', '2022'],
        ],
      },
      {
        heading: 'TECHNICAL SKILLS',
        paragraphs: ['PostgreSQL, MySQL, Oracle SQL, Redis, AWS, Docker, Linux, Bash Scripting'],
      },
    ],
    pdfLines: [
      { text: 'sandeep.reddy@mockdb.org | +91 9848011223 | Visakhapatnam, Andhra Pradesh, India | https://github.com/sandeep-reddy-db | https://linkedin.com/in/sandeep-reddy-dba' },
      { text: 'EDUCATION', isHeader: true },
      { text: 'Andhra University | 2019 – 2023', isSub: true },
      { text: 'B.Tech in Computer Science | Grade: 8.5 CGPA' },
      { text: 'EXPERIENCE', isHeader: true },
      { text: 'Database Administrator — CoreData Systems | July 2023 – Present | Visakhapatnam, India', isSub: true },
      { text: 'Managed 40 production PostgreSQL and MySQL instances with automated automated replication and backup recovery.', isBullet: true },
      { text: 'CERTIFICATIONS', isHeader: true },
      { text: 'AWS Certified Database – Specialty – Amazon Web Services | 2023' },
      { text: 'Oracle Database SQL Certified Associate – Oracle | 2022' },
      { text: 'TECHNICAL SKILLS', isHeader: true },
      { text: 'PostgreSQL, MySQL, Oracle SQL, Redis, AWS, Docker, Linux, Bash Scripting' },
    ],
    expected: {
      personalInfo: {
        name: 'Sandeep Reddy',
        email: 'sandeep.reddy@mockdb.org',
        phone: '+91 9848011223',
        location: 'Visakhapatnam, Andhra Pradesh, India',
      },
      education: [
        {
          institution: 'Andhra University',
          degree: 'B.Tech in Computer Science',
          fieldOfStudy: 'Computer Science',
          startYear: 2019,
          endYear: 2023,
          isCurrent: false,
          gpa: '8.5 CGPA',
        },
      ],
      experience: [
        {
          company: 'CoreData Systems',
          roleTitle: 'Database Administrator',
          employmentType: 'Full-time',
          location: 'Visakhapatnam, India',
          startDate: 'July 2023',
          endDate: null,
          isCurrent: true,
          bulletsCount: 1,
        },
      ],
      internships: [],
      projects: [],
      certifications: [
        {
          name: 'AWS Certified Database – Specialty',
          issuingOrganization: 'Amazon Web Services',
          issueDate: '2023',
        },
        {
          name: 'Oracle Database SQL Certified Associate',
          issuingOrganization: 'Oracle',
          issueDate: '2022',
        },
      ],
      technicalSkills: ['PostgreSQL', 'MySQL', 'Oracle SQL', 'Redis', 'AWS', 'Docker', 'Linux', 'Bash Scripting'],
      softSkills: [],
      achievements: [],
      professionalLinks: [
        { platform: 'GitHub', url: 'https://github.com/sandeep-reddy-db' },
        { platform: 'LinkedIn', url: 'https://linkedin.com/in/sandeep-reddy-dba' },
      ],
      languages: [],
    },
  },

  // =========================================================================
  // 16. Resume with Multiple Projects & Inline Repository Links
  // =========================================================================
  {
    id: 'resume-16-multi-project-inline-repos',
    name: 'Pooja Hegde',
    headline: 'Full Stack JavaScript Developer',
    scenarioCategory: 'multi_project_inline_repos',
    formattingStyle: 'clean_projects_centric',
    fontFamily: 'Helvetica',
    intentionalOmissions: ['experience', 'internships'],
    docSections: [
      {
        paragraphs: ['pooja.hegde@mockdeveloper.org | +91 9482123456 | Mangalore, Karnataka, India | https://github.com/poojahegde-dev | https://linkedin.com/in/pooja-hegde-dev'],
      },
      {
        heading: 'EDUCATION',
        paragraphs: ['NITK Surathkal | 2020 – 2024 | B.Tech in Information Technology | CGPA: 8.8/10'],
      },
      {
        heading: 'PROJECTS',
        paragraphs: ['NeuralFlow – AI Analytics Engine'],
        bullets: [
          'GitHub: https://github.com/poojahegde-dev/neuralflow-ai',
          'Live Demo: https://neuralflow.mockdomain.app',
          'Developed interactive analytics dashboards using React.js, Node.js, and Redis.',
        ],
      },
      {
        paragraphs: ['Offline-First Order Processing System'],
        bullets: [
          'GitHub: https://github.com/poojahegde-dev/offline-order-system',
          'Built local persistence with IndexedDB and background service workers in JavaScript.',
        ],
      },
      {
        heading: 'SKILLS',
        paragraphs: ['JavaScript, TypeScript, React.js, Node.js, Express.js, Redis, IndexedDB, Git, Docker'],
      },
    ],
    pdfLines: [
      { text: 'pooja.hegde@mockdeveloper.org | +91 9482123456 | Mangalore, Karnataka, India | https://github.com/poojahegde-dev | https://linkedin.com/in/pooja-hegde-dev' },
      { text: 'EDUCATION', isHeader: true },
      { text: 'NITK Surathkal | 2020 – 2024 | B.Tech in Information Technology | CGPA: 8.8/10', isSub: true },
      { text: 'PROJECTS', isHeader: true },
      { text: 'NeuralFlow – AI Analytics Engine', isSub: true },
      { text: 'GitHub: https://github.com/poojahegde-dev/neuralflow-ai', isBullet: true },
      { text: 'Live Demo: https://neuralflow.mockdomain.app', isBullet: true },
      { text: 'Developed interactive analytics dashboards using React.js, Node.js, and Redis.', isBullet: true },
      { text: 'Offline-First Order Processing System', isSub: true },
      { text: 'GitHub: https://github.com/poojahegde-dev/offline-order-system', isBullet: true },
      { text: 'Built local persistence with IndexedDB and background service workers in JavaScript.', isBullet: true },
      { text: 'SKILLS', isHeader: true },
      { text: 'JavaScript, TypeScript, React.js, Node.js, Express.js, Redis, IndexedDB, Git, Docker' },
    ],
    expected: {
      personalInfo: {
        name: 'Pooja Hegde',
        email: 'pooja.hegde@mockdeveloper.org',
        phone: '+91 9482123456',
        location: 'Mangalore, Karnataka, India',
      },
      education: [
        {
          institution: 'NITK Surathkal',
          degree: 'B.Tech in Information Technology',
          fieldOfStudy: 'Information Technology',
          startYear: 2020,
          endYear: 2024,
          isCurrent: false,
          gpa: '8.8/10',
          educationLevel: 'UNDERGRADUATE',
        },
      ],
      experience: [],
      internships: [],
      projects: [
        {
          title: 'NeuralFlow – AI Analytics Engine',
          technologies: ['React.js', 'Node.js', 'Redis'],
          githubUrl: 'https://github.com/poojahegde-dev/neuralflow-ai',
          demoUrl: 'https://neuralflow.mockdomain.app',
          bulletsCount: 3,
        },
        {
          title: 'Offline-First Order Processing System',
          technologies: ['IndexedDB', 'JavaScript'],
          githubUrl: 'https://github.com/poojahegde-dev/offline-order-system',
          bulletsCount: 2,
        },
      ],
      certifications: [],
      technicalSkills: ['JavaScript', 'TypeScript', 'React.js', 'Node.js', 'Express.js', 'Redis', 'IndexedDB', 'Git', 'Docker'],
      softSkills: [],
      achievements: [],
      professionalLinks: [
        { platform: 'GitHub', url: 'https://github.com/poojahegde-dev' },
        { platform: 'LinkedIn', url: 'https://linkedin.com/in/pooja-hegde-dev' },
      ],
      languages: [],
    },
  },

  // =========================================================================
  // 17. Resume with Unusual Section Headings
  // =========================================================================
  {
    id: 'resume-17-unusual-headings',
    name: 'Manish Agarwal',
    headline: 'Software Engineer',
    scenarioCategory: 'unusual_headings',
    formattingStyle: 'creative_headings',
    fontFamily: 'Helvetica',
    intentionalOmissions: ['internships'],
    docSections: [
      {
        paragraphs: ['manish.agarwal@mockcode.io | +91 9922334455 | Noida, Uttar Pradesh, India | https://github.com/manisha-code | https://linkedin.com/in/manish-agarwal-sde'],
      },
      {
        heading: 'WHERE I HAVE WORKED',
        paragraphs: ['CloudNine Software | Software Engineer | May 2022 – Present | Noida, India'],
        bullets: ['Maintained scalable Go microservices and Kubernetes cluster deployments.'],
      },
      {
        heading: 'ACADEMIC BACKGROUND',
        paragraphs: ['Amity University | 2018 – 2022 | B.Tech in Computer Science | CGPA: 8.3/10'],
      },
      {
        heading: 'THINGS I BUILT',
        paragraphs: ['Distributed Distributed Task Worker | Go, Redis, Docker | GitHub'],
        bullets: ['Engineered asynchronous job queuing system with exponential backoff retries.'],
      },
      {
        heading: 'TECHNICAL TOOLBOX',
        paragraphs: ['Go, Python, Docker, Kubernetes, Redis, PostgreSQL, Git, Linux'],
      },
    ],
    pdfLines: [
      { text: 'manish.agarwal@mockcode.io | +91 9922334455 | Noida, Uttar Pradesh, India | https://github.com/manisha-code | https://linkedin.com/in/manish-agarwal-sde' },
      { text: 'WHERE I HAVE WORKED', isHeader: true },
      { text: 'CloudNine Software | Software Engineer | May 2022 – Present | Noida, India', isSub: true },
      { text: 'Maintained scalable Go microservices and Kubernetes cluster deployments.', isBullet: true },
      { text: 'ACADEMIC BACKGROUND', isHeader: true },
      { text: 'Amity University | 2018 – 2022 | B.Tech in Computer Science | CGPA: 8.3/10', isSub: true },
      { text: 'THINGS I BUILT', isHeader: true },
      { text: 'Distributed Distributed Task Worker | Go, Redis, Docker | GitHub', isSub: true },
      { text: 'Engineered asynchronous job queuing system with exponential backoff retries.', isBullet: true },
      { text: 'TECHNICAL TOOLBOX', isHeader: true },
      { text: 'Go, Python, Docker, Kubernetes, Redis, PostgreSQL, Git, Linux' },
    ],
    expected: {
      personalInfo: {
        name: 'Manish Agarwal',
        email: 'manish.agarwal@mockcode.io',
        phone: '+91 9922334455',
        location: 'Noida, Uttar Pradesh, India',
      },
      education: [
        {
          institution: 'Amity University',
          degree: 'B.Tech in Computer Science',
          fieldOfStudy: 'Computer Science',
          startYear: 2018,
          endYear: 2022,
          isCurrent: false,
          gpa: '8.3/10',
          educationLevel: 'UNDERGRADUATE',
        },
      ],
      experience: [
        {
          company: 'CloudNine Software',
          roleTitle: 'Software Engineer',
          employmentType: 'Full-time',
          location: 'Noida, India',
          startDate: 'May 2022',
          endDate: null,
          isCurrent: true,
          bulletsCount: 1,
        },
      ],
      internships: [],
      projects: [
        {
          title: 'Distributed Distributed Task Worker',
          technologies: ['Go', 'Redis', 'Docker'],
          bulletsCount: 1,
        },
      ],
      certifications: [],
      technicalSkills: ['Go', 'Python', 'Docker', 'Kubernetes', 'Redis', 'PostgreSQL', 'Git', 'Linux'],
      softSkills: [],
      achievements: [],
      professionalLinks: [
        { platform: 'GitHub', url: 'https://github.com/manisha-code' },
        { platform: 'LinkedIn', url: 'https://linkedin.com/in/manish-agarwal-sde' },
      ],
      languages: [],
    },
  },

  // =========================================================================
  // 18. Resume with Diverse Date Formats
  // =========================================================================
  {
    id: 'resume-18-diverse-date-formats',
    name: 'Divya Menon',
    headline: 'Backend Developer',
    scenarioCategory: 'diverse_date_formats',
    formattingStyle: 'varied_dates',
    fontFamily: 'Helvetica',
    intentionalOmissions: ['internships'],
    docSections: [
      {
        paragraphs: ['divya.menon@mockdates.com | +91 9846012345 | Thiruvananthapuram, Kerala, India | https://github.com/divyamenon-code | https://linkedin.com/in/divya-menon-dev'],
      },
      {
        heading: 'WORK HISTORY',
        paragraphs: ['Senior Developer — Kerala InfoTech | 06/2021 - Present | Thiruvananthapuram, India'],
        bullets: ['Maintained scalable cloud APIs in Node.js and AWS.'],
      },
      {
        paragraphs: ['Junior Programmer — CyberPark Systems | 2019 to 2021 | Kozhikode, India'],
        bullets: ['Built database schemas in PostgreSQL and automated unit testing.'],
      },
      {
        heading: 'EDUCATION',
        paragraphs: ['College of Engineering Trivandrum | 2015 – 2019 | B.Tech in IT | CGPA: 8.6/10'],
      },
      {
        heading: 'SKILLS',
        paragraphs: ['Node.js, PostgreSQL, AWS, Python, Git, Docker, REST API'],
      },
    ],
    pdfLines: [
      { text: 'divya.menon@mockdates.com | +91 9846012345 | Thiruvananthapuram, Kerala, India | https://github.com/divyamenon-code | https://linkedin.com/in/divya-menon-dev' },
      { text: 'WORK HISTORY', isHeader: true },
      { text: 'Senior Developer — Kerala InfoTech | 06/2021 - Present | Thiruvananthapuram, India', isSub: true },
      { text: 'Maintained scalable cloud APIs in Node.js and AWS.', isBullet: true },
      { text: 'Junior Programmer — CyberPark Systems | 2019 to 2021 | Kozhikode, India', isSub: true },
      { text: 'Built database schemas in PostgreSQL and automated unit testing.', isBullet: true },
      { text: 'EDUCATION', isHeader: true },
      { text: 'College of Engineering Trivandrum | 2015 – 2019 | B.Tech in IT | CGPA: 8.6/10', isSub: true },
      { text: 'SKILLS', isHeader: true },
      { text: 'Node.js, PostgreSQL, AWS, Python, Git, Docker, REST API' },
    ],
    expected: {
      personalInfo: {
        name: 'Divya Menon',
        email: 'divya.menon@mockdates.com',
        phone: '+91 9846012345',
        location: 'Thiruvananthapuram, Kerala, India',
      },
      education: [
        {
          institution: 'College of Engineering Trivandrum',
          degree: 'B.Tech in IT',
          fieldOfStudy: 'IT',
          startYear: 2015,
          endYear: 2019,
          isCurrent: false,
          gpa: '8.6/10',
          educationLevel: 'UNDERGRADUATE',
        },
      ],
      experience: [
        {
          company: 'Kerala InfoTech',
          roleTitle: 'Senior Developer',
          employmentType: 'Full-time',
          location: 'Thiruvananthapuram, India',
          startDate: '06/2021',
          endDate: null,
          isCurrent: true,
          bulletsCount: 1,
        },
        {
          company: 'CyberPark Systems',
          roleTitle: 'Junior Programmer',
          employmentType: 'Full-time',
          location: 'Kozhikode, India',
          startDate: '2019',
          endDate: '2021',
          isCurrent: false,
          bulletsCount: 1,
        },
      ],
      internships: [],
      projects: [],
      certifications: [],
      technicalSkills: ['Node.js', 'PostgreSQL', 'AWS', 'Python', 'Git', 'Docker', 'REST API'],
      softSkills: [],
      achievements: [],
      professionalLinks: [
        { platform: 'GitHub', url: 'https://github.com/divyamenon-code' },
        { platform: 'LinkedIn', url: 'https://linkedin.com/in/divya-menon-dev' },
      ],
      languages: [],
    },
  },

  // =========================================================================
  // 19. Resume with Missing / Incomplete Information (Strict Anti-Fabrication)
  // =========================================================================
  {
    id: 'resume-19-missing-info',
    name: 'Karthik Swaminathan',
    headline: 'Software Engineer',
    scenarioCategory: 'missing_info',
    formattingStyle: 'sparse_minimal',
    fontFamily: 'Helvetica',
    intentionalOmissions: ['phone', 'location', 'gpa', 'internships', 'certifications'],
    docSections: [
      {
        paragraphs: ['karthik.swaminathan@fictional-domain.org'],
      },
      {
        heading: 'EXPERIENCE',
        paragraphs: ['Software Engineer at Alpha Systems'],
        bullets: ['Developed backend endpoints in Java.'],
      },
      {
        heading: 'EDUCATION',
        paragraphs: ['Anna University', 'B.E. in Computer Science'],
      },
      {
        heading: 'SKILLS',
        paragraphs: ['Java, Python, Git'],
      },
    ],
    pdfLines: [
      { text: 'karthik.swaminathan@fictional-domain.org' },
      { text: 'EXPERIENCE', isHeader: true },
      { text: 'Software Engineer at Alpha Systems', isSub: true },
      { text: 'Developed backend endpoints in Java.', isBullet: true },
      { text: 'EDUCATION', isHeader: true },
      { text: 'Anna University', isSub: true },
      { text: 'B.E. in Computer Science' },
      { text: 'SKILLS', isHeader: true },
      { text: 'Java, Python, Git' },
    ],
    expected: {
      personalInfo: {
        name: 'Karthik Swaminathan',
        email: 'karthik.swaminathan@fictional-domain.org',
        phone: null,
        location: null,
      },
      education: [
        {
          institution: 'Anna University',
          degree: 'B.E. in Computer Science',
          fieldOfStudy: 'Computer Science',
          startYear: 2020, // Parser defaults when no date given
          endYear: null,
          isCurrent: false,
          gpa: null,
        },
      ],
      experience: [
        {
          company: 'Alpha Systems',
          roleTitle: 'Software Engineer',
          employmentType: 'Full-time',
          location: null,
          startDate: '2022',
          endDate: null,
          isCurrent: true,
          bulletsCount: 1,
        },
      ],
      internships: [],
      projects: [],
      certifications: [],
      technicalSkills: ['Java', 'Python', 'Git'],
      softSkills: [],
      achievements: [],
      professionalLinks: [],
      languages: [],
    },
  },

  // =========================================================================
  // 20. Complex Formatting & Wrapped Bullet Points
  // =========================================================================
  {
    id: 'resume-20-complex-wrapped-bullets',
    name: 'Shalini Verma',
    headline: 'Senior Cloud Platform Engineer',
    scenarioCategory: 'complex_wrapped_bullets',
    formattingStyle: 'dense_wrapped_bullets',
    fontFamily: 'Helvetica',
    intentionalOmissions: ['internships'],
    docSections: [
      {
        paragraphs: ['shalini.verma@mockcloud.io | +91 9789012345 | Hyderabad, Telangana, India | https://github.com/shaliniv-cloud | https://linkedin.com/in/shalini-verma-cloud'],
      },
      {
        heading: 'EXPERIENCE',
        paragraphs: ['Senior Cloud Infrastructure Engineer — Apex Cloud Technologies | May 2021 – Present | Hyderabad, India'],
        bullets: [
          'Engineered highly available Terraform infrastructure as code (IaC) modules governing 120 multi-region AWS accounts with strict automated security guardrails and compliance auditing.',
          'Migrated high-throughput real-time payment data ingestion pipeline from monolithic PostgreSQL databases to partitioned Cassandra cluster nodes reducing 99th percentile query latency.',
        ],
      },
      {
        heading: 'PROJECTS',
        paragraphs: ['Kubernetes Multi-Cluster Operator — Hybrid Cloud Ingress | Go, Kubernetes, Docker | GitHub'],
        bullets: [
          'Designed and implemented a custom controller in Go synchronizing ingress route configurations and TLS certificates automatically across distributed bare-metal clusters.',
        ],
      },
      {
        heading: 'EDUCATION',
        paragraphs: [
          'Osmania University | 2017 – 2021',
          'Bachelor of Engineering in Electronics and Communication | CGPA: 8.92/10',
        ],
      },
      {
        heading: 'TECHNICAL SKILLS',
        paragraphs: ['Terraform, AWS, Kubernetes, Docker, Go, Python, Cassandra, PostgreSQL, Linux, CI/CD, Git'],
      },
    ],
    pdfLines: [
      { text: 'shalini.verma@mockcloud.io | +91 9789012345 | Hyderabad, Telangana, India | https://github.com/shaliniv-cloud | https://linkedin.com/in/shalini-verma-cloud' },
      { text: 'EXPERIENCE', isHeader: true },
      { text: 'Senior Cloud Infrastructure Engineer — Apex Cloud Technologies | May 2021 – Present | Hyderabad, India', isSub: true },
      { text: 'Engineered highly available Terraform infrastructure as code (IaC) modules governing 120 multi-region AWS accounts with strict automated security guardrails and compliance auditing.', isBullet: true },
      { text: 'Migrated high-throughput real-time payment data ingestion pipeline from monolithic PostgreSQL databases to partitioned Cassandra cluster nodes reducing 99th percentile query latency.', isBullet: true },
      { text: 'PROJECTS', isHeader: true },
      { text: 'Kubernetes Multi-Cluster Operator — Hybrid Cloud Ingress | Go, Kubernetes, Docker | GitHub', isSub: true },
      { text: 'Designed and implemented a custom controller in Go synchronizing ingress route configurations and TLS certificates automatically across distributed bare-metal clusters.', isBullet: true },
      { text: 'EDUCATION', isHeader: true },
      { text: 'Osmania University | 2017 – 2021', isSub: true },
      { text: 'Bachelor of Engineering in Electronics and Communication | CGPA: 8.92/10' },
      { text: 'TECHNICAL SKILLS', isHeader: true },
      { text: 'Terraform, AWS, Kubernetes, Docker, Go, Python, Cassandra, PostgreSQL, Linux, CI/CD, Git' },
    ],
    expected: {
      personalInfo: {
        name: 'Shalini Verma',
        email: 'shalini.verma@mockcloud.io',
        phone: '+91 9789012345',
        location: 'Hyderabad, Telangana, India',
      },
      education: [
        {
          institution: 'Osmania University',
          degree: 'Bachelor of Engineering in Electronics and Communication',
          fieldOfStudy: 'Electronics and Communication',
          startYear: 2017,
          endYear: 2021,
          isCurrent: false,
          gpa: '8.92/10',
          educationLevel: 'UNDERGRADUATE',
        },
      ],
      experience: [
        {
          company: 'Apex Cloud Technologies',
          roleTitle: 'Senior Cloud Infrastructure Engineer',
          employmentType: 'Full-time',
          location: 'Hyderabad, India',
          startDate: 'May 2021',
          endDate: null,
          isCurrent: true,
          bulletsCount: 2,
        },
      ],
      internships: [],
      projects: [
        {
          title: 'Kubernetes Multi-Cluster Operator — Hybrid Cloud Ingress',
          technologies: ['Go', 'Kubernetes', 'Docker'],
          bulletsCount: 1,
        },
      ],
      certifications: [],
      technicalSkills: ['Terraform', 'AWS', 'Kubernetes', 'Docker', 'Go', 'Python', 'Cassandra', 'PostgreSQL', 'Linux', 'CI/CD', 'Git'],
      softSkills: [],
      achievements: [],
      professionalLinks: [
        { platform: 'GitHub', url: 'https://github.com/shaliniv-cloud' },
        { platform: 'LinkedIn', url: 'https://linkedin.com/in/shalini-verma-cloud' },
      ],
      languages: [],
    },
  },
];

