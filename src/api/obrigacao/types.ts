import { BaseResponse, AreaSolicitacao } from '../solicitacoes/types';
import { TipoResponse } from '../tipos/types';
import { TemaResponse } from '../temas/types';
import { StatusSolicitacaoResponse } from '../status-solicitacao/client';
import { SolicitacaoResumoResponse } from '@/types/solicitacoes/types';
import { ArquivoDTO, AnexoResponse } from '../anexos/type';

export interface ObrigacaoResumoResponse {
  idSolicitacao: number;
  cdIdentificacao: string;
  dsTarefa: string;
  dtInicio?: string | null; 
  dtTermino?: string | null; 
  dtLimite?: string | null; 
  statusSolicitacao: StatusSolicitacaoResponse;
}

export interface ObrigacaoResponse extends BaseResponse {
  idSolicitacao: number;
  cdIdentificacao: string;
  dsObservacao?: string | null;
  tema?: TemaResponse | null;
  statusSolicitacao: StatusSolicitacaoResponse;
  areas?: AreaSolicitacao[];
  
  dsTarefa: string;
  dtInicio?: string | null;
  dtTermino?: string | null;
  dtLimite?: string | null;
  dtConclusao?: string | null;
  nrDuracaoDias?: number | null;
  dsAntt?: string | null;
  dsProtocoloExterno?: string | null;
  dsTac?: string | null;
  
  tipoClassificacao?: TipoResponse | null;
  tipoPeriodicidade?: TipoResponse | null;
  tipoCriticidade?: TipoResponse | null;
  tipoNatureza?: TipoResponse | null;
  
  obrigacaoPrincipal?: ObrigacaoResumoResponse | null;
  obrigacaoRecusada?: ObrigacaoResumoResponse | null;
  correspondencia?: SolicitacaoResumoResponse | null;
}

export interface ObrigacaoRequest {
  idSolicitacao?: number | null;
  dsTarefa: string;
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
}

export interface ObrigacaoDetalheResponse {
  obrigacao: ObrigacaoResponse;
  anexos: AnexoResponse[];
}