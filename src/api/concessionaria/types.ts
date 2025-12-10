import { StatusAtivo } from "@/types/misc/types";

export interface ConcessionariaResponse {
  idConcessionaria: number;
  cdConcessionaria: string;
  nmConcessionaria: string;
  dsConcessionaria: string;
  flAtivo: StatusAtivo;
}

