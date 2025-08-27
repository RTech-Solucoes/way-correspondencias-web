'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { SolicitacaoResponse } from '@/api/solicitacoes/types';
import type { ResponsavelResponse } from '@/api/responsaveis/types';
import type { TemaResponse } from '@/api/temas/types';
import SolicitacaoModalWizard from './SolicitacaoModalWizard';

export interface SolicitacaoModalProps {
  solicitacao: SolicitacaoResponse | null;
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  responsaveis: ResponsavelResponse[];
  temas: TemaResponse[];
  initialSubject?: string;
  initialDescription?: string;
}

export default function SolicitacaoModal(props: SolicitacaoModalProps) {
  const { open, onClose, solicitacao } = props;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="overflow-y-auto h-full">
        <DialogHeader className="pb-6">
          <DialogTitle className="text-xl font-semibold">
            {solicitacao ? 'Encaminhar Solicitação' : 'Nova Solicitação'}
          </DialogTitle>
        </DialogHeader>
        <SolicitacaoModalWizard {...props} />
      </DialogContent>
    </Dialog>
  );
}
