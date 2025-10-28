'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ObrigacaoFormData } from '../ObrigacaoModal';
import { 
  classificacaoList, 
  Classificacao,
  Periodicidade,
  Criticidade,
  Natureza,
  naturezaList,
  criticidadeList,
  periodicidadeList
} from '@/api/obrigacao-contratual/enums';
import { statusObrigacaoList, statusObrigacaoLabels, StatusObrigacao } from '@/api/status-obrigacao/types';

interface Step1ObrigacaoProps {
  formData: ObrigacaoFormData;
  updateFormData: (data: Partial<ObrigacaoFormData>) => void;
  isEditing?: boolean;
}

export function Step1Obrigacao({ formData, updateFormData }: Step1ObrigacaoProps) {

    const currentStatusId = formData.idStatusObrigacao || 1;
    const currentStatus = statusObrigacaoList.find(status => status.id === currentStatusId);
    const statusLabel = currentStatus ? statusObrigacaoLabels[currentStatus.nmStatus as StatusObrigacao] : 'Não Iniciado';
    
    return (
      <div className="space-y-6 ">
        <div className="flex gap-4">
            <div className="space-y-2" style={{ width: '25%' }}>
                <Label htmlFor="cdIdentificador">
                Identificador* <span className="text-xs text-gray-500">(Código identificador)</span>
                </Label>
                <Input
                    id="cdIdentificador"
                    placeholder="Ex: 040ENG02620001-01"
                    value={formData.cdIdentificador || ''}
                    onChange={(e) => updateFormData({ cdIdentificador: e.target.value })}
                    required
                />
            </div>

            <div className="space-y-2" style={{ width: '75%' }}>
            <Label htmlFor="dsTarefa">Tarefa*</Label>
                <Input
                    id="dsTarefa"
                    placeholder="Digite a tarefa"
                    value={formData.dsTarefa || ''}
                    onChange={(e) => updateFormData({ dsTarefa: e.target.value })}
                    required
                />
            </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
                <Label htmlFor="dsItem">Item*</Label>
                <Input
                    id="dsItem"
                    placeholder="Digite o item"
                    value={formData.dsItem || ''}
                    onChange={(e) => updateFormData({ dsItem: e.target.value })}
                    required
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="idStatusObrigacao">Status*</Label>
                <Select
                    value={currentStatusId.toString()}
                    onValueChange={() => {}}
                    disabled={true}
                    >
                    <SelectTrigger id="idStatusObrigacao" disabled={true}>
                    <SelectValue>{statusLabel}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                    {statusObrigacaoList.map((status) => (
                        <SelectItem key={status.id} value={status.id.toString()}>
                        {statusObrigacaoLabels[status.nmStatus as StatusObrigacao]}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="tpClassificacao">Classificação da Obrigação*</Label>
                <Select
                    value={formData.tpClassificacao || ''}
                    onValueChange={(value) => updateFormData({ tpClassificacao: value as Classificacao })}
                >
                <SelectTrigger id="tpClassificacao">
                <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                {classificacaoList.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                    {item.label}
                    </SelectItem>
                ))}
                </SelectContent>
                </Select>
            </div>     
        </div>

        <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
                <Label htmlFor="tpPeriodicidade">Periódica*</Label>
                <Select
                    value={formData.tpPeriodicidade || ''}
                    onValueChange={(value) => updateFormData({ tpPeriodicidade: value as Periodicidade })}
                >
                    <SelectTrigger id="tpPeriodicidade">
                        <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                        {periodicidadeList.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                                {item.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="tpCriticidade">Criticidade*</Label>
                <Select
                    value={formData.tpCriticidade || ''}
                    onValueChange={(value) => updateFormData({ tpCriticidade: value as Criticidade })}
                >
                    <SelectTrigger id="tpCriticidade">
                        <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                        {criticidadeList.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                                {item.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="tpNatureza">Natureza*</Label>
                <Select
                    value={formData.tpNatureza || ''}
                    onValueChange={(value) => updateFormData({ tpNatureza: value as Natureza })}
                >
                <SelectTrigger id="tpNatureza">
                <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                {naturezaList.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                    {item.label}
                    </SelectItem>
                ))}
                </SelectContent>
                </Select>
            </div>     
        </div>  

        <div className="space-y-2">
            <Label htmlFor="dsComentario">Comentários*</Label>
            <Textarea
            id="dsComentario"
            placeholder="Digite observações e comentários sobre a obrigação..."
            value={formData.dsComentario || ''}
            onChange={(e) => updateFormData({ dsComentario: e.target.value })}
            rows={6}
            className="resize-none"
            />
        </div>
    </div>
  );
}

