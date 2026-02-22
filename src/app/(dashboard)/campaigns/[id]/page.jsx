import CampaignDetail from '@/features/campaigns/components/CampaignDetail';

export const metadata = {
  title: 'Campaign Details | SkillHunt IntelliTrack',
  description: 'View campaign details and assigned developers',
};

export default async function CampaignDetailPage(props) {
  const params = await props.params;
  return <CampaignDetail campaignId={params.id} />;
}
