'use client';

import { useCallback, useEffect, useState } from 'react';
import { anexosClient } from '@/api/anexos/client';
import { AnexoResponse, TipoObjetoAnexoEnum } from '@/api/anexos/type';
import { areasClient } from '@/api/areas/client';
import { AreaResponse } from '@/api/areas/types';
import authClient from '@/api/auth/client';
import responsaveisClient from '@/api/responsaveis/client';
import solicitacaoAssinanteClient from '@/api/solicitacao-assinante/client';
import { solicitacoesClient } from '@/api/solicitacoes/client';
import { SolicitacaoPrazoResponse } from '@/api/solicitacoes/types';
import { StatusSolicPrazoTemaForUI } from '@/api/status-prazo-tema/types';
import { statusSolicitacaoClient, StatusSolicitacaoResponse } from '@/api/status-solicitacao/client';
import { statusList as statusListType } from '@/api/status-solicitacao/types';
import { CategoriaEnum, TipoEnum } from '@/api/tipos/types';
import { CorrespondenciaResponse } from '@/api/correspondencia/types';
import { SolicitacaoFormData } from '../types';

interface UseSolicitacaoDataProps {
  correspondencia: CorrespondenciaResponse | null;
  open: boolean;
  currentStep: number;
  formData: SolicitacaoFormData;
  updateFormData: (data: Partial<SolicitacaoFormData>) => void;
}

