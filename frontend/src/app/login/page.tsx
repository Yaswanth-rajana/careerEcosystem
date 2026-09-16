import { AuthPage } from '@/components/auth/AuthPage';

export const metadata = {
  title: 'Sign In | PATHWAY.ECO',
  description: 'Sign in to access your personalized career roadmap, mentorship sessions, and job guidance.',
};

export default function LoginPage() {
  return <AuthPage initialMode="signin" />;
}
