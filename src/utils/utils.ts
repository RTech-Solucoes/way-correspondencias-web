import {type ClassValue, clsx} from 'clsx';
import {twMerge} from 'tailwind-merge';
import {StatusAtivo} from "@/types/misc/types";

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
  if (!string) return 5;
  return string.split('\n').length / 5;
}