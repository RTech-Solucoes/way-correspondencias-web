import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  PUBLIC_ROUTES,
  canAccessRoute,
  findRouteAccess,
  parsePermissoesCookie,
} from '@/constants/pages/route-access';
import { getClienteAtual } from '@/lib/layout/layout-client.enum';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  const authToken = request.cookies.get('authToken')?.value;

  if (isPublicRoute && authToken) {
    return NextResponse.redirect(new URL('/dashboard-correspondencia', request.url));
  }

  if (!isPublicRoute && !authToken) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (!isPublicRoute && authToken) {
    const layoutClient = getClienteAtual();
    const route = findRouteAccess(pathname);
    const permissoes = parsePermissoesCookie(
      request.cookies.get('permissoes-storage')?.value,
    );

    const blockedByClient =
      !!route?.clients?.length && !route.clients.includes(layoutClient);
    const blockedByPermission =
      permissoes.length > 0 && !canAccessRoute(pathname, permissoes, layoutClient);

    if (blockedByClient || blockedByPermission) {
      const notFoundUrl = request.nextUrl.clone();
      notFoundUrl.pathname = '/nao-encontrado';
      return NextResponse.rewrite(notFoundUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ],
};
