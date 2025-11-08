import {CloudArrowUpIcon} from "@phosphor-icons/react";
import {Input} from "../ui/input";
import {useDropzone} from 'react-dropzone';
import {useCallback} from 'react';
import {usePermissoes} from "@/context/permissoes/PermissoesContext";

interface AnexoProps {
  onAddAnexos: (files: FileList | null) => void;
  disabled?: boolean;
}

export default function AnexoComponent({onAddAnexos, disabled = false}: AnexoProps) {
  const { canInserirAnexo } = usePermissoes();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter(file => {
      if (!file.name || file.name.trim() === '') {
        console.warn('Arquivo rejeitado: sem nome válido', file);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) {
      import('sonner').then(({ toast }) => {
        toast.error('Nenhum arquivo válido foi selecionado');
      });
      return;
    }

    if (validFiles.length < acceptedFiles.length) {
      import('sonner').then(({ toast }) => {
        toast.warning(`${acceptedFiles.length - validFiles.length} arquivo(s) foram rejeitados por não terem nome válido`);
      });
    }

    const dataTransfer = new DataTransfer();
    validFiles.forEach(file => dataTransfer.items.add(file));
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
    },
    disabled: disabled || !canInserirAnexo
  });

  if (!canInserirAnexo || disabled) {
    return (
      <div className="w-full border-2 border-dashed rounded-lg p-8 text-center border-gray-200 bg-gray-50">
        <div className="flex flex-col items-center space-y-2">
          <CloudArrowUpIcon size={48} className="text-gray-300" />
          <p className="text-gray-500">
            {disabled ? 'Anexos desabilitados' : 'Sem permissão para anexar arquivos'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div
        {...getRootProps()}
        className={`w-full border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-500 bg-blue-50 text-primary'
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
            <p className="text-primary font-medium">
              Solte os arquivos aqui...
            </p>
          ) : (
            <>
              <p className="text-gray-600">
                Arraste e solte arquivos aqui, ou clique para selecionar
              </p>
              <p className="text-sm text-gray-400">
                Suporta: PDF, DOC, DOCX, XLS, CSV, XLSX, PNG, JPG, JPEG, GIF
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
        onChange={(e) => {
          if (e.target.files) {
            const fileArray = Array.from(e.target.files);
            const validFiles = fileArray.filter(file => {
              if (!file.name || file.name.trim() === '') {
                console.warn('Arquivo rejeitado: sem nome válido', file);
                return false;
              }
              return true;
            });

            if (validFiles.length === 0) {
              import('sonner').then(({ toast }) => {
                toast.error('Nenhum arquivo válido foi selecionado');
              });
              return;
            }

            if (validFiles.length < fileArray.length) {
              import('sonner').then(({ toast }) => {
                toast.warning(`${fileArray.length - validFiles.length} arquivo(s) foram rejeitados por não terem nome válido`);
              });
            }

            const dataTransfer = new DataTransfer();
            validFiles.forEach(file => dataTransfer.items.add(file));
            onAddAnexos(dataTransfer.files);
          } else {
            onAddAnexos(null);
          }
        }}
        accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif"
      />
    </div>
  );
}
