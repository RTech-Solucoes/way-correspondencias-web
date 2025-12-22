import { useMemo } from 'react';
import type { AnexoResponse } from '@/api/anexos/type';
import { TipoDocumentoAnexoEnum, TipoObjetoAnexoEnum } from '@/api/anexos/type';
import { TramitacaoComAnexosResponse } from '@/api/solicitacoes/types';

interface UseAnexosFiltradosParams {
  anexos: AnexoResponse[];
  tramitacoes?: TramitacaoComAnexosResponse[];
}

export function useAnexosFiltrados({ anexos, tramitacoes = [] }: UseAnexosFiltradosParams) {
  const protocoloAnexos = useMemo(() => {
    return anexos.filter((anexo) => anexo.tpDocumento === TipoDocumentoAnexoEnum.P);
  }, [anexos]);

  const evidenceAnexos = useMemo(() => {
    return anexos.filter((anexo) => anexo.tpDocumento === TipoDocumentoAnexoEnum.E);
  }, [anexos]);

  const evidenceLinksAnexos = useMemo(() => {
    return anexos.filter((anexo) => anexo.tpDocumento === TipoDocumentoAnexoEnum.L);
  }, [anexos]);

  const correspondenciaAnexos = useMemo(() => {
    return anexos.filter((anexo) => anexo.tpDocumento === TipoDocumentoAnexoEnum.R);
  }, [anexos]);

  const outrosAnexos = useMemo(() => {
    return anexos.filter((anexo) => anexo.tpDocumento === TipoDocumentoAnexoEnum.A);
  }, [anexos]);

  const tramitacaoAnexos = useMemo(() => {
    const anexosPrincipais = (anexos || []).filter((anexo) => 
      anexo.tpObjeto === TipoObjetoAnexoEnum.T
    );

    const anexosDasTramitacoes = (tramitacoes || []).flatMap(t => t.anexos || []);

    const todosAnexos = [...anexosPrincipais, ...anexosDasTramitacoes];
    const uniqueAnexos = Array.from(new Map(todosAnexos.map(a => [a.idAnexo, a])).values());

    return uniqueAnexos;
  }, [anexos, tramitacoes]);

  return {
    protocoloAnexos,
    evidenceAnexos,
    evidenceLinksAnexos,
    correspondenciaAnexos,
    outrosAnexos,
    tramitacaoAnexos,
  };
}

