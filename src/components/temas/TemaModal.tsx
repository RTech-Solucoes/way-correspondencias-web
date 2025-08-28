'use client';

import {useEffect, useState, useCallback} from 'react';
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {TemaResponse} from '@/api/temas/types';
import {temasClient} from '@/api/temas/client';
import {TemaRequest} from '@/api/temas/types';
import { toast } from 'sonner';

interface TemaModalProps {
  tema: TemaResponse | null;
  open: boolean;
  onClose(): void;
  onSave(): void;
}

export function TemaModal({tema, open, onClose, onSave}: TemaModalProps) {
  const [nmTema, setNmTema] = useState('');
  const [dsTema, setDsTema] = useState('');
  const [nrPrazo, setNrPrazo] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (tema) {
        setNmTema(tema.nmTema);
        setDsTema(tema.dsTema || '');
        setNrPrazo(tema.nrPrazo || 0);
      } else {
        setNmTema('');
        setDsTema('');
        setNrPrazo(0);
      }
    }
  }, [open, tema]);

  const isFormValid = useCallback(() => {
    return nmTema.trim() !== '' && dsTema.trim() !== '';
  }, [nmTema, dsTema]);

  const handleSave = async () => {
    if (!isFormValid()) return;

    try {
      setLoading(true);
      const temaRequest: TemaRequest = {
        nmTema: nmTema.trim(),
        dsTema: dsTema.trim(),
        nrPrazo: nrPrazo > 0 ? nrPrazo : undefined,
        tpPrazo: 'H'
      };

      if (tema) {
        await temasClient.atualizar(tema.idTema, temaRequest);
        toast.success("Tema atualizado com sucesso!");
      } else {
        await temasClient.criar(temaRequest);
        toast.success("Tema criado com sucesso!");
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar tema:', error);
      toast.error(`Erro ao ${tema ? 'atualizar' : 'criar'} tema`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {tema ? 'Editar Tema' : 'Novo Tema'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nmTema">Nome do Tema *</Label>
              <Input
                id="nmTema"
                value={nmTema}
                onChange={(e) => setNmTema(e.target.value)}
                placeholder="Digite o nome do tema"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nrPrazo">Prazo (horas corridas)</Label>
              <Input
                id="nrPrazo"
                type="number"
                value={nrPrazo}
                onChange={(e) => setNrPrazo(Number(e.target.value))}
                placeholder="0"
                min="1"
              />
            </div>

          </div>

          <div className="space-y-2">
            <Label htmlFor="dsTema">Descrição *</Label>
            <Textarea
              id="dsTema"
              value={dsTema}
              onChange={(e) => setDsTema(e.target.value)}
              placeholder="Digite a descrição do tema"
              rows={3}
            />
          </div>

        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isFormValid() || loading}
            className="disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {tema ? 'Salvar Alterações' : 'Criar Tema'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}