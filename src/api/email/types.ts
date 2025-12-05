import {StatusAtivo} from "@/types/misc/types";

export interface Anexo {
  idAnexo: number;
  dsNomeAnexo: string;
  nmTamanhoAnexo: number;
}

export interface EmailResponse {
  idEmail: number;
  dsRemetente: string;
  dsDestinatario: string;
  dsAssunto: string;
  dsCorpo: string;
  dtRecebimento: string;
  flAtivo: StatusAtivo;
  idConcessionaria?: number;
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

export interface EmailFilterParams {
  filtro?: string;
  dsRemetente?: string;
  dsDestinatario?: string;
  dtRecebimentoInicio?: string;
  dtRecebimentoFim?: string;
  page?: number;
  size?: number;
  sort?: string;
}
