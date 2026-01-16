import ApiClient from "../client";
import {LoginRequest, LoginResponse} from "./types";
import { jwtDecode } from "jwt-decode";
import { setCookie, getCookie, removeCookie } from "@/utils/cookies";

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
      // Salva em cookies (funciona no servidor e cliente)
      setCookie('authToken', response.accessToken);
      setCookie('tokenType', response.tokenType);
      setCookie('userName', data.username);
      
      // Limpa localStorage antigo (migração completa)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('tokenType');
        localStorage.removeItem('userName');
        localStorage.removeItem('concessionaria-selecionada');
        localStorage.removeItem('selectedModule');
        localStorage.removeItem('permissoes-storage');
        sessionStorage.removeItem('permissoes-storage');
      }
      
      // Disparar evento customizado para notificar que o token foi salvo (mesma aba)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('authTokenSaved', {
          detail: { token: response.accessToken }
        }));
      }
    }

    return response;
  }

  logout(): void {
    // Remove cookies
    removeCookie('authToken');
    removeCookie('tokenType');
    removeCookie('userName');
    removeCookie('concessionaria-selecionada');
    removeCookie('permissoes-storage');
    removeCookie('selectedModule');
    
    // Disparar evento customizado para notificar que o token foi removido (mesma aba)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('authTokenRemoved'));
    }
  }

  isAuthenticated(): boolean {
    return !!getCookie('authToken');
  }

  getToken(): string | null {
    return getCookie('authToken');
  }

  getUserName(): string | null {
    return getCookie('userName');
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

  getIdsConcessionariasFromToken(): number[] {
    try {
      const token = this.getToken();
      if (!token) return [];
      const payload = jwtDecode<Record<string, unknown>>(token);

      const raw = payload['idsConcessionarias'] as unknown;
      if (Array.isArray(raw)) {
        return raw.filter((id): id is number => typeof id === 'number');
      }
      if (typeof raw === 'string') {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            return parsed.filter((id): id is number => typeof id === 'number');
          }
        } catch {
          // Se não for JSON válido, tenta separar por vírgula
          return raw.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id));
        }
      }
      return [];
    } catch {
      return [];
    }
  }
}

export const authClient = new AuthClient();
export default authClient;
