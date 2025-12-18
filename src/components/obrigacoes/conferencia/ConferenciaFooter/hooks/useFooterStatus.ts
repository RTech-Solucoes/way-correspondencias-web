'use client';

import { useMemo } from 'react';
import { StatusSolicitacaoResponse } from '@/api/status-solicitacao/client';
import { statusListObrigacao } from '@/api/status-obrigacao/types';
import { statusList } from '@/api/status-solicitacao/types';
import { TipoDocumentoAnexoEnum } from '@/api/anexos/type';
import { AnexoResponse } from '@/api/anexos/type';

interface UseFooterStatusParams {
  statusSolicitacao?: StatusSolicitacaoResponse | null;
  anexos?: AnexoResponse[];
  dsJustificativaAtraso?: string | null;
  flAprovarConferencia?: string | null;
  flExigeCienciaGerenteRegul?: string | null;
  isCienciaChecked?: boolean;
}

export function useFooterStatus({
  statusSolicitacao,
  anexos = [],
  dsJustificativaAtraso,
  flAprovarConferencia,
  flExigeCienciaGerenteRegul,
  isCienciaChecked = false,
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
           statusSolicitacao?.idStatusSolicitacao === statusList.EM_APROVACAO.id;
  }, [isStatusEmAnaliseGerenteRegulatorio, flExigeCienciaGerenteRegul, statusSolicitacao?.idStatusSolicitacao]);

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

  const textoBtnEnviarParaTramitacaoPorStatus = useMemo(() => {
    const textosPorStatus: Record<number, string> = {
      [statusList.PRE_ANALISE.id]: 'Enviar para Gerente do Regulatório',
      [statusList.EM_ANALISE_GERENTE_REGULATORIO.id]: 'Encaminhar para Gerente da Área',
    };
    
    return textosPorStatus[idStatusSolicitacao] ?? 'Enviar para Tramitação';
  }, [idStatusSolicitacao]);

  return {
    idStatusSolicitacao,
    isStatusEmValidacaoRegulatorio,
    isStatusAtrasada,
    isStatusEmAndamento,
    isStatusPermitidoEnviarReg,
    isStatusEmAnaliseGerenteRegulatorio,
    isStatusBtnFlAprovar,
    temEvidenciaCumprimento,
    temJustificativaAtraso,
    conferenciaAprovada,
    textoBtnEnviarParaTramitacaoPorStatus,
    isCienciaChecked,
    flExigeCienciaGerenteRegul,
  };
}

