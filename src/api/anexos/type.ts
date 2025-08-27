
export type StatusAtivo = 'ATIVO' | 'INATIVO'; 

export interface AnexoResponse {
  idAnexo: number;
  idObjeto: number;
  tpObjeto: string;
  nmArquivo: string;
  dsCaminho: string;
  flAtivo: StatusAtivo;
}

export interface ArquivoDTO {
  nomeArquivo: string;
  tipoConteudo: string;
  conteudoArquivo: Uint8Array;
}

export enum TipoObjetoAnexo {
  E = "E", // E-mail
  T = "T", // Tramitação
  S = "S"  // Solicitação
}