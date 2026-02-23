import { verifyAuth, apiError, apiSuccess } from '@/lib/api-guard';
import connectToDatabase from '@/lib/db';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const auth = await verifyAuth(request);
  if (auth.error) return auth.error;

  try {
    const db = await connectToDatabase();
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(auth.user.id) },
      { projection: { onboardingStatus: 1, role: 1 } }
    );

    if (!user) {
      return apiError('User not found', 404);
    }

    return apiSuccess({ 
      onboardingStatus: user.onboardingStatus || 'none',
      role: user.role
    });
  } catch (error) {
    console.error('Fetch user status error:', error);
    return apiError('Failed to fetch user status', 500);
  }
}
