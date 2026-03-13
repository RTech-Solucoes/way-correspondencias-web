import { ArquivoDTO } from '../anexos/type';
import { AreaResponse } from '../areas/types';
import { EmailResponse } from '../email/types';
import { ResponsavelResponse } from '../responsaveis/types';
import { SolicitacaoAssinanteItemRequest, SolicitacaoDetalheResponse, SolicitacaoPrazoItemRequest, SolicitacaoResponse } from '../solicitacoes/types';

export interface CorrespondenciaResponse extends SolicitacaoResponse {
  email: EmailResponse;
  dsAssunto: string;
  dsSolicitacao: string;
  nrPrazoExterno: number;
  nrOficio: string;
  dtPrazoLimite: string;
  dtPrimeiraTramitacao: string;
}

export interface CorrespondenciaDetalheResponse extends Omit<SolicitacaoDetalheResponse, 'solicitacao'> {
  correspondencia: CorrespondenciaResponse;
}

export interface CorrespondenciaFilterParams {
  filtro?: string;
  idSolicitacao?: number;
  idStatusSolicitacao?: number;
  idArea?: number;
  cdIdentificacao?: string;
  idTema?: number;
  nmResponsavel?: string;
  dtCriacaoInicio?: string;
  dtCriacaoFim?: string;
  flExigeCienciaGerenteRegul?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface CorrespondenciaTemaEtapaRequest {
  idTema: number;
  tpPrazo?: string;
  nrPrazoInterno?: number;
  nrPrazoExterno?: number;
  flExcepcional?: string;
  idsAreas?: number[];
}

export interface CorrespondenciaIdentificacaoRequest {
  cdIdentificacao?: string;
  dsAssunto?: string;
  dsObservacao?: string;
  nrOficio?: string;
  nrProcesso?: string;
  flAnaliseGerenteDiretor?: string;
  flExigeCienciaGerenteRegul?: string;
}

export interface CorrespondenciaRequest {
  idEmail?: number;
  idTema?: number;
  idResponsavel?: number;
  idStatusSolicitacao?: number;
  statusCodigo?: number;
  flStatus?: string;
  cdIdentificacao?: string;
  dsAssunto?: string;
  dsSolicitacao?: string;
  dsObservacao?: string;
  nrPrazo?: number;
  nrOficio?: string;
  nrProcesso?: string;
  tpPrazo?: string;
  idsAreas?: number[];
  flExcepcional?: string;
  flAnaliseGerenteDiretor?: string;
  idsResponsaveisAssinates?: number[];
  solicitacoesAssinantes?: SolicitacaoAssinanteItemRequest[];
  flExigeCienciaGerenteRegul?: string;
  flAprovacaoGerenteRegul?: string;
  dsObservacaoGerenteRegul?: string;
  solicitacoesPrazos?: SolicitacaoPrazoItemRequest[];
  arquivos?: ArquivoDTO[];
}

export enum TipoHistoricoResposta {
  TRAMITACAO = 'TRAMITACAO',
  PARECER = 'PARECER'
}

export interface HistoricoRespostaItemResponse {
  tipo: TipoHistoricoResposta;
  id: number;
  dsDescricao: string;
  nmStatus: string;
  dtCriacao: string;
  responsavel: ResponsavelResponse;
  areaOrigem: AreaResponse;
  areaDestino: AreaResponse;
  nrTempoGasto: number;
  flAprovado: string | null;
}

export interface CorrespondenciaResumoResponse {
  idSolicitacao: number;
  cdIdentificacao: string;
  nmTema: string;
  nmAreas: string;
  nmStatus: string;
  dsAssunto: string;
  dtCriacao: string;
  dtPrimeiraTramitacao: string;
  dtPrazoLimite: string;
  dtConclusaoTramitacao: string;
}

export interface CorrespondenciaResumoComHistoricoResponse {
  correspondencia: CorrespondenciaResumoResponse;
  historicoResposta: HistoricoRespostaItemResponse[];
}

