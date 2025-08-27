'use client';

import { useCallback, useEffect, useMemo, useState, ChangeEvent, FormEvent } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  ClockIcon,
  DownloadIcon,
  PaperclipIcon,
} from '@phosphor-icons/react';
import { SolicitacaoResponse } from '@/api/solicitacoes/types';
import { statusSolicitacaoClient, StatusSolicitacaoResponse } from '@/api/status-solicitacao/client';
import { solicitacoesClient } from '@/api/solicitacoes/client';

interface AnexoFromBackend {
  idAnexo: number;
  idObjeto: number;
  nmArquivo: string;
  dsCaminho: string;
  tpObjeto: string;
}

type DetalhesSolicitacaoModalProps = {
  open: boolean;
  onCloseAction: () => void;
  solicitacao: SolicitacaoResponse | null;
  anexos?: AnexoFromBackend[];
  onBaixarAnexoAction?: (anexo: AnexoFromBackend) => Promise<void> | void;
  onHistoricoRespostasAction?: () => void;
  onAbrirEmailOriginalAction?: () => void;
  onEnviarDevolutivaAction?: (mensagem: string, arquivos: File[]) => Promise<void> | void;
  statusLabel?: string;
  onSuccessAction?: () => void;
};

const formatDateTime = (iso?: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString() + ' às ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default function DetalhesSolicitacaoModal({
  open,
  onCloseAction,
  solicitacao,
  anexos = [],
  onBaixarAnexoAction,
  onHistoricoRespostasAction,
  onAbrirEmailOriginalAction,
  onEnviarDevolutivaAction,
  statusLabel = 'Status',
  onSuccessAction,
}: DetalhesSolicitacaoModalProps) {
  const [resposta, setResposta] = useState('');
  const [arquivos, setArquivos] = useState<File[]>([]);
  const [expandDescricao, setExpandDescricao] = useState(false);
  const [encaminhando, setEncaminhando] = useState(false);
  const [statusList, setStatusList] = useState<StatusSolicitacaoResponse[]>([]);

  // Carregar lista de status quando o modal abrir
  useEffect(() => {
    if (open) {
      const loadStatus = async () => {
        try {
          const status = await statusSolicitacaoClient.listarTodos();
          setStatusList(status);
        } catch (error) {
          console.error('Erro ao carregar status:', error);
        }
      };
      loadStatus();
    }
  }, [open]);

  // Função para encaminhar a solicitação para etapa 5
  const handleEncaminharSolicitacao = useCallback(async () => {
    if (!solicitacao?.idSolicitacao) return;

    try {
      setEncaminhando(true);
      await solicitacoesClient.etapaStatus(solicitacao.idSolicitacao);
      toast.success('Solicitação encaminhada com sucesso!');
      onCloseAction();
      onSuccessAction?.();
    } catch (error) {
      console.error('Erro ao encaminhar solicitação:', error);
      toast.error('Erro ao encaminhar solicitação');
    } finally {
      setEncaminhando(false);
    }
  }, [solicitacao?.idSolicitacao, onCloseAction, onSuccessAction]);

  const identificador = useMemo(
    () => (solicitacao?.cdIdentificacao ? `#${solicitacao.cdIdentificacao}` : ''),
    [solicitacao?.cdIdentificacao]
  );

  const criadorLine = useMemo(() => {
    const who = solicitacao?.nmUsuarioCriacao ?? '—';
    const when = solicitacao?.dtCriacao ? formatDateTime(solicitacao.dtCriacao) : '—';
    return `Criado por ${who} em: ${when}`;
  }, [solicitacao?.nmUsuarioCriacao, solicitacao?.dtCriacao]);

  const prazoLine = useMemo(() => {
    const prazo = solicitacao?.dtPrazo ? formatDateTime(solicitacao.dtPrazo) : undefined;
    return prazo ?? '—';
  }, [solicitacao?.dtPrazo]);

  const descricao = solicitacao?.dsSolicitacao || '';

  const handleUploadChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setArquivos((prev) => [...prev, ...Array.from(files)]);
  }, []);

  const handleEnviar = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!onEnviarDevolutivaAction) return;
      if (!resposta.trim() && arquivos.length === 0) {
        toast.error('Escreva uma devolutiva ou anexe um arquivo.');
        return;
      }
      try {
        await onEnviarDevolutivaAction(resposta.trim(), arquivos);
        toast.success('Resposta enviada com sucesso!');
        setResposta('');
        setArquivos([]);
        onCloseAction();
        onSuccessAction?.(); // Chama o callback de sucesso, se fornecido
      } catch {
        toast.error('Não foi possível enviar a resposta.');
      }
    },
    [onEnviarDevolutivaAction, resposta, arquivos, onCloseAction, onSuccessAction]
  );

  return (
    <Dialog open={open} onOpenChange={onCloseAction}>
      <DialogContent className="max-w-3xl md:max-w-4xl lg:max-w-5xl p-0 flex flex-col max-h-[85vh]">
        <div className="px-6 pt-6">
          <DialogHeader className="p-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <DialogTitle className="text-[20px] font-semibold">
                  Solicitação {identificador || ''}
                </DialogTitle>
                <div className="mt-1 text-sm text-muted-foreground">{criadorLine}</div>

                <div className="mt-3 flex items-center gap-2 text-sm">
                  <ClockIcon className="h-4 w-4" />
                  <span className="text-muted-foreground">Prazo para resposta:</span>
                  <span className="font-medium">{prazoLine}</span>
                </div>
              </div>

              <span
                className="shrink-0 rounded-full bg-orange-100 text-orange-700 text-xs font-medium px-3 py-1.5"
                title="Status atual"
              >
                {statusLabel}
              </span>
            </div>
          </DialogHeader>
        </div>

        <form id="detalhes-form" onSubmit={handleEnviar} className="px-6 pb-6 space-y-8 overflow-y-auto flex-1">
          <section className="space-y-2">
            <h3 className="text-sm font-semibold">Assunto</h3>

            <div className="rounded-md border bg-muted/30">
              <div className="grid grid-cols-12 gap-0">
                <div className="col-span-2 px-4 py-3 text-xs text-muted-foreground">Área:</div>
                <div className="col-span-10 px-4 py-3 text-sm">
                  {solicitacao?.area?.nmArea ?? solicitacao?.areas?.[0]?.nmArea ?? '—'}
                </div>
              </div>
              <div className="h-px bg-border" />
              <div className="grid grid-cols-12 gap-0">
                <div className="col-span-2 px-4 py-3 text-xs text-muted-foreground">Tema:</div>
                <div className="col-span-10 px-4 py-3 text-sm">
                  {solicitacao?.tema?.nmTema ?? solicitacao?.nmTema ?? '—'}
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <div className="rounded-md border bg-muted/30">
              <div className="grid grid-cols-12">
                <div className="col-span-2 px-4 py-3 text-xs text-muted-foreground">Nº do ofício:</div>
                <div className="col-span-10 px-4 py-3 text-sm">
                  {solicitacao?.nrOficio || '—'}
                </div>
              </div>
              <div className="h-px bg-border" />
              <div className="grid grid-cols-12">
                <div className="col-span-2 px-4 py-3 text-xs text-muted-foreground">Nº do processo:</div>
                <div className="col-span-10 px-4 py-3 text-sm">
                  {solicitacao?.nrProcesso || '—'}
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Descrição</h3>
              <button
                type="button"
                className="text-sm text-primary hover:underline"
                onClick={onAbrirEmailOriginalAction}
              >
                Ver e-mail original
              </button>
            </div>

            <div className="rounded-md border bg-muted/30 p-4">
              <p
                className={`text-sm text-muted-foreground ${expandDescricao ? '' : 'line-clamp-4'}`}
              >
                {descricao || '—'}
              </p>
              {descricao && descricao.length > 0 && (
                <button
                  type="button"
                  className="mt-2 text-sm font-medium text-primary hover:underline"
                  onClick={() => setExpandDescricao((v) => !v)}
                >
                  {expandDescricao ? 'Ver menos' : 'Ver mais'}
                </button>
              )}
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold">Anexos</h3>

            <div className="space-y-2">
              <div className="rounded-md border">
                <div className="grid grid-cols-12 items-center">
                  <div className="col-span-3 px-4 py-3 text-sm text-muted-foreground">
                    Anexado pelo Analista
                  </div>
                  <div className="col-span-9 px-4 py-3">
                    <AnexoItem anexos={anexos.filter((a) => a.tpObjeto === 'A')} onBaixar={onBaixarAnexoAction} />
                  </div>
                </div>
              </div>

              <div className="rounded-md border">
                <div className="grid grid-cols-12 items-center">
                  <div className="col-span-3 px-4 py-3 text-sm text-muted-foreground">
                    Anexado pelo Gerente
                  </div>
                  <div className="col-span-9 px-4 py-3">
                    <AnexoItem anexos={anexos.filter((a) => a.tpObjeto === 'G')} onBaixar={onBaixarAnexoAction} />
                  </div>
                </div>
              </div>

              <div className="rounded-md border">
                <div className="grid grid-cols-12 items-center">
                  <div className="col-span-3 px-4 py-3 text-sm text-muted-foreground">
                    Enviado pelo Regulatório
                  </div>
                  <div className="col-span-9 px-4 py-3">
                    <AnexoItem anexos={anexos.filter((a) => a.tpObjeto === 'S')} onBaixar={onBaixarAnexoAction} />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Enviar devolutiva ao Regulatório</h3>
              <button
                type="button"
                className="text-sm text-primary hover:underline"
                onClick={onHistoricoRespostasAction}
              >
                Histórico de respostas
              </button>
            </div>

            <div className="rounded-md border bg-muted/30 p-4">
              <Label htmlFor="resposta" className="sr-only">
                Escreva aqui…
              </Label>
              <Textarea
                id="resposta"
                placeholder="Escreva aqui..."
                value={resposta}
                onChange={(e) => setResposta(e.target.value)}
                rows={5}
              />

              <div className="mt-3 flex items-center gap-3">
                <label className="inline-flex items-center gap-2 text-sm text-primary hover:underline cursor-pointer">
                  <PaperclipIcon className="h-4 w-4" />
                  Fazer upload de arquivo
                  <input type="file" className="hidden" multiple onChange={handleUploadChange} />
                </label>

                {arquivos.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {arquivos.length} arquivo(s) selecionado(s)
                  </span>
                )}
              </div>
            </div>
          </section>

          {/* Nova seção: Step 5 - Informações Completas e Encaminhamento */}
          <section className="space-y-4 border-t pt-6">
            <h3 className="text-lg font-semibold">Step 5 - Informações Completas</h3>

            {/* Mostrar todas as áreas */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Todas as Áreas</h4>
              <div className="rounded-md border bg-muted/30 p-4">
                {solicitacao?.areas && solicitacao.areas.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {solicitacao.areas.map((area) => (
                      <span
                        key={area.idArea}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {area.nmArea}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">Nenhuma área associada</span>
                )}
              </div>
            </div>

            {/* Informações do Tema */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Tema Detalhado</h4>
              <div className="rounded-md border bg-muted/30 p-4">
                <div className="grid grid-cols-12 gap-0">
                  <div className="col-span-3 text-xs text-muted-foreground">Nome do Tema:</div>
                  <div className="col-span-9 text-sm font-medium">
                    {solicitacao?.tema?.nmTema ?? solicitacao?.nmTema ?? '—'}
                  </div>
                </div>
              </div>
            </div>

            {/* Resumo de Anexos */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Resumo de Anexos</h4>
              <div className="rounded-md border bg-muted/30 p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="space-y-1">
                    <div className="text-lg font-semibold text-blue-600">
                      {anexos.filter((a) => a.tpObjeto === 'A').length}
                    </div>
                    <div className="text-xs text-muted-foreground">Analista</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-lg font-semibold text-green-600">
                      {anexos.filter((a) => a.tpObjeto === 'G').length}
                    </div>
                    <div className="text-xs text-muted-foreground">Gerente</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-lg font-semibold text-purple-600">
                      {anexos.filter((a) => a.tpObjeto === 'S').length}
                    </div>
                    <div className="text-xs text-muted-foreground">Regulatório</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Disponíveis */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Status Disponíveis</h4>
              <div className="rounded-md border bg-muted/30 p-4">
                {statusList.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {statusList.map((status) => (
                      <span
                        key={status.id}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                      >
                        {status.nome}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">Nenhum status disponível</span>
                )}
              </div>
            </div>

            {/* Ações Disponíveis */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Ações Disponíveis</h4>
              <div className="rounded-md border bg-muted/30 p-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="default"
                    onClick={onCloseAction}
                    className="w-full justify-center"
                  >
                    Fechar
                  </Button>
                  <Button
                    variant="default"
                    onClick={handleEncaminharSolicitacao}
                    className="w-full justify-center"
                    disabled={encaminhando}
                  >
                    {encaminhando ? 'Encaminhando...' : 'Encaminhar para análise'}
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AnexoItem({
  anexos,
  onBaixar,
}: {
  anexos: AnexoFromBackend[];
  onBaixar?: (anexo: AnexoFromBackend) => Promise<void> | void;
}) {
  if (anexos.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {anexos.map((anexo) => (
        <div
          key={anexo.idAnexo}
          className="flex items-center justify-between rounded-md border bg-muted/30 p-3"
        >
          <div className="flex items-center gap-3">
            <DownloadIcon className="h-5 w-5 text-muted-foreground" />
            <div className="flex flex-col">
              <span className="text-sm font-medium">{anexo.nmArquivo}</span>
              <span className="text-xs text-muted-foreground">
                {anexo.dsCaminho}
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => onBaixar?.(anexo)}
            className="text-sm font-medium text-primary"
          >
            Baixar
          </Button>
        </div>
      ))}
    </div>
  );
}
