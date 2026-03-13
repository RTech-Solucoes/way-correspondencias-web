export interface StatusSolicPrazoTemaRequest {
  IdStatusSolicitacao: number;
  nrPrazoInterno: number;
}

export interface StatusSolicPrazoTemaResponse {
  idStatusSolicPrazoTema: number;
  statusCodigo: number;
  idTema: number;
  nrPrazoInterno: number;
  nrPrazoExterno: number;
  dtCriacao: string;
  dtAtualizacao?: string;
  nrCpfCriacao: string;
  nrCpfAtualizacao?: string;
  flAtivo: string;
}

export interface StatusSolicitacaoPrazoTema {
  id: number;
  idTema: number;
  idStatusSolicitacao: number;
  nrPrazoInterno?: number;
  tpPrazo?: string;
  flExcepcional?: string;
  dtCriacao: string;
  dtAtualizacao?: string;
}

export interface StatusSolicPrazoTemaForUI {
  idStatusSolicPrazoTema: number;
  idStatusSolicitacao: number;
  idTema?: number | null;
  nrPrazoInterno: number;
  nrPrazoExterno: number;
  flAtivo: string;
  tema?: { idTema: number; nmTema: string };
}

export interface StatusPrazoPadraoResponse {
  idStatusSolicPrazoTema: number;
  statusCodigo: {
    idStatusSolicitacao: number;
    nmStatus: string;
    dsStatus: string;
    dtCriacao: string;
    dtAtualizacao?: string;
    nrCpfCriacao: string;
    nrCpfAtualizacao?: string;
    flAtivo: string;
  };
  nrPrazoInterno: number;
  tema: {
    idTema: number;
    nmTema: string;
    dsTema: string;
    nrPrazo: number;
    nrPrazoExterno: number;
    tpPrazo: string;
    flAtivo: string;
    areas: Array<{
      idArea: number;
      cdArea: string;
      nmArea: string;
      dsArea: string;
      flAtivo: string;
    }>;
  };
  dtCriacao: string;
  dtAtualizacao?: string;
  nrCpfCriacao: string;
  nrCpfAtualizacao?: string;
  flAtivo: string;
}
