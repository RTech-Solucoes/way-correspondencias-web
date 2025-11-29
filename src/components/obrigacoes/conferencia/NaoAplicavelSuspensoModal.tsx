'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

interface NaoAplicavelSuspensoModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (justificativa: string) => Promise<void>;
  justificativaExistente?: string | null;
}

export function NaoAplicavelSuspensoModal({ open, onClose, onConfirm, justificativaExistente }: NaoAplicavelSuspensoModalProps) {
  const [justificativa, setJustificativa] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    if (open) {
      setJustificativa(justificativaExistente || '');
      setError(null);
      setShowConfirmDialog(false);
    }
  }, [open, justificativaExistente]);

  const handleClose = () => {
    if (!loading) {
      setJustificativa('');
      setError(null);
      setShowConfirmDialog(false);
      onClose();
    }
  };

  const handleSave = () => {
    if (!justificativa.trim()) {
      setError('Por favor, preencha a justificativa.');
      return;
    }

    setShowConfirmDialog(true);
  };

  const handleConfirm = async () => {
    if (!justificativa.trim()) {
      setError('Por favor, preencha a justificativa.');
      setShowConfirmDialog(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onConfirm(justificativa.trim());
      setJustificativa('');
      setShowConfirmDialog(false);
      onClose();
    } catch (err) {
      setError('Erro ao atualizar status. Tente novamente.');
      console.error('Erro ao atualizar status:', err);
      setShowConfirmDialog(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>
              {justificativaExistente ? 'Editar Status Não Aplicável/Suspenso' : 'Alterar Status para Não Aplicável/Suspenso'}
            </DialogTitle>
            <DialogDescription>
              {justificativaExistente 
                ? 'Edite a justificativa do status não aplicável/suspenso desta obrigação.'
                : 'Informe a justificativa para alterar o status desta obrigação para "Não Aplicável/Suspenso".'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="justificativa">Justificativa *</Label>
              <Textarea
                id="justificativa"
                value={justificativa}
                onChange={(e) => {
                  setJustificativa(e.target.value);
                  setError(null);
                }}
                placeholder="Descreva o motivo para alterar o status para não aplicável/suspenso..."
                rows={10}
                disabled={loading}
                className={error ? 'border-red-500' : ''}
              />
              {error && (
                <p className="text-sm text-red-500 mt-1">{error}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={loading || !justificativa.trim()}
              className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar e Alterar Status'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        title="Confirmar alteração de status"
        description="Tem certeza que deseja alterar o status desta obrigação para 'Não Aplicável/Suspenso'?"
        confirmText="Sim, alterar status"
        cancelText="Cancelar"
        onConfirm={handleConfirm}
        variant="default"
      />
    </>
  );
}

