'use client';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SecaoFormulario } from './SecaoFormulario';
import { SecaoConcessionariaProps } from './concessionaria-form';

export default function SecaoObservacoes({ formData, onChange }: SecaoConcessionariaProps) {
  return (
    <SecaoFormulario titulo="Observações">
      <div>
        <Label htmlFor="dsConcessionaria">Descrição</Label>
        <Textarea
          id="dsConcessionaria"
          value={formData.dsConcessionaria}
          onChange={(event) => onChange('dsConcessionaria', event.target.value)}
          placeholder="Informações complementares sobre a concessionária"
          rows={3}
        />
      </div>
    </SecaoFormulario>
  );
}
