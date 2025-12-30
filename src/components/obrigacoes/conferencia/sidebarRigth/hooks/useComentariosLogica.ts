'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import solicitacaoParecerClient from '@/api/solicitacao-parecer/client';
import { SolicitacaoParecerResponse } from '@/api/solicitacao-parecer/types';
import { responsaveisClient } from '@/api/responsaveis/client';
import { ResponsavelResponse } from '@/api/responsaveis/types';
import { authClient } from '@/api/auth/client';
import tramitacoesClient from '@/api/tramitacoes/client';
import { TramitacaoRequest } from '@/api/tramitacoes/types';
import { TramitacaoResponse as SolTramitacaoResponse, TramitacaoComAnexosResponse } from '@/api/solicitacoes/types';
import { perfilUtil } from '@/api/perfis/types';
import type { ObrigacaoDetalheResponse } from '@/api/obrigacao/types';
import type { ArquivoDTO } from '@/api/anexos/type';
import { statusList } from '@/api/status-solicitacao/types';

interface UseComentariosLogicaParams {
  detalhe: ObrigacaoDetalheResponse;
  idPerfil?: number | null;
  isDaAreaAtribuida: boolean;
  statusPermitidoParaTramitar: boolean;
  areasCondicionantes: Array<{ idArea: number; nmArea: string }>;
  userResponsavel: ResponsavelResponse | null;
  arquivosTramitacaoPendentes?: ArquivoDTO[];
  onClearArquivosTramitacao?: () => void;
  onRefreshAnexos?: () => void;
  podeEnviarComentarioPorPerfilEArea?: boolean;
}

