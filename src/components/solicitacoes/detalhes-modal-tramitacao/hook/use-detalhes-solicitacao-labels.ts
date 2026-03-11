'use client';

import { useMemo } from 'react';
import { statusList } from '@/api/status-solicitacao/types';

export type UseDetalhesSolicitacaoLabelsProps = {
  idStatusSolicitacao?: number;
  idProximoStatusAnaliseRegulatoria: number | null;
  isAnaliseRegulatoriaAprovarDevolutiva: boolean;
  isDiretoria: boolean;
  devolutivaReprovadaUmavezDiretoria?: boolean;
  devolutivaReprovadaPelaDiretoriaSegundaVez: boolean;
  flAprovado: 'S' | 'N' | '';
  isExisteCienciaGerenteRegul: boolean;
};

export function useDetalhesSolicitacaoLabels({
  idStatusSolicitacao,
  idProximoStatusAnaliseRegulatoria,
  isAnaliseRegulatoriaAprovarDevolutiva,
  isDiretoria,
  devolutivaReprovadaUmavezDiretoria,
  devolutivaReprovadaPelaDiretoriaSegundaVez,
  flAprovado,
  isExisteCienciaGerenteRegul,
}: UseDetalhesSolicitacaoLabelsProps) {
  // Label para textarea em Análise Regulatória
  const labelStatusAnaliseRegulatoria = useMemo(() => {
    if (idProximoStatusAnaliseRegulatoria === statusList.EM_APROVACAO.id) {
      return 'Enviar Minuta de Resposta para aprovação';
    }
    if (idProximoStatusAnaliseRegulatoria === statusList.EM_CHANCELA.id) {
      return 'Escrever resposta ao Gerente do Regulatório';
    }

    return 'Enviar devolutiva';
  }, [idProximoStatusAnaliseRegulatoria]);

  // Label do botão em Análise Regulatória
  const btnLabelStatusAnaliseRegulatoria = useMemo(() => {
    if (isAnaliseRegulatoriaAprovarDevolutiva && flAprovado === 'S') {
      return 'Encaminhar para os Gerentes das Áreas';
    }
    if (isAnaliseRegulatoriaAprovarDevolutiva && flAprovado === 'N') {
      return 'Encaminhar para Área Técnica';
    }
    if (idProximoStatusAnaliseRegulatoria === statusList.EM_CHANCELA.id) {
      return 'Encaminhar para o Gerente do Regulatório';
    }
    return 'Enviar Resposta';
  }, [isAnaliseRegulatoriaAprovarDevolutiva, flAprovado, idProximoStatusAnaliseRegulatoria]);

  // Label do botão em Assinatura Diretoria
  const btnStatusEmAssinaturaDiretoria = useMemo(() => {
    if (isDiretoria && flAprovado === 'S') {
      return 'Aprovar Solicitação';
    }
    if (devolutivaReprovadaUmavezDiretoria && flAprovado === 'N') {
      return 'Encaminhar para o Regulatório';
    }
    return 'Encaminhar Parecer para Gerente da Área';
  }, [isDiretoria, flAprovado, devolutivaReprovadaUmavezDiretoria]);

  // Label do flag em Diretoria
  const labelFragEmDiretoria = useMemo(() => {
    if (isDiretoria && !devolutivaReprovadaUmavezDiretoria) {
      return 'Aprovar Minuta de Resposta?';
    }
    if (devolutivaReprovadaUmavezDiretoria && !devolutivaReprovadaPelaDiretoriaSegundaVez) {
      return 'Em acordo com o Parecer do Gerente da Área?';
    }
    return 'Aprovar Minuta de Resposta?';
  }, [isDiretoria, devolutivaReprovadaUmavezDiretoria, devolutivaReprovadaPelaDiretoriaSegundaVez]);

  // Label do botão em Aprovação
  const btnTextareaEmAprovacao = useMemo(() => {
    if (devolutivaReprovadaUmavezDiretoria && flAprovado === 'N') {
      return 'Encaminhar parecer para Diretoria';
    }
    return 'Encaminhar parecer para o Regulatório';
  }, [devolutivaReprovadaUmavezDiretoria, flAprovado]);

  // Label do botão para Gerente do Sistema
  const btnEncaminharParaGestorSistema = useMemo(() => {
    if (flAprovado === 'N' && isExisteCienciaGerenteRegul) {
      return 'Encaminhar para Analista do Regulatório';
    }
    return 'Encaminhar para Área Técnica';
  }, [flAprovado, isExisteCienciaGerenteRegul]);

  // Label do flag em Aprovação
  const labelFragEmAprovacao = useMemo(() => {
    if (devolutivaReprovadaUmavezDiretoria) {
      return 'Em acordo com o Parecer da Diretoria?';
    }
    return 'Aprovar devolutiva?';
  }, [devolutivaReprovadaUmavezDiretoria]);

  // Label do flag em Análise Regulatória
  const labelFragAnaliseRegulatoria = isAnaliseRegulatoriaAprovarDevolutiva
    ? 'Aprovar devolutiva da(s) Área(s)'
    : '';

  // Mapa de labels para textarea
  const labelTextareaDevolutiva = useMemo(() => ({
    [statusList.ANALISE_REGULATORIA.id]: labelStatusAnaliseRegulatoria,
    [statusList.VENCIDO_REGULATORIO.id]: labelStatusAnaliseRegulatoria,
    [statusList.EM_APROVACAO.id]: 'Escrever parecer',
    [statusList.EM_CHANCELA.id]: 'Escrever resposta à Diretoria',
    [statusList.EM_ASSINATURA_DIRETORIA.id]: 'Escrever Parecer',
    [statusList.CONCLUIDO.id]: 'Informações do arquivamento',
    [statusList.EM_ANALISE_GERENTE_REGULATORIO.id]: 'Parecer do Gerente do Regulatório',
    default: 'Enviar devolutiva ao Regulatório'
  }), [labelStatusAnaliseRegulatoria]);

  // Mapa de labels para botão de enviar
  const btnEnviarDevolutiva = useMemo(() => ({
    [statusList.EM_CHANCELA.id]: 'Enviar para assinatura da Diretoria',
    [statusList.EM_APROVACAO.id]: btnTextareaEmAprovacao,
    [statusList.ANALISE_REGULATORIA.id]: btnLabelStatusAnaliseRegulatoria,
    [statusList.VENCIDO_REGULATORIO.id]: btnLabelStatusAnaliseRegulatoria,
    [statusList.EM_ASSINATURA_DIRETORIA.id]: flAprovado !== '' ? btnStatusEmAssinaturaDiretoria : 'Aprovar Solicitação',
    [statusList.CONCLUIDO.id]: 'Arquivar Solicitação',
    [statusList.EM_ANALISE_GERENTE_REGULATORIO.id]: btnEncaminharParaGestorSistema,
    default: 'Enviar Resposta'
  }), [btnTextareaEmAprovacao, btnLabelStatusAnaliseRegulatoria, btnStatusEmAssinaturaDiretoria, btnEncaminharParaGestorSistema, flAprovado]);

  // Mapa de labels para flag
  const textlabelFlag = useMemo(() => ({
    [statusList.ANALISE_REGULATORIA.id]: labelFragAnaliseRegulatoria,
    [statusList.VENCIDO_REGULATORIO.id]: labelFragAnaliseRegulatoria,
    [statusList.EM_ASSINATURA_DIRETORIA.id]: labelFragEmDiretoria,
    [statusList.EM_APROVACAO.id]: labelFragEmAprovacao,
    [statusList.CONCLUIDO.id]: 'Incluir Protocolo do orgão regulador ?',
    [statusList.EM_ANALISE_GERENTE_REGULATORIO.id]: 'Aprovar Solicitação?',
    default: 'Aprovar devolutiva?'
  }), [labelFragAnaliseRegulatoria, labelFragEmDiretoria, labelFragEmAprovacao]);

  // Labels finais computados
  const labelStatusTextarea = labelTextareaDevolutiva[idStatusSolicitacao as keyof typeof labelTextareaDevolutiva]
    ?? labelTextareaDevolutiva.default;

  const btnEnviarDevolutivaLabel = btnEnviarDevolutiva[idStatusSolicitacao as keyof typeof btnEnviarDevolutiva]
    ?? btnEnviarDevolutiva.default;

  const labelFlAprovacao = textlabelFlag[idStatusSolicitacao as keyof typeof textlabelFlag]
    ?? textlabelFlag.default;

  return {
    labelStatusTextarea,
    btnEnviarDevolutivaLabel,
    labelFlAprovacao,
  };
}
