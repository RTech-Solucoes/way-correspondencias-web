export interface StatusSolicPrazoTemaRequest {
  nrPrazoInterno: number;
}

export interface StatusSolicPrazoTemaResponse {
  idStatusSolicPrazoTema: number;
  statusCodigo: number;
  tema: {
    idTema: number;
    nmTema: string;
  };
  nrPrazoInterno: number;
  flAtivo: string;
}

export interface StatusOption {
  codigo: number;
  nome: string;
  descricao: string;
}
