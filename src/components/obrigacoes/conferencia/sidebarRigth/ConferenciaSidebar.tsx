'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CloudDownload, Send } from 'lucide-react';
import { toast } from 'sonner';
import anexosClient from '@/api/anexos/client';
import { base64ToUint8Array, cn, saveBlob } from '@/utils/utils';
import type { ObrigacaoDetalheResponse } from '@/api/obrigacao/types';
import type { AnexoResponse, ArquivoDTO } from '@/api/anexos/type';
import { TipoObjetoAnexoEnum, TipoResponsavelAnexoEnum, TipoDocumentoAnexoEnum } from '@/api/anexos/type';
import { AnexosTab } from './AnexosTab';
import { ComentariosTab } from './ComentariosTab';
import solicitacaoParecerClient from '@/api/solicitacao-parecer/client';
import { SolicitacaoParecerResponse } from '@/api/solicitacao-parecer/types';
import { authClient } from '@/api/auth/client';
import { responsaveisClient } from '@/api/responsaveis/client';
import { ResponsavelResponse } from '@/api/responsaveis/types';
import { TipoEnum } from '@/api/tipos/types';
import obrigacaoAnexosClient from '@/api/obrigacao/anexos-client';
import { useUserGestao } from '@/hooks/use-user-gestao';
import { computeTpResponsavel, perfilUtil } from '@/api/perfis/types';
import tramitacoesClient from '@/api/tramitacoes/client';
import { TramitacaoResponse as SolTramitacaoResponse, TramitacaoComAnexosResponse } from '@/api/solicitacoes/types';
import { statusListObrigacao } from '@/api/status-obrigacao/types';
import { statusList } from '@/api/status-solicitacao/types';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import ExportHistoricoObrigacaoPdf from '@/components/obrigacoes/relatorios/ExportHistoricoObrigacaoPdf';
import LoadingOverlay from '@/components/ui/loading-overlay';

interface ConferenciaSidebarProps {
  detalhe: ObrigacaoDetalheResponse;
  onRefreshAnexos?: () => void;
  podeEnviarComentarioPorPerfilEArea?: boolean;
  isStatusDesabilitadoParaTramitacao?: boolean;
  onGetComentarioTexto?: (getter: () => string) => void;
  arquivosTramitacaoPendentes?: ArquivoDTO[];
  onAddArquivosTramitacao?: (files: ArquivoDTO[]) => void;
  onRemoveArquivoTramitacao?: (index: number) => void;
  onClearArquivosTramitacao?: () => void;
}

enum RegistroTabKey {
  ANEXOS = 'anexos',
  COMENTARIOS = 'comentarios',
}

