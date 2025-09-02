import { TipoResponsavelAnexoResponse } from "./TipoResponsavelAnexoResponse";

export type ArquivoResponse = {
  nomeArquivo?: string;
  tipoConteudo?: string;
  tpResponsavel?: TipoResponsavelAnexoResponse;
  conteudoArquivo: string;
};
