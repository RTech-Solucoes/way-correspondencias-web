'use client';

import {useCallback, useMemo, useState, ChangeEvent, FormEvent, useEffect, useRef, CSSProperties} from 'react';
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
import { ClockIcon, DownloadIcon, PaperclipIcon, X as XIcon } from '@phosphor-icons/react';
import { SolicitacaoDetalheResponse } from '@/api/solicitacoes/types';
import type { AnexoResponse } from '@/api/anexos/type';
import { ArquivoDTO, TipoObjetoAnexo, TipoResponsavelAnexo } from '@/api/anexos/type';
import { anexosClient } from '@/api/anexos/client';
import { base64ToUint8Array, fileToArquivoDTO, hasPermissao, normalizeText, saveBlob } from '@/utils/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { usePermissoes } from '@/context/permissoes/PermissoesContext';
import { HistoricoRespostasModalButton } from './HistoricoRespostasModal';
// import tramitacoesClient from '@/api/tramitacoes/client';
import authClient from '@/api/auth/client';
import { responsaveisClient } from '@/api/responsaveis/client';


type AnexoItemShape = {
  idAnexo: number;
  idObjeto: number;
  nmArquivo: string;
  tpObjeto: TipoObjetoAnexo;
  tpResponsavel?: TipoResponsavelAnexo;
};

type DetalhesSolicitacaoModalProps = {
  open: boolean;
  onClose(): void;
  solicitacao: SolicitacaoDetalheResponse | null;
  anexos?: AnexoResponse[];
  onHistoricoRespostas?(): void;
  onAbrirEmailOriginal?(): void;
  onEnviarDevolutiva?(mensagem: string, arquivos: ArquivoDTO[], flAprovado?: 'S' | 'N'): Promise<void> | void;
  statusLabel?: string;
};

const formatDateTime = (iso?: string | null) => {
  if (!iso) return '—';
  const d = new Date(iso);
  const date = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false });
  return `${date} às ${time}`;
};

const MAX_DESC_LINES = 6;

/** Apenas para DESCRIÇÃO: remove \r e transforma \n em <br/> */
function renderDescricaoWithBreaks(text?: string | null) {
  if (!text) return '—';
  const cleaned = text.replace(/\r/g, '');
  const parts = cleaned.split('\n');
  return parts.map((line, i) => (
    <span key={i}>
      {line}
      {i < parts.length - 1 && <br />}
    </span>
  ));
}

