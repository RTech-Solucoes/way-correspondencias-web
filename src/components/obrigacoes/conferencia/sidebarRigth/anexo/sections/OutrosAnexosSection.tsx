'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import type { AnexoResponse } from '@/api/anexos/type';
import { ItemAnexo } from '../ItensAnexos';

interface OutrosAnexosSectionProps {
  anexos: AnexoResponse[];
  downloadingId: number | null;
  onDownloadAnexo: (anexo: AnexoResponse) => Promise<void>;
  onDeleteAnexo?: (anexo: AnexoResponse) => void | Promise<void>;
  podeExcluirAnexo: (anexo: AnexoResponse) => boolean;
  statusPermiteAnexarOutros: boolean;
  tooltipOutrosAnexos: string;
  onOpenAnexarOutrosModal: () => void;
}

export function OutrosAnexosSection({
  anexos,
  downloadingId,
  onDownloadAnexo,
  onDeleteAnexo,
  podeExcluirAnexo,
  statusPermiteAnexarOutros,
  tooltipOutrosAnexos,
  onOpenAnexarOutrosModal,
}: OutrosAnexosSectionProps) {
  return (
    <div className="space-y-4 mb-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-900">Outros anexos</span>
        <span className="text-xs font-semibold text-gray-400">{anexos.length}</span>
      </div>

      <Button
        type="button"
        variant="link"
        className="flex items-center gap-2 justify-start px-0 text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={onOpenAnexarOutrosModal}
        disabled={!statusPermiteAnexarOutros}
        tooltip={tooltipOutrosAnexos}
      >
        <Plus className="h-4 w-4" />
        Anexar outros anexos
      </Button>

      {anexos.length === 0 ? (
        <p className="text-sm text-gray-400">Nenhum outro anexo encontrado.</p>
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

