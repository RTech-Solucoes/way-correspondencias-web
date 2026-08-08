import {usePermissoesState} from "@/stores/permissoes-store";
import {PageDef} from "@/constants/pages/pages";
import {PAGES_DEF} from "@/constants/pages";
import { getLayoutClient } from "@/lib/layout/layout-client";

export function usePermittedPages(): PageDef[] {
  const permissoesStorage = usePermissoesState();
  const layoutClient = getLayoutClient();

  if (!permissoesStorage?.length) {
    return [];
  }

  return PAGES_DEF.filter((page) => {
    if (!page.permission || !permissoesStorage.some((item) => item.trim() === page.permission)) {
      return false;
    }

    if (page.clients?.length && !page.clients.includes(layoutClient)) {
      return false;
    }

    return true;
  });
}