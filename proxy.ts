import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Better auth usually sets these cookies. Adjust if the key is different.
const AUTH_COOKIE = 'better-auth.session_token'; 

export default function proxy(request: NextRequest) {
  // Extract path
  const path = request.nextUrl.pathname;

  const isProtectedPath = path.startsWith('/admin') || path.startsWith('/learn');
  
  // Public paths
  const isPublicPath = path === '/login' || path === '/register';

  // Check auth token
  const hasToken = request.cookies.has(AUTH_COOKIE);

  // If trying to access protected path without token, redirect to login
  if (isProtectedPath && !hasToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If trying to access login while already authenticated, redirect to dashboard
  if (isPublicPath && hasToken) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  // If accessing root, and has token -> dashboard, otherwise login
  if (path === '/') {
    if (hasToken) {
      return NextResponse.redirect(new URL('/admin', request.url));
    } else {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
