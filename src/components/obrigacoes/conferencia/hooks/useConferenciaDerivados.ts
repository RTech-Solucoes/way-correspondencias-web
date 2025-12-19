import { useMemo } from 'react';
import { statusListObrigacao } from '@/api/status-obrigacao/types';
import { TipoDocumentoAnexoEnum } from '@/api/anexos/type';
import { statusList } from '@/api/status-solicitacao/types';
import { ObrigacaoDetalheResponse } from '@/api/obrigacao/types';

interface UseConferenciaDerivadosProps {
  obrigacao?: ObrigacaoDetalheResponse['obrigacao'];
  anexos: ObrigacaoDetalheResponse['anexos'];
}

export function useConferenciaDerivados({ obrigacao, anexos }: UseConferenciaDerivadosProps) {
  const isStatusAtrasada = useMemo(() => {
    return obrigacao?.statusSolicitacao?.idStatusSolicitacao === statusListObrigacao.ATRASADA.id;
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
      idStatus === statusListObrigacao.NAO_INICIADO.id ||
      idStatus === statusListObrigacao.PENDENTE.id ||
      idStatus === statusListObrigacao.EM_ANDAMENTO.id ||
      idStatus === statusListObrigacao.ATRASADA.id ||
      idStatus === statusListObrigacao.NAO_APLICAVEL_SUSPENSA.id
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

