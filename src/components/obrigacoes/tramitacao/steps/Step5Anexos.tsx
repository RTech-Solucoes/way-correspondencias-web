'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { UploadIcon, XIcon } from '@phosphor-icons/react';
import { TramitacaoFormData } from '../TramitacaoObrigacaoModal';

interface Step5AnexosProps {
  formData: TramitacaoFormData;
  updateFormData: (data: Partial<TramitacaoFormData>) => void;
}

export function Step5Anexos({ formData, updateFormData }: Step5AnexosProps) {
  const [files, setFiles] = useState<File[]>(formData.anexos || []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const updatedFiles = [...files, ...newFiles];
      setFiles(updatedFiles);
      updateFormData({ anexos: updatedFiles });
    }
  };


  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Anexos</Label>
      </div>
    </div>
  );
}