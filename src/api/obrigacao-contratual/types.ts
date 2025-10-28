import { Classificacao, Periodicidade, Criticidade, Natureza } from './enums';

export interface ObrigacaoContratual {
  idObrigacaoContratual: number;
  dtCriacao: string;
  dtAtualizacao?: string | null;
  nrCpfCriacao?: string | null;
  nrCpfAtualizacao?: string | null;
  idSolicitacao?: number | null;
  idStatusObrigacao: number;
  idTema?: number | null;
  idAreaAtribuida?: number | null;
  idAreaCondicionante?: number | null;
  cdIdentificador: string;
  dsTarefa: string;
  dsItem: string;
  tpClassificacao?: Classificacao | null;
  tpPeriodicidade?: Periodicidade | null;
  tpCriticidade?: Criticidade | null;
  tpNatureza?: Natureza | null;
  dsComentario?: string | null;
  dtInicio?: string | null;
  dtTermino?: string | null;
  dtLimite?: string | null;
  dtConclusao?: string | null;
  nrDuracaoDias?: number | null;
  dsAntt?: string | null;
  dsPas?: string | null;
  dsTac?: string | null;
  nrNivel: number;
  flAtivo: string;
}

export type ObrigacaoContratualResponse = ObrigacaoContratual;

export interface ObrigacaoContratualRequest {
  idSolicitacao?: number | null;
  idStatusObrigacao?: number;
  idTema?: number | null;
  idAreaAtribuida?: number | null;
  idAreaCondicionante?: number | null;
  cdIdentificador: string;
  dsTarefa: string;
  dsItem: string;
  tpClassificacao?: Classificacao | null;
  tpPeriodicidade?: Periodicidade | null;
  tpCriticidade?: Criticidade | null;
  tpNatureza?: Natureza | null;
  dsComentario?: string | null;
  dtInicio?: string | null;
  dtTermino?: string | null;
  dtLimite?: string | null;
  dtConclusao?: string | null;
  nrDuracaoDias?: number | null;
  dsAntt?: string | null;
  dsPas?: string | null;
  dsTac?: string | null;
  nrNivel?: number;
  flAtivo?: string;
}

