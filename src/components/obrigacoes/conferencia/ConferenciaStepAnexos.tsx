'use client';

import type { AnexoResponse } from '@/api/anexos/type';
import { AttachmentRow } from './AttachmentItems';

interface ConferenciaStepAnexosProps {
  anexos: AnexoResponse[];
  downloadingId: number | null;
  onDownloadAnexo: (anexo: AnexoResponse) => void;
}

export function ConferenciaStepAnexos({
  anexos,
  downloadingId,
  onDownloadAnexo,
}: ConferenciaStepAnexosProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-4 px-8 py-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Anexos</h2>
          <p className="text-sm text-gray-500">Documentos e arquivos relacionados à obrigação.</p>
        </div>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
          {anexos.length} {anexos.length === 1 ? 'arquivo' : 'arquivos'}
        </span>
      </div>

      <div className="px-8 pb-8">
        {anexos.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-gray-400">Nenhum anexo encontrado para esta obrigação.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {anexos.map((anexo) => (
              <AttachmentRow
                key={anexo.idAnexo}
                anexo={anexo}
                onDownload={onDownloadAnexo}
                downloadingId={downloadingId}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

