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

  private handleUnauthorized(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('tokenType');
    localStorage.removeItem('user');

    import('sonner').then(({ toast }) => {
      toast.error('Seu token expirou, faça login novamente');
    });

    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      const publicRoutes = ['/'];

      if (!publicRoutes.includes(currentPath)) {
        window.location.href = '/';
      }
    }
  }

  public async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const baseUrl = 'http://api.way.correspondencias.rtechsolution.com.br/api'
    const url = `${baseUrl}${this.module}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.getAuthHeaders() as Record<string, string>,
      ...(options.headers as Record<string, string> | undefined)
    };

    const config: RequestInit = {
      headers,
      ...options,
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
          message = ep.error || ep.message || `HTTP ${response.status}: ${response.statusText}`;
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