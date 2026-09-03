'use client';

import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircleIcon, InfoIcon, SpinnerIcon, WarningCircleIcon } from '@phosphor-icons/react';
import { ConcessionariaRequest, ConcessionariaResponse } from '@/api/concessionaria/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { mask, onlyDigits, validateCNPJ } from '@/utils/utils';
import RegistroDesativacao from './RegistroDesativacao';

type CodigoAvailability = 'idle' | 'checking' | 'available' | 'unavailable';

const normalizeCodigoConcessionaria = (value: string) => value.replace(/\s+/g, '').toLowerCase();
const normalizeOptionalString = (value?: string | null) => value?.trim() || '';

const CNPJ_DIGITS = 14;
const TELEFONE_FIXO_DIGITS = 10;

const UFS_BRASIL = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
] as const;

const emptyForm: ConcessionariaRequest = {
  cdConcessionaria: '',
  nmConcessionaria: '',
  dsConcessionaria: '',
  nrCnpj: '',
  dsTelefone: '',
  sgUf: '',
  dsRodoviaTrecho: '',
  nrContratoAntt: '',
  flAtivo: 'S',
};

type ConcessionariaField = keyof ConcessionariaRequest;

const CONCESSIONARIA_FIELDS: ConcessionariaField[] = [
  'cdConcessionaria',
  'nmConcessionaria',
  'dsConcessionaria',
  'nrCnpj',
  'dsTelefone',
  'sgUf',
  'dsRodoviaTrecho',
  'nrContratoAntt',
];

const isConcessionariaField = (field: string): field is ConcessionariaField =>
  CONCESSIONARIA_FIELDS.includes(field as ConcessionariaField);

const isDuplicadoMessage = (message: string) => {
  const normalized = message.toLowerCase();
  return (
    normalized.includes('já existe') ||
    normalized.includes('ja existe') ||
    normalized.includes('em uso') ||
    normalized.includes('duplic') ||
    normalized.includes('unique') ||
    normalized.includes('conflito')
  );
};

const isCodigoDuplicadoMessage = (message: string) => {
  const normalized = message.toLowerCase();
  const mentionsCodigo = normalized.includes('código') || normalized.includes('codigo');
  const mentionsCnpj = normalized.includes('cnpj');
  return mentionsCodigo && !mentionsCnpj && isDuplicadoMessage(normalized);
};

const isCnpjDuplicadoMessage = (message: string) => {
  const normalized = message.toLowerCase();
  return normalized.includes('cnpj') && isDuplicadoMessage(normalized);
};

interface ConcessionariaModalProps {
  concessionaria: ConcessionariaResponse | null;
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onCodigoDisponivel?: (codigo: string, idConcessionaria: number | null) => Promise<boolean | null>;
  onSave: (concessionaria: ConcessionariaRequest) => void | Promise<void>;
}

