import { Icon } from "@phosphor-icons/react";
import { Permissoes } from "@/constants/permissoes";
import { ClienteEnum } from "@/lib/layout/layout-client.enum";

export interface PageDef {
  path: string;
  label: string;
  icon: Icon;
  permission?: Permissoes;
  module: string;
  clients?: ClienteEnum[];
}

export interface ModuleDef {
  id: string;
  label: string;
  icon: Icon;
  description?: string;
}