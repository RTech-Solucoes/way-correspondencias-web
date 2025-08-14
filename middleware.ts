import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Define public routes that don't require authentication
  const publicRoutes = ['/login', '/cadastro'];

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.includes(pathname);

  // Get the auth token from cookies or check if we need to redirect to get it from localStorage
  const authToken = request.cookies.get('authToken')?.value;

  // If user is on a public route and has a token, redirect to dashboard
  if (isPublicRoute && authToken) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If user is trying to access a protected route without a token
  if (!isPublicRoute && !authToken) {
    // We need to handle the case where the token might be in localStorage
    // Since middleware runs on the server, we can't access localStorage directly
    // We'll create a special route to check localStorage and set a cookie
    const response = NextResponse.redirect(new URL('/login', request.url));
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ],
};