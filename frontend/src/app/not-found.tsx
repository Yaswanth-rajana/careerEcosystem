import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B0F19] text-white px-4 text-center">
      <h1 className="text-4xl font-extrabold font-display mb-2">404 - Page Not Found</h1>
      <p className="text-sm text-slate-400 mb-6">The page or resource you are looking for does not exist.</p>
      <Link
        href="/"
        className="px-5 py-2.5 rounded-xl bg-brand-gradient text-white text-xs font-bold hover:opacity-95 transition-opacity"
      >
        Return to Home
      </Link>
    </div>
  );
}
