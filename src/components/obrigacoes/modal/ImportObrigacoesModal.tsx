'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UploadIcon, XIcon } from '@phosphor-icons/react';
import { CheckCircleIcon, FileText } from 'lucide-react';
import { useObrigacoes } from '@/context/obrigacoes/ObrigacoesContext';
import { toast } from 'sonner';
import obrigacaoClient from '@/api/obrigacao/client';
import LoadingOverlay from '@/components/ui/loading-overlay';
import { InfoImportacaoPlanilha } from './InfoImportacaoPlanilha';

interface ImportObrigacoesModalProps {
  open: boolean;
  onClose: () => void;
}

export function ImportObrigacoesModal({ open, onClose }: ImportObrigacoesModalProps) {
  const { loadObrigacoes } = useObrigacoes();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showInfo, setShowInfo] = useState(true);
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
        <DialogContent className="sm:max-w-[1000px] max-h-[95vh] flex flex-col">
          <DialogHeader className="pb-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="h-6 w-6 text-blue-600" />
                Importar Obrigações
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowInfo(!showInfo)}
                className="text-xs text-gray-600 hover:text-gray-900"
              >
                {showInfo ? 'Ocultar informações' : 'Mostrar informações'}
              </Button>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-6 py-4">
            {/* Seção Informativa */}
            {showInfo && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                <InfoImportacaoPlanilha />
              </div>
            )}

            {/* Área de Upload */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <UploadIcon className="h-5 w-5 text-gray-600" />
                <h3 className="text-sm font-semibold text-gray-900">Selecione o arquivo para importar</h3>
              </div>
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
                  border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer min-h-[280px] flex flex-col items-center justify-center
                  ${dragActive ? 'border-blue-500 bg-blue-50 scale-[1.02] shadow-lg' : 'border-gray-300 bg-gradient-to-br from-gray-50 to-white'}
                  ${selectedFile ? 'border-green-500 bg-green-50 cursor-default shadow-md' : 'hover:border-blue-400 hover:bg-blue-50/30'}
                `}
              >
                {selectedFile ? (
                  <div className="space-y-4 w-full">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 bg-green-100 rounded-full">
                        <CheckCircleIcon className="h-16 w-16 text-green-600" />
                      </div>
                      <div className="space-y-1 text-center">
                        <p className="text-base font-semibold text-gray-900">{selectedFile.name}</p>
                        <p className="text-sm text-gray-600">
                          {(selectedFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFile();
                        }}
                        className="mt-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                      >
                        <XIcon className="h-4 w-4 mr-2" />
                        Remover arquivo
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 w-full">
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-6 bg-blue-100 rounded-full">
                        <UploadIcon className="h-16 w-16 text-blue-600" weight="duotone" />
                      </div>
                      <div className="space-y-2 text-center">
                        <p className="text-lg font-semibold text-gray-900">
                          Arraste e solte o arquivo aqui
                        </p>
                        <p className="text-sm text-gray-600">
                          ou clique no botão abaixo para selecionar
                        </p>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          Formatos aceitos: <strong className="text-gray-700">CSV, XLS, XLSX</strong>
                        </span>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,.xls,.xlsx"
                        onChange={handleFileInputChange}
                        className="hidden"
                        id="file-upload-input"
                      />
                      <Button
                        type="button"
                        variant="default"
                        size="lg"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-base font-semibold shadow-md hover:shadow-lg transition-all"
                      >
                        <UploadIcon className="h-5 w-5 mr-2" />
                        Selecionar arquivo
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="border-t border-gray-200 pt-4 mt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="min-w-[120px]"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleImport}
              disabled={!selectedFile || loading}
              className="min-w-[120px] bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md hover:shadow-lg transition-all"
            >
              {loading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Importando...
                </>
              ) : (
                <>
                  <UploadIcon className="h-4 w-4 mr-2" />
                  Importar
                </>
              )}
            </Button>
          </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}

