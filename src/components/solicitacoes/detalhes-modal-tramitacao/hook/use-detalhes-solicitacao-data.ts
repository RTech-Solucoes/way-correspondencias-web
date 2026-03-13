'use client';

import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { TipoResponsavelAnexoEnum } from '@/api/anexos/type';
import { CdAreaEnum } from '@/api/areas/types';
import authClient from '@/api/auth/client';
import { computeTpResponsavel } from '@/api/perfis/types';
import { responsaveisClient } from '@/api/responsaveis/client';
import { ResponsavelResponse } from '@/api/responsaveis/types';
import { solicitacoesClient } from '@/api/solicitacoes';
import { SolicitacaoDetalheResponse, SolicitacaoPrazoResponse } from '@/api/solicitacoes/types';
import { CorrespondenciaDetalheResponse, CorrespondenciaResponse } from '@/api/correspondencia/types';
import statusSolicitacaoClient, { StatusSolicitacaoResponse } from '@/api/status-solicitacao/client';
import { statusList } from '@/api/status-solicitacao/types';
import tramitacoesClient from '@/api/tramitacoes/client';
import areasClient from '@/api/areas/client';
import { CategoriaEnum, TipoEnum } from '@/api/tipos/types';
import { AnaliseGerenteDiretor } from '@/api/solicitacoes/types';

export type UseDetalhesSolicitacaoDataProps = {
  open: boolean;
  correspondencia: CorrespondenciaDetalheResponse | SolicitacaoDetalheResponse | null;
  statusLabel?: string;
};

const formatDateTime = (iso?: string | null) => {
  if (!iso) return '—';
  const d = new Date(iso);
  const date = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false });
  return `${date} às ${time}`;
};

const MAX_DESC_LINES = 6;

