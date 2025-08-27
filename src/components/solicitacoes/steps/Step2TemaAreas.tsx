'use client';

import { useCallback } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MultiSelectAreas } from '@/components/ui/multi-select-areas';
import { SolicitacaoRequest } from '@/api/solicitacoes/types';
import { TemaResponse } from '@/api/temas/types';

interface Step2TemaAreasProps {
  formData: SolicitacaoRequest;
  temas: TemaResponse[];
  onTemaPicked: (temaId: number) => void;
  onAreasChange: (selected: number[]) => void;
}

export default function Step2TemaAreas({ formData, temas, onTemaPicked, onAreasChange }: Step2TemaAreasProps) {
  const handleTema = useCallback((value: string) => onTemaPicked(parseInt(value)), [onTemaPicked]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="tema">Tema *</Label>
        <Select value={formData.idTema ? String(formData.idTema) : ''} onValueChange={handleTema}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tema" />
          </SelectTrigger>
          <SelectContent>
            {temas.map((t) => (
              <SelectItem key={t.idTema} value={String(t.idTema)}>
                {t.nmTema}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <MultiSelectAreas selectedAreaIds={formData.idsAreas || []} onSelectionChange={onAreasChange} disabled={!formData.idTema} />
    </div>
  );
}
