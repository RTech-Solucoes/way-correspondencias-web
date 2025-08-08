import {
  CreateResponsavelRequest,
  UpdateResponsavelRequest,
  CreateSetorRequest,
  UpdateSetorRequest,
  CreateEmailRequest,
  UpdateEmailRequest,
  ResponderEmailRequest,
  CreateObrigacaoRequest,
  UpdateObrigacaoRequest,
  VincularCorrespondenciasRequest,
  Responsavel,
  Setor,
  Email,
  Obrigacao,
  Correspondencia,
  SincronizacaoStatus,
  PaginatedResponse,
  ListResponsaveisParams,
  ListEmailsParams,
  ListObrigacoesParams,
  SEIInteressadoParams,
  SEIInteressadoResponse,
  CreateResponse,
  MessageResponse,
  ProcessadosResponse,
  LoginRequest,
  LoginResponse,
  TipoPerfil,
} from './types';

class ApiClient {
  private baseUrl: string;

  constructor(
    baseUrl: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
  ) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
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

  async criarResponsavel(data: CreateResponsavelRequest): Promise<CreateResponse> {
    return this.request<CreateResponse>('/responsaveis', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async listarResponsaveis(params?: ListResponsaveisParams): Promise<PaginatedResponse<Responsavel>> {
    const searchParams = new URLSearchParams();
    if (params?.perfil) searchParams.append('perfil', params.perfil);
    if (params?.nome_like) searchParams.append('nome_like', params.nome_like);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.size) searchParams.append('size', params.size.toString());

    const query = searchParams.toString();
    return this.request<PaginatedResponse<Responsavel>>(
      `/responsaveis${query ? `?${query}` : ''}`
    );
  }

  async obterResponsavel(id: number): Promise<Responsavel> {
    return this.request<Responsavel>(`/responsaveis/${id}`);
  }

  async atualizarResponsavel(id: number, data: UpdateResponsavelRequest): Promise<MessageResponse> {
    return this.request<MessageResponse>(`/responsaveis/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletarResponsavel(id: number): Promise<void> {
    return this.request<void>(`/responsaveis/${id}`, {
      method: 'DELETE',
    });
  }

  async criarSetor(data: CreateSetorRequest): Promise<CreateResponse> {
    return this.request<CreateResponse>('/setores', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async listarSetores(): Promise<{ items: Setor[] }> {
    return this.request<{ items: Setor[] }>('/setores');
  }

  async obterSetor(id: number): Promise<Setor> {
    return this.request<Setor>(`/setores/${id}`);
  }

  async atualizarSetor(id: number, data: UpdateSetorRequest): Promise<MessageResponse> {
    return this.request<MessageResponse>(`/setores/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletarSetor(id: number): Promise<void> {
    return this.request<void>(`/setores/${id}`, {
      method: 'DELETE',
    });
  }

  async criarEmail(data: CreateEmailRequest): Promise<CreateResponse> {
    return this.request<CreateResponse>('/emails', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async listarEmails(params?: ListEmailsParams): Promise<{ items: Email[] }> {


    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.responsavel) searchParams.append('responsavel', params.responsavel.toString());

    const query = searchParams.toString();
    return this.request<{ items: Email[] }>(`/emails${query ? `?${query}` : ''}`);
  }

  async obterEmail(id: number): Promise<Email> {
    return this.request<Email>(`/emails/${id}`);
  }

  async atualizarEmail(id: number, data: UpdateEmailRequest): Promise<MessageResponse> {
    return this.request<MessageResponse>(`/emails/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletarEmail(id: number): Promise<void> {
    return this.request<void>(`/emails/${id}`, {
      method: 'DELETE',
    });
  }

  async responderEmail(id: number, data: ResponderEmailRequest): Promise<MessageResponse> {
    return this.request<MessageResponse>(`/emails/${id}/responder`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async criarObrigacao(data: CreateObrigacaoRequest): Promise<CreateResponse> {
    return this.request<CreateResponse>('/obrigacoes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async listarObrigacoes(params?: ListObrigacoesParams): Promise<{ items: Obrigacao[] }> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.setor) searchParams.append('setor', params.setor.toString());

    const query = searchParams.toString();
    return this.request<{ items: Obrigacao[] }>(`/obrigacoes${query ? `?${query}` : ''}`);
  }

  async obterObrigacao(id: number): Promise<Obrigacao> {
    return this.request<Obrigacao>(`/obrigacoes/${id}`);
  }

  async atualizarObrigacao(id: number, data: UpdateObrigacaoRequest): Promise<MessageResponse> {
    return this.request<MessageResponse>(`/obrigacoes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletarObrigacao(id: number): Promise<void> {
    return this.request<void>(`/obrigacoes/${id}`, {
      method: 'DELETE',
    });
  }

  async vincularCorrespondencias(id: number, data: VincularCorrespondenciasRequest): Promise<MessageResponse> {
    return this.request<MessageResponse>(`/obrigacoes/${id}/correspondencias`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async listarCorrespondencias(id: number): Promise<{ items: Correspondencia[] }> {
    return this.request<{ items: Correspondencia[] }>(`/obrigacoes/${id}/correspondencias`);
  }

  async desvincularCorrespondencia(id: number, emailId: number): Promise<void> {
    return this.request<void>(`/obrigacoes/${id}/correspondencias/${emailId}`, {
      method: 'DELETE',
    });
  }

  async sincronizarEmails(): Promise<ProcessadosResponse> {
    return this.request<ProcessadosResponse>('/sincronizar-emails', {
      method: 'POST',
    });
  }

  async statusSincronizacao(): Promise<SincronizacaoStatus> {
    return this.request<SincronizacaoStatus>('/sincronizar-emails/status');
  }

  async pesquisarSEIInteressado(params: SEIInteressadoParams): Promise<SEIInteressadoResponse> {
    const searchParams = new URLSearchParams();
    searchParams.append('nome', params.nome);
    if (params.orgao) searchParams.append('orgao', params.orgao.toString());

    return this.request<SEIInteressadoResponse>(`/sei/interessado?${searchParams.toString()}`);
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await this.listarResponsaveis();
      const responsaveis = response.items || [];

      const user = responsaveis.find(resp => 
        resp.email === data.email
      );
      
      if (!user) {
        throw new Error('Credenciais inválidas');
      }

      const token = btoa(`${user.id_responsavel}:${user.email}:${Date.now()}`);

      return {
        token,
        user: {
          id_responsavel: user.id_responsavel,
          nmResponsavel: user.nmResponsavel,
          email: user.email,
          tp_perfil: user.tp_perfil
        }
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(data: any): Promise<CreateResponse> {
    const responsavelData: CreateResponsavelRequest = {
      nmResponsavel: `${data.firstName} ${data.lastName}`,
      email: data.email,
      senha: data.password,
      tp_perfil: data.role as TipoPerfil || 'VISUALIZADOR'
    };

    return this.request<CreateResponse>('/responsaveis', {
      method: 'POST',
      body: JSON.stringify(responsavelData),
    });
  }
}

export const apiClient = new ApiClient();
export default apiClient;