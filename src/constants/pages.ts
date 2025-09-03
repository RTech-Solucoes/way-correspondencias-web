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
    path: "/solicitacoes",
    label: "Solicitações",
    icon: ClipboardTextIcon
  },
  {
    path: "/email",
    label: "Caixa de entrada",
    icon: EnvelopeSimpleIcon
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
    path: "/responsaveis",
    label: "Responsáveis",
    icon: UsersIcon
  },
];

export const PUBLIC_ROUTES: string[] = ["/"]