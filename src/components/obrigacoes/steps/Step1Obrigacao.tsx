'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ObrigacaoFormData } from '../ObrigacaoModal';
import { 
  classificacaoList, 
  ClassificacaoEnum,
  PeriodicidadeEnum,
  CriticidadeEnum,
  NaturezaEnum,
  naturezaList,
  criticidadeList,
  periodicidadeList
} from '@/api/obrigacao-contratual/enums';
import { statusObrigacaoList, statusObrigacaoLabels, StatusObrigacao } from '@/api/status-obrigacao/types';
import obrigacaoContratualClient from '@/api/obrigacao-contratual/client';
import { ObrigacaoBuscaSimpleResponse } from '@/api/obrigacao-contratual/types';
import { useEffect, useState } from 'react';

interface Step1ObrigacaoProps {
  formData: ObrigacaoFormData;
  updateFormData: (data: Partial<ObrigacaoFormData>) => void;
  isEditing?: boolean;
}

export function Step1Obrigacao({ formData, updateFormData }: Step1ObrigacaoProps) {

    const currentStatusId = formData.idStatusObrigacao || 1;
    const currentStatus = statusObrigacaoList.find(status => status.id === currentStatusId);
    const statusLabel = currentStatus ? statusObrigacaoLabels[currentStatus.nmStatus as StatusObrigacao] : 'Não Iniciado';
    const [buscaObrigacao, setBuscaObrigacao] = useState<string>('');
    const [resultadoObrigacoes, setResultadoObrigacoes] = useState<ObrigacaoBuscaSimpleResponse[]>([]);
    const isCondicionada = formData.tpClassificacao === ClassificacaoEnum.CONDICIONADA;

    useEffect(() => {
      if (!isCondicionada) return;
      let cancelado = false;
      const carregar = async () => {
        const termo = (buscaObrigacao || '').trim();
        const resp = await obrigacaoContratualClient.buscarSimplesPorFiltro(termo, ClassificacaoEnum.PRINCIPAL);
        if (!cancelado) setResultadoObrigacoes(resp || []);
      };
      const t = setTimeout(carregar, 1000);
      return () => { cancelado = true; clearTimeout(t); };
    }, [buscaObrigacao, isCondicionada]);
    
    return (
      <div className="space-y-6 ">
        <div className="flex column gap-4">
            <div className="flex flex-col space-y-4" style={{ width: '100%' }}>
            <Label htmlFor="dsTarefa">Tarefa*</Label>
                <Textarea
                    id="dsTarefa"
                    placeholder="Digite a tarefa"
                    value={formData.dsTarefa || ''}
                    onChange={(e) => updateFormData({ dsTarefa: e.target.value })}
                    required
                    rows={4}
                    className="resize-none"
                />
            </div>
        </div>

        <div className="flex flex-row w-full gap-4">
            <div className="space-y-2 w-full">
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

            <div className="space-y-2 w-full">
                <Label htmlFor="tpClassificacao">Classificação da Obrigação*</Label>
                <Select
                    value={formData.tpClassificacao || ''}
                    onValueChange={(value) => updateFormData({ tpClassificacao: value as ClassificacaoEnum })}
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

            {isCondicionada && (
                <div className="space-y-2 w-full">
                  <>
                    <Label htmlFor="idObrigacaoContratualPai">Obrigação Principal</Label>
                    <Select
                      value={formData.idObrigacaoContratualPai?.toString() || ''}
                      onValueChange={(value) => updateFormData({ idObrigacaoContratualPai: parseInt(value) })}
                    >
                      <SelectTrigger id="idObrigacaoContratualPai">
                        <SelectValue placeholder="Buscar e selecionar a obrigação principal" />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="p-2 border-b">
                          <Input
                            value={buscaObrigacao}
                            onChange={(e) => setBuscaObrigacao(e.target.value)}
                            placeholder="Pesquisar por código..."
                            autoFocus
                            onKeyDown={(e) => e.stopPropagation()}
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                          />
                        </div>
                        {resultadoObrigacoes.map((o) => (
                          <SelectItem key={o.idObrigacaoContratual} value={o.idObrigacaoContratual.toString()}>
                            {o.cdIdentificador}
                          </SelectItem>
                        ))}
                        {resultadoObrigacoes.length === 0 && (
                          <div className="px-3 py-2 text-xs text-gray-500">Nenhum resultado</div>
                        )}
                      </SelectContent>
                    </Select>
                  </>
                </div>
            )}

        </div>

        <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
                <Label htmlFor="tpPeriodicidade">Periódica*</Label>
                <Select
                    value={formData.tpPeriodicidade || ''}
                    onValueChange={(value) => updateFormData({ tpPeriodicidade: value as PeriodicidadeEnum })}
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
                    onValueChange={(value) => updateFormData({ tpCriticidade: value as CriticidadeEnum })}
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
                    onValueChange={(value) => updateFormData({ tpNatureza: value as NaturezaEnum })}
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
            <Label htmlFor="dsComentario">Observações</Label>
            <Textarea
                id="dsComentario"
                placeholder="Digite observações sobre a obrigação..."
                value={formData.dsObservacao || ''}
                onChange={(e) => updateFormData({ dsObservacao: e.target.value })}
                rows={6}
                className="resize-none"
            />
        </div>
    </div>
  );
}

