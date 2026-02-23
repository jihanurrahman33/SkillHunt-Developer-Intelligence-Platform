import { verifyAuth, apiError, apiSuccess } from '@/lib/api-guard';
import connectToDatabase from '@/lib/db';
import { ObjectId } from 'mongodb';

export async function POST(request) {
  const auth = await verifyAuth(request);
  if (auth.error) return auth.error;

  try {
    const db = await connectToDatabase();
    
    // Only allow if status is 'none' or 'rejected' (to retry)
    const user = await db.collection('users').findOne({ _id: new ObjectId(auth.user.id) });
    
    if (!user) return apiError('User not found', 404);
    
    if (user.role === 'recruiter' || user.role === 'admin') {
      return apiError('You already have recruiter or admin access', 400);
    }

    if (user.onboardingStatus === 'pending') {
      return apiError('Request is already pending review', 400);
    }

    await db.collection('users').updateOne(
      { _id: new ObjectId(auth.user.id) },
      { 
        $set: { 
          onboardingStatus: 'pending',
          requestedAt: new Date(),
          updatedAt: new Date()
        } 
      }
    );

    return apiSuccess({ message: 'Request submitted successfully' });
  } catch (error) {
    console.error('Request recruiter error:', error);
    return apiError('Failed to submit request');
  }
}
