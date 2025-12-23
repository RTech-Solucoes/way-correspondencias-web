'use client';

import { useMemo } from 'react';
import { StatusSolicitacaoResponse } from '@/api/status-solicitacao/client';
import { statusListObrigacao, StatusObrigacao } from '@/api/status-obrigacao/types';
import { statusList } from '@/api/status-solicitacao/types';
import { TipoDocumentoAnexoEnum } from '@/api/anexos/type';
import { AnexoResponse } from '@/api/anexos/type';
import { TramitacaoComAnexosResponse } from '@/api/solicitacoes/types';

const ordenarTramitacoesPorData = (tramitacoes: TramitacaoComAnexosResponse[]): TramitacaoComAnexosResponse[] => {
  return [...tramitacoes].sort((a, b) => {
    const dataA = a.tramitacao.tramitacaoAcao?.[0]?.dtCriacao || 
                  a.tramitacao.solicitacao?.dtCriacao || 
                  '';
    const dataB = b.tramitacao.tramitacaoAcao?.[0]?.dtCriacao || 
                  b.tramitacao.solicitacao?.dtCriacao || 
                  '';
    if (!dataA && !dataB) return 0;
    if (!dataA) return 1;
    if (!dataB) return -1;
    return new Date(dataB).getTime() - new Date(dataA).getTime();
  });
};

interface UseFooterStatusParams {
  statusSolicitacao?: StatusSolicitacaoResponse | null;
  anexos?: AnexoResponse[];
  dsJustificativaAtraso?: string | null;
  flAprovarConferencia?: string | null;
  flExigeCienciaGerenteRegul?: string | null;
  isCienciaChecked?: boolean;
  tramitacoes?: TramitacaoComAnexosResponse[];
}

