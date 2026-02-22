import DeveloperProfile from '@/features/developers/components/DeveloperProfile';

export const metadata = {
  title: 'Developer Profile | SkillHunt IntelliTrack',
  description: 'View developer profile details and activity',
};

export default function DeveloperDetail({ params }) {
  return <DeveloperProfile params={params} />;
}
