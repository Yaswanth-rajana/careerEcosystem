import { db } from '../db/client';
import { hashPassword } from '../auth/security';
import { CourseService } from '../services/courseService';
import { AuditService } from '../services/auditService';

export async function seedAdminData() {
  console.log('🌱 Checking administrative seed data...');

  // 1. Ensure Super Admin exists
  const adminEmail = 'admin@pathway.eco';
  let admin = await db.user.findUnique({
    where: { email: adminEmail },
  });

  if (!admin) {
    console.log(`Creating default Super Admin (${adminEmail})...`);
    const passwordHash = await hashPassword('AdminPassword123!');
    admin = await db.user.create({
      data: {
        email: adminEmail,
        name: 'Pathway Administrator',
        passwordHash,
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        isOnboarded: true,
        profile: {
          create: {
            headline: 'System Administrator',
            candidateType: 'PROFESSIONAL',
          },
        },
      },
    });

    await AuditService.log({
      actorId: admin.id,
      actorEmail: admin.email,
      actorName: admin.name,
      action: 'SYSTEM_INITIALIZED',
      resourceType: 'SYSTEM',
      resourceId: admin.id,
      details: { role: 'SUPER_ADMIN', note: 'Initial Super Admin account created' },
    });
  } else {
    // Ensure role is SUPER_ADMIN and status is ACTIVE
    if (admin.role !== 'SUPER_ADMIN' || admin.status !== 'ACTIVE') {
      admin = await db.user.update({
        where: { id: admin.id },
        data: { role: 'SUPER_ADMIN', status: 'ACTIVE' },
      });
    }
    console.log(`✓ Super Admin (${adminEmail}) is active.`);
  }

  const adminActor = {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
    status: admin.status,
  };

  // 2. Check and seed initial courses if empty
  const courseCount = await db.course.count();
  if (courseCount === 0) {
    console.log('Seeding initial Courses...');

    const c1 = await CourseService.createCourse(
      {
        title: 'Full-Stack Modern Web Engineering',
        description:
          'A comprehensive pathway from web fundamentals to enterprise architecture. Master TypeScript, Next.js App Router, GraphQL, MongoDB, Docker, and distributed micro-frontends.',
        shortDescription: 'Master modern full-stack development with Next.js, TypeScript, and cloud-native databases.',
        category: 'Software Engineering',
        level: 'INTERMEDIATE',
        instructorName: 'Sarah Jenkins',
        instructorTitle: 'Principal Staff Engineer',
        durationHours: 36,
        skills: ['TypeScript', 'Next.js', 'React', 'MongoDB', 'Docker', 'REST APIs'],
        learningObjectives: [
          'Design resilient full-stack systems using Next.js App Router',
          'Implement production-grade database modeling with MongoDB & Prisma',
          'Deploy containerized services using modern CI/CD pipelines',
        ],
        status: 'PUBLISHED',
        isFeatured: true,
        modules: [
          {
            title: 'Core Fundamentals & Type-Safe Architecture',
            description: 'TypeScript in-depth, interface modeling, and state machines',
            order: 1,
            lessons: [
              { title: 'Advanced TypeScript Patterns', durationMin: 25, type: 'VIDEO', order: 1 },
              { title: 'Prisma ORM Modeling & Relations', durationMin: 30, type: 'VIDEO', order: 2 },
            ],
          },
          {
            title: 'Server-Side Rendering & Streaming',
            description: 'Deep dive into React Server Components and Edge runtime',
            order: 2,
            lessons: [
              { title: 'Next.js 14 App Router Deep Dive', durationMin: 40, type: 'VIDEO', order: 1 },
              { title: 'Interactive Project: Micro-SaaS Portal', durationMin: 60, type: 'PROJECT', order: 2 },
            ],
          },
        ],
      },
      adminActor
    );

    await CourseService.createCourse(
      {
        title: 'Generative AI & LLM Systems Design',
        description:
          'Learn to design, deploy, and evaluate production Generative AI applications with RAG pipelines, fine-tuned embeddings, agentic loops, and vector stores.',
        shortDescription: 'Build reliable LLM applications with LangChain, LlamaIndex, and Vector DBs.',
        category: 'AI / Data Science',
        level: 'ADVANCED',
        instructorName: 'Dr. Aaron Chen',
        instructorTitle: 'AI Research Director',
        durationHours: 28,
        skills: ['Python', 'LLMs', 'Vector Databases', 'RAG', 'Embeddings', 'LangChain'],
        learningObjectives: [
          'Understand semantic retrieval and chunking strategies',
          'Build agentic loops with tools and structured outputs',
          'Evaluate hallucination rates and safety guardrails',
        ],
        status: 'PUBLISHED',
        isFeatured: true,
        modules: [
          {
            title: 'Embeddings & Vector Search',
            order: 1,
            lessons: [
              { title: 'Mathematical Foundations of Embeddings', durationMin: 20, type: 'VIDEO', order: 1 },
              { title: 'Implementing Hybrid Search (BM25 + Dense)', durationMin: 35, type: 'VIDEO', order: 2 },
            ],
          },
        ],
      },
      adminActor
    );

    await CourseService.createCourse(
      {
        title: 'Design Systems & UX Architecture',
        description:
          'Create scalable design tokens, accessible component hierarchies, and interactive micro-animations with Figma and CSS variables.',
        shortDescription: 'Scale design systems across cross-functional product squads.',
        category: 'Design',
        level: 'BEGINNER',
        instructorName: 'Elena Rostova',
        instructorTitle: 'Design Systems Lead',
        durationHours: 18,
        skills: ['Figma', 'Design Systems', 'CSS Tokens', 'Accessibility', 'Micro-interactions'],
        learningObjectives: [
          'Establish coherent atomic design tokens',
          'Enforce WCAG 2.1 AA accessibility guidelines',
        ],
        status: 'DRAFT',
        isFeatured: false,
        modules: [
          {
            title: 'Design Tokens & Foundation',
            order: 1,
            lessons: [
              { title: 'Token Nomenclature & Hierarchy', durationMin: 15, type: 'VIDEO', order: 1 },
            ],
          },
        ],
      },
      adminActor
    );

    console.log('✓ Initial courses seeded successfully.');
  }

  // 3. Check and seed initial mentors if empty
  const mentorCount = await db.mentor.count();
  if (mentorCount === 0) {
    console.log('Seeding initial Mentors & Applications...');

    await db.mentor.createMany({
      data: [
        {
          name: 'Arjun Mehta',
          email: 'arjun.mehta@techlead.io',
          headline: 'Staff Software Architect at HyperScale Labs',
          bio: '12+ years building distributed backend architectures. Passionate about helping mid-level engineers transition to staff and principal engineering roles.',
          domain: 'Software Engineering',
          company: 'HyperScale Labs',
          experienceYears: 12,
          rating: 4.95,
          reviewCount: 38,
          sessionCount: 74,
          startingPrice: 1200,
          expertise: ['Distributed Systems', 'System Design', 'Cloud Architecture', 'Mentorship'],
          sessionTypes: ['Career Guidance', 'Mock Interview', 'Technical Guidance'],
          skillsList: ['Go', 'Kubernetes', 'Kafka', 'PostgreSQL', 'High Availability'],
          status: 'APPROVED',
          approvedAt: new Date(),
        },
        {
          name: 'Priya Sharma',
          email: 'priya.sharma@aimlconsult.com',
          headline: 'Lead AI Engineer & Researcher',
          bio: 'Ex-FAANG Machine Learning specialist. I mentor engineers on deep learning, generative AI applications, and landing high-paying AI engineering positions.',
          domain: 'AI / Data Science',
          company: 'NeuralCraft AI',
          experienceYears: 8,
          rating: 4.9,
          reviewCount: 29,
          sessionCount: 52,
          startingPrice: 1500,
          expertise: ['Machine Learning', 'Generative AI', 'NLP', 'Data Strategy'],
          sessionTypes: ['Mock Interview', 'Resume Review', 'Technical Guidance'],
          skillsList: ['PyTorch', 'Transformers', 'MLOps', 'Vector Search'],
          status: 'APPROVED',
          approvedAt: new Date(),
        },
        {
          name: 'Vikramaditya Rao',
          email: 'vikram.rao@fintechventures.in',
          headline: 'VP of Engineering at FinEdge',
          bio: 'Applied to become a mentor to provide executive career coaching, tech leadership mentorship, and resume reviews for aspiring leaders.',
          domain: 'Engineering Leadership',
          company: 'FinEdge Global',
          experienceYears: 15,
          rating: 5.0,
          reviewCount: 0,
          sessionCount: 0,
          startingPrice: 2000,
          expertise: ['Engineering Management', 'Organizational Scaling', 'Career Transition'],
          sessionTypes: ['Career Guidance', 'Leadership', 'Resume Review'],
          skillsList: ['Leadership', 'Hiring', 'Agile Transformation'],
          status: 'PENDING', // Awaiting admin approval
        },
        {
          name: 'Ananya Deshmukh',
          email: 'ananya.deshmukh@uxcraft.org',
          headline: 'Product Design Lead & Design Systems Advocate',
          bio: 'Looking to mentor junior designers and career switchers entering product design and UX research.',
          domain: 'Design',
          company: 'UXCraft Studio',
          experienceYears: 6,
          rating: 4.8,
          reviewCount: 4,
          sessionCount: 8,
          startingPrice: 800,
          expertise: ['UI/UX Design', 'Design Systems', 'User Research'],
          sessionTypes: ['Resume Review', 'Career Guidance'],
          skillsList: ['Figma', 'Prototyping', 'Design Tokens'],
          status: 'UNDER_REVIEW', // In review
        },
      ],
    });

    console.log('✓ Initial mentors seeded successfully.');
  }

  console.log('✅ Administrative seed complete.');
}

// Allow direct CLI execution
if (require.main === module) {
  seedAdminData()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
