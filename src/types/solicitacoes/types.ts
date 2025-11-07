
export enum AnaliseGerenteDiretor {
  D = 'D', // Diretor
  G = 'G', // Gerente
  A = 'A', // Ambos
  N = 'N'  // Não Necessita
}

export interface SolicitacaoResumoResponse {
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

export const getTipoAprovacaoLabel = (tipoAnalise?: string) => {
  switch (tipoAnalise) {
    case AnaliseGerenteDiretor.G:
      return 'Gerente';
    case AnaliseGerenteDiretor.D:
      return 'Diretor';
    case AnaliseGerenteDiretor.A:
      return 'Ambos';
    case AnaliseGerenteDiretor.N:
      return 'Não Necessita';
    default:
      return '—';
  }
};