export function useFooterStatus({
  statusSolicitacao,
  anexos = [],
  dsJustificativaAtraso,
  flAprovarConferencia,
  flExigeCienciaGerenteRegul,
  isCienciaChecked = false,
  tramitacoes = [],
}: UseFooterStatusParams) {
  const idStatusSolicitacao = statusSolicitacao?.idStatusSolicitacao ?? 0;

  const isStatusEmValidacaoRegulatorio = useMemo(() => {
    return idStatusSolicitacao === statusListObrigacao.EM_VALIDACAO_REGULATORIO.id;
  }, [idStatusSolicitacao]);

  const isStatusAtrasada = useMemo(() => {
    return idStatusSolicitacao === statusListObrigacao.ATRASADA.id;
  }, [idStatusSolicitacao]);

  const isStatusEmAndamento = useMemo(() => {
    return idStatusSolicitacao === statusListObrigacao.EM_ANDAMENTO.id;
  }, [idStatusSolicitacao]);

  const isStatusPermitidoEnviarReg = useMemo(() => {
    return isStatusEmAndamento || isStatusAtrasada;
  }, [isStatusEmAndamento, isStatusAtrasada]);

  const isStatusEmAnaliseGerenteRegulatorio = useMemo(() => {
    return idStatusSolicitacao === statusList.EM_ANALISE_GERENTE_REGULATORIO.id;
  }, [idStatusSolicitacao]);

  const isStatusBtnFlAprovar = useMemo(() => {
    return (isStatusEmAnaliseGerenteRegulatorio && flExigeCienciaGerenteRegul === 'S') ||
      statusSolicitacao?.idStatusSolicitacao === statusList.EM_APROVACAO.id || 
      statusSolicitacao?.idStatusSolicitacao === statusList.EM_ASSINATURA_DIRETORIA.id;
  }, [isStatusEmAnaliseGerenteRegulatorio, flExigeCienciaGerenteRegul, statusSolicitacao?.idStatusSolicitacao]);

  const isStatusEmAnaliseRegulatoria = useMemo(() => {
    return idStatusSolicitacao === statusList.ANALISE_REGULATORIA.id;
  }, [idStatusSolicitacao]);

  const temEvidenciaCumprimento = useMemo(() => {
    return anexos.some(anexo => 
      anexo.tpDocumento === TipoDocumentoAnexoEnum.E || 
      anexo.tpDocumento === TipoDocumentoAnexoEnum.L
    );
  }, [anexos]);

  const temJustificativaAtraso = useMemo(() => {
    return !!dsJustificativaAtraso;
  }, [dsJustificativaAtraso]);

  const conferenciaAprovada = useMemo(() => {
    return flAprovarConferencia === 'S';
  }, [flAprovarConferencia]);

  const isUltimaTramitacaoEmAprovacaoFlAprovado = useMemo(() => {
    const ultimaTramitacao = tramitacoes?.find(t => t.tramitacao.idStatusSolicitacao === statusList.EM_APROVACAO.id);
    return ultimaTramitacao?.tramitacao.flAprovado === 'N';
  }, [tramitacoes]);

  const isUltimaTramitacaoEmAssinaturaDiretoriaFlAprovado = useMemo(() => {
    const tramitacoesAssinaturaDiretoria = tramitacoes?.filter(
      t => t.tramitacao.idStatusSolicitacao === statusList.EM_ASSINATURA_DIRETORIA.id
    ) || [];
    
    if (tramitacoesAssinaturaDiretoria.length === 0) {
      return false;
    }
    
    const tramitacoesOrdenadas = ordenarTramitacoesPorData(tramitacoesAssinaturaDiretoria);
    const ultimaTramitacao = tramitacoesOrdenadas[0];
    
    return ultimaTramitacao?.tramitacao.flAprovado === 'N';
  }, [tramitacoes]);
  
  const labelBtnStatusAnaliseRegulatoria = useMemo(() => {
    return idStatusSolicitacao !== statusList.ANALISE_REGULATORIA.id 
      ? '' 
      : isUltimaTramitacaoEmAprovacaoFlAprovado 
        ? 'Encaminhar para Gerente da Área' 
        : 'Enviar para Chancela';
  }, [idStatusSolicitacao, isUltimaTramitacaoEmAprovacaoFlAprovado]);

  const labelBtnStatusEmAprovacaoTramitacao = useMemo(() => {
    return isUltimaTramitacaoEmAssinaturaDiretoriaFlAprovado
      ? 'Encaminhar para Diretoria'
      : 'Encaminhar para Análise Regulatória';
  }, [isUltimaTramitacaoEmAssinaturaDiretoriaFlAprovado]);

  const textoBtnEnviarParaTramitacaoPorStatus = useMemo(() => {
    const textosPorStatus: Record<number, string> = {
      [statusList.PRE_ANALISE.id]: 'Encaminhar para Gerente do Regulatório',
      [statusList.EM_ANALISE_GERENTE_REGULATORIO.id]: 'Encaminhar para Gerente da Área',
      [statusList.EM_APROVACAO.id]: labelBtnStatusEmAprovacaoTramitacao,
      [statusList.ANALISE_REGULATORIA.id]: labelBtnStatusAnaliseRegulatoria,
      [statusList.EM_CHANCELA.id]: 'Encaminhar para Assinatura Diretoria',
      [statusListObrigacao[StatusObrigacao.APROVACAO_TRAMITACAO].id]: 'Anexe Protocolo para Conclusão',
      [statusListObrigacao[StatusObrigacao.CONCLUIDO].id]: 'Obrigação já concluída',
    };
    
    return textosPorStatus[idStatusSolicitacao] ?? 'Encaminhar para Tramitação';
  }, [idStatusSolicitacao, labelBtnStatusAnaliseRegulatoria, labelBtnStatusEmAprovacaoTramitacao]);

  return {
    idStatusSolicitacao,
    isStatusEmValidacaoRegulatorio,
    isStatusAtrasada,
    isStatusEmAndamento,
    isStatusPermitidoEnviarReg,
    isStatusEmAnaliseGerenteRegulatorio,
    isStatusBtnFlAprovar,
    isStatusEmAnaliseRegulatoria,
    temEvidenciaCumprimento,
    temJustificativaAtraso,
    conferenciaAprovada,
    textoBtnEnviarParaTramitacaoPorStatus,
    isCienciaChecked,
    flExigeCienciaGerenteRegul,
    ultimaTramitacaoEmAprovacao: isUltimaTramitacaoEmAprovacaoFlAprovado,
  };
}

