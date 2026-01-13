import { StatusAtivo } from "@/utils/misc/status-ativo";

export interface ConcessionariaResponse {
  idConcessionaria: number;
  cdConcessionaria: string;
  nmConcessionaria: string;
  dsConcessionaria: string;
  flAtivo: StatusAtivo;
}

