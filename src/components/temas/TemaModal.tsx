'use client';

import {useEffect, useState, useCallback} from 'react';
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {TemaResponse} from '@/api/temas/types';
import {temasClient} from '@/api/temas/client';
import {TemaRequest} from '@/api/temas/types';
import { toast } from 'sonner';
import { MultiSelectAreas } from '@/components/ui/multi-select-areas';

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
  const [tpPrazo, setTpPrazo] = useState('');
  const [selectedAreaIds, setSelectedAreaIds] = useState<number[]>([]);
  const [loadingTema, setLoadingTema] = useState(false);

  const buscarTemaComAreas = useCallback(async (idTema: number) => {
    try {
      setLoadingTema(true);
      const temaComAreas = await temasClient.buscarPorIdComAreas(idTema);

      setNmTema(temaComAreas.nmTema);
      setDsTema(temaComAreas.dsTema || '');
      setNrPrazo(temaComAreas.nrPrazo || 0);
      setTpPrazo(temaComAreas.tpPrazo || '');

      if (temaComAreas.areas && temaComAreas.areas?.length > 0) {
        setSelectedAreaIds(temaComAreas.areas.map(area => area.idArea));
      } else {
        setSelectedAreaIds([]);
      }
    } catch {
      toast.error("Erro ao carregar tema");
    } finally {
      setLoadingTema(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      if (tema) {
        buscarTemaComAreas(tema.idTema);
      } else {
        setNmTema('');
        setDsTema('');
        setNrPrazo(0);
        setTpPrazo('');
        setSelectedAreaIds([]);
      }
    }
  }, [open, tema, buscarTemaComAreas]);

  const handleAreasSelectionChange = useCallback((selectedIds: number[]) => {
    setSelectedAreaIds(selectedIds);
  }, []);

  const isFormValid = useCallback(() => {
    return nmTema.trim() !== '' && dsTema.trim() !== '';
  }, [nmTema, dsTema]);

  const handleSave = async () => {
    if (!isFormValid()) return;

    try {
      const temaRequest: TemaRequest = {
        nmTema: nmTema.trim(),
        dsTema: dsTema.trim(),
        nrPrazo: nrPrazo > 0 ? nrPrazo : undefined,
        tpPrazo: tpPrazo || undefined,
        idsAreas: selectedAreaIds?.length > 0 ? selectedAreaIds : undefined
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
          <div className="grid grid-cols-3 gap-4">
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
              <Label htmlFor="nrPrazo">Prazo</Label>
              <Input
                id="nrPrazo"
                type="number"
                value={nrPrazo}
                onChange={(e) => setNrPrazo(Number(e.target.value))}
                placeholder="0"
                min="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tpPrazo">Tipo de Prazo</Label>
              <Select value={tpPrazo} onValueChange={setTpPrazo}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de prazo"/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="U">Dias Úteis</SelectItem>
                  <SelectItem value="C">Dias Corridos</SelectItem>
                </SelectContent>
              </Select>
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

          <div className="space-y-4">
            <MultiSelectAreas
              selectedAreaIds={selectedAreaIds}
              onSelectionChange={handleAreasSelectionChange}
              label="Áreas Relacionadas"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isFormValid() || loadingTema}
            className="disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {tema ? 'Salvar Alterações' : 'Criar Tema'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}