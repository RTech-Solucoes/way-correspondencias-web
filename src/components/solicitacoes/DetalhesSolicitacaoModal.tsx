'use client';

import { useCallback, useMemo, useState, ChangeEvent, FormEvent, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Clock as ClockIcon,
  DownloadSimple as DownloadIcon,
  Paperclip as PaperclipIcon,
} from '@phosphor-icons/react';
import { SolicitacaoResponse } from '@/api/solicitacoes/types';
import { AnexoResponse, ArquivoDTO, TipoObjetoAnexo } from '@/api/anexos/type';
import { anexosClient } from '@/api/anexos/client';
import { base64ToUint8Array, saveBlob } from '@/utils/utils';
import { X } from 'lucide-react';

type DetalhesSolicitacaoModalProps = {
  open: boolean;
  onClose: () => void;
  solicitacao: SolicitacaoResponse | null;
  anexos?: AnexoResponse[];
  onHistoricoRespostas?: () => void;
  onAbrirEmailOriginal?: () => void;
  onEnviarDevolutiva?: (mensagem: string, arquivos: File[]) => Promise<void> | void;
  statusLabel?: string;
};

const formatDateTime = (iso?: string | null) => {
  if (!iso) return '—';
  const d = new Date(iso);

  const date = d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const time = d.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return `${date} às ${time}`;
};

const MAX_DESC_LINES = 6;

