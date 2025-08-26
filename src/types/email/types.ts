export interface Email {
  idEmail: number;
  cdSei?: string;
  titulo: string;
  assunto: string;
  conteudo: string;
  remetente: string;
  resposta?: string;
  prazoResposta?: string;
  idSetor: number;
  idResponsavel: number;
  tpEmail: string;
}
