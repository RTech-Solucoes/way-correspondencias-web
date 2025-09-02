import type { TipoResponsavelAnexoRequest } from "./TipoResponsavelAnexoRequest";

export type ArquivoRequest = {
  nomeArquivo?: string;
  tipoConteudo?: string;
  tpResponsavel?: TipoResponsavelAnexoRequest;
  conteudoArquivo: string;
};
