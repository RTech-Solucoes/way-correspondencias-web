'use client';

import { useCallback, useMemo, useState, ChangeEvent, FormEvent, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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

interface AnexoFromBackend {
  idAnexo: number;
  idObjeto: number;
  nmArquivo: string;
  dsCaminho: string;
  tpObjeto: string; // 'A' | 'G' | 'S'
}

type DetalhesSolicitacaoModalProps = {
  open: boolean;
  onClose: () => void;
  solicitacao: SolicitacaoResponse | null;
  anexos?: AnexoFromBackend[];
  onBaixarAnexo?: (anexo: AnexoFromBackend) => Promise<void> | void;
  onHistoricoRespostas?: () => void;
  onAbrirEmailOriginal?: () => void;
  onEnviarDevolutiva?: (mensagem: string, arquivos: File[]) => Promise<void> | void;
  statusLabel?: string;
};

const formatDateTime = (iso?: string | null) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString() + ' às ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const MAX_DESC_LINES = 6;

export default function DetalhesSolicitacaoModal({
  open,
  onClose,
  solicitacao,
  anexos = [],
  onBaixarAnexo,
  onHistoricoRespostas,
  onAbrirEmailOriginal,
  onEnviarDevolutiva,
  statusLabel = 'Status',
}: DetalhesSolicitacaoModalProps) {
  const [resposta, setResposta] = useState('');
  const [arquivos, setArquivos] = useState<File[]>([]);
  const [expandDescricao, setExpandDescricao] = useState(false);
  const [expandAssunto, setExpandAssunto] = useState(false);
  const [sending, setSending] = useState(false);

  const descRef = useRef<HTMLParagraphElement | null>(null);
  const [canToggleDescricao, setCanToggleDescricao] = useState(false);
  const [lineHeightPx, setLineHeightPx] = useState<number | null>(null);

  const identificador = useMemo(
    () => (solicitacao?.idSolicitacao ? `#${solicitacao.idSolicitacao}` : ''),
    [solicitacao?.cdIdentificacao]
  );

  statusLabel = solicitacao?.statusSolicitacao?.nmStatus ?? statusLabel;
  const criadorLine = useMemo(() => {
    const who = solicitacao?.nmUsuarioCriacao ?? '—';
    const when = formatDateTime((solicitacao as any)?.dtCriacao);
    return `Criado por ${who} em: ${when}`;
  }, [solicitacao?.nmUsuarioCriacao, solicitacao?.dtCriacao]);

  const prazoLine = useMemo(() => formatDateTime((solicitacao as any)?.dtPrazo), [solicitacao?.dtPrazo]);

  const assunto = solicitacao?.dsAssunto ?? '';
  const descricao = solicitacao?.dsSolicitacao ?? '';
  const areaLabel =
    solicitacao?.area?.nmArea ??
    solicitacao?.areas?.[0]?.nmArea ??
    (Array.isArray(solicitacao?.areas) && solicitacao!.areas!.length > 0 ? solicitacao!.areas!.map(a => a.nmArea).join(', ') : '—');

  const temaLabel = solicitacao?.tema?.nmTema ?? (solicitacao as any)?.nmTema ?? '—';

  const anexosToShow: AnexoFromBackend[] =
    (Array.isArray(anexos) && anexos.length > 0)
      ? anexos
      : ((solicitacao as any)?.anexos ?? []);

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

  const descricaoCollapsedStyle: React.CSSProperties = !expandDescricao && lineHeightPx
    ? { maxHeight: `${lineHeightPx * MAX_DESC_LINES}px`, overflow: 'hidden' }
    : {};

  return (
    <Dialog open={open} onOpenChange={onClose}>
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
            <div className="rounded-md border bg-muted/30 p-4">
              <p className={`text-sm ${expandAssunto ? '' : 'line-clamp-2'}`}>
                {assunto || '—'}
              </p>
              {assunto && assunto.length > 0 && (
                <button
                  type="button"
                  className="mt-2 text-sm font-medium text-primary hover:underline"
                  onClick={() => setExpandAssunto((v) => !v)}
                >
                  {expandAssunto ? 'Ver menos' : 'Ver mais'}
                </button>
              )}
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold">Metadados</h3>
            <div className="rounded-md border bg-muted/30">
              <div className="grid grid-cols-12 gap-0">
                <div className="col-span-3 px-4 py-3 text-xs text-muted-foreground">Área:</div>
                <div className="col-span-9 px-4 py-3 text-sm">
                  {areaLabel}
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
              {/* se quiser reabilitar o link do e-mail original, descomente:
              <button
                type="button"
                className="text-sm text-primary hover:underline"
                onClick={onAbrirEmailOriginal}
              >
                Ver e-mail original
              </button> */}
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
                      onBaixar={onBaixarAnexo}
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
                      onBaixar={onBaixarAnexo}
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
                      onBaixar={onBaixarAnexo}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Enviar devolutiva ao Regulatório</h3>
              {/* <button
                type="button"
                className="text-sm text-primary hover:underline"
                onClick={onHistoricoRespostas}
              >
                Histórico de respostas
              </button> */}
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
  anexos: AnexoFromBackend[];
  onBaixar?: (a: AnexoFromBackend) => void | Promise<void>;
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
