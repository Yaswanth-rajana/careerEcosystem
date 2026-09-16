import { Mentor } from './mentor-types';

export const DEMO_MENTORS: Mentor[] = [
  {
    id: 'mentor-1',
    name: 'Alex Morgan',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    badgeLabel: 'PATHWAY.ECO Mentor',
    role: 'Senior Software Engineer',
    domain: 'Enterprise Technology',
    experienceYears: 7,
    rating: 4.9,
    reviewCount: 48,
    sessionCount: 86,
    expertise: ['Software Engineering', 'AI / ML', 'Business'],
    sessionTypes: ['Career Guidance', 'Technical Guidance', 'Mock Interview'],
    startingPrice: 999,
    availabilityStatus: 'Available this week',
    nextAvailableAt: 'Tomorrow, 6:00 PM',
    bio: 'Specializes in scalable backend architecture, distributed cloud systems, and guiding engineers through technical interviews.',
    about: [
      'Over 7 years of hands-on engineering experience building high-throughput distributed microservices and cloud solutions.',
      'Passionate about mentoring early-career and mid-level developers looking to transition into senior roles or excel in system design interviews.',
      'Focuses on practical advice: architecture blueprints, code review strategies, and structured career progression.'
    ],
    skillsList: ['Distributed Systems', 'System Design', 'Go / Java', 'Cloud Infrastructure', 'API Design'],
    helpTopics: [
      'Navigating technical interview loops for Tier-1 companies',
      'System design fundamentals & trade-off analysis',
      'Career mapping from Junior to Senior Engineer'
    ],
    workHistory: [
      { role: 'Senior Software Engineer', organizationType: 'Enterprise Cloud Division', period: '2022 - Present' },
      { role: 'Software Engineer II', organizationType: 'Financial Tech Platform', period: '2019 - 2022' },
      { role: 'Junior Developer', organizationType: 'Software Agency', period: '2017 - 2019' }
    ],
    reviews: [
      {
        id: 'rev-1',
        authorName: 'Aarav S.',
        rating: 5,
        date: '3 days ago',
        comment: 'Alex gave me laser-focused feedback on system design trade-offs. The mock interview felt like a real high-stakes technical round!',
        sessionType: 'Mock Interview'
      },
      {
        id: 'rev-2',
        authorName: 'Neha K.',
        rating: 5,
        date: '1 week ago',
        comment: 'Super structured advice on breaking down microservice boundaries. Helped me land my target senior role.',
        sessionType: 'Technical Guidance'
      }
    ],
    sessionOptions: [
      {
        id: 'opt-1',
        title: 'Quick Technical Guidance',
        durationMin: 30,
        price: 999,
        description: 'Get targeted answers on architectural decisions, code blockers, or specific technical challenges.',
        type: 'Technical Guidance'
      },
      {
        id: 'opt-2',
        title: 'System Design Mock Interview',
        durationMin: 60,
        price: 1899,
        description: 'Full 45-minute live mock system design round followed by 15 minutes of detailed actionable feedback.',
        type: 'Mock Interview'
      },
      {
        id: 'opt-3',
        title: 'Career Growth & Roadmap Strategy',
        durationMin: 45,
        price: 1499,
        description: 'Review your career trajectory, promotion strategies, and skill gap roadmap.',
        type: 'Career Guidance'
      }
    ]
  },
  {
    id: 'mentor-2',
    name: 'Jordan Lee',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    badgeLabel: 'PATHWAY.ECO Mentor',
    role: 'Lead ML Engineer',
    domain: 'AI & Data Science',
    experienceYears: 6,
    rating: 4.95,
    reviewCount: 36,
    sessionCount: 64,
    expertise: ['AI / ML', 'Data Science', 'Software Engineering'],
    sessionTypes: ['Career Switch', 'Technical Guidance', 'Resume Review'],
    startingPrice: 1299,
    availabilityStatus: 'Next available tomorrow',
    nextAvailableAt: 'Tomorrow, 7:30 PM',
    bio: 'Pioneer in deploying generative AI models, LLM fine-tuning, and transitioning software engineers into Machine Learning roles.',
    about: [
      'Leads Machine Learning research and deployment in high-scale AI applications.',
      'Helped 40+ mentees pivot successfully into Machine Learning, Data Engineering, and Applied AI roles.',
      'Specializes in LLM architectures, RAG systems, and practical MLOps pipelines.'
    ],
    skillsList: ['Python', 'PyTorch', 'LLMs & RAG', 'MLOps', 'Vector Databases'],
    helpTopics: [
      'Transitioning from Web Development to Applied AI / Machine Learning',
      'Portfolio review for AI & Data Science roles',
      'Deploying LLM applications to production'
    ],
    workHistory: [
      { role: 'Lead ML Engineer', organizationType: 'AI Innovation Lab', period: '2021 - Present' },
      { role: 'Data Scientist', organizationType: 'Analytics Enterprise', period: '2018 - 2021' }
    ],
    reviews: [
      {
        id: 'rev-3',
        authorName: 'Rahul M.',
        rating: 5,
        date: '2 weeks ago',
        comment: 'Jordan laid out a bulletproof roadmap for learning MLOps. Worth every minute.',
        sessionType: 'Career Switch'
      }
    ],
    sessionOptions: [
      {
        id: 'opt-4',
        title: 'AI Portfolio & Resume Review',
        durationMin: 30,
        price: 1299,
        description: 'Optimize your AI/ML projects and resume to stand out to hiring managers.',
        type: 'Resume Review'
      },
      {
        id: 'opt-5',
        title: 'ML Career Transition Blueprint',
        durationMin: 60,
        price: 2199,
        description: 'Comprehensive 1-on-1 session to plan your transition into Artificial Intelligence & Data Science.',
        type: 'Career Switch'
      }
    ]
  },
  {
    id: 'mentor-3',
    name: 'Maya Patel',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
    badgeLabel: 'PATHWAY.ECO Mentor',
    role: 'Principal Product Designer',
    domain: 'Product & Design',
    experienceYears: 8,
    rating: 4.88,
    reviewCount: 52,
    sessionCount: 110,
    expertise: ['Design', 'Product'],
    sessionTypes: ['Resume Review', 'Career Guidance', 'Mock Interview'],
    startingPrice: 899,
    availabilityStatus: 'Available this week',
    nextAvailableAt: 'Friday, 5:00 PM',
    bio: 'Crafts intuitive design systems and human-centric user experiences. Passionate about portfolio crits and design storytelling.',
    about: [
      'Over 8 years guiding consumer digital products from initial user research to polished interactive design systems.',
      'Mentors UX designers, product designers, and UI specialists on portfolio framing, storytelling, and design interviews.'
    ],
    skillsList: ['Figma', 'Design Systems', 'UX Research', 'Interaction Design', 'Product Strategy'],
    helpTopics: [
      'Product Design portfolio review & case study framing',
      'Whiteboard design challenge practice',
      'Building scalable Figma design systems'
    ],
    workHistory: [
      { role: 'Principal Designer', organizationType: 'Global Design Consultancy', period: '2020 - Present' },
      { role: 'Senior Product Designer', organizationType: 'SaaS Platform', period: '2016 - 2020' }
    ],
    reviews: [
      {
        id: 'rev-4',
        authorName: 'Ananya G.',
        rating: 5,
        date: '5 days ago',
        comment: 'Maya helped me completely revamp my portfolio case studies. I received double the recruiter calls within a week!',
        sessionType: 'Resume Review'
      }
    ],
    sessionOptions: [
      {
        id: 'opt-6',
        title: 'Design Portfolio Critique',
        durationMin: 45,
        price: 899,
        description: 'In-depth case study and visual polish review to elevate your design portfolio.',
        type: 'Resume Review'
      },
      {
        id: 'opt-7',
        title: 'Design Interview Prep',
        durationMin: 60,
        price: 1599,
        description: 'Mock app critique and whiteboard design exercise with instant feedback.',
        type: 'Mock Interview'
      }
    ]
  },
  {
    id: 'mentor-4',
    name: 'Samira Khan',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400',
    badgeLabel: 'PATHWAY.ECO Mentor',
    role: 'Director of Product Management',
    domain: 'Product & Strategy',
    experienceYears: 11,
    rating: 4.98,
    reviewCount: 65,
    sessionCount: 142,
    expertise: ['Product', 'Business'],
    sessionTypes: ['Leadership', 'Career Guidance', 'Mock Interview'],
    startingPrice: 1599,
    availabilityStatus: 'Available this week',
    nextAvailableAt: 'Saturday, 4:00 PM',
    bio: 'Ex-startup founder & veteran Product Leader. Helps PMs master product strategy, cross-functional alignment, and executive growth.',
    about: [
      '11+ years leading high-growth product teams across B2B SaaS and consumer tech.',
      'Expert in product execution, metrics frameworks, team management, and executive leadership development.'
    ],
    skillsList: ['Product Strategy', 'Roadmapping', 'Agile Leadership', 'Product Analytics', 'OKRs'],
    helpTopics: [
      'Product Manager interview prep (Execution, Strategy, Metrics)',
      'Transitioning from Senior PM to Director / Group PM',
      'Managing difficult stakeholders & cross-functional teams'
    ],
    workHistory: [
      { role: 'Director of Product', organizationType: 'Growth SaaS Tech', period: '2021 - Present' },
      { role: 'Group Product Manager', organizationType: 'E-commerce Scaleup', period: '2017 - 2021' }
    ],
    reviews: [
      {
        id: 'rev-5',
        authorName: 'Karthik P.',
        rating: 5,
        date: '1 week ago',
        comment: 'Samira is an incredible strategist. She gave me actionable frameworks for product execution interviews.',
        sessionType: 'Mock Interview'
      }
    ],
    sessionOptions: [
      {
        id: 'opt-8',
        title: 'Product Management Strategy Session',
        durationMin: 45,
        price: 1599,
        description: 'Focus on product vision, metric alignment, or leadership growth challenges.',
        type: 'Leadership'
      },
      {
        id: 'opt-9',
        title: 'PM Mock Interview & Execution',
        durationMin: 60,
        price: 2499,
        description: 'Rigorous mock interview covering product design, metrics, and strategic trade-offs.',
        type: 'Mock Interview'
      }
    ]
  },
  {
    id: 'mentor-5',
    name: 'David O\'Connor',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
    badgeLabel: 'PATHWAY.ECO Mentor',
    role: 'Cloud Infrastructure Architect',
    domain: 'Cloud & DevOps',
    experienceYears: 9,
    rating: 4.85,
    reviewCount: 29,
    sessionCount: 54,
    expertise: ['Software Engineering', 'Electronics', 'Business'],
    sessionTypes: ['Technical Guidance', 'Career Guidance'],
    startingPrice: 1100,
    availabilityStatus: 'Next available tomorrow',
    nextAvailableAt: 'Tomorrow, 8:00 PM',
    bio: 'Specialist in AWS/Kubernetes automation, cloud cost optimization, and DevOps culture transformation.',
    about: [
      '9+ years architecting multi-cloud environments, automated CI/CD pipelines, and high availability systems.',
      'Helps engineers master Terraform, Docker, Kubernetes, and enterprise cloud security.'
    ],
    skillsList: ['AWS / GCP', 'Kubernetes', 'Terraform', 'CI/CD Pipelines', 'Site Reliability'],
    helpTopics: [
      'Architecting resilient cloud setups',
      'DevOps & SRE career roadmap',
      'Terraform & Kubernetes best practices'
    ],
    workHistory: [
      { role: 'Cloud Architect', organizationType: 'Infrastructure Platform', period: '2020 - Present' },
      { role: 'DevOps Lead', organizationType: 'FinTech Startup', period: '2016 - 2020' }
    ],
    reviews: [
      {
        id: 'rev-6',
        authorName: 'Vikram S.',
        rating: 5,
        date: '4 days ago',
        comment: 'David helped me unblock a complex Terraform multi-region deployment within 30 minutes.',
        sessionType: 'Technical Guidance'
      }
    ],
    sessionOptions: [
      {
        id: 'opt-10',
        title: 'Cloud Architecture & DevOps Consultation',
        durationMin: 45,
        price: 1100,
        description: 'Review your cloud setups, CI/CD pipelines, or deployment architectures.',
        type: 'Technical Guidance'
      }
    ]
  },
  {
    id: 'mentor-6',
    name: 'Chloe Dubois',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400',
    badgeLabel: 'PATHWAY.ECO Mentor',
    role: 'Cybersecurity Architect',
    domain: 'Information Security',
    experienceYears: 6,
    rating: 4.92,
    reviewCount: 31,
    sessionCount: 49,
    expertise: ['Cybersecurity', 'Software Engineering'],
    sessionTypes: ['Career Switch', 'Technical Guidance', 'Resume Review'],
    startingPrice: 950,
    availabilityStatus: 'Available this week',
    nextAvailableAt: 'Thursday, 6:30 PM',
    bio: 'Passionate about application security, threat modeling, and helping software developers pivot into InfoSec.',
    about: [
      '6 years leading red team & blue team security assessments, penetration testing, and secure coding audits.',
      'Dedicated to building a stronger cybersecurity community by mentoring aspiring security analysts.'
    ],
    skillsList: ['Application Security', 'Penetration Testing', 'OWASP Top 10', 'Threat Modeling', 'Network Security'],
    helpTopics: [
      'Breaking into Cybersecurity without prior security degree',
      'Security certification path (CISSP, CEH, Security+)',
      'Practical threat modeling for applications'
    ],
    workHistory: [
      { role: 'Cybersecurity Architect', organizationType: 'Security Services Firm', period: '2021 - Present' },
      { role: 'Security Analyst', organizationType: 'Banking Group', period: '2018 - 2021' }
    ],
    reviews: [
      {
        id: 'rev-7',
        authorName: 'Priya N.',
        rating: 5,
        date: '1 week ago',
        comment: 'Chloe explained the security career landscape clearly and helped me map out my OSCP prep.',
        sessionType: 'Career Switch'
      }
    ],
    sessionOptions: [
      {
        id: 'opt-11',
        title: 'Security Career & Certification Roadmap',
        durationMin: 30,
        price: 950,
        description: 'Understand the best pathways into application security, SOC, or penetration testing.',
        type: 'Career Switch'
      }
    ]
  }
];
