'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CloudDownload, Send } from 'lucide-react';
import { toast } from 'sonner';
import anexosClient from '@/api/anexos/client';
import { base64ToUint8Array, cn, saveBlob } from '@/utils/utils';
import type { ObrigacaoDetalheResponse } from '@/api/obrigacao/types';
import type { AnexoResponse } from '@/api/anexos/type';
import { TipoObjetoAnexoEnum, TipoResponsavelAnexoEnum } from '@/api/anexos/type';
import { AnexosTab } from './AnexosTab';
import { ComentariosTab } from './ComentariosTab';
import solicitacaoParecerClient from '@/api/solicitacao-parecer/client';
import { SolicitacaoParecerResponse } from '@/api/solicitacao-parecer/types';
import { authClient } from '@/api/auth/client';
import { responsaveisClient } from '@/api/responsaveis/client';
import { ResponsavelResponse } from '@/api/responsaveis/types';
import { TipoEnum } from '@/api/tipos/types';

interface ConferenciaSidebarProps {
  detalhe: ObrigacaoDetalheResponse;
}

enum RegistroTabKey {
  ANEXOS = 'anexos',
  COMENTARIOS = 'comentarios',
}

export function ConferenciaSidebar({ detalhe }: ConferenciaSidebarProps) {
  const [registroTab, setRegistroTab] = useState<RegistroTabKey>(RegistroTabKey.ANEXOS);
  const [evidenceLinks, setEvidenceLinks] = useState<Array<{ link: string; data: string; responsavel: string }>>([]);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [comentarioTexto, setComentarioTexto] = useState('');
  const [solicitacaoPareceres, setSolicitacaoPareceres] = useState<SolicitacaoParecerResponse[]>([]);
  const [responsaveis, setResponsaveis] = useState<ResponsavelResponse[]>([]);
  const [loadingComentarios, setLoadingComentarios] = useState(false);
  const [enviandoComentario, setEnviandoComentario] = useState(false);
  const [parecerReferencia, setParecerReferencia] = useState<number | null>(null);

  const areaAtribuida = useMemo(() => {
    return detalhe?.obrigacao?.areas?.find((area) => area.tipoArea?.cdTipo === TipoEnum.ATRIBUIDA);
  }, [detalhe?.obrigacao?.areas]);

  const mockAnexos = useMemo<AnexoResponse[]>(() => [
    {
      idAnexo: 1,
      idObjeto: 1,
      tpObjeto: 'O',
      nmArquivo: 'evidência.pdf',
      dsCaminho: '/anexos/evidencia.pdf',
      tpResponsavel: TipoResponsavelAnexoEnum.A,
      flAtivo: 'ATIVO',
      dtCriacao: '2025-10-10T00:00:00.000Z',
    },
    {
      idAnexo: 2,
      idObjeto: 1,
      tpObjeto: 'O',
      nmArquivo: 'correspondência.pdf',
      dsCaminho: '/anexos/correspondencia.pdf',
      tpResponsavel: TipoResponsavelAnexoEnum.R,
      flAtivo: 'ATIVO',
      dtCriacao: '2025-10-10T00:00:00.000Z',
    },
    {
      idAnexo: 3,
      idObjeto: 1,
      tpObjeto: 'O',
      nmArquivo: 'doc_name.xlsx',
      dsCaminho: '/anexos/doc_name.xlsx',
      tpResponsavel: TipoResponsavelAnexoEnum.A,
      flAtivo: 'ATIVO',
      dtCriacao: '2025-10-10T00:00:00.000Z',
    },
    {
      idAnexo: 4,
      idObjeto: 1,
      tpObjeto: 'O',
      nmArquivo: 'doc_name.docx',
      dsCaminho: '/anexos/doc_name.docx',
      tpResponsavel: TipoResponsavelAnexoEnum.R,
      flAtivo: 'ATIVO',
      dtCriacao: '2025-10-10T00:00:00.000Z',
    },
    {
      idAnexo: 5,
      idObjeto: 1,
      tpObjeto: 'O',
      nmArquivo: 'doc_name.xlsx',
      dsCaminho: '/anexos/doc_name.xlsx',
      tpResponsavel: TipoResponsavelAnexoEnum.A,
      flAtivo: 'ATIVO',
      dtCriacao: '2025-10-10T00:00:00.000Z',
    },
    {
      idAnexo: 6,
      idObjeto: 1,
      tpObjeto: 'O',
      nmArquivo: 'doc_name.docx',
      dsCaminho: '/anexos/doc_name.docx',
      tpResponsavel: TipoResponsavelAnexoEnum.R,
      flAtivo: 'ATIVO',
      dtCriacao: '2025-10-10T00:00:00.000Z',
    },
  ], []);

  const mockEvidenceLinks = useMemo(() => [
    {
      link: 'https://drive.google.com/drive/ua...',
      data: '2025-10-10T00:00:00.000Z',
      responsavel: 'Analista',
    },
  ], []);

  const anexos = useMemo(() => detalhe.anexos?.length ? detalhe.anexos : mockAnexos, [detalhe.anexos, mockAnexos]);

  useEffect(() => {
    const carregarDados = async () => {
      if (!detalhe?.obrigacao?.idSolicitacao) {
        return;
      }

      try {
        setLoadingComentarios(true);
        const [pareceres, responsaveisResponse] = await Promise.all([
          solicitacaoParecerClient.buscarPorIdSolicitacao(detalhe.obrigacao.idSolicitacao),
          responsaveisClient.buscarPorFiltro({ size: 1000 })
        ]);
        
        setSolicitacaoPareceres(pareceres || []);
        const responsaveisAtivos = responsaveisResponse.content.filter(r => r.flAtivo === 'S');
        setResponsaveis(responsaveisAtivos);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast.error('Erro ao carregar comentários.');
      } finally {
        setLoadingComentarios(false);
      }
    };

    carregarDados();
  }, [detalhe?.obrigacao?.idSolicitacao]);

  const comentariosCount = solicitacaoPareceres.length;
  const anexosCount = anexos.length + (evidenceLinks.length > 0 ? evidenceLinks.length : mockEvidenceLinks.length);
  
  const idResponsavelLogado = authClient.getUserIdResponsavelFromToken();

  const handleDeletarParecer = useCallback(async (idSolicitacaoParecer: number) => {
    try {
      await solicitacaoParecerClient.deletar(idSolicitacaoParecer);
      toast.success('Comentário removido com sucesso.');
      
      if (detalhe?.obrigacao?.idSolicitacao) {
        // Recarregar pareceres e responsáveis juntos
        const [pareceres, responsaveisResponse] = await Promise.all([
          solicitacaoParecerClient.buscarPorIdSolicitacao(detalhe.obrigacao.idSolicitacao),
          responsaveisClient.buscarPorFiltro({ size: 1000 })
        ]);
        
        setSolicitacaoPareceres(pareceres || []);
        const responsaveisAtivos = responsaveisResponse.content.filter(r => r.flAtivo === 'S');
        setResponsaveis(responsaveisAtivos);
      }
    } catch (error) {
      console.error('Erro ao deletar parecer:', error);
      toast.error('Erro ao remover o comentário.');
    }
  }, [detalhe?.obrigacao?.idSolicitacao]);

  const handleDeleteAnexo = useCallback(
    async (anexo: AnexoResponse) => {
      try {
        await anexosClient.deletar(anexo.idAnexo);
        toast.success('Anexo removido com sucesso.');
      } catch (error) {
        console.error('Erro ao deletar anexo:', error);
        toast.error('Erro ao deletar o anexo.');
      }
    },
    [],
  );

  const handleDownloadAnexo = useCallback(
    async (anexo: AnexoResponse) => {
      try {
        setDownloadingId(anexo.idAnexo);
        const arquivos = await anexosClient.download(anexo.idObjeto, TipoObjetoAnexoEnum.O, anexo.nmArquivo);

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

  const handleEvidenceLinkRemove = useCallback((link: string) => {
    setEvidenceLinks((prev) => prev.filter((item) => item.link !== link));
    toast.success('Link removido.');
  }, []);

  const handleEvidenceLinkAdd = useCallback((link: string) => {
    const hoje = new Date().toISOString();
    const responsavel = 'Analista';
    setEvidenceLinks((prev) => [...prev, { link, data: hoje, responsavel }]);
  }, []);

  const handleResponder = useCallback((parecer: SolicitacaoParecerResponse) => {
    const nomeResponsavel = parecer.responsavel?.nmResponsavel || 'Usuário';
    setComentarioTexto(`@${nomeResponsavel} `);
    setParecerReferencia(parecer.idSolicitacaoParecer);
    
    setRegistroTab(RegistroTabKey.COMENTARIOS);
    
    setTimeout(() => {
      const textarea = document.getElementById('comentario-textarea') as HTMLTextAreaElement;
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(textarea.value.length, textarea.value.length);
      }
    }, 200);
  }, []);

  const handleEnviarComentario = useCallback(async () => {
    if (!comentarioTexto.trim()) {
      toast.warning('Digite um comentário antes de enviar.');
      return;
    }

    if (!detalhe?.obrigacao?.idSolicitacao || !detalhe?.obrigacao?.statusSolicitacao?.idStatusSolicitacao) {
      toast.error('Dados da obrigação incompletos.');
      return;
    }

    try {
      setEnviandoComentario(true);
      const requestData: {
        idSolicitacao: number;
        idStatusSolicitacao: number;
        dsDarecer: string;
        idSolicitacaoParecerReferen?: number | null;
      } = {
        idSolicitacao: detalhe.obrigacao.idSolicitacao,
        idStatusSolicitacao: detalhe.obrigacao.statusSolicitacao.idStatusSolicitacao,
        dsDarecer: comentarioTexto.trim(),
      };

      if (parecerReferencia) {
        requestData.idSolicitacaoParecerReferen = parecerReferencia;
      }

      await solicitacaoParecerClient.criar(requestData);

      toast.success('Comentário enviado com sucesso.');
      setComentarioTexto('');
      setParecerReferencia(null);

      // Recarregar pareceres e responsáveis juntos
      const [pareceres, responsaveisResponse] = await Promise.all([
        solicitacaoParecerClient.buscarPorIdSolicitacao(detalhe.obrigacao.idSolicitacao),
        responsaveisClient.buscarPorFiltro({ size: 1000 })
      ]);
      
      setSolicitacaoPareceres(pareceres || []);
      const responsaveisAtivos = responsaveisResponse.content.filter(r => r.flAtivo === 'S');
      setResponsaveis(responsaveisAtivos);
    } catch (error) {
      console.error('Erro ao enviar comentário:', error);
      toast.error('Erro ao enviar o comentário.');
    } finally {
      setEnviandoComentario(false);
    }
  }, [comentarioTexto, parecerReferencia, detalhe?.obrigacao?.idSolicitacao, detalhe?.obrigacao?.statusSolicitacao?.idStatusSolicitacao]);

  return (
    <aside className="fixed right-0 top-[80px] bottom-[49px] z-10 flex w-full max-w-md flex-shrink-0 flex-col">
      <div className="flex h-full flex-col overflow-hidden rborder-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Registros</h2>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex items-center gap-2 rounded-full border-gray-200 bg-white hover:bg-gray-50"
            onClick={() => toast.info('Exportação disponível em breve.')}
          >
            <CloudDownload className="h-4 w-4" />
            Exportar
          </Button>
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
                evidenceLinks={evidenceLinks}
                mockEvidenceLinks={mockEvidenceLinks}
                downloadingId={downloadingId}
                onDeleteAnexo={handleDeleteAnexo}
                onDownloadAnexo={handleDownloadAnexo}
                onEvidenceLinkRemove={handleEvidenceLinkRemove}
                onEvidenceLinkAdd={handleEvidenceLinkAdd}
              />
            ) : (
              <ComentariosTab
                solicitacaoPareceres={solicitacaoPareceres}
                responsaveis={responsaveis}
                loading={loadingComentarios}
                idResponsavelLogado={idResponsavelLogado}
                onDeletar={handleDeletarParecer}
                onResponder={handleResponder}
                areaAtribuida={areaAtribuida}
              />
            )}
          </div>

          {registroTab === RegistroTabKey.COMENTARIOS && (
            <div className="bg-white px-6 py-4 border-t border-gray-100 shrink-0 mb-5">
              <label className="mb-2 block text-sm font-semibold text-gray-900">Escreva um comentário</label>
              {parecerReferencia && (() => {
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
                    if (!e.target.value.includes('@') && parecerReferencia) {
                      setParecerReferencia(null);
                    }
                  }}
                  className="flex-1 resize-none border border-gray-200 rounded-2xl bg-white px-4 py-3 shadow-sm focus-visible:ring-0 focus-visible:border-blue-500 min-h-[80px] text-sm"
                  rows={4}
                  disabled={enviandoComentario}
                />
                <Button
                  type="button"
                  size="icon"
                  className="rounded-full bg-blue-500 text-white hover:bg-blue-600 shrink-0 h-10 w-10 disabled:opacity-50"
                  onClick={handleEnviarComentario}
                  disabled={enviandoComentario || !comentarioTexto.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

