import { ClassificacaoEnum, PeriodicidadeEnum, CriticidadeEnum, NaturezaEnum } from './enums';

export interface ObrigacaoContratual {
  idObrigacaoContratual: number;
  idObrigacaoContratualVinculo?: number | null;
  idObrigacaoContratualPai?: number | null;
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
  tpClassificacao?: ClassificacaoEnum | null;
  tpPeriodicidade?: PeriodicidadeEnum | null;
  tpCriticidade?: CriticidadeEnum | null;
  tpNatureza?: NaturezaEnum | null;
  dsComentario?: string | null;
  dtInicio?: string | null;
  dtTermino?: string | null;
  dtLimite?: string | null;
  dtConclusao?: string | null;
  nrDuracaoDias?: number | null;
  dsAntt?: string | null;
  dsProtocoloExterno?: string | null;
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
  idsAreasCondicionantes?: number[]; 
  idObrigacaoContratualPai?: number | null; 
  idObrigacaoContratualVinculo?: number | null; 
  cdIdentificador: string;
  dsTarefa: string;
  tpClassificacao?: ClassificacaoEnum | null;
  tpPeriodicidade?: PeriodicidadeEnum | null;
  tpCriticidade?: CriticidadeEnum | null;
  tpNatureza?: NaturezaEnum | null;
  dsObservacao?: string | null;
  dtInicio?: string | null;
  dtTermino?: string | null;
  dtLimite?: string | null;
  dtConclusao?: string | null;
  nrDuracaoDias?: number | null;
  dsAntt?: string;
  dsProtocoloExterno?: string | null;
  dsTac?: string | null;
  nrNivel?: number;
  flAtivo?: string;
}

export interface ObrigacaoBuscaSimpleResponse {
  idObrigacaoContratual: number;
  cdIdentificador: string;
}