export default function DetalhesSolicitacaoModal({
  open,
  onClose,
  solicitacao,
  anexos = [],
  onEnviarDevolutiva,
  statusLabel = 'Status',
}: DetalhesSolicitacaoModalProps) {
  const [resposta, setResposta] = useState('');
  const [arquivos, setArquivos] = useState<File[]>([]);
  const [expandDescricao, setExpandDescricao] = useState(false);
  const [sending, setSending] = useState(false);
  const [flAprovado, setFlAprovado] = useState<'S' | 'N' | ''>('');
  const [tpResponsavelUpload, setTpResponsavelUpload] = useState<TipoResponsavelAnexo>(TipoResponsavelAnexo.A);
  const [hasAreaInicial, setHasAreaInicial] = useState(false);

  const descRef = useRef<HTMLParagraphElement | null>(null);
  const [canToggleDescricao, setCanToggleDescricao] = useState(false);
  const [lineHeightPx, setLineHeightPx] = useState<number | null>(null);

  const { canListarAnexo, canInserirAnexo, canDeletarAnexo, canAprovarSolicitacao } = usePermissoes();

  const sol = solicitacao ?? null;

  const identificador = useMemo(
    () => (sol?.solicitacao?.cdIdentificacao ? `#${sol.solicitacao.cdIdentificacao}` : ''),
    [sol?.solicitacao?.cdIdentificacao]
  );

  const statusText = sol?.statusSolicitacao?.nmStatus ?? statusLabel;

  const criadorLine = useMemo(() => formatDateTime(sol?.dtCriacao), [sol?.dtCriacao]);
  const prazoLine = useMemo(() => {
    const prazoAtual = sol?.solcitacaoPrazos?.find(
      (p) => +(p?.idStatusSolicitacao) === (sol?.statusSolicitacao?.idStatusSolicitacao)
    );
    return formatDateTime(prazoAtual?.dtPrazoLimite);
  }, [sol?.statusSolicitacao?.idStatusSolicitacao, sol?.solcitacaoPrazos]);

  const assunto = sol?.solicitacao?.dsAssunto ?? '';
  const descricao = sol?.solicitacao?.dsSolicitacao ?? '';
  const observacao = sol?.solicitacao?.dsObservacao && sol?.solicitacao?.dsObservacao.trim().length > 0 ? sol?.solicitacao?.dsObservacao : null;
  const areas = Array.isArray(sol?.solicitacao?.area)
    ? (sol!.solicitacao!.area! as Array<{ nmArea: string; idArea?: number; cdArea?: string }>)
    : [];

  const temaLabel = sol?.solicitacao?.tema?.nmTema ?? sol?.solicitacao?.nmTema ?? '—';

  const anexosTramitacoes: AnexoResponse[] = (solicitacao?.tramitacoes ?? []).flatMap((t) => t?.anexos ?? []);
  const anexosSolic: AnexoResponse[] = solicitacao?.anexosSolicitacao ?? [];
  const anexosEmail: AnexoResponse[] = solicitacao?.email?.anexos ?? [];

  const mapToItem = (
    a: Partial<AnexoResponse> & { idAnexo: number; idObjeto: number; nmArquivo: string; tpObjeto?: string }
  ): AnexoItemShape => ({
    idAnexo: a.idAnexo,
    idObjeto: (a as AnexoResponse).idObjeto,
    nmArquivo: a.nmArquivo,
    tpObjeto: (((a as AnexoResponse).tpObjeto as unknown) as TipoObjetoAnexo) ?? TipoObjetoAnexo.S,
    tpResponsavel: (a as { tpResponsavel?: TipoResponsavelAnexo })?.tpResponsavel,
  });

  const anexosAnalista: AnexoItemShape[] = anexosTramitacoes
    .filter((a: AnexoResponse) => a.tpResponsavel === TipoResponsavelAnexo.A)
    .map(mapToItem);

  const anexosGerente: AnexoItemShape[] = anexosTramitacoes
    .filter((a: AnexoResponse) => a.tpResponsavel === TipoResponsavelAnexo.G)
    .map(mapToItem);

  const anexosDiretor: AnexoItemShape[] = anexosTramitacoes
    .filter((a: AnexoResponse) => a.tpResponsavel === TipoResponsavelAnexo.D)
    .map(mapToItem);

  const anexosRegulatorio: AnexoItemShape[] =
    anexos.length > 0
      ? anexos.map(mapToItem)
      : anexosTramitacoes.filter((a: AnexoResponse) => a.tpResponsavel === TipoResponsavelAnexo.R).map(mapToItem);

  const itensSolicitacao: AnexoItemShape[] = anexosSolic.map(mapToItem);
  const itensEmail: AnexoItemShape[] = anexosEmail.map(mapToItem);

  const isEmAprovacao =
    (
      (sol?.statusSolicitacao?.idStatusSolicitacao === 6) ||
      (sol?.statusSolicitacao?.nmStatus?.toLowerCase?.() === 'em aprovação') ||
      (statusText?.toLowerCase?.() === 'em aprovação')
    ) ||
    (
      (sol?.statusSolicitacao?.idStatusSolicitacao === 8) ||
      (sol?.statusSolicitacao?.nmStatus?.toLowerCase?.() === 'em assinatura diretores') ||
      (statusText?.toLowerCase?.() === 'em assinatura diretores')
    )
    
  const isPermissaoEnviandoDevolutiva = (isEmAprovacao && !hasPermissao('SOLICITACAO_APROVAR'));

  useEffect(() => {
    const checkResponsavelInicial = async () => {
      try {
        const userName = authClient.getUserName();
        if (!userName) {
          setTpResponsavelUpload(TipoResponsavelAnexo.A);
          setHasAreaInicial(false);
          return;
        }
        const resp = await responsaveisClient.buscarPorNmUsuarioLogin(userName);
        const perfilName = (resp?.nmPerfil || '').toLowerCase();

        const idAreaInicial = sol?.solicitacao?.idAreaInicial;
        const userAreaIds = (resp?.areas || [])
          .map((a: { area?: { idArea?: number | string; nmArea?: string } } | null | undefined) => a?.area?.idArea)
          .map((id) => +((id as unknown) as number))
          .filter((id) => !Number.isNaN(id));

        let isInSolicAreas = false;
        if (idAreaInicial) {
          const areaInicialNum = +idAreaInicial;
          isInSolicAreas = !Number.isNaN(areaInicialNum) && userAreaIds.includes(areaInicialNum);
        } else {
          const areasSolic = Array.isArray(sol?.solicitacao?.area)
            ? (sol!.solicitacao!.area as Array<{ idArea?: number; nmArea?: string }>)
            : [];
          const solicitacaoAreaIds = areasSolic
            .map(a => +((a?.idArea as unknown) as number))
            .filter((id) => !Number.isNaN(id));
          isInSolicAreas = userAreaIds.some(id => solicitacaoAreaIds.includes(id));
        }
        const tp = computeTpResponsavel(perfilName, isInSolicAreas);
        setTpResponsavelUpload(tp);
        setHasAreaInicial(isInSolicAreas);
      } catch {
        setTpResponsavelUpload(TipoResponsavelAnexo.A);
        setHasAreaInicial(false);
      }
    };

    if (open && sol?.solicitacao?.idSolicitacao) {
      checkResponsavelInicial();
    }
  }, [open, sol?.solicitacao?.idSolicitacao, sol?.solicitacao?.area, sol]);

  const isStatusPermitidoEnviar = useMemo(() => {
    const current = normalizeText(sol?.statusSolicitacao?.nmStatus ?? statusLabel);
    const allStatusPermitido = [
      'Análise regulatória',
      'Em assinatura Regulatório',
      'Em assinatura Diretores',
    ];
    const statusPermitido = allStatusPermitido.map((t) => normalizeText(t));
    return statusPermitido.includes(current);
  }, [sol?.statusSolicitacao?.nmStatus, statusLabel]);

  function computeTpResponsavel(perfilNameLower: string, isInitialArea: boolean): TipoResponsavelAnexo {
    const p = perfilNameLower.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

    if (
      p.includes('administrador') ||
      p.includes('gestor do sistema') ||
      p.includes('validador / assinante') || p.includes('validador')
    ) {
      return TipoResponsavelAnexo.D;
    }

    if (p.includes('executor avancado')) {
      return TipoResponsavelAnexo.G;
    }

    if (
      p === 'executor' || p.includes('executor restrito') ||
      p.includes('tecnico / suporte') || p.includes('tecnico') || p.includes('suporte')
    ) {
      return isInitialArea ? TipoResponsavelAnexo.R : TipoResponsavelAnexo.A;
    }

    return isInitialArea ? TipoResponsavelAnexo.R : TipoResponsavelAnexo.A;
  }

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
    const ro = new ResizeObserver(() => measureDescricao());
    ro.observe(el);
    return () => ro.disconnect();
  }, [measureDescricao]);

  const handleUploadChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setArquivos((prev) => [...prev, ...Array.from(files)]);
    e.currentTarget.value = '';
  }, []);

  const handleRemoveArquivo = useCallback((index: number) => {
    setArquivos((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleEnviar = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!onEnviarDevolutiva) return;

      if (!resposta.trim() && arquivos.length === 0) {
        toast.error('Escreva uma devolutiva ou anexe um arquivo.');
        return;
      }

      if (isEmAprovacao && !flAprovado) {
        toast.error('Selecione se a devolutiva está aprovada (Sim/Não).');
        return;
      }

      if (!sol?.solicitacao?.idSolicitacao) {
        toast.error('ID da solicitação não encontrado.');
        return;
      }

      try {
        setSending(true);

        const arquivosDTO: ArquivoDTO[] = arquivos.length > 0
          ? await Promise.all(
              arquivos.map((file) => fileToArquivoDTO(file, tpResponsavelUpload))
            )
          : [];

        await onEnviarDevolutiva(resposta.trim(), arquivosDTO, flAprovado || undefined);

        toast.success('Resposta enviada com sucesso!');
        setResposta('');
        setArquivos([]);
        onClose();
      } catch (err) {
        console.error(err);
        const msg = err instanceof Error && err.message ? err.message : 'Não foi possível enviar a resposta.';
        toast.error(msg);
      } finally {
        setSending(false);
      }
    },
    [onEnviarDevolutiva, resposta, arquivos, sol?.solicitacao?.idSolicitacao, onClose, flAprovado, isEmAprovacao, tpResponsavelUpload]
  );

  const handleBaixarAnexo = useCallback(
    async (anexo: AnexoItemShape) => {
      try {
        if (!anexo?.idObjeto || !anexo?.tpObjeto) {
          toast.error('Dados do anexo inválidos.');
          return;
        }
        const arquivos = await anexosClient.download(anexo.idObjeto, anexo.tpObjeto, anexo.nmArquivo);
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
    []
  );

  const descricaoCollapsedStyle: CSSProperties =
    !expandDescricao && lineHeightPx
      ? { maxHeight: `${lineHeightPx * MAX_DESC_LINES}px`, overflow: 'hidden' }
      : {};

  const quantidadeDevolutivas = solicitacao?.tramitacoes?.filter(t => !!t?.tramitacao?.dsObservacao)?.length ?? 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl md:max-w-4xl lg:max-w-5xl p-0 flex flex-col max-h-[85vh]">
        <div className="px-6 pt-6">
          <DialogHeader className="p-0">
            <div className="flex items-start justify-between gap-4">
              <div className="w-full">
                <DialogTitle className="text-[20px] font-semibold">
                  Solicitação {identificador || ''}
                </DialogTitle>

                <div className="mt-1 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">{`Criado em: ${criadorLine}`}</div>
                  <span className="inline-flex items-center rounded-full bg-orange-500/10 text-orange-600 px-3 py-1 text-xs font-medium">
                    {statusText}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-2 text-sm">
                  <ClockIcon className="h-4 w-4" />
                  <span className="text-muted-foreground">Prazo para resposta:</span>
                  <span className="font-medium">{prazoLine}</span>
                </div>
              </div>
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
                <div className="col-span-9 px-4 py-3 text-sm">{temaLabel}</div>
              </div>
              <div className="h-px bg-border" />
              <div className="grid grid-cols-12">
                <div className="col-span-3 px-4 py-3 text-xs text-muted-foreground">Nº do ofício:</div>
                <div className="col-span-9 px-4 py-3 text-sm">{sol?.solicitacao?.nrOficio || '—'}</div>
              </div>
              <div className="h-px bg-border" />
              <div className="grid grid-cols-12">
                <div className="col-span-3 px-4 py-3 text-xs text-muted-foreground">Nº do processo:</div>
                <div className="col-span-9 px-4 py-3 text-sm">{sol?.solicitacao?.nrProcesso || '—'}</div>
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Observação</h3>
            </div>

            <div className="rounded-md border bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">
                { observacao ?? '—'}
              </p>
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
                {descricao ? renderDescricaoWithBreaks(descricao) : '—'}
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

          {canListarAnexo && (
            <section className="space-y-3">
              <h3 className="text-sm font-semibold">Anexos </h3>
              <div className="rounded-md border">
                <div className="grid grid-cols-12 items-center">
                  <div className="col-span-3 px-4 py-3 text-sm text-muted-foreground">
                    Anexos do E-mail
                  </div>
                  <div className="col-span-9 px-4 py-3">
                    <AnexoItem anexos={itensEmail} onBaixar={handleBaixarAnexo} />
                  </div>
                </div>
              </div>

              <div className="rounded-md border">
                <div className="grid grid-cols-12 items-center">
                  <div className="col-span-3 px-4 py-3 text-sm text-muted-foreground">
                    Anexos da Solicitação
                  </div>
                  <div className="col-span-9 px-4 py-3">
                    <AnexoItem anexos={itensSolicitacao} onBaixar={handleBaixarAnexo} />
                  </div>
                </div>
            </div>

              <div className="space-y-2">
                <div className="rounded-md border">
                  <div className="grid grid-cols-12 items-center">
                    <div className="col-span-3 px-4 py-3 text-sm text-muted-foreground">
                      Anexado pelo Analista
                    </div>
                    <div className="col-span-9 px-4 py-3">
                      <AnexoItem anexos={anexosAnalista} onBaixar={handleBaixarAnexo} />
                    </div>
                  </div>
                </div>

                <div className="rounded-md border">
                  <div className="grid grid-cols-12 items-center">
                    <div className="col-span-3 px-4 py-3 text-sm text-muted-foreground">
                      Anexado pelo Gerente
                    </div>
                    <div className="col-span-9 px-4 py-3">
                      <AnexoItem anexos={anexosGerente} onBaixar={handleBaixarAnexo} />
                    </div>
                  </div>
                </div>

                <div className="rounded-md border">
                  <div className="grid grid-cols-12 items-center">
                    <div className="col-span-3 px-4 py-3 text-sm text-muted-foreground">
                      Anexado pelos Diretores
                    </div>
                    <div className="col-span-9 px-4 py-3">
                      <AnexoItem anexos={anexosDiretor} onBaixar={handleBaixarAnexo} />
                    </div>
                  </div>
                </div>

                <div className="rounded-md border">
                  <div className="grid grid-cols-12 items-center">
                    <div className="col-span-3 px-4 py-3 text-sm text-muted-foreground">
                      Enviado pelo Regulatório
                    </div>
                    <div className="col-span-9 px-4 py-3">
                      <AnexoItem anexos={anexosRegulatorio} onBaixar={handleBaixarAnexo} />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {(isEmAprovacao && canAprovarSolicitacao) && (
            <section className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="aprovarDevolutiva" className="text-sm font-medium">
                  Aprovar devolutiva? *
                </Label>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={flAprovado === 'S'}
                      onCheckedChange={() => setFlAprovado('S')}
                      id="aprovarDevolutiva-s"
                    />
                    <Label htmlFor="aprovarDevolutiva-s" className="text-sm font-light">Sim</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={flAprovado === 'N'}
                      onCheckedChange={() => setFlAprovado('N')}
                      id="aprovarDevolutiva-n"
                    />
                    <Label htmlFor="aprovarDevolutiva-n" className="text-sm font-light ">Não</Label>
                  </div>
                </div>
              </div>
            </section>
          )}

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Enviar devolutiva ao Regulatório</h3>

              <HistoricoRespostasModalButton
                idSolicitacao={sol?.solicitacao?.idSolicitacao ?? null}
                showButton={quantidadeDevolutivas > 1}
                quantidadeDevolutivas={quantidadeDevolutivas}
              />
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
                disabled={sending }
              />

    

              <div className="mt-3 flex items-center gap-3">
                {canInserirAnexo && (
                  <label className="inline-flex items-center gap-2 text-sm text-primary hover:underline cursor-pointer">
                    <PaperclipIcon className="h-4 w-4" />
                    Fazer upload de arquivo
                    <input type="file" className="hidden" multiple onChange={handleUploadChange} disabled={sending} />
                  </label>
                )}

                {arquivos.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {arquivos.length} arquivo(s) selecionado(s)
                  </span>
                )}
              </div>

              {arquivos.length > 0 && (
                <ul className="mt-3 flex flex-col gap-2">
                  {arquivos.map((f, idx) => (
                    <li
                      key={`${f.name}-${idx}`}
                      className="flex items-center justify-between rounded-md border bg-white px-3 py-2"
                    >
                      <span className="truncate text-sm">{f.name}</span>
                      {canDeletarAnexo && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleRemoveArquivo(idx)}
                          title="Remover"
                          disabled={sending}
                        >
                          <XIcon className="h-4 w-4" />
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </form>

        <DialogFooter className="flex gap-3 px-6 pb-6">
          <Button type="button" variant="outline" onClick={onClose} disabled={sending}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form="detalhes-form"
            disabled={
              sending || isPermissaoEnviandoDevolutiva
              || (isStatusPermitidoEnviar && !hasAreaInicial)
            }
            tooltip={
              isPermissaoEnviandoDevolutiva
                ? 'Apenas gerente/diretores da área pode enviar resposta da devolutiva'
                : (isStatusPermitidoEnviar && !hasAreaInicial)
                  ? 'Disponível apenas para responsáveis das áreas da solicitação'
                  : ''
            }
          >
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
  anexos: AnexoItemShape[];
  onBaixar?: (a: AnexoItemShape) => void | Promise<void>;
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
    >
      <span className="truncate max-w-[160px]">{children}</span>
    </span>
  );
}