export function useSolicitacaoData({
  correspondencia,
  open,
  currentStep,
  formData,
  updateFormData,
}: UseSolicitacaoDataProps) {
  const [anexos, setAnexos] = useState<File[]>([]);
  const [anexosBackend, setAnexosBackend] = useState<AnexoResponse[]>([]);
  const [anexosTypeE, setAnexosTypeE] = useState<AnexoResponse[]>([]);
  const [statusPrazos, setStatusPrazos] = useState<StatusSolicPrazoTemaForUI[]>([]);
  const [loadingStatusPrazos, setLoadingStatusPrazos] = useState(false);
  const [statusList, setStatusList] = useState<StatusSolicitacaoResponse[]>([]);
  const [allAreas, setAllAreas] = useState<AreaResponse[]>([]);
  const [hasLoadedStatusPrazos, setHasLoadedStatusPrazos] = useState(false);
  const [prazosSolicitacaoPorStatus, setPrazosSolicitacaoPorStatus] = useState<SolicitacaoPrazoResponse[]>([]);
  const [userResponsavelIdPerfil, setUserResponsavelIdPerfil] = useState<number>(0);

  // Carregar prazos da solicitação
  useEffect(() => {
    const loadPrazos = async () => {
      const prazosSolicitacaoPorStatus = await solicitacoesClient.listarPrazos(correspondencia?.idSolicitacao || 0);
      setPrazosSolicitacaoPorStatus(prazosSolicitacaoPorStatus || []);

      if (correspondencia) {
        try {
          const temaId = formData.idTema || correspondencia?.idTema || correspondencia?.tema?.idTema || 0;
          const temaNome = correspondencia?.tema?.nmTema || '';
          if ((prazosSolicitacaoPorStatus || []).length > 0) {
            const mapped = (prazosSolicitacaoPorStatus || []).map(p => ({
              idStatusSolicPrazoTema: 0,
              idStatusSolicitacao: p.idStatusSolicitacao,
              idTema: temaId,
              nrPrazoInterno: p.nrPrazoInterno || 0,
              nrPrazoExterno: 0,
              tema: { idTema: temaId, nmTema: temaNome },
              flAtivo: 'S',
            })) as StatusSolicPrazoTemaForUI[];
            setStatusPrazos(mapped);
            // Atualizar também no formData para sincronização
            updateFormData({ statusPrazos: mapped });
          }
        } catch {}
      }
    };
    if (correspondencia?.idSolicitacao) {
      loadPrazos();
    }
  }, [correspondencia?.idSolicitacao, formData.idTema, updateFormData]);

  // Carregar anexos do backend
  useEffect(() => {
    if (correspondencia && correspondencia.idSolicitacao && open) {
      solicitacoesClient.buscarAnexos(correspondencia.idSolicitacao).then(anexos => {
        setAnexosBackend(anexos);
      });
    } else {
      setAnexosBackend([]);
    }
    if (!open) {
      setAnexos([]);
    }
  }, [correspondencia, open]);

  // Carregar assinantes
  useEffect(() => {
    const loadAssinantes = async () => {
      if (correspondencia?.idSolicitacao && open) {
        try {
          const assinantes = await solicitacaoAssinanteClient.buscarPorIdSolicitacaoEIdStatusSolicitacao(
            correspondencia.idSolicitacao,
            [statusListType.EM_ASSINATURA_DIRETORIA.id]
          );
          const idsAssinantes = assinantes.map(a => a.idResponsavel);
          updateFormData({ idsResponsaveisAssinates: idsAssinantes });
        } catch (error) {
          console.error('Erro ao carregar assinantes:', error);
        }
      }
    };
    loadAssinantes();
  }, [correspondencia?.idSolicitacao, open]);

  // Carregar todas as áreas
  useEffect(() => {
    const loadAllAreas = async () => {
      try {
        const areaResponse = await areasClient.buscarPorFiltro({ size: 1000 });
        const areasAtivas = areaResponse.content.filter((area: AreaResponse) => area.flAtivo === 'S');
        setAllAreas(areasAtivas);
      } catch (error) {
        console.error('Erro ao carregar áreas:', error);
        setAllAreas([]);
      }
    };
    if (open) {
      loadAllAreas();
    }
  }, [open]);

  // Carregar user responsável
  useEffect(() => {
    const loadUserResponsavel = async () => {
      const userName = authClient.getUserName();
      if (userName) {
        const resp = await responsaveisClient.buscarPorNmUsuarioLogin(userName);
        setUserResponsavelIdPerfil(resp?.idPerfil || 0);
      }
    };
    if (open) {
      loadUserResponsavel();
    }
  }, [open]);

  // Carregar lista de status
  useEffect(() => {
    const loadStatusList = async () => {
      try {
        const status = await statusSolicitacaoClient.listarTodos(CategoriaEnum.CLASSIFICACAO_STATUS_SOLICITACAO, [
          TipoEnum.TODOS,
          TipoEnum.CORRESPONDENCIA,
        ]);
        setStatusList(status);
      } catch (error) {
        console.error('Erro ao carregar lista de status:', error);
      }
    };
    if (open) {
      loadStatusList();
    }
  }, [open]);

  // Carregar status prazos
  const loadStatusPrazos = useCallback(
    async (isRefresh: boolean = false) => {
      if (!formData.idTema || (hasLoadedStatusPrazos && !isRefresh)) return;

      try {
        setLoadingStatusPrazos(true);

        if (prazosSolicitacaoPorStatus.length > 0) {
          const temaId = formData.idTema || correspondencia?.idTema || correspondencia?.tema?.idTema || 0;
          const temaNome = correspondencia?.tema?.nmTema || '';
          const mapped = prazosSolicitacaoPorStatus.map(p => ({
            idStatusSolicPrazoTema: 0,
            idStatusSolicitacao: p.idStatusSolicitacao,
            idTema: temaId,
            nrPrazoInterno: p.nrPrazoInterno || 0,
            tema: { idTema: temaId, nmTema: temaNome },
            flAtivo: 'S',
          })) as StatusSolicPrazoTemaForUI[];
          setStatusPrazos(mapped);
        } else {
          // Se não há prazos, usar padrão
          const defaultPrazos = getDefaultPrazos();
          setStatusPrazos(defaultPrazos);
        }
      } catch (error) {
        console.error('Erro ao carregar prazos por status:', error);
      } finally {
        setLoadingStatusPrazos(false);
        setHasLoadedStatusPrazos(true);
      }
    },
    [formData.idTema, hasLoadedStatusPrazos, prazosSolicitacaoPorStatus, correspondencia]
  );

  useEffect(() => {
    if (formData.idTema && open) {
      loadStatusPrazos();
    }
  }, [formData.idTema, open, loadStatusPrazos]);

  // Carregar anexos tipo E
  useEffect(() => {
    const loadAnexosTypeE = async () => {
      const idEmail = correspondencia?.idEmail || correspondencia?.email?.idEmail;
      if (idEmail && open) {
        try {
          const anexosE = await anexosClient.buscarPorIdObjetoETipoObjeto(idEmail, TipoObjetoAnexoEnum.E);
          setAnexosTypeE(anexosE || []);
        } catch (error) {
          console.error('Erro ao carregar anexos tipo E:', error);
          setAnexosTypeE([]);
        }
      } else {
        setAnexosTypeE([]);
      }
    };
    loadAnexosTypeE();
  }, [open, correspondencia?.idEmail, correspondencia?.email?.idEmail]);

  const getDefaultPrazos = useCallback((): StatusSolicPrazoTemaForUI[] => {
    const statusOcultos = [
      statusListType.PRE_ANALISE.id,
      statusListType.VENCIDO_REGULATORIO.id,
      statusListType.VENCIDO_AREA_TECNICA.id,
      statusListType.ARQUIVADO.id,
    ];

    const defaultPrazosPorStatus: { [key: number]: number } = {
      [statusListType.EM_ANALISE_GERENTE_REGULATORIO.id]: 48,
      [statusListType.EM_ANALISE_AREA_TECNICA.id]: 72,
      [statusListType.ANALISE_REGULATORIA.id]: 72,
      [statusListType.EM_APROVACAO.id]: 48,
      [statusListType.EM_ASSINATURA_DIRETORIA.id]: 48,
    };

    const allStatus =
      statusList.length > 0
        ? statusList
        : [
            { idStatusSolicitacao: statusListType.EM_ANALISE_GERENTE_REGULATORIO.id, nmStatus: statusListType.EM_ANALISE_GERENTE_REGULATORIO.label },
            { idStatusSolicitacao: statusListType.EM_ANALISE_AREA_TECNICA.id, nmStatus: statusListType.EM_ANALISE_AREA_TECNICA.label },
            { idStatusSolicitacao: statusListType.ANALISE_REGULATORIA.id, nmStatus: statusListType.ANALISE_REGULATORIA.label },
            { idStatusSolicitacao: statusListType.EM_APROVACAO.id, nmStatus: statusListType.EM_APROVACAO.label },
            { idStatusSolicitacao: statusListType.EM_ASSINATURA_DIRETORIA.id, nmStatus: statusListType.EM_ASSINATURA_DIRETORIA.label },
          ];

    const statusFiltrados = allStatus.filter(status => !statusOcultos.includes(status.idStatusSolicitacao));

    return statusFiltrados.map(status => ({
      idStatusSolicPrazoTema: 0,
      idStatusSolicitacao: status.idStatusSolicitacao,
      idTema: formData?.idTema || 0,
      nrPrazoInterno: defaultPrazosPorStatus[status.idStatusSolicitacao] || 0,
      nrPrazoExterno: 0,
      tema: {
        idTema: formData?.idTema || 0,
        nmTema: '',
      },
      flAtivo: 'S',
    }));
  }, [formData?.idTema, statusList]);

  const updateLocalPrazo = useCallback(
    (idStatus: number, valor: number) => {
      setStatusPrazos(prev => {
        const existing = prev.find(p => p.idStatusSolicitacao === idStatus);
        if (existing) {
          return prev.map(p => (p.idStatusSolicitacao === idStatus ? { ...p, nrPrazoInterno: valor } : p));
        } else {
          const newPrazo = {
            idStatusSolicPrazoTema: 0,
            idStatusSolicitacao: idStatus,
            nrPrazoInterno: valor,
            nrPrazoExterno: 0,
            idTema: formData.idTema || 0,
            flAtivo: 'S',
          } as StatusSolicPrazoTemaForUI;
          return [...prev, newPrazo];
        }
      });
    },
    [formData.idTema]
  );

  // Handlers de anexos
  const handleAddAnexos = useCallback((files: FileList | null) => {
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      setAnexos(prev => [...prev, ...fileArray]);
    }
  }, []);

  const handleRemoveAnexo = useCallback((index: number) => {
    setAnexos(prev => prev.filter((_, i) => i !== index));
  }, []);

  return {
    anexos,
    setAnexos,
    anexosBackend,
    setAnexosBackend,
    anexosTypeE,
    statusPrazos,
    setStatusPrazos,
    loadingStatusPrazos,
    statusList,
    allAreas,
    prazosSolicitacaoPorStatus,
    userResponsavelIdPerfil,
    loadStatusPrazos,
    getDefaultPrazos,
    updateLocalPrazo,
    handleAddAnexos,
    handleRemoveAnexo,
  };
}
