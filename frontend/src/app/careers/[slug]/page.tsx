import { notFound } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getCareerPathBySlug } from '@/lib/careers/career-repository';
import { getCandidateContextFromSession } from '@/lib/careers/career-server-helper';
import { CareerDetailClientView } from '@/components/career/CareerDetailClientView';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const career = getCareerPathBySlug(params.slug);
  if (!career) return { title: 'Career Not Found | PATHWAY.ECO' };

  return {
    title: `${career.title} Career Roadmap & Execution Plan | PATHWAY.ECO`,
    description: career.shortDescription,
  };
}

export default async function CareerDetailPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: { level?: string };
}) {
  const career = getCareerPathBySlug(params.slug);
  if (!career) {
    notFound();
  }

  const candidate = await getCandidateContextFromSession();
  const initialLevelParam = typeof searchParams?.level === 'string' ? searchParams.level : undefined;

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-900 font-sans">
      <Header />
      <CareerDetailClientView
        career={career}
        candidate={candidate}
        initialLevelParam={initialLevelParam}
      />
      <Footer />
    </div>
  );
}
