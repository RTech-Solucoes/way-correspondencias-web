import { useMemo } from 'react';
import { TipoDocumentoAnexoEnum } from '@/api/anexos/type';
import { statusList } from '@/api/status-solicitacao/types';
import { ObrigacaoDetalheResponse } from '@/api/obrigacao/types';

interface UseConferenciaDerivadosProps {
  obrigacao?: ObrigacaoDetalheResponse['obrigacao'];
  anexos: ObrigacaoDetalheResponse['anexos'];
}

export function useConferenciaDerivados({ obrigacao, anexos }: UseConferenciaDerivadosProps) {
  const isStatusAtrasada = useMemo(() => {
    return obrigacao?.statusSolicitacao?.idStatusSolicitacao === statusList.ATRASADA.id;
  }, [obrigacao?.statusSolicitacao?.idStatusSolicitacao]);

  const temEvidenciaCumprimento = useMemo(() => {
    return anexos?.some(anexo => 
      anexo.tpDocumento === TipoDocumentoAnexoEnum.E || 
      anexo.tpDocumento === TipoDocumentoAnexoEnum.L
    ) ?? false;
  }, [anexos]);

  const temJustificativaAtraso = useMemo(() => {
    return !!obrigacao?.dsJustificativaAtraso;
  }, [obrigacao?.dsJustificativaAtraso]);

  const isStatusDesabilitadoParaTramitacao = useMemo(() => {
    const idStatus = obrigacao?.statusSolicitacao?.idStatusSolicitacao ?? 0;
    
    return (
      idStatus === statusList.NAO_INICIADO.id ||
      idStatus === statusList.PENDENTE.id ||
      idStatus === statusList.EM_ANDAMENTO.id ||
      idStatus === statusList.ATRASADA.id ||
      idStatus === statusList.NAO_APLICAVEL_SUSPENSA.id
    );
  }, [obrigacao?.statusSolicitacao?.idStatusSolicitacao]);

  const isStatusBtnFlAprovar = useMemo(() => {
    return obrigacao?.statusSolicitacao?.idStatusSolicitacao === statusList.EM_ANALISE_GERENTE_REGULATORIO.id ||
           obrigacao?.statusSolicitacao?.idStatusSolicitacao === statusList.EM_APROVACAO.id;
  }, [obrigacao?.statusSolicitacao?.idStatusSolicitacao]);

  return {
    isStatusAtrasada,
    temEvidenciaCumprimento,
    temJustificativaAtraso,
    isStatusDesabilitadoParaTramitacao,
    isStatusBtnFlAprovar,
  };
}

