import { PageDef } from "@/types/pages/pages";
import {
  PresentationChartIcon, BuildingIcon, ClipboardTextIcon, EnvelopeSimpleIcon, TagIcon, UsersIcon,
  ArrowsLeftRightIcon
} from "@phosphor-icons/react";

export const PAGES_DEF: PageDef[] = [
  // {
  //   path: "/dashboard",
  //   label: "Dashboard",
  //   icon: PresentationChartIcon
  // },
  {
    path: "/email",
    label: "Email",
    icon: EnvelopeSimpleIcon
  },
  {
    path: "/responsaveis",
    label: "Responsáveis",
    icon: UsersIcon
  },
  {
    path: "/areas",
    label: "Áreas",
    icon: BuildingIcon
  },
  {
    path: "/temas",
    label: "Temas",
    icon: TagIcon
  },
  {
    path: "/solicitacoes",
    label: "Solicitações",
    icon: ClipboardTextIcon
  },
];

export const PUBLIC_ROUTES: string[] = ["/"]