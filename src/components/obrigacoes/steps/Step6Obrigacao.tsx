'use client';

import { ObrigacaoFormData } from '../ObrigacaoModal';
import { StatusObrigacao, statusObrigacaoLabels, statusObrigacaoList } from '@/api/status-obrigacao/types';
import { AnexoResponse, TipoObjetoAnexo } from '@/api/anexos/type';
import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import obrigacaoClient from '@/api/obrigacao/client';
import anexosClient from '@/api/anexos/client';
import { base64ToUint8Array, saveBlob } from '@/utils/utils';
import AnexoList from '@/components/AnexoComponotent/AnexoList/AnexoList';
import { ObrigacaoResponse } from '@/api/obrigacao/types';
import { TipoEnum } from '@/api/tipos/types';
import { AreaSolicitacao } from '@/api/solicitacoes/types';
import areasClient from '@/api/areas/client';

interface Step6ObrigacaoProps {
  formData: ObrigacaoFormData;
  updateFormData?: (data: Partial<ObrigacaoFormData>) => void;
}

export function Step6Obrigacao({ formData }: Step6ObrigacaoProps) {

  const [anexosBackend, setAnexosBackend] = useState<AnexoResponse[]>([]);
  const [obrigacaoDetalhe, setObrigacaoDetalhe] = useState<ObrigacaoResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [areaAtribuidaInfo, setAreaAtribuidaInfo] = useState<{ responsavelNome: string; cargoNome: string } | null>(null);
  const [areasCondicionantesInfo, setAreasCondicionantesInfo] = useState<Record<number, { responsavelNome: string; cargoNome: string }>>({});

  useEffect(() => {
    const carregarDetalhe = async () => {
      if (!formData?.idSolicitacao) {
        return;
      }

      try {
        setLoading(true);
        const detalhe = await obrigacaoClient.buscarDetalhePorId(formData.idSolicitacao);
        setObrigacaoDetalhe(detalhe.obrigacao);
        setAnexosBackend(detalhe.anexos);

        if (detalhe.obrigacao.areas && detalhe.obrigacao.areas.length > 0) {
          await carregarInfosResponsaveis(detalhe.obrigacao.areas);
        }
      } catch (error) {
        console.error('Erro ao carregar detalhe da obrigação:', error);
      } finally {
        setLoading(false);
      }
    };

    carregarDetalhe();
  }, [formData?.idSolicitacao]);

  const removerPrefixoArea = (nome: string): string => {
    return nome
      .replace(/^Área de\s+/i, '')
      .replace(/^Área\s+/i, '')
      .trim();
  };

  const carregarInfosResponsaveis = async (areas: AreaSolicitacao[]) => {
    try {
      const areasExecutor = await areasClient.buscarPorExecutorAvancado();
      
      const areaAtribuida = areas.find(a => a.tipoArea?.cdTipo === TipoEnum.ATRIBUIDA);
      if (areaAtribuida) {
        const areaExecutorInfo = areasExecutor.find(a => a.idArea === areaAtribuida.idArea);
        if (areaExecutorInfo) {
          setAreaAtribuidaInfo({
            responsavelNome: areaExecutorInfo.nmResponsavel || '',
            cargoNome: areaExecutorInfo.nmCargos || ''
          });
        }
      }

      const areasCondicionantesIds = areas
        .filter(a => a.tipoArea?.cdTipo === TipoEnum.CONDICIONANTE)
        .map(a => a.idArea);
      
      const condicionantesInfo: Record<number, { responsavelNome: string; cargoNome: string }> = {};
      areasCondicionantesIds.forEach(idArea => {
        const areaExecutorInfo = areasExecutor.find(a => a.idArea === idArea);
        if (areaExecutorInfo) {
          condicionantesInfo[idArea] = {
            responsavelNome: areaExecutorInfo.nmResponsavel || '',
            cargoNome: areaExecutorInfo.nmCargos || ''
          };
        }
      });
      setAreasCondicionantesInfo(condicionantesInfo);
    } catch (error) {
      console.error('Erro ao carregar informações de responsáveis:', error);
    }
  };

  const areaAtribuida = obrigacaoDetalhe?.areas?.find((a: AreaSolicitacao) => a.tipoArea?.cdTipo === TipoEnum.ATRIBUIDA);
  const areasCondicionantes = obrigacaoDetalhe?.areas?.filter((a: AreaSolicitacao) => a.tipoArea?.cdTipo === TipoEnum.CONDICIONANTE) || [];

  const getStatusLabel = () => {
    if (obrigacaoDetalhe?.statusSolicitacao) {
      return obrigacaoDetalhe.statusSolicitacao.nmStatus || 'Não informado';
    }
    const current = statusObrigacaoList.find((s) => s.id === formData?.idStatusSolicitacao);
    return current ? statusObrigacaoLabels[current.nmStatus as StatusObrigacao] : 'Não Iniciado';
  };

  const formatDate = (date: string | null | undefined) => {
    if (!date) return 'Não informado';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const handleDownloadAnexoBackend = async (anexo: { idObjeto?: number; nmArquivo?: string }) => {
    try {
      if (!anexo.idObjeto || !anexo.nmArquivo) {
        console.error('Dados do anexo incompletos');
        return;
      }

      const arquivos = await anexosClient.download(
        anexo.idObjeto,
        TipoObjetoAnexo.O,
        anexo.nmArquivo
      );

      if (arquivos.length > 0) {
        arquivos.forEach((arquivo) => {
          const bytes = base64ToUint8Array(arquivo.conteudoArquivo);
          const filename = arquivo.nomeArquivo || anexo.nmArquivo || 'documento';
          const mime = arquivo.tipoConteudo || 'application/octet-stream';
          saveBlob(bytes, mime, filename);
        });
      }
    } catch (error) {
      console.error('Erro ao baixar anexo:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-sm font-semibold text-gray-700">Código Identificador</Label>
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm mt-2">
          {obrigacaoDetalhe?.cdIdentificacao || formData?.cdIdentificador || 'Não informado'}
        </div>
      </div>

      <div>
        <Label className="text-sm font-semibold text-gray-700">Tarefa</Label>
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm mt-2">
          {obrigacaoDetalhe?.dsTarefa || formData?.dsTarefa || 'Não informado'}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-semibold text-gray-700">Status</Label>
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm mt-2">
            {getStatusLabel()}
          </div>
        </div>
        <div>
          <Label className="text-sm font-semibold text-gray-700">Classificação</Label>
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm mt-2">
            {obrigacaoDetalhe?.tipoClassificacao?.dsTipo || 'Não informado'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label className="text-sm font-semibold text-gray-700">Periodicidade</Label>
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm mt-2">
            {obrigacaoDetalhe?.tipoPeriodicidade?.dsTipo || 'Não informado'}
          </div>
        </div>
        <div>
          <Label className="text-sm font-semibold text-gray-700">Criticidade</Label>
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm mt-2">
            {obrigacaoDetalhe?.tipoCriticidade?.dsTipo || 'Não informado'}
          </div>
        </div>
        <div>
          <Label className="text-sm font-semibold text-gray-700">Natureza</Label>
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm mt-2">
            {obrigacaoDetalhe?.tipoNatureza?.dsTipo || 'Não informado'}
          </div>
        </div>
      </div>

      <div>
        <Label className="text-sm font-semibold text-gray-700">Observações</Label>
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm mt-2 whitespace-pre-wrap">
          {obrigacaoDetalhe?.dsObservacao || formData?.dsObservacao || 'Não informado'}
        </div>
      </div>

      <div className="border-t pt-4">
        <Label className="text-sm font-semibold text-gray-700">Tema</Label>
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm mt-2">
          {obrigacaoDetalhe?.tema?.nmTema || 'Não informado'}
        </div>
      </div>

      {areaAtribuida && (
        <div className="border-t pt-4">
          <Label className="text-sm font-semibold text-gray-700">Área Atribuída</Label>
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm mt-2">
            <div className="flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm">
              <div className="flex flex-col">
                <span className="font-medium text-gray-900">
                  {removerPrefixoArea(areaAtribuida.nmArea || areaAtribuida.dsArea || '').toUpperCase()}
                </span>
              </div>
              {areaAtribuidaInfo && (
                <div className="text-right">
                  <span className="text-sm font-medium text-blue-600">
                    {areaAtribuidaInfo.responsavelNome || 'Responsável não informado'}
                  </span>
                  <div className="text-xs text-gray-500">
                    {areaAtribuidaInfo.cargoNome || 'Cargo não informado'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="border-t pt-4">
        <Label className="text-sm font-semibold text-gray-700">Áreas Condicionantes</Label>
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm mt-2">
          <div className="space-y-3">
            {areasCondicionantes.map((area, index) => {
              const info = areasCondicionantesInfo[area.idArea];
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">
                      {removerPrefixoArea(area.nmArea || area.dsArea || '').toUpperCase()}
                    </span>
                  </div>
                  {info && (
                    <div className="text-right">
                      <span className="text-sm font-medium text-blue-600">
                        {info.responsavelNome || 'Responsável não informado'}
                      </span>
                      <div className="text-xs text-gray-500">
                        {info.cargoNome || 'Cargo não informado'}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {areasCondicionantes.length === 0 && (
              <p className="text-gray-500">Nenhuma área selecionada</p>
            )}
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="grid grid-cols-4 gap-4">
        <div>
          <Label className="text-sm font-semibold text-gray-700">Data de Início</Label>
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm mt-2">
          {formatDate(obrigacaoDetalhe?.dtInicio || formData?.dtInicio)}
          </div>
        </div>
        <div>
          <Label className="text-sm font-semibold text-gray-700">Data de Término</Label>
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm mt-2">
            {formatDate(obrigacaoDetalhe?.dtTermino || formData?.dtTermino)}
          </div>
        </div>
        <div>
          <Label className="text-sm font-semibold text-gray-700">Data Limite</Label>
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm mt-2">
            {formatDate(obrigacaoDetalhe?.dtLimite || formData?.dtLimite)}
          </div>
          </div>
        <div>
          <Label className="text-sm font-semibold text-gray-700">Duração (Dias)</Label>
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm mt-2">
            {(obrigacaoDetalhe?.nrDuracaoDias ?? formData?.nrDuracaoDias) ? `${obrigacaoDetalhe?.nrDuracaoDias ?? formData?.nrDuracaoDias} dias` : 'Não informado'}
          </div>
        </div>
      </div>
       
      </div>

      <div className="border-t pt-4">
        <div className="grid grid-cols-3 gap-4 mt-2">
          <div>
            <span className="text-sm font-semibold text-gray-700">ANTT</span>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm">
              {obrigacaoDetalhe?.dsAntt || formData?.dsAntt || 'Não informado'}
            </div>
          </div>
          <div>
            <span className="text-sm font-semibold text-gray-700">Outras Informações</span>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm">
              {obrigacaoDetalhe?.dsProtocoloExterno || formData?.dsProtocoloExterno || 'Não informado'}
            </div>
          </div>
          <div>
            <span className="text-sm font-semibold text-gray-700">TAC</span>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm">
              {obrigacaoDetalhe?.dsTac || formData?.dsTac || 'Não informado'}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-2">
        <div className="border-t pt-4">
          <Label className="text-sm font-semibold text-gray-700">Vínculo com Correspondência</Label>
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm mt-2">
            {obrigacaoDetalhe?.correspondencia 
              ? `${obrigacaoDetalhe.correspondencia.cdIdentificacao}`
              : 'Não informado'}
          </div>
        </div>

        <div className="border-t pt-4">
          <Label className="text-sm font-semibold text-gray-700">Obrigação recusada pelo Verificador ou ANTT</Label>
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm mt-2">
            {obrigacaoDetalhe?.obrigacaoRecusada
              ? `${obrigacaoDetalhe.obrigacaoRecusada.cdIdentificacao}`
              : 'Não informado'}
          </div>
        </div>
        

        <div className="border-t pt-4">
          <Label className="text-sm font-semibold text-gray-700">Obrigação Principal</Label>
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm mt-2">
            {obrigacaoDetalhe?.obrigacaoPrincipal
              ? `${obrigacaoDetalhe.obrigacaoPrincipal.cdIdentificacao}`
              : 'Não informado'}
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <Label className="text-sm font-semibold text-gray-700">Anexos ({anexosBackend.length})</Label>
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm mt-2">
          {loading ? (
            <p className="text-gray-500">Carregando anexos...</p>
          ) : anexosBackend.length > 0 ? (
            <AnexoList
              anexos={anexosBackend.map(a => ({
                idAnexo: a.idAnexo,
                idObjeto: a.idObjeto,
                name: a.nmArquivo,
                nmArquivo: a.nmArquivo,
                dsCaminho: a.dsCaminho,
                tpObjeto: a.tpObjeto,
                size: 0
              }))}
              onRemove={undefined}
              onDownload={handleDownloadAnexoBackend}
            />
          ) : (
            <p className="text-gray-500">Nenhum anexo adicionado</p>
          )}
        </div>
      </div>
    
    </div>
  );
}