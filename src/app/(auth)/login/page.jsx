import LoginPage from '@/features/auth/components/LoginPage';
import AuthRedirect from '@/features/auth/components/AuthRedirect';

export const metadata = {
  title: 'Login | SkillHunt IntelliTrack',
  description: 'Sign in to your SkillHunt IntelliTrack account',
};

export default function Login() {
  return (
    <AuthRedirect>
      <LoginPage />
    </AuthRedirect>
  );
}
