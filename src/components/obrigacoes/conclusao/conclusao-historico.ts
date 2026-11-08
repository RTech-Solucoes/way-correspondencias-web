import type { ObrigacaoConclusaoResponse } from '@/api/obrigacao/types';
import { formatDateBr } from '@/utils/utils';

export const TITULO_CONCLUSAO_HISTORICO = 'Conclusão administrativa';

export interface DetalheConclusaoHistorico {
  rotulo: string;
  valor: string;
}

/** Frase principal do registro da conclusão administrativa no histórico da obrigação. */
export function getResumoConclusaoHistorico(conclusao: ObrigacaoConclusaoResponse): string {
  const classificacao = conclusao.concluidaEmAtraso ? 'Concluída em atraso' : 'Concluída';
  return `Conclusão registrada pelo fluxo administrativo, sem tramitação pelas áreas. Data efetiva: ${formatDateBr(conclusao.dtConclusao)} (${classificacao}).`;
}

/** Demais dados da conclusão; campos não informados ficam de fora. */
export function getDetalhesConclusaoHistorico(conclusao: ObrigacaoConclusaoResponse): DetalheConclusaoHistorico[] {
  const detalhes: Array<{ rotulo: string; valor?: string | null }> = [
    { rotulo: 'Data limite original', valor: conclusao.dtLimiteOriginal ? formatDateBr(conclusao.dtLimiteOriginal) : null },
    { rotulo: 'Status anterior', valor: conclusao.nmStatusAnterior },
    { rotulo: 'Nº do Processo', valor: conclusao.nrProcesso },
    { rotulo: 'Nº do SEI', valor: conclusao.nrSei },
    { rotulo: 'Observações', valor: conclusao.dsObservacao },
  ];

  return detalhes.flatMap(({ rotulo, valor }) => (valor ? [{ rotulo, valor }] : []));
}
