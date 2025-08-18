export interface TemaResponse {
  id: number;
  nmTema: string;
  dsTema: string;
  flAtivo: boolean;
  dtCriacao: string;
  dtUltimaAtualizacao?: string;
}

export interface TemaRequest {
  nmTema: string;
  dsTema: string;
  flAtivo: boolean;
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

export interface TemaFilterParams {
  filtro?: string;
  page?: number;
  size?: number;
  sort?: string;
}
