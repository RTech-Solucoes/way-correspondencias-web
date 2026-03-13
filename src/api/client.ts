import { getCookie } from '@/utils/cookies';

let isHandlingUnauthorized = false;

// Função para detectar se está no servidor (deve ser chamada dentro dos métodos)
function isServer(): boolean {
  return typeof window === 'undefined';
}

// Função para obter cookies no servidor (só funciona em Server Components/Actions)
async function getServerCookies() {
  if (!isServer()) return null;
  
  try {
    const { cookies } = await import('next/headers');
    return cookies();
  } catch {
    // Se não conseguir importar (fora do contexto de requisição), retorna null
    // Isso pode acontecer durante build ou em contextos onde cookies() não está disponível
    return null;
  }
}

export default class ApiClient {
  private readonly module: string;

  constructor(
    module: string
  ) {
    this.module = module;
  }

  public async getAuthHeaders(): Promise<HeadersInit> {
    if (isServer()) {
      // No servidor, tenta usar cookies do Next.js
      try {
        const cookieStore = await getServerCookies();
        if (cookieStore) {
          const authToken = cookieStore.get('authToken')?.value;
          const tokenType = cookieStore.get('tokenType')?.value || 'Bearer';

          if (authToken) {
            return {
              'Authorization': `${tokenType} ${authToken}`
            };
          }
        }
      } catch {
        // Se falhar (fora do contexto de requisição), retorna vazio
        // O cliente vai lidar com isso
      }
      return {};
    } else {
      // No cliente, usa cookies
      const authToken = getCookie('authToken');
      const tokenType = getCookie('tokenType') || 'Bearer';

      if (authToken) {
        return {
          'Authorization': `${tokenType} ${authToken}`
        };
      }
      return {};
    }
  }

  private async getIdConcessionaria(): Promise<number | null> {
    try {
      if (isServer()) {
        // No servidor, tenta usar cookies do Next.js
        try {
          const cookieStore = await getServerCookies();
          if (cookieStore) {
            const idSalvo = cookieStore.get('concessionaria-selecionada')?.value;
            if (idSalvo) {
              const id = parseInt(idSalvo, 10);
              return isNaN(id) ? null : id;
            }
          }
        } catch {
          // Se falhar, retorna null
        }
        return null;
      } else {
        // No cliente, usa cookies
        const { getCookie } = await import('@/utils/cookies');
        const idSalvo = getCookie('concessionaria-selecionada');
        if (idSalvo) {
          const id = parseInt(idSalvo, 10);
          return isNaN(id) ? null : id;
        }
        return null;
      }
    } catch {
      return null;
    }
  }

  private async addConcessionariaToUrl(url: string): Promise<string> {
    const idConcessionaria = await this.getIdConcessionaria();
    if (!idConcessionaria) {
      return url;
    }

    try {
      const urlObj = new URL(url);
      if (!urlObj.searchParams.has('idConcessionaria')) {
        urlObj.searchParams.append('idConcessionaria', idConcessionaria.toString());
      }
      return urlObj.toString();
    } catch {
      const separator = url.includes('?') ? '&' : '?';
      if (!url.includes('idConcessionaria=')) {
        return `${url}${separator}idConcessionaria=${idConcessionaria}`;
      }
      return url;
    }
  }

  private handleUnauthorized(): void {
    // Só executa no cliente
    if (isServer()) return;

    if (isHandlingUnauthorized) {
      return;
    }
    
    isHandlingUnauthorized = true;

    // Remove cookies no cliente
    import('@/utils/cookies').then(({ removeCookie }) => {
      removeCookie('authToken');
      removeCookie('tokenType');
      removeCookie('concessionaria-selecionada');
      removeCookie('permissoes-storage');
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('authTokenRemoved'));
    }

    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    const isLoginPage = currentPath === '/';
    
    if (!isLoginPage) {
      import('sonner').then(({ toast: toastFn }) => {
        toastFn.error('Seu token expirou, faça login novamente');
      });
    }

    setTimeout(() => {
      isHandlingUnauthorized = false;
    }, 1000);
  }

  public async request<T>(
    endpoint: string,
    options: RequestInit & { skipConcessionariaParam?: boolean } = {}
  ): Promise<T> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    let url = `${baseUrl}${this.module}${endpoint}`;
    
    // Extrair skipConcessionariaParam e remover do options antes de usar
    const skipConcessionariaParam = options.skipConcessionariaParam ?? false;
    const { skipConcessionariaParam: _skipParam, ...fetchOptions } = options;
    
    // Adicionar idConcessionaria como query parameter (a menos que seja explicitamente suprimido)
    if (!skipConcessionariaParam) {
      url = await this.addConcessionariaToUrl(url);
    }
    
    // Suprimir warning do linter
    void _skipParam;

    const authHeaders = await this.getAuthHeaders();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...authHeaders as Record<string, string>,
      ...(fetchOptions.headers as Record<string, string> | undefined)
    };
    
    const config: RequestInit = {
      headers,
      ...fetchOptions,
      // Desabilita cache no servidor para garantir dados frescos
      ...(isServer() ? { cache: 'no-store' as const } : {}),
    };

    if (config.body instanceof FormData) {
      delete headers['Content-Type'];
    }

    const suppressLogout = headers['X-Suppress-Logout'] !== undefined;

    interface ApiError extends Error { status?: number; payload?: unknown }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        let errorPayload: unknown = null;
        try { errorPayload = await response.json(); } catch { /* ignore */ }

        // No servidor, não chama handleUnauthorized para 401
        // Deixa o erro ser tratado pelo componente que chamou
        if (response.status === 401 && !suppressLogout && !isServer()) {
          this.handleUnauthorized();
        }

        let message: string;
        if (typeof errorPayload === 'object' && errorPayload !== null) {
          const ep = errorPayload as { error?: string; message?: string };
          message = ep.message || ep.error || `HTTP ${response.status}: ${response.statusText}`;
        } else {
          message = `HTTP ${response.status}: ${response.statusText}`;
        }
        const err: ApiError = new Error(message);
        err.status = response.status;
        err.payload = errorPayload;
        throw err;
      }

      if (response.status === 204) {
        return {} as T;
      }

      try {
        return await response.json();
      } catch {
        return {} as T;
      }
    } catch (error) {
      throw error;
    }
  }
}
