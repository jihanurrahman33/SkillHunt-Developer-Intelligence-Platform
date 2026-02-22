import { NextResponse } from 'next/server';

/**
 * A lightweight, in-memory rate limiter for Next.js API Routes.
 * Note: In a true multi-instance production environment (like Vercel serverless), 
 * this map is isolated per instance. For global rate limiting, use Redis.
 * This is suitable for basic protection against brute-force scripts on a single hobby instance.
 */
const rateLimitMap = new Map();

export function rateLimit(request, limit = 5, windowMs = 60000) {
  // Try to get IP from standard proxy headers, fallback to a default if unavailable
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'anonymous';

  const currentTime = Date.now();
  const windowStart = currentTime - windowMs;

  const currentStatus = rateLimitMap.get(ip) || { count: 0, lastReset: currentTime };

  // If the window has elapsed, reset the counter
  if (currentStatus.lastReset < windowStart) {
    currentStatus.count = 0;
    currentStatus.lastReset = currentTime;
  }

  // Increment counter
  currentStatus.count += 1;
  rateLimitMap.set(ip, currentStatus);

  // Check if over limit
  if (currentStatus.count > limit) {
    return NextResponse.json(
      { success: false, error: 'Too many requests, please try again later.' },
      { status: 429, headers: { 'Retry-After': Math.ceil(windowMs / 1000).toString() } }
    );
  }

  // Pass - null means no error
  return null;
}

// Clean up memory every 5 minutes to prevent Map from growing indefinitely
setInterval(() => {
  const windowStart = Date.now() - 300000;
  for (const [ip, status] of rateLimitMap.entries()) {
    if (status.lastReset < windowStart) {
      rateLimitMap.delete(ip);
    }
  }
}, 300000);
