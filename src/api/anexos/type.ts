import { BaseResponse } from "../solicitacoes";

export type StatusAtivo = 'ATIVO' | 'INATIVO';

export interface AnexoResponse extends BaseResponse {
  idAnexo: number;
  idObjeto: number;
  tpObjeto: string;
  nmArquivo: string;
  tpDocumento?: TipoDocumentoAnexoEnum | string;
  dsCaminho: string;
  tpResponsavel: TipoResponsavelAnexoEnum | string;
  flAtivo: StatusAtivo;
}

export type ArquivoDTO = {
  nomeArquivo?: string;
  tipoConteudo?: string | null;
  tpResponsavel?: TipoResponsavelAnexoEnum | null;
  conteudoArquivo: string;
  tpDocumento?: TipoDocumentoAnexoEnum | string;
};

export enum TipoResponsavelAnexoEnum {
  A = "A", // Analista
  G = "G", // Gestor
  D = "D", // Diretor
  R = "R" // Regulatório
}

export enum TipoObjetoAnexoEnum {
  E = "E", // Email
  T = "T", // Tramitacao
  S = "S", // Solicitacao
  R = "R", // Responsavel
  O = "O", // Obrigacao Contratual
}

export  enum TipoDocumentoAnexoEnum {
  C = 'C', // Comum
  E = 'E', // Evidência de cumprimento
  A = 'A', // Auxiliar
  R = 'R', // Correspondência
  L = 'L', // Link
}