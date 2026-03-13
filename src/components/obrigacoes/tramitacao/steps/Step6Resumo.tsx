'use client';

import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { TramitacaoFormData } from '../TramitacaoObrigacaoModal';
import obrigacaoClient from '@/api/obrigacao/client';
import areasClient from '@/api/areas/client';
import responsaveisClient from '@/api/responsaveis/client';
import { ObrigacaoResponse } from '@/api/obrigacao/types';
import { AreaSolicitacao, SolicitacaoAssinanteResponse, SolicitacaoPrazoResponse } from '@/api/solicitacoes/types';
import { ResponsavelResponse } from '@/api/responsaveis/types';
import { STATUS_LIST } from '@/api/status-solicitacao/types';
import { AnexoResponse, TipoDocumentoAnexoEnum, TipoObjetoAnexoEnum } from '@/api/anexos/type';
import { TipoEnum } from '@/api/tipos/types';
import AnexoList from '@/components/AnexoComponotent/AnexoList/AnexoList';
import anexosClient from '@/api/anexos/client';
import { base64ToUint8Array, saveBlob, hoursToDaysAndHours } from '@/utils/utils';

interface Step6ResumoProps {
  formData: TramitacaoFormData;
  obrigacaoId?: number | null;
}

const getManifestacaoLabel = (value?: string) => {
  switch ((value || '').toUpperCase()) {
    case 'S':
      return 'Sim';
    case 'N':
      return 'Não, apenas ciência';
    default:
      return '—';
  }
};

function horasParaDias(horas: number): number {
  return Math.floor(horas / 24);
}

