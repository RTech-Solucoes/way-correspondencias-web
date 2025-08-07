'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { Tema, TipoContagem } from '@/lib/types';
import { mockAreas } from '@/lib/mockData';
import { v4 as uuidv4 } from 'uuid';

interface TemaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tema: Tema) => void;
  tema?: Tema | null;
}

export function TemaModal({ isOpen, onClose, onSave, tema }: TemaModalProps) {
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
      // Reset form for new tema
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
    const currentUser = '12345678901'; // Mock user CPF

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
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TipoContagem.UTEIS}>Dias Úteis</SelectItem>
                <SelectItem value={TipoContagem.CORRIDOS}>Dias Corridos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <Label>Áreas Relacionadas *</Label>

            {/* Selected Areas Display */}
            {selectedAreaIds.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Áreas Selecionadas:</Label>
                <div className="flex flex-wrap gap-2">
                  {getSelectedAreas().map((area) => (
                    <Badge key={area.idArea} variant="secondary" className="flex items-center gap-2">
                      {area.nmArea}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => removeArea(area.idArea)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Areas Selection */}
            <Card>
              <CardContent className="p-4">
                <Label className="text-sm font-medium mb-3 block">Selecione as áreas:</Label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {mockAreas.map((area) => (
                    <div key={area.idArea} className="flex items-center space-x-2">
                      <Checkbox
                        id={`area-${area.idArea}`}
                        checked={selectedAreaIds.includes(area.idArea)}
                        onCheckedChange={() => handleAreaToggle(area.idArea)}
                      />
                      <Label
                        htmlFor={`area-${area.idArea}`}
                        className="flex-1 cursor-pointer"
                      >
                        <div>
                          <div className="font-medium">{area.nmArea}</div>
                          <div className="text-sm text-muted-foreground">{area.dsArea}</div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
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