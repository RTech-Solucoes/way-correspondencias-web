// Types for the new entities

// Enum for TP_CONTAGEM (tipo de contagem de prazo)
export enum TipoContagem {
  CORRIDOS = "CORRIDOS",
  UTEIS = "UTEIS"
}

// TEMAS entity
export interface Tema {
  idTema: string; // UUID
  nmTema: string; // Area name (changed from number to string)
  dsTema: string; // Theme description
  idAreas: string[]; // Array of UUIDs, references to multiple Areas
  nrDiasPrazo: number;
  tpContagem: TipoContagem;
  dtCadastro: string;
  nrCpfCadastro: string;
  vsVersao: number;
  dtAlteracao: string;
  nrCpfAlteracao: string;
}

// AREAS entity
export interface Area {
  idArea: string; // UUID
  cdArea: number;
  nmArea: string;
  dsArea: string;
  dtCadastro: string;
  nrCpfCadastro: string;
  vsVersao: number;
  dtAlteracao: string;
  nrCpfAlteracao: string;
}

// RESPONSAVEIS entity
export interface Responsavel {
  idResponsavel: string; // UUID
  dsNome: string;
  dsEmail: string;
  nmTelefone: string;
}

// SOLICITAÇÕES entity
export interface Solicitacao {
  idSolicitacao: string; // UUID (added for identification)
  cdSolicitante: string[]; // Array of codes
  dsAssunto: string;
  cdIdentificacao: string;
  dsDescricao: string;
  dsAnexos: string[]; // Array of attachments
  status: 'pendente' | 'em_andamento' | 'concluido' | 'atrasado'; // Added for Kanban functionality
  dtCriacao: string; // Added for sorting/filtering
  idResponsavel?: string; // Optional reference to Responsavel
}
