import { useMemo } from 'react';
import { perfilUtil } from '@/api/perfis/types';
import { TipoEnum } from '@/api/tipos/types';
import { ResponsavelResponse } from '@/api/responsaveis/types';
import { ObrigacaoDetalheResponse } from '@/api/obrigacao/types';

interface UseConferenciaPermissoesProps {
  detalhe: ObrigacaoDetalheResponse | null;
  idPerfil?: number | null;
  userResponsavel: ResponsavelResponse | null;
}

export function useConferenciaPermissoes({
  detalhe,
  idPerfil,
  userResponsavel,
}: UseConferenciaPermissoesProps) {
  const obrigacao = detalhe?.obrigacao;
  
  const areaAtribuida = useMemo(() => {
    return obrigacao?.areas?.find((area) => area.tipoArea?.cdTipo === TipoEnum.ATRIBUIDA);
  }, [obrigacao?.areas]);

  const isUsuarioDaAreaAtribuida = useMemo(() => {
    if (!areaAtribuida?.idArea || !userResponsavel?.areas) {
      return false;
    }

    const idAreaAtribuida = areaAtribuida.idArea;
    const userAreaIds = userResponsavel.areas.map(ra => ra.area.idArea);
    
    return userAreaIds.includes(idAreaAtribuida);
  }, [areaAtribuida?.idArea, userResponsavel?.areas]);

  const isPerfilPermitidoEnviarReg = useMemo(() => {
    const temPerfilPermitido = [
      perfilUtil.EXECUTOR_AVANCADO, 
      perfilUtil.EXECUTOR, 
      perfilUtil.EXECUTOR_RESTRITO
    ].includes(idPerfil ?? 0);
    return temPerfilPermitido && isUsuarioDaAreaAtribuida;
  }, [idPerfil, isUsuarioDaAreaAtribuida]);

  return {
    areaAtribuida,
    isUsuarioDaAreaAtribuida,
    isPerfilPermitidoEnviarReg,
  };
}

