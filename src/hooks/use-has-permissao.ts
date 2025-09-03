import {usePermissoesState} from "@/stores/permissoes-store";

export function useHasPermissao(permissao: string): boolean | null {
  const permissoesStorage = usePermissoesState();

  if (!permissoesStorage) {
    return null;
  } else {
    return permissoesStorage?.includes(permissao) ?? null;
  }
}