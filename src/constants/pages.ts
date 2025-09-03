import {PageDef} from "@/types/pages/pages";
import {BuildingIcon, ClipboardTextIcon, EnvelopeSimpleIcon, TagIcon, UsersIcon} from "@phosphor-icons/react";
import {Permissoes} from "@/constants/permissoes";

export const PAGES_DEF: PageDef[] = [
  {
    path: "/solicitacoes",
    label: "Solicitações",
    icon: ClipboardTextIcon,
    permission: Permissoes.SOLICITACAO_LISTAR
  },
  {
    path: "/email",
    label: "Caixa de entrada",
    icon: EnvelopeSimpleIcon,
    permission: Permissoes.EMAIL_LISTAR
  },
  {
    path: "/areas",
    label: "Áreas",
    icon: BuildingIcon,
    permission: Permissoes.AREA_LISTAR
  },
  {
    path: "/temas",
    label: "Temas",
    icon: TagIcon,
    permission: Permissoes.TEMA_LISTAR
  },
  {
    path: "/responsaveis",
    label: "Responsáveis",
    icon: UsersIcon,
    permission: Permissoes.RESPONSAVEL_LISTAR
  },
];

export const PUBLIC_ROUTES: string[] = ["/"]