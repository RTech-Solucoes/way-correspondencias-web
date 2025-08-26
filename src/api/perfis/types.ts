import {StatusAtivo} from "@/types/misc/types";

export interface PerfilResponse {
  idPerfil: number;
  nmPerfil: string;
  dsPerfil: string;
  flAtivo: StatusAtivo;
}

export interface PerfilRequest {
  nmPerfil: string;
  dsPerfil?: string;
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

export interface PerfilFilterParams {
  filtro?: string;
  page?: number;
  size?: number;
  sort?: string;
}
