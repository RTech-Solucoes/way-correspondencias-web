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
import { AnexoResponse, TipoObjetoAnexo, ArquivoDTO } from '@/api/anexos/type';
import anexosClient from '@/api/anexos/client';
import { StatusObrigacao, statusObrigacaoLabels } from '@/api/status-obrigacao/types';
import { TipoEnum } from '@/api/tipos/types';
import { getObrigacaoStatusStyle } from '@/utils/obrigacoes/status';
import { ConferenciaStepDados } from '@/components/obrigacoes/conferencia/ConferenciaStepDados';
import { ConferenciaStepAreasETemas } from '@/components/obrigacoes/conferencia/ConferenciaStepAreasETemas';
import { ConferenciaStepPrazos } from '@/components/obrigacoes/conferencia/ConferenciaStepPrazos';
import { ConferenciaStepAnexos } from '@/components/obrigacoes/conferencia/ConferenciaStepAnexos';
import { ConferenciaStepVinculos } from '@/components/obrigacoes/conferencia/ConferenciaStepVinculos';

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

  const [activeTab, setActiveTab] = useState<TabKey>('dados');
  const [detalhe, setDetalhe] = useState<ObrigacaoDetalheResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<number | null>(null);

  useEffect(() => {
    const carregarDetalhe = async () => {
      const parsedId = Number(id);
      if (!id || Number.isNaN(parsedId)) {
        toast.error('Identificador da obrigação inválido.');
        router.push('/obrigacao');
        return;
      }

      try {
        setLoading(true);
        const response = await obrigacaoClient.buscarDetalhePorId(parsedId);
        setDetalhe(response);
      } catch (error) {
        console.error('Erro ao carregar a obrigação:', error);
        toast.error('Não foi possível carregar a obrigação.');
        router.push('/obrigacao');
      } finally {
        setLoading(false);
      }
    };

    carregarDetalhe();
  }, [id, router]);

  const obrigacao = detalhe?.obrigacao;
  const anexos = useMemo(() => detalhe?.anexos ?? [], [detalhe]);

  const areaAtribuida = useMemo(() => {
    return obrigacao?.areas?.find((area) => area.tipoArea?.cdTipo === TipoEnum.ATRIBUIDA);
  }, [obrigacao?.areas]);

  const areasCondicionantes = useMemo(() => {
    return obrigacao?.areas?.filter((area) => area.tipoArea?.cdTipo === TipoEnum.CONDICIONANTE) ?? [];
  }, [obrigacao?.areas]);

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
        
        const arquivos = await anexosClient.download(idObjeto, TipoObjetoAnexo.O, anexo.nmArquivo);
        
        // Garantir que arquivos seja sempre um array
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
      <main className="flex flex-1 flex-col gap-6 px-8 py-6 pb-32">
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

        <div className="flex flex-1 gap-6">
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
          { /* Add sidebar da direita - Registros (Anexos, Comentários) */}
        </div>
      </main>
      <footer className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white px-8 py-4">
        <div className="ml-auto flex w-full max-w-6xl flex-wrap items-center justify-end gap-3">
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
            className="flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-600"
            onClick={() => toast.info('Solicitação de ajustes disponível em breve.')}
          >
            <MessageSquare className="h-4 w-4" />
            Solicitar ajustes
          </Button>
          <Button
            type="button"
            className="flex items-center gap-2 rounded-full bg-blue-500 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-600"
            onClick={() => toast.success('Conferência aprovada!')}
          >
            <CheckCircle2 className="h-4 w-4" />
            Aprovar conferência
          </Button>
        </div>
      </footer>
    </div>
  );
}


