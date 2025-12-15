'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { TramitacaoFormData } from '../TramitacaoObrigacaoModal';

interface Step1DadosProps {
  formData: TramitacaoFormData;
  updateFormData: (data: Partial<TramitacaoFormData>) => void;
}

export function Step1Dados({ formData, updateFormData }: Step1DadosProps) {
  return (
    <div className="space-y-6">

      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cdIdentificacao">Identificação*</Label>
          <Input
            id="cdIdentificacao"
            value={formData.cdIdentificacao || ''}
            onChange={(e) => updateFormData({ cdIdentificacao: e.target.value })}
            placeholder="0000"
            disabled={true}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dsTarefa">Tarefa*</Label>
        <Textarea
          id="dsTarefa"
          placeholder="It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout."
          value={formData.dsTarefa || ''}
          onChange={(e) => updateFormData({ dsTarefa: e.target.value })}
          rows={4}
          className="resize-none"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Exige aprovação especial?
        </Label>
        <div className="flex items-center gap-6 mt-2">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={(formData.flAnaliseGerenteDiretor || '').toUpperCase() === 'G'}
              onCheckedChange={() => updateFormData({ flAnaliseGerenteDiretor: 'G' })}
            />
            <Label className="text-sm font-light cursor-pointer">Gerente</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={(formData.flAnaliseGerenteDiretor || '').toUpperCase() === 'D'}
              onCheckedChange={() => updateFormData({ flAnaliseGerenteDiretor: 'D' })}
            />
            <Label className="text-sm font-light cursor-pointer">Diretor</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={(formData.flAnaliseGerenteDiretor || '').toUpperCase() === 'A'}
              onCheckedChange={() => updateFormData({ flAnaliseGerenteDiretor: 'A' })}
            />
            <Label className="text-sm font-light cursor-pointer">Ambos</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={(formData.flAnaliseGerenteDiretor || '').toUpperCase() === 'N'}
              onCheckedChange={() => updateFormData({ flAnaliseGerenteDiretor: 'N' })}
            />
            <Label className="text-sm font-light cursor-pointer">Não necessita</Label>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Exige manifestação do Gerente do Regulatório?*
        </Label>
        <div className="flex items-center gap-6 mt-2">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={(formData.flExigeCienciaGerenteRegul || '').toUpperCase() === 'S'}
              onCheckedChange={() => updateFormData({ flExigeCienciaGerenteRegul: 'S' })}
            />
            <Label className="text-sm font-light cursor-pointer">Sim</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={(formData.flExigeCienciaGerenteRegul || '').toUpperCase() === 'N'}
              onCheckedChange={() => updateFormData({ flExigeCienciaGerenteRegul: 'N' })}
            />
            <Label className="text-sm font-light cursor-pointer">Não, apenas ciência</Label>
          </div>
        </div>
      </div>
    
      <div className="space-y-2">
        <Label htmlFor="dsObservacao">Observações*</Label>
        <Textarea
          id="dsObservacao"
          value={formData.dsObservacao || ''}
          onChange={(e) => updateFormData({ dsObservacao: e.target.value })}
          rows={4}
          className="resize-none"
        />
      </div>
    </div>
  );
}