import ApiClient from "../client";
import {LoginRequest, LoginResponse} from "./types";
import { jwtDecode } from "jwt-decode";

class AuthClient {
  private client: ApiClient;

  constructor() {
    this.client = new ApiClient('/auth');
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await this.client.request<LoginResponse>('/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (response.accessToken) {
      localStorage.setItem('authToken', response.accessToken);
      localStorage.setItem('tokenType', response.tokenType);
      localStorage.setItem('userName', data.username);
    }

    return response;
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('tokenType');
    localStorage.removeItem('userName');
    localStorage.removeItem('permissoes-storage');
    sessionStorage.removeItem('permissoes-storage');
    window.location.href = '/';
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  getUserName(): string | null {
    return localStorage.getItem('userName');
  }

  getUserIdResponsavelFromToken(): number | null {
    try {
      const token = this.getToken();
      if (!token) return null;
      const payload = jwtDecode<Record<string, unknown>>(token);

      const raw = (payload['idResponsavel'] ?? payload['userId'] ?? payload['sub']) as unknown;
      if (typeof raw === 'number') return raw;
      if (typeof raw === 'string') {
        const n = parseInt(raw, 10);
        return isNaN(n) ? null : n;
      }
      return null;
    } catch {
      return null;
    }
  }
}

export const authClient = new AuthClient();
export default authClient;