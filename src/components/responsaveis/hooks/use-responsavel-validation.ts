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
  const isFormValid = useCallback(() => {
    const result = responsavelSchema.safeParse(formData);
    return (
      result.success &&
      Object.keys(errors).length === 0 &&
      selectedAreaIds.length > 0 &&
      selectedConcessionariaIds.length > 0
    );
  }, [formData, errors, selectedAreaIds, selectedConcessionariaIds]);

  const getValidationTooltip = useCallback(() => {

    const schemaResult = responsavelSchema.safeParse(formData);
    const schemaErrors: Record<string, string> = {};

    if (!schemaResult.success) {
      schemaResult.error.issues.forEach((issue) => {
        const path = issue.path[0] as string;
        schemaErrors[path] = issue.message;
      });
    }

    const missingFields: string[] = [];
    const validationErrors: string[] = [];

    if (schemaErrors.nmResponsavel || errors.nmResponsavel) {
      validationErrors.push('Nome inválido');
    } else if (!formData.nmResponsavel?.trim()) {
      missingFields.push('Nome');
    }

    if (schemaErrors.nmUsuarioLogin || errors.nmUsuarioLogin) {
      validationErrors.push('Usuário inválido');
    } else if (!formData.nmUsuarioLogin?.trim()) {
      missingFields.push('Usuário');
    }

    if (schemaErrors.dsEmail || errors.dsEmail) {
      validationErrors.push('Email inválido');
    } else if (!formData.dsEmail?.trim()) {
      missingFields.push('Email');
    }

    if (schemaErrors.nrCpf || errors.nrCpf) {
      validationErrors.push('CPF inválido');
    } else if (!formData.nrCpf?.trim()) {
      missingFields.push('CPF');
    }

    if (schemaErrors.dtNascimento || errors.dtNascimento) {
      validationErrors.push('Data de Nascimento inválida');
    } else if (!formData.dtNascimento) {
      missingFields.push('Data de Nascimento');
    }

    if (schemaErrors.idPerfil || errors.idPerfil) {
      validationErrors.push('Perfil inválido');
    } else if (!formData.idPerfil || formData.idPerfil === 0) {
      missingFields.push('Perfil');
    }

    if (schemaErrors.idsAreas || errors.idsAreas) {
      validationErrors.push('Selecione pelo menos uma área');
    } else if (selectedAreaIds.length === 0) {
      missingFields.push('Áreas');
    }

    if (errors.idsConcessionarias) {
      validationErrors.push('Selecione pelo menos uma concessionária');
    } else if (selectedConcessionariaIds.length === 0) {
      missingFields.push('Concessionárias');
    }

    if (missingFields.length === 0 && validationErrors.length === 0) {
      return '';
    }

    const messages: string[] = [];
    if (missingFields.length > 0) {
      messages.push(`Preencha: ${missingFields.join(', ')}`);
    }
    if (validationErrors.length > 0) {
      messages.push(`Corrija: ${validationErrors.join(', ')}`);
    }

    return messages.join(' | ');
  }, [formData, selectedAreaIds, selectedConcessionariaIds, errors]);

  return {
    isFormValid,
    getValidationTooltip,
    responsavelSchema,
  };
}
