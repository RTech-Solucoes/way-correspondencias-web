'use client';

import { AnaliseGerenteDiretor } from '@/api/solicitacoes/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { TextField } from '@/components/ui/text-field';
import { Textarea } from '@/components/ui/textarea';
import { getRows } from '@/utils/utils';
import { Step1Props } from '../types';

export function Step1Identificacao({ formData, updateFormData, disabled = false, onInputChange }: Step1Props) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <TextField
          label="Código de Identificação *"
          name="cdIdentificacao"
          value={formData.cdIdentificacao}
          onChange={onInputChange}
          required
          autoFocus
          maxLength={50}
          disabled={disabled}
        />
        <TextField
          label="Nº Ofício"
          name="nrOficio"
          value={formData.nrOficio}
          onChange={onInputChange}
          maxLength={50}
          disabled={disabled}
        />
        <TextField
          label="Nº Processo"
          name="nrProcesso"
          value={formData.nrProcesso}
          onChange={onInputChange}
          maxLength={50}
          disabled={disabled}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="flAnaliseGerenteDiretor" className="text-sm font-medium">
            Exige aprovação especial? *
          </Label>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={(formData.flAnaliseGerenteDiretor || '').toUpperCase() === AnaliseGerenteDiretor.G}
                onCheckedChange={() =>
                  updateFormData({
                    flAnaliseGerenteDiretor: AnaliseGerenteDiretor.G,
                  })
                }
                disabled={disabled}
              />
              <Label className="text-sm font-light">Gerente</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={(formData.flAnaliseGerenteDiretor || '').toUpperCase() === AnaliseGerenteDiretor.D}
                onCheckedChange={() =>
                  updateFormData({
                    flAnaliseGerenteDiretor: AnaliseGerenteDiretor.D,
                  })
                }
                disabled={disabled}
              />
              <Label className="text-sm font-light ">Diretor</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={(formData.flAnaliseGerenteDiretor || '').toUpperCase() === AnaliseGerenteDiretor.A}
                onCheckedChange={() =>
                  updateFormData({
                    flAnaliseGerenteDiretor: AnaliseGerenteDiretor.A,
                  })
                }
                disabled={disabled}
              />
              <Label className="text-sm font-light">Ambos</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={(formData.flAnaliseGerenteDiretor || '').toUpperCase() === AnaliseGerenteDiretor.N}
                onCheckedChange={() =>
                  updateFormData({
                    flAnaliseGerenteDiretor: AnaliseGerenteDiretor.N,
                  })
                }
                disabled={disabled}
              />
              <Label className="text-sm font-light">Não necessita</Label>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="flExigeCienciaGerenteRegul" className="text-sm font-medium">
            Exige manifestação do Gerente do Regulatório? *
          </Label>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={(formData.flExigeCienciaGerenteRegul || '').toUpperCase() === 'S'}
                onCheckedChange={() =>
                  updateFormData({
                    flExigeCienciaGerenteRegul: 'S',
                  })
                }
                disabled={disabled}
              />
              <Label className="text-sm font-light">Sim</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={(formData.flExigeCienciaGerenteRegul || '').toUpperCase() === 'N'}
                onCheckedChange={() =>
                  updateFormData({
                    flExigeCienciaGerenteRegul: 'N',
                  })
                }
                disabled={disabled}
              />
              <Label className="text-sm font-light ">Não, apenas ciência</Label>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dsAssunto">Assunto</Label>
        <Textarea id="dsAssunto" name="dsAssunto" value={formData.dsAssunto} onChange={onInputChange} rows={4} disabled={disabled} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="dsObservacao">Observações</Label>
        <Textarea id="dsObservacao" name="dsObservacao" value={formData.dsObservacao} onChange={onInputChange} rows={4} disabled={disabled} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="dsSolicitacao">Descrição da Solicitação</Label>
        <Textarea
          id="dsSolicitacao"
          name="dsSolicitacao"
          value={formData.dsSolicitacao}
          onChange={onInputChange}
          rows={getRows(formData.dsSolicitacao)}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
