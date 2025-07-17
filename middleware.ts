import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if user is authenticated
  const isAuthenticated = request.cookies.get('isAuthenticated')?.value === 'true';
  
  // If trying to access login or register page while authenticated, redirect to home
  if ((request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register') && isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // If trying to access protected routes while not authenticated, redirect to login
  if (!isAuthenticated && request.nextUrl.pathname !== '/login' && request.nextUrl.pathname !== '/register') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};