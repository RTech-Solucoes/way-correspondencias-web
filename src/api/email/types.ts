export interface Anexo {
  id_anexo: number;
  ds_nome_anexo: string;
  nm_tamanho_anexo: number;
}

export interface EmailAPI {
  id_email: number;
  cd_sei?: string;
  titulo: string;
  assunto: string;
  conteudo: string;
  remetente: string;
  resposta?: string;
  prazo_resposta?: string;
  id_setor: number;
  id_responsavel: number;
  tp_email: string;
}

export interface EmailResponse {
  id: number;
  nmUsuario: string;
  dsRemetente: string;
  dsDestinatario: string;
  dsAssunto: string;
  txConteudo: string;
  dtEnvio: string;
  dtResposta?: string;
  flStatus: string;
  anexos?: Anexo[];
}

export interface EmailRequest {
  nmUsuario: string;
  dsRemetente: string;
  dsDestinatario: string;
  dsAssunto: string;
  txConteudo: string;
  dtEnvio: string;
  flStatus: string;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface EmailFilterParams {
  filtro?: string;
  page?: number;
  size?: number;
  sort?: string;
}
