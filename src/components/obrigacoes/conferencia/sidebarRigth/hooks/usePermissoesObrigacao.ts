'use client';

import { useMemo } from 'react';
import { statusListObrigacao } from '@/api/status-obrigacao/types';
import { statusList } from '@/api/status-solicitacao/types';
import { perfilUtil } from '@/api/perfis/types';
import type { ObrigacaoDetalheResponse } from '@/api/obrigacao/types';
import type { ResponsavelResponse } from '@/api/responsaveis/types';
import { TipoEnum } from '@/api/tipos/types';

interface UsePermissoesObrigacaoParams {
  detalhe: ObrigacaoDetalheResponse;
  idPerfil?: number | null;
  userResponsavel?: ResponsavelResponse | null;
}

export function usePermissoesObrigacao({
  detalhe,
  idPerfil,
  userResponsavel,
}: UsePermissoesObrigacaoParams) {
  // Área atribuída
  const areaAtribuida = useMemo(() => {
    return detalhe?.obrigacao?.areas?.find((area) => area.tipoArea?.cdTipo === TipoEnum.ATRIBUIDA);
  }, [detalhe?.obrigacao?.areas]);

  // Áreas condicionantes
  const areasCondicionantes = useMemo(() => {
    return detalhe?.obrigacao?.areas?.filter((area) => area.tipoArea?.cdTipo === TipoEnum.CONDICIONANTE) ?? [];
  }, [detalhe?.obrigacao?.areas]);

  // IDs das áreas do usuário
  const userAreaIds = useMemo(() => {
    return userResponsavel?.areas?.map(ra => ra.area.idArea) || [];
  }, [userResponsavel?.areas]);

  // Se o usuário é da área atribuída
  const idAreaAtribuida = areaAtribuida?.idArea;
  const isDaAreaAtribuida = useMemo(() => {
    return !!(idAreaAtribuida && userAreaIds.includes(idAreaAtribuida));
  }, [idAreaAtribuida, userAreaIds]);

  // Se o usuário é de uma área condicionante
  const isDeAreaCondicionante = useMemo(() => {
    const idsAreasCondicionantes = areasCondicionantes.map(area => area.idArea);
    return idsAreasCondicionantes.some(idArea => userAreaIds.includes(idArea));
  }, [areasCondicionantes, userAreaIds]);

  // Status helpers
  const isStatusEmAndamento = useMemo(() => {
    return detalhe?.obrigacao?.statusSolicitacao?.idStatusSolicitacao === statusListObrigacao.EM_ANDAMENTO.id;
  }, [detalhe?.obrigacao?.statusSolicitacao?.idStatusSolicitacao]);

  const isStatusAtrasada = useMemo(() => {
    return detalhe?.obrigacao?.statusSolicitacao?.idStatusSolicitacao === statusListObrigacao.ATRASADA.id;
  }, [detalhe?.obrigacao?.statusSolicitacao?.idStatusSolicitacao]);

  const isStatusEmValidacaoRegulatorio = useMemo(() => {
    return detalhe?.obrigacao?.statusSolicitacao?.idStatusSolicitacao === statusListObrigacao.EM_VALIDACAO_REGULATORIO.id;
  }, [detalhe?.obrigacao?.statusSolicitacao?.idStatusSolicitacao]);

  const isStatusPendente = useMemo(() => {
    return detalhe?.obrigacao?.statusSolicitacao?.idStatusSolicitacao === statusListObrigacao.PENDENTE.id;
  }, [detalhe?.obrigacao?.statusSolicitacao?.idStatusSolicitacao]);

  const isStatusNaoIniciado = useMemo(() => {
    return detalhe?.obrigacao?.statusSolicitacao?.idStatusSolicitacao === statusListObrigacao.NAO_INICIADO.id;
  }, [detalhe?.obrigacao?.statusSolicitacao?.idStatusSolicitacao]);

  const isStatusConcluido = useMemo(() => {
    return detalhe?.obrigacao?.statusSolicitacao?.idStatusSolicitacao === statusListObrigacao.CONCLUIDO.id;
  }, [detalhe?.obrigacao?.statusSolicitacao?.idStatusSolicitacao]);

  const isStatusNaoAplicavelSuspensa = useMemo(() => {
    return detalhe?.obrigacao?.statusSolicitacao?.idStatusSolicitacao === statusListObrigacao.NAO_APLICAVEL_SUSPENSA.id;
  }, [detalhe?.obrigacao?.statusSolicitacao?.idStatusSolicitacao]);

  const isStatusPreAnalise = useMemo(() => {
    return detalhe?.obrigacao?.statusSolicitacao?.idStatusSolicitacao === statusList.PRE_ANALISE.id;
  }, [detalhe?.obrigacao?.statusSolicitacao?.idStatusSolicitacao]);

  // Verificar se pode gerar relatório
  const podeGerarRelatorio = useMemo(() => {
    if (idPerfil === perfilUtil.GESTOR_DO_SISTEMA || 
        idPerfil === perfilUtil.ADMINISTRADOR || 
        idPerfil === perfilUtil.VALIDADOR_ASSINANTE) {
      return true;
    }
    
    if (idPerfil === perfilUtil.EXECUTOR_AVANCADO || 
        idPerfil === perfilUtil.EXECUTOR) {
      return isDaAreaAtribuida || isDeAreaCondicionante;
    }
    
    return false;
  }, [idPerfil, isDaAreaAtribuida, isDeAreaCondicionante]);

  // Verificar permissão do perfil por status
  const isPerfilPermitidoPorStatus = useMemo(() => {
    if (isStatusNaoIniciado) {
      if (isDaAreaAtribuida) {
        return true;
      }
      return false;
    }

    if (isStatusEmValidacaoRegulatorio) {
      if (idPerfil === perfilUtil.GESTOR_DO_SISTEMA || 
        idPerfil === perfilUtil.ADMINISTRADOR || 
        idPerfil === perfilUtil.VALIDADOR_ASSINANTE) {
        return true;
      }
      return false;
    }

    if (isStatusEmAndamento || isStatusPendente || isStatusAtrasada) return true;

    if (isStatusConcluido) {
      if (idPerfil === perfilUtil.GESTOR_DO_SISTEMA || 
        idPerfil === perfilUtil.ADMINISTRADOR || 
        idPerfil === perfilUtil.VALIDADOR_ASSINANTE) {
        return true;
      }
      return false;
    }

    if (isStatusNaoAplicavelSuspensa) {
      if (idPerfil === perfilUtil.GESTOR_DO_SISTEMA || 
        idPerfil === perfilUtil.ADMINISTRADOR || 
        idPerfil === perfilUtil.VALIDADOR_ASSINANTE) {
        return true;
      }
      return false;
    }

    return false;
  }, [
    idPerfil, 
    isStatusNaoIniciado, 
    isStatusEmAndamento,
    isStatusPendente,
    isStatusAtrasada,
    isStatusEmValidacaoRegulatorio,
    isStatusConcluido, 
    isStatusNaoAplicavelSuspensa, 
    isDaAreaAtribuida
  ]);

  // Status permitido para tramitar
  const statusPermitidoParaTramitar = useMemo(() => {
    const idStatus = detalhe?.obrigacao?.statusSolicitacao?.idStatusSolicitacao;
    if (!idStatus) return false;
    return [
      statusListObrigacao.NAO_INICIADO.id,
      statusListObrigacao.PENDENTE.id,  
    ].includes(idStatus);
  }, [detalhe?.obrigacao?.statusSolicitacao?.idStatusSolicitacao]);

  // Tooltip para enviar comentário
  const tooltipPerfilPermitidoPorStatus = useMemo(() => {
    if (isStatusNaoIniciado) {
      if (!isDaAreaAtribuida) {
        return 'Apenas usuários da área atribuída podem inserir comentários quando o status é "Não Iniciado".';
      }
      return '';
    }

    if (isStatusEmValidacaoRegulatorio) {
      if (!(idPerfil === perfilUtil.GESTOR_DO_SISTEMA || 
            idPerfil === perfilUtil.ADMINISTRADOR || 
            idPerfil === perfilUtil.VALIDADOR_ASSINANTE)) {
        return 'Apenas Regulátorio ou Diretoria podem inserir comentários quando o status é "Em Validação (Regulatório)".';
      }
      return 'Você não tem permissão para inserir comentários neste status.';
    }

    if (isStatusConcluido) {
      if (idPerfil === perfilUtil.GESTOR_DO_SISTEMA || 
        idPerfil === perfilUtil.ADMINISTRADOR || 
        idPerfil === perfilUtil.VALIDADOR_ASSINANTE) {
        return '';
      }
      return 'Não é possível inserir comentários em obrigações concluídas. Apenas visualização permitida.';
    }

    if (isStatusNaoAplicavelSuspensa) {
      if (idPerfil === perfilUtil.GESTOR_DO_SISTEMA || 
        idPerfil === perfilUtil.ADMINISTRADOR || 
        idPerfil === perfilUtil.VALIDADOR_ASSINANTE) {
        return '';
      }
      return 'Não é possível inserir comentários em obrigações não aplicáveis/suspensas. Apenas Gestor do Sistema, Administrador ou Diretoria podem inserir comentários.';
    }

    return 'Você não tem permissão para inserir comentários neste status.';
  }, [
    isStatusNaoIniciado,
    isStatusEmValidacaoRegulatorio,
    isStatusConcluido,
    isStatusNaoAplicavelSuspensa,
    isDaAreaAtribuida,
    idPerfil
  ]);

  return {
    // Áreas
    areaAtribuida,
    areasCondicionantes,
    userAreaIds,
    idAreaAtribuida,
    isDaAreaAtribuida,
    isDeAreaCondicionante,
    // Status
    isStatusEmAndamento,
    isStatusAtrasada,
    isStatusEmValidacaoRegulatorio,
    isStatusPendente,
    isStatusNaoIniciado,
    isStatusConcluido,
    isStatusNaoAplicavelSuspensa,
    isStatusPreAnalise,
    // Permissões
    podeGerarRelatorio,
    isPerfilPermitidoPorStatus,
    statusPermitidoParaTramitar,
    // Tooltips
    tooltipPerfilPermitidoPorStatus,
  };
}

