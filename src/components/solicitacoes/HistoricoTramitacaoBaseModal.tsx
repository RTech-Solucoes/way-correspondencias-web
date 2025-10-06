'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowRightIcon, SpinnerIcon, ClockIcon } from '@phosphor-icons/react';
import { Badge } from '@/components/ui/badge';
import { formatDateTime, formatMinutosEmDiasHorasMinutos } from '@/utils/utils';
import { TipoHistoricoResposta } from '@/api/solicitacoes';

export type HistoricoBaseItem = {
  id: number | string;
  tipo: TipoHistoricoResposta;
  dsDescricao?: string | null;
  responsavelNome?: string | null;
  dtCriacao?: string | null;
  nmStatus?: string | null;
  areaOrigem?: string | null;
  areaDestino?: string | null;
  nrTempoGasto?: number | null;
};

interface HistoricoBaseModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  headerActions?: React.ReactNode;
  loading: boolean;
  loadingText: string;
  emptyText: string;
  items: HistoricoBaseItem[];
}

export default function HistoricoTramitacaoBaseModal({
  open,
  onClose,
  title,
  headerActions,
  loading,
  loadingText,
  emptyText,
  items,
}: HistoricoBaseModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{title}</DialogTitle>
            {headerActions}
          </div>
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
                  key={`${item.tipo}-${item.id}`}
                  className="bg-[#f1f1f1] rounded-lg p-4 border border-gray-300"
                >
                  <div className="flex items-center justify-between mb-2">
                    {item.tipo === TipoHistoricoResposta.PARECER && (
                      <Badge
                        variant="secondary"
                        className="bg-white/70 text-gray-800 border border-gray-400 text-xs font-medium px-2 py-1"
                      >
                        DIRETORIA (PARECER)
                      </Badge>
                    )}
                    {item.tipo === TipoHistoricoResposta.TRAMITACAO && (
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
                      {item.dsDescricao ? (
                        <p className="text-sm text-gray-800 font-medium leading-relaxed break-words">
                          {item.dsDescricao}
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
                        {formatDateTime(item.dtCriacao || '') || 'Data não informada'}
                      </div>
                      {item.nmStatus && (
                        <div className="text-xs text-gray-600">{`Status: ${item.nmStatus}`}</div>
                      )}
                      {item.nrTempoGasto && (
                        <div className="text-xs text-gray-600 flex items-center">
                          <ClockIcon className="h-3 w-3 text-blue-600 mr-1" />
                          {`Tempo Gasto: ${formatMinutosEmDiasHorasMinutos(item.nrTempoGasto)}`}
                        </div>
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


