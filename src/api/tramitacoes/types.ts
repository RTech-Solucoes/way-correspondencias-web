import { ArquivoDTO } from "../anexos/type";

interface Email {
  idEmail: number;
  dsRemetente: string;
  dsDestinatario: string;
  dsAssunto: string;
  dsCorpo: string;
  dtRecebimento: string;
  flAtivo: string;
}

interface Tema {
  idTema: number;
  nmTema: string;
  dsTema?: string;
  nrPrazo?: number;
  nrPrazoExterno?: number;
  tpPrazo?: string;
  flAtivo: string;
  areas: Area[];
}

interface StatusSolicitacao {
  idStatusSolicitacao: number;
  nmStatus: string;
  dsStatus?: string;
  dtCriacao: string;
  dtAtualizacao?: string;
  nrCpfCriacao?: string;
  nrCpfAtualizacao?: string;
  flAtivo: string;
}

interface Area {
  idArea: number;
  cdArea: string;
  nmArea: string;
  dsArea: string;
  flAtivo: string;
}

interface Responsavel {
  idResponsavel: number;
  idPerfil: number;
  nmPerfil: string;
  nmUsuarioLogin: string;
  nmResponsavel: string;
  dsEmail: string;
  nrCpf: string;
  dtNascimento: string;
  flAtivo: string;
  areas?: Area[];
}

interface ResponsavelArea {
  idResponsavelArea: number;
  responsavel: Responsavel;
  area: Area;
}

interface Solicitacao {
  idSolicitacao: number;
  email: Email;
  tema: Tema;
  statusSolicitacao: StatusSolicitacao;
  cdIdentificacao: string;
  dsAssunto: string;
  dsSolicitacao: string;
  dsObservacao: string;
  nrPrazo?: number;
  nrOficio: string;
  nrProcesso: string;
  tpPrazo: string;
  dtCriacao: string;
  dtAtualizacao: string;
  nrCpfCriacao?: string;
  nrCpfAtualizacao?: string;
  flAtivo: string;
  area?: Area;
}

export interface TramitacaoAcao {
  idTramitacaoAcao: number;
  tramitacao: TramitacaoResponse;
  responsavelArea: ResponsavelArea;
  flAcao: string;
  dtCriacao: string;
  dtAtualizacao?: string;
  nrCpfCriacao?: string;
  nrCpfAtualizacao?: string;
  flAtivo: string;
}

export interface TramitacaoResponse {
  idTramitacao: number;
  nrNivel?: number;
  solicitacao: Solicitacao;
  areaOrigem: Area;
  areaDestino: Area;
  tramitacaoAcao: TramitacaoAcao[] | null;
  flAtivo: string;
  dsObservacao?: string;
  flAprovado?: string;
}

export interface TramitacaoRequest {
  idSolicitacao: number;
  idAreaOrigem?: number;
  idAreaDestino?: number;
  dsObservacao?: string;
  idResponsavel?: number;
  flAcao?: string;
  arquivos?: ArquivoDTO[];
  flAprovado?: 'S' | 'N';
}

export interface ProximoStatusRequest {
  idSolicitacao: number;
  idStatusSolicitacao: number;
}
