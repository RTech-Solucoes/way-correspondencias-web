'use client';

import { useState, useCallback, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import AnexoComponent from '@/components/AnexoComponotent/AnexoComponent';
import AnexoList from '@/components/AnexoComponotent/AnexoList/AnexoList';
import { Label } from '@radix-ui/react-label';
import { toast } from 'sonner';
import { ArquivoDTO, TipoResponsavelAnexoEnum, TipoDocumentoAnexoEnum } from '@/api/anexos/type';
import { computeTpResponsavel } from '@/api/perfis/types';
import obrigacaoAnexosClient from '@/api/obrigacao/anexos-client';
import tramitacoesClient from '@/api/tramitacoes/client';
import { authClient } from '@/api/auth/client';

interface AnexoObrigacaoModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  tpDocumento: TipoDocumentoAnexoEnum;
  idObrigacao: number;
  idPerfil?: number;
  onSuccess?: () => void;
  onFilesSelected?: (files: ArquivoDTO[]) => void;
  isTramitacao?: boolean;
}

export function AnexoObrigacaoModal({
  open,
  onClose,
  title,
  tpDocumento,
  idObrigacao,
  idPerfil,
  onSuccess,
  onFilesSelected,
  isTramitacao = false,
}: AnexoObrigacaoModalProps) {
  const [arquivos, setArquivos] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!open) {
      setArquivos([]);
    }
  }, [open]);

  const handleAddAnexos = useCallback((files: FileList | null) => {
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      setArquivos((prev) => [...prev, ...fileArray]);
    }
  }, []);

  const handleRemoveAnexo = useCallback((index: number) => {
    setArquivos((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleUpload = useCallback(async () => {
    if (arquivos.length === 0) {
      toast.warning('Selecione pelo menos um arquivo para anexar.');
      return;
    }

    setUploading(true);
    try {
      const tpResponsavel = idPerfil 
        ? computeTpResponsavel(idPerfil) 
        : TipoResponsavelAnexoEnum.A;

      const idUsuarioLogado = authClient.getUserIdResponsavelFromToken();

      const arquivosDTO: ArquivoDTO[] = await Promise.all(
        arquivos.map(async (file) => {
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              const result = reader.result as string;
              const commaIndex = result.indexOf(',');
              resolve(commaIndex >= 0 ? result.substring(commaIndex + 1) : result);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });

          return {
            nomeArquivo: file.name,
            tipoConteudo: file.type,
            tpResponsavel,
            conteudoArquivo: base64,
            tpDocumento,
            idResponsavel: idUsuarioLogado || undefined,
          };
        })
      );

      if (onFilesSelected) {
        onFilesSelected(arquivosDTO);
        setArquivos([]);
        onClose();
        return;
      }

      if (isTramitacao) {
        await tramitacoesClient.uploadAnexos(idObrigacao, arquivosDTO);
      } else {
        await obrigacaoAnexosClient.upload(idObrigacao, arquivosDTO);
      }
      
      toast.success('Arquivos anexados com sucesso!');
      setArquivos([]);
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Erro ao anexar arquivos:', error);
      toast.error('Erro ao anexar arquivos. Tente novamente.');
    } finally {
      setUploading(false);
    }
  }, [arquivos, idObrigacao, tpDocumento, idPerfil, onClose, onSuccess, isTramitacao, onFilesSelected]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[70vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-200">
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-6">
            <AnexoComponent
              onAddAnexos={handleAddAnexos}
              disabled={uploading}
            />

            {arquivos.length > 0 && (
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Arquivos selecionados ({arquivos.length}):
                </Label>
                <div className="max-h-[calc(70vh-300px)] overflow-y-auto">
                  <AnexoList anexos={arquivos} onRemove={handleRemoveAnexo} />
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="border-t border-gray-200 px-6 py-4 mt-auto">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={uploading}
            className="min-w-[100px]"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleUpload}
            disabled={arquivos.length === 0 || uploading}
            className="min-w-[100px] bg-blue-600 hover:bg-blue-700"
          >
            {uploading ? 'Enviando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