export default function DetalhesSolicitacaoModal({
  open,
  onClose,
  solicitacao,
  anexos = [],
  onHistoricoRespostas,
  onAbrirEmailOriginal,
  onEnviarDevolutiva,
  statusLabel = 'Status',
}: DetalhesSolicitacaoModalProps) {
  const [resposta, setResposta] = useState('');
  const [arquivos, setArquivos] = useState<File[]>([]);
  const [expandDescricao, setExpandDescricao] = useState(false);
  const [sending, setSending] = useState(false);

  const descRef = useRef<HTMLParagraphElement | null>(null);
  const [canToggleDescricao, setCanToggleDescricao] = useState(false);
  const [lineHeightPx, setLineHeightPx] = useState<number | null>(null);

  const identificador = useMemo(
    () => (solicitacao?.cdIdentificacao ? `#${solicitacao.cdIdentificacao}` : ''),
    [solicitacao?.cdIdentificacao]
  );

  statusLabel = solicitacao?.statusSolicitacao?.nmStatus ?? statusLabel;

  const criadorLine = useMemo(() => {
    const when = formatDateTime((solicitacao as SolicitacaoResponse)?.dtCriacao);
    return `Criado em: ${when}`;
  }, [solicitacao?.dtCriacao]);

  const prazoLine = useMemo(
    () => formatDateTime((solicitacao as SolicitacaoResponse)?.dtPrazo),
    [solicitacao?.dtPrazo]
  );

  const assunto = solicitacao?.dsAssunto ?? '';
  const descricao = solicitacao?.dsSolicitacao ?? '';
  const areas = Array.isArray(solicitacao?.tema?.areas)
    ? (solicitacao!.tema!.areas! as Array<{ nmArea: string; idArea?: number; cdArea?: string }>)
    : [];

  const temaLabel =
    solicitacao?.tema?.nmTema ?? (solicitacao as SolicitacaoResponse)?.nmTema ?? '—';

  const anexosToShow: AnexoResponse[] =
    Array.isArray(anexos) && anexos.length > 0 ? anexos : [];

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

  useEffect(() => {
    measureDescricao();
  }, [open, descricao, measureDescricao]);

  useEffect(() => {
    const el = descRef.current;
    if (!el) return;

    const ro = new ResizeObserver(() => {
      measureDescricao();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [measureDescricao]);

  const handleUploadChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setArquivos((prev) => [...prev, ...Array.from(files)]);
  }, []);

  const handleEnviar = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!onEnviarDevolutiva) return;
      if (!resposta.trim() && arquivos.length === 0) {
        toast.error('Escreva uma devolutiva ou anexe um arquivo.');
        return;
      }
      try {
        setSending(true);
        await onEnviarDevolutiva(resposta.trim(), arquivos);
        toast.success('Resposta enviada com sucesso!');
        setResposta('');
        setArquivos([]);
        onClose();
      } catch {
        toast.error('Não foi possível enviar a resposta.');
      } finally {
        setSending(false);
      }
    },
    [onEnviarDevolutiva, resposta, arquivos, onClose]
  );

  const handleBaixarAnexo = useCallback(
    async (anexo: AnexoResponse) => {
      try {
        if (!solicitacao?.idSolicitacao) {
          toast.error('ID da solicitação não encontrado.');
          return;
        }

        const arquivos = await anexosClient.download(
          solicitacao.idSolicitacao,
          TipoObjetoAnexo.S,
          anexo.nmArquivo
        );

        if (!arquivos || arquivos.length === 0) {
          toast.error('Nenhum arquivo retornado.');
          return;
        }

        arquivos.forEach((arq: ArquivoDTO) => {
          const bytes = base64ToUint8Array(arq.conteudoArquivo);
          const name = arq.nomeArquivo || anexo.nmArquivo || 'arquivo';
          const mime = arq.tipoConteudo || 'application/octet-stream';
          saveBlob(bytes, mime, name);
        });

        toast.success('Download iniciado.');
      } catch (e) {
        console.error(e);
        toast.error('Não foi possível baixar o anexo.');
      }
    },
    [solicitacao?.idSolicitacao]
  );

  const descricaoCollapsedStyle: React.CSSProperties =
    !expandDescricao && lineHeightPx
      ? { maxHeight: `${lineHeightPx * MAX_DESC_LINES}px`, overflow: 'hidden' }
      : {};

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl md:max-w-4xl lg:max-w-5xl p-0 flex flex-col max-h-[85vh] [&>button.absolute.right-4.top-4]:hidden">
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

              <DialogClose asChild>
                <button
                  type="button"
                  className="flex items-center justify-center rounded-full bg-slate-800 text-white hover:bg-slate-700 transition-colors h-9 w-9"
                  aria-label="Fechar"
                >
                  <X className="h-4 w-4" />
                </button>
              </DialogClose>
            </div>
          </DialogHeader>
        </div>

        <form
          id="detalhes-form"
          onSubmit={handleEnviar}
          className="px-6 pb-6 space-y-8 overflow-y-auto flex-1"
        >
          <section className="space-y-2">
            <h3 className="text-sm font-semibold">Assunto</h3>
            <div className="rounded-md border bg-muted/30 p-4">
              <p className="text-sm whitespace-pre-wrap break-words">
                {assunto || '—'}
              </p>
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold">Metadados</h3>
            <div className="rounded-md border bg-muted/30">
              <div className="grid grid-cols-12 gap-0">
                <div className="col-span-3 px-4 py-3 text-xs text-muted-foreground">Áreas:</div>
                <div className="col-span-9 px-4 py-3 text-sm">
                  {areas.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {areas.map((a, idx) => (
                        <Pill
                          key={a.idArea ?? a.cdArea ?? `${a.nmArea}-${idx}`}
                          title={a.nmArea}
                        >
                          {a.nmArea}
                        </Pill>
                      ))}
                    </div>
                  ) : (
                    '—'
                  )}
                </div>
              </div>
              <div className="h-px bg-border" />
              <div className="grid grid-cols-12 gap-0">
                <div className="col-span-3 px-4 py-3 text-xs text-muted-foreground">Tema:</div>
                <div className="col-span-9 px-4 py-3 text-sm">
                  {temaLabel}
                </div>
              </div>
              <div className="h-px bg-border" />
              <div className="grid grid-cols-12">
                <div className="col-span-3 px-4 py-3 text-xs text-muted-foreground">Nº do ofício:</div>
                <div className="col-span-9 px-4 py-3 text-sm">
                  {solicitacao?.nrOficio || '—'}
                </div>
              </div>
              <div className="h-px bg-border" />
              <div className="grid grid-cols-12">
                <div className="col-span-3 px-4 py-3 text-xs text-muted-foreground">Nº do processo:</div>
                <div className="col-span-9 px-4 py-3 text-sm">
                  {solicitacao?.nrProcesso || '—'}
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Descrição</h3>
            </div>

            <div className="rounded-md border bg-muted/30 p-4">
              <p
                ref={descRef}
                className="text-sm text-muted-foreground"
                style={descricaoCollapsedStyle}
              >
                {descricao || '—'}
              </p>

              {descricao && descricao.length > 0 && canToggleDescricao && (
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
                    <AnexoItem
                      anexos={anexosToShow.filter((a) => a.tpObjeto === 'A')}
                      onBaixar={handleBaixarAnexo}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-md border">
                <div className="grid grid-cols-12 items-center">
                  <div className="col-span-3 px-4 py-3 text-sm text-muted-foreground">
                    Anexado pelo Gerente
                  </div>
                  <div className="col-span-9 px-4 py-3">
                    <AnexoItem
                      anexos={anexosToShow.filter((a) => a.tpObjeto === 'G')}
                      onBaixar={handleBaixarAnexo}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-md border">
                <div className="grid grid-cols-12 items-center">
                  <div className="col-span-3 px-4 py-3 text-sm text-muted-foreground">
                    Enviado pelo Regulatório
                  </div>
                  <div className="col-span-9 px-4 py-3">
                    <AnexoItem
                      anexos={anexosToShow.filter((a) => a.tpObjeto === 'S')}
                      onBaixar={handleBaixarAnexo}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Enviar devolutiva ao Regulatório</h3>
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
        </form>

        <DialogFooter className="flex gap-3 px-6 pb-6">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="detalhes-form" disabled={sending}>
            {sending ? 'Enviando...' : 'Enviar resposta'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AnexoItem({
  anexos,
  onBaixar,
}: {
  anexos: AnexoResponse[];
  onBaixar?: (a: AnexoResponse) => void | Promise<void>;
}) {
  if (!anexos || anexos.length === 0) {
    return <span className="text-sm text-muted-foreground">Nenhum documento</span>;
  }
  return (
    <ul className="flex flex-col gap-2">
      {anexos.map((a) => (
        <li
          key={`${a.idAnexo}-${a.nmArquivo}`}
          className="flex items-center justify-between rounded-md border bg-white px-3 py-2"
        >
          <span className="truncate text-sm">{a.nmArquivo}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onBaixar?.(a)}
            title="Baixar"
          >
            <DownloadIcon className="h-4 w-4" />
          </Button>
        </li>
      ))}
    </ul>
  );
}

function Pill({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <span
      title={title}
      className="inline-flex min-w-0 items-center rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-xs font-medium text-foreground/90"
      style={{ backgroundColor: 'rgba(147, 197, 253, 0.3)' }}
    >
      <span className="truncate max-w-[160px]">{children}</span>
    </span>
  );
}
