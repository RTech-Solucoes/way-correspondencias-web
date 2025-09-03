
export type StatusAtivo = 'ATIVO' | 'INATIVO';

export interface AnexoResponse {
  idAnexo: number;
  idObjeto: number;
  tpObjeto: string;
  nmArquivo: string;
  dsCaminho: string;
  tpResponsavel: TipoResponsavelAnexo;
  flAtivo: StatusAtivo;
}

export type ArquivoDTO = {
  nomeArquivo?: string;
  tipoConteudo?: string;
  tpResponsavel: TipoResponsavelAnexo;
  conteudoArquivo: string;
};

export enum TipoResponsavelAnexo {
  A = "A", // Analista
  G = "G", // Gestor
  D = "D", // Diretor
  R = "R" // Regulatório
}

export enum TipoObjetoAnexo {
  E = "E",
  T = "T",
  S = "S"
}