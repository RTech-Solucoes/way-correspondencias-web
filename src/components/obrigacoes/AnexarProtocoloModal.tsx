'use client';

import { useState, useCallback, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@radix-ui/react-label';
import AnexoComponent from '@/components/AnexoComponotent/AnexoComponent';
import AnexoList from '@/components/AnexoComponotent/AnexoList/AnexoList';
import { toast } from 'sonner';
import { ArquivoDTO, TipoResponsavelAnexoEnum, TipoDocumentoAnexoEnum } from '@/api/anexos/type';
import { computeTpResponsavel } from '@/api/perfis/types';
import obrigacaoAnexosClient from '@/api/obrigacao/anexos-client';
import obrigacaoClient from '@/api/obrigacao/client';
import { ObrigacaoProtocoloRequest } from '@/api/obrigacao/types';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import tramitacoesClient from '@/api/tramitacoes/client';

interface AnexarProtocoloModalProps {
  open: boolean;
  onClose: () => void;
  idObrigacao: number;
  idPerfil?: number;
  onSuccess?: () => void;
}

export function AnexarProtocoloModal({
  open,
  onClose,
  idObrigacao,
  idPerfil,
  onSuccess,
}: AnexarProtocoloModalProps) {
  const [arquivos, setArquivos] = useState<File[]>([]);
  const [observacoes, setObservacoes] = useState('');
  const [numeroProcesso, setNumeroProcesso] = useState('');
  const [numeroSEI, setNumeroSEI] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    if (!open) {
      setArquivos([]);
      setObservacoes('');
      setNumeroProcesso('');
      setNumeroSEI('');
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

  const handleConfirmClick = useCallback(() => {
    if (arquivos.length === 0) {
      toast.warning('Selecione pelo menos um arquivo para anexar.');
      return;
    }
    setShowConfirmDialog(true);
  }, [arquivos.length]);

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
            tpDocumento: TipoDocumentoAnexoEnum.P,
          };
        })
      );

      const numeroSEITrimmed = numeroSEI.trim();
      const numeroProcessoTrimmed = numeroProcesso.trim();
      const observacoesTrimmed = observacoes.trim();

      const protocoloData: ObrigacaoProtocoloRequest = {
        nrSei: numeroSEITrimmed || null,
        nrProcesso: numeroProcessoTrimmed || null,
        dsObservacaoProtocolo: observacoesTrimmed || null,
      };

      await Promise.all([
        obrigacaoAnexosClient.upload(idObrigacao, arquivosDTO),
        obrigacaoClient.atualizarProtocolo(idObrigacao, protocoloData),
        tramitacoesClient.tramitarViaFluxo({
          idSolicitacao: idObrigacao,
          dsObservacao: 'Obrigação anexada com protocolo. Concluida com sucesso.',
          flAprovado: 'S',
        }),
      ]);
      
      toast.success('Protocolo anexado com sucesso!');
      setArquivos([]);
      setObservacoes('');
      setNumeroProcesso('');
      setNumeroSEI('');
      setShowConfirmDialog(false);
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Erro ao anexar protocolo:', error);
      toast.error('Erro ao anexar protocolo. Tente novamente.');
    } finally {
      setUploading(false);
    }
  }, [arquivos, idObrigacao, idPerfil, observacoes, numeroSEI, onClose, onSuccess, numeroProcesso]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-200">
          <DialogTitle className="text-lg font-semibold">Anexar Protocolo</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Anexar arquivo <span className="text-red-500">*</span>
            </Label>
            <AnexoComponent
              onAddAnexos={handleAddAnexos}
              disabled={uploading}
            />
            {arquivos.length > 0 && (
              <div className="mt-4">
                <Label className="text-sm font-medium mb-2 block text-gray-700">
                  Arquivos selecionados ({arquivos.length}):
                </Label>
                  <AnexoList anexos={arquivos} onRemove={handleRemoveAnexo} />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes" className="text-sm font-medium text-gray-700">
              Observações
            </Label>
            <Textarea
              id="observacoes"
              placeholder="Digite as observações"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              disabled={uploading}
              className="min-h-[100px] resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="numeroProcesso" className="text-sm font-medium text-gray-700">
              Nº do Processo
            </Label>
            <Input
              id="numeroProcesso"
              placeholder="Digite o número do processo"
              value={numeroProcesso}
              onChange={(e) => setNumeroProcesso(e.target.value)}
              disabled={uploading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="numeroSEI" className="text-sm font-medium text-gray-700">
              Nº do SEI
            </Label>
            <Input
              id="numeroSEI"
              placeholder="Digite o número do SEI"
              value={numeroSEI}
              onChange={(e) => setNumeroSEI(e.target.value)}
              disabled={uploading}
            />
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
            onClick={handleConfirmClick}
            disabled={arquivos.length === 0 || uploading}
            className="min-w-[100px] bg-blue-600 hover:bg-blue-700"
            tooltip={arquivos.length === 0 ? 'É necessário anexar pelo menos um arquivo de protocolo.' : ''}
          >
            {uploading ? 'Enviando...' : 'Concluir e anexar'}
          </Button>
        </DialogFooter>
      </DialogContent>

      <ConfirmationDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        title="Confirmar conclusão da obrigação"
        description="Tem certeza que as informações estão corretas? Após concluir, a obrigação será marcada como concluída e não será mais possível fazer alterações."
        confirmText="Sim, concluir e anexar"
        cancelText="Cancelar"
        onConfirm={handleUpload}
        variant="default"
      />
    </Dialog>
  );
}

