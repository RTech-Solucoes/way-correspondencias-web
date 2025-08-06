// Types for the new entities

// Enum for TP_CONTAGEM (tipo de contagem de prazo)
export enum TipoContagem {
  CORRIDOS = "CORRIDOS",
  UTEIS = "UTEIS"
}

// TEMAS entity
export interface Tema {
  id_tema: string; // UUID
  nm_tema: number;
  ds_tema: string;
  id_area: string; // UUID, reference to Area
  nr_dias_prazo: number;
  tp_contagem: TipoContagem;
  dt_cadastro: string;
  nr_cpf_cadastro: string;
  vs_versao: number;
  dt_alteracao: string;
  nr_cpf_alteracao: string;
}

// AREAS entity
export interface Area {
  id_area: string; // UUID
  cd_area: number;
  nm_area: string;
  ds_area: string;
  dt_cadastro: string;
  nr_cpf_cadastro: string;
  vs_versao: number;
  dt_alteracao: string;
  nr_cpf_alteracao: string;
}

// RESPONSAVEIS entity
export interface Responsavel {
  id_responsavel: string; // UUID
  ds_nome: string;
  ds_email: string;
  nm_telefone: string;
}

// SOLICITAÇÕES entity
export interface Solicitacao {
  id_solicitacao: string; // UUID (added for identification)
  cd_solicitante: string[]; // Array of codes
  ds_assunto: string;
  cd_identificacao: string;
  ds_descricao: string;
  ds_anexos: string[]; // Array of attachments
  status: 'pendente' | 'em_andamento' | 'concluido' | 'atrasado'; // Added for Kanban functionality
  dt_criacao: string; // Added for sorting/filtering
  id_responsavel?: string; // Optional reference to Responsavel
}
