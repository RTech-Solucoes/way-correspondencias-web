'use client';

import AnexoList from '@/components/AnexoComponotent/AnexoList/AnexoList';
import { ObrigacaoFormData } from '../ObrigacaoModal';
import { Label } from '@radix-ui/react-label';
import AnexoComponent from '@/components/AnexoComponotent/AnexoComponent';
import { usePermissoes } from '@/context/permissoes/PermissoesContext';
import { useCallback, useState } from 'react';
import { AnexoResponse, TipoObjetoAnexo } from '@/api/anexos/type';
import anexosClient from '@/api/anexos/client';


interface Step4ObrigacaoProps {
  formData: ObrigacaoFormData;
  updateFormData: (data: Partial<ObrigacaoFormData>) => void;
}

export function Step4Obrigacao({ formData, updateFormData }: Step4ObrigacaoProps) {
  const {canListarAnexo, canInserirAnexo} = usePermissoes();
  const [anexos, setAnexos] = useState<File[]>([]);
  const [anexosBackend, setAnexosBackend] = useState<AnexoResponse[]>([]);
  
  const handleAddAnexos = useCallback((files: FileList | null) => {
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      setAnexos(prev => [...prev, ...fileArray]);
    }
  }, []);

  const handleRemoveAnexo = useCallback((index: number) => {
    setAnexos(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleRemoveAnexoBackend = useCallback(async (idAnexo: number) => {

  }, []);

  const handleDownloadAnexoBackend = useCallback(async (anexo: AnexoResponse) => {
    try {
      const arquivos = await anexosClient.download(anexo.idObjeto, TipoObjetoAnexo.O, anexo.nmArquivo);
    } catch (error) {
      console.error('Erro ao baixar anexo:', error);
    }
  }, []);

  return (
    <div className="space-y-6">
<div className="flex flex-col space-y-4">
  {canInserirAnexo &&
    <AnexoComponent
      onAddAnexos={handleAddAnexos}
      disabled={false}
    />
  }

  {canListarAnexo && anexos.length > 0 && (
    <div>
      <Label className="text-sm font-medium mb-2 block">Anexos:</Label>
      <AnexoList anexos={anexos} onRemove={handleRemoveAnexo} />
    </div>
  )}

  {canListarAnexo && anexosBackend.length > 0 && (
    <div>
      <Label className="text-sm font-medium mb-2 block">Documentos já anexados:</Label>
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
        onRemove={(index) => {
          const anexo = anexosBackend[index];
          if (anexo?.idAnexo) {
            handleRemoveAnexoBackend(anexo.idAnexo);
          }
              }}
        onDownload={(anexo) => handleDownloadAnexoBackend(anexo as unknown as AnexoResponse)}
      />
    </div>
  )}

  </div>
</div>


  );
}

