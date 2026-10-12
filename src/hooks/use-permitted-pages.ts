import {usePermissoesState} from "@/stores/permissoes-store";
import {PageDef} from "@/constants/pages/pages";
import {PAGES_DEF} from "@/constants/pages";

export function usePermittedPages(): PageDef[] {
  const permissoesStorage = usePermissoesState();
  if (!permissoesStorage?.length) {
    return [];
  }

  return PAGES_DEF.filter((page) => {
    if (page.permission && !permissoesStorage.some((item) => item.trim() === page.permission)) {
      return false;
    }

    return true;
  });
}
