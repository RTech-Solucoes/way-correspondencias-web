'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ObrigacaoFormData } from '../ObrigacaoModal';
import { SolicitacaoBuscaSimpleResponse } from '@/api/solicitacoes/types';
import tiposClient from '@/api/tipos/client';
import { TipoResponse, CategoriaEnum, TipoEnum } from '@/api/tipos/types';
import { useEffect, useState } from 'react';
import { solicitacoesClient } from '@/api/solicitacoes';
import statusSolicitacaoClient, { StatusSolicitacaoResponse } from '@/api/status-solicitacao/client';

interface Step1ObrigacaoProps {
  formData: ObrigacaoFormData;
  updateFormData: (data: Partial<ObrigacaoFormData>) => void;
  statusOptions?: StatusSolicitacaoResponse[];
  disabled?: boolean;
}

export function Step1Obrigacao({
  formData,
  updateFormData,
  statusOptions = [],
  disabled = false,
}: Step1ObrigacaoProps) {

    const [buscaObrigacao, setBuscaObrigacao] = useState<string>('');
    const [resultadoObrigacoes, setResultadoObrigacoes] = useState<SolicitacaoBuscaSimpleResponse[]>([]);
    
    const [tipoClassificacaoCondicionada, setTipoClassificacaoCondicionada] = useState<number | null>(null);
    const isCondicionada = formData.idTipoClassificacao === tipoClassificacaoCondicionada;
    
    const [classificacoes, setClassificacoes] = useState<TipoResponse[]>([]);
    const [criticidades, setCriticidades] = useState<TipoResponse[]>([]);
    const [naturezas, setNaturezas] = useState<TipoResponse[]>([]);
    const [loadingTipos, setLoadingTipos] = useState<boolean>(false);
    const [statuses, setStatuses] = useState<StatusSolicitacaoResponse[]>(statusOptions);
    const [loadingStatuses, setLoadingStatuses] = useState<boolean>(false);

    useEffect(() => {
      if (statusOptions.length > 0) {
        setStatuses(statusOptions);
      }
    }, [statusOptions]);

    useEffect(() => {
      if (statusOptions.length > 0) {
        return;
      }

      let cancelado = false;
      const carregarStatuses = async () => {
        setLoadingStatuses(true);
        try {
          const response = await statusSolicitacaoClient.listarTodos(
            CategoriaEnum.CLASSIFICACAO_STATUS_SOLICITACAO,
            [TipoEnum.TODOS, TipoEnum.OBRIGACAO],
          );
          if (!cancelado) {
            setStatuses(response);
          }
        } catch (error) {
          console.error('Erro ao carregar status da obrigação:', error);
        } finally {
          if (!cancelado) {
            setLoadingStatuses(false);
          }
        }
      };

      carregarStatuses();

      return () => {
        cancelado = true;
      };
    }, [statusOptions.length]);

    useEffect(() => {
        const carregarTipos = async () => {
            setLoadingTipos(true);
            try {
                const tipos = await tiposClient.buscarPorCategorias([
                    CategoriaEnum.OBRIG_CLASSIFICACAO,
                    CategoriaEnum.OBRIG_CRITICIDADE,
                    CategoriaEnum.OBRIG_NATUREZA
                ]);
                
                const classif = tipos.filter(t => t.nmCategoria === CategoriaEnum.OBRIG_CLASSIFICACAO);
                setClassificacoes(classif);
                
                const condicionada = classif.find(t => t.cdTipo === TipoEnum.CONDICIONADA);
                if (condicionada) {
                    setTipoClassificacaoCondicionada(condicionada.idTipo);
                }
                
                setCriticidades(tipos.filter(t => t.nmCategoria === CategoriaEnum.OBRIG_CRITICIDADE));
                setNaturezas(tipos.filter(t => t.nmCategoria === CategoriaEnum.OBRIG_NATUREZA));
            } catch (error) {
                console.error('Erro ao carregar tipos:', error);
            } finally {
                setLoadingTipos(false);
            }
        };
        
        carregarTipos();
    }, []);

    useEffect(() => {
      if (!isCondicionada) return;
      let cancelado = false;
      const carregar = async () => {
        const termo = (buscaObrigacao || '').trim();
        const resp = await solicitacoesClient.buscarSimplesPorFiltro(
            termo,
            TipoEnum.OBRIGACAO,
            TipoEnum.PRINCIPAL
        );
        console.log(resp);
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
                    disabled={disabled}
                />
            </div>
        </div>

        <div className="flex flex-row w-full gap-4">
            <div className="space-y-2 w-full">
                <Label htmlFor="idStatusSolicitacao">Status*</Label>
                <Select
                    value={formData.idStatusSolicitacao?.toString() || ''}
                    onValueChange={(value) => {
                      updateFormData({ idStatusSolicitacao: parseInt(value, 10) });
                    }}
                    disabled={disabled || true}
                >
                  <SelectTrigger id="idStatusSolicitacao">
                    <SelectValue placeholder={loadingStatuses ? 'Carregando...' : 'Selecione'} />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status.idStatusSolicitacao} value={status.idStatusSolicitacao.toString()}>
                        {status.nmStatus}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
            </div>

            <div className="space-y-2 w-full">
                <Label htmlFor="idTipoClassificacao">Classificação*</Label>
                <Select
                    value={formData.idTipoClassificacao?.toString() || ''}
                    onValueChange={(value) => {
                        updateFormData({ 
                            idTipoClassificacao: parseInt(value)
                        });
                    }}
                    disabled={disabled || loadingTipos}
                >
                <SelectTrigger id="idTipoClassificacao">
                <SelectValue placeholder={loadingTipos ? 'Carregando...' : 'Selecione'} />
                </SelectTrigger>
                <SelectContent>
                {classificacoes.map((tipo) => (
                    <SelectItem key={tipo.idTipo} value={tipo.idTipo.toString()}>
                    {tipo.dsTipo}
                    </SelectItem>
                ))}
                </SelectContent>
                </Select>
            </div>   

            {isCondicionada && (
                <div className="space-y-2 w-full">
                  <>
                    <Label htmlFor="idObrigacaoPrincipal">Obrigação Principal</Label>
                    <Select
                      value={formData.idObrigacaoPrincipal?.toString() || 'none'}
                      onValueChange={(value) => updateFormData({ 
                          idObrigacaoPrincipal: value === 'none' ? null : parseInt(value)
                      })}
                      disabled={disabled}
                    >
                      <SelectTrigger id="idObrigacaoPrincipal">
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
                            disabled={disabled}
                          />
                            </div>
                        <SelectItem value="none">
                            Nenhuma
                        </SelectItem>
                        {resultadoObrigacoes.map((o) => (
                          <SelectItem key={o.idSolicitacao} value={o.idSolicitacao.toString()}>
                            {o.cdIdentificacao}
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

        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="idTipoCriticidade">Criticidade*</Label>
                <Select
                    value={formData.idTipoCriticidade?.toString() || ''}
                    onValueChange={(value) => {
                        updateFormData({ 
                            idTipoCriticidade: parseInt(value)
                        });
                    }}
                    disabled={disabled || loadingTipos}
                >
                    <SelectTrigger id="idTipoCriticidade">
                        <SelectValue placeholder={loadingTipos ? 'Carregando...' : 'Selecione'} />
                    </SelectTrigger>
                    <SelectContent>
                        {criticidades.map((tipo) => (
                            <SelectItem key={tipo.idTipo} value={tipo.idTipo.toString()}>
                                {tipo.dsTipo}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="idTipoNatureza">Natureza*</Label>
                <Select
                    value={formData.idTipoNatureza?.toString() || ''}
                    onValueChange={(value) => {
                        updateFormData({ 
                            idTipoNatureza: parseInt(value)
                        });
                    }}
                    disabled={disabled || loadingTipos}
                >
                <SelectTrigger id="idTipoNatureza">
                <SelectValue placeholder={loadingTipos ? 'Carregando...' : 'Selecione'} />
                </SelectTrigger>
                <SelectContent>
                {naturezas.map((tipo) => (
                    <SelectItem key={tipo.idTipo} value={tipo.idTipo.toString()}>
                    {tipo.dsTipo}
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
                disabled={disabled}
            />
        </div>
    </div>
  );
}

