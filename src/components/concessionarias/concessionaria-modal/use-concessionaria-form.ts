'use client';

import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { ConcessionariaRequest, ConcessionariaResponse } from '@/api/concessionaria/types';
import {
  CodigoAvailability,
  ConcessionariaField,
  ConcessionariaFormState,
  emptyForm,
  formStateFromResponse,
  isCnpjDuplicadoMessage,
  isCodigoDuplicadoMessage,
  isConcessionariaField,
  normalizarValorDoCampo,
  normalizeCodigoConcessionaria,
  toRequest,
  validarFormulario,
} from './concessionaria-form';

interface UseConcessionariaFormParams {
  concessionaria: ConcessionariaResponse | null;
  open: boolean;
  loading: boolean;
  onCodigoDisponivel?: (codigo: string, idConcessionaria: number | null) => Promise<boolean | null>;
  onSave: (concessionaria: ConcessionariaRequest) => void | Promise<void>;
}

/** Estado, validação e envio do formulário de cadastro da concessionária. */
export function useConcessionariaForm({
  concessionaria,
  open,
  loading,
  onCodigoDisponivel,
  onSave,
}: UseConcessionariaFormParams) {
  const [formData, setFormData] = useState<ConcessionariaFormState>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [codigoAvailability, setCodigoAvailability] = useState<CodigoAvailability>('idle');
  const codigoCheckSeq = useRef(0);

  useEffect(() => {
    if (!open) return;

    setFormData(concessionaria ? formStateFromResponse(concessionaria) : emptyForm);
    setErrors({});
    setSaving(false);
    setCodigoAvailability('idle');
    codigoCheckSeq.current += 1;
  }, [concessionaria, open]);

  const handleChange = useCallback((field: ConcessionariaField, value: string) => {
    if (field === 'cdConcessionaria') {
      codigoCheckSeq.current += 1;
      setCodigoAvailability('idle');
    }

    setFormData((prev) => ({ ...prev, [field]: normalizarValorDoCampo(field, value) }));
    setErrors((prev) => (prev[field] ? { ...prev, [field]: '' } : prev));
  }, []);

  const checkCodigoDisponivel = useCallback(async () => {
    if (!onCodigoDisponivel) return;

    const codigo = normalizeCodigoConcessionaria(formData.cdConcessionaria);
    if (!codigo) {
      setCodigoAvailability('idle');
      return;
    }

    const codigoOriginal = concessionaria
      ? normalizeCodigoConcessionaria(concessionaria.cdConcessionaria)
      : '';

    if (concessionaria && codigo === codigoOriginal) {
      setCodigoAvailability('idle');
      setErrors((prev) => ({ ...prev, cdConcessionaria: '' }));
      return;
    }

    const seq = ++codigoCheckSeq.current;
    setCodigoAvailability('checking');

    const disponivel = await onCodigoDisponivel(codigo, concessionaria?.idConcessionaria ?? null);

    if (seq !== codigoCheckSeq.current) return;

    if (disponivel === null) {
      setCodigoAvailability('idle');
      return;
    }

    if (disponivel) {
      setCodigoAvailability('available');
      setErrors((prev) => ({ ...prev, cdConcessionaria: '' }));
    } else {
      setCodigoAvailability('unavailable');
      setErrors((prev) => ({ ...prev, cdConcessionaria: 'Código já está em uso' }));
    }
  }, [concessionaria, formData.cdConcessionaria, onCodigoDisponivel]);

  const applyApiValidationErrors = useCallback((error: unknown) => {
    const payload = (error as {
      payload?: {
        message?: string;
        error?: string;
        errors?: Array<{ field?: string; message?: string }>;
      };
    })?.payload;

    const nextErrors: Record<string, string> = {};

    payload?.errors?.forEach((apiError) => {
      if (apiError.field && isConcessionariaField(apiError.field)) {
        nextErrors[apiError.field] = apiError.message || 'Campo inválido.';
      }
    });

    const generalMessage = payload?.message || payload?.error || (error as Error)?.message || '';

    if (!nextErrors.nrCnpj && isCnpjDuplicadoMessage(generalMessage)) {
      nextErrors.nrCnpj = 'CNPJ já está em uso';
      nextErrors.cdConcessionaria = '';
      setCodigoAvailability('idle');
    } else if (!nextErrors.cdConcessionaria && isCodigoDuplicadoMessage(generalMessage)) {
      nextErrors.cdConcessionaria = 'Código já está em uso';
      setCodigoAvailability('unavailable');
    }

    if (!Object.keys(nextErrors).length) return;

    setErrors((prev) => ({ ...prev, ...nextErrors }));
  }, []);

  const handleSubmit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();

      const novosErros = validarFormulario(formData);
      setErrors(novosErros);
      if (Object.keys(novosErros).length) return;

      const codigo = normalizeCodigoConcessionaria(formData.cdConcessionaria);
      const codigoOriginal = concessionaria
        ? normalizeCodigoConcessionaria(concessionaria.cdConcessionaria)
        : '';
      const codigoAlterado = codigo !== codigoOriginal;

      setSaving(true);
      try {
        if (onCodigoDisponivel && (!concessionaria || codigoAlterado)) {
          const disponivel = await onCodigoDisponivel(
            codigo,
            concessionaria?.idConcessionaria ?? null,
          );

          if (disponivel === null) return;

          if (!disponivel) {
            setCodigoAvailability('unavailable');
            setErrors((prev) => ({ ...prev, cdConcessionaria: 'Código já está em uso' }));
            return;
          }

          setCodigoAvailability('available');
        }

        await onSave(toRequest(formData, concessionaria));
      } catch (error) {
        applyApiValidationErrors(error);
      } finally {
        setSaving(false);
      }
    },
    [applyApiValidationErrors, concessionaria, formData, onCodigoDisponivel, onSave],
  );

  const isSubmitDisabled =
    saving ||
    loading ||
    codigoAvailability === 'checking' ||
    codigoAvailability === 'unavailable' ||
    !normalizeCodigoConcessionaria(formData.cdConcessionaria) ||
    !formData.nmConcessionaria.trim();

  return {
    formData,
    errors,
    saving,
    codigoAvailability,
    isSubmitDisabled,
    handleChange,
    handleSubmit,
    checkCodigoDisponivel,
  };
}