export function useComentariosLogica({
  detalhe,
  idPerfil,
  isDaAreaAtribuida,
  statusPermitidoParaTramitar,
  areasCondicionantes,
  userResponsavel,
  arquivosTramitacaoPendentes = [],
  onClearArquivosTramitacao,
  onRefreshAnexos,
  podeEnviarComentarioPorPerfilEArea = false,
}: UseComentariosLogicaParams) {
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
  const [parecerReferenciaViaTramitacao, setParecerReferenciaViaTramitacao] = useState<number | null>(null);
  const [parecerTramitacaoMap, setParecerTramitacaoMap] = useState<Map<number, number>>(new Map());

  const idResponsavelLogado = authClient.getUserIdResponsavelFromToken();

  // Atualizar estados quando detalhe mudar
  useEffect(() => {
    if (detalhe?.solicitacaoParecer) {
      setSolicitacaoPareceres(detalhe.solicitacaoParecer);
      // Atualizar o mapa de parecer-tramitação quando pareceres mudarem
      const novoMap = new Map<number, number>();
      detalhe.solicitacaoParecer.forEach(parecer => {
        if (parecer.idTramitacao) {
          novoMap.set(parecer.idSolicitacaoParecer, parecer.idTramitacao);
        }
      });
      setParecerTramitacaoMap(novoMap);
    }
    if (detalhe?.tramitacoes) {
      setTramitacoes(detalhe.tramitacoes);
    }
  }, [detalhe?.solicitacaoParecer, detalhe?.tramitacoes]);

  // Carregar responsáveis
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

  // Função para recarregar dados
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

  // Carregar dados iniciais
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
  }, [detalhe?.obrigacao?.idSolicitacao, detalhe?.solicitacaoParecer, detalhe?.tramitacoes]);

  // Comentários unificados (pareceres + tramitações)
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

  // Verificar se pode responder tramitação
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

  const podeEnviarComentario = useMemo(() => {
    if (podeEnviarComentarioPorPerfilEArea) {
      return true;
    }

    if (idPerfil === perfilUtil.ADMINISTRADOR ||
      idPerfil === perfilUtil.GESTOR_DO_SISTEMA ||
      idPerfil === perfilUtil.VALIDADOR_ASSINANTE) {
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

  // Tooltip para enviar comentário
  const tooltipEnviarComentario = useMemo(() => {
    if (!podeEnviarComentario) {
      return 'Apenas usuários da área atribuída, áreas condicionantes ou administradores/gestores podem enviar comentários.';
    }
    return '';
  }, [podeEnviarComentario]);

  // Handler para deletar parecer
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

  // Handler para responder parecer
  const handleResponder = useCallback((parecer: SolicitacaoParecerResponse) => {
    const nomeResponsavel = parecer.responsavel?.nmResponsavel || 'Usuário';
    setComentarioTexto(`@${nomeResponsavel} `);
    setParecerReferencia(parecer.idSolicitacaoParecer);
    setTramitacaoReferencia(null);
    setParecerReferenciaViaTramitacao(null);
  }, []);

  // Handler para responder tramitação
  const handleResponderTramitacao = useCallback((tramitacao: SolTramitacaoResponse) => {
    const responsavelTramitacao = tramitacao.tramitacaoAcao?.[0]?.responsavelArea?.responsavel;
    const nomeResponsavel = responsavelTramitacao?.nmResponsavel || 'Usuário';
    setComentarioTexto(`@${nomeResponsavel} `);
    setTramitacaoReferencia(tramitacao.idTramitacao);
    // Se a tramitação que está sendo respondida referencia um parecer, manter essa referência
    setParecerReferenciaViaTramitacao(tramitacao.idSolicitacaoParecerRef ?? null);
    setParecerReferencia(null);
  }, []);

  // Handler para enviar comentário
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

      if (isDaAreaAtribuida) {
        if (podeResponderTramitacao) {
          const idStatusAtual = detalhe.obrigacao.statusSolicitacao.idStatusSolicitacao;
          const tramitacaoExistente = tramitacoes.find(
            t => t.tramitacao?.solicitacao?.statusSolicitacao?.idStatusSolicitacao === idStatusAtual &&
                 t.tramitacao?.dsObservacao === textoCompleto.trim()
          );

          const podeCriarTramitacao = statusPermitidoParaTramitar && !tramitacaoExistente;
          
          if (podeCriarTramitacao) {
            const tramitacaoRequest: TramitacaoRequest = {
              idSolicitacao: detalhe.obrigacao.idSolicitacao,
              dsObservacao: textoCompleto.trim(),
              idResponsavel: userResponsavel?.idResponsavel,
              arquivos: arquivosTramitacaoPendentes,
              idTramitacaoRef: tramitacaoReferencia ?? undefined,
              idSolicitacaoParecerRef: parecerReferencia ?? parecerReferenciaViaTramitacao ?? undefined,
            };

            await tramitacoesClient.tramitarViaFluxo(tramitacaoRequest);
                   
            onClearArquivosTramitacao?.();
            
            if (onRefreshAnexos) {
              await onRefreshAnexos();
            }
            toast.success('Comentário de área atribuída salvo com sucessooooo222.');
            return;
          }

          if (idStatusAtual === statusList.ATRASADA.id) {
            const parecerRequest: {
              idSolicitacao: number;
              idStatusSolicitacao: number;
              dsDarecer: string;
              idSolicitacaoParecerReferen?: number | null;
              idTramitacao?: number | null;
            } = {
              idSolicitacao: detalhe.obrigacao.idSolicitacao,
              idStatusSolicitacao: detalhe.obrigacao.statusSolicitacao.idStatusSolicitacao,
              dsDarecer: textoCompleto.trim(),
            };

            if (parecerReferencia) {
              parecerRequest.idSolicitacaoParecerReferen = parecerReferencia;
            }

            if (tramitacaoReferencia) {
              parecerRequest.idTramitacao = tramitacaoReferencia;
            }

            await solicitacaoParecerClient.criar(parecerRequest);
            
            toast.success('Comentário de área atribuída salvo com sucessooooo.');
            if (onRefreshAnexos) {
              await onRefreshAnexos();
            }
            return;
          }
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

        if (onRefreshAnexos) {
          await onRefreshAnexos();
        }
        
        toast.success('Comentário salvo com sucesso.');
      }

      setComentarioTexto('');
      setParecerReferencia(null);
      setTramitacaoReferencia(null);
      setParecerReferenciaViaTramitacao(null);
      
      if (textarea) {
        textarea.value = '';
      }
    } catch (error) {
      console.error('Erro ao enviar comentário:', error);
      toast.error('Erro ao enviar o comentário.');
    } finally {
      setLoadingAction(false);
    }
  }, [
    comentarioTexto, 
    parecerReferencia,
    parecerReferenciaViaTramitacao, 
    tramitacaoReferencia, 
    detalhe?.obrigacao?.idSolicitacao, 
    detalhe?.obrigacao?.statusSolicitacao?.idStatusSolicitacao, 
    isDaAreaAtribuida, 
    userResponsavel, 
    tramitacoes, 
    podeResponderTramitacao, 
    onRefreshAnexos, 
    statusPermitidoParaTramitar, 
    arquivosTramitacaoPendentes, 
    onClearArquivosTramitacao,
  ]);

  // Função para resetar comentário
  const resetComentario = useCallback(() => {
    setComentarioTexto('');
    setParecerReferencia(null);
    setTramitacaoReferencia(null);
    const textarea = document.getElementById('comentario-textarea') as HTMLTextAreaElement;
    if (textarea) {
      textarea.value = '';
    }
  }, []);

  // Função para obter o texto do comentário
  const getComentarioTexto = useCallback(() => {
    const textarea = document.getElementById('comentario-textarea') as HTMLTextAreaElement;
    return textarea?.value || comentarioTexto;
  }, [comentarioTexto]);

  return {
    // Estados
    comentarioTexto,
    setComentarioTexto,
    solicitacaoPareceres,
    tramitacoes,
    responsaveis,
    loadingComentarios,
    loadingAction,
    setLoadingAction,
    parecerReferencia,
    setParecerReferencia,
    parecerReferenciaViaTramitacao,
    tramitacaoReferencia,
    setTramitacaoReferencia,
    parecerTramitacaoMap,
    idResponsavelLogado,
    // Dados computados
    comentariosUnificados,
    podeResponderTramitacao,
    podeEnviarComentario,
    tooltipEnviarComentario,
    // Handlers
    handleDeletarParecer,
    handleResponder,
    handleResponderTramitacao,
    handleEnviarComentario,
    resetComentario,
    getComentarioTexto,
    reloadDados,
  };
}