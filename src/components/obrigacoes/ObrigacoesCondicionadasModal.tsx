'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, ExternalLink } from 'lucide-react';
import { ObrigacaoResumoResponse } from '@/api/obrigacao/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getObrigacaoStatusStyle } from '@/utils/obrigacoes/status';

interface ObrigacoesCondicionadasModalProps {
  open: boolean;
  onClose: () => void;
  obrigacoesCondicionadas: ObrigacaoResumoResponse[];
}

export function ObrigacoesCondicionadasModal({
  open,
  onClose,
  obrigacoesCondicionadas,
}: ObrigacoesCondicionadasModalProps) {
  const handleVisualizarObrigacao = (idSolicitacao: number) => {
    window.open(`/obrigacao/${idSolicitacao}/conferencia`, '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-200">
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            Obrigações Condicionadas Pendentes
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm text-orange-800 font-medium text-center">
              Não é possível anexar protocolo para concluir a obrigação enquanto existirem obrigações condicionadas pendentes.
              Só é possível concluir após todas essas condicionadas estiverem com status de Concluído.
            </p>
          </div>

          {obrigacoesCondicionadas.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Identificação</TableHead>
                    <TableHead>Tarefa</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {obrigacoesCondicionadas.map((obrigacao) => {
                    const statusStyle = getObrigacaoStatusStyle(
                      obrigacao.statusSolicitacao?.idStatusSolicitacao?.toString(),
                      obrigacao.statusSolicitacao?.nmStatus
                    );

                    return (
                      <TableRow key={obrigacao.idSolicitacao}>
                        <TableCell>
                          <button
                            type="button"
                            onClick={() => handleVisualizarObrigacao(obrigacao.idSolicitacao)}
                            className="group flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
                          >
                            <span>{obrigacao.cdIdentificacao}</span>
                            <ExternalLink className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                          </button>
                        </TableCell>
                        <TableCell className="max-w-md truncate" title={obrigacao.dsTarefa}>
                          {obrigacao.dsTarefa}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className="whitespace-nowrap truncate"
                            variant={statusStyle.variant}
                            style={{
                              backgroundColor: statusStyle.backgroundColor,
                              color: statusStyle.textColor,
                            }}
                          >
                            {obrigacao.statusSolicitacao?.nmStatus || 'N/A'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhuma obrigação condicionada pendente encontrada.</p>
            </div>
          )}
        </div>

        <DialogFooter className="border-t border-gray-200 px-6 py-4 mt-auto">
          <Button onClick={onClose} variant="outline" className="min-w-[100px]">
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

