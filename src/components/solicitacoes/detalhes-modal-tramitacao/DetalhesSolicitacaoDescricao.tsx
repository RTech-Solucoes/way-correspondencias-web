'use client';

import { CSSProperties, RefObject } from 'react';

type DetalhesSolicitacaoDescricaoProps = {
  observacao: string | null;
  descricao: string;
  expandDescricao: boolean;
  setExpandDescricao: (value: boolean | ((prev: boolean) => boolean)) => void;
  canToggleDescricao: boolean;
  lineHeightPx: number | null;
  descRef: RefObject<HTMLParagraphElement | null>;
  maxDescLines: number;
};

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

export function DetalhesSolicitacaoDescricao({
  observacao,
  descricao,
  expandDescricao,
  setExpandDescricao,
  canToggleDescricao,
  lineHeightPx,
  descRef,
  maxDescLines,
}: DetalhesSolicitacaoDescricaoProps) {
  const descricaoCollapsedStyle: CSSProperties =
    !expandDescricao && lineHeightPx
      ? { maxHeight: `${lineHeightPx * maxDescLines}px`, overflow: 'hidden' }
      : {};

  return (
    <>
      {/* Observação */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Observação</h3>
        </div>

        <div className="rounded-md border bg-muted/30 p-4">
          <p className="text-sm text-muted-foreground">
            {observacao ?? '—'}
          </p>
        </div>
      </section>

      {/* Descrição */}
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
    </>
  );
}
