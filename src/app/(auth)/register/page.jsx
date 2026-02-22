import RegisterPage from '@/features/auth/components/RegisterPage';
import AuthRedirect from '@/features/auth/components/AuthRedirect';

export const metadata = {
  title: 'Register | SkillHunt IntelliTrack',
  description: 'Create your SkillHunt IntelliTrack account',
};

export default function Register() {
  return (
    <AuthRedirect>
      <RegisterPage />
    </AuthRedirect>
  );
}
