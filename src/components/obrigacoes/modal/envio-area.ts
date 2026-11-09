import { statusList } from '@/api/status-solicitacao/types';

/** Explica, antes do envio, o que acontece com o status da obrigação. */
export function getAvisoStatusEnvioArea(idStatus?: number | null, nmStatus?: string | null): string {
  if (idStatus === statusList.ATRASADA.id) {
    return 'Esta obrigação está com status Atrasada. O status permanecerá Atrasada e a obrigação será apenas marcada como Enviada para área.';
  }
  if (idStatus === statusList.NAO_INICIADO.id || idStatus === statusList.PENDENTE.id) {
    const statusAtual = idStatus === statusList.NAO_INICIADO.id ? statusList.NAO_INICIADO.label : statusList.PENDENTE.label;
    return `O status da obrigação será alterado de ${statusAtual} para ${statusList.EM_ANDAMENTO.label}.`;
  }
  const statusAtual = nmStatus ? ` (${nmStatus})` : '';
  return `O status atual${statusAtual} será mantido e a obrigação será apenas marcada como Enviada para área.`;
}

/** Mensagem de sucesso conforme o status antes e depois do envio. */
export function getMensagemSucessoEnvioArea(idStatusAnterior?: number | null, idStatusFinal?: number | null): string {
  if (idStatusFinal === statusList.ATRASADA.id) {
    return 'Obrigação enviada para a área. O status permanece Atrasada.';
  }
  if (idStatusFinal === statusList.EM_ANDAMENTO.id && idStatusAnterior !== statusList.EM_ANDAMENTO.id) {
    return 'Obrigação enviada para a área. Status alterado para Em andamento.';
  }
  return 'Obrigação enviada para a área com sucesso.';
}
