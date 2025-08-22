import {PageDef} from "@/types/pages/pages";
import {useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";
import {cn} from "@/utils/utils";

export default function Nav ({
  navigationItems,
  pathname,
} : {
  navigationItems: PageDef[],
  pathname: string,
}) {
  const router = useRouter();

  const handleNavigation = (id: string) => {
    router.push(id);
  }

  return (
    <nav className="flex flex-col grow gap-3 px-2 py-3">
      {
        navigationItems.map((item) => {
          const isActive = pathname.startsWith(item.path);

          return (
            <Button
              key={item.path}
              variant={isActive ? "default" : "ghost"}
              className={cn(
                "flex justify-start w-full text-left h-11 text-sm px-4 transition-colors duration-200",
                isActive && "bg-primary text-white"
              )}
              onClick={() => handleNavigation(item.path)}
            >
              <item.icon
                weight={isActive ? "fill" : "bold"}
                className="h-4 w-4 flex-shrink-0 mr-3"
              />
              {item.label}
            </Button>
          );
        })
      }
    </nav>
  )
}