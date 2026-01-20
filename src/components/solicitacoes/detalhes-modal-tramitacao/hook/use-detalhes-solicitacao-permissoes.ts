'use client';

import { useMemo } from 'react';
import { perfilUtil } from '@/api/perfis/types';
import { ResponsavelResponse } from '@/api/responsaveis/types';
import { statusList } from '@/api/status-solicitacao/types';
import { AnaliseGerenteDiretor } from '@/api/solicitacoes/types';
import { CorrespondenciaDetalheResponse } from '@/api/correspondencia/types';
import { usePermissoes } from '@/context/permissoes/PermissoesContext';

export type UseDetalhesSolicitacaoPermissoesProps = {
  correspond: CorrespondenciaDetalheResponse | null;
  idStatusSolicitacao?: number;
  flAnaliseGerenteDiretor?: AnaliseGerenteDiretor;
  userResponsavel: ResponsavelResponse | null;
  areaDiretoria: number | null;
  hasAreaInicial: boolean;
  isFlagVisivel: boolean;
  sending: boolean;
  flAprovado: 'S' | 'N' | '';
  isDiretoria: boolean;
  devolutivaReprovadaUmavezDiretoria?: boolean;
  isExisteCienciaGerenteRegul: boolean;
};

export function useDetalhesSolicitacaoPermissoes({
  correspond,
  idStatusSolicitacao,
  flAnaliseGerenteDiretor,
  userResponsavel,
  areaDiretoria,
  hasAreaInicial,
  isFlagVisivel,
  sending,
  flAprovado,
  isDiretoria,
  devolutivaReprovadaUmavezDiretoria,
  isExisteCienciaGerenteRegul,
}: UseDetalhesSolicitacaoPermissoesProps) {
  const { canListarAnexo, canDeletarAnexo, canAprovarSolicitacao } = usePermissoes();

  const isPermissaoEnviandoDevolutiva = isFlagVisivel && !canAprovarSolicitacao;

  const nrNivelUltimaTramitacao = correspond?.tramitacoes?.[0]?.tramitacao?.nrNivel;

  const isDiretorJaAprovou = useMemo(() => {
    return correspond?.tramitacoes?.some(t =>
      t?.tramitacao?.nrNivel === nrNivelUltimaTramitacao &&
      t?.tramitacao?.idStatusSolicitacao === correspond?.statusSolicitacao?.idStatusSolicitacao &&
      t?.tramitacao?.flAprovado === 'S' &&
      (t?.tramitacao?.tramitacaoAcao?.some(ta =>
        ta?.responsavelArea?.responsavel?.idResponsavel === userResponsavel?.idResponsavel
      ) ?? false)
    );
  }, [correspond?.tramitacoes, correspond?.statusSolicitacao?.idStatusSolicitacao, nrNivelUltimaTramitacao, userResponsavel?.idResponsavel]);

  const isRolePermitidoAnaliseAreaTecnicaFlA = (
    userResponsavel?.idPerfil === perfilUtil.VALIDADOR_ASSINANTE ||
    userResponsavel?.idPerfil === perfilUtil.EXECUTOR_AVANCADO
  );

  const isRolePermitidoAnaliseAreaTecnicaFlD = (
    userResponsavel?.idPerfil === perfilUtil.VALIDADOR_ASSINANTE ||
    userResponsavel?.idPerfil === perfilUtil.EXECUTOR_AVANCADO ||
    userResponsavel?.idPerfil === perfilUtil.EXECUTOR
  );

  const idsResponsaveisAssinates: number[] = useMemo(() => {
    return correspond?.solicitacoesAssinantes?.filter(
      a => a.idSolicitacao === correspond?.correspondencia?.idSolicitacao &&
        a.idStatusSolicitacao === statusList.EM_ASSINATURA_DIRETORIA.id
    ).map(a => a.idResponsavel) ?? [];
  }, [correspond?.solicitacoesAssinantes, correspond?.correspondencia?.idSolicitacao]);

  const isAssinanteAutorizado = Boolean(userResponsavel?.idResponsavel &&
    idsResponsaveisAssinates.includes(userResponsavel.idResponsavel));

  const enableEnviarDevolutiva = useMemo(() => {
    const tramitacaoExecutada = correspond?.tramitacoes?.filter(t =>
      t?.tramitacao?.nrNivel === nrNivelUltimaTramitacao &&
      t?.tramitacao?.idStatusSolicitacao === correspond?.statusSolicitacao?.idStatusSolicitacao &&
      t?.tramitacao?.tramitacaoAcao?.some(ta =>
        ta?.responsavelArea?.responsavel?.idResponsavel === userResponsavel?.idResponsavel &&
        ta.flAcao === 'T'));

    // Verifica se TODAS as áreas do usuário que estão na solicitação já responderam
    const todasAreasUsuarioResponderam = (() => {
      const areasSolicitacao = Array.isArray(correspond?.correspondencia?.area)
        ? (correspond!.correspondencia!.area! as Array<{ idArea?: number }>)
          .map(a => a?.idArea)
          .filter((id): id is number => id !== undefined && id !== null)
        : [];

      const areasUsuarioNaSolicitacao = userResponsavel?.areas
        ?.map(a => a?.area?.idArea)
        .filter((id): id is number =>
          id !== undefined &&
          id !== null &&
          areasSolicitacao.includes(id)
        ) || [];

      if (areasUsuarioNaSolicitacao.length === 0) return false;

      const areasQueJaResponderam = correspond?.tramitacoes
        ?.filter(t =>
          t?.tramitacao?.nrNivel === nrNivelUltimaTramitacao &&
          correspond?.statusSolicitacao?.idStatusSolicitacao !== statusList.EM_ASSINATURA_DIRETORIA.id &&
          t?.tramitacao?.idStatusSolicitacao === correspond?.statusSolicitacao?.idStatusSolicitacao &&
          !((correspond?.statusSolicitacao?.idStatusSolicitacao === statusList.EM_ANALISE_AREA_TECNICA.id ||
            correspond?.statusSolicitacao?.idStatusSolicitacao === statusList.VENCIDO_AREA_TECNICA.id) &&
            (flAnaliseGerenteDiretor === AnaliseGerenteDiretor.D ||
              flAnaliseGerenteDiretor === AnaliseGerenteDiretor.A)
          )
        )
        .map(t => t?.tramitacao?.areaOrigem?.idArea)
        .filter((id): id is number => id !== undefined && id !== null) || [];

      return areasUsuarioNaSolicitacao.every(areaId =>
        areasQueJaResponderam.includes(areaId)
      );
    })();

    if (sending) return false;

    if (idStatusSolicitacao === statusList.EM_ASSINATURA_DIRETORIA.id) {
      const isRolePermitido = (
        userResponsavel?.idPerfil === perfilUtil.ADMINISTRADOR ||
        userResponsavel?.idPerfil === perfilUtil.VALIDADOR_ASSINANTE ||
        userResponsavel?.areas?.some(a => a?.area?.idArea === areaDiretoria)
      );

      return isRolePermitido && isAssinanteAutorizado && !isDiretorJaAprovou;
    }

    if (idStatusSolicitacao === statusList.ARQUIVADO.id) return false;

    if (idStatusSolicitacao === statusList.CONCLUIDO.id) {
      if (
        userResponsavel?.idPerfil === perfilUtil.ADMINISTRADOR ||
        userResponsavel?.idPerfil === perfilUtil.GESTOR_DO_SISTEMA
      ) return true;
      return false;
    }

    if (idStatusSolicitacao === statusList.EM_ANALISE_GERENTE_REGULATORIO.id) {
      if (userResponsavel?.idPerfil === perfilUtil.ADMINISTRADOR) return true;
      return false;
    }

    if (tramitacaoExecutada != null && tramitacaoExecutada?.length > 0) return false;

    if (todasAreasUsuarioResponderam) return false;

    if (idStatusSolicitacao === statusList.EM_ANALISE_AREA_TECNICA.id
      || idStatusSolicitacao === statusList.VENCIDO_AREA_TECNICA.id
    ) {
      if (flAnaliseGerenteDiretor === AnaliseGerenteDiretor.G) {
        return userResponsavel?.idPerfil === perfilUtil.EXECUTOR_AVANCADO;
      }

      if (flAnaliseGerenteDiretor === AnaliseGerenteDiretor.D) {
        return isRolePermitidoAnaliseAreaTecnicaFlD;
      }

      if (flAnaliseGerenteDiretor === AnaliseGerenteDiretor.A) {
        return isRolePermitidoAnaliseAreaTecnicaFlA;
      }

      if (flAnaliseGerenteDiretor === AnaliseGerenteDiretor.N || !flAnaliseGerenteDiretor) {
        return (
          userResponsavel?.idPerfil === perfilUtil.EXECUTOR_AVANCADO ||
          userResponsavel?.idPerfil === perfilUtil.EXECUTOR ||
          userResponsavel?.idPerfil === perfilUtil.EXECUTOR_RESTRITO
        );
      }

      if (!hasAreaInicial) return true;

      return false;
    }

    if (idStatusSolicitacao === statusList.ANALISE_REGULATORIA.id ||
      idStatusSolicitacao === statusList.VENCIDO_REGULATORIO.id) {
      if (userResponsavel?.idPerfil === perfilUtil.ADMINISTRADOR) return true;
      if (hasAreaInicial && userResponsavel?.idPerfil === perfilUtil.GESTOR_DO_SISTEMA) return true;
      return false;
    }

    if (idStatusSolicitacao === statusList.EM_APROVACAO.id) {
      if (userResponsavel?.idPerfil === perfilUtil.EXECUTOR_AVANCADO) return true;
      return false;
    }

    if (!hasAreaInicial && !isPermissaoEnviandoDevolutiva) return true;

    if (idStatusSolicitacao === statusList.EM_CHANCELA.id) {
      if (userResponsavel?.idPerfil === perfilUtil.ADMINISTRADOR) return true;
      return false;
    }

    return false;
  }, [
    correspond, nrNivelUltimaTramitacao, userResponsavel, idStatusSolicitacao,
    flAnaliseGerenteDiretor, sending, areaDiretoria, isAssinanteAutorizado,
    isDiretorJaAprovou, hasAreaInicial, isPermissaoEnviandoDevolutiva,
    isRolePermitidoAnaliseAreaTecnicaFlA, isRolePermitidoAnaliseAreaTecnicaFlD
  ]);

  const btnTooltip = useMemo(() => {
    const isAreaTecnica = idStatusSolicitacao === statusList.EM_ANALISE_AREA_TECNICA.id;

    if (idStatusSolicitacao === statusList.EM_CHANCELA.id && !(userResponsavel?.idPerfil === perfilUtil.ADMINISTRADOR)) {
      return 'Apenas o Administrador pode responder.';
    }

    if (idStatusSolicitacao === statusList.CONCLUIDO.id) {
      if (
        userResponsavel?.idPerfil !== perfilUtil.ADMINISTRADOR &&
        userResponsavel?.idPerfil !== perfilUtil.GESTOR_DO_SISTEMA
      ) return 'Apenas Administrador e Gestor do Sistema podem arquivar solicitações concluídas.';
    }

    if (idStatusSolicitacao === statusList.EM_ASSINATURA_DIRETORIA.id) {
      if (!isAssinanteAutorizado) return 'Apenas os validadores/assinantes selecionados podem aprovar esta solicitação.';
      if (isDiretorJaAprovou) return 'Já aprovado por um diretor. É necessário outro diretor aprovar.';
    }

    if (isAreaTecnica) {
      if (flAnaliseGerenteDiretor === AnaliseGerenteDiretor.G) return 'Apenas Executor Avançado (Gerente) de cada área pode responder.';
      if (flAnaliseGerenteDiretor === AnaliseGerenteDiretor.D) return 'Diretor, Executor Avançado ou Executor podem responder; é necessária a resposta do Diretor.';
      if (flAnaliseGerenteDiretor === AnaliseGerenteDiretor.A) return 'Precisa do parecer do Executor Avançado (Gerente) e Validador/Assinante (Diretor). Você já respondeu ou não tem o perfil necessário.';

      return 'Podem responder: Executor ou Executor Avançado (Gerente) de cada área.';
    }
    return isPermissaoEnviandoDevolutiva
      ? 'Apenas gerente/diretores da área pode enviar resposta da devolutiva'
      : '';
  }, [idStatusSolicitacao, userResponsavel?.idPerfil, flAnaliseGerenteDiretor, isAssinanteAutorizado, isDiretorJaAprovou, isPermissaoEnviandoDevolutiva]);

  const diretorPermitidoDsParecer = useMemo(() => {
    const isDiretoriaPerfil = userResponsavel?.idPerfil === perfilUtil.VALIDADOR_ASSINANTE;

    if (idStatusSolicitacao === statusList.ARQUIVADO.id) {
      if (
        (userResponsavel?.idPerfil === perfilUtil.ADMINISTRADOR) ||
        (userResponsavel?.idPerfil === perfilUtil.GESTOR_DO_SISTEMA) ||
        isDiretoriaPerfil
      )
        return true;
    }

    if (!isDiretoriaPerfil) return false;
    if (
      (idStatusSolicitacao === statusList.EM_ANALISE_AREA_TECNICA.id ||
        idStatusSolicitacao === statusList.VENCIDO_AREA_TECNICA.id) &&
      (
        flAnaliseGerenteDiretor !== AnaliseGerenteDiretor.N &&
        flAnaliseGerenteDiretor !== AnaliseGerenteDiretor.G
      )
    ) return false;
    if (idStatusSolicitacao === statusList.CONCLUIDO.id) return false;
    if (idStatusSolicitacao === statusList.EM_ASSINATURA_DIRETORIA.id) return false;
    return true;
  }, [userResponsavel?.idPerfil, idStatusSolicitacao, flAnaliseGerenteDiretor]);

  return {
    canListarAnexo,
    canDeletarAnexo,
    canAprovarSolicitacao,
    isPermissaoEnviandoDevolutiva,
    enableEnviarDevolutiva,
    btnTooltip,
    diretorPermitidoDsParecer,
    isAssinanteAutorizado,
    isDiretorJaAprovou,
  };
}
