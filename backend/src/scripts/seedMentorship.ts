import { db } from '../db/client';
import { hashPassword } from '../auth/security';

async function seedMentorship() {
  console.log('🌱 Seeding Mentorship domain data for operational testing...');

  const passwordHash = await hashPassword('Password123!');

  // 1. Ensure Arjun Mehta has a User record
  let arjunUser = await db.user.findUnique({
    where: { email: 'arjun.mehta@techlead.io' },
  });

  if (!arjunUser) {
    arjunUser = await db.user.create({
      data: {
        name: 'Arjun Mehta',
        email: 'arjun.mehta@techlead.io',
        passwordHash,
        role: 'MENTOR',
        status: 'ACTIVE',
        isOnboarded: true,
      },
    });
    console.log('✓ Created User for Arjun Mehta');
  } else {
    await db.user.update({
      where: { id: arjunUser.id },
      data: { passwordHash, role: 'MENTOR', status: 'ACTIVE' },
    });
    console.log('✓ Updated User for Arjun Mehta');
  }

  // Link Mentor record to arjunUser.id
  let arjunMentor = await db.mentor.findUnique({
    where: { email: 'arjun.mehta@techlead.io' },
  });

  if (arjunMentor) {
    arjunMentor = await db.mentor.update({
      where: { id: arjunMentor.id },
      data: {
        userId: arjunUser.id,
        status: 'APPROVED',
      },
    });
  }

  // 2. Ensure candidate user "Rahul Sharma" exists
  let candidateRahul = await db.user.findUnique({
    where: { email: 'rahul.sharma@candidate.io' },
  });

  if (!candidateRahul) {
    candidateRahul = await db.user.create({
      data: {
        name: 'Rahul Sharma',
        email: 'rahul.sharma@candidate.io',
        passwordHash,
        role: 'CANDIDATE',
        status: 'ACTIVE',
        isOnboarded: true,
        profile: {
          create: {
            headline: 'Aspiring Distributed Systems Engineer',
            candidateType: 'STUDENT',
            location: 'Bengaluru, India',
            totalExperience: '1 year',
            careerGoal: {
              create: {
                targetRole: 'Backend Software Engineer',
                careerField: 'Distributed Systems',
                timeframe: 'Next 3 months',
                notes: 'Preparing for tier-1 tech backend interviews.',
              },
            },
          },
        },
      },
    });
    console.log('✓ Created Candidate Rahul Sharma');
  }

  // 3. Ensure candidate user "Priya Patel" exists
  let candidatePriya = await db.user.findUnique({
    where: { email: 'priya.patel@candidate.io' },
  });

  if (!candidatePriya) {
    candidatePriya = await db.user.create({
      data: {
        name: 'Priya Patel',
        email: 'priya.patel@candidate.io',
        passwordHash,
        role: 'CANDIDATE',
        status: 'ACTIVE',
        isOnboarded: true,
        profile: {
          create: {
            headline: 'Frontend Engineer transitioning to Full Stack',
            candidateType: 'PROFESSIONAL',
            location: 'Mumbai, India',
            careerGoal: {
              create: {
                targetRole: 'Full Stack Engineer',
                timeframe: '6 months',
              },
            },
          },
        },
      },
    });
    console.log('✓ Created Candidate Priya Patel');
  }

  if (!arjunMentor) return;

  // 4. Ensure Mentorship Services for Arjun
  const existingServices = await db.mentorshipService.findMany({
    where: { mentorId: arjunMentor.id },
  });

  let service1 = existingServices.find((s) => s.category === 'MOCK_INTERVIEW');
  if (!service1) {
    service1 = await db.mentorshipService.create({
      data: {
        mentorId: arjunMentor.id,
        title: 'System Design & High-Concurrency Architecture Mock',
        description: 'Simulated 1-on-1 system design interview covering distributed caches, load balancing, sharding, and resilience.',
        category: 'MOCK_INTERVIEW',
        duration: 60,
        price: 1500,
        currency: 'INR',
        active: true,
      },
    });
  }

  let service2 = existingServices.find((s) => s.category === 'CAREER_GUIDANCE');
  if (!service2) {
    service2 = await db.mentorshipService.create({
      data: {
        mentorId: arjunMentor.id,
        title: 'Staff / Principal Engineer Career Progression Roadmap',
        description: 'Strategic mentorship on technical leadership, cross-team impact, architecture reviews, and executive communication.',
        category: 'CAREER_GUIDANCE',
        duration: 45,
        price: 1200,
        currency: 'INR',
        active: true,
      },
    });
  }

  let service3 = existingServices.find((s) => s.category === 'RESUME_REVIEW');
  if (!service3) {
    service3 = await db.mentorshipService.create({
      data: {
        mentorId: arjunMentor.id,
        title: 'Senior Backend Engineering Resume & Portfolio Teardown',
        description: 'Line-by-line review of your resume, impact metrics, GitHub repositories, and architectural writeups.',
        category: 'RESUME_REVIEW',
        duration: 30,
        price: 800,
        currency: 'INR',
        active: true,
      },
    });
  }

  // 5. Ensure Weekly Availability Rules
  const existingRules = await db.availabilityRule.findMany({
    where: { mentorId: arjunMentor.id },
  });

  if (existingRules.length === 0) {
    await db.availabilityRule.createMany({
      data: [
        { mentorId: arjunMentor.id, dayOfWeek: 1, startTime: '09:00', endTime: '18:00', timezone: 'Asia/Kolkata', active: true },
        { mentorId: arjunMentor.id, dayOfWeek: 2, startTime: '09:00', endTime: '18:00', timezone: 'Asia/Kolkata', active: true },
        { mentorId: arjunMentor.id, dayOfWeek: 3, startTime: '09:00', endTime: '18:00', timezone: 'Asia/Kolkata', active: true },
        { mentorId: arjunMentor.id, dayOfWeek: 4, startTime: '09:00', endTime: '18:00', timezone: 'Asia/Kolkata', active: true },
        { mentorId: arjunMentor.id, dayOfWeek: 5, startTime: '09:00', endTime: '17:00', timezone: 'Asia/Kolkata', active: true },
      ],
    });
    console.log('✓ Created Weekly Availability Rules for Arjun');
  }

  // 6. Ensure sample bookings (Today, Upcoming, and Completed)
  const existingBookings = await db.booking.findMany({
    where: { mentorId: arjunMentor.id },
  });

  if (existingBookings.length === 0) {
    const now = new Date();

    // 6a. Today's session
    const todayStart = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now
    const todayEnd = new Date(todayStart.getTime() + 60 * 60 * 1000);

    const bToday = await db.booking.create({
      data: {
        mentorId: arjunMentor.id,
        candidateId: candidateRahul.id,
        serviceId: service1.id,
        scheduledStart: todayStart,
        scheduledEnd: todayEnd,
        timezone: 'Asia/Kolkata',
        status: 'CONFIRMED',
        studentNotes: 'I am preparing for an interview with a distributed storage startup. Want to practice designing an append-only log store.',
        session: {
          create: {
            mentorId: arjunMentor.id,
            candidateId: candidateRahul.id,
            status: 'SCHEDULED',
            meetingUrl: 'https://meet.google.com/xyz-mentor-room',
            notes: 'Initial evaluation focus: Partitioning strategy, replication factor, and consensus protocol understanding.',
            actionItems: JSON.stringify([
              { id: '1', text: 'Review Raft paper summary and leader election', completed: true },
              { id: '2', text: 'Benchmark disk I/O write throughput in Go', completed: false },
            ]),
          },
        },
      },
    });

    // 6b. Upcoming booking tomorrow
    const tomorrowStart = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const tomorrowEnd = new Date(tomorrowStart.getTime() + 45 * 60 * 1000);

    await db.booking.create({
      data: {
        mentorId: arjunMentor.id,
        candidateId: candidatePriya.id,
        serviceId: service2.id,
        scheduledStart: tomorrowStart,
        scheduledEnd: tomorrowEnd,
        timezone: 'Asia/Kolkata',
        status: 'CONFIRMED',
        studentNotes: 'Transitioning from frontend to full stack. Need guidance on prioritizing backend architecture fundamentals.',
        session: {
          create: {
            mentorId: arjunMentor.id,
            candidateId: candidatePriya.id,
            status: 'SCHEDULED',
            meetingUrl: 'https://meet.google.com/priya-session-room',
          },
        },
      },
    });

    // 6c. Completed historical session with review
    const pastStart = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
    const pastEnd = new Date(pastStart.getTime() + 60 * 60 * 1000);

    const bPast = await db.booking.create({
      data: {
        mentorId: arjunMentor.id,
        candidateId: candidateRahul.id,
        serviceId: service1.id,
        scheduledStart: pastStart,
        scheduledEnd: pastEnd,
        timezone: 'Asia/Kolkata',
        status: 'COMPLETED',
        studentNotes: 'First mock interview on caching patterns and Redis cluster topology.',
        session: {
          create: {
            mentorId: arjunMentor.id,
            candidateId: candidateRahul.id,
            status: 'COMPLETED',
            startedAt: pastStart,
            endedAt: pastEnd,
            meetingUrl: 'https://meet.google.com/past-room',
            notes: 'Rahul demonstrated exceptional clarity on cache-aside versus write-through patterns. Needs polish on Redis sentinel failover edge cases.',
            actionItems: JSON.stringify([
              { id: 'p1', text: 'Implement Redis Sentinel locally with Docker compose', completed: true },
              { id: 'p2', text: 'Read Martin Kleppmann chapter 5 on replication', completed: true },
            ]),
          },
        },
        review: {
          create: {
            mentorId: arjunMentor.id,
            candidateId: candidateRahul.id,
            rating: 5,
            review: 'Arjun gave the most thorough and insightful system design mock interview I have experienced. His feedback on cache invalidation and distributed lock pitfalls directly helped my real interview performance!',
          },
        },
      },
    });

    console.log('✓ Created Sample Bookings, Sessions, and Reviews');
  }

  console.log('🎉 Mentorship domain successfully initialized.');
}

seedMentorship()
  .catch(console.error)
  .finally(() => db.$disconnect());
