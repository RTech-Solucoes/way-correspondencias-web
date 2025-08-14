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

  public async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }
}