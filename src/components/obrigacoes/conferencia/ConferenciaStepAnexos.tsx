'use client';

import { useState, useMemo } from 'react';
import { TipoDocumentoAnexoEnum, TipoObjetoAnexoEnum, type AnexoResponse } from '@/api/anexos/type';
import { ItemAnexo } from './ItensAnexos';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AnexoObrigacaoModal } from './AnexoObrigacaoModal';
import { TramitacaoComAnexosResponse } from '@/api/solicitacoes/types';

interface ConferenciaStepAnexosProps {
  anexos: AnexoResponse[];
  tramitacoes?: TramitacaoComAnexosResponse[];
  downloadingId: number | null;
  onDownloadAnexo: (anexo: AnexoResponse) => void;
  idObrigacao?: number;
  idPerfil?: number;
  onRefreshAnexos?: () => Promise<void> | void;
  isStatusDesabilitadoParaTramitacao?: boolean;
  isStatusConcluido?: boolean;
}

export function ConferenciaStepAnexos({
  anexos,
  tramitacoes = [],
  downloadingId,
  onDownloadAnexo,
  idObrigacao,
  idPerfil,
  onRefreshAnexos,
  isStatusDesabilitadoParaTramitacao = false,
  isStatusConcluido = false,
}: ConferenciaStepAnexosProps) {
  const [showAnexarModal, setShowAnexarModal] = useState(false);
  const [tipoAnexoModal, setTipoAnexoModal] = useState<TipoDocumentoAnexoEnum>(TipoDocumentoAnexoEnum.E);
  const [activeTab, setActiveTab] = useState('evidencia');

  const anexosPorTipo = useMemo(() => {
    // Agregando anexos de tramitação (mesma lógica do sidebar)
    const anexosPrincipaisTramitacao = (anexos || []).filter((anexo) => 
      anexo.tpObjeto === TipoObjetoAnexoEnum.T || 
      anexo.tpDocumento === TipoDocumentoAnexoEnum.C
    );
    const anexosDasTramitacoes = (tramitacoes || []).flatMap(t => t.anexos || []);
    
    const tramitacaoMap = new Map<number, AnexoResponse>();
    [...anexosPrincipaisTramitacao, ...anexosDasTramitacoes].forEach(a => {
      if (a && a.idAnexo) tramitacaoMap.set(a.idAnexo, a);
    });

    return {
      protocolo: anexos.filter((a) => a.tpDocumento === TipoDocumentoAnexoEnum.P),
      evidencia: anexos.filter((a) => a.tpDocumento === TipoDocumentoAnexoEnum.E || a.tpDocumento === TipoDocumentoAnexoEnum.L),
      correspondencia: anexos.filter((a) => a.tpDocumento === TipoDocumentoAnexoEnum.R),
      tramitacao: Array.from(tramitacaoMap.values()),
      outros: anexos.filter((a) => a.tpDocumento === TipoDocumentoAnexoEnum.A),
    };
  }, [anexos, tramitacoes]);

  const handleAnexarClick = (tipo: TipoDocumentoAnexoEnum) => {
    setTipoAnexoModal(tipo);
    setShowAnexarModal(true);
  };

  const renderListaAnexos = (anexosFiltrados: AnexoResponse[], emptyMsg: string) => (
    <div className="mt-4">
      {anexosFiltrados.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm text-gray-400">{emptyMsg}</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {anexosFiltrados.map((anexo) => (
            <ItemAnexo
              key={anexo.idAnexo}
              anexo={anexo}
              onDownload={onDownloadAnexo}
              downloadingId={downloadingId}
            />
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-4 px-8 py-6 border-b border-gray-100">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Anexos</h2>
          <p className="text-sm text-gray-500">Documentos e arquivos relacionados à obrigação.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
            {anexos.length} {anexos.length === 1 ? 'arquivo' : 'arquivos'}
          </span>
          {activeTab !== 'tramitacao' && (
            <Button
              onClick={() => {
                const map: Record<string, TipoDocumentoAnexoEnum> = {
                  protocolo: TipoDocumentoAnexoEnum.P,
                  evidencia: TipoDocumentoAnexoEnum.E,
                  correspondencia: TipoDocumentoAnexoEnum.R,
                  outros: TipoDocumentoAnexoEnum.A,
                };
                handleAnexarClick(map[activeTab] || TipoDocumentoAnexoEnum.E);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              Anexar Documento
            </Button>
          )}
        </div>
      </div>

      <div className="px-8 py-6">
        <Tabs defaultValue="evidencia" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 h-auto p-1 bg-gray-50 rounded-xl">
            <TabsTrigger value="protocolo" className="rounded-lg py-2">Protocolo</TabsTrigger>
            <TabsTrigger value="evidencia" className="rounded-lg py-2">Evidência</TabsTrigger>
            <TabsTrigger value="correspondencia" className="rounded-lg py-2">Correspondência</TabsTrigger>
            {!isStatusDesabilitadoParaTramitacao && !isStatusConcluido && (
              <TabsTrigger value="tramitacao" className="rounded-lg py-2">Tramitação</TabsTrigger>
            )}
            <TabsTrigger value="outros" className="rounded-lg py-2">Outros</TabsTrigger>
          </TabsList>

          <TabsContent value="protocolo">
            {renderListaAnexos(anexosPorTipo.protocolo, "Nenhum protocolo encontrado.")}
          </TabsContent>
          <TabsContent value="evidencia">
            {renderListaAnexos(anexosPorTipo.evidencia, "Nenhuma evidência de cumprimento encontrada.")}
          </TabsContent>
          <TabsContent value="correspondencia">
            {renderListaAnexos(anexosPorTipo.correspondencia, "Nenhuma correspondência encontrada.")}
          </TabsContent>
          <TabsContent value="tramitacao">
            {renderListaAnexos(anexosPorTipo.tramitacao, "Nenhum anexo de tramitação encontrado.")}
          </TabsContent>
          <TabsContent value="outros">
            {renderListaAnexos(anexosPorTipo.outros, "Nenhum outro arquivo encontrado.")}
          </TabsContent>
        </Tabs>
      </div>

      {idObrigacao && (
        <AnexoObrigacaoModal
          open={showAnexarModal}
          onClose={() => setShowAnexarModal(false)}
          idObrigacao={idObrigacao}
          idPerfil={idPerfil}
          tpDocumento={tipoAnexoModal}
          title={`Anexar ${
            tipoAnexoModal === TipoDocumentoAnexoEnum.P ? 'Protocolo' :
            tipoAnexoModal === TipoDocumentoAnexoEnum.E ? 'Evidência' :
            tipoAnexoModal === TipoDocumentoAnexoEnum.R ? 'Correspondência' :
            'Arquivo'
          }`}
          onSuccess={onRefreshAnexos}
        />
      )}
    </div>
  );
}

