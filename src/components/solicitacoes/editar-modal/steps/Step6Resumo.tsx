'use client';

import { useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { STATUS_LIST, statusList as statusListType } from '@/api/status-solicitacao/types';
import { getTipoAprovacaoLabel } from '@/api/solicitacoes/types';
import { hoursToDaysAndHours } from '@/utils/utils';
import { DownloadSimpleIcon } from '@phosphor-icons/react';
import { Step6Props } from '../types';

const STATUS_OCULTOS = [
  statusListType.PRE_ANALISE.id,
  statusListType.VENCIDO_REGULATORIO.id,
  statusListType.VENCIDO_AREA_TECNICA.id,
  statusListType.ARQUIVADO.id,
];

function horasParaDias(horas: number): number {
  return Math.floor(horas / 24);
}

export function Step6Resumo({
  formData,
  correspondencia,
  responsaveis,
  getSelectedTema,
  getResponsavelByArea,
  allAreas,
  statusPrazos,
  prazoExcepcional,
  prazosSolicitacaoPorStatus,
  statusList,
  anexos,
  anexosBackend,
  anexosTypeE,
  canListarAnexo,
  currentPrazoTotal,
  onDownloadAnexoBackend,
}: Step6Props) {
  const statusOptions = useMemo(() => {
    const statusFiltrados =
      statusList.length > 0
        ? statusList.map(status => ({
            codigo: status.idStatusSolicitacao,
            nome: status.nmStatus,
          }))
        : STATUS_LIST.map(status => ({
            codigo: status.id,
            nome: status.label,
          }));

    return statusFiltrados.filter(status => !STATUS_OCULTOS.includes(status.codigo));
  }, [statusList]);

  const prazoItems = useMemo(() => {
    return statusOptions
      .map(status => {
        const prazoFromSolicitacao = prazosSolicitacaoPorStatus.find(p => p.idStatusSolicitacao === status.codigo)?.nrPrazoInterno;
        const prazoFromConfig = statusPrazos.find(p => p.idStatusSolicitacao === status.codigo)?.nrPrazoInterno;
        const horas = prazoFromSolicitacao ?? prazoFromConfig ?? 0;
        return { status, horas };
      })
      .filter(item => (item.horas || 0) > 0);
  }, [statusOptions, prazosSolicitacaoPorStatus, statusPrazos]);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo da Solicitação</h3>

      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label className="text-sm font-semibold text-gray-700">Código de Identificação</Label>
            <div className="p-3 bg-gray-50 border rounded-lg text-sm">{formData.cdIdentificacao || 'Não informado'}</div>
          </div>
          <div>
            <Label className="text-sm font-semibold text-gray-700">Nº Ofício</Label>
            <div className="p-3 bg-gray-50 border rounded-lg text-sm">{formData.nrOficio || 'Não informado'}</div>
          </div>
          <div>
            <Label className="text-sm font-semibold text-gray-700">Nº Processo</Label>
            <div className="p-3 bg-gray-50 border rounded-lg text-sm">{formData.nrProcesso || 'Não informado'}</div>
          </div>
        </div>

        <div>
          <Label className="text-sm font-semibold text-gray-700">Assunto</Label>
          <div className="p-3 bg-gray-50 border rounded-lg text-sm">{formData.dsAssunto || 'Não informado'}</div>
        </div>

        <div>
          <Label className="text-sm font-semibold text-gray-700">Observações</Label>
          <div className="p-3 bg-gray-50 border rounded-lg text-sm max-h-24 overflow-y-auto">{formData.dsObservacao || 'Não informado'}</div>
        </div>

        <div>
          <Label className="text-sm font-semibold text-gray-700">Descrição da Solicitação</Label>
          <div className="p-3 bg-gray-50 border rounded-lg text-sm h-fit max-h-72 overflow-y-auto">{formData.dsSolicitacao || 'Não informado'}</div>
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label className="text-sm font-semibold text-gray-700">Tema</Label>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm">
              {getSelectedTema()?.nmTema || correspondencia?.tema?.nmTema || correspondencia?.nmTema || 'Não selecionado'}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <Label className="text-sm font-semibold text-gray-700">Áreas Envolvidas</Label>
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm">
          {formData.idsAreas && formData.idsAreas.length > 0 ? (
            <div className="space-y-3">
              {formData.idsAreas.map(areaId => {
                const area = allAreas.find(a => a.idArea === areaId);
                const responsavelArea = getResponsavelByArea(areaId);
                return area ? (
                  <div key={areaId} className="flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">{area.nmArea}</span>
                      <span className="text-xs text-gray-500">{area.cdArea}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-blue-600">{responsavelArea?.nmResponsavel || 'Sem responsável'}</span>
                      {responsavelArea && <div className="text-xs text-gray-500">{responsavelArea.dsEmail}</div>}
                    </div>
                  </div>
                ) : null;
              })}
            </div>
          ) : (
            'Nenhuma área selecionada'
          )}
        </div>
      </div>

      <div className="border-t pt-4">
        <Label className="text-sm font-semibold text-gray-700">Validadores/Assinantes</Label>
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm">
          {formData.idsResponsaveisAssinates && formData.idsResponsaveisAssinates.length > 0 ? (
            <div className="space-y-3">
              {formData.idsResponsaveisAssinates.map(responsavelId => {
                const responsavel = responsaveis.find(r => r.idResponsavel === responsavelId);
                return responsavel ? (
                  <div key={responsavelId} className="flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">{responsavel?.nmResponsavel}</span>
                      <span className="text-xs text-gray-500">{responsavel?.nmPerfil}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-blue-600">{responsavel?.nmCargo || 'Sem cargo'}</span>
                      {responsavel && <div className="text-xs text-gray-500">{responsavel.dsEmail}</div>}
                    </div>
                  </div>
                ) : null;
              })}
            </div>
          ) : (
            'Nenhum validador/assinante selecionado'
          )}
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label className="text-sm font-semibold text-gray-700">Prazo Principal</Label>
            <div className="p-3 border border-yellow-200 rounded-lg text-sm">
              {hoursToDaysAndHours(currentPrazoTotal)}
              {prazoExcepcional && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">Excepcional</span>
              )}
            </div>
          </div>
          <div>
            <Label className="text-sm font-semibold text-gray-700">Exige aprovação especial</Label>
            <div className="p-3 border rounded-lg text-sm">{getTipoAprovacaoLabel(formData.flAnaliseGerenteDiretor ?? '')}</div>
          </div>
          <div>
            <Label className="text-sm font-semibold text-gray-700">Exige manifestação do Gerente do Regulatório</Label>
            <div className="p-3 border rounded-lg text-sm">
              {formData.flExigeCienciaGerenteRegul === 'S' ? 'Sim' : formData.flExigeCienciaGerenteRegul === 'N' ? 'Não, apenas ciência' : '—'}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <Label className="text-sm font-semibold text-gray-700">Prazos Configurados por Status</Label>
        <div className="mt-2 space-y-2">
          {prazoItems.map(({ status, horas }) => (
            <div key={status.codigo} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
              <span className="font-medium">{status.nome}</span>
              <span className="text-gray-600">{prazoExcepcional ? `${horas} horas` : `${horasParaDias(horas)} dias`}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t pt-4">
        <Label className="text-sm font-semibold text-gray-700">Anexos ({anexos.length + anexosBackend.length + anexosTypeE.length})</Label>
        <div className="mt-2 space-y-2">
          {canListarAnexo && anexos.length > 0 && (
            <div>
              <div className="text-xs text-gray-500 mb-2">Novos anexos a serem enviados:</div>
              {anexos.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 border rounded text-sm">
                  <span className="font-medium">{file.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs">{Math.round(file.size / 1024)} KB</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={e => {
                        e.stopPropagation();
                        const fileURL = URL.createObjectURL(file);
                        const link = document.createElement('a');
                        link.href = fileURL;
                        link.download = file.name;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        URL.revokeObjectURL(fileURL);
                      }}
                      className="h-6 w-6 p-0 hover:bg-gray-200"
                    >
                      <DownloadSimpleIcon size={14} className="text-gray-600" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {canListarAnexo && anexosBackend.length > 0 && (
            <div>
              <div className="text-xs text-gray-500 mb-2">Anexos já salvos:</div>
              <div className="flex flex-col gap-2">
                {anexosBackend.map((anexo, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded text-sm">
                    <span className="font-medium text-gray-800">{anexo.nmArquivo}</span>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={e => {
                          e.stopPropagation();
                          onDownloadAnexoBackend({
                            idAnexo: anexo.idAnexo,
                            idObjeto: anexo.idObjeto,
                            name: anexo.nmArquivo,
                            nmArquivo: anexo.nmArquivo,
                            dsCaminho: anexo.dsCaminho,
                            tpObjeto: anexo.tpObjeto,
                            size: 0,
                          });
                        }}
                        className="h-6 w-6 p-0 hover:bg-gray-200"
                      >
                        <DownloadSimpleIcon size={14} className="text-gray-600" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {canListarAnexo && anexosTypeE.length > 0 && (
            <div>
              <div className="text-xs text-gray-500 mb-2">Anexos do email:</div>
              <div className="flex flex-col gap-2">
                {anexosTypeE.map((anexo, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded text-sm">
                    <span className="font-medium text-gray-800">{anexo.nmArquivo}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(!canListarAnexo || (anexos.length === 0 && anexosBackend.length === 0 && anexosTypeE.length === 0)) && (
            <div className="p-3 bg-gray-50 border rounded-lg text-sm text-gray-500 text-center">
              {!canListarAnexo ? 'Sem permissão para visualizar anexos' : 'Nenhum anexo adicionado'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
