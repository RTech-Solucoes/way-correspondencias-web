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
    // Validação antiga: Se o usuário tem apenas 1 área e já respondeu, bloqueia
    const tramitacaoExecutada = correspond?.tramitacoes?.filter(t =>
      t?.tramitacao?.nrNivel === nrNivelUltimaTramitacao &&
      t?.tramitacao?.idStatusSolicitacao === correspond?.statusSolicitacao?.idStatusSolicitacao &&
      t?.tramitacao?.tramitacaoAcao?.some(ta =>
        ta?.responsavelArea?.responsavel?.idResponsavel === userResponsavel?.idResponsavel &&
        ta.flAcao === 'T'
      )
    );

    // Verifica se o PRÓPRIO USUÁRIO já respondeu por todas as suas áreas
    // Regra: Cada USUÁRIO pode responder UMA VEZ por cada área que ele tem acesso
    const { todasAreasUsuarioRespondeu, existemAreasPendentesDoUsuario, temApenasUmaArea } = (() => {
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

      if (areasUsuarioNaSolicitacao.length === 0) return { todasAreasUsuarioRespondeu: false, existemAreasPendentesDoUsuario: false, temApenasUmaArea: false };
      
      const temApenasUmaAreaComum = areasUsuarioNaSolicitacao.length === 1;

      // Áreas que QUALQUER USUÁRIO já respondeu no mesmo nível e status
      // Regra: Cada área só pode ter UMA resposta (independente de quem respondeu)
      const areasJaRespondidasPorQualquerUsuario = correspond?.tramitacoes
        ?.filter(t =>
          t?.tramitacao?.nrNivel === nrNivelUltimaTramitacao &&
          correspond?.statusSolicitacao?.idStatusSolicitacao !== statusList.EM_ASSINATURA_DIRETORIA.id &&
          t?.tramitacao?.idStatusSolicitacao === correspond?.statusSolicitacao?.idStatusSolicitacao &&
          t?.tramitacao?.tramitacaoAcao?.some(ta => ta.flAcao === 'T') &&
          !((correspond?.statusSolicitacao?.idStatusSolicitacao === statusList.EM_ANALISE_AREA_TECNICA.id ||
            correspond?.statusSolicitacao?.idStatusSolicitacao === statusList.VENCIDO_AREA_TECNICA.id) &&
            (flAnaliseGerenteDiretor === AnaliseGerenteDiretor.D ||
              flAnaliseGerenteDiretor === AnaliseGerenteDiretor.A)
          )
        )
        .map(t => t?.tramitacao?.areaOrigem?.idArea)
        .filter((id): id is number => id !== undefined && id !== null) || [];

      // Verifica se TODAS as áreas do usuário já foram respondidas (por qualquer pessoa)
      const todasResponderam = areasUsuarioNaSolicitacao.every(areaId =>
        areasJaRespondidasPorQualquerUsuario.includes(areaId)
      );

      // Verifica se ainda existem áreas que NÃO foram respondidas por NINGUÉM
      const areasPendentes = areasUsuarioNaSolicitacao.filter(areaId =>
        !areasJaRespondidasPorQualquerUsuario.includes(areaId)
      );

      return { 
        todasAreasUsuarioRespondeu: todasResponderam, 
        existemAreasPendentesDoUsuario: areasPendentes.length > 0,
        temApenasUmaArea: temApenasUmaAreaComum
      };
    })();

    if (sending) return false;

    // Validação antiga: Se o usuário tem apenas 1 área em comum e já respondeu, bloqueia
    // Se tem múltiplas áreas, permite responder por cada uma
    if (temApenasUmaArea && tramitacaoExecutada != null && tramitacaoExecutada?.length > 0) return false;

    if (idStatusSolicitacao === statusList.EM_ASSINATURA_DIRETORIA.id) {
      const isRolePermitido = (
        userResponsavel?.idPerfil === perfilUtil.ADMINISTRADOR ||
        userResponsavel?.idPerfil === perfilUtil.SUPER_ADMIN ||
        userResponsavel?.idPerfil === perfilUtil.VALIDADOR_ASSINANTE ||
        userResponsavel?.areas?.some(a => a?.area?.idArea === areaDiretoria)
      );

      return isRolePermitido && isAssinanteAutorizado && !isDiretorJaAprovou;
    }

    if (idStatusSolicitacao === statusList.ARQUIVADO.id) return false;

    if (idStatusSolicitacao === statusList.CONCLUIDO.id) {
      if (
        userResponsavel?.idPerfil === perfilUtil.ADMINISTRADOR ||
        userResponsavel?.idPerfil === perfilUtil.SUPER_ADMIN ||
        userResponsavel?.idPerfil === perfilUtil.GESTOR_DO_SISTEMA
      ) return true;
      return false;
    }

    if (idStatusSolicitacao === statusList.EM_ANALISE_GERENTE_REGULATORIO.id) {
      if (userResponsavel?.idPerfil === perfilUtil.ADMINISTRADOR || userResponsavel?.idPerfil === perfilUtil.SUPER_ADMIN) return true;
      return false;
    }

    // Se o PRÓPRIO USUÁRIO já respondeu por TODAS as suas áreas, bloqueia
    // Caso ainda existam áreas que ele não respondeu, permite continuar
    if (todasAreasUsuarioRespondeu && !existemAreasPendentesDoUsuario) return false;

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
      if (userResponsavel?.idPerfil === perfilUtil.ADMINISTRADOR || userResponsavel?.idPerfil === perfilUtil.SUPER_ADMIN) return true;
      if (hasAreaInicial && userResponsavel?.idPerfil === perfilUtil.GESTOR_DO_SISTEMA) return true;
      return false;
    }

    if (idStatusSolicitacao === statusList.EM_APROVACAO.id) {
      if (userResponsavel?.idPerfil === perfilUtil.EXECUTOR_AVANCADO) return true;
      return false;
    }

    if (!hasAreaInicial && !isPermissaoEnviandoDevolutiva) return true;

    if (idStatusSolicitacao === statusList.EM_CHANCELA.id) {
      if (userResponsavel?.idPerfil === perfilUtil.ADMINISTRADOR || userResponsavel?.idPerfil === perfilUtil.SUPER_ADMIN) return true;
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
    // Se o botão está habilitado, não precisa de tooltip
    if (enableEnviarDevolutiva) return '';

    // Verificar as mesmas condições do enableEnviarDevolutiva para dar mensagens específicas
    const isAreaTecnica = idStatusSolicitacao === statusList.EM_ANALISE_AREA_TECNICA.id;
    
    // Validação: Se o usuário tem apenas 1 área e já respondeu
    const tramitacaoExecutada = correspond?.tramitacoes?.filter(t =>
      t?.tramitacao?.nrNivel === nrNivelUltimaTramitacao &&
      t?.tramitacao?.idStatusSolicitacao === correspond?.statusSolicitacao?.idStatusSolicitacao &&
      t?.tramitacao?.tramitacaoAcao?.some(ta =>
        ta?.responsavelArea?.responsavel?.idResponsavel === userResponsavel?.idResponsavel &&
        ta.flAcao === 'T'
      )
    );

    const { todasAreasUsuarioRespondeu, existemAreasPendentesDoUsuario, temApenasUmaArea } = (() => {
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

      if (areasUsuarioNaSolicitacao.length === 0) return { todasAreasUsuarioRespondeu: false, existemAreasPendentesDoUsuario: false, temApenasUmaArea: false };
      
      const temApenasUmaAreaComum = areasUsuarioNaSolicitacao.length === 1;

      const areasJaRespondidasPorQualquerUsuario = correspond?.tramitacoes
        ?.filter(t =>
          t?.tramitacao?.nrNivel === nrNivelUltimaTramitacao &&
          correspond?.statusSolicitacao?.idStatusSolicitacao !== statusList.EM_ASSINATURA_DIRETORIA.id &&
          t?.tramitacao?.idStatusSolicitacao === correspond?.statusSolicitacao?.idStatusSolicitacao &&
          t?.tramitacao?.tramitacaoAcao?.some(ta => ta.flAcao === 'T') &&
          !((correspond?.statusSolicitacao?.idStatusSolicitacao === statusList.EM_ANALISE_AREA_TECNICA.id ||
            correspond?.statusSolicitacao?.idStatusSolicitacao === statusList.VENCIDO_AREA_TECNICA.id) &&
            (flAnaliseGerenteDiretor === AnaliseGerenteDiretor.D ||
              flAnaliseGerenteDiretor === AnaliseGerenteDiretor.A)
          )
        )
        .map(t => t?.tramitacao?.areaOrigem?.idArea)
        .filter((id): id is number => id !== undefined && id !== null) || [];

      const todasResponderam = areasUsuarioNaSolicitacao.every(areaId =>
        areasJaRespondidasPorQualquerUsuario.includes(areaId)
      );

      const areasPendentes = areasUsuarioNaSolicitacao.filter(areaId =>
        !areasJaRespondidasPorQualquerUsuario.includes(areaId)
      );

      return { 
        todasAreasUsuarioRespondeu: todasResponderam, 
        existemAreasPendentesDoUsuario: areasPendentes.length > 0,
        temApenasUmaArea: temApenasUmaAreaComum
      };
    })();

    // Verificar condições na mesma ordem do enableEnviarDevolutiva
    if (sending) {
      return 'Enviando resposta...';
    }

    if (temApenasUmaArea && tramitacaoExecutada != null && tramitacaoExecutada?.length > 0) {
      return 'Você já respondeu por esta área. Cada área só pode ter uma resposta.';
    }

    if (idStatusSolicitacao === statusList.ARQUIVADO.id) {
      return 'Esta solicitação está arquivada e não pode ser respondida.';
    }

    if (idStatusSolicitacao === statusList.EM_ASSINATURA_DIRETORIA.id) {
      const isRolePermitido = (
        userResponsavel?.idPerfil === perfilUtil.ADMINISTRADOR ||
        userResponsavel?.idPerfil === perfilUtil.SUPER_ADMIN ||
        userResponsavel?.idPerfil === perfilUtil.VALIDADOR_ASSINANTE ||
        userResponsavel?.areas?.some(a => a?.area?.idArea === areaDiretoria)
      );

      if (!isRolePermitido) {
        return 'Apenas Administrador, Super Admin, Gestor do Sistema, Validador/Assinante ou responsáveis da Diretoria podem aprovar.';
      }
      if (!isAssinanteAutorizado) {
        return 'Apenas os validadores/assinantes selecionados podem aprovar esta solicitação.';
      }
      if (isDiretorJaAprovou) {
        return 'Já aprovado por um diretor. É necessário outro diretor aprovar.';
      }
    }

    if (idStatusSolicitacao === statusList.CONCLUIDO.id) {
      if (
        userResponsavel?.idPerfil !== perfilUtil.ADMINISTRADOR &&
        userResponsavel?.idPerfil !== perfilUtil.SUPER_ADMIN &&
        userResponsavel?.idPerfil !== perfilUtil.GESTOR_DO_SISTEMA
      ) {
        return 'Apenas Administrador, Super Admin e Gestor do Sistema podem arquivar solicitações concluídas.';
      }
    }

    if (idStatusSolicitacao === statusList.EM_ANALISE_GERENTE_REGULATORIO.id || idStatusSolicitacao === statusList.VENCIDO_REGULATORIO.id) {
      if (userResponsavel?.idPerfil !== perfilUtil.ADMINISTRADOR && userResponsavel?.idPerfil !== perfilUtil.SUPER_ADMIN) {
        return 'Apenas Administrador, Gestor do Sistema e Super Admin podem responder nesta etapa.';
      }
    }

    if (todasAreasUsuarioRespondeu && !existemAreasPendentesDoUsuario) {
      return 'Todas as suas áreas já foram respondidas. Não há mais áreas pendentes para você responder.';
    }

    if (isAreaTecnica || idStatusSolicitacao === statusList.VENCIDO_AREA_TECNICA.id) {
      if (flAnaliseGerenteDiretor === AnaliseGerenteDiretor.G) {
        if (userResponsavel?.idPerfil !== perfilUtil.EXECUTOR_AVANCADO) {
          return 'Apenas Executor Avançado (Gerente) de cada área pode responder.';
        }
      }

      if (flAnaliseGerenteDiretor === AnaliseGerenteDiretor.D) {
        if (!isRolePermitidoAnaliseAreaTecnicaFlD) {
          return 'Diretor, Executor Avançado ou Executor podem responder; é necessária a resposta do Diretor.';
        }
      }

      if (flAnaliseGerenteDiretor === AnaliseGerenteDiretor.A) {
        if (!isRolePermitidoAnaliseAreaTecnicaFlA) {
          return 'Precisa do parecer do Executor Avançado (Gerente) e Validador/Assinante (Diretor). Você já respondeu ou não tem o perfil necessário.';
        }
      }

      if (flAnaliseGerenteDiretor === AnaliseGerenteDiretor.N || !flAnaliseGerenteDiretor) {
        if (
          userResponsavel?.idPerfil !== perfilUtil.EXECUTOR_AVANCADO &&
          userResponsavel?.idPerfil !== perfilUtil.EXECUTOR &&
          userResponsavel?.idPerfil !== perfilUtil.EXECUTOR_RESTRITO
        ) {
          return 'Podem responder: Executor, Executor Avançado (Gerente) ou Executor Restrito de cada área.';
        }
      }

      if (hasAreaInicial && !(
        (flAnaliseGerenteDiretor === AnaliseGerenteDiretor.G && userResponsavel?.idPerfil === perfilUtil.EXECUTOR_AVANCADO) ||
        (flAnaliseGerenteDiretor === AnaliseGerenteDiretor.D && isRolePermitidoAnaliseAreaTecnicaFlD) ||
        (flAnaliseGerenteDiretor === AnaliseGerenteDiretor.A && isRolePermitidoAnaliseAreaTecnicaFlA) ||
        ((flAnaliseGerenteDiretor === AnaliseGerenteDiretor.N || !flAnaliseGerenteDiretor) && (
          userResponsavel?.idPerfil === perfilUtil.EXECUTOR_AVANCADO ||
          userResponsavel?.idPerfil === perfilUtil.EXECUTOR ||
          userResponsavel?.idPerfil === perfilUtil.EXECUTOR_RESTRITO
        ))
      )) {
        return 'Você não tem permissão para responder nesta etapa ou não possui área inicial nesta solicitação.';
      }
    }

    if (idStatusSolicitacao === statusList.ANALISE_REGULATORIA.id ||
      idStatusSolicitacao === statusList.VENCIDO_REGULATORIO.id) {
      if (userResponsavel?.idPerfil !== perfilUtil.ADMINISTRADOR && userResponsavel?.idPerfil !== perfilUtil.SUPER_ADMIN) {
        if (hasAreaInicial && userResponsavel?.idPerfil !== perfilUtil.GESTOR_DO_SISTEMA) {
          return 'Apenas Administrador, Super Admin ou Gestor do Sistema (com área inicial) podem responder.';
        }
        return 'Apenas Administrador, Super Admin ou Gestor do Sistema podem responder nesta etapa.';
      }
    }

    if (idStatusSolicitacao === statusList.EM_APROVACAO.id) {
      if (userResponsavel?.idPerfil !== perfilUtil.EXECUTOR_AVANCADO) {
        return 'Apenas Executor Avançado pode responder nesta etapa.';
      }
    }

    if (idStatusSolicitacao === statusList.EM_CHANCELA.id) {
      if (userResponsavel?.idPerfil !== perfilUtil.ADMINISTRADOR && userResponsavel?.idPerfil !== perfilUtil.SUPER_ADMIN) {
        return 'Apenas o Administrador  ou Super Admin pode responder.';
      }
    }

    if (isPermissaoEnviandoDevolutiva) {
      return 'Apenas gerente/diretores da área pode enviar resposta da devolutiva.';
    }

    return 'Você não tem permissão para enviar resposta nesta solicitação.';
  }, [
    enableEnviarDevolutiva, sending, idStatusSolicitacao, userResponsavel, flAnaliseGerenteDiretor,
    isAssinanteAutorizado, isDiretorJaAprovou, isPermissaoEnviandoDevolutiva, hasAreaInicial,
    areaDiretoria, isRolePermitidoAnaliseAreaTecnicaFlA, isRolePermitidoAnaliseAreaTecnicaFlD,
    correspond, nrNivelUltimaTramitacao
  ]);

  const diretorPermitidoDsParecer = useMemo(() => {
    const isDiretoriaPerfil = userResponsavel?.idPerfil === perfilUtil.VALIDADOR_ASSINANTE;

    if (idStatusSolicitacao === statusList.ARQUIVADO.id) {
      if (
        (userResponsavel?.idPerfil === perfilUtil.ADMINISTRADOR || userResponsavel?.idPerfil === perfilUtil.SUPER_ADMIN) ||
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
