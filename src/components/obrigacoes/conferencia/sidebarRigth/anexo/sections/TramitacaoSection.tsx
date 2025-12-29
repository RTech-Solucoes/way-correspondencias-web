'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import type { AnexoResponse } from '@/api/anexos/type';
import { ItemAnexo } from '../ItensAnexos';

interface TramitacaoSectionProps {
  anexos: AnexoResponse[];
  downloadingId: number | null;
  onDownloadAnexo: (anexo: AnexoResponse) => Promise<void>;
  onDeleteAnexo?: (anexo: AnexoResponse) => void | Promise<void>;
  podeExcluirAnexo: (anexo: AnexoResponse) => boolean;
  isStatusConcluido: boolean;
  isStatusPreAnalise: boolean;
  isStatusAprovacaoTramitacao: boolean;
  onOpenAnexarTramitacaoModal: () => void;
}

export function TramitacaoSection({
  anexos,
  downloadingId,
  onDownloadAnexo,
  onDeleteAnexo,
  podeExcluirAnexo,
  isStatusConcluido,
  isStatusPreAnalise,
  isStatusAprovacaoTramitacao,
  onOpenAnexarTramitacaoModal,
}: TramitacaoSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-900">Tramitação</span>
        <span className="text-xs font-semibold text-gray-400">{anexos.length}</span>
      </div>

      <Button
        type="button"
        variant="link"
        className="flex items-center gap-2 justify-start px-0 text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={onOpenAnexarTramitacaoModal}
        disabled={isStatusConcluido || isStatusPreAnalise || isStatusAprovacaoTramitacao}
        tooltip="Apenas é possível selecionar anexos da tramitação durante o andamento da tramitação."
      >
        <Plus className="h-4 w-4" />
        Selecionar anexos da tramitação
      </Button>

      {anexos.length === 0 ? (
        <p className="text-sm text-gray-400">Nenhum documento de tramitação anexado.</p>
      ) : (
        <ul className="space-y-2">
          {anexos.map((anexo) => (
            <ItemAnexo
              key={anexo.idAnexo}
              anexo={anexo}
              onDownload={onDownloadAnexo}
              onDelete={podeExcluirAnexo(anexo) ? onDeleteAnexo : undefined}
              downloadingId={downloadingId}
              tone="subtle"
              dense
              dataUpload={anexo.dtCriacao || null}
              responsavel={anexo.responsavel?.nmResponsavel || anexo.nmUsuario || null}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

