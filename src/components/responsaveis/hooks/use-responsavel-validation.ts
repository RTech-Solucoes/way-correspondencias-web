'use client';

import { useCallback } from 'react';
import { z } from 'zod';
import { ResponsavelRequest } from '@/api/responsaveis/types';
import { formValidator } from '@/utils/utils';

const responsavelSchema = z.object({
  nmResponsavel: formValidator.name,
  nmUsuarioLogin: formValidator.username,
  dsEmail: formValidator.email,
  nrCpf: formValidator.cpf,
  dtNascimento: formValidator.birthDate,
  idPerfil: formValidator.id,
  idsAreas: z.array(z.number()).min(1, 'Selecione pelo menos uma área'),
});

export type UseResponsavelValidationProps = {
  formData: ResponsavelRequest;
  errors: Record<string, string>;
  selectedAreaIds: number[];
  selectedConcessionariaIds: number[];
};

export function useResponsavelValidation({
  formData,
  errors,
  selectedAreaIds,
  selectedConcessionariaIds,
}: UseResponsavelValidationProps) {
  const getFieldErrors = useCallback((): Record<string, string> => {
    const fieldErrors: Record<string, string> = {};

    const schemaResult = responsavelSchema.safeParse(formData);
    if (!schemaResult.success) {
      schemaResult.error.issues.forEach((issue) => {
        const path = issue.path[0] as string;
        if (!fieldErrors[path]) {
          fieldErrors[path] = issue.message;
        }
      });
    }

    if (!formData.nmResponsavel?.trim()) {
      fieldErrors.nmResponsavel = fieldErrors.nmResponsavel || 'Nome é obrigatório';
    }
    if (!formData.nmUsuarioLogin?.trim()) {
      fieldErrors.nmUsuarioLogin = fieldErrors.nmUsuarioLogin || 'Usuário é obrigatório';
    }
    if (!formData.dsEmail?.trim()) {
      fieldErrors.dsEmail = fieldErrors.dsEmail || 'Email é obrigatório';
    }
    if (!formData.nrCpf?.trim()) {
      fieldErrors.nrCpf = fieldErrors.nrCpf || 'CPF é obrigatório';
    }
    if (!formData.dtNascimento) {
      fieldErrors.dtNascimento = fieldErrors.dtNascimento || 'Data de nascimento é obrigatória';
    }
    if (!formData.idPerfil || formData.idPerfil === 0) {
      fieldErrors.idPerfil = 'Selecione um perfil';
    }
    if (selectedAreaIds.length === 0) {
      fieldErrors.idsAreas = 'Selecione pelo menos uma área';
    }
    if (selectedConcessionariaIds.length === 0) {
      fieldErrors.idsConcessionarias = 'Selecione pelo menos uma concessionária';
    }

    return fieldErrors;
  }, [formData, selectedAreaIds, selectedConcessionariaIds]);

  const isFormValid = useCallback(() => {
    return Object.keys(getFieldErrors()).length === 0;
  }, [getFieldErrors]);

  const getValidationTooltip = useCallback(() => {
    const fieldErrors = getFieldErrors();
    const allErrors = { ...fieldErrors, ...errors };

    if (Object.keys(allErrors).length === 0) {
      return '';
    }

    return 'Corrija os campos destacados abaixo';
  }, [getFieldErrors, errors]);

  return {
    isFormValid,
    getValidationTooltip,
    getFieldErrors,
    responsavelSchema,
  };
}
