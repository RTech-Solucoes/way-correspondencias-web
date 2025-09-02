import ApiClient from "../client";
import { LoginRequest } from "../interfaces/request/LoginRequest";
import { LoginResponse } from "../interfaces/response/LoginResponse";

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
}

export const authClient = new AuthClient();
export default authClient;