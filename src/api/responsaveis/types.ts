export interface ResponsavelResponse {
  idResponsavel: number;
  idPerfil: number;
  nmPerfil: string;
  nmUsuarioLogin: string;
  nmResponsavel: string;
  dsEmail: string;
  nrCpf: string;
  dtNascimento: string;
  flAtivo: 'S' | 'N';
}

export interface ResponsavelRequest {
  idPerfil: number;
  nmUsuarioLogin: string;
  nmResponsavel: string;
  dsEmail: string;
  nrCpf: string;
  dtNascimento: string;
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
