export interface CreateResponsavelRequest {
  nmResponsavel: string;
  email: string;
  senha: string;
  tp_perfil: 'VISUALIZADOR' | 'EDITOR' | 'APROVADOR';
}

export interface ResponsavelResponse {
  id: number;
  nmUsuario: string;
  dsEmail: string;
  nmResponsavel: string;
  flAtivo: boolean;
  dtCriacao: string;
  dtUltimaAtualizacao?: string;
  area?: {
    id: number;
    nmArea: string;
    cdArea: string;
  };
}

export interface ResponsavelRequest {
  nmUsuarioLogin: string;
  nmResponsavel: string;
  dsEmail: string;
  nrCpf: string;
  dtNascimento: string; // ISO date string format
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface ResponsavelFilterParams {
  filtro?: string;
  page?: number;
  size?: number;
  sort?: string;
}