export default function ConcessionariaModal({
  concessionaria,
  open,
  loading = false,
  onClose,
  onCodigoDisponivel,
  onSave,
}: ConcessionariaModalProps) {
  const [formData, setFormData] = useState<ConcessionariaRequest>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [codigoAvailability, setCodigoAvailability] = useState<CodigoAvailability>('idle');
  const codigoCheckSeq = useRef(0);

  useEffect(() => {
    if (!open) return;

    if (concessionaria) {
      setFormData({
        cdConcessionaria: concessionaria.cdConcessionaria,
        nmConcessionaria: concessionaria.nmConcessionaria,
        dsConcessionaria: concessionaria.dsConcessionaria || '',
        nrCnpj: onlyDigits(concessionaria.nrCnpj || ''),
        dsTelefone: onlyDigits(concessionaria.dsTelefone || ''),
        sgUf: concessionaria.sgUf || '',
        dsRodoviaTrecho: concessionaria.dsRodoviaTrecho || '',
        nrContratoAntt: concessionaria.nrContratoAntt || '',
        flAtivo: concessionaria.flAtivo,
      });
    } else {
      setFormData(emptyForm);
    }

    setErrors({});
    setSaving(false);
    setCodigoAvailability('idle');
    codigoCheckSeq.current += 1;
  }, [concessionaria, open]);

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    const codigo = normalizeCodigoConcessionaria(formData.cdConcessionaria);

    if (!codigo) {
      newErrors.cdConcessionaria = 'Código é obrigatório';
    }

    if (!formData.nmConcessionaria.trim()) {
      newErrors.nmConcessionaria = 'Nome é obrigatório';
    }

    if (formData.nrCnpj) {
      const cnpjDigits = onlyDigits(formData.nrCnpj);
      if (cnpjDigits.length > 0 && cnpjDigits.length < CNPJ_DIGITS) {
        newErrors.nrCnpj = `CNPJ deve ter ${CNPJ_DIGITS} dígitos`;
      } else if (cnpjDigits.length === CNPJ_DIGITS && !validateCNPJ(cnpjDigits)) {
        newErrors.nrCnpj = 'CNPJ inválido';
      }
    }

    if (formData.dsTelefone) {
      const telefoneDigits = onlyDigits(formData.dsTelefone);
      if (telefoneDigits.length > 0 && telefoneDigits.length < TELEFONE_FIXO_DIGITS) {
        newErrors.dsTelefone = `Telefone deve ter ${TELEFONE_FIXO_DIGITS} dígitos`;
      }
    }

    if (formData.sgUf && formData.sgUf.trim().length > 2) {
      newErrors.sgUf = 'UF deve ter no máximo 2 caracteres';
    }

    if (formData.dsRodoviaTrecho && formData.dsRodoviaTrecho.trim().length > 255) {
      newErrors.dsRodoviaTrecho = 'Rodovia/trecho deve ter no máximo 255 caracteres';
    }

    if (formData.nrContratoAntt && formData.nrContratoAntt.trim().length > 100) {
      newErrors.nrContratoAntt = 'Contrato ANTT deve ter no máximo 100 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const applyApiValidationErrors = (error: unknown) => {
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

    if (!Object.keys(nextErrors).length) return false;

    setErrors((prev) => ({ ...prev, ...nextErrors }));
    return true;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validateForm()) return;

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
          setErrors((prev) => ({
            ...prev,
            cdConcessionaria: 'Código já está em uso',
          }));
          return;
        }

        setCodigoAvailability('available');
      }

      await onSave({
        ...formData,
        cdConcessionaria: codigo,
        nmConcessionaria: formData.nmConcessionaria.trim(),
        dsConcessionaria: normalizeOptionalString(formData.dsConcessionaria) || null,
        nrCnpj: onlyDigits(formData.nrCnpj || '')
          ? mask.cnpj(formData.nrCnpj || '')
          : null,
        dsTelefone: onlyDigits(formData.dsTelefone || '')
          ? mask.telefoneFixo(formData.dsTelefone || '')
          : null,
        sgUf: normalizeOptionalString(formData.sgUf).toUpperCase() || null,
        dsRodoviaTrecho: normalizeOptionalString(formData.dsRodoviaTrecho) || null,
        nrContratoAntt: normalizeOptionalString(formData.nrContratoAntt) || null,
        flAtivo: concessionaria ? formData.flAtivo : 'S',
      });
    } catch (error) {
      applyApiValidationErrors(error);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof ConcessionariaRequest, value: string) => {
    let nextValue = value;

    if (field === 'cdConcessionaria') {
      nextValue = normalizeCodigoConcessionaria(value);
      codigoCheckSeq.current += 1;
      setCodigoAvailability('idle');
    } else if (field === 'sgUf') {
      nextValue = value.toUpperCase().slice(0, 2);
    } else if (field === 'nrCnpj') {
      nextValue = onlyDigits(value).slice(0, CNPJ_DIGITS);
    } else if (field === 'dsTelefone') {
      nextValue = onlyDigits(value).slice(0, TELEFONE_FIXO_DIGITS);
    } else if (field === 'dsRodoviaTrecho') {
      nextValue = value.slice(0, 255);
    } else if (field === 'nrContratoAntt') {
      nextValue = value.slice(0, 100);
    }

    setFormData(prev => ({ ...prev, [field]: nextValue }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

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

    const disponivel = await onCodigoDisponivel(
      codigo,
      concessionaria?.idConcessionaria ?? null,
    );

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
      setErrors((prev) => ({
        ...prev,
        cdConcessionaria: 'Código já está em uso',
      }));
    }
  }, [concessionaria, formData.cdConcessionaria, onCodigoDisponivel]);

  const FieldError = ({ field }: { field: string }) => {
    if (!errors[field]) return null;
    return (
      <div className="flex items-center gap-1 mt-1">
        <WarningCircleIcon className="h-4 w-4 text-red-500" />
        <p className="text-red-500 text-sm">{errors[field]}</p>
      </div>
    );
  };

  const CodigoAvailabilityHint = () => {
    if (errors.cdConcessionaria || codigoAvailability === 'idle') return null;

    if (codigoAvailability === 'checking') {
      return (
        <div className="flex items-center gap-1 mt-1 text-gray-500 text-sm">
          <SpinnerIcon className="h-4 w-4 animate-spin" />
          <span>Verificando código...</span>
        </div>
      );
    }

    if (codigoAvailability === 'available') {
      return (
        <div className="flex items-center gap-1 mt-1 text-green-600 text-sm">
          <CheckCircleIcon className="h-4 w-4" weight="fill" />
          <span>Código disponível</span>
        </div>
      );
    }

    return null;
  };

  const isSubmitDisabled =
    saving ||
    loading ||
    codigoAvailability === 'checking' ||
    codigoAvailability === 'unavailable' ||
    !normalizeCodigoConcessionaria(formData.cdConcessionaria) ||
    !formData.nmConcessionaria.trim();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{concessionaria ? 'Editar concessionária' : 'Nova concessionária'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {concessionaria?.flAtivo === 'N' && (
            <RegistroDesativacao concessionaria={concessionaria} variant="danger" />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cdConcessionaria">
                Código <span className="text-red-500">*</span>
              </Label>
              <Input
                id="cdConcessionaria"
                value={formData.cdConcessionaria}
                onChange={(event) => handleChange('cdConcessionaria', event.target.value)}
                onBlur={() => {
                  void checkCodigoDisponivel();
                }}
                placeholder="Ex: mvp"
                className={
                  errors.cdConcessionaria
                    ? 'border-red-500'
                    : codigoAvailability === 'available'
                      ? 'border-green-500'
                      : ''
                }
              />
              <FieldError field="cdConcessionaria" />
              <CodigoAvailabilityHint />
            </div>

            <div>
              <Label htmlFor="nmConcessionaria">
                Nome <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nmConcessionaria"
                value={formData.nmConcessionaria}
                onChange={(event) => handleChange('nmConcessionaria', event.target.value)}
                placeholder="Digite o nome da concessionária"
                className={errors.nmConcessionaria ? 'border-red-500' : ''}
              />
              <FieldError field="nmConcessionaria" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nrCnpj">CNPJ</Label>
              <Input
                id="nrCnpj"
                value={mask.cnpj(formData.nrCnpj || '')}
                onChange={(event) => handleChange('nrCnpj', event.target.value)}
                placeholder="00.000.000/0000-00"
                maxLength={18}
                inputMode="numeric"
                className={errors.nrCnpj ? 'border-red-500' : ''}
              />
              <FieldError field="nrCnpj" />
            </div>

            <div>
              <Label htmlFor="dsTelefone">Telefone</Label>
              <Input
                id="dsTelefone"
                value={mask.telefoneFixo(formData.dsTelefone || '')}
                onChange={(event) => handleChange('dsTelefone', event.target.value)}
                placeholder="(00) 0000-0000"
                maxLength={14}
                inputMode="tel"
                className={errors.dsTelefone ? 'border-red-500' : ''}
              />
              <FieldError field="dsTelefone" />
            </div>

            <div>
              <Label htmlFor="sgUf">UF</Label>
              <Select
                value={formData.sgUf || undefined}
                onValueChange={(value) => handleChange('sgUf', value === '__empty' ? '' : value)}
              >
                <SelectTrigger id="sgUf" className={errors.sgUf ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione a UF" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__empty">Não informado</SelectItem>
                  {UFS_BRASIL.map((uf) => (
                    <SelectItem key={uf} value={uf}>
                      {uf}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError field="sgUf" />
            </div>

            <div>
              <Label htmlFor="nrContratoAntt">Contrato ANTT</Label>
              <Input
                id="nrContratoAntt"
                value={formData.nrContratoAntt || ''}
                onChange={(event) => handleChange('nrContratoAntt', event.target.value)}
                placeholder="Número do contrato ANTT"
                maxLength={100}
                className={errors.nrContratoAntt ? 'border-red-500' : ''}
              />
              <FieldError field="nrContratoAntt" />
            </div>
          </div>

          <div>
            <Label htmlFor="dsRodoviaTrecho">Rodovia / trecho</Label>
            <Input
              id="dsRodoviaTrecho"
              value={formData.dsRodoviaTrecho || ''}
              onChange={(event) => handleChange('dsRodoviaTrecho', event.target.value)}
              placeholder="Ex: BR-101 - Trecho Sul"
              maxLength={255}
              className={errors.dsRodoviaTrecho ? 'border-red-500' : ''}
            />
            <FieldError field="dsRodoviaTrecho" />
          </div>

          <div>
            <Label htmlFor="dsConcessionaria">Descrição</Label>
            <Textarea
              id="dsConcessionaria"
              value={formData.dsConcessionaria || ''}
              onChange={(event) => handleChange('dsConcessionaria', event.target.value)}
              placeholder="Digite a descrição da concessionária"
              rows={3}
            />
          </div>

          {!concessionaria && (
            <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              <InfoIcon className="mt-0.5 h-4 w-4 flex-shrink-0" weight="fill" />
              <div className="space-y-1">
                <p>
                  <span className="font-medium">Observação:</span> cada concessionária tem seus
                  próprios dados: áreas, temas, responsáveis, obrigações, solicitações, caixa de
                  entrada, observações e lembretes.
                </p>
                <p>
                  Após criar, você poderá <span className="font-medium">configurar agora</span>{' '}
                  (e-mail, SMTP e período) ou fazer isso depois pela engrenagem na tabela.
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-primary hover:bg-blue-700" disabled={isSubmitDisabled}>
              {saving ? 'Salvando...' : concessionaria ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
