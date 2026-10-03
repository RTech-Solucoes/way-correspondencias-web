import { Permissoes } from '@/constants/permissoes';
import { ClienteEnum, getClienteAtual } from '@/lib/layout/layout-client.enum';

export type RouteAccessDef = {
  path: string;
  permission?: Permissoes;
  clients?: ClienteEnum[];
};

/** Definições leves para checagem de acesso (middleware / AuthGuard). */
export const ROUTE_ACCESS_DEF: RouteAccessDef[] = [
  { path: '/dashboard-correspondencia', permission: Permissoes.SOLICITACAO_LISTAR },
  { path: '/solicitacoes', permission: Permissoes.SOLICITACAO_LISTAR },
  { path: '/email', permission: Permissoes.EMAIL_LISTAR },
  { path: '/dashboard-obrigacoes', permission: Permissoes.SOLICITACAO_LISTAR },
  { path: '/obrigacao', permission: Permissoes.SOLICITACAO_LISTAR },
  { path: '/areas', permission: Permissoes.AREA_LISTAR },
  { path: '/temas', permission: Permissoes.TEMA_LISTAR },
  { path: '/responsaveis', permission: Permissoes.RESPONSAVEL_LISTAR },
  {
    path: '/concessionarias',
    permission: Permissoes.CONCESSIONARIA_LISTAR,
    clients: [ClienteEnum.RTECH],
  },
];

export const PUBLIC_ROUTES: string[] = ['/'];

export function findRouteAccess(pathname: string): RouteAccessDef | undefined {
  const sorted = [...ROUTE_ACCESS_DEF].sort((a, b) => b.path.length - a.path.length);
  return sorted.find(
    (route) => pathname === route.path || pathname.startsWith(`${route.path}/`),
  );
}

export function parsePermissoesCookie(raw?: string | null): string[] {
  if (!raw) return [];

  const candidates = [raw];
  try {
    candidates.unshift(decodeURIComponent(raw));
  } catch {
    // ignore decode errors
  }

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      const permissoes = parsed?.state?.permissoes;
      if (!Array.isArray(permissoes)) continue;
      return permissoes
        .map((item: unknown) => String(item).trim())
        .filter(Boolean);
    } catch {
      // try next candidate
    }
  }

  return [];
}

export function canAccessRoute(
  pathname: string,
  permissoes: string[],
  layoutClient: ClienteEnum = getClienteAtual(),
): boolean {
  const route = findRouteAccess(pathname);
  if (!route) return true;

  if (route.clients?.length && !route.clients.includes(layoutClient)) {
    return false;
  }

  if (route.permission && !permissoes.some((item) => item === route.permission)) {
    return false;
  }

  return true;
}
