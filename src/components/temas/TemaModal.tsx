'use client';

import {useEffect, useState} from 'react';
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {CheckIcon} from '@phosphor-icons/react';
import {Tema, TipoContagem} from '@/lib/types';
import {mockAreas} from '@/lib/mockData';
import {v4 as uuidv4} from 'uuid';
import {cn} from '@/lib/utils';

interface TemaModalProps {
  isOpen: boolean;
  onClose(): void;
  onSave(tema: Tema): void;
  tema?: Tema | null;
}

export function TemaModal({isOpen, onClose, onSave, tema}: TemaModalProps) {
  const [nmTema, setNmTema] = useState('');
  const [dsTema, setDsTema] = useState('');
  const [nrDiasPrazo, setNrDiasPrazo] = useState(0);
  const [tpContagem, setTpContagem] = useState<TipoContagem>(TipoContagem.UTEIS);
  const [selectedAreaIds, setSelectedAreaIds] = useState<string[]>([]);

  useEffect(() => {
    if (tema) {
      setNmTema(tema.nmTema);
      setDsTema(tema.dsTema);
      setNrDiasPrazo(tema.nrDiasPrazo);
      setTpContagem(tema.tpContagem);
      setSelectedAreaIds(tema.idAreas);
    } else {
      setNmTema('');
      setDsTema('');
      setNrDiasPrazo(0);
      setTpContagem(TipoContagem.UTEIS);
      setSelectedAreaIds([]);
    }
  }, [tema, isOpen]);

  const handleAreaToggle = (areaId: string) => {
    setSelectedAreaIds(prev =>
      prev.includes(areaId)
        ? prev.filter(id => id !== areaId)
        : [...prev, areaId]
    );
  };

  const removeArea = (areaId: string) => {
    setSelectedAreaIds(prev => prev.filter(id => id !== areaId));
  };

  const getSelectedAreas = () => {
    return mockAreas.filter(area => selectedAreaIds.includes(area.idArea));
  };

  const handleSave = () => {
    if (!nmTema || !dsTema || selectedAreaIds.length === 0) return;

    const currentDate = new Date().toISOString().split('T')[0];
    const currentUser = '12345678901';

    const novoTema: Tema = {
      idTema: tema?.idTema || uuidv4(),
      nmTema,
      dsTema,
      idAreas: selectedAreaIds,
      nrDiasPrazo,
      tpContagem,
      dtCadastro: tema?.dtCadastro || currentDate,
      nrCpfCadastro: tema?.nrCpfCadastro || currentUser,
      vsVersao: tema ? tema.vsVersao + 1 : 1,
      dtAlteracao: currentDate,
      nrCpfAlteracao: currentUser
    };

    onSave(novoTema);
    onClose();
  };

  const isFormValid = nmTema && dsTema && selectedAreaIds.length > 0 && nrDiasPrazo > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
              <Label htmlFor="nrDiasPrazo">Dias de Prazo *</Label>
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
            <Label>Áreas Relacionadas *</Label>
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
              {mockAreas.map((area) => (
                <button
                  key={area.idArea}
                  type="button"
                  onClick={() => handleAreaToggle(area.idArea)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all hover:shadow-sm",
                    selectedAreaIds.includes(area.idArea)
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                  )}
                >
                  <div className={cn(
                    "w-4 h-4 rounded-full border flex items-center justify-center transition-all",
                    selectedAreaIds.includes(area.idArea)
                      ? "border-white bg-white"
                      : "border-gray-400 bg-transparent"
                  )}>
                    {selectedAreaIds.includes(area.idArea) && (
                      <CheckIcon className="w-2.5 h-2.5 text-blue-500"/>
                    )}
                  </div>
                  {area.nmArea}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!isFormValid}>
            {tema ? 'Salvar Alterações' : 'Criar Tema'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}