let isHandlingUnauthorized = false;

export default class ApiClient {
  private readonly module: string;

  constructor(
    module: string
  ) {
    this.module = module;
  }

  public getAuthHeaders(): HeadersInit {
    const authToken = localStorage.getItem('authToken');
    const tokenType = localStorage.getItem('tokenType');

    if (authToken) {
      return {
        'Authorization': `${tokenType} ${authToken}`
      };
    }
    return {};
  }

  private getIdConcessionaria(): number | null {
    try {
      const idSalvo = localStorage.getItem('concessionaria-selecionada');
      if (idSalvo) {
        const id = parseInt(idSalvo, 10);
        return isNaN(id) ? null : id;
      }
      return null;
    } catch {
      return null;
    }
  }

  private addConcessionariaToUrl(url: string): string {
    const idConcessionaria = this.getIdConcessionaria();
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
    if (isHandlingUnauthorized) {
      return;
    }
    
    isHandlingUnauthorized = true;

    localStorage.removeItem('authToken');
    localStorage.removeItem('tokenType');
    localStorage.removeItem('user');
    localStorage.removeItem('userName');
    localStorage.removeItem('permissoes-storage');
    localStorage.removeItem('concessionaria-selecionada');
    sessionStorage.removeItem('permissoes-storage');

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('authTokenRemoved'));
    }

    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    const isLoginPage = currentPath === '/';
    
    if (!isLoginPage) {
      import('sonner').then(({ toast }) => {
        toast.error('Seu token expirou, faça login novamente');
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
      url = this.addConcessionariaToUrl(url);
    }
    
    // Suprimir warning do linter
    void _skipParam;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.getAuthHeaders() as Record<string, string>,
      ...(fetchOptions.headers as Record<string, string> | undefined)
    };
    
    const config: RequestInit = {
      headers,
      ...fetchOptions,
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

        if (response.status === 401 && !suppressLogout) {
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