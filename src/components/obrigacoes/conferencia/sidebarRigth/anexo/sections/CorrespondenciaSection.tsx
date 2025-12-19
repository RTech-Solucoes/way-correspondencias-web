'use client';

import type { AnexoResponse } from '@/api/anexos/type';
import { ItemAnexo } from '../ItensAnexos';

interface CorrespondenciaSectionProps {
  anexos: AnexoResponse[];
  downloadingId: number | null;
  onDownloadAnexo: (anexo: AnexoResponse) => Promise<void>;
  onDeleteAnexo?: (anexo: AnexoResponse) => void | Promise<void>;
  podeExcluirAnexo: (anexo: AnexoResponse) => boolean;
}

export function CorrespondenciaSection({
  anexos,
  downloadingId,
  onDownloadAnexo,
  onDeleteAnexo,
  podeExcluirAnexo,
}: CorrespondenciaSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-900">Correspondência</span>
        <span className="text-xs font-semibold text-gray-400">{anexos.length}</span>
      </div>
      {anexos.length === 0 ? (
        <p className="text-sm text-gray-400">Nenhuma correspondência anexada.</p>
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

