'use client';

import { Pill } from '@/components/ui/pill';
import { getTipoAprovacaoLabel } from '@/api/solicitacoes/types';
import { hoursToDaysAndHours } from '@/utils/utils';

type Area = {
  nmArea: string;
  idArea?: number;
  cdArea?: string;
};

type DetalhesSolicitacaoResumoProps = {
  assunto: string;
  areas: Area[];
  temaLabel: string;
  nrOficio?: string | null;
  nrProcesso?: string | null;
  flAnaliseGerenteDiretor?: string;
  isAnaliseGerenteRegulatorio: boolean;
  currentPrazoTotal?: number;
  flExcepcional?: string;
};

export function DetalhesSolicitacaoResumo({
  assunto,
  areas,
  temaLabel,
  nrOficio,
  nrProcesso,
  flAnaliseGerenteDiretor,
  isAnaliseGerenteRegulatorio,
  currentPrazoTotal,
  flExcepcional,
}: DetalhesSolicitacaoResumoProps) {
  return (
    <>
      {/* Assunto */}
      <section className="space-y-2">
        <h3 className="text-sm font-semibold">Assunto</h3>
        <div className="rounded-md border bg-muted/30 p-4">
          <p className="text-sm whitespace-pre-wrap break-words">
            {assunto || '—'}
          </p>
        </div>
      </section>

      {/* Resumo da Solicitação */}
      <section className="space-y-2">
        <h3 className="text-sm font-semibold">Resumo da Solicitação</h3>
        <div className="rounded-md border bg-muted/30">
          {/* Áreas */}
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

          {/* Tema */}
          <div className="grid grid-cols-12 gap-0">
            <div className="col-span-3 px-4 py-3 text-xs text-muted-foreground">Tema:</div>
            <div className="col-span-9 px-4 py-3 text-sm">{temaLabel}</div>
          </div>

          <div className="h-px bg-border" />

          {/* Nº do ofício */}
          <div className="grid grid-cols-12">
            <div className="col-span-3 px-4 py-3 text-xs text-muted-foreground">Nº do ofício:</div>
            <div className="col-span-9 px-4 py-3 text-sm">{nrOficio || '—'}</div>
          </div>

          <div className="h-px bg-border" />

          {/* Nº do processo */}
          <div className="grid grid-cols-12">
            <div className="col-span-3 px-4 py-3 text-xs text-muted-foreground">Nº do processo:</div>
            <div className="col-span-9 px-4 py-3 text-sm">{nrProcesso || '—'}</div>
          </div>

          <div className="h-px bg-border" />

          {/* Exige aprovação especial */}
          <div className="grid grid-cols-12">
            <div className="col-span-3 px-4 py-3 text-xs text-muted-foreground">Exige aprovação especial:</div>
            <div className="col-span-9 px-4 py-3 text-sm">
              {getTipoAprovacaoLabel(flAnaliseGerenteDiretor ?? '')}
            </div>
          </div>

          {/* Prazo Principal (apenas em Análise Gerente Regulatório) */}
          {isAnaliseGerenteRegulatorio && (
            <>
              <div className="h-px bg-border" />
              <div className="grid grid-cols-12">
                <div className="col-span-3 px-4 py-3 text-xs text-muted-foreground">Prazo Principal:</div>
                <div className="col-span-9 px-4 py-3 text-sm">
                  {hoursToDaysAndHours(currentPrazoTotal ?? 0)}
                  {flExcepcional === 'S' && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                      Excepcional
                    </span>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
