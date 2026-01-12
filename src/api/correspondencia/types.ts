import { SolicitacaoResponse } from '../solicitacoes/types';

export interface CorrespondenciaResponse extends SolicitacaoResponse {
  idCorrespondencia: number;
}