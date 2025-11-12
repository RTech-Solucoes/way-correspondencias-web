import { ModuleDef, PageDef } from "@/types/pages/pages";
import { 
  BuildingIcon, 
  ClipboardTextIcon, 
  EnvelopeSimpleIcon, 
  PresentationChartIcon, 
  TagIcon, 
  UsersIcon,
  FileTextIcon,
  StackIcon
} from "@phosphor-icons/react";
import { Permissoes } from "@/constants/permissoes";

export const MODULES_DEF: ModuleDef[] = [
  {
    id: "correspondencias",
    label: "Gestão de Correspondências",
    icon: EnvelopeSimpleIcon,
  },
  {
    id: "obrigacoes",
    label: "Gestão de Obrigações",
    icon: FileTextIcon,
  },
];

export const PAGES_DEF: PageDef[] = [
  // Módulo: Gestão de Correspondências
  {
    path: "/dashboard-correspondencia",
    label: "Dashboard",
    icon: PresentationChartIcon,
    permission: Permissoes.SOLICITACAO_LISTAR,
    module: "correspondencias"
  },
  {
    path: "/solicitacoes",
    label: "Solicitações",
    icon: ClipboardTextIcon,
    permission: Permissoes.SOLICITACAO_LISTAR,
    module: "correspondencias"
  },
  {
    path: "/email",
    label: "Caixa de entrada",
    icon: EnvelopeSimpleIcon,
    permission: Permissoes.EMAIL_LISTAR,
    module: "correspondencias"
  },
  
  // Módulo: Gestão de Obrigações
  {
    path: "/dashboard-obrigacoes",
    label: "Dashboard",
    icon: PresentationChartIcon,
    permission: Permissoes.SOLICITACAO_LISTAR,
    module: "obrigacoes"
  },
  {
    path: "/obrigacao",
    label: "Obrigações Contratuais",
    icon: StackIcon,
    permission: Permissoes.SOLICITACAO_LISTAR,
    module: "obrigacoes"
  },
  
  // Módulo: Gestão de Recursos
  {
    path: "/areas",
    label: "Áreas",
    icon: BuildingIcon,
    permission: Permissoes.AREA_LISTAR,
    module: "recursos"
  },
  {
    path: "/temas",
    label: "Temas",
    icon: TagIcon,
    permission: Permissoes.TEMA_LISTAR,
    module: "recursos"
  },
  {
    path: "/responsaveis",
    label: "Responsáveis",
    icon: UsersIcon,
    permission: Permissoes.RESPONSAVEL_LISTAR,
    module: "recursos"
  },
];

export const PUBLIC_ROUTES: string[] = ["/"]