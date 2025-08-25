export default class ApiClient {
  private readonly module: string;

  constructor(
    module: string
  ) {
    this.module = module;
  }

  private getAuthHeaders(): HeadersInit {
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
      window.location.href = '/login';
    }
  }

  public async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const url = `${baseUrl}${this.module}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        if (response.status === 401) {
          this.handleUnauthorized();
          throw new Error('Token expirado. Redirecionando para login...');
        }

        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }
}