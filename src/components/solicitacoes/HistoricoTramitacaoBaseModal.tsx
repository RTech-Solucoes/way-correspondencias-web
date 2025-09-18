'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowRightIcon, SpinnerIcon } from '@phosphor-icons/react';
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/utils/utils';

export type HistoricoBaseItem = {
  id: number | string;
  type: 'TRAMITACAO' | 'PARECER';
  descricao?: string | null;
  responsavelNome?: string | null;
  dataISO?: string | null;
  statusLabel?: string | null;
  areaOrigem?: string | null;
  areaDestino?: string | null;
};

interface HistoricoBaseModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  loading: boolean;
  loadingText: string;
  emptyText: string;
  items: HistoricoBaseItem[];
}

export default function HistoricoTramitacaoBaseModal({
  open,
  onClose,
  title,
  loading,
  loadingText,
  emptyText,
  items,
}: HistoricoBaseModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <SpinnerIcon className="h-5 w-5 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-500">{loadingText}</span>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">{emptyText}</p>
            </div>
          ) : (
            <div className="space-y-4 overflow-y-auto">
              {items.map((item) => (
                <div
                  key={`${item.type}-${item.id}`}
                  className="bg-[#f1f1f1] rounded-lg p-4 border border-gray-300"
                >
                  <div className="flex items-center justify-between mb-2">
                    {item.type === 'PARECER' && (
                      <Badge
                        variant="secondary"
                        className="bg-white/70 text-gray-800 border border-gray-400 text-xs font-medium px-2 py-1"
                      >
                        DIRETORIA (PARECER)
                      </Badge>
                    )}
                    {item.type === 'TRAMITACAO' && (
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant="secondary"
                          className="bg-white/70 text-gray-800 border border-gray-400 text-xs font-medium px-2 py-1"
                        >
                          {item.areaOrigem}
                        </Badge>
                        <ArrowRightIcon className="h-4 w-4 text-gray-600" />
                        <Badge
                          variant="secondary"
                          className="bg-white/70 text-gray-800 border border-gray-400 text-xs font-medium px-2 py-1"
                        >
                          {item.areaDestino}
                        </Badge>
                      </div>
                    )}
                  </div>
                  <div className="mb-3 flex items-end justify-between gap-3">
                    <div className="flex-1 min-w-0 mr-4">
                      {item.descricao ? (
                        <p className="text-sm text-gray-800 font-medium leading-relaxed break-words">
                          {item.descricao}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-600 italic">A solicitação foi direcionada para a(s) área(s) responsável(is)</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end space-y-0.5 text-right">
                      <div className="text-sm font-medium text-gray-800 max-w-[260px] truncate">
                        {item.responsavelNome || 'Responsável não informado'}
                      </div>
                      <div className="text-xs text-gray-600">
                        {formatDateTime(item.dataISO || '') || 'Data não informada'}
                      </div>
                      {item.statusLabel && (
                        <div className="text-xs text-gray-600">{`Status: ${item.statusLabel}`}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}


