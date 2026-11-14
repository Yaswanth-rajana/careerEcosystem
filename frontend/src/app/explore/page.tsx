import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getCandidateContextFromSession } from '@/lib/careers/career-server-helper';
import { ExploreClientPage } from './ExploreClientPage';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Explore Career Directions | PATHWAY.ECO',
  description: 'Discover industry career paths across Cloud, DevOps, Infrastructure, and Enterprise IT.',
};

export default async function ExplorePage({
  searchParams,
}: {
  searchParams?: { search?: string; q?: string };
}) {
  const candidate = await getCandidateContextFromSession();
  const initialSearch = searchParams?.search || searchParams?.q || '';

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-900 font-sans">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <ExploreClientPage
          candidate={candidate}
          initialSearch={initialSearch}
        />
      </main>
      <Footer />
    </div>
  );
}
