import { AreaResponse } from "@/api/areas/types";

export interface ResponsavelAreaResponse {
  idResponsavelArea: number;
  area: AreaResponse;
}

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
  areas?: ResponsavelAreaResponse[];
}

export interface ResponsavelRequest {
  idPerfil: number;
  nmUsuarioLogin: string;
  nmResponsavel: string;
  dsEmail: string;
  nrCpf: string;
  dtNascimento: string;
  idsAreas?: number[];
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
  nmUsuarioLogin?: string;
  dsEmail?: string;
  page?: number;
  size?: number;
  sort?: string;
}
