import { AreaSolicitacao, SolicitacaoAssinanteResponse, SolicitacaoPrazoResponse, SolicitacaoResponse, TramitacaoComAnexosResponse } from '../solicitacoes/types';
import { TipoResponse } from '../tipos/types';
import { TemaResponse } from '../temas/types';
import { StatusSolicitacaoResponse } from '../status-solicitacao/client';
import { ArquivoDTO, AnexoResponse } from '../anexos/type';
import { SolicitacaoParecerResponse } from '../solicitacao-parecer/types';
import { ResponsavelResponse } from '../responsaveis/types';
import { CorrespondenciaResumoResponse } from '../correspondencia/types';
import { perfilUtil } from '../perfis/types';

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
  correspondencia?: CorrespondenciaResumoResponse | null;
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
  /** Só vem preenchido quando a obrigação foi concluída pelo fluxo administrativo. */
  concluidaEmAtraso?: boolean | null;
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
  tramitacoes: TramitacaoComAnexosResponse[];
  solicitacoesAssinantes?: SolicitacaoAssinanteResponse[];
  solicitacaoPrazos?: SolicitacaoPrazoResponse[];
  /** Registro de auditoria da conclusão administrativa, quando houver. */
  conclusao?: ObrigacaoConclusaoResponse | null;
}

/** Arquivo enviado na conclusão administrativa (conteúdo em Base64). */
export interface ArquivoConclusaoRequest {
  nomeArquivo: string;
  tipoConteudo?: string | null;
  conteudoArquivo: string;
}

/** Conclusão de obrigação pelo Administrador, sem tramitação pelas áreas. Só o protocolo é obrigatório. */
export interface ConclusaoAdministrativaRequest {
  /** Data efetiva da conclusão (yyyy-MM-dd). */
  dtConclusao: string;
  protocolos: ArquivoConclusaoRequest[];
  evidencias?: ArquivoConclusaoRequest[];
  correspondencias?: ArquivoConclusaoRequest[];
  outrosAnexos?: ArquivoConclusaoRequest[];
  dsObservacao?: string | null;
  nrProcesso?: string | null;
  nrSei?: string | null;
}

/** Log de auditoria da conclusão de uma obrigação. */
export interface ObrigacaoConclusaoResponse {
  idObrigacaoConclusao: number;
  idObrigacao: number;
  tpFluxoConclusao: string;
  dsFluxoConclusao: string;
  dtConclusao: string;
  dtLimiteOriginal?: string | null;
  dtAcao: string;
  concluidaEmAtraso: boolean;
  idResponsavel?: number | null;
  nmResponsavel?: string | null;
  idStatusAnterior?: number | null;
  nmStatusAnterior?: string | null;
  nrProcesso?: string | null;
  nrSei?: string | null;
  dsObservacao?: string | null;
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
  dtTerminoInicio?:  string | null;
  dtTerminoFim?:  string | null;

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
  flExigeCienciaGerenteRegul: string;
  dsObservacao?: string;
  flAnaliseGerenteDiretor: string;
}

export const PERFIS_FILTRO_DEFAULT_DATA_LIMITE = [
  perfilUtil.ADMINISTRADOR,
  perfilUtil.SUPER_ADMIN,
  perfilUtil.GESTOR_DO_SISTEMA,
  perfilUtil.VALIDADOR_ASSINANTE,
];

/** Retorno do endpoint de importação de obrigações por planilha. */
export interface ImportacaoObrigacaoResultado {
  mensagem: string;
  obrigacoesImportadas: number;
  ocorrenciasGeradas?: number;
  /** Linhas descartadas por não terem conteúdo aproveitável (só formatação, espaços ou placeholders). */
  linhasIgnoradas?: number;
}
