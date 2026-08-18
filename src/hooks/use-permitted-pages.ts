import {usePermissoesState} from "@/stores/permissoes-store";
import {PageDef} from "@/constants/pages/pages";
import {PAGES_DEF} from "@/constants/pages";

export function usePermittedPages(): PageDef[] {
  const permissoesStorage = usePermissoesState();

  if (!permissoesStorage) {
    return [];
  }

  return PAGES_DEF.filter(page =>
    !page.permission || permissoesStorage.includes(page.permission)
  );
}