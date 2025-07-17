// Base types and enums
export type TipoPerfil = 'admin' | 'manager' | 'analyst' | 'auditor' | 'consultant';
export type StatusEmail = 'NOVO' | 'LIDO' | 'RESPONDIDO' | 'ARQUIVADO';
export type TipoItem = 'CONTRATO' | 'LICENCA' | 'AUDITORIA' | 'COMPLIANCE';
export type StatusObrigacao = 'PENDENTE' | 'EM_ANDAMENTO' | 'CONCLUIDO' | 'ATRASADO';

// Request interfaces
export interface CreateResponsavelRequest {
  nm_responsavel: string;
  email: string;
  senha: string;
  tp_perfil: TipoPerfil;
}

export interface UpdateResponsavelRequest {
  nm_responsavel?: string;
  email?: string;
  senha?: string;
  tp_perfil?: TipoPerfil;
}

export interface CreateSetorRequest {
  nm_setor: string;
  id_responsavel: number;
}

export interface UpdateSetorRequest {
  nm_setor?: string;
  id_responsavel?: number;
}

export interface CreateEmailRequest {
  cd_sei?: string;
  titulo: string;
  assunto: string;
  tp_status: StatusEmail;
  resposta?: string;
  prazo_resposta?: string; // ISO date string
  id_setor: number;
  id_responsavel: number;
  tp_email: string;
}

export interface UpdateEmailRequest {
  cd_sei?: string;
  titulo?: string;
  assunto?: string;
  tp_status?: StatusEmail;
  resposta?: string;
  prazo_resposta?: string; // ISO date string
  id_setor?: number;
  id_responsavel?: number;
  tp_email?: string;
}

export interface ResponderEmailRequest {
  resposta: string;
}

export interface CreateObrigacaoRequest {
  nm_tarefa: string;
  tp_item: TipoItem;
  tp_status: StatusObrigacao;
  id_setor_atribuido: number;
  id_area_condicionamento?: number;
  periodicidade: string;
  dt_inicio?: string; // ISO date string
  dt_termino?: string; // ISO date string
  duracao?: number;
  dt_limite?: string; // ISO date string
  id_email?: number;
}

export interface UpdateObrigacaoRequest {
  nm_tarefa?: string;
  tp_item?: TipoItem;
  tp_status?: StatusObrigacao;
  id_setor_atribuido?: number;
  id_area_condicionamento?: number;
  periodicidade?: string;
  dt_inicio?: string; // ISO date string
  dt_termino?: string; // ISO date string
  duracao?: number;
  dt_limite?: string; // ISO date string
  id_email?: number;
}

export interface VincularCorrespondenciasRequest {
  emails: number[];
}

// Response interfaces
export interface Responsavel {
  id_responsavel: number;
  nm_responsavel: string;
  email: string;
  tp_perfil: TipoPerfil;
}

export interface Setor {
  id_setor: number;
  nm_setor: string;
  id_responsavel: number;
}

export interface Email {
  id_email: number;
  cd_sei?: string;
  titulo: string;
  assunto: string;
  tp_status: StatusEmail;
  resposta?: string;
  prazo_resposta?: string;
  id_setor: number;
  id_responsavel: number;
  tp_email: string;
}

export interface Obrigacao {
  id_obrigacao: number;
  nm_tarefa: string;
  tp_item: TipoItem;
  tp_status: StatusObrigacao;
  id_setor_atribuido: number;
  id_area_condicionamento?: number;
  periodicidade: string;
  dt_inicio?: string;
  dt_termino?: string;
  duracao?: number;
  dt_limite?: string;
  id_email?: number;
}

export interface Correspondencia {
  id_email: number;
  assunto: string;
}

export interface SincronizacaoStatus {
  timestamp: string | null;
  count: number;
}

// Pagination interfaces
export interface PaginatedResponse<T> {
  page: number;
  total: number;
  items: T[];
}

export interface ListResponsaveisParams {
  perfil?: TipoPerfil;
  nome_like?: string;
  page?: number;
  size?: number;
}

export interface ListEmailsParams {
  status?: StatusEmail;
  responsavel?: number;
}

export interface ListObrigacoesParams {
  status?: StatusObrigacao;
  setor?: number;
}

export interface SEIInteressadoParams {
  nome: string;
  orgao?: number;
}

export interface SEIInteressadoResponse {
  interessados: string[];
}

// API Response wrappers
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export interface CreateResponse {
  id: number;
}

export interface MessageResponse {
  message: string;
}

export interface ProcessadosResponse {
  processados: number;
}