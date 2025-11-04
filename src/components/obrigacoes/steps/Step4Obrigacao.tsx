'use client';

import AnexoComponent from '@/components/AnexoComponotent/AnexoComponent';
import AnexoList from '@/components/AnexoComponotent/AnexoList/AnexoList';
import { usePermissoes } from '@/context/permissoes/PermissoesContext';
import { Label } from '@radix-ui/react-label';
import { useCallback, useState } from 'react';

import { ObrigacaoFormData } from '../ObrigacaoModal';


interface Step4ObrigacaoProps {
  formData: ObrigacaoFormData;
  updateFormData: (data: Partial<ObrigacaoFormData>) => void;
  anexos: File[];
  onAnexosChange: (anexos: File[]) => void;
}

export function Step4Obrigacao({ formData, updateFormData, anexos, onAnexosChange }: Step4ObrigacaoProps) {
  const {canListarAnexo, canInserirAnexo} = usePermissoes();
  const [loading, setLoading] = useState(false);

  const handleAddAnexos = useCallback((files: FileList | null) => {
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      onAnexosChange([...anexos, ...fileArray]);
    }
  }, [anexos, onAnexosChange]);

  const handleRemoveAnexo = useCallback((index: number) => {
    onAnexosChange(anexos.filter((_, i) => i !== index));
  }, [anexos, onAnexosChange]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        {canInserirAnexo && (
          <AnexoComponent
            onAddAnexos={handleAddAnexos}
            disabled={loading}
          />
        )}

        {canListarAnexo && anexos.length > 0 && (
          <div>
            <Label className="text-sm font-medium mb-2 block">Anexos adicionados:</Label>
            <AnexoList anexos={anexos} onRemove={handleRemoveAnexo} />
          </div>
        )}

        {loading && (
          <div className="text-sm text-gray-500">Carregando anexos...</div>
        )}

        {anexos.length === 0 && !formData.idSolicitacao && (
          <div className="text-sm text-gray-500">
            Adicione os anexos que deseja enviar.
          </div>
        )}
      </div>
    </div>
  );
}

