import ApiClient from "../client";
import {LoginRequest, LoginResponse} from "./types";

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
      sessionStorage.setItem('authToken', response.accessToken);
      sessionStorage.setItem('tokenType', response.tokenType);
      sessionStorage.setItem('userName', data.username);
    }

    return response;
  }

  logout(): void {
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('tokenType');
    sessionStorage.removeItem('userName');
    sessionStorage.removeItem('permissoes-storage');
    window.location.href = '/';
  }

  isAuthenticated(): boolean {
    return !!sessionStorage.getItem('authToken');
  }

  getToken(): string | null {
    return sessionStorage.getItem('authToken');
  }

  getUserName(): string | null {
    return sessionStorage.getItem('userName');
  }
}

export const authClient = new AuthClient();
export default authClient;