import { Icon } from "@phosphor-icons/react";
import { Permissoes } from "@/constants/permissoes";

export interface PageDef {
  path: string;
  label: string;
  icon: Icon;
  permission?: Permissoes;
  module: string;
}

export interface ModuleDef {
  id: string;
  label: string;
  icon: Icon;
  description?: string;
}