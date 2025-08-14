export interface Solicitacao {
  idSolicitacao: string;
  cdSolicitante: string[];
  dsAssunto: string;
  cdIdentificacao: string;
  dsDescricao: string;
  dsAnexos: string[];
  status: 'pendente' | 'em_andamento' | 'concluido' | 'atrasado';
  dtCriacao: string;
  idResponsavel?: string;
}