export function ConferenciaSidebar({ 
  detalhe, 
  onRefreshAnexos, 
  podeEnviarComentarioPorPerfilEArea = false, 
  isStatusDesabilitadoParaTramitacao = false, 
  onGetComentarioTexto,
  arquivosTramitacaoPendentes = [],
  onAddArquivosTramitacao,
  onRemoveArquivoTramitacao,
  onClearArquivosTramitacao,
}: ConferenciaSidebarProps) {
  const { idPerfil } = useUserGestao();
  const [registroTab, setRegistroTab] = useState<RegistroTabKey>(RegistroTabKey.ANEXOS);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [comentarioTexto, setComentarioTexto] = useState('');
  const [solicitacaoPareceres, setSolicitacaoPareceres] = useState<SolicitacaoParecerResponse[]>(
    detalhe?.solicitacaoParecer || []
  );
  const [tramitacoes, setTramitacoes] = useState<TramitacaoComAnexosResponse[]>(
    detalhe?.tramitacoes || []
  );
  const [responsaveis, setResponsaveis] = useState<ResponsavelResponse[]>([]);
  const [loadingComentarios, setLoadingComentarios] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [parecerReferencia, setParecerReferencia] = useState<number | null>(null);
  const [tramitacaoReferencia, setTramitacaoReferencia] = useState<number | null>(null);
  const [userResponsavel, setUserResponsavel] = useState<ResponsavelResponse | null>(null);
  const [parecerTramitacaoMap, setParecerTramitacaoMap] = useState<Map<number, number>>(new Map());
  const [showDeleteAnexoDialog, setShowDeleteAnexoDialog] = useState(false);
  const [anexoToDelete, setAnexoToDelete] = useState<AnexoResponse | null>(null);
  const [showDeleteLinkDialog, setShowDeleteLinkDialog] = useState(false);
  const [linkToDelete, setLinkToDelete] = useState<string | null>(null);
  const [exportingPdf, setExportingPdf] = useState(false);

  useEffect(() => {
    if (onGetComentarioTexto) {
      onGetComentarioTexto(() => {
        const textarea = document.getElementById('comentario-textarea') as HTMLTextAreaElement;
        return textarea?.value || comentarioTexto;
      });
    }
  }, [onGetComentarioTexto, comentarioTexto]);

  const areaAtribuida = useMemo(() => {
    return detalhe?.obrigacao?.areas?.find((area) => area.tipoArea?.cdTipo === TipoEnum.ATRIBUIDA);
  }, [detalhe?.obrigacao?.areas]);

  const areasCondicionantes = useMemo(() => {
    return detalhe?.obrigacao?.areas?.filter((area) => area.tipoArea?.cdTipo === TipoEnum.CONDICIONANTE) ?? [];
  }, [detalhe?.obrigacao?.areas]);

  const responsavelInfo = useMemo(() => {
    const tpResponsavel = idPerfil ? computeTpResponsavel(idPerfil) : TipoResponsavelAnexoEnum.A;
    const responsavelMap: Record<TipoResponsavelAnexoEnum, string> = {
      [TipoResponsavelAnexoEnum.A]: 'Analista',
      [TipoResponsavelAnexoEnum.G]: 'Gestor',
      [TipoResponsavelAnexoEnum.D]: 'Diretor',
      [TipoResponsavelAnexoEnum.R]: 'Regulatório',
    };
    const responsavelNome = responsavelMap[tpResponsavel] || 'Analista';
    
    return {
      tpResponsavel,
      responsavelNome,
    };
  }, [idPerfil]);

  const anexos = useMemo(() => detalhe.anexos || [], [detalhe.anexos]);

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

  const idAreaAtribuida = areaAtribuida?.idArea;
  const userAreaIds = userResponsavel?.areas?.map(ra => ra.area.idArea) || [];
  const isDaAreaAtribuida = idAreaAtribuida && userAreaIds.includes(idAreaAtribuida);
  
  const idsAreasCondicionantes = areasCondicionantes.map(area => area.idArea);
  const isDeAreaCondicionante = idsAreasCondicionantes.some(idArea => userAreaIds.includes(idArea));
  
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

    if (isStatusEmAndamento || isStatusPendente || isStatusAtrasada)  return true;

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

  useEffect(() => {
    if (detalhe?.solicitacaoParecer) {
      setSolicitacaoPareceres(detalhe.solicitacaoParecer);
    }
    if (detalhe?.tramitacoes) {
      setTramitacoes(detalhe.tramitacoes);
    }
  }, [detalhe?.solicitacaoParecer, detalhe?.tramitacoes]);

  useEffect(() => {
    const carregarResponsaveis = async () => {
      try {
        const responsaveisResponse = await responsaveisClient.buscarPorFiltro({ size: 1000 });
        const responsaveisAtivos = responsaveisResponse.content.filter(r => r.flAtivo === 'S');
        setResponsaveis(responsaveisAtivos);
      } catch (error) {
        console.error('Erro ao carregar responsáveis:', error);
      }
    };

    carregarResponsaveis();
  }, []);

  const reloadDados = useCallback(async () => {
    if (!detalhe?.obrigacao?.idSolicitacao) {
      return;
    }

    try {
      const pareceres = await solicitacaoParecerClient.buscarPorIdSolicitacao(detalhe.obrigacao.idSolicitacao);
      
      setSolicitacaoPareceres(pareceres || []);
      
      const novoMap = new Map<number, number>();
      pareceres?.forEach(parecer => {
        if (parecer.idTramitacao) {
          novoMap.set(parecer.idSolicitacaoParecer, parecer.idTramitacao);
        }
      });
      setParecerTramitacaoMap(novoMap);
    } catch (error) {
      console.error('Erro ao recarregar dados:', error);
      toast.error('Erro ao recarregar comentários.');
    }
  }, [detalhe?.obrigacao?.idSolicitacao]);

  useEffect(() => {
    const carregarDados = async () => {
      if (!detalhe?.obrigacao?.idSolicitacao) {
        return;
      }

      const temDadosIniciais = (detalhe?.solicitacaoParecer?.length ?? 0) > 0 || 
                               (detalhe?.tramitacoes?.length ?? 0) > 0;
      
      if (!temDadosIniciais) {
        setLoadingComentarios(true);
      }

      try {
        const [pareceres, responsaveisResponse] = await Promise.all([
          solicitacaoParecerClient.buscarPorIdSolicitacao(detalhe.obrigacao.idSolicitacao),
          responsaveisClient.buscarPorFiltro({ size: 5000 })
        ]);
        
        setSolicitacaoPareceres(pareceres || []);
        setResponsaveis(responsaveisResponse.content.filter(r => r.flAtivo === 'S'));
        
        const novoMap = new Map<number, number>();
        pareceres?.forEach(parecer => {
          if (parecer.idTramitacao) {
            novoMap.set(parecer.idSolicitacaoParecer, parecer.idTramitacao);
          }
        });
        setParecerTramitacaoMap(novoMap);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        const temDadosIniciaisNoErro = (detalhe?.solicitacaoParecer?.length ?? 0) > 0 || 
                                     (detalhe?.tramitacoes?.length ?? 0) > 0;
        if (!temDadosIniciaisNoErro) {
          toast.error('Erro ao carregar comentários.');
        }
      } finally {
        setLoadingComentarios(false);
      }
    };

    carregarDados();
  }, [detalhe?.obrigacao?.idSolicitacao, onRefreshAnexos, detalhe?.solicitacaoParecer, detalhe?.tramitacoes]);

  useEffect(() => {
    const carregarUserResponsavel = async () => {
      try {
        const idFromToken = authClient.getUserIdResponsavelFromToken();
        
        if (idFromToken) {
          const responsavel = await responsaveisClient.buscarPorId(idFromToken);
          setUserResponsavel(responsavel);
        }
      } catch (error) {
        console.error('Erro ao carregar responsável logado:', error);
      }
    };

    carregarUserResponsavel();
  }, []);

  const comentariosUnificados = useMemo(() => {
    const items: Array<{
      tipo: 'parecer' | 'tramitacao';
      data: string;
      parecer?: SolicitacaoParecerResponse;
      tramitacao?: SolTramitacaoResponse;
    }> = [];

    const textosPareceres = new Set(
      solicitacaoPareceres.map(p => (p.dsDarecer || '').trim().toLowerCase())
    );

    solicitacaoPareceres.forEach(parecer => {
      items.push({
        tipo: 'parecer',
        data: parecer.dtCriacao || '',
        parecer,
      });
    });

    tramitacoes.forEach(t => {
      const tramitacao = t.tramitacao;
      if (tramitacao.dsObservacao) {
        const textoTramitacao = (tramitacao.dsObservacao || '').trim().toLowerCase();
        
        if (!textosPareceres.has(textoTramitacao)) {
          const dataTramitacao = (tramitacao as unknown as SolTramitacaoResponse).tramitacaoAcao?.[0]?.dtCriacao || 
                                (tramitacao as unknown as SolTramitacaoResponse).solicitacao?.dtCriacao || 
                                '';
          items.push({
            tipo: 'tramitacao',
            data: dataTramitacao,
            tramitacao: tramitacao as unknown as SolTramitacaoResponse,
          });
        }
      }
    });

    return items.sort((a, b) => {
      const dataA = a.data ? new Date(a.data).getTime() : 0;
      const dataB = b.data ? new Date(b.data).getTime() : 0;
      if (isNaN(dataA) && isNaN(dataB)) return 0;
      if (isNaN(dataA)) return 1;
      if (isNaN(dataB)) return -1;
      return dataB - dataA;
    });
  }, [solicitacaoPareceres, tramitacoes]);

  const comentariosCount = comentariosUnificados.length;
  const anexosCount = useMemo(() => {
    // Anexos da obrigação
    const anexosPrincipais = anexos.filter(a => a.tpDocumento !== TipoDocumentoAnexoEnum.C);
    
    // Anexos de tramitações
    const anexosDasTramitacoes = (tramitacoes || []).flatMap(t => t.anexos || []);
    
    // Combinar e remover duplicados
    const todosAnexos = [...anexosPrincipais, ...anexosDasTramitacoes];
    const uniqueIds = new Set(todosAnexos.map(a => a.idAnexo));
    
    return uniqueIds.size;
  }, [anexos, tramitacoes]);
  
  const idResponsavelLogado = authClient.getUserIdResponsavelFromToken();

  const podeResponderTramitacao = useMemo(() => {
    if (!idResponsavelLogado || !userResponsavel) {
      return true; 
    }

    if (!isDaAreaAtribuida) {
      return true; 
    }

    const tramitacoesComData = tramitacoes
      .filter(t => t.tramitacao.dsObservacao)
      .map(t => ({
        tramitacao: t.tramitacao,
        data: t.tramitacao.tramitacaoAcao?.[0]?.dtCriacao || t.tramitacao.solicitacao?.dtCriacao || '',
      }))
      .sort((a, b) => {
        const dataA = a.data ? new Date(a.data).getTime() : 0;
        const dataB = b.data ? new Date(b.data).getTime() : 0;
        return dataB - dataA; 
      });

    if (tramitacoesComData.length === 0) {
      return true;
    }

    const ultimaTramitacao = tramitacoesComData[0].tramitacao;
    const responsavelUltimaTramitacao = ultimaTramitacao.tramitacaoAcao?.[0]?.responsavelArea?.responsavel;

    if (responsavelUltimaTramitacao?.idResponsavel === idResponsavelLogado) {
      return false;
    }

    return true;
  }, [idResponsavelLogado, userResponsavel, isDaAreaAtribuida, tramitacoes]);

  const handleDeletarParecer = useCallback(async (idSolicitacaoParecer: number) => {
    try {
      await solicitacaoParecerClient.deletar(idSolicitacaoParecer);
      toast.success('Comentário removido com sucesso.');
      
      if (detalhe?.obrigacao?.idSolicitacao) {
        const [pareceres, tramitacoesResponse, responsaveisResponse] = await Promise.all([
          solicitacaoParecerClient.buscarPorIdSolicitacao(detalhe.obrigacao.idSolicitacao),
          tramitacoesClient.listarPorSolicitacao(detalhe.obrigacao.idSolicitacao) as unknown as Promise<TramitacaoComAnexosResponse[]>,
          responsaveisClient.buscarPorFiltro({ size: 5000 })
        ]);
        
        setSolicitacaoPareceres(pareceres || []);
        setTramitacoes(tramitacoesResponse || []);
        const responsaveisAtivos = responsaveisResponse.content.filter(r => r.flAtivo === 'S');
        setResponsaveis(responsaveisAtivos);
      }
    } catch (error) {
      console.error('Erro ao deletar parecer:', error);
      toast.error('Erro ao remover o comentário.');
    }
  }, [detalhe?.obrigacao?.idSolicitacao]);

  const handleDeleteAnexoClick = useCallback((anexo: AnexoResponse) => {
    setAnexoToDelete(anexo);
    setShowDeleteAnexoDialog(true);
  }, []);

  const confirmDeleteAnexo = useCallback(async () => {
    if (!anexoToDelete) return;

    setLoadingAction(true);
    try {
      await anexosClient.deletar(anexoToDelete.idAnexo);
      toast.success('Anexo removido com sucesso.');
      
      if (onRefreshAnexos) {
        await onRefreshAnexos();
      }
    } catch (error) {
      console.error('Erro ao deletar anexo:', error);
      toast.error('Erro ao deletar o anexo.');
    } finally {
      setLoadingAction(false);
      setAnexoToDelete(null);
    }
  }, [anexoToDelete, onRefreshAnexos]);

  const handleDownloadAnexo = useCallback(
    async (anexo: AnexoResponse) => {
      try {
        setDownloadingId(anexo.idAnexo);
        const tpObjeto = (anexo.tpObjeto as TipoObjetoAnexoEnum) || TipoObjetoAnexoEnum.O;
        const arquivos = await anexosClient.download(anexo.idObjeto, tpObjeto, anexo.nmArquivo);

        if (!arquivos || arquivos.length === 0) {
          toast.error('Não foi possível baixar o anexo.');
          return;
        }

        arquivos.forEach((arquivo) => {
          const bytes = base64ToUint8Array(arquivo.conteudoArquivo);
          const filename = arquivo.nomeArquivo || anexo.nmArquivo;
          const mime = arquivo.tipoConteudo || 'application/octet-stream';
          saveBlob(bytes, mime, filename);
        });
      } catch (error) {
        console.error('Erro ao baixar anexo:', error);
        toast.error('Erro ao baixar o anexo.');
      } finally {
        setDownloadingId(null);
      }
    },
    [],
  );

  const handleEvidenceLinkRemoveClick = useCallback((link: string) => {
    setLinkToDelete(link);
    setShowDeleteLinkDialog(true);
  }, []);

  const confirmDeleteLink = useCallback(async () => {
    if (!linkToDelete) return;

    const anexoLink = anexos.find(
      (anexo) => anexo.tpDocumento === TipoDocumentoAnexoEnum.L && 
                 (anexo.dsCaminho === linkToDelete || anexo.nmArquivo === linkToDelete)
    );

    if (anexoLink && detalhe?.obrigacao?.idSolicitacao) {
      setLoadingAction(true);
      try {
        await obrigacaoAnexosClient.deletar(detalhe.obrigacao.idSolicitacao, anexoLink.idAnexo);
        toast.success('Link removido com sucesso.');
        
        if (onRefreshAnexos) {
          await onRefreshAnexos();
        }
      } catch (error) {
        console.error('Erro ao deletar link:', error);
        toast.error('Erro ao remover o link.');
      } finally {
        setLoadingAction(false);
      }
    } else {
      toast.error('Link não encontrado.');
    }
    
    setLinkToDelete(null);
  }, [linkToDelete, anexos, detalhe?.obrigacao?.idSolicitacao, onRefreshAnexos]);

  const handleEvidenceLinkAdd = useCallback(async (link: string) => {
    if (!detalhe?.obrigacao?.idSolicitacao) {
      toast.error('ID da obrigação não encontrado.');
      return;
    }

    setLoadingAction(true);
    try {
      await obrigacaoAnexosClient.inserirLink(detalhe.obrigacao.idSolicitacao, {
        dsCaminho: link,
        tpResponsavel: responsavelInfo.tpResponsavel,
      });

      toast.success('Link adicionado com sucesso.');
      
      if (onRefreshAnexos) {
        await onRefreshAnexos();
      }
    } catch (error) {
      console.error('Erro ao adicionar link:', error);
      toast.error('Erro ao adicionar link. Tente novamente.');
    } finally {
      setLoadingAction(false);
    }
  }, [detalhe?.obrigacao?.idSolicitacao, responsavelInfo, onRefreshAnexos]);

  const handleResponder = useCallback((parecer: SolicitacaoParecerResponse) => {
    const nomeResponsavel = parecer.responsavel?.nmResponsavel || 'Usuário';
    setComentarioTexto(`@${nomeResponsavel} `);
    setParecerReferencia(parecer.idSolicitacaoParecer);
    setTramitacaoReferencia(null);
    
    setRegistroTab(RegistroTabKey.COMENTARIOS);
    
    setTimeout(() => {
      const textarea = document.getElementById('comentario-textarea') as HTMLTextAreaElement;
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(textarea.value.length, textarea.value.length);
      }
    }, 200);
  }, []);

  const handleResponderTramitacao = useCallback((tramitacao: SolTramitacaoResponse) => {
    const responsavelTramitacao = tramitacao.tramitacaoAcao?.[0]?.responsavelArea?.responsavel;
    const nomeResponsavel = responsavelTramitacao?.nmResponsavel || 'Usuário';
    setComentarioTexto(`@${nomeResponsavel} `);
    setTramitacaoReferencia(tramitacao.idTramitacao);
    setParecerReferencia(null);
    
    setRegistroTab(RegistroTabKey.COMENTARIOS);
    
    setTimeout(() => {
      const textarea = document.getElementById('comentario-textarea') as HTMLTextAreaElement;
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(textarea.value.length, textarea.value.length);
      }
    }, 200);
  }, []);

  const statusPermitidoParaTramitar = useMemo(() => {
    return detalhe?.obrigacao?.statusSolicitacao?.idStatusSolicitacao &&
      [statusListObrigacao.NAO_INICIADO.id,
        statusListObrigacao.PENDENTE.id,  
      ].includes(detalhe?.obrigacao?.statusSolicitacao?.idStatusSolicitacao);
  }, [detalhe?.obrigacao?.statusSolicitacao?.idStatusSolicitacao]);


  const podeEnviarComentario = useMemo(() => {
    if (podeEnviarComentarioPorPerfilEArea) {
      return true;
    }

    if (idPerfil === perfilUtil.ADMINISTRADOR ||
      idPerfil === perfilUtil.GESTOR_DO_SISTEMA) {
      return true;
    }

    if (isDaAreaAtribuida) {
      return true;
    }
    
    const userAreaIds = userResponsavel?.areas?.map(ra => ra.area.idArea) || [];
    const idsAreasCondicionantes = areasCondicionantes.map(area => area.idArea);
    const isDeAreaCondicionante = idsAreasCondicionantes.some(idArea => userAreaIds.includes(idArea));

    return isDeAreaCondicionante;
  }, [idPerfil, isDaAreaAtribuida, podeEnviarComentarioPorPerfilEArea, userResponsavel?.areas, areasCondicionantes]);

  const tooltipEnviarComentario = useMemo(() => {
    if (!podeEnviarComentario) {
      return 'Apenas usuários da área atribuída, áreas condicionantes ou administradores/gestores podem enviar comentários.';
    }
    return '';
  }, [podeEnviarComentario]);

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

  const tooltipFinalEnviarComentario = useMemo(() => {
    if (loadingAction) {
      return 'Enviando comentário...';
    }
    
    if (!comentarioTexto.trim()) {
      return 'Digite um comentário antes de enviar.';
    }

    if (!podeEnviarComentario) {
      return tooltipEnviarComentario;
    }

    if (!isPerfilPermitidoPorStatus) {
      return tooltipPerfilPermitidoPorStatus;
    }

    return '';
  }, [loadingAction, comentarioTexto, podeEnviarComentario, isPerfilPermitidoPorStatus, tooltipEnviarComentario, tooltipPerfilPermitidoPorStatus]);

  const handleEnviarComentario = useCallback(async () => {
    const textarea = document.getElementById('comentario-textarea') as HTMLTextAreaElement;
    const textoCompleto = textarea?.value || comentarioTexto;
    
    if (!textoCompleto.trim()) {
      toast.warning('Digite um comentário antes de enviar.');
      return;
    }

    if (!detalhe?.obrigacao?.idSolicitacao || !detalhe?.obrigacao?.statusSolicitacao?.idStatusSolicitacao) {
      toast.error('Dados da obrigação incompletos.');
      return;
    }

    try {
      setLoadingAction(true);

      const idAreaAtribuida = areaAtribuida?.idArea;
      const userAreaIds = userResponsavel?.areas?.map(ra => ra.area.idArea) || [];
      const isDaAreaAtribuida = idAreaAtribuida && userAreaIds.includes(idAreaAtribuida);

      if (isDaAreaAtribuida) {
        if (podeResponderTramitacao) {
          const idStatusAtual = detalhe.obrigacao.statusSolicitacao.idStatusSolicitacao;
          const tramitacaoExistente = tramitacoes.find(
            t => t.tramitacao?.solicitacao?.statusSolicitacao?.idStatusSolicitacao === idStatusAtual &&
                 t.tramitacao?.dsObservacao === textoCompleto.trim()
          );

          const podeCriarTramitacao = statusPermitidoParaTramitar && !tramitacaoExistente;
          
          if (podeCriarTramitacao) {
            const tramitacaoRequest = {
              idSolicitacao: detalhe.obrigacao.idSolicitacao,
              dsObservacao: textoCompleto.trim(),
              idResponsavel: userResponsavel?.idResponsavel,
              arquivos: arquivosTramitacaoPendentes,
            };

            await tramitacoesClient.tramitarViaFluxo(tramitacaoRequest);
            onClearArquivosTramitacao?.();
            
            await reloadDados();
            if (onRefreshAnexos) {
              await onRefreshAnexos();
            }
          }
          toast.success('Comentário de área atribuída salvo com sucesso.');
          return;
        }

        const parecerRequest: {
          idSolicitacao: number;
          idStatusSolicitacao: number;
          dsDarecer: string;
          idSolicitacaoParecerReferen?: number | null;
          idTramitacao?: number | null;
          arquivos?: ArquivoDTO[];
        } = {
          idSolicitacao: detalhe.obrigacao.idSolicitacao,
          idStatusSolicitacao: detalhe.obrigacao.statusSolicitacao.idStatusSolicitacao,
          dsDarecer: textoCompleto.trim(),
          arquivos: arquivosTramitacaoPendentes,
        };

        if (parecerReferencia) {
          parecerRequest.idSolicitacaoParecerReferen = parecerReferencia;
        }

        if (tramitacaoReferencia) {
          parecerRequest.idTramitacao = tramitacaoReferencia;
        }

        await solicitacaoParecerClient.criar(parecerRequest);
        onClearArquivosTramitacao?.();

        await reloadDados();
        if (onRefreshAnexos) {
          await onRefreshAnexos();
        }

        toast.success(podeResponderTramitacao 
          ? 'Comentário de área atribuída salvo com sucesso.' 
          : 'Comentário salvo com sucesso.');
      } else {
        const requestData: {
          idSolicitacao: number;
          idStatusSolicitacao: number;
          dsDarecer: string;
          idSolicitacaoParecerReferen?: number | null;
          idTramitacao?: number | null;
          arquivos?: ArquivoDTO[];
        } = {
          idSolicitacao: detalhe.obrigacao.idSolicitacao,
          idStatusSolicitacao: detalhe.obrigacao.statusSolicitacao.idStatusSolicitacao,
          dsDarecer: textoCompleto.trim(),
          arquivos: arquivosTramitacaoPendentes,
        };

        if (parecerReferencia) {
          requestData.idSolicitacaoParecerReferen = parecerReferencia;
        }

        if (tramitacaoReferencia) {
          requestData.idTramitacao = tramitacaoReferencia;
        }

        await solicitacaoParecerClient.criar(requestData);
        onClearArquivosTramitacao?.();

        await reloadDados();
        if (onRefreshAnexos) {
          await onRefreshAnexos();
        }
        
        toast.success('Comentário salvo com sucesso.');
      }

      setComentarioTexto('');
      setParecerReferencia(null);
      setTramitacaoReferencia(null);
      
      if (textarea) {
        textarea.value = '';
      }
    } catch (error) {
      console.error('Erro ao enviar comentário:', error);
      toast.error('Erro ao enviar o comentário.');
    } finally {
      setLoadingAction(false);
    }
  }, [comentarioTexto, parecerReferencia, tramitacaoReferencia, detalhe?.obrigacao?.idSolicitacao, detalhe?.obrigacao?.statusSolicitacao?.idStatusSolicitacao, areaAtribuida, userResponsavel, tramitacoes, podeResponderTramitacao, onRefreshAnexos, statusPermitidoParaTramitar, reloadDados, arquivosTramitacaoPendentes, onClearArquivosTramitacao]);

  return (
    <aside className="fixed right-0 top-[80px] bottom-[49px] z-10 flex w-full max-w-md flex-shrink-0 flex-col">
      <div className="flex h-full flex-col overflow-hidden rborder-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Registros</h2>
          </div>
          <div>
            {podeGerarRelatorio && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex items-center gap-2 rounded-full border-gray-200 bg-white hover:bg-gray-50"
                onClick={() => setExportingPdf(true)}
                disabled={exportingPdf}
              >
                <CloudDownload className="h-4 w-4" />
                Exportar
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col min-h-0">
          <div className="relative flex gap-4 justify-center px-6 shrink-0 border-b border-gray-200">
            {[RegistroTabKey.ANEXOS, RegistroTabKey.COMENTARIOS].map((tab) => {
              const active = registroTab === tab;
              const count = tab === RegistroTabKey.ANEXOS ? anexosCount : comentariosCount;

              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setRegistroTab(tab)}
                  className={cn(
                    'relative flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-colors',
                    active 
                      ? 'text-blue-600' 
                      : 'text-gray-900 hover:text-gray-700',
                  )}
                >
                  {tab === RegistroTabKey.ANEXOS ? 'Anexos' : 'Comentários'}
                  <span className={cn(
                    'rounded-full px-2 py-0.5 text-xs font-semibold',
                    active ? 'bg-blue-500 text-white' : 'bg-gray-900 text-white'
                  )}>
                    {count}
                  </span>
                  {active && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 -mb-px" />
                  )}
                </button>
              );
            })}
          </div>

          <div className={cn(
            "flex-1 overflow-y-auto px-6 min-h-0",
            registroTab === RegistroTabKey.COMENTARIOS ? "pb-0" : "py-6"
          )}>
            {registroTab === RegistroTabKey.ANEXOS ? (
              <AnexosTab
                anexos={anexos}
                tramitacoes={tramitacoes}
                downloadingId={downloadingId}
                onDeleteAnexo={handleDeleteAnexoClick}
                onDownloadAnexo={handleDownloadAnexo}
                onEvidenceLinkRemove={handleEvidenceLinkRemoveClick}
                onEvidenceLinkAdd={handleEvidenceLinkAdd}
                idObrigacao={detalhe?.obrigacao?.idSolicitacao || 0}
                idPerfil={idPerfil ?? undefined}
                onRefreshAnexos={onRefreshAnexos}
                isStatusEmAndamento={isStatusEmAndamento}
                isStatusAtrasada={isStatusAtrasada}
                isStatusEmValidacaoRegulatorio={isStatusEmValidacaoRegulatorio}
                isStatusPendente={isStatusPendente}
                isStatusNaoIniciado={isStatusNaoIniciado}
                isStatusConcluido={isStatusConcluido}
                isStatusNaoAplicavelSuspensa={isStatusNaoAplicavelSuspensa}
                isStatusPreAnalise={isStatusPreAnalise}
                isDaAreaAtribuida={!!isDaAreaAtribuida}
                isStatusDesabilitadoParaTramitacao={isStatusDesabilitadoParaTramitacao}
                arquivosTramitacaoPendentes={arquivosTramitacaoPendentes}
                onAddArquivosTramitacao={onAddArquivosTramitacao}
                onRemoveArquivoTramitacao={onRemoveArquivoTramitacao}
              />
            ) : (
              <ComentariosTab
                solicitacaoPareceres={solicitacaoPareceres}
                tramitacoes={tramitacoes}
                comentariosUnificados={comentariosUnificados}
                responsaveis={responsaveis}
                loading={loadingComentarios}
                idResponsavelLogado={idResponsavelLogado}
                onDeletar={handleDeletarParecer}
                onResponder={handleResponder}
                onResponderTramitacao={handleResponderTramitacao}
                parecerTramitacaoMap={parecerTramitacaoMap}
                areaAtribuida={areaAtribuida}
              />
            )}
          </div>

          {registroTab === RegistroTabKey.COMENTARIOS && (
            <div className="bg-white px-6 py-4 border-t border-gray-100 shrink-0 mb-5">
              <label className="mb-2 block text-sm font-semibold text-gray-900">Escreva um comentário</label>
              {tramitacaoReferencia && podeResponderTramitacao && (() => {
                const tramitacaoReferenciada = tramitacoes.find(t => t.tramitacao.idTramitacao === tramitacaoReferencia);
                const responsavelTramitacao = tramitacaoReferenciada?.tramitacao.tramitacaoAcao?.[0]?.responsavelArea?.responsavel;
                const nomeResponsavel = responsavelTramitacao?.nmResponsavel || 'Usuário';
                return (
                  <div className="mb-2 text-xs text-blue-600">
                    Respondendo a uma tramitação de <span className="text-blue-600 font-semibold">@{nomeResponsavel}</span>
                  </div>
                );
              })()}
              {parecerReferencia && !tramitacaoReferencia && podeResponderTramitacao && (() => {
                const parecerReferenciado = solicitacaoPareceres.find(p => p.idSolicitacaoParecer === parecerReferencia);
                const nomeResponsavel = parecerReferenciado?.responsavel?.nmResponsavel || 'Usuário';
                return (
                  <div className="mb-2 text-xs text-blue-600">
                    Respondendo a um comentário de <span className="text-purple-600 font-semibold">@{nomeResponsavel}</span>
                  </div>
                );
              })()}
              <div className="relative flex items-end gap-2">
                <Textarea
                  id="comentario-textarea"
                  placeholder="Escreva aqui..."
                  value={comentarioTexto}
                  onChange={(e) => {
                    setComentarioTexto(e.target.value);
                    if (!e.target.value.includes('@')) {
                      if (parecerReferencia) {
                        setParecerReferencia(null);
                      }
                      if (tramitacaoReferencia) {
                        setTramitacaoReferencia(null);
                      }
                    }
                  }}
                  className="flex-1 resize-none border border-gray-200 rounded-2xl bg-white px-4 py-3 shadow-sm focus-visible:ring-0 focus-visible:border-blue-500 min-h-[80px] text-sm"
                  rows={4}
                  disabled={loadingAction || !podeEnviarComentario}
                />
                {isStatusDesabilitadoParaTramitacao || isStatusEmValidacaoRegulatorio || isStatusConcluido && (
                  <Button
                    type="button"
                    size="icon"
                    className="rounded-full bg-blue-500 text-white hover:bg-blue-600 shrink-0 h-10 w-10 disabled:opacity-50"
                    onClick={handleEnviarComentario}
                    disabled={loadingAction || !comentarioTexto.trim() || !podeEnviarComentario || !isPerfilPermitidoPorStatus}
                    tooltip={tooltipFinalEnviarComentario}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmationDialog
        open={showDeleteAnexoDialog}
        onOpenChange={(open) => {
          setShowDeleteAnexoDialog(open);
          if (!open) {
            setAnexoToDelete(null);
          }
        }}
        title="Excluir anexo"
        description={`Tem certeza que deseja excluir o anexo "${anexoToDelete?.nmArquivo}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={confirmDeleteAnexo}
        variant="destructive"
      />

      <ConfirmationDialog
        open={showDeleteLinkDialog}
        onOpenChange={(open) => {
          setShowDeleteLinkDialog(open);
          if (!open) {
            setLinkToDelete(null);
          }
        }}
        title="Excluir link"
        description={`Tem certeza que deseja excluir o link "${linkToDelete}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={confirmDeleteLink}
        variant="destructive"
      />

      {exportingPdf && (
        <ExportHistoricoObrigacaoPdf
          detalhe={detalhe}
          onDone={() => setExportingPdf(false)}
        />
      )}

      {loadingAction && (
        <LoadingOverlay 
          title="Processando..." 
          subtitle="Aguarde enquanto os dados são enviados e o fluxo é atualizado." 
        />
      )}
    </aside>
  );
}