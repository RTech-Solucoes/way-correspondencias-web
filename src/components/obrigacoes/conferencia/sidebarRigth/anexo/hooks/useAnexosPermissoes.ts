import { useMemo, useCallback } from 'react';
import type { AnexoResponse } from '@/api/anexos/type';
import { TipoDocumentoAnexoEnum } from '@/api/anexos/type';
import { perfilUtil } from '@/api/perfis/types';

interface UseAnexosPermissoesParams {
  isStatusEmAndamento?: boolean;
  isStatusAtrasada?: boolean;
  isStatusEmValidacaoRegulatorio?: boolean;
  isStatusPendente?: boolean;
  isStatusNaoIniciado?: boolean;
  isStatusConcluido?: boolean;
  isStatusNaoAplicavelSuspensa?: boolean;
  isDaAreaAtribuida?: boolean;
  idPerfil?: number;
  isStatusEmAnaliseRegulatoria?: boolean;
  isStatusVencidoRegulatorio?: boolean;
}

export function useAnexosPermissoes({
  isStatusEmAndamento = false,
  isStatusAtrasada = false,
  isStatusEmValidacaoRegulatorio = false,
  isStatusPendente = false,
  isStatusNaoIniciado = false,
  isStatusConcluido = false,
  isStatusNaoAplicavelSuspensa = false,
  isDaAreaAtribuida = false,
  idPerfil,
  isStatusEmAnaliseRegulatoria = false,
  isStatusVencidoRegulatorio = false,
}: UseAnexosPermissoesParams) {
  const podeAnexarEvidencia = useMemo(() => {
    return isDaAreaAtribuida;
  }, [isDaAreaAtribuida]);

  const statusPermiteAnexarEvidencia = useMemo(() => {
    if (isStatusNaoIniciado && isDaAreaAtribuida) {
      return true;
    }
    return isStatusEmAndamento || isStatusAtrasada;
  }, [isStatusEmAndamento, isStatusAtrasada, isStatusNaoIniciado, isDaAreaAtribuida]);

  const tooltipEvidencia = useMemo(() => {
    if (!statusPermiteAnexarEvidencia) {
      if (isStatusNaoIniciado && !isDaAreaAtribuida) {
        return 'Apenas usuários da área atribuída podem anexar evidência de cumprimento quando o status é "Não Iniciado".';
      }
      return 'Apenas é possível anexar evidência de cumprimento quando o status for "Em Andamento" ou "Atrasada".';
    }
    if (!podeAnexarEvidencia) {
      return 'Apenas usuários da área atribuída podem anexar evidência de cumprimento.';
    }
    return '';
  }, [podeAnexarEvidencia, statusPermiteAnexarEvidencia, isStatusNaoIniciado, isDaAreaAtribuida]);

  const podeExcluirAnexo = useCallback((anexo: AnexoResponse): boolean => {
    if (anexo.tpDocumento === TipoDocumentoAnexoEnum.E || anexo.tpDocumento === TipoDocumentoAnexoEnum.L) {
      if (isStatusNaoIniciado && isDaAreaAtribuida) {
        return true;
      }
      return isStatusEmAndamento || isStatusAtrasada || isStatusPendente;
    }
    
    if (anexo.tpDocumento === TipoDocumentoAnexoEnum.R) {
      return isStatusEmValidacaoRegulatorio || isStatusEmAnaliseRegulatoria || isStatusVencidoRegulatorio;
    }
    
    if (anexo.tpDocumento === TipoDocumentoAnexoEnum.A) {
      return true;
    }

    return false;
  }, [isStatusEmAndamento, isStatusAtrasada, isStatusPendente, isStatusEmValidacaoRegulatorio, isStatusNaoIniciado, isDaAreaAtribuida, isStatusEmAnaliseRegulatoria, isStatusVencidoRegulatorio]);

  const statusPermiteAnexarOutros = useMemo(() => {
    if (isStatusConcluido) {
      return idPerfil === perfilUtil.GESTOR_DO_SISTEMA || 
             idPerfil === perfilUtil.ADMINISTRADOR || 
             idPerfil === perfilUtil.ADMIN_MASTER || 
             idPerfil === perfilUtil.VALIDADOR_ASSINANTE;
    }
    
    if (isStatusNaoAplicavelSuspensa) {
      return  idPerfil === perfilUtil.GESTOR_DO_SISTEMA || 
              idPerfil === perfilUtil.ADMINISTRADOR ||
              idPerfil === perfilUtil.ADMIN_MASTER ||
              idPerfil === perfilUtil.VALIDADOR_ASSINANTE;
    }
    
    return isStatusEmAndamento || isStatusAtrasada || isStatusNaoIniciado || isStatusEmValidacaoRegulatorio || isStatusPendente;
  }, [isStatusEmAndamento, isStatusAtrasada, isStatusNaoIniciado, isStatusEmValidacaoRegulatorio, isStatusPendente, isStatusConcluido, isStatusNaoAplicavelSuspensa, idPerfil]);

  const tooltipOutrosAnexos = useMemo(() => {
    if (!statusPermiteAnexarOutros) {
      if (isStatusConcluido) {
        return 'Apenas Gestor do Sistema, Administrador ou Diretoria podem anexar outros anexos quando o status é "Concluído".';
      }
      if (isStatusNaoAplicavelSuspensa) {
        return 'Apenas Gestor do Sistema, Administrador ou Diretoria podem anexar outros anexos quando o status é "Não Aplicável/Suspensa".';
      }
      return 'Status não permitido para anexar outros anexos.';
    }
    
    return '';
  }, [statusPermiteAnexarOutros, isStatusConcluido, isStatusNaoAplicavelSuspensa]);

  return {
    podeAnexarEvidencia,
    statusPermiteAnexarEvidencia,
    tooltipEvidencia,
    podeExcluirAnexo,
    statusPermiteAnexarOutros,
    tooltipOutrosAnexos,
  };
}

