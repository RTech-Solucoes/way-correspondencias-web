import {usePermissoesState} from "@/stores/permissoes-store";

export function useHasPermissao(permissao: string): boolean | null {
  const permissoesStorage = usePermissoesState();

  if (!permissoesStorage) {
    return null;
  }

  const permissaoNormalizada = permissao.trim();
  return permissoesStorage.some((item) => item.trim() === permissaoNormalizada);
}