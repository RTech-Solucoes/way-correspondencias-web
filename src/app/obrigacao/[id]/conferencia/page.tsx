'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, ChevronRight, Loader2, MessageSquare, Paperclip } from 'lucide-react';
import obrigacaoClient from '@/api/obrigacao/client';
import { ObrigacaoDetalheResponse } from '@/api/obrigacao/types';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { base64ToUint8Array, saveBlob } from '@/utils/utils';
import { toast } from 'sonner';
import { AnexoResponse, TipoObjetoAnexoEnum, ArquivoDTO } from '@/api/anexos/type';
import anexosClient from '@/api/anexos/client';
import { StatusObrigacao, statusObrigacaoLabels, statusListObrigacao } from '@/api/status-obrigacao/types';
import { TipoEnum } from '@/api/tipos/types';
import { getObrigacaoStatusStyle } from '@/utils/obrigacoes/status';
import { ConferenciaStepDados } from '@/components/obrigacoes/conferencia/ConferenciaStepDados';
import { ConferenciaStepAreasETemas } from '@/components/obrigacoes/conferencia/ConferenciaStepAreasETemas';
import { ConferenciaStepPrazos } from '@/components/obrigacoes/conferencia/ConferenciaStepPrazos';
import { ConferenciaStepAnexos } from '@/components/obrigacoes/conferencia/ConferenciaStepAnexos';
import { ConferenciaStepVinculos } from '@/components/obrigacoes/conferencia/ConferenciaStepVinculos';
import { ConferenciaSidebar } from '@/components/obrigacoes/conferencia/sidebarRigth/ConferenciaSidebar';
import { useUserGestao } from '@/hooks/use-user-gestao';
import { AnexoObrigacaoModal } from '@/components/obrigacoes/conferencia/AnexoObrigacaoModal';
import { TipoDocumentoAnexoEnum } from '@/api/anexos/type';
import tramitacoesClient from '@/api/tramitacoes/client';
import { authClient } from '@/api/auth/client';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { perfilUtil } from '@/api/perfis/types';

type TabKey = 'dados' | 'temas' | 'prazos' | 'anexos' | 'vinculos';
const tabs: { key: TabKey; label: string }[] = [
  { key: 'dados', label: 'Dados' },
  { key: 'temas', label: 'Temas e áreas' },
  { key: 'prazos', label: 'Prazos' },
  { key: 'anexos', label: 'Anexos' },
  { key: 'vinculos', label: 'Vínculos' },
];

export default function ConferenciaObrigacaoPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isAdminOrGestor, idPerfil } = useUserGestao();

  const [activeTab, setActiveTab] = useState<TabKey>('dados');
  const [detalhe, setDetalhe] = useState<ObrigacaoDetalheResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<number | null>(null);
  const [showAnexarEvidenciaModal, setShowAnexarEvidenciaModal] = useState(false);
  const [showSolicitarAjustesDialog, setShowSolicitarAjustesDialog] = useState(false);
  const [showEnviarRegulatorioDialog, setShowEnviarRegulatorioDialog] = useState(false);
  const [showAprovarConferenciaDialog, setShowAprovarConferenciaDialog] = useState(false);
  const [conferenciaAprovada, setConferenciaAprovada] = useState(false);

  const parsedId = useMemo(() => {
    if (!id) return null;
    const numId = Number(id);
    return Number.isNaN(numId) || numId <= 0 ? null : numId;
  }, [id]);

  useEffect(() => {
    const carregarDetalhe = async () => {
      if (!parsedId) {
        toast.error('Identificador da obrigação inválido.');
        router.push('/obrigacao');
        return;
      }

      try {
        setLoading(true);
        const response = await obrigacaoClient.buscarDetalhePorId(parsedId);
        setDetalhe(response);
        if (response?.obrigacao?.flAprovarConferencia === 'S') {
          setConferenciaAprovada(true);
        } else {
          setConferenciaAprovada(false);
        }
      } catch (error) {
        console.error('Erro ao carregar a obrigação:', error);
        toast.error('Não foi possível carregar a obrigação.');
        router.push('/obrigacao');
      } finally {
        setLoading(false);
      }
    };

    carregarDetalhe();
  }, [parsedId, router]);

  const obrigacao = detalhe?.obrigacao;
  const anexos = useMemo(() => detalhe?.anexos ?? [], [detalhe]);

  const areaAtribuida = useMemo(() => {
    return obrigacao?.areas?.find((area) => area.tipoArea?.cdTipo === TipoEnum.ATRIBUIDA);
  }, [obrigacao?.areas]);

  const areasCondicionantes = useMemo(() => {
    return obrigacao?.areas?.filter((area) => area.tipoArea?.cdTipo === TipoEnum.CONDICIONANTE) ?? [];
  }, [obrigacao?.areas]);

  const reloadDetalhe = useCallback(async () => {
    if (!parsedId) {
      return;
    }
    try {
      const response = await obrigacaoClient.buscarDetalhePorId(parsedId);
      setDetalhe(response);
      if (response?.obrigacao?.flAprovarConferencia === 'S') {
        setConferenciaAprovada(true);
      } else {
        setConferenciaAprovada(false);
      }
    } catch (error) {
      console.error('Erro ao recarregar detalhes da obrigação:', error);
      toast.error('Erro ao recarregar detalhes da obrigação.');
    }
  }, [parsedId]);

  const handleDownloadAnexo = useCallback(
    async (anexo: AnexoResponse) => {
      if (!obrigacao || !obrigacao.idSolicitacao) {
        toast.error('Dados da obrigação incompletos.');
        return;
      }

      try {
        setDownloading(anexo.idAnexo);
        
        if (!anexo.nmArquivo) {
          toast.error('Nome do arquivo não informado.');
          return;
        }
        
        const idObjeto = anexo.idObjeto || obrigacao.idSolicitacao;
        
        const arquivos = await anexosClient.download(idObjeto, TipoObjetoAnexoEnum.O, anexo.nmArquivo);
        
        const arquivosArray: ArquivoDTO[] = Array.isArray(arquivos) 
          ? arquivos 
          : arquivos && typeof arquivos === 'object' && Object.keys(arquivos).length > 0
          ? [arquivos as ArquivoDTO]
          : [];
        
        if (arquivosArray.length === 0) {
          toast.error('Não foi possível baixar o anexo. Arquivo não encontrado.');
          return;
        }
        
        arquivosArray.forEach((arquivo) => {
          if (!arquivo.conteudoArquivo) {
            console.warn('Arquivo sem conteúdo:', arquivo);
            return;
          }
          const bytes = base64ToUint8Array(arquivo.conteudoArquivo);
          const filename = arquivo.nomeArquivo || anexo.nmArquivo;
          const mime = arquivo.tipoConteudo || 'application/octet-stream';
          saveBlob(bytes, mime, filename);
        });

        toast.success('Download iniciado com sucesso.');
      } catch (error) {
        console.error('Erro ao baixar anexo:', error);
        const errorObj = error as { status?: number; message?: string };
        const errorMessage = errorObj?.status === 204 
          ? 'Arquivo não encontrado (204). Verifique o idObjeto.'
          : errorObj?.message || 'Erro ao baixar o anexo. Verifique se o arquivo existe.';
        toast.error(errorMessage);
      } finally {
        setDownloading(null);
      }
    },
    [obrigacao],
  );

  const handleEnviarParaAnaliseClick = useCallback(() => {
    setShowEnviarRegulatorioDialog(true);
  }, []);

  const isPerfilPermitidoEnviarReg = useMemo(() => {
    return [perfilUtil.EXECUTOR_AVANCADO, perfilUtil.EXECUTOR, perfilUtil.EXECUTOR_RESTRITO].includes(idPerfil ?? 0);
  }, [idPerfil]);

  const confirmarEnviarParaAnalise = useCallback(async () => {
    if (!obrigacao?.idSolicitacao || !obrigacao?.statusSolicitacao?.idStatusSolicitacao) {
      toast.error('Dados da obrigação incompletos.');
      return;
    }
    
    const idResponsavelTecnico = authClient.getUserIdResponsavelFromToken();
    if (!idResponsavelTecnico) {
      toast.error('Usuário não autenticado.');
      return;
    }
    
    try {
      await tramitacoesClient.tramitarViaFluxo({
        idSolicitacao: obrigacao.idSolicitacao,
        dsObservacao: 'Obrigacao enviada para Em Validação (Regulatório)',
      });
      
      await obrigacaoClient.atualizar(obrigacao.idSolicitacao, {
        dsTarefa: obrigacao.dsTarefa,
        idResponsavelTecnico: idResponsavelTecnico,
      });
      
      await reloadDetalhe();
      toast.success('Evidência de cumprimento enviada para análise do regulatório');
    } catch (error) {
        console.error('Erro ao enviar obrigação para análise do regulatório:', error);
        toast.error('Erro ao enviar obrigação para análise do regulatório.');
      }
    },
    [obrigacao?.idSolicitacao, obrigacao?.statusSolicitacao?.idStatusSolicitacao, obrigacao?.dsTarefa, reloadDetalhe],
  );

  const handleSolicitarAjustesClick = useCallback(() => {
    setShowSolicitarAjustesDialog(true);
  }, []);

  const confirmarSolicitarAjustes = useCallback(async () => {
    if (!obrigacao?.idSolicitacao) {
      toast.error('Dados da obrigação incompletos.');
      return;
    }
    
    try {
      await tramitacoesClient.tramitarViaFluxo({
        idSolicitacao: obrigacao.idSolicitacao,
        dsObservacao: 'Obrigação solicitada de ajustes. Volta para área atribuída',
        flAprovado: 'N',
      });
      
      await reloadDetalhe();
      toast.success('Obrigação enviada para ajustes da área atribuída.');
    } catch (error) {
      console.error('Erro ao solicitar ajustes:', error);
      toast.error('Erro ao solicitar ajustes.');
    }
  }, [obrigacao?.idSolicitacao, reloadDetalhe]);

  const handleAprovarConferenciaClick = useCallback(() => {
    setShowAprovarConferenciaDialog(true);
  }, []);

  const confirmarAprovarConferencia = useCallback(async () => {
    if (!obrigacao?.idSolicitacao || !obrigacao?.dsTarefa) {
      toast.error('Dados da obrigação incompletos.');
      return;
    }
    
    try {
      await obrigacaoClient.atualizar(obrigacao.idSolicitacao, {
        dsTarefa: obrigacao.dsTarefa,
        flAprovarConferencia: 'S',
      });
      
      setConferenciaAprovada(true);
      await reloadDetalhe();
      toast.success('Conferência aprovada com sucesso!');
    } catch (error) {
      console.error('Erro ao aprovar conferência:', error);
      toast.error('Erro ao aprovar conferência.');
    }
  }, [obrigacao?.idSolicitacao, obrigacao?.dsTarefa, reloadDetalhe]);

  const isStatusEmAndamento = useMemo(() => {
    return obrigacao?.statusSolicitacao?.idStatusSolicitacao === statusListObrigacao.EM_ANDAMENTO.id;
  }, [obrigacao?.statusSolicitacao?.idStatusSolicitacao]);

  const isStatusEmValidacaoRegulatorio = useMemo(() => {
    return obrigacao?.statusSolicitacao?.idStatusSolicitacao === statusListObrigacao.EM_VALIDACAO_REGULATORIO.id;
  }, [obrigacao?.statusSolicitacao?.idStatusSolicitacao]);

  const tooltipEnviarRegulatorio = useMemo(() => {
    if (!isPerfilPermitidoEnviarReg) {
      return 'Você não tem permissão para enviar para análise do regulatório.';
    }
    if (!isStatusEmAndamento) {
      return 'Só é possível enviar para análise do regulatório quando o status for "Em Andamento".';
    }
    return '';
  }, [isPerfilPermitidoEnviarReg, isStatusEmAndamento]);

  const tooltipStatusValidacaoRegulatorio = useMemo(() => {
    if (conferenciaAprovada) {
      return 'A conferência já foi aprovada.';
    }
    if (!isStatusEmValidacaoRegulatorio) {
      return 'Só é possível realizar esta ação quando o status for "Em Validação (Regulatório)".';
    }
    return '';
  }, [isStatusEmValidacaoRegulatorio, conferenciaAprovada]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!obrigacao) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 py-24">
        <p className="text-lg font-medium text-gray-600">Não foi possível encontrar a obrigação.</p>
        <Button onClick={() => router.push('/obrigacao')}>Voltar para a lista</Button>
      </div>
    );
  }

  const statusLabel =
    obrigacao.statusSolicitacao?.nmStatus &&
    Object.values(StatusObrigacao).includes(obrigacao.statusSolicitacao.nmStatus as StatusObrigacao)
      ? statusObrigacaoLabels[obrigacao.statusSolicitacao.nmStatus as StatusObrigacao]
      : obrigacao.statusSolicitacao?.nmStatus ?? '-';

  const statusStyle = getObrigacaoStatusStyle(
    obrigacao.statusSolicitacao?.idStatusSolicitacao,
    obrigacao.statusSolicitacao?.nmStatus,
  );

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <main className="flex flex-1 gap-6 px-8 py-6 pb-32 pr-[calc(28rem+2rem)]">
        <div className="flex flex-1 flex-col gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Link href="/obrigacao" className="hover:text-gray-700">
                <button
                  type="button"
                  onClick={() => router.push('/obrigacao')}
                  className="flex items-center gap-3 text-gray-600 transition-colors hover:text-gray-900"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white">
                    <ArrowLeft className="h-4 w-4" />
                  </span>
                  <span className="text-base font-medium">Obrigações</span>
                </button>
              </Link>
              <ChevronRight className="h-3.5 w-3.5 text-black" />
              <span className="font-medium text-gray-700">{obrigacao.cdIdentificacao?.toString() || 'Não identificado'}</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Conferência de obrigação</h1>
                <p className="text-sm text-gray-500">
                  Visualize os dados completos, anexos e vínculos relacionados à obrigação selecionada.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-6">
            <Tabs
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as TabKey)}
              className="flex flex-1 flex-col gap-6"
            >
              <div className="px-6">
                <div className="flex w-full items-center justify-between gap-2 rounded-full border border-gray-200 bg-white px-2 py-2 shadow-sm">
                  {tabs.map((tab) => {
                    const isActive = activeTab === tab.key;
                    return (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex-1 rounded-full px-6 py-3 text-center text-base font-semibold transition-all ${
                          isActive ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <TabsList className="hidden">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.key}
                    value={tab.key}
                    className="sr-only"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="flex-1">
                <TabsContent value="dados" className="p-0">
                  <ConferenciaStepDados
                    obrigacao={obrigacao}
                    statusLabel={statusLabel}
                    statusStyle={statusStyle}
                  />
                </TabsContent>

                <TabsContent value="temas" className="p-0">
                  <ConferenciaStepAreasETemas
                    obrigacao={obrigacao}
                    areaAtribuida={areaAtribuida}
                    areasCondicionantes={areasCondicionantes}
                  />
                </TabsContent>

                <TabsContent value="prazos" className="p-0">
                  <ConferenciaStepPrazos obrigacao={obrigacao} />
                </TabsContent>

                <TabsContent value="anexos" className="p-0">
                  <ConferenciaStepAnexos
                    anexos={anexos}
                    downloadingId={downloading}
                    onDownloadAnexo={handleDownloadAnexo}
                  />
                </TabsContent>

                <TabsContent value="vinculos" className="p-0">
                  <ConferenciaStepVinculos obrigacao={obrigacao} />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </main>
      {detalhe && (
        <ConferenciaSidebar 
          detalhe={detalhe} 
          onRefreshAnexos={reloadDetalhe}
        />
      )}
      <footer className="fixed bottom-0 left-0 right-0 z-11 border-t border-gray-200 bg-white px-8 py-4">
        <div className="ml-auto flex w-full max-w-6xl flex-wrap items-center justify-end gap-3">
          {isAdminOrGestor ? (
            <>
              <Button
                type="button"
                className="flex items-center gap-2 rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800"
                onClick={() => toast.info('Funcionalidade de anexar correspondência em desenvolvimento.')}
              >
                <Paperclip className="h-4 w-4" />
                Anexar correspondência
              </Button>
              <Button
                type="button"
                className="flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSolicitarAjustesClick}
                disabled={!isStatusEmValidacaoRegulatorio || conferenciaAprovada}
                tooltip={tooltipStatusValidacaoRegulatorio}
              >
                <MessageSquare className="h-4 w-4" />
                Solicitar ajustes
              </Button>
              <Button
                type="button"
                className="flex items-center gap-2 rounded-full bg-blue-500 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleAprovarConferenciaClick}
                disabled={!isStatusEmValidacaoRegulatorio || conferenciaAprovada}
                tooltip={tooltipStatusValidacaoRegulatorio}
              >
                <CheckCircle2 className="h-4 w-4" />
                Aprovar conferência
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                className="flex items-center gap-2 rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800"
                onClick={() => setShowAnexarEvidenciaModal(true)}
              >
                <Paperclip className="h-4 w-4" />
                Anexar evidência de cumprimento
              </Button>
              <Button
                type="button"
                className="flex items-center gap-2 rounded-full bg-blue-500 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleEnviarParaAnaliseClick}
                disabled={!isStatusEmAndamento || !isPerfilPermitidoEnviarReg}
                tooltip={tooltipEnviarRegulatorio}
              >
                <CheckCircle2 className="h-4 w-4" />
                Enviar para análise do regulatório
              </Button>
            </>
          )}
        </div>
      </footer>

      {obrigacao?.idSolicitacao && (
        <AnexoObrigacaoModal
          open={showAnexarEvidenciaModal}
          onClose={() => setShowAnexarEvidenciaModal(false)}
          title="Anexar arquivo de evidência de cumprimento"
          tpDocumento={TipoDocumentoAnexoEnum.E}
          idObrigacao={obrigacao.idSolicitacao}
          idPerfil={idPerfil ?? undefined}
          onSuccess={async () => {
            await reloadDetalhe();
            toast.success('Evidência de cumprimento anexada com sucesso!');
          }}
        />
      )}

      <ConfirmationDialog
        open={showSolicitarAjustesDialog}
        onOpenChange={setShowSolicitarAjustesDialog}
        title="Solicitar ajustes"
        description="Tem certeza que deseja solicitar ajustes para esta obrigação?"
        confirmText="Sim, solicitar ajustes"
        cancelText="Cancelar"
        onConfirm={confirmarSolicitarAjustes}
        variant="default"
      />

      <ConfirmationDialog
        open={showEnviarRegulatorioDialog}
        onOpenChange={setShowEnviarRegulatorioDialog}
        title="Enviar para análise do regulatório"
        description="Tem certeza que deseja enviar esta obrigação para análise do regulatório?"
        confirmText="Sim, enviar"
        cancelText="Cancelar"
        onConfirm={confirmarEnviarParaAnalise}
        variant="default"
      />

      <ConfirmationDialog
        open={showAprovarConferenciaDialog}
        onOpenChange={setShowAprovarConferenciaDialog}
        title="Aprovar conferência"
        description="Tem certeza que deseja aprovar a conferência dessa obrigação?"
        confirmText="Sim, aprovar"
        cancelText="Não"
        onConfirm={confirmarAprovarConferencia}
        variant="default"
      />
    </div>
  );
}