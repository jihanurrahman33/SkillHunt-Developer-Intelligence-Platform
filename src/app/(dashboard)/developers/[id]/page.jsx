import DeveloperProfile from '@/features/developers/components/DeveloperProfile';

export const metadata = {
  title: 'Developer Profile | SkillHunt IntelliTrack',
  description: 'View developer details and recruitment status',
};

export default async function Developer({ params }) {
  const { id } = await params;
  return <DeveloperProfile id={id} />;
}
