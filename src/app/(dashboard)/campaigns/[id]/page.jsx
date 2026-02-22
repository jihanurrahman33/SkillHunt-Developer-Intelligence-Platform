import CampaignDetail from '@/features/campaigns/components/CampaignDetail';

export const metadata = {
  title: 'Campaign Detail | SkillHunt IntelliTrack',
  description: 'View campaign details and assigned developers',
};

export default function CampaignDetailPage({ params }) {
  return <CampaignDetail params={params} />;
}
