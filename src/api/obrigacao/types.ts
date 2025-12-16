import { AreaSolicitacao, SolicitacaoAssinanteResponse, SolicitacaoPrazoResponse, SolicitacaoResponse } from '../solicitacoes/types';
import { TipoResponse } from '../tipos/types';
import { TemaResponse } from '../temas/types';
import { StatusSolicitacaoResponse } from '../status-solicitacao/client';
import { SolicitacaoResumoResponse } from '@/types/solicitacoes/types';
import { ArquivoDTO, AnexoResponse } from '../anexos/type';
import { SolicitacaoParecerResponse } from '../solicitacao-parecer/types';
import { TramitacaoResponse } from '../tramitacoes/types';
import { ResponsavelResponse } from '../responsaveis/types';

export interface ObrigacaoResumoResponse {
  idSolicitacao: number;
  cdIdentificacao: string;
  dsTarefa: string;
  dtInicio?: string | null; 
  dtTermino?: string | null; 
  dtLimite?: string | null; 
  statusSolicitacao: StatusSolicitacaoResponse;
}

export interface ObrigacaoResponse extends Omit<SolicitacaoResponse, 'tema'> {
  idSolicitacao: number;
  cdIdentificacao: string;
  tema?: TemaResponse | null;
  statusSolicitacao: StatusSolicitacaoResponse;
  areas?: AreaSolicitacao[];
  
  dsTarefa: string;
  dtInicio?: string | null;
  dtTermino?: string | null;
  dtLimite?: string | null;
  nrDuracaoDias?: number | null;
  dsAntt?: string | null;
  dsProtocoloExterno?: string | null;
  dsTac?: string | null;
  
  idObrigacaoReplicada?: number | null;
  flImportadaExcel?: string | null;
  flEnviandoArea?: string | null;
  
  tipoClassificacao?: TipoResponse | null;
  tipoPeriodicidade?: TipoResponse | null;
  tipoCriticidade?: TipoResponse | null;
  tipoNatureza?: TipoResponse | null;
  responsavelTecnico?: ResponsavelResponse | null;
  flAprovarConferencia?: string | null;
  obrigacaoPrincipal?: ObrigacaoResumoResponse | null;
  obrigacaoRecusada?: ObrigacaoResumoResponse | null;
  correspondencia?: SolicitacaoResumoResponse | null;
  solicitacaoParecer? : SolicitacaoParecerResponse[];
  responsavelJustifAtraso?: ResponsavelResponse | null;
  dsJustificativaAtraso?: string | null;
  dtJustificativaAtraso?: string | null;
  nrSei?: string | null;
  dsObservacaoProtocolo?: string | null;
  dtRespNaoAplicavelSusp?: string | null;
  dsRespNaoAplicavelSusp?: string | null;
  responsavelNaoAplicavelSusp?: ResponsavelResponse | null;
  solicitacaoPrazos: SolicitacaoPrazoResponse[];
  solicitacoesAssinantes: SolicitacaoAssinanteResponse[];
}

export interface ObrigacaoRequest {
  idSolicitacao?: number | null;
  dsTarefa?: string | null;
  idStatusSolicitacao?: number | null;
  idTipoClassificacao?: number | null;
  idTipoPeriodicidade?: number | null;
  idTipoCriticidade?: number | null;
  idTipoNatureza?: number | null;
  dsObservacao?: string | null;
  idObrigacaoPrincipal?: number | null;
  idsAreasCondicionantes?: number[];
  idAreaAtribuida?: number | null;
  idTema?: number | null;
  dtInicio?: string | null;
  dtTermino?: string | null;
  dtLimite?: string | null;
  nrDuracaoDias?: number | null;
  idSolicitacaoCorrespondencia?: number | null;
  dsAntt?: string | null;
  dsProtocoloExterno?: string | null;
  idObrigacaoRecusada?: number | null;
  dsTac?: string | null;
  arquivos?: ArquivoDTO[];
  idResponsavelTecnico?: number | null;
  flAprovarConferencia?: string | null;
  idResponsavelJustifAtraso?: number | null;
  dsJustificativaAtraso?: string | null;
  dtJustificativaAtraso?: string | null;
  nrSei?: string | null;
  nrProcesso?: string | null;
  dsObservacaoProtocolo?: string | null;
  dtRespNaoAplicavelSusp?: string | null;
  dsRespNaoAplicavelSusp?: string | null;
  responsavelNaoAplicavelSusp?: ResponsavelResponse | null;
}

export interface ObrigacaoDetalheResponse {
  obrigacao: ObrigacaoResponse;
  anexos: AnexoResponse[];
  solicitacaoParecer: SolicitacaoParecerResponse[];
  tramitacoes: TramitacaoResponse[];
  solicitacoesAssinantes?: SolicitacaoAssinanteResponse[];
  solicitacaoPrazos?: SolicitacaoPrazoResponse[];
}

export interface ObrigacaoFiltroRequest {
  filtro?: string | null;
  idSolicitacao?: number | null;
  idObrigacao?: number | null;
  idStatusSolicitacao?: number | null;
  idAreaAtribuida?: number | null;
  dtLimiteInicio?: string | null;
  dtLimiteFim?: string | null;
  dtInicioInicio?: string | null;
  dtInicioFim?: string | null;
  idTema?: number | null;
  idTipoClassificacao?: number | null;
  idTipoPeriodicidade?: number | null;
  page?: number;
  size?: number;
  sort?: string;
}

export interface ObrigacoesRelacionadasResponse {
  obrigacoesCondicionadas: ObrigacaoResumoResponse[];
}

export interface LinkAnexoRequest {
  dsCaminho: string;
  tpResponsavel: string;
}

export interface ObrigacaoProtocoloRequest {
  nrProcesso?: string | null;
  nrSei?: string | null;
  dsObservacaoProtocolo?: string | null;
}

export interface ObrigacaoCalendarioResponse {
  idObrigacao: number;
  cdIdentificacao: string;
  dtLimite: string;
}

export interface ObrigacaoCalendarioMesCountResponse {
  mes: number;
  quantidade: number;
}

export interface ObrigacaoStep1Request {
  dsTarefa: string;
  flAnaliseGerenteDiretor: string;
  flExigeCienciaGerenteRegul: string;
  dsObservacao?: string;
}