export function useDetalhesSolicitacaoData({
  open,
  correspondencia,
  statusLabel = 'Status',
}: UseDetalhesSolicitacaoDataProps) {
  const [tpResponsavelUpload, setTpResponsavelUpload] = useState<TipoResponsavelAnexoEnum>(TipoResponsavelAnexoEnum.A);
  const [hasAreaInicial, setHasAreaInicial] = useState(false);
  const [userResponsavel, setUserResponsavel] = useState<ResponsavelResponse | null>(null);
  const [idProximoStatusAnaliseRegulatoria, setIdProximoStatusAnaliseRegulatoria] = useState<number | null>(null);
  const [responsaveis, setResponsaveis] = useState<ResponsavelResponse[]>([]);
  const [statusListPrazos, setStatusListPrazos] = useState<StatusSolicitacaoResponse[]>([]);
  const [prazosSolicitacaoPorStatus, setPrazosSolicitacaoPorStatus] = useState<SolicitacaoPrazoResponse[]>([]);
  const [areaDiretoria, setAreaDiretoria] = useState<number | null>(null);
  const [expandDescricao, setExpandDescricao] = useState(false);
  const [canToggleDescricao, setCanToggleDescricao] = useState(false);
  const [lineHeightPx, setLineHeightPx] = useState<number | null>(null);
  const descRef = useRef<HTMLParagraphElement | null>(null);

  const correspond = correspondencia as CorrespondenciaDetalheResponse;

  // Identificador
  const identificador = useMemo(
    () => (correspond?.correspondencia?.cdIdentificacao ? `#${correspond.correspondencia.cdIdentificacao}` : ''),
    [correspond?.correspondencia?.cdIdentificacao]
  );

  // Status
  const statusText = correspond?.statusSolicitacao?.nmStatus ?? statusLabel;
  const idStatusSolicitacao = correspond?.statusSolicitacao?.idStatusSolicitacao;

  // Flags de análise
  const flAnaliseGerenteDiretor = correspond?.correspondencia?.flAnaliseGerenteDiretor as AnaliseGerenteDiretor;
  const isExisteCienciaGerenteRegul =
    correspond?.correspondencia?.flExigeCienciaGerenteRegul === 'S';

  // Data de criação formatada
  const criadorLine = useMemo(() => formatDateTime(correspond?.dtCriacao), [correspond?.dtCriacao]);

  // Prazo formatado
  const prazoLine = useMemo(() => {
    const prazoAtual = correspond?.solcitacaoPrazos?.find(
      (p) => +(p?.idStatusSolicitacao) === correspond?.statusSolicitacao?.idStatusSolicitacao &&
        p?.nrPrazoInterno > 0
    );

    if (correspond?.statusSolicitacao?.idStatusSolicitacao === statusList.VENCIDO_AREA_TECNICA.id) {
      const prazoAtualVencido = correspond?.solcitacaoPrazos?.find(
        (p) => +(p?.idStatusSolicitacao) === statusList.EM_ANALISE_AREA_TECNICA.id
      );
      return formatDateTime(prazoAtualVencido?.dtPrazoLimite);
    }

    if (correspond?.statusSolicitacao?.idStatusSolicitacao === statusList.VENCIDO_REGULATORIO.id) {
      const prazoAtualVencido = correspond?.solcitacaoPrazos?.find(
        (p) => +(p?.idStatusSolicitacao) === statusList.ANALISE_REGULATORIA.id
      );
      return formatDateTime(prazoAtualVencido?.dtPrazoLimite);
    }

    if (prazoAtual?.dtPrazoLimite) {
      return formatDateTime(prazoAtual?.dtPrazoLimite);
    }

    return '—';
  }, [correspond?.statusSolicitacao?.idStatusSolicitacao, correspond?.solcitacaoPrazos]);

  // Prazo vencido
  const isPrazoVencido = useMemo(() => {
    const dataAtual = new Date();

    if (correspond?.statusSolicitacao?.idStatusSolicitacao === statusList.VENCIDO_AREA_TECNICA.id) {
      const prazoAtualVencido = correspond?.solcitacaoPrazos?.find(
        (p) => +(p?.idStatusSolicitacao) === statusList.EM_ANALISE_AREA_TECNICA.id
      );
      if (prazoAtualVencido?.dtPrazoLimite) {
        const dataPrazo = new Date(prazoAtualVencido.dtPrazoLimite);
        return dataAtual > dataPrazo;
      }
      return true;
    }

    if (correspond?.statusSolicitacao?.idStatusSolicitacao === statusList.VENCIDO_REGULATORIO.id) {
      const prazoAtualVencido = correspond?.solcitacaoPrazos?.find(
        (p) => +(p?.idStatusSolicitacao) === statusList.ANALISE_REGULATORIA.id
      );
      if (prazoAtualVencido?.dtPrazoLimite) {
        const dataPrazo = new Date(prazoAtualVencido.dtPrazoLimite);
        return dataAtual > dataPrazo;
      }
      return true;
    }

    const prazoAtual = correspond?.solcitacaoPrazos?.find(
      (p) => +(p?.idStatusSolicitacao) === correspond?.statusSolicitacao?.idStatusSolicitacao
    );

    if (prazoAtual?.dtPrazoLimite) {
      const dataPrazo = new Date(prazoAtual.dtPrazoLimite);
      return dataAtual > dataPrazo;
    }

    return false;
  }, [correspond?.statusSolicitacao?.idStatusSolicitacao, correspond?.solcitacaoPrazos]);

  // Dados da correspondência
  const assunto = (correspond?.correspondencia as CorrespondenciaResponse)?.dsAssunto ?? '';
  const descricao = (correspond?.correspondencia as CorrespondenciaResponse)?.dsSolicitacao ?? '';
  const observacao = (correspond?.correspondencia?.dsObservacao?.trim()?.length ?? 0) > 0
    ? correspond?.correspondencia?.dsObservacao ?? null
    : null;

  const areas = useMemo(() =>
    Array.isArray(correspond?.correspondencia?.area)
      ? (correspond!.correspondencia!.area! as Array<{ nmArea: string; idArea?: number; cdArea?: string }>)
      : [],
    [correspond]
  );

  const temaLabel = correspond?.correspondencia?.tema?.nmTema ?? correspond?.correspondencia?.nmTema ?? '—';

  // Flags de status
  const isAprovacao = idStatusSolicitacao === statusList.EM_APROVACAO.id;
  const isDiretoria = idStatusSolicitacao === statusList.EM_ASSINATURA_DIRETORIA.id;
  const isAnaliseRegulatoriaAprovarDevolutiva =
    idStatusSolicitacao === statusList.ANALISE_REGULATORIA.id &&
    idProximoStatusAnaliseRegulatoria === statusList.EM_APROVACAO.id;
  const isConcluido = idStatusSolicitacao === statusList.CONCLUIDO.id;
  const isAnaliseGerenteRegulatorio = idStatusSolicitacao === statusList.EM_ANALISE_GERENTE_REGULATORIO.id;

  const isFlagVisivel =
    isAprovacao ||
    isDiretoria ||
    isAnaliseRegulatoriaAprovarDevolutiva ||
    isConcluido ||
    (isAnaliseGerenteRegulatorio && isExisteCienciaGerenteRegul);

  // Áreas para seleção
  const areasCorrespondentesParaSelecao = useMemo(() => {
    if (!userResponsavel?.areas) {
      return [];
    }

    const statusNaoPermiteSelecaoArea =
      idStatusSolicitacao === statusList.VENCIDO_REGULATORIO.id ||
      idStatusSolicitacao === statusList.ANALISE_REGULATORIA.id ||
      idStatusSolicitacao === statusList.EM_ANALISE_GERENTE_REGULATORIO.id ||
      idStatusSolicitacao === statusList.ARQUIVADO.id ||
      idStatusSolicitacao === statusList.CONCLUIDO.id ||
      idStatusSolicitacao === statusList.PRE_ANALISE.id ||
      idStatusSolicitacao === statusList.EM_CHANCELA.id;

    if (statusNaoPermiteSelecaoArea) {
      return [];
    }

    const areasCorrespondencia = Array.isArray(correspond?.correspondencia?.area)
      ? (correspond.correspondencia.area as Array<{ idArea?: number; nmArea?: string }>)
        .map(a => a?.idArea)
        .filter((id): id is number => id !== undefined && id !== null)
      : [];

    // Buscar o nível da última tramitação
    const nrNivelUltimaTramitacao = correspond?.tramitacoes?.[0]?.tramitacao?.nrNivel;

    // Identificar áreas que QUALQUER USUÁRIO já respondeu neste nível e status
    // Regra: Cada área só pode ter UMA resposta (independente de quem respondeu)
    // IMPORTANTE: Se o status for VENCIDO_AREA_TECNICA, validar como se fosse EM_ANALISE_AREA_TECNICA
    const statusParaValidacao = 
      idStatusSolicitacao === statusList.VENCIDO_AREA_TECNICA.id
        ? statusList.EM_ANALISE_AREA_TECNICA.id
        : idStatusSolicitacao;

    const areasJaRespondidasPorQualquerUsuario = correspond?.tramitacoes
      ?.filter(t =>
        t?.tramitacao?.nrNivel === nrNivelUltimaTramitacao &&
        t?.tramitacao?.idStatusSolicitacao === statusParaValidacao &&
        t?.tramitacao?.tramitacaoAcao?.some(ta => ta.flAcao === 'T')
      )
      .map(t => t?.tramitacao?.areaOrigem?.idArea)
      .filter((id): id is number => id !== undefined && id !== null) || [];


    // Retornar TODAS as áreas que:
    // 1. O usuário tem acesso
    // 2. Estão na solicitação
    // Com indicação de quais já foram respondidas (por qualquer pessoa) para desabilitar
    return userResponsavel.areas
      .filter((respArea) => {
        const respAreaId = respArea?.area?.idArea;
        return (
          respAreaId !== undefined && 
          areasCorrespondencia.includes(respAreaId)
        );
      })
      .map((respArea) => {
        const areaId = respArea?.area?.idArea;
        // Desabilita se QUALQUER pessoa já respondeu por esta área
        const foiRespondida = areaId !== undefined ? areasJaRespondidasPorQualquerUsuario.includes(areaId) : false;
        return {
          idArea: areaId,
          nmArea: respArea?.area?.nmArea || '',
          disabled: foiRespondida
        };
      })
      .filter((area): area is { idArea: number; nmArea: string; disabled: boolean } => 
        area.idArea !== undefined && area.idArea !== null
      );
  }, [userResponsavel?.areas, idStatusSolicitacao, correspond]);

  // Verifica se o usuário tem mais de uma área em comum com a solicitação
  const isResponsavelPossuiMaisUmaAreaIgualSolicitacao = areasCorrespondentesParaSelecao.length > 1;

  const areaParaAutoSelecao = useMemo(() => {
    // Só auto-seleciona se houver múltiplas áreas inicialmente
    if (areasCorrespondentesParaSelecao.length <= 1) return null;
    
    // Filtra apenas áreas que NÃO estão desabilitadas (ainda podem ser respondidas)
    const areasDisponiveis = areasCorrespondentesParaSelecao.filter(area => !area.disabled);
    
    // Se só resta uma área disponível, auto-seleciona ela
    if (areasDisponiveis.length === 1) {
      return areasDisponiveis[0].idArea;
    }
    
    return null;
  }, [areasCorrespondentesParaSelecao]);

  // Quantidade de devolutivas
  const quantidadeDevolutivas = useMemo(() => {
    const qtdTramitacoes = correspond?.tramitacoes?.filter((t) => !!t?.tramitacao?.idTramitacao)?.length ?? 0;
    const qtdPareceres = correspond?.solicitacaoPareceres?.length ?? 0;
    return qtdTramitacoes + qtdPareceres;
  }, [correspond?.tramitacoes, correspond?.solicitacaoPareceres]);

  // Reprovações da diretoria
  const devolutivaReprovadaUmavezDiretoria = correspond?.tramitacoes?.some(
    t => t.tramitacao.idStatusSolicitacao === statusList.EM_ASSINATURA_DIRETORIA.id && t.tramitacao.flAprovado === 'N'
  );

  const devolutivaReprovadaPelaDiretoriaSegundaVez = useMemo(() => {
    const reprovacoesCount = correspond?.tramitacoes?.filter(
      t => t.tramitacao.idStatusSolicitacao === statusList.EM_ASSINATURA_DIRETORIA.id && t.tramitacao.flAprovado === 'N'
    )?.length || 0;
    return reprovacoesCount >= 2;
  }, [correspond?.tramitacoes]);

  // Prazo total
  const currentPrazoTotal = useMemo(() => {
    return correspond?.solcitacaoPrazos?.reduce((acc, curr) => acc + curr.nrPrazoInterno, 0);
  }, [correspond?.solcitacaoPrazos]);

  // Medição da descrição para expandir/colapsar
  const measureDescricao = useCallback(() => {
    const el = descRef.current;
    if (!el) {
      setCanToggleDescricao(false);
      return;
    }
    const styles = window.getComputedStyle(el);
    const lh = parseFloat(styles.lineHeight || '0');
    if (!Number.isNaN(lh) && lh > 0) setLineHeightPx(lh);

    const prevMaxHeight = el.style.maxHeight;
    const prevOverflow = el.style.overflow;
    el.style.maxHeight = 'none';
    el.style.overflow = 'visible';

    const fullHeight = el.scrollHeight;
    const maxAllowed = (lh || 0) * MAX_DESC_LINES;

    el.style.maxHeight = prevMaxHeight;
    el.style.overflow = prevOverflow;

    setCanToggleDescricao(fullHeight > maxAllowed + 1);
  }, []);

  // Effects para carregar dados
  useEffect(() => {
    const loadResponsaveis = async () => {
      const resp = await responsaveisClient.buscarPorFiltro({ size: 1000 });
      setResponsaveis(resp.content);
    };
    loadResponsaveis();
  }, []);

  useEffect(() => {
    const loadStatusList = async () => {
      try {
        const status = await statusSolicitacaoClient.listarTodos(
          CategoriaEnum.CLASSIFICACAO_STATUS_SOLICITACAO,
          [TipoEnum.TODOS, TipoEnum.CORRESPONDENCIA]
        );
        setStatusListPrazos(status);
      } catch (error) {
        console.error('Erro ao carregar lista de status:', error);
      }
    };

    if (open) {
      loadStatusList();
    }
  }, [open]);

  useEffect(() => {
    const loadPrazos = async () => {
      const prazos = await solicitacoesClient.listarPrazos(correspond?.correspondencia?.idSolicitacao || 0);
      setPrazosSolicitacaoPorStatus(prazos || []);
    };
    if (correspond?.correspondencia?.idSolicitacao) {
      loadPrazos();
    }
  }, [correspond?.correspondencia?.idSolicitacao]);

  useEffect(() => {
    const checkResponsavelInicial = async () => {
      try {
        const userName = authClient.getUserName();
        if (!userName) {
          setTpResponsavelUpload(TipoResponsavelAnexoEnum.A);
          setHasAreaInicial(false);
          return;
        }
        const resp = await responsaveisClient.buscarPorNmUsuarioLogin(userName);
        setUserResponsavel(resp);
        const idPerfil = resp?.idPerfil;

        const idAreaInicial = correspond?.correspondencia?.idAreaInicial;
        const userAreaIds = (resp?.areas || [])
          .map((a: { area?: { idArea?: number | string; nmArea?: string } } | null | undefined) => a?.area?.idArea)
          .map((id) => +((id as unknown) as number))
          .filter((id) => !Number.isNaN(id));

        let isInSolicAreas = false;
        if (idAreaInicial) {
          const areaInicialNum = +idAreaInicial;
          isInSolicAreas = !Number.isNaN(areaInicialNum) && userAreaIds.includes(areaInicialNum);
        } else {
          const areasSolic = Array.isArray(correspond?.correspondencia?.area)
            ? (correspond!.correspondencia!.area as Array<{ idArea?: number; nmArea?: string }>)
            : [];
          const solicitacaoAreaIds = areasSolic
            .map(a => +((a?.idArea as unknown) as number))
            .filter((id) => !Number.isNaN(id));
          isInSolicAreas = userAreaIds.some(id => solicitacaoAreaIds.includes(id));
        }

        const tp = computeTpResponsavel(idPerfil);

        setTpResponsavelUpload(tp);
        setHasAreaInicial(isInSolicAreas);
      } catch {
        setTpResponsavelUpload(TipoResponsavelAnexoEnum.A);
        setHasAreaInicial(false);
      }
    };

    if (open && correspond?.correspondencia?.idSolicitacao) {
      checkResponsavelInicial();
    }
  }, [open, correspond?.correspondencia?.idSolicitacao, correspond?.correspondencia?.area, correspond]);

  useEffect(() => {
    measureDescricao();
  }, [open, descricao, measureDescricao]);

  useEffect(() => {
    const el = descRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => measureDescricao());
    ro.observe(el);
    return () => ro.disconnect();
  }, [measureDescricao]);

  useEffect(() => {
    const loadAreaDiretoria = async () => {
      try {
        const area = await areasClient.buscarPorCdArea(CdAreaEnum.DIRETORIA);
        setAreaDiretoria(area.idArea);
      } catch (error) {
        console.error('Erro ao carregar área diretoria:', error);
        setAreaDiretoria(null);
      }
    };
    loadAreaDiretoria();
  }, []);

  useEffect(() => {
    const loadIdProximoStatusAnaliseRegulatoria = async () => {
      if (!correspond?.correspondencia?.idSolicitacao || !correspond?.statusSolicitacao?.idStatusSolicitacao) {
        setIdProximoStatusAnaliseRegulatoria(null);
        return;
      }
      const response = await tramitacoesClient.buscarProximoStatusPorIdSolicitacaoEIdStatusSolicitacao({
        idSolicitacao: correspond.correspondencia.idSolicitacao,
        idStatusSolicitacao: correspond.statusSolicitacao.idStatusSolicitacao,
      });
      setIdProximoStatusAnaliseRegulatoria(response ?? null);
    };
    loadIdProximoStatusAnaliseRegulatoria();
  }, [correspond?.correspondencia?.idSolicitacao, correspond?.statusSolicitacao?.idStatusSolicitacao]);

  return {
    // Dados
    correspond,
    identificador,
    statusText,
    idStatusSolicitacao,
    flAnaliseGerenteDiretor,
    isExisteCienciaGerenteRegul,
    criadorLine,
    prazoLine,
    isPrazoVencido,
    assunto,
    descricao,
    observacao,
    areas,
    temaLabel,
    responsaveis,
    statusListPrazos,
    prazosSolicitacaoPorStatus,
    userResponsavel,
    areaDiretoria,
    hasAreaInicial,
    tpResponsavelUpload,
    idProximoStatusAnaliseRegulatoria,
    currentPrazoTotal,
    quantidadeDevolutivas,

    // Flags de status
    isAprovacao,
    isDiretoria,
    isAnaliseRegulatoriaAprovarDevolutiva,
    isConcluido,
    isAnaliseGerenteRegulatorio,
    isFlagVisivel,
    devolutivaReprovadaUmavezDiretoria,
    devolutivaReprovadaPelaDiretoriaSegundaVez,

    // Áreas
    areasCorrespondentesParaSelecao,
    isResponsavelPossuiMaisUmaAreaIgualSolicitacao,
    areaParaAutoSelecao,

    // Descrição expandir/colapsar
    expandDescricao,
    setExpandDescricao,
    canToggleDescricao,
    lineHeightPx,
    descRef,
    MAX_DESC_LINES,
  };
}
