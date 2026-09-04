import { ConcessionariaRequest, ConcessionariaResponse } from '@/api/concessionaria/types';
import { StatusAtivo } from '@/utils/misc/status-ativo';
import { mask, onlyDigits, validateCNPJ } from '@/utils/utils';

export const CNPJ_DIGITS = 14;
export const TELEFONE_0800_DIGITS = 11;
export const TELEFONE_FIXO_DIGITS = 10;
export const KM_MAX = 999999.999;

export const UFS_BRASIL = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
] as const;

export type CodigoAvailability = 'idle' | 'checking' | 'available' | 'unavailable';

/** O formulário guarda tudo como texto; a conversão acontece no envio. */
export interface ConcessionariaFormState {
  cdConcessionaria: string;
  nmConcessionaria: string;
  nmRazaoSocial: string;
  nmFantasia: string;
  dsConcessionaria: string;
  nrCnpj: string;
  dsTelefone: string;
  sgUf: string;
  dsEndereco: string;
  dsRodoviaTrecho: string;
  dsSegmentoConcessao: string;
  nrKmInicial: string;
  nrKmFinal: string;
  nrContratoAntt: string;
  dtAssinaturaContrato: string;
  dtAssuncao: string;
  flAtivo: StatusAtivo;
}

export const emptyForm: ConcessionariaFormState = {
  cdConcessionaria: '',
  nmConcessionaria: '',
  nmRazaoSocial: '',
  nmFantasia: '',
  dsConcessionaria: '',
  nrCnpj: '',
  dsTelefone: '',
  sgUf: '',
  dsEndereco: '',
  dsRodoviaTrecho: '',
  dsSegmentoConcessao: '',
  nrKmInicial: '',
  nrKmFinal: '',
  nrContratoAntt: '',
  dtAssinaturaContrato: '',
  dtAssuncao: '',
  flAtivo: 'S',
};

export type ConcessionariaField = keyof ConcessionariaFormState;

export const isConcessionariaField = (field: string): field is ConcessionariaField =>
  field in emptyForm;

/** Props comuns a todas as seções do formulário. */
export interface SecaoConcessionariaProps {
  formData: ConcessionariaFormState;
  errors: Record<string, string>;
  onChange: (field: ConcessionariaField, value: string) => void;
}

export const normalizeCodigoConcessionaria = (value: string) =>
  value.replace(/\s+/g, '').toLowerCase();

const normalizeOptionalString = (value?: string | null) => value?.trim() || '';

const toOptional = (value?: string | null) => normalizeOptionalString(value) || null;

export const is0800 = (digits: string) => digits.startsWith('0800');

/**
 * O padrão do cadastro é 0800, mas concessionárias antigas têm telefone fixo
 * gravado com 10 dígitos: nesse caso mantém a máscara antiga em vez de quebrar o valor.
 */
export const formatTelefone = (digits: string) =>
  is0800(digits) || digits.length > TELEFONE_FIXO_DIGITS
    ? mask.telefone0800(digits)
    : mask.telefoneFixo(digits);

/** "12,5" e "12.5" viram 12.5; vazio vira null. */
export const parseKm = (value: string): number | null => {
  const normalizado = value.replace(',', '.').trim();
  if (!normalizado) return null;
  const numero = Number(normalizado);
  return Number.isFinite(numero) ? numero : null;
};

const formatKm = (value?: number | null) =>
  value === null || value === undefined ? '' : String(value).replace('.', ',');

/** LocalDate do backend chega como "2026-09-03"; o input date usa o mesmo formato. */
const formatDataInput = (value?: string | null) => (value ? value.slice(0, 10) : '');

export function formStateFromResponse(
  concessionaria: ConcessionariaResponse,
): ConcessionariaFormState {
  return {
    cdConcessionaria: concessionaria.cdConcessionaria,
    nmConcessionaria: concessionaria.nmConcessionaria,
    nmRazaoSocial: concessionaria.nmRazaoSocial || '',
    nmFantasia: concessionaria.nmFantasia || '',
    dsConcessionaria: concessionaria.dsConcessionaria || '',
    nrCnpj: onlyDigits(concessionaria.nrCnpj || ''),
    dsTelefone: onlyDigits(concessionaria.dsTelefone || ''),
    sgUf: concessionaria.sgUf || '',
    dsEndereco: concessionaria.dsEndereco || '',
    dsRodoviaTrecho: concessionaria.dsRodoviaTrecho || '',
    dsSegmentoConcessao: concessionaria.dsSegmentoConcessao || '',
    nrKmInicial: formatKm(concessionaria.nrKmInicial),
    nrKmFinal: formatKm(concessionaria.nrKmFinal),
    nrContratoAntt: concessionaria.nrContratoAntt || '',
    dtAssinaturaContrato: formatDataInput(concessionaria.dtAssinaturaContrato),
    dtAssuncao: formatDataInput(concessionaria.dtAssuncao),
    flAtivo: concessionaria.flAtivo,
  };
}

