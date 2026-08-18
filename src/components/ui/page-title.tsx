import {usePathname} from "next/navigation";
import {PAGES_DEF} from "@/constants/pages";
import {PageDef} from "@/constants/pages/pages";
import { HelpTooltip } from "@/components/help-tooltip";

interface PageTitleProps {
  help?: string;
  helpLabel?: string;
}

export default function PageTitle ({ help, helpLabel }: PageTitleProps) {
  const pathname = usePathname();

  const currentPage = PAGES_DEF.find((page: PageDef) => page.path === pathname);

  if (currentPage) {
    return (
      <div className="flex flex-row gap-1.5 items-center text-gray-900 mb-4">
        <h1 className="text-xl font-semibold">
          {currentPage.label}
        </h1>
        {help && (
          <HelpTooltip content={help} label={helpLabel ?? currentPage.label} />
        )}
      </div>
    )
  }
}
