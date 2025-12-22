'use client';

import { useMemo } from 'react';
import { perfilUtil } from '@/api/perfis/types';
import { statusList } from '@/api/status-solicitacao/types';

interface UseFooterTooltipsParams {
  idPerfil?: number | null;
  isUsuarioDaAreaAtribuida: boolean;
  idStatusSolicitacao: number;
  flExigeCienciaGerenteRegul?: string | null;
  isCienciaChecked?: boolean;
  isStatusEmValidacaoRegulatorio: boolean;
  isStatusAtrasada: boolean;
  isStatusPermitidoEnviarReg: boolean;
  isPerfilPermitidoEnviarReg: boolean;
  conferenciaAprovada: boolean;
  temEvidenciaCumprimento: boolean;
  temJustificativaAtraso: boolean;
}

export function useFooterTooltips({
  idPerfil,
  isUsuarioDaAreaAtribuida,
  idStatusSolicitacao,
  flExigeCienciaGerenteRegul,
  isCienciaChecked = false,
  isStatusEmValidacaoRegulatorio,
  isStatusAtrasada,
  isStatusPermitidoEnviarReg,
  isPerfilPermitidoEnviarReg,
  conferenciaAprovada,
  temEvidenciaCumprimento,
  temJustificativaAtraso,
}: UseFooterTooltipsParams) {

  const tooltipAnexarCorrespondencia = useMemo(() => {
    if (!conferenciaAprovada) {
      return 'É necessário aprovar a conferência antes de anexar correspondência.';
    }
    if (!isStatusEmValidacaoRegulatorio) {
      return 'Apenas é possível anexar correspondência quando o status for "Em Validação (Regulatório)".';
    }
    return '';
  }, [conferenciaAprovada, isStatusEmValidacaoRegulatorio]);

  const tooltipStatusValidacaoRegulatorio = useMemo(() => {
    if (conferenciaAprovada) {
      return 'A conferência já foi aprovada.';
    }
    if (!isStatusEmValidacaoRegulatorio) {
      return 'Só é possível realizar esta ação quando o status for "Em Validação (Regulatório)".';
    }
    return '';
  }, [isStatusEmValidacaoRegulatorio, conferenciaAprovada]);

  const tooltipJustificarAtraso = useMemo(() => {
    if (!isStatusAtrasada) {
      return '';
    }
    if (!isUsuarioDaAreaAtribuida) {
      return 'Apenas usuários da área atribuída podem justificar o atraso desta obrigação.';
    }
    return '';
  }, [isStatusAtrasada, isUsuarioDaAreaAtribuida]);

  const tooltipEnviarRegulatorio = useMemo(() => {
    if (!isPerfilPermitidoEnviarReg) {
      const temPerfilPermitido = [
        perfilUtil.EXECUTOR_AVANCADO, 
        perfilUtil.EXECUTOR, 
        perfilUtil.EXECUTOR_RESTRITO
      ].includes(idPerfil ?? 0);

      if (!temPerfilPermitido) {
        return 'Apenas Executor Avançado, Executor, Executor Restrito podem enviar para análise do regulatório.';
      }
      if (!isUsuarioDaAreaAtribuida) {
        return 'Apenas usuários da área atribuída podem enviar para análise do regulatório.';
      }
      return 'Você não tem permissão para enviar para análise do regulatório.';
    }
    if (isStatusAtrasada && !temJustificativaAtraso) {
      return 'É necessário inserir a justificativa de atraso antes de enviar ao Regulatório.';
    }
    if (!temEvidenciaCumprimento) {
      if (isStatusAtrasada) {
        return 'É necessário anexar a evidência de cumprimento antes de enviar ao Regulatório.';
      }
      return 'É necessário anexar pelo menos uma evidência de cumprimento (arquivo ou link) antes de enviar para análise do regulatório.';
    }
    if (!isStatusPermitidoEnviarReg) {
      return 'Só é possível enviar para análise do regulatório quando o status for "Em Andamento" ou "Atrasada".';
    }
    return '';
  }, [
    isPerfilPermitidoEnviarReg, 
    isStatusPermitidoEnviarReg, 
    temEvidenciaCumprimento, 
    isStatusAtrasada, 
    temJustificativaAtraso, 
    idPerfil, 
    isUsuarioDaAreaAtribuida
  ]);

  const tooltipAnexarEvidencia = useMemo(() => {
    if (!isStatusPermitidoEnviarReg) {
      return 'Apenas é possível anexar evidência de cumprimento quando o status for "Em Andamento" ou "Atrasada".';
    }
    return '';
  }, [isStatusPermitidoEnviarReg]);

  const tooltipPerfilPermitidoEnviarTramitacaoPorStatus = useMemo(() => {
    if (idStatusSolicitacao === statusList.PRE_ANALISE.id) {
      return 'Aguardando preencher todos dados para enviar para Tramitação';
    }

    if (idStatusSolicitacao === statusList.EM_ANALISE_GERENTE_REGULATORIO.id) {
      if (idPerfil !== perfilUtil.ADMINISTRADOR) {
        return 'Apenas o Administrador pode realizar esta ação';
      }
      if (flExigeCienciaGerenteRegul === 'N' && !isCienciaChecked) {
        return 'É necessário declarar ciência para prosseguir';
      }
    }

    if (idStatusSolicitacao === statusList.EM_APROVACAO.id) {
      if (idPerfil !== perfilUtil.EXECUTOR_AVANCADO) {
        return 'Apenas o Executor Avançado pode realizar esta ação quando o status for "Em Aprovação".';
      }
    }

    if (idStatusSolicitacao === statusList.ANALISE_REGULATORIA.id) {
      if (idPerfil !== perfilUtil.ADMINISTRADOR && idPerfil !== perfilUtil.GESTOR_DO_SISTEMA) {
        return 'Apenas Administrador ou Gestor do Sistema podem realizar esta ação quando o status for "Análise Regulatória".';
      }
    }

    if (idStatusSolicitacao === statusList.EM_CHANCELA.id) {
      if (idPerfil !== perfilUtil.ADMINISTRADOR) {
        return 'Apenas o Administrador pode realizar esta ação quando o status for "Em Chancela".';
      }
    }

    if (idStatusSolicitacao === statusList.EM_ASSINATURA_DIRETORIA.id) {
      if (idPerfil !== perfilUtil.ADMINISTRADOR && idPerfil !== perfilUtil.VALIDADOR_ASSINANTE) {
        return 'Apenas Administrador ou Validador Assinante podem realizar esta ação quando o status for "Em Assinatura Diretoria".';
      }
    }

    return 'Você não tem permissão para essa ação.';
  }, [idStatusSolicitacao, idPerfil, flExigeCienciaGerenteRegul, isCienciaChecked]);

  return {
    tooltipAnexarCorrespondencia,
    tooltipStatusValidacaoRegulatorio,
    tooltipJustificarAtraso,
    tooltipEnviarRegulatorio,
    tooltipAnexarEvidencia,
    tooltipPerfilPermitidoEnviarTramitacaoPorStatus,
  };
}

