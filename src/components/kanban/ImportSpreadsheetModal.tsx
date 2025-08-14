'use client';

import { useState, useRef } from 'react';
import { XIcon, UploadIcon, MicrosoftExcelLogoIcon, WarningCircleIcon, CheckIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/utils/utils';

interface ImportSpreadsheetModalProps {
  onClose(): void;
  onImport(file: File): void;
}

export default function ImportSpreadsheetModal({
  onClose,
  onImport,
}: ImportSpreadsheetModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    validateAndSetFile(selectedFile);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const selectedFile = e.dataTransfer.files?.[0];
    validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = (selectedFile: File | undefined) => {
    setError(null);
    
    if (!selectedFile) {
      return;
    }

    const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
    const validExtensions = ['csv', 'xlsx', 'xls'];
    
    if (!fileExtension || !validExtensions.includes(fileExtension)) {
      setError(`Formato de arquivo inválido. Por favor, selecione um arquivo .csv, .xlsx ou .xls.`);
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      setError(`O arquivo é muito grande. O tamanho máximo permitido é 10MB.`);
      return;
    }

    setFile(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleImport = () => {
    if (file) {
      onImport(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold flex items-center">
            <MicrosoftExcelLogoIcon className="h-5 w-5 mr-2" />
            Importar Planilha
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <XIcon className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div>
            <Label className="text-sm font-medium">Arquivo de Planilha</Label>
            <div
              className={cn(
                "mt-2 border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400",
                file ? "bg-green-50 border-green-300" : ""
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={triggerFileInput}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".csv,.xlsx,.xls"
                className="hidden"
              />
              
              {file ? (
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                    <CheckIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-1">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                    <UploadIcon className="h-6 w-6 text-gray-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    Arraste e solte seu arquivo aqui ou clique para selecionar
                  </p>
                  <p className="text-xs text-gray-500">
                    Formatos suportados: .CSV, .XLSX, .XLS (máx. 10MB)
                  </p>
                </div>
              )}
            </div>
            
            {error && (
              <div className="mt-3 flex items-start space-x-2 text-red-600">
                <WarningCircleIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}
          </div>

          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Formato esperado da planilha:</h3>
            <p className="text-xs text-blue-700">
              A planilha deve conter as seguintes colunas: NOME DA TAREFA, ITEM, STATUS, ATRIBUIDO, 
              AREA CONDICIONADA, PERIODICIDADE, DATA INICIO, DATA DE TÉRMINO, DURAÇÃO EM DIAS, 
              DATA LIMITE, COMENTÁRIOS
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end p-6 border-t border-gray-200 space-x-2">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleImport} 
            className="bg-green-600 hover:bg-green-700"
            disabled={!file}
          >
            Importar Planilha
          </Button>
        </div>
      </div>
    </div>
  );
}