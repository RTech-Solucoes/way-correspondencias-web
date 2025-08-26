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

  return firstName + ' ' + lastName
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