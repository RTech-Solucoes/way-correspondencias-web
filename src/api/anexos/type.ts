
export type StatusAtivo = 'ATIVO' | 'INATIVO';

export interface AnexoResponse {
  idAnexo: number;
  idObjeto: number;
  tpObjeto: string;
  nmArquivo: string;
  dsCaminho: string;
  tpResponsavel: TipoResponsavelAnexo | string;
  flAtivo: StatusAtivo;
}

export type ArquivoDTO = {
  nomeArquivo?: string;
  tipoConteudo?: string | null;
  tpResponsavel?: TipoResponsavelAnexo | null;
  conteudoArquivo: string;
};

export enum TipoResponsavelAnexo {
  A = "A", // Analista
  G = "G", // Gestor
  D = "D", // Diretor
  R = "R" // Regulatório
}

export enum TipoObjetoAnexo {
  E = "E", // Email
  T = "T", // Tramitacao
  S = "S", // Solicitacao
  R = "R", // Responsavel
  O = "O", // Obrigacao Contratual
}