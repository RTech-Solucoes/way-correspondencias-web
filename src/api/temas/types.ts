import {StatusAtivo} from "@/types/misc/types";
import {AreaResponse} from "@/api/areas/types";

export interface TemaResponse {
  idTema: number;
  nmTema: string;
  dsTema: string;
  nrPrazo: number;
  tpPrazo: string;
  flAtivo: StatusAtivo;
  areas: AreaResponse[];
  idConcessionaria?: number;
}

export interface TemaRequest {
  nmTema: string;
  dsTema: string;
  nrPrazo?: number;
  tpPrazo?: string;
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

export interface TemaFilterParams {
  filtro?: string;
  nmTema?: string;
  dsTema?: string;
  page?: number;
  size?: number;
  sort?: string;
}
