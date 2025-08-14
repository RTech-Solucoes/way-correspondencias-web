import {TipoContagem} from "./enums";

export interface Tema {
  idTema: string;
  nmTema: string;
  dsTema: string;
  idAreas: string[];
  nrDiasPrazo: number;
  tpContagem: TipoContagem;
  dtCadastro: string;
  nrCpfCadastro: string;
  vsVersao: number;
  dtAlteracao: string;
  nrCpfAlteracao: string;
}