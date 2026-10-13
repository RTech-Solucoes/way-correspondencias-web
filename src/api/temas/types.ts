import {StatusAtivo} from "@/utils/misc/status-ativo";
import {AreaResponse} from "@/api/areas/types";
import { TipoResponse } from "@/api/tipos/types";

export interface TemaResponse {
  idTema: number;
  nmTema: string;
  dsTema: string;
  nrPrazo: number;
  tpPrazo: string;
  flAtivo: StatusAtivo;
  areas: AreaResponse[];
  idConcessionaria?: number;
  idTipoCriticidade?: number;
  tipoCriticidade?: TipoResponse | null;
}

export interface TemaRequest {
  nmTema: string;
  dsTema: string;
  nrPrazo?: number;
  tpPrazo?: string;
  idsAreas?: number[];
  idTipoCriticidade?: number;
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
  idTipoCriticidade?: number;
  page?: number;
  size?: number;
  sort?: string;
}
