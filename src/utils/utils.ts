import {type ClassValue, clsx} from 'clsx';
import {twMerge} from 'tailwind-merge';
import {StatusAtivo} from "@/types/misc/types";
import {ArquivoDTO, TipoResponsavelAnexo} from '@/api/anexos/type';
import { z } from "zod";
import { cpf } from "cpf-cnpj-validator";
import dayjs from "dayjs";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function capitalize(str: string): string {
  if (!str) return '';

  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function getInitials(name: string | null): string {
  if (!name) return '';

  const names = name.split(' ')
  const firstNameInital = names?.[0]?.charAt(0).toUpperCase()
  const lastNameInital = names?.[names?.length - 1]?.charAt(0).toUpperCase()

  return firstNameInital + lastNameInital
}

export function getFirstAndLastName(name: string | null): string {
  if (!name) return '';

  const names = name.split(' ')
  const firstName = names?.[0]
  const lastName = names?.[names?.length - 1]

  if (firstName === lastName) {
    return firstName
  } else {
    return firstName + ' ' + lastName
  }
}

export function getStatusText(status: StatusAtivo | null): string {
  if (!status) return '';

  return status === 'S' ? "Ativo" : "Inativo";
}

export function formatDate(dateString: string | null): string {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return 'Data inválida';
    }
    
    return date.toLocaleDateString('pt-BR');
  } catch (error) {
    return 'Data inválida';
  }
}

export function formatDateTime(dateString?: string): string { 
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

export function base64ToUint8Array(b64: string): Uint8Array {
  let clean = b64.includes('base64,') ? b64.split('base64,')[1] : b64;
  clean = clean.replace(/\s/g, '');
  clean = clean.replace(/-/g, '+').replace(/_/g, '/');

  const mod = clean.length % 4;
  if (mod === 2) clean += '==';
  else if (mod === 3) clean += '=';
  else if (mod !== 0) {
    throw new Error('Base64 inválido (comprimento inesperado).');
  }

  const bin = atob(clean);
  const len = bin.length;
  const arr = new Uint8Array(len);
  for (let i = 0; i < len; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}

function toArrayBuffer(u8: Uint8Array): ArrayBuffer {
  const ab = new ArrayBuffer(u8.byteLength);
  new Uint8Array(ab).set(u8);
  return ab;
}

export function saveBlob(
  bytes: Uint8Array | ArrayBuffer | number[] | string,
  mime: string | null | undefined,
  filename: string
) {
  let part: BlobPart;

  if (typeof bytes === 'string') {
    const u8 = base64ToUint8Array(bytes);
    part = toArrayBuffer(u8);
  } else if (bytes instanceof Uint8Array) {
    part = toArrayBuffer(bytes);
  } else if (Array.isArray(bytes)) {
    part = toArrayBuffer(new Uint8Array(bytes));
  } else {
    part = bytes as ArrayBuffer;
  }

  const blob = new Blob([part], { type: mime || 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'arquivo';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export const getRows = (string: string | undefined) => {
  if (!string) return 1;

  const lineBreaks = (string.match(/\n/g) || []).length;

  return (string.split('\n').length) + lineBreaks;
}

export function fileToBase64String(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      const b64 = result.includes("base64,") ? result.split("base64,")[1] : result;
      resolve(b64);
    };
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}

export async function fileToArquivoDTO(file: File, tpResponsavel: TipoResponsavelAnexo): Promise<ArquivoDTO> {
  const conteudoArquivo = await fileToBase64String(file);
  return {
    nomeArquivo: file.name,
    tipoConteudo: file.type,
    tpResponsavel,
    conteudoArquivo,
  };
}

export const formatCPF = (cpf: string): string => {
  if (!cpf) return '';
    const cleanCPF = cpf.replace(/\D/g, '');
  
  if (cleanCPF.length === 11) {
    return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  
  return cpf; 
};

export const validateCPF = (cpf: string): boolean => {
  const cpfLimpo = cpf.replace(/\D/g, '');

  if (cpfLimpo.length !== 11) return false;

  if (/^(\d)\1{10}$/.test(cpfLimpo)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpfLimpo[i]) * (10 - i);
  }
  let resto = soma % 11;
  const digito1 = resto < 2 ? 0 : 11 - resto;

  if (parseInt(cpfLimpo[9]) !== digito1) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpfLimpo[i]) * (11 - i);
  }
  resto = soma % 11;
  const digito2 = resto < 2 ? 0 : 11 - resto;

  return parseInt(cpfLimpo[10]) === digito2;
};

export const hasPermissao = (permissao: string): boolean | null => {
  const permissoesStorage = localStorage.getItem("permissoes-storage");

  if (!permissoesStorage) {
    return null;
  } else {
    const parsed = JSON.parse(permissoesStorage);
    return parsed?.state?.permissoes?.includes(permissao) ?? null;
  }
}

function maskCPF(value: string): string {
  return value
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2"); 
}

export const mask = {
  cpf: maskCPF,
}

const cpfSchema = z
    .string()
    .min(1, "CPF é obrigatório")
    .refine((value) => cpf.isValid(value), {
      message: "CPF inválido",
    })

const usernameSchema = z
    .string()
    .min(1, "Usuário é obrigatório")
    .min(3, "Usuário deve ter pelo menos 3 caracteres")
    .max(30, "Usuário deve ter no máximo 30 caracteres")

const emailSchema = z
    .string()
    .min(1, "Email é obrigatório")
    .email("Email inválido")

const birthDateSchema = z
    .string()
    .min(1, "Data de nascimento é obrigatória")
    .refine((value) => dayjs(value, "YYYY-MM-DD", true).isValid(), {
      message: "Data inválida (use o formato YYYY-MM-DD)",
    })
    .refine((value) => {
      const date = dayjs(value, "YYYY-MM-DD");
      const now = dayjs();

      if (!date.isValid()) return false;
      if (date.isAfter(now)) return false;

      const MIN_AGE = 1;
      const MAX_AGE = 120;

      const age = now.diff(date, "year");
      return age >= MIN_AGE && age <= MAX_AGE;
    }, {
      message: `Data inválida.`,
    })

const nameSchema = z
    .string()
    .min(1, "Nome é obrigatório")
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .refine((value) => /^[a-zA-ZÀ-ÿ\s]+$/.test(value.trim()), {
      message: "Nome deve conter apenas letras e espaços",
    })
    .transform((value) => value.trim())

const onlyLettersSchema = z
    .string()
    .min(1, "Nome é obrigatório")
    .refine((value) => /^[a-zA-Z]+$/.test(value), {
      message: "Nome deve conter apenas letras",
    })

export const formValidator = {
  name: nameSchema,
  onlyLetters: onlyLettersSchema,
  username: usernameSchema,
  cpf: cpfSchema,
  email: emailSchema,
  birthDate: birthDateSchema,
  id: z.number().positive("ID é obrigatório"),
};

export const repeat = (times: number): undefined[] => {
  return Array.from({length: times}, () => undefined);
}

export function normalizeText(value?: string | null): string {
  if (!value) return '';
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[,.]/g, '')
    .toLowerCase()
    .trim();
}

export const hoursToDaysAndHours = (hours: number): string => {
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;

  let resultString = `${days} dia${days > 1 ? 's' : ''}`;

  if (remainingHours) {
    resultString += ` e ${remainingHours} hora${remainingHours > 1 ? 's' : ''}`;
  }

  return resultString
};


export const formatDateBr = (dateString?: string): string => {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString;
  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
}
