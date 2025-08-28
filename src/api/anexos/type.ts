
export type StatusAtivo = 'ATIVO' | 'INATIVO'; 

export interface AnexoResponse {
  idAnexo: number;
  idObjeto: number;
  tpObjeto: string;
  nmArquivo: string;
  dsCaminho: string;
  flAtivo: StatusAtivo;
}

export type ArquivoDTO = {
  nomeArquivo?: string;
  tipoConteudo?: string | null;
  conteudoArquivo: string;
};

export enum TipoObjetoAnexo {
  E = "E",
  T = "T",
  S = "S"
}