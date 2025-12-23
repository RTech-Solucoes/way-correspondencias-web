'use client';

import { useMemo } from 'react';
import { perfilUtil } from '@/api/perfis/types';
import { statusList } from '@/api/status-solicitacao/types';
import { ResponsavelResponse } from '@/api/responsaveis/types';
import { TramitacaoComAnexosResponse, SolicitacaoAssinanteResponse } from '@/api/solicitacoes/types';

interface UseFooterPermissoesParams {
  idPerfil?: number | null;
  isUsuarioDaAreaAtribuida: boolean;
  userResponsavel?: ResponsavelResponse | null;
  tramitacoes?: TramitacaoComAnexosResponse[];
  solicitacoesAssinantes?: SolicitacaoAssinanteResponse[];
  idStatusSolicitacao: number;
  flExigeCienciaGerenteRegul?: string | null;
  isCienciaChecked?: boolean;
  isStatusEmAnaliseGerenteRegulatorio: boolean;
  isStatusPermitidoEnviarReg: boolean;
  temEvidenciaCumprimento: boolean;
  isStatusAtrasada: boolean;
  temJustificativaAtraso: boolean;
}

export function useFooterPermissoes({
  idPerfil,
  isUsuarioDaAreaAtribuida,
  userResponsavel,
  tramitacoes = [],
  solicitacoesAssinantes = [],
  idStatusSolicitacao,
  flExigeCienciaGerenteRegul,
  isCienciaChecked = false,
  isStatusEmAnaliseGerenteRegulatorio,
  isStatusPermitidoEnviarReg,
  temEvidenciaCumprimento,
  isStatusAtrasada,
  temJustificativaAtraso,
}: UseFooterPermissoesParams) {
  
  const isPerfilPermitidoEnviarReg = useMemo(() => {
    const temPerfilPermitido = [
      perfilUtil.EXECUTOR_AVANCADO, 
      perfilUtil.EXECUTOR, 
      perfilUtil.EXECUTOR_RESTRITO
    ].includes(idPerfil ?? 0);
    return temPerfilPermitido && isUsuarioDaAreaAtribuida;
  }, [idPerfil, isUsuarioDaAreaAtribuida]);

  const podeEnviarParaAnalise = useMemo(() => {
    return isStatusPermitidoEnviarReg && 
           isPerfilPermitidoEnviarReg && 
           temEvidenciaCumprimento && 
           (!isStatusAtrasada || temJustificativaAtraso);
  }, [isStatusPermitidoEnviarReg, isPerfilPermitidoEnviarReg, temEvidenciaCumprimento, isStatusAtrasada, temJustificativaAtraso]);

  const isDiretorJaAprovou = useMemo(() => {
    const nrNivelUltimaTramitacao = tramitacoes?.[0]?.tramitacao?.nrNivel;
    
    return tramitacoes?.some(t =>
      t?.tramitacao?.nrNivel === nrNivelUltimaTramitacao &&
      t?.tramitacao?.idStatusSolicitacao === idStatusSolicitacao &&
      t?.tramitacao?.flAprovado === 'S' &&
      (t?.tramitacao?.tramitacaoAcao?.some(ta =>
        ta?.responsavelArea?.responsavel?.idResponsavel === userResponsavel?.idResponsavel
      ) ?? false)
    ) ?? false;
  }, [tramitacoes, idStatusSolicitacao, userResponsavel?.idResponsavel]);

  const isPerfilPermitidoEnviarTramitacaoPorStatus = useMemo(() => {
    
    if (isStatusEmAnaliseGerenteRegulatorio) {
      if (idPerfil === perfilUtil.ADMINISTRADOR) {
        return flExigeCienciaGerenteRegul === 'S' || !!isCienciaChecked;
      }
    }

    if (idStatusSolicitacao === statusList.EM_APROVACAO.id) {
      if (idPerfil === perfilUtil.EXECUTOR_AVANCADO) return true;
    }
    
    if (idStatusSolicitacao === statusList.ANALISE_REGULATORIA.id) {
      if (idPerfil === perfilUtil.ADMINISTRADOR || idPerfil === perfilUtil.GESTOR_DO_SISTEMA) return true;
    }

    if (idStatusSolicitacao === statusList.EM_CHANCELA.id) {
      if (idPerfil === perfilUtil.ADMINISTRADOR) return true;
    }

    if (idStatusSolicitacao === statusList.EM_ASSINATURA_DIRETORIA.id) {
      const idResponsavelLogado = userResponsavel?.idResponsavel;
      if (idResponsavelLogado) {
        const isAssinante = solicitacoesAssinantes.some(
          assinante => assinante.idResponsavel === idResponsavelLogado
        );
        if (isAssinante && !isDiretorJaAprovou) return true;
      }
      return false;
    }

    return false;
  }, [
    idPerfil, 
    idStatusSolicitacao, 
    flExigeCienciaGerenteRegul, 
    isCienciaChecked, 
    isStatusEmAnaliseGerenteRegulatorio,
    userResponsavel?.idResponsavel,
    solicitacoesAssinantes,
    isDiretorJaAprovou
  ]);

  return {
    isPerfilPermitidoEnviarReg,
    podeEnviarParaAnalise,
    isPerfilPermitidoEnviarTramitacaoPorStatus,
    isDiretorJaAprovou,
  };
}

