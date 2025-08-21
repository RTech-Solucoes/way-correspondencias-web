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
  const nameInital = names?.[0]?.charAt(0).toUpperCase()
  const surnameInital = names?.[names.length - 1]?.charAt(0).toUpperCase()

  return nameInital + surnameInital
}

export function getStatusText(status: StatusAtivo | null): string {
  if (!status) return '';

  return status === 'S' ? "Ativo" : "Inativo";
}