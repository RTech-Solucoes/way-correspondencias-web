import { AreaResponse } from "@/api/areas/types";
import { PerfilResponse } from "../perfis/types";

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
  perfil: PerfilResponse;
  nrCpf: string;
  dtNascimento: string;
  nmCargo: string;
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
  nmCargo: string;
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
