// API route helper — verify auth & role from server-side route handlers
// Usage in route handler:
//   const authResult = await verifyAuth(request);
//   if (authResult.error) return authResult.error;
//   const { user } = authResult;

import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

export async function verifyAuth(request, requiredRole = null) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    return {
      error: NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      ),
    };
  }

  if (requiredRole) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

    if (!allowedRoles.includes(token.role)) {
      return {
        error: NextResponse.json(
          { error: 'Forbidden', message: `Requires ${allowedRoles.join(' or ')} role` },
          { status: 403 }
        ),
      };
    }
  }

  return {
    user: {
      id: token.id,
      email: token.email,
      name: token.name,
      role: token.role,
    },
  };
}

// Structured API error response helper
export function apiError(message, status = 500) {
  const errorTypes = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    409: 'Conflict',
    500: 'Internal Server Error',
  };

  return NextResponse.json(
    {
      error: errorTypes[status] || 'Error',
      message,
      statusCode: status,
    },
    { status }
  );
}

// Structured API success response helper
export function apiSuccess(data, status = 200) {
  return NextResponse.json(data, { status });
}