export function toRequest(
  formData: ConcessionariaFormState,
  concessionaria: ConcessionariaResponse | null,
): ConcessionariaRequest {
  const telefoneDigits = onlyDigits(formData.dsTelefone);

  return {
    cdConcessionaria: normalizeCodigoConcessionaria(formData.cdConcessionaria),
    nmConcessionaria: formData.nmConcessionaria.trim(),
    nmRazaoSocial: toOptional(formData.nmRazaoSocial),
    nmFantasia: toOptional(formData.nmFantasia),
    dsConcessionaria: toOptional(formData.dsConcessionaria),
    nrCnpj: onlyDigits(formData.nrCnpj) ? mask.cnpj(formData.nrCnpj) : null,
    dsTelefone: telefoneDigits ? formatTelefone(telefoneDigits) : null,
    sgUf: normalizeOptionalString(formData.sgUf).toUpperCase() || null,
    dsEndereco: toOptional(formData.dsEndereco),
    dsRodoviaTrecho: toOptional(formData.dsRodoviaTrecho),
    dsSegmentoConcessao: toOptional(formData.dsSegmentoConcessao),
    nrKmInicial: parseKm(formData.nrKmInicial),
    nrKmFinal: parseKm(formData.nrKmFinal),
    nrContratoAntt: toOptional(formData.nrContratoAntt),
    dtAssinaturaContrato: formData.dtAssinaturaContrato || null,
    dtAssuncao: formData.dtAssuncao || null,
    flAtivo: concessionaria ? formData.flAtivo : 'S',
  };
}

export function validarFormulario(formData: ConcessionariaFormState): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!normalizeCodigoConcessionaria(formData.cdConcessionaria)) {
    errors.cdConcessionaria = 'Código é obrigatório';
  }

  if (!formData.nmConcessionaria.trim()) {
    errors.nmConcessionaria = 'Nome é obrigatório';
  }

  if (formData.nrCnpj) {
    const cnpjDigits = onlyDigits(formData.nrCnpj);
    if (cnpjDigits.length > 0 && cnpjDigits.length < CNPJ_DIGITS) {
      errors.nrCnpj = `CNPJ deve ter ${CNPJ_DIGITS} dígitos`;
    } else if (cnpjDigits.length === CNPJ_DIGITS && !validateCNPJ(cnpjDigits)) {
      errors.nrCnpj = 'CNPJ inválido';
    }
  }

  if (formData.dsTelefone) {
    const telefoneDigits = onlyDigits(formData.dsTelefone);
    const digitosEsperados = is0800(telefoneDigits)
      ? TELEFONE_0800_DIGITS
      : TELEFONE_FIXO_DIGITS;

    if (telefoneDigits.length > 0 && telefoneDigits.length < digitosEsperados) {
      errors.dsTelefone = is0800(telefoneDigits)
        ? `Telefone 0800 deve ter ${TELEFONE_0800_DIGITS} dígitos`
        : `Telefone deve ter ${TELEFONE_FIXO_DIGITS} dígitos ou começar com 0800`;
    }
  }

  const kmInicial = parseKm(formData.nrKmInicial);
  const kmFinal = parseKm(formData.nrKmFinal);

  if (formData.nrKmInicial.trim() && kmInicial === null) {
    errors.nrKmInicial = 'Informe um número válido';
  } else if (kmInicial !== null && (kmInicial < 0 || kmInicial > KM_MAX)) {
    errors.nrKmInicial = 'Km inicial fora do intervalo permitido';
  }

  if (formData.nrKmFinal.trim() && kmFinal === null) {
    errors.nrKmFinal = 'Informe um número válido';
  } else if (kmFinal !== null && (kmFinal < 0 || kmFinal > KM_MAX)) {
    errors.nrKmFinal = 'Km final fora do intervalo permitido';
  } else if (kmInicial !== null && kmFinal !== null && kmFinal < kmInicial) {
    errors.nrKmFinal = 'Km final não pode ser menor que o km inicial';
  }

  if (
    formData.dtAssinaturaContrato &&
    formData.dtAssuncao &&
    formData.dtAssuncao < formData.dtAssinaturaContrato
  ) {
    errors.dtAssuncao = 'A assunção não pode ser anterior à assinatura do contrato';
  }

  return errors;
}

/** Normalização aplicada a cada tecla digitada (tamanho, máscara e formato). */
export function normalizarValorDoCampo(field: ConcessionariaField, value: string): string {
  if (field === 'cdConcessionaria') {
    return normalizeCodigoConcessionaria(value);
  }

  if (field === 'sgUf') {
    return value.toUpperCase().slice(0, 2);
  }

  if (field === 'nrCnpj') {
    return onlyDigits(value).slice(0, CNPJ_DIGITS);
  }

  if (field === 'dsTelefone') {
    return onlyDigits(value).slice(0, TELEFONE_0800_DIGITS);
  }

  if (field === 'nrKmInicial' || field === 'nrKmFinal') {
    // dígitos com um único separador decimal e até 3 casas
    const somenteNumeros = value.replace(/[^\d.,]/g, '').replace(/[.,](?=.*[.,])/g, '');
    const [inteiro, decimal] = somenteNumeros.split(/[.,]/);
    return decimal === undefined
      ? inteiro.slice(0, 6)
      : `${inteiro.slice(0, 6)},${decimal.slice(0, 3)}`;
  }

  if (field === 'nmConcessionaria' || field === 'nmRazaoSocial' || field === 'nmFantasia') {
    return value.slice(0, 200);
  }

  if (field === 'dsEndereco' || field === 'dsRodoviaTrecho' || field === 'dsSegmentoConcessao') {
    return value.slice(0, 255);
  }

  if (field === 'nrContratoAntt') {
    return value.slice(0, 100);
  }

  return value;
}

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

export const isCodigoDuplicadoMessage = (message: string) => {
  const normalized = message.toLowerCase();
  const mentionsCodigo = normalized.includes('código') || normalized.includes('codigo');
  const mentionsCnpj = normalized.includes('cnpj');
  return mentionsCodigo && !mentionsCnpj && isDuplicadoMessage(normalized);
};

export const isCnpjDuplicadoMessage = (message: string) => {
  const normalized = message.toLowerCase();
  return normalized.includes('cnpj') && isDuplicadoMessage(normalized);
};
