import {usePathname} from "next/navigation";
import {PAGES_DEF} from "@/constants/pages";
import {PageDef} from "@/types/pages/pages";

export default function PageTitle () {
  const pathname = usePathname();

  const currentPage = PAGES_DEF.find((page: PageDef) => page.path === pathname);

  if (currentPage) {
    return (
      <div className="flex flex-row gap-3 items-center text-gray-900">
        <currentPage.icon className="h-9 w-9"/>
        <h1 className="text-3xl font-bold">
          {currentPage.label}
        </h1>
      </div>
    )
  }
}
