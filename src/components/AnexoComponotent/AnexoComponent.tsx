import {PaperclipIcon, CloudArrowUpIcon} from "@phosphor-icons/react";
import {Input} from "../ui/input";
import { useDropzone } from 'react-dropzone';
import { useCallback } from 'react';

interface AnexoProps {
  onAddAnexos: (files: FileList | null) => void;
}

export default function AnexoComponent({onAddAnexos}: AnexoProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const dataTransfer = new DataTransfer();
    acceptedFiles.forEach(file => dataTransfer.items.add(file));
    onAddAnexos(dataTransfer.files);
  }, [onAddAnexos]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    }
  });

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Área de Dropzone */}
      <div
        {...getRootProps()}
        className={`w-full border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-500 bg-blue-50 text-blue-600'
            : 'border-gray-300 hover:border-gray-400 text-gray-600'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center space-y-2">
          <CloudArrowUpIcon
            size={48}
            className={isDragActive ? 'text-blue-500' : 'text-gray-400'}
          />
          {isDragActive ? (
            <p className="text-blue-600 font-medium">
              Solte os arquivos aqui...
            </p>
          ) : (
            <>
              <p className="text-gray-600">
                Arraste e solte arquivos aqui, ou clique para selecionar
              </p>
              <p className="text-sm text-gray-400">
                Suporta: PDF, DOC, DOCX, XLS, XLSX, PNG, JPG, JPEG, GIF
              </p>
            </>
          )}
        </div>
      </div>

      <Input
        id="file-upload-manual"
        type="file"
        className="hidden"
        multiple
        onChange={(e) => onAddAnexos(e.target.files)}
        accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif"
      />
    </div>
  );
}
