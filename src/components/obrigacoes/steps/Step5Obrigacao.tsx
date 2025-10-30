'use client';

import { Label } from '@radix-ui/react-label';
import { ObrigacaoFormData } from '../ObrigacaoModal';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input as ShadInput } from '@/components/ui/input';
import { SolicitacaoBuscaSimpleResponse } from '@/api/solicitacoes/types';
import solicitacoesClient from '@/api/solicitacoes/client';
import { useEffect, useState } from 'react';
import obrigacaoContratualClient from '@/api/obrigacao-contratual/client';
import { ObrigacaoBuscaSimpleResponse } from '@/api/obrigacao-contratual/types';

interface Step5ObrigacaoProps {
  formData?: ObrigacaoFormData;
  updateFormData?: (data: Partial<ObrigacaoFormData>) => void;
}

export function Step5Obrigacao({ formData, updateFormData }: Step5ObrigacaoProps) {

  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoBuscaSimpleResponse[]>([]);
  const [busca, setBusca] = useState<string>('');
  const [carregandoBusca, setCarregandoBusca] = useState<boolean>(false);
  const [buscaObrigacao, setBuscaObrigacao] = useState<string>('');
  const [resultadoObrigacoes, setResultadoObrigacoes] = useState<ObrigacaoBuscaSimpleResponse[]>([]);
  const [carregandoBuscaObrigacao, setCarregandoBuscaObrigacao] = useState<boolean>(false);

  useEffect(() => {
    let isCancelled = false;
    const carregar = async () => {
      try {
        setCarregandoBusca(true);
        const resposta = await solicitacoesClient.buscarSimplesPorFiltro(busca || '');
        if (!isCancelled) setSolicitacoes(resposta || []);
      } finally {
        if (!isCancelled) setCarregandoBusca(false);
      }
    };
    const t = setTimeout(carregar, 1000);
    return () => {
      isCancelled = true;
      clearTimeout(t);
    };
  }, [busca]);

  useEffect(() => {
    let cancelado = false;
    const carregar = async () => {
      try {
        setCarregandoBuscaObrigacao(true);
        const termo = (buscaObrigacao || '').trim();
        const resp = await obrigacaoContratualClient.buscarSimplesPorFiltro(termo);
        if (!cancelado) setResultadoObrigacoes(resp || []);
      } finally {
        if (!cancelado) setCarregandoBuscaObrigacao(false);
      }
    };
    const t = setTimeout(carregar, 1000);
    return () => { cancelado = true; clearTimeout(t); };
  }, [buscaObrigacao]);
  

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col space-y-4">
          <Label htmlFor="idSolicitacao">Vincular Correspondência</Label>
          <Select
            value={formData?.idSolicitacao?.toString() || ''}
            onValueChange={(value) => updateFormData?.({ idSolicitacao: parseInt(value) })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <div className="p-2 border-b">
                <ShadInput
                  value={buscaObrigacao}
                  onChange={(e) => setBuscaObrigacao(e.target.value)}
                  placeholder="Pesquisar por código..."
                  autoFocus
                  onKeyDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                />
              </div>
              {carregandoBusca && (
                <div className="px-3 py-2 text-xs text-gray-500">Carregando...</div>
              )}
              {solicitacoes.map((solicitacao) => (
                <SelectItem key={solicitacao.idSolicitacao} value={solicitacao.idSolicitacao.toString()}>
                  {solicitacao.cdIdentificacao}
                </SelectItem>
              ))}
              {(!carregandoBusca && solicitacoes.length === 0) && (
                <div className="px-3 py-2 text-xs text-gray-500">Nenhuma correspondência encontrada</div>
              )}
            </SelectContent>
          </Select>
        </div>
  
        <div className="flex flex-col space-y-4">
          <Label htmlFor="dsAntt">Agência Reguladora</Label>
          <Input
            id="dsAntt"
            placeholder="Digite o ANTT"
            type="text"
            value={formData?.dsAntt || ''}
            onChange={(e) => updateFormData?.({ dsAntt: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col space-y-4">
          <Label htmlFor="dsTac">TAC</Label>
          <Input
            id="dsTac"
            placeholder="Digite o TAC"
            type="text"
            value={formData?.dsTac || ''}
            onChange={(e) => updateFormData?.({ dsTac: e.target.value })}
          />
        </div>

        <div className="flex flex-col space-y-4">
          <Label htmlFor="idObrigacaoContratualRef">Obrigação recusada pelo Verificador ou ANTT</Label>
          <Select
            value={formData?.idObrigacaoContratualVinculo?.toString() || ''}
            onValueChange={(value) => updateFormData?.({ idObrigacaoContratualVinculo: parseInt(value) })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <div className="p-2 border-b">
                <ShadInput
                  value={buscaObrigacao}
                  onChange={(e) => setBuscaObrigacao(e.target.value)}
                  placeholder="Pesquisar por código..."
                  autoFocus
                  onKeyDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                />
              </div>
              {carregandoBuscaObrigacao && (
                <div className="px-3 py-2 text-xs text-gray-500">Carregando...</div>
              )}
              {resultadoObrigacoes.map((obrigacao) => (
                <SelectItem key={obrigacao.idObrigacaoContratual} value={obrigacao.idObrigacaoContratual.toString()}>
                  {obrigacao.cdIdentificador}
                </SelectItem>
              ))}
              {(!carregandoBuscaObrigacao && resultadoObrigacoes.length === 0) && (
                <div className="px-3 py-2 text-xs text-gray-500">Nenhuma correspondência encontrada</div>
              )}
            </SelectContent>
          </Select>
        </div>        
      </div>

      <div className="flex flex-col space-y-4">
        <Label htmlFor="dsProtocoloExterno">Outro Protocolo Externo</Label>
        <Input
          id="dsProtocoloExterno"
          placeholder="Digite o Outro Protocolo Externo"
          type="text"
          value={formData?.dsProtocoloExterno || ''}
          onChange={(e) => updateFormData?.({ dsProtocoloExterno: e.target.value })}
        />
      </div>
    </div>
  );
}

