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