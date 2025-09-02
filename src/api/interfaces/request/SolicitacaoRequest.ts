export interface SolicitacaoRequest {
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
}
