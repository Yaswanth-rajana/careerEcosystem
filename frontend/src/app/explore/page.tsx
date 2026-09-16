import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getCandidateContextFromSession } from '@/lib/careers/career-server-helper';
import { ExploreClientPage } from './ExploreClientPage';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Explore Career Directions | PATHWAY.ECO',
  description: 'Discover industry career paths across Technology, Data & AI, Product, Business, Electronics, and Mechanical Engineering.',
};

export default async function ExplorePage() {
  const candidate = await getCandidateContextFromSession();

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 font-sans transition-colors">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <ExploreClientPage candidate={candidate} />
      </main>
      <Footer />
    </div>
  );
}
