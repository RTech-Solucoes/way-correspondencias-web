'use client';

import {useEffect, useState, useCallback} from 'react';
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {CheckIcon} from '@phosphor-icons/react';
import {TemaResponse} from '@/api/temas/types';
import {TipoContagem} from '@/types/temas/enums';
import {cn} from '@/utils/utils';
import areasClient from '@/api/areas/client';
import {AreaResponse} from '@/api/areas/types';
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
  const [nrDiasPrazo, setNrDiasPrazo] = useState(0);
  const [tpContagem, setTpContagem] = useState<TipoContagem>(TipoContagem.UTEIS);
  const [selectedAreaIds, setSelectedAreaIds] = useState<string[]>([]);
  const [areas, setAreas] = useState<AreaResponse[]>([]);
  const [loadingAreas, setLoadingAreas] = useState(false);

  const buscarAreas = useCallback(async () => {
    try {
      setLoadingAreas(true);
      const response = await areasClient.buscarPorFiltro({
        size: 1000
      });
      const areasAtivas = response.content.filter((area: AreaResponse) => area.flAtivo === 'S');
      setAreas(areasAtivas);
    } catch {
      setAreas([]);
    } finally {
      setLoadingAreas(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      buscarAreas();
    }
  }, [open, buscarAreas]);

  useEffect(() => {
    if (tema) {
      setNmTema(tema.nmTema);
      setDsTema(tema.dsTema);
      setNrDiasPrazo(30);
      setTpContagem(TipoContagem.UTEIS);
      setSelectedAreaIds([]);
    } else {
      setNmTema('');
      setDsTema('');
      setNrDiasPrazo(0);
      setTpContagem(TipoContagem.UTEIS);
      setSelectedAreaIds([]);
    }
  }, [tema, open]);

  const handleAreaToggle = (areaId: string) => {
    setSelectedAreaIds(prev =>
      prev.includes(areaId)
        ? prev.filter(id => id !== areaId)
        : [...prev, areaId]
    );
  };

  const isFormValid = useCallback(() => {
    return nmTema.trim() !== '' && dsTema.trim() !== '';
  }, [nmTema, dsTema]);

  const handleSave = async () => {
    if (!isFormValid()) return;

    try {
      const temaRequest: TemaRequest = {
        nmTema: nmTema.trim(),
        dsTema: dsTema.trim()
      };

      if (tema) {
        await temasClient.atualizar(tema.id, temaRequest);
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
              <Label htmlFor="nrDiasPrazo">Dias de Prazo</Label>
              <Input
                id="nrDiasPrazo"
                type="number"
                value={nrDiasPrazo}
                onChange={(e) => setNrDiasPrazo(Number(e.target.value))}
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

          <div className="space-y-2">
            <Label htmlFor="tpContagem">Tipo de Contagem</Label>
            <Select value={tpContagem} onValueChange={(value) => setTpContagem(value as TipoContagem)}>
              <SelectTrigger>
                <SelectValue/>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TipoContagem.UTEIS}>Dias Úteis</SelectItem>
                <SelectItem value={TipoContagem.CORRIDOS}>Dias Corridos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <Label>Áreas Relacionadas</Label>
            {loadingAreas ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-sm text-gray-500">Buscando áreas...</div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                {areas.map((area) => (
                  <button
                    key={area.idArea}
                    type="button"
                    onClick={() => handleAreaToggle(area.idArea.toString())}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all hover:shadow-sm",
                      selectedAreaIds.includes(area.idArea.toString())
                        ? "bg-blue-500 text-white border-blue-500"
                        : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                    )}
                  >
                    <div className={cn(
                      "w-4 h-4 rounded-full border flex items-center justify-center transition-all",
                      selectedAreaIds.includes(area.idArea.toString())
                        ? "border-white bg-white"
                        : "border-gray-400 bg-transparent"
                    )}>
                      {selectedAreaIds.includes(area.idArea.toString()) && (
                        <CheckIcon className="w-2.5 h-2.5 text-blue-500"/>
                      )}
                    </div>
                    {area.nmArea}
                  </button>
                ))}
                {areas.length === 0 && !loadingAreas && (
                  <div className="text-sm text-gray-500 pt-4">
                    Nenhuma área encontrada
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isFormValid() || loadingAreas}
            className="disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {tema ? 'Salvar Alterações' : 'Criar Tema'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}