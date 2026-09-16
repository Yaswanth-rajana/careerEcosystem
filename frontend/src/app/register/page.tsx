import { AuthPage } from '@/components/auth/AuthPage';

export const metadata = {
  title: 'Create Account | PATHWAY.ECO',
  description: 'Build your profile and discover your next step on PATHWAY.ECO.',
};

export default function RegisterPage() {
  return <AuthPage initialMode="signup" />;
}
