'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import obrigacaoClient from '@/api/obrigacao/client';

export interface OrigemObrigacao {
  codigoRelacionada: string | null;
  idRelacionada: number | null;
  idObrigacaoReplicada: number | null;
  importadaPlanilha: boolean;
}

export function origemFromObrigacao(obrigacao: {
  obrigacaoPrincipal?: { cdIdentificacao?: string | null; idSolicitacao?: number | null } | null;
  idObrigacaoReplicada?: number | null;
  flImportadaExcel?: string | null;
}): OrigemObrigacao {
  return {
    codigoRelacionada: obrigacao.obrigacaoPrincipal?.cdIdentificacao || null,
    idRelacionada: obrigacao.obrigacaoPrincipal?.idSolicitacao ?? null,
    idObrigacaoReplicada: obrigacao.idObrigacaoReplicada ?? null,
    importadaPlanilha: (obrigacao.flImportadaExcel || '').toUpperCase() === 'S',
  };
}

export function temInformacaoOrigem(origem: OrigemObrigacao | null | undefined) {
  if (!origem) return false;
  return origem.importadaPlanilha || origem.idObrigacaoReplicada != null;
}

interface OrigemObrigacaoAvisoProps {
  origem: OrigemObrigacao | null;
  className?: string;
}

function CodigoObrigacao({ id, codigo }: { id: number | null; codigo: string }) {
  if (!id) return <span className="font-semibold">{codigo}</span>;

  return (
    <Link
      href={`/obrigacao?idObrigacao=${id}`}
      className="font-semibold underline underline-offset-2"
      target="_blank"
    >
      {codigo}
    </Link>
  );
}

export function OrigemObrigacaoAviso({ origem, className }: OrigemObrigacaoAvisoProps) {
  const [codigoReplica, setCodigoReplica] = useState<string | null>(null);

  useEffect(() => {
    if (!origem?.idObrigacaoReplicada) {
      setCodigoReplica(null);
      return;
    }

    let ativo = true;
    obrigacaoClient
      .buscarPorId(origem.idObrigacaoReplicada)
      .then((obrigacao) => {
        if (ativo) {
          setCodigoReplica(obrigacao.cdIdentificacao || String(origem.idObrigacaoReplicada));
        }
      })
      .catch(() => {
        if (ativo) setCodigoReplica(String(origem.idObrigacaoReplicada));
      });

    return () => {
      ativo = false;
    };
  }, [origem?.idObrigacaoReplicada]);

  if (!origem) return null;

  const replicadaDeOutra = origem.idObrigacaoReplicada != null;

  if (!origem.importadaPlanilha && !replicadaDeOutra) return null;

  return (
    <div className={`space-y-1 text-sm text-gray-800 ${className || ''}`}>
      {origem.importadaPlanilha && <p>Importada da planilha.</p>}
      {replicadaDeOutra && (
        <p>
          Replicada de{' '}
          <CodigoObrigacao
            id={origem.idObrigacaoReplicada}
            codigo={codigoReplica || String(origem.idObrigacaoReplicada)}
          />
          .
        </p>
      )}
    </div>
  );
}
