import {StatusAtivo} from "@/types/misc/types";

export interface AreaResponse {
  idArea: number;
  cdArea: string;
  nmArea: string;
  dsArea: string;
  flAtivo: StatusAtivo;
}

export interface AreaRequest {
  cdArea: string;
  nmArea: string;
  dsArea: string;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
}

export interface AreaFilterParams {
  filtro?: string;
  cdArea?: string;
  nmArea?: string;
  dsArea?: string;
  page?: number;
  size?: number;
  sort?: string;
}
