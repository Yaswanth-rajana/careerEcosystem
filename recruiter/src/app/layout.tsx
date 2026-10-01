import type { Metadata } from 'next';
import './globals.css';
import { RecruiterAuthProvider } from '@/lib/recruiterAuthContext';

export const metadata: Metadata = {
  title: 'PATHWAY.ECO — Employer & Recruiter Portal',
  description: 'Enterprise recruitment and talent acquisition workspace for PATHWAY.ECO.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased font-sans bg-[#F8FAFC] text-slate-900 min-h-screen" suppressHydrationWarning>
        <RecruiterAuthProvider>{children}</RecruiterAuthProvider>
      </body>
    </html>
  );
}
