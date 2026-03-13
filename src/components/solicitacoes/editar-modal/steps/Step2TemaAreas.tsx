'use client';

import { Label } from '@/components/ui/label';
import { MultiSelectAreas } from '@/components/ui/multi-select-areas';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Step2Props } from '../types';

export function Step2TemaAreas({
  formData,
  updateFormData,
  disabled = false,
  temas,
  correspondencia,
  onAreasSelectionChange,
  getResponsavelFromTema,
}: Step2Props) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="tema">Tema *</Label>
        <Select
          value={formData.idTema ? formData.idTema.toString() : ''}
          onValueChange={value => {
            const temaId = parseInt(value);
            updateFormData({
              idTema: temaId,
              idResponsavel: getResponsavelFromTema(temaId),
              nrPrazo: temas.find(t => t.idTema === temaId)?.nrPrazo || undefined,
              tpPrazo: 'H',
            });
          }}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tema" />
          </SelectTrigger>
          <SelectContent>
            {correspondencia?.tema && !temas.find(t => t.idTema === correspondencia.tema!.idTema) && (
              <SelectItem key={correspondencia.tema.idTema} value={correspondencia.tema.idTema.toString()}>
                {correspondencia.tema.nmTema}
              </SelectItem>
            )}
            {temas.map(tema => (
              <SelectItem key={tema.idTema} value={tema.idTema.toString()}>
                {tema.nmTema}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <MultiSelectAreas selectedAreaIds={formData.idsAreas || []} onSelectionChange={onAreasSelectionChange} disabled={disabled} label="Áreas *" />
    </div>
  );
}
