import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/AuthContext';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Pathway Ecosystem | What\'s Next For Your Career?',
  description: 'The unified career platform helping students, graduates, and professionals discover, prepare, and thrive in their dream careers.',
  keywords: ['Career Growth', 'Mentorship', 'Skills', 'Job Readiness', 'Professional Development'],
  icons: {
    icon: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark scroll-smooth ${inter.variable} ${outfit.variable}`}>
      <body className="bg-obsidian-900 text-slate-100 antialiased min-h-screen flex flex-col selection:bg-brand-indigo/30 selection:text-white font-sans">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
