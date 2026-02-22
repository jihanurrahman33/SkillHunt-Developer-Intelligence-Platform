// proxy.js — Route protection using NextAuth
// Replaces traditional middleware.js

export { default } from 'next-auth/middleware';

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/developers/:path*',
    '/campaigns/:path*',
    '/analytics/:path*',
    '/api/developers/:path*',
    '/api/campaigns/:path*',
    '/api/recruitment/:path*',
    '/api/analytics/:path*',
    '/api/workers/:path*',
  ],
};
