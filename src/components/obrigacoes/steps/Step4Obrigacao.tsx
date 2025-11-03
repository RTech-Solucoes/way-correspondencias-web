'use client';

import AnexoList from '@/components/AnexoComponotent/AnexoList/AnexoList';
import { ObrigacaoFormData } from '../ObrigacaoModal';
import { Label } from '@radix-ui/react-label';
import AnexoComponent from '@/components/AnexoComponotent/AnexoComponent';
import { usePermissoes } from '@/context/permissoes/PermissoesContext';
import { useCallback, useState, useEffect } from 'react';
import { AnexoResponse, TipoObjetoAnexo } from '@/api/anexos/type';
import anexosClient from '@/api/anexos/client';

interface Step4ObrigacaoProps {
  formData: ObrigacaoFormData;
  updateFormData: (data: Partial<ObrigacaoFormData>) => void;
  anexos: File[];
  onAnexosChange: (anexos: File[]) => void;
}

export function Step4Obrigacao({ formData, updateFormData, anexos, onAnexosChange }: Step4ObrigacaoProps) {
  const {canListarAnexo, canInserirAnexo} = usePermissoes();
  const [anexosBackend, setAnexosBackend] = useState<AnexoResponse[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const carregarAnexos = async () => {
      if (formData.idSolicitacao) {
        try {
          setLoading(true);
          const anexosExistentes = await anexosClient.buscarPorIdObjetoETipoObjeto(
            formData.idSolicitacao,
            TipoObjetoAnexo.O
          );
          setAnexosBackend(anexosExistentes || []);
        } catch (error) {
          console.error('Erro ao carregar anexos:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    carregarAnexos();
  }, [formData.idSolicitacao]);


  const handleAddAnexos = useCallback((files: FileList | null) => {
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      
      const nomesExistentes = new Set(
        anexosBackend.map(a => a.nmArquivo.toLowerCase())
      );
      
      const novosAnexos = fileArray.filter(file => 
        !nomesExistentes.has(file.name.toLowerCase())
      );
      
      onAnexosChange([...anexos, ...novosAnexos]);
    }
  }, [anexosBackend, anexos, onAnexosChange]);

  const handleRemoveAnexo = useCallback((index: number) => {
    onAnexosChange(anexos.filter((_, i) => i !== index));
  }, [anexos, onAnexosChange]);

  const handleDownloadAnexoBackend = useCallback(async (anexo: AnexoResponse) => {
    try {
      await anexosClient.download(
        anexo.idObjeto,
        TipoObjetoAnexo.O,
        anexo.nmArquivo
      );
    } catch (error) {
      console.error('Erro ao baixar anexo:', error);
    }
  }, []);

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

        {canListarAnexo && anexosBackend.length > 0 && (
          <div>
            <Label className="text-sm font-medium mb-2 block">Documentos já salvos:</Label>
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
              onDownload={(anexo) => handleDownloadAnexoBackend(anexo as unknown as AnexoResponse)}
            />
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

