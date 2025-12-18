'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CloudDownload, Send } from 'lucide-react';
import { cn } from '@/utils/utils';
import type { ObrigacaoDetalheResponse } from '@/api/obrigacao/types';
import type { ArquivoDTO } from '@/api/anexos/type';
import { TipoDocumentoAnexoEnum } from '@/api/anexos/type';
import { AnexosTab } from './AnexosTab';
import { ComentariosTab } from './ComentariosTab';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import ExportHistoricoObrigacaoPdf from '@/components/obrigacoes/relatorios/ExportHistoricoObrigacaoPdf';
import LoadingOverlay from '@/components/ui/loading-overlay';
import { useUserGestao } from '@/hooks/use-user-gestao';

// Hooks customizados
import { 
  usePermissoesObrigacao, 
  useAnexosLogica, 
  useComentariosLogica, 
  useUserResponsavel 
} from './hooks';

interface ConferenciaSidebarProps {
  detalhe: ObrigacaoDetalheResponse;
  onRefreshAnexos?: () => void;
  podeEnviarComentarioPorPerfilEArea?: boolean;
  isStatusDesabilitadoParaTramitacao?: boolean;
  onRegisterComentarioActions?: (actions: { 
    get: () => string; 
    reset: () => void;
    getTramitacaoRef: () => number | null;
    getParecerRef: () => number | null;
  }) => void;
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
  onRegisterComentarioActions,
  arquivosTramitacaoPendentes = [],
  onAddArquivosTramitacao,
  onRemoveArquivoTramitacao,
  onClearArquivosTramitacao,
}: ConferenciaSidebarProps) {
  const { idPerfil } = useUserGestao();
  const [registroTab, setRegistroTab] = useState<RegistroTabKey>(RegistroTabKey.ANEXOS);
  const [exportingPdf, setExportingPdf] = useState(false);

  const { userResponsavel } = useUserResponsavel();

  const permissoes = usePermissoesObrigacao({
    detalhe,
    idPerfil,
    userResponsavel,
  });

  const anexosLogica = useAnexosLogica({
    detalhe,
    idPerfil,
    onRefreshAnexos,
  });

  const comentariosLogica = useComentariosLogica({
    detalhe,
    idPerfil,
    isDaAreaAtribuida: permissoes.isDaAreaAtribuida,
    statusPermitidoParaTramitar: permissoes.statusPermitidoParaTramitar,
    areasCondicionantes: permissoes.areasCondicionantes.map(a => ({ idArea: a.idArea, nmArea: a.nmArea })),
    userResponsavel,
    arquivosTramitacaoPendentes,
    onClearArquivosTramitacao,
    onRefreshAnexos,
    podeEnviarComentarioPorPerfilEArea,
  });

  useEffect(() => {
    if (onRegisterComentarioActions) {
      onRegisterComentarioActions({
        get: comentariosLogica.getComentarioTexto,
        reset: comentariosLogica.resetComentario,
        getTramitacaoRef: () => comentariosLogica.tramitacaoReferencia,
        getParecerRef: () => comentariosLogica.parecerReferencia,
      });
    }
  }, [
    onRegisterComentarioActions, 
    comentariosLogica.getComentarioTexto, 
    comentariosLogica.resetComentario, 
    comentariosLogica.tramitacaoReferencia, 
    comentariosLogica.parecerReferencia
  ]);

  const comentariosCount = comentariosLogica.comentariosUnificados.length;
  const anexosCount = useMemo(() => {
    const anexosPrincipais = anexosLogica.anexos.filter(a => a.tpDocumento !== TipoDocumentoAnexoEnum.C);
    const anexosDasTramitacoes = (comentariosLogica.tramitacoes || []).flatMap(t => t.anexos || []);
    const todosAnexos = [...anexosPrincipais, ...anexosDasTramitacoes];
    const uniqueIds = new Set(todosAnexos.map(a => a.idAnexo));
    return uniqueIds.size;
  }, [anexosLogica.anexos, comentariosLogica.tramitacoes]);

  const handleResponderParecer = useCallback((parecer: Parameters<typeof comentariosLogica.handleResponder>[0]) => {
    comentariosLogica.handleResponder(parecer);
    setRegistroTab(RegistroTabKey.COMENTARIOS);
    
    setTimeout(() => {
      const textarea = document.getElementById('comentario-textarea') as HTMLTextAreaElement;
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(textarea.value.length, textarea.value.length);
      }
    }, 200);
  }, [comentariosLogica]);

  const handleResponderTramitacao = useCallback((tramitacao: Parameters<typeof comentariosLogica.handleResponderTramitacao>[0]) => {
    comentariosLogica.handleResponderTramitacao(tramitacao);
    setRegistroTab(RegistroTabKey.COMENTARIOS);
    
    setTimeout(() => {
      const textarea = document.getElementById('comentario-textarea') as HTMLTextAreaElement;
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(textarea.value.length, textarea.value.length);
      }
    }, 200);
  }, [comentariosLogica]);

  const tooltipFinalEnviarComentario = useMemo(() => {
    if (comentariosLogica.loadingAction) {
      return 'Enviando comentário...';
    }
    
    if (!comentariosLogica.comentarioTexto.trim()) {
      return 'Digite um comentário antes de enviar.';
    }

    if (!comentariosLogica.podeEnviarComentario) {
      return comentariosLogica.tooltipEnviarComentario;
    }

    if (!permissoes.isPerfilPermitidoPorStatus) {
      return permissoes.tooltipPerfilPermitidoPorStatus;
    }

    return '';
  }, [
    comentariosLogica.loadingAction, 
    comentariosLogica.comentarioTexto, 
    comentariosLogica.podeEnviarComentario, 
    comentariosLogica.tooltipEnviarComentario,
    permissoes.isPerfilPermitidoPorStatus, 
    permissoes.tooltipPerfilPermitidoPorStatus
  ]);

  const isLoading = anexosLogica.loadingAction || comentariosLogica.loadingAction;

  return (
    <aside className="fixed right-0 top-[80px] bottom-[49px] z-10 flex w-full max-w-md flex-shrink-0 flex-col">
      <div className="flex h-full flex-col overflow-hidden rborder-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Registros</h2>
          </div>
          <div>
            {permissoes.podeGerarRelatorio && (
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
                anexos={anexosLogica.anexos}
                tramitacoes={comentariosLogica.tramitacoes}
                downloadingId={anexosLogica.downloadingId}
                onDeleteAnexo={anexosLogica.handleDeleteAnexoClick}
                onDownloadAnexo={anexosLogica.handleDownloadAnexo}
                onEvidenceLinkRemove={anexosLogica.handleEvidenceLinkRemoveClick}
                onEvidenceLinkAdd={anexosLogica.handleEvidenceLinkAdd}
                idObrigacao={detalhe?.obrigacao?.idSolicitacao || 0}
                idPerfil={idPerfil ?? undefined}
                onRefreshAnexos={onRefreshAnexos}
                isStatusEmAndamento={permissoes.isStatusEmAndamento}
                isStatusAtrasada={permissoes.isStatusAtrasada}
                isStatusEmValidacaoRegulatorio={permissoes.isStatusEmValidacaoRegulatorio}
                isStatusPendente={permissoes.isStatusPendente}
                isStatusNaoIniciado={permissoes.isStatusNaoIniciado}
                isStatusConcluido={permissoes.isStatusConcluido}
                isStatusNaoAplicavelSuspensa={permissoes.isStatusNaoAplicavelSuspensa}
                isStatusPreAnalise={permissoes.isStatusPreAnalise}
                isDaAreaAtribuida={permissoes.isDaAreaAtribuida}
                isStatusDesabilitadoParaTramitacao={isStatusDesabilitadoParaTramitacao}
                arquivosTramitacaoPendentes={arquivosTramitacaoPendentes}
                onAddArquivosTramitacao={onAddArquivosTramitacao}
                onRemoveArquivoTramitacao={onRemoveArquivoTramitacao}
              />
            ) : (
              <ComentariosTab
                solicitacaoPareceres={comentariosLogica.solicitacaoPareceres}
                tramitacoes={comentariosLogica.tramitacoes}
                comentariosUnificados={comentariosLogica.comentariosUnificados}
                responsaveis={comentariosLogica.responsaveis}
                loading={comentariosLogica.loadingComentarios}
                idResponsavelLogado={comentariosLogica.idResponsavelLogado}
                onDeletar={comentariosLogica.handleDeletarParecer}
                onResponder={handleResponderParecer}
                onResponderTramitacao={handleResponderTramitacao}
                parecerTramitacaoMap={comentariosLogica.parecerTramitacaoMap}
                areaAtribuida={permissoes.areaAtribuida}
              />
            )}
          </div>

          {registroTab === RegistroTabKey.COMENTARIOS && (
            <div className="bg-white px-6 py-4 border-t border-gray-100 shrink-0 mb-5">
              <label className="mb-2 block text-sm font-semibold text-gray-900">Escreva um comentário</label>
              
              {comentariosLogica.tramitacaoReferencia && comentariosLogica.podeResponderTramitacao && (() => {
                const tramitacaoReferenciada = comentariosLogica.tramitacoes.find(
                  t => t.tramitacao.idTramitacao === comentariosLogica.tramitacaoReferencia
                );
                const responsavelTramitacao = tramitacaoReferenciada?.tramitacao.tramitacaoAcao?.[0]?.responsavelArea?.responsavel;
                const nomeResponsavel = responsavelTramitacao?.nmResponsavel || 'Usuário';
                return (
                  <div className="mb-2 text-xs text-blue-600">
                    Respondendo a uma tramitação de <span className="text-blue-600 font-semibold">@{nomeResponsavel}</span>
                  </div>
                );
              })()}
              
              {comentariosLogica.parecerReferencia && !comentariosLogica.tramitacaoReferencia && comentariosLogica.podeResponderTramitacao && (() => {
                const parecerReferenciado = comentariosLogica.solicitacaoPareceres.find(
                  p => p.idSolicitacaoParecer === comentariosLogica.parecerReferencia
                );
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
                  value={comentariosLogica.comentarioTexto}
                  onChange={(e) => {
                    comentariosLogica.setComentarioTexto(e.target.value);
                    if (!e.target.value.includes('@')) {
                      if (comentariosLogica.parecerReferencia) {
                        comentariosLogica.setParecerReferencia(null);
                      }
                      if (comentariosLogica.tramitacaoReferencia) {
                        comentariosLogica.setTramitacaoReferencia(null);
                      }
                    }
                  }}
                  className="flex-1 resize-none border border-gray-200 rounded-2xl bg-white px-4 py-3 shadow-sm focus-visible:ring-0 focus-visible:border-blue-500 min-h-[80px] text-sm"
                  rows={4}
                  disabled={comentariosLogica.loadingAction || !comentariosLogica.podeEnviarComentario}
                />
                {isStatusDesabilitadoParaTramitacao || permissoes.isStatusEmValidacaoRegulatorio || permissoes.isStatusConcluido && (
                  <Button
                    type="button"
                    size="icon"
                    className="rounded-full bg-blue-500 text-white hover:bg-blue-600 shrink-0 h-10 w-10 disabled:opacity-50"
                    onClick={comentariosLogica.handleEnviarComentario}
                    disabled={
                      comentariosLogica.loadingAction || 
                      !comentariosLogica.comentarioTexto.trim() || 
                      !comentariosLogica.podeEnviarComentario || 
                      !permissoes.isPerfilPermitidoPorStatus
                    }
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
        open={anexosLogica.showDeleteAnexoDialog}
        onOpenChange={anexosLogica.handleCloseDeleteAnexoDialog}
        title="Excluir anexo"
        description={`Tem certeza que deseja excluir o anexo "${anexosLogica.anexoToDelete?.nmArquivo}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={anexosLogica.confirmDeleteAnexo}
        variant="destructive"
      />

      <ConfirmationDialog
        open={anexosLogica.showDeleteLinkDialog}
        onOpenChange={anexosLogica.handleCloseDeleteLinkDialog}
        title="Excluir link"
        description={`Tem certeza que deseja excluir o link "${anexosLogica.linkToDelete}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={anexosLogica.confirmDeleteLink}
        variant="destructive"
      />

      {exportingPdf && (
        <ExportHistoricoObrigacaoPdf
          detalhe={detalhe}
          onDone={() => setExportingPdf(false)}
        />
      )}

      {isLoading && (
        <LoadingOverlay 
          title="Processando..." 
          subtitle="Aguarde enquanto os dados são enviados e o fluxo é atualizado." 
        />
      )}
    </aside>
  );
}