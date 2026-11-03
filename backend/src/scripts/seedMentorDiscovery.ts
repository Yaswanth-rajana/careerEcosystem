import { db } from '../db/client';
import { hashPassword } from '../auth/security';

export async function seedMentorDiscovery() {
  console.log('🌱 Seeding Mentor Discovery database records and active services...');

  const passwordHash = await hashPassword('Password123!');

  const mentorsToSeed = [
    {
      name: 'Alex Morgan',
      email: 'alex.morgan@mentor.io',
      headline: 'Senior Software Engineer at Enterprise Cloud',
      bio: 'Specializes in scalable backend architecture, distributed cloud systems, and guiding engineers through technical interviews.',
      domain: 'Enterprise Technology',
      company: 'Enterprise Cloud Division',
      experienceYears: 7,
      rating: 4.9,
      reviewCount: 48,
      sessionCount: 86,
      startingPrice: 999,
      expertise: ['Software Engineering', 'AI / ML', 'Business'],
      sessionTypes: ['Career Direction', 'Technical Guidance', 'Mock Interview'],
      skillsList: ['Distributed Systems', 'System Design', 'Go', 'Java', 'Cloud Infrastructure'],
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
      status: 'APPROVED',
      publicProfileEnabled: true,
      services: [
        {
          title: 'Career Planning & Transition Guidance for Engineers',
          description: 'Personalized career roadmap mapping junior to senior engineering, promotion strategies, and tech career decisions.',
          category: 'CAREER_DIRECTION',
          duration: 45,
          price: 999,
          active: true,
        },
        {
          title: 'System Design & High-Concurrency Architecture Mock',
          description: 'Live 45-minute mock system design round covering microservices, caching, and sharding, followed by 15-minute actionable feedback.',
          category: 'MOCK_INTERVIEW',
          duration: 60,
          price: 1899,
          active: true,
        },
        {
          title: 'Backend Architecture & Technical Deep-Dive Guidance',
          description: 'Hands-on architectural guidance, unblocking distributed system bottlenecks, and technical code teardowns.',
          category: 'TECHNICAL_GUIDANCE',
          duration: 45,
          price: 1299,
          active: true,
        },
      ],
    },
    {
      name: 'Maya Patel',
      email: 'maya.patel@mentor.io',
      headline: 'Senior Technical Recruiter & Career Advisor',
      bio: 'Ex-FAANG talent advisor specializing in tech resumes, portfolio teardowns, and non-traditional engineering career transitions.',
      domain: 'Talent & Career Advisory',
      company: 'TalentCraft Global',
      experienceYears: 8,
      rating: 4.85,
      reviewCount: 36,
      sessionCount: 72,
      startingPrice: 799,
      expertise: ['Software Engineering', 'Product', 'Business'],
      sessionTypes: ['Resume Review', 'Career Switch'],
      skillsList: ['Resume Optimization', 'Portfolio Review', 'Recruiting Strategies', 'Interview Prep'],
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
      status: 'APPROVED',
      publicProfileEnabled: true,
      services: [
        {
          title: 'Tech Resume & Portfolio Deep-Dive Teardown',
          description: 'Comprehensive line-by-line review of your resume and GitHub/portfolio to bypass ATS and catch hiring manager attention.',
          category: 'RESUME_REVIEW',
          duration: 30,
          price: 799,
          active: true,
        },
        {
          title: 'Non-Tech to Software Engineering Transition Roadmap',
          description: 'Structured roadmap for bootcamp grads and career switchers breaking into engineering roles.',
          category: 'CAREER_SWITCH',
          duration: 45,
          price: 1199,
          active: true,
        },
      ],
    },
    {
      name: 'Samira Khan',
      email: 'samira.khan@mentor.io',
      headline: 'VP of Product Engineering & Leadership Coach',
      bio: 'Executive tech leader helping engineering managers, team leads, and staff engineers master executive communication and team leadership.',
      domain: 'Engineering Leadership',
      company: 'ScaleVentures Lab',
      experienceYears: 14,
      rating: 4.95,
      reviewCount: 54,
      sessionCount: 110,
      startingPrice: 1999,
      expertise: ['Product', 'Business', 'Software Engineering'],
      sessionTypes: ['Leadership', 'Career Direction'],
      skillsList: ['Engineering Leadership', 'Org Design', 'Executive Presence', 'Agile Scaling'],
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400',
      status: 'APPROVED',
      publicProfileEnabled: true,
      services: [
        {
          title: 'Engineering Leadership Coaching & Management Transition',
          description: '1-on-1 strategic mentorship for new and aspiring tech leads and engineering managers.',
          category: 'LEADERSHIP',
          duration: 60,
          price: 2499,
          active: true,
        },
        {
          title: 'Executive Tech Career Direction & Promotion Guidance',
          description: 'Strategic trajectory planning for senior leaders aiming for director or VP engineering positions.',
          category: 'CAREER_DIRECTION',
          duration: 45,
          price: 1999,
          active: true,
        },
      ],
    },
    {
      name: 'David O\'Connor',
      email: 'david.oconnor@mentor.io',
      headline: 'Principal Cloud Architect & Distributed Systems Specialist',
      bio: '15+ years in high-scale infrastructure, Kubernetes orchestration, and technical coaching.',
      domain: 'Cloud Infrastructure & DevOps',
      company: 'CloudNative Solutions',
      experienceYears: 15,
      rating: 4.9,
      reviewCount: 42,
      sessionCount: 95,
      startingPrice: 1499,
      expertise: ['Software Engineering', 'Cybersecurity'],
      sessionTypes: ['Technical Guidance', 'Mock Interview'],
      skillsList: ['Kubernetes', 'AWS Architecture', 'Terraform', 'System Resilience'],
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
      status: 'APPROVED',
      publicProfileEnabled: true,
      services: [
        {
          title: 'Kubernetes & Cloud Infrastructure Architecture Review',
          description: 'System-level architecture teardown for high availability, multi-region clusters, and cloud cost optimization.',
          category: 'TECHNICAL_GUIDANCE',
          duration: 45,
          price: 1499,
          active: true,
        },
        {
          title: 'Principal Engineer Technical Interview Prep',
          description: 'Simulated high-stakes architectural interview round for staff and principal level positions.',
          category: 'MOCK_INTERVIEW',
          duration: 60,
          price: 1999,
          active: true,
        },
      ],
    },
  ];

  for (const mData of mentorsToSeed) {
    let user = await db.user.findUnique({ where: { email: mData.email } });
    if (!user) {
      user = await db.user.create({
        data: {
          name: mData.name,
          email: mData.email,
          passwordHash,
          role: 'MENTOR',
          status: 'ACTIVE',
          isOnboarded: true,
        },
      });
    }

    let mentor = await db.mentor.findUnique({ where: { email: mData.email } });
    if (!mentor) {
      mentor = await db.mentor.create({
        data: {
          userId: user.id,
          name: mData.name,
          email: mData.email,
          headline: mData.headline,
          bio: mData.bio,
          domain: mData.domain,
          company: mData.company,
          experienceYears: mData.experienceYears,
          rating: mData.rating,
          reviewCount: mData.reviewCount,
          sessionCount: mData.sessionCount,
          startingPrice: mData.startingPrice,
          expertise: mData.expertise,
          sessionTypes: mData.sessionTypes,
          skillsList: mData.skillsList,
          avatar: mData.avatar,
          status: mData.status,
          publicProfileEnabled: true,
          approvedAt: new Date(),
        },
      });
      console.log(`✓ Created Mentor: ${mData.name}`);
    } else {
      mentor = await db.mentor.update({
        where: { id: mentor.id },
        data: {
          userId: user.id,
          name: mData.name,
          headline: mData.headline,
          bio: mData.bio,
          domain: mData.domain,
          company: mData.company,
          experienceYears: mData.experienceYears,
          rating: mData.rating,
          reviewCount: mData.reviewCount,
          sessionCount: mData.sessionCount,
          startingPrice: mData.startingPrice,
          expertise: mData.expertise,
          sessionTypes: mData.sessionTypes,
          skillsList: mData.skillsList,
          avatar: mData.avatar,
          status: 'APPROVED',
          publicProfileEnabled: true,
        },
      });
      console.log(`✓ Updated Mentor: ${mData.name}`);
    }

    // Upsert active services
    for (const sData of mData.services) {
      const existing = await db.mentorshipService.findFirst({
        where: {
          mentorId: mentor.id,
          title: sData.title,
        },
      });

      if (!existing) {
        await db.mentorshipService.create({
          data: {
            mentorId: mentor.id,
            title: sData.title,
            description: sData.description,
            category: sData.category,
            duration: sData.duration,
            price: sData.price,
            currency: 'INR',
            active: sData.active,
          },
        });
        console.log(`  + Added Service: ${sData.title} (${sData.category})`);
      } else {
        await db.mentorshipService.update({
          where: { id: existing.id },
          data: {
            description: sData.description,
            category: sData.category,
            duration: sData.duration,
            price: sData.price,
            active: sData.active,
          },
        });
        console.log(`  ~ Updated Service: ${sData.title} (${sData.category})`);
      }
    }
  }

  console.log('✅ Seeding completed successfully!');
}

if (require.main === module) {
  seedMentorDiscovery()
    .catch(console.error)
    .finally(() => db.$disconnect());
}