export function Step6Resumo({ formData, obrigacaoId }: Step6ResumoProps) {
  const [obrigacaoDetalhe, setObrigacaoDetalhe] = useState<ObrigacaoResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [areaAtribuidaInfo, setAreaAtribuidaInfo] = useState<{ responsavelNome: string; cargoNome: string } | null>(null);
  const [areasCondicionantesInfo, setAreasCondicionantesInfo] = useState<Record<number, { responsavelNome: string; cargoNome: string }>>({});
  const [responsaveisInfo, setResponsaveisInfo] = useState<Record<number, ResponsavelResponse>>({});
  const [anexos, setAnexos] = useState<AnexoResponse[]>([]);
  const [assinantesDetalhe, setAssinantesDetalhe] = useState<SolicitacaoAssinanteResponse[]>([]);
  const [statusPrazosDetalhe, setStatusPrazosDetalhe] = useState<SolicitacaoPrazoResponse[]>([]);

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

  useEffect(() => {
    const carregarDetalhe = async () => {
      if (!obrigacaoId) return;

      try {
        setLoading(true);
        const detalhe = await obrigacaoClient.buscarDetalhePorId(obrigacaoId);
        setObrigacaoDetalhe(detalhe.obrigacao);
        
        const anexosTipoC = detalhe.anexos?.filter(
          anexo => anexo.tpDocumento === TipoDocumentoAnexoEnum.C
        ) || [];
        setAnexos(anexosTipoC);

        if (detalhe.obrigacao.areas && detalhe.obrigacao.areas.length > 0) {
          await carregarInfosResponsaveis(detalhe.obrigacao.areas);
        }

        const assinantesParaCarregar = detalhe.obrigacao.solicitacoesAssinantes || detalhe.solicitacoesAssinantes || [];

        setAssinantesDetalhe(assinantesParaCarregar);
        
        if (assinantesParaCarregar.length > 0) {
          const responsaveisIds = assinantesParaCarregar.map(a => a.idResponsavel);
          const responsaveisPromises = responsaveisIds.map(id => 
            responsaveisClient.buscarPorId(id).catch(() => null)
          );
          const responsaveisResults = await Promise.all(responsaveisPromises);
          const responsaveisMap: Record<number, ResponsavelResponse> = {};
          responsaveisResults.forEach((resp, index) => {
            if (resp) {
              responsaveisMap[responsaveisIds[index]] = resp;
            }
          });
          setResponsaveisInfo(responsaveisMap);
        }

        const prazosParaCarregar = detalhe.obrigacao.solicitacaoPrazos || detalhe.solicitacaoPrazos || [];
        setStatusPrazosDetalhe(prazosParaCarregar);
      } catch (error) {
        console.error('Erro ao carregar detalhe da obrigação:', error);
      } finally {
        setLoading(false);
      }
    };

    carregarDetalhe();
  }, [obrigacaoId]);

  const getStatusLabel = (idStatus: number): string => {
    const status = STATUS_LIST.find(s => s.id === idStatus);
    return status?.label || '—';
  };

  const areaAtribuida = obrigacaoDetalhe?.areas?.find((a: AreaSolicitacao) => a.tipoArea?.cdTipo === TipoEnum.ATRIBUIDA);
  const areasCondicionantes = obrigacaoDetalhe?.areas?.filter((a: AreaSolicitacao) => a.tipoArea?.cdTipo === TipoEnum.CONDICIONANTE) || [];
  const assinantes = obrigacaoDetalhe?.solicitacoesAssinantes || assinantesDetalhe || [];
  const statusPrazos = obrigacaoDetalhe?.solicitacaoPrazos || statusPrazosDetalhe || [];
  const prazoExcepcional = obrigacaoDetalhe?.flExcepcional === 'S';

  const currentPrazoTotal = statusPrazos.reduce((acc, curr) => acc + (curr.nrPrazoInterno || 0), 0);
  const prazoPrincipalDias = currentPrazoTotal > 0 
    ? (prazoExcepcional ? currentPrazoTotal : horasParaDias(currentPrazoTotal))
    : (formData.nrPrazo ? horasParaDias(formData.nrPrazo) : 0);

  const handleDownloadAnexoBackend = async (anexo: { idObjeto?: number; nmArquivo?: string }) => {
    try {
      if (!anexo.idObjeto || !anexo.nmArquivo) {
        console.error('Dados do anexo incompletos');
        return;
      }

      const arquivos = await anexosClient.download(
        anexo.idObjeto,
        TipoObjetoAnexoEnum.O,
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

  if (loading) {
    return <div className="flex items-center justify-center p-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label className="text-sm font-semibold text-gray-700">ID</Label>
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm mt-2">
            {formData.cdIdentificacao || 'Não informado'}
          </div>
        </div>
      </div>

      <div>
        <Label className="text-sm font-semibold text-gray-700">Tarefa</Label>
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm mt-2 whitespace-pre-wrap">
          {formData.dsTarefa || 'Não informado'}
        </div>
      </div>

      <div>
        <Label className="text-sm font-semibold text-gray-700">Observações</Label>
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm mt-2 whitespace-pre-wrap">
          {formData.dsObservacao || 'Não informado'}
        </div>
      </div>

      {areaAtribuida && (
        <div className="border-t pt-4">
          <Label className="text-sm font-semibold text-gray-700">Área Atribuída</Label>
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm mt-2">
            <div className="flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm">
              <div className="flex flex-col">
                <span className="font-medium text-gray-900">
                  {(areaAtribuida.nmArea).toUpperCase()}
                </span>
                {areaAtribuida.cdArea && (
                  <span className="text-xs text-gray-500">{areaAtribuida.cdArea}</span>
                )}
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
                      {(area.nmArea || area.dsArea || '').toUpperCase()}
                    </span>
                    {area.cdArea && (
                      <span className="text-xs text-gray-500">{area.cdArea}</span>
                    )}
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
        <Label className="text-sm font-semibold text-gray-700">Validadores e assinantes</Label>
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm mt-2">
          {assinantes && assinantes.length > 0 ? (
            <div className="space-y-3">
              {assinantes.map((assinante, index) => {
                const responsavel = responsaveisInfo[assinante.idResponsavel];
                const key = assinante.idSolicitacaoAssinantem || `assinante-${assinante.idResponsavel}-${index}`;
                return responsavel ? (
                  <div key={key} className="flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">{responsavel.nmResponsavel}</span>
                      <span className="text-xs text-gray-500">{responsavel.nmPerfil}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-blue-600">
                        {responsavel.nmCargo || 'Sem cargo'}
                      </span>
                      {responsavel.dsEmail && (
                        <div className="text-xs text-gray-500">
                          {responsavel.dsEmail}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div key={key} className="flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">Carregando...</span>
                      <span className="text-xs text-gray-500">ID: {assinante.idResponsavel}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500">Nenhum validador/assinante selecionado</p>
          )}
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-semibold text-gray-700">Prazo principal</Label>
            <div className="p-3 bg-gray-50 border border-yellow-200 rounded-lg text-sm mt-2">
              {currentPrazoTotal > 0 ? (
                <>
                  {prazoExcepcional ? `${currentPrazoTotal} horas` : hoursToDaysAndHours(currentPrazoTotal)}
                  {prazoExcepcional && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                      Excepcional
                    </span>
                  )}
                </>
              ) : (
                prazoPrincipalDias > 0 ? `${prazoPrincipalDias} dias` : 'Não informado'
              )}
            </div>
          </div>
          <div>
            <Label className="text-sm font-semibold text-gray-700">Exige manifestação do Gerente Regulatório</Label>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm mt-2">
              {getManifestacaoLabel(formData.flExigeCienciaGerenteRegul)}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <Label className="text-sm font-semibold text-gray-700">Prazos configurados por status</Label>
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm mt-2">
          <div className="space-y-2">
            {statusPrazos.length > 0 ? (
              statusPrazos
                .filter(prazo => prazo.nrPrazoInterno && prazo.nrPrazoInterno > 0)
                .map((prazo) => {
                  const statusLabel = getStatusLabel(prazo.idStatusSolicitacao || 0);
                  const horas = prazo.nrPrazoInterno || 0;
                  
                  return (
                    <div key={prazo.idSolicitacaoPrazo} className="flex justify-between items-center p-2 bg-white border rounded-lg">
                      <span className="font-medium text-gray-900">{statusLabel}</span>
                      <span className="text-gray-600">
                        {prazoExcepcional ? `${horas} horas` : hoursToDaysAndHours(horas)}
                      </span>
                    </div>
                  );
                })
            ) : (
              <p className="text-gray-500">Nenhum prazo configurado</p>
            )}
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <Label className="text-sm font-semibold text-gray-700">Anexos ({anexos.length})</Label>
        <AnexoList anexos={anexos.map(a => ({
          idAnexo: a.idAnexo,
          idObjeto: a.idObjeto,
          name: a.nmArquivo,
          nmArquivo: a.nmArquivo,
          dsCaminho: a.dsCaminho,
          tpObjeto: a.tpObjeto,
        }))}
          onDownload={handleDownloadAnexoBackend}
        />
      </div>
    </div>
  );
}