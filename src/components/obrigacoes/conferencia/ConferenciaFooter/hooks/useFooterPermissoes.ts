'use client';

import { useMemo } from 'react';
import { perfilUtil } from '@/api/perfis/types';
import { statusList } from '@/api/status-solicitacao/types';
import { ResponsavelResponse } from '@/api/responsaveis/types';
import { TramitacaoComAnexosResponse, SolicitacaoAssinanteResponse } from '@/api/solicitacoes/types';
import { AnexoResponse } from '@/api/anexos/type';
import { TipoDocumentoAnexoEnum } from '@/api/anexos/type';

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
  anexos?: AnexoResponse[];
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
  anexos = [],
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

  const isReprovadoStatusAnteriorEAtualAnaliseRegulatoria = useMemo(() => {
    if (!tramitacoes || tramitacoes.length === 0) return null; // null = não foi reprovado
    if ((idStatusSolicitacao !== statusList.ANALISE_REGULATORIA.id) && 
        (idStatusSolicitacao !== statusList.VENCIDO_REGULATORIO.id)) {
      return null;
    }
    
    const tramitacoesOrdenadas = ordenarTramitacoesPorData(tramitacoes);
    const ultimaTramitacao = tramitacoesOrdenadas[0];
    
    if (!ultimaTramitacao?.tramitacao) return null;
    
    // Verifica se foi reprovado em EM_APROVACAO ou EM_ASSINATURA_DIRETORIA
    const foiReprovadoEmAprovacao = ultimaTramitacao.tramitacao.idStatusSolicitacao === statusList.EM_APROVACAO.id &&
                                    ultimaTramitacao.tramitacao.flAprovado === 'N';
    
    const foiReprovadoEmDiretoria = ultimaTramitacao.tramitacao.idStatusSolicitacao === statusList.EM_ASSINATURA_DIRETORIA.id &&
                                    ultimaTramitacao.tramitacao.flAprovado === 'N';
    
    const foiReprovado = foiReprovadoEmAprovacao || foiReprovadoEmDiretoria;
    
    if (!foiReprovado) return null; // null = não foi reprovado
    
    // Se foi reprovado, verifica se tem anexo novo de correspondência
    const dataUltimaTramitacaoReprovada = ultimaTramitacao.tramitacao.tramitacaoAcao?.[0]?.dtCriacao ||
                                          ultimaTramitacao.tramitacao.solicitacao?.dtCriacao ||
                                          '';
    
    if (!dataUltimaTramitacaoReprovada) return true; // Se não tem data, assume que pode prosseguir
    
    const anexosCorrespondencia = anexos.filter(
      anexo => anexo.tpDocumento === TipoDocumentoAnexoEnum.R
    );
    
    if (anexosCorrespondencia.length === 0) return false; // Foi reprovado mas não tem anexo novo
    
    const dataUltimaTramitacaoReprovadaTime = new Date(dataUltimaTramitacaoReprovada).getTime();
    
    const temAnexoNovo = anexosCorrespondencia.some(anexo => {
      if (!anexo.dtCriacao) return false;
      const dataAnexoTime = new Date(anexo.dtCriacao).getTime();
      return dataAnexoTime > dataUltimaTramitacaoReprovadaTime;
    });
    
    // Retorna:
    // - null: não foi reprovado (permite prosseguir)
    // - true: foi reprovado E tem anexo novo (permite prosseguir)
    // - false: foi reprovado mas não tem anexo novo (bloqueia)
    return temAnexoNovo;
  }, [tramitacoes, idStatusSolicitacao, anexos]);

  const isPerfilPermitidoEnviarTramitacaoPorStatus = useMemo(() => {
    
    if (isStatusEmAnaliseGerenteRegulatorio) {
      if (idPerfil === perfilUtil.ADMINISTRADOR || idPerfil === perfilUtil.ADMIN_MASTER) {
        return flExigeCienciaGerenteRegul === 'S' || !!isCienciaChecked;
      }
    }

    if (idStatusSolicitacao === statusList.EM_APROVACAO.id) {
      if (idPerfil === perfilUtil.EXECUTOR_AVANCADO) return true;
    }
    
    if (idStatusSolicitacao === statusList.ANALISE_REGULATORIA.id || 
        idStatusSolicitacao === statusList.VENCIDO_REGULATORIO.id) {
      if (idPerfil === perfilUtil.ADMINISTRADOR || idPerfil === perfilUtil.ADMIN_MASTER || idPerfil === perfilUtil.GESTOR_DO_SISTEMA) {
        // isReprovadoEmAprovacaoStatusAtualAnaliseRegulatoria retorna:
        // - null: não foi reprovado (permite prosseguir)
        // - true: foi reprovado E tem anexo novo (permite prosseguir)
        // - false: foi reprovado mas não tem anexo novo (bloqueia)
        // Então só bloqueia se retornar false
        return isReprovadoStatusAnteriorEAtualAnaliseRegulatoria !== false;
      }
    }

    if (idStatusSolicitacao === statusList.EM_CHANCELA.id) {
      if (idPerfil === perfilUtil.ADMINISTRADOR || idPerfil === perfilUtil.ADMIN_MASTER) return true;
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

    if (idStatusSolicitacao === statusList.APROVACAO_TRAMITACAO.id) {
      if (idPerfil === perfilUtil.ADMINISTRADOR || idPerfil === perfilUtil.ADMIN_MASTER || idPerfil === perfilUtil.GESTOR_DO_SISTEMA) return true;
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
    isDiretorJaAprovou,
    isReprovadoStatusAnteriorEAtualAnaliseRegulatoria,
  ]);

  return {
    isPerfilPermitidoEnviarReg,
    podeEnviarParaAnalise,
    isPerfilPermitidoEnviarTramitacaoPorStatus,
    isDiretorJaAprovou,
    isReprovadoEmAprovacaoStatusAtualAnaliseRegulatoria: isReprovadoStatusAnteriorEAtualAnaliseRegulatoria,
  };
}

