import type {NextRequest} from 'next/server';
import {NextResponse} from 'next/server';
import {PUBLIC_ROUTES} from "@/constants/pages";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  const authToken = request.cookies.get('authToken')?.value;

  if (isPublicRoute && authToken) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (!isPublicRoute && !authToken) {
    return NextResponse.redirect(new URL('/login', request.url));
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