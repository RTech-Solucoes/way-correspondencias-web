'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface JustificarAtrasoModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (justificativa: string) => Promise<void>;
  justificativaExistente?: string | null;
}

export function JustificarAtrasoModal({ open, onClose, onConfirm, justificativaExistente }: JustificarAtrasoModalProps) {
  const [justificativa, setJustificativa] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setJustificativa(justificativaExistente || '');
      setError(null);
    }
  }, [open, justificativaExistente]);

  const handleClose = () => {
    if (!loading) {
      setJustificativa('');
      setError(null);
      onClose();
    }
  };

  const handleConfirm = async () => {
    if (!justificativa.trim()) {
      setError('Por favor, preencha a justificativa do atraso.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onConfirm(justificativa.trim());
      setJustificativa('');
      onClose();
    } catch (err) {
      setError('Erro ao justificar atraso. Tente novamente.');
      console.error('Erro ao justificar atraso:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>
            {justificativaExistente ? 'Editar Justificativa de Atraso' : 'Justificar Atraso'}
          </DialogTitle>
          <DialogDescription>
            {justificativaExistente 
              ? 'Edite a justificativa do atraso desta obrigação.'
              : 'Informe o motivo do atraso desta obrigação.'}
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
              placeholder="Descreva o motivo do atraso..."
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
            onClick={handleConfirm}
            disabled={loading || !justificativa.trim()}
            className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              'Confirmar'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

