import {usePermittedPages} from "@/hooks/use-permitted-pages";

export function usePermittedRoutes(): string[] {
  const permittedPages = usePermittedPages()

  if (!permittedPages) {
    return [];
  } else {
    return permittedPages.map(page => page.path);
  }
}