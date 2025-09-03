import {usePermissoesState} from "@/stores/permissoes-store";
import {PageDef} from "@/types/pages/pages";
import {PAGES_DEF} from "@/constants/pages";

export function usePermittedPages(): PageDef[] {
  const permissoesStorage = usePermissoesState();

  if (!permissoesStorage) {
    return [];
  } else {
    return PAGES_DEF.filter(page => permissoesStorage.includes(page.permission));
  }
}