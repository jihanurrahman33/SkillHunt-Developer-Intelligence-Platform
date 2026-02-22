import UserManagement from '@/features/users/components/UserManagement';
import RoleGate from '@/features/auth/components/RoleGate';
import NotFoundDisplay from '@/components/ui/NotFoundDisplay';

export const metadata = {
  title: 'Users | SkillHunt IntelliTrack',
  description: 'Manage team members and roles',
};

export default function Users() {
  return (
    <RoleGate
      role="admin"
      fallback={<NotFoundDisplay message="You don't have permission to view this page." />}
    >
      <UserManagement />
    </RoleGate>
  );
}
