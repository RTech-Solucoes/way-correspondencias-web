'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UploadIcon, XIcon } from '@phosphor-icons/react';
import { CheckCircleIcon } from 'lucide-react';
import { useObrigacoes } from '@/context/obrigacoes/ObrigacoesContext';
import { toast } from 'sonner';
import obrigacaoClient from '@/api/obrigacao/client';
import LoadingOverlay from '@/components/ui/loading-overlay';

interface ImportObrigacoesModalProps {
  open: boolean;
  onClose: () => void;
}

export function ImportObrigacoesModal({ open, onClose }: ImportObrigacoesModalProps) {
  const { loadObrigacoes } = useObrigacoes();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [open]);

  const handleFileSelect = useCallback((file: File) => {
    const validExtensions = ['.csv', '.xls', '.xlsx'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!validExtensions.includes(fileExtension)) {
      toast.error('Formato de arquivo inválido. Use CSV, XLS ou XLSX.');
      return;
    }

    setSelectedFile(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      handleFileSelect(file);
    }
    
    // Reset input value to allow selecting the same file again
    if (e.target) {
      e.target.value = '';
    }
  }, [handleFileSelect]);

  const handleImport = useCallback(async () => {
    if (!selectedFile) {
      toast.error('Selecione um arquivo para importar.');
      return;
    }

    try {
      setLoading(true);
      
      const response = await obrigacaoClient.importarObrigacoesExcel(selectedFile);
      
      toast.success(`${response.mensagem}. ${response.obrigacoesImportadas} obrigação(ões) importada(s).`);
      setSelectedFile(null);
      onClose();
      loadObrigacoes();
    } catch (error: unknown) {
      console.error('Erro ao importar obrigações:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao importar obrigações. Tente novamente.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [selectedFile, onClose, loadObrigacoes]);

  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
  }, []);

  return (
    <>
      {loading && (
        <LoadingOverlay 
          title="Importando Obrigações" 
          subtitle="Aguarde enquanto o arquivo é processado e as obrigações são importadas..." 
        />
      )}
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[800px] h-[50vh]">
          <DialogHeader>
            <DialogTitle>Importar Obrigações</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 flex-1 overflow-y-auto">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={(e) => {
              if (!selectedFile && fileInputRef.current) {
                e.stopPropagation();
                fileInputRef.current.click();
              }
            }}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer h-[35vh]
              ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'}
              ${selectedFile ? 'border-green-500 bg-green-50 cursor-default' : 'hover:border-gray-400'}
            `}
          >
            {selectedFile ? (
              <div className="space-y-2">
                <CheckCircleIcon className="h-12 w-12 mx-auto text-green-500" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile();
                  }}
                  className="mt-2"
                >
                  <XIcon className="h-4 w-4 mr-2" />
                  Remover arquivo
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <UploadIcon className="h-12 w-12 mx-auto text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Arraste e solte o arquivo aqui
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    ou clique para selecionar
                  </p>
                </div>
                <div className="text-xs text-gray-400">
                  Formatos aceitos: CSV, XLS, XLSX
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xls,.xlsx"
                  onChange={handleFileInputChange}
                  className="hidden"
                  id="file-upload-input"
                />
                <label htmlFor="file-upload-input" className="cursor-pointer block w-fit mx-auto">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                  >
                    Selecionar arquivo
                  </Button>
                </label>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleImport}
            disabled={!selectedFile || loading}
          >
            {loading ? 'Importando...' : 'Importar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}

