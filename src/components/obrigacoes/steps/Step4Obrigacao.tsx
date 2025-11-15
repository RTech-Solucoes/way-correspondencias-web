'use client';

import AnexoComponent from '@/components/AnexoComponotent/AnexoComponent';
import AnexoList from '@/components/AnexoComponotent/AnexoList/AnexoList';
import { usePermissoes } from '@/context/permissoes/PermissoesContext';
import { Label } from '@radix-ui/react-label';
import { useCallback, useMemo } from 'react';

import { ObrigacaoFormData } from '../ObrigacaoModal';
import { AnexoResponse, TipoDocumentoAnexoEnum } from '@/api/anexos/type';

interface Step4ObrigacaoProps {
  formData: ObrigacaoFormData;
  updateFormData: (data: Partial<ObrigacaoFormData>) => void;
  anexos: File[];
  onAnexosChange: (anexos: File[]) => void;
  existingAnexos?: AnexoResponse[];
  onDownloadExisting?: (anexo: AnexoResponse) => void | Promise<void>;
  onRemoveExisting?: (anexo: AnexoResponse) => void | Promise<void>;
  existingAnexosLoading?: boolean;
}

export function Step4Obrigacao({
  formData,
  anexos,
  onAnexosChange,
  existingAnexos,
  onDownloadExisting,
  onRemoveExisting,
  existingAnexosLoading,
}: Step4ObrigacaoProps) {
  const {canListarAnexo, canInserirAnexo} = usePermissoes();

  const handleAddAnexos = useCallback((files: FileList | null) => {
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      onAnexosChange([...anexos, ...fileArray]);
    }
  }, [anexos, onAnexosChange]);

  const handleRemoveAnexo = useCallback((index: number) => {
    onAnexosChange(anexos.filter((_, i) => i !== index));
  }, [anexos, onAnexosChange]);

  const backendAnexos = useMemo(() => {
    if (!existingAnexos) {
      return [];
    }
    const anexosFiltrados = existingAnexos.filter((anexo) => anexo.tpDocumento === TipoDocumentoAnexoEnum.C);
    
    return anexosFiltrados.map((anexo) => ({
      idAnexo: anexo.idAnexo,
      idObjeto: anexo.idObjeto,
      name: anexo.nmArquivo,
      nmArquivo: anexo.nmArquivo,
      dsCaminho: anexo.dsCaminho,
      tpObjeto: anexo.tpObjeto,
    }));
  }, [existingAnexos]);

  const handleDownloadExisting = useCallback((backend: { idAnexo?: number; nmArquivo?: string }) => {
    if (!onDownloadExisting || !existingAnexos) {
      return;
    }
    const target = existingAnexos.find((anexo) => anexo.idAnexo === backend.idAnexo);
    if (target) {
      onDownloadExisting(target);
    }
  }, [existingAnexos, onDownloadExisting]);

  const handleRemoveExisting = useCallback((index: number) => {
    if (!onRemoveExisting || !existingAnexos) {
      return;
    }
    const target = existingAnexos[index];
    if (target) {
      onRemoveExisting(target);
    }
  }, [existingAnexos, onRemoveExisting]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        {canInserirAnexo && (
          <AnexoComponent
            onAddAnexos={handleAddAnexos}
          />
        )}

        {canListarAnexo && anexos.length > 0 && (
          <div>
            <Label className="text-sm font-medium mb-2 block">Anexos adicionados:</Label>
            <AnexoList anexos={anexos} onRemove={handleRemoveAnexo} />
          </div>
        )}

        {anexos.length === 0 && !formData.idSolicitacao && (
          <div className="text-sm text-gray-500">
            Adicione os anexos que deseja enviar.
          </div>
        )}
        {canListarAnexo && existingAnexos !== undefined && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Anexos atuais</Label>
            {existingAnexosLoading ? (
              <div className="text-sm text-gray-500">Carregando anexos...</div>
            ) : backendAnexos.length > 0 ? (
              <AnexoList
                anexos={backendAnexos}
                onDownload={onDownloadExisting ? (anexo) => handleDownloadExisting(anexo) : undefined}
                onRemove={onRemoveExisting ? (index) => handleRemoveExisting(index) : undefined}
              />
            ) : (
              <div className="text-sm text-gray-500">Nenhum anexo cadastrado.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

