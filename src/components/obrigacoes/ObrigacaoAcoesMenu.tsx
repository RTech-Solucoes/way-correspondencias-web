'use client';

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  EyeIcon,
  DotsThreeOutlineIcon,
  TrashIcon,
  PencilSimpleIcon,
  PaperPlaneRightIcon,
} from "@phosphor-icons/react";
import { ObrigacaoResponse } from "@/api/obrigacao/types";
import { BriefcaseIcon, FileTextIcon } from "lucide-react";

interface ObrigacaoAcoesMenuProps {
  obrigacao: ObrigacaoResponse;
  onVisualizar?: (obrigacao: ObrigacaoResponse) => void;
  onEditar?: (obrigacao: ObrigacaoResponse) => void;
  onAnexarProtocolo?: (obrigacao: ObrigacaoResponse) => void;
  onEncaminharTramitacao?: (obrigacao: ObrigacaoResponse) => void;
  onEnviarArea?: (obrigacao: ObrigacaoResponse) => void;
  onExcluir?: (obrigacao: ObrigacaoResponse) => void;
}

export function ObrigacaoAcoesMenu({
  obrigacao,
  onVisualizar,
  onEditar,
  onAnexarProtocolo,
  onEncaminharTramitacao,
  onEnviarArea,
  onExcluir,
}: ObrigacaoAcoesMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="h-8 w-8 p-0 rounded-full shadow-sm border-0 hover:shadow-md transition-shadow flex items-center justify-center"
        >
          <DotsThreeOutlineIcon className="h-5 w-5" weight="fill" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {onVisualizar && (
          <DropdownMenuItem onClick={() => onVisualizar(obrigacao)}>
            <EyeIcon className="mr-2 h-4 w-4" />
            Visualizar
          </DropdownMenuItem>
        )}
        {onEditar && (
          <DropdownMenuItem onClick={() => onEditar(obrigacao)}>
            <PencilSimpleIcon className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
        )}
        {onAnexarProtocolo && (
          <DropdownMenuItem onClick={() => onAnexarProtocolo(obrigacao)}>
            <FileTextIcon className="mr-2 h-4 w-4" />
            Anexar Protocolo
          </DropdownMenuItem>
        )}
        {onEncaminharTramitacao && (
          <DropdownMenuItem onClick={() => onEncaminharTramitacao(obrigacao)}>
            <PaperPlaneRightIcon className="mr-2 h-4 w-4" />
            Encaminhar para tramitação
          </DropdownMenuItem>
        )}
        {onEnviarArea && (
          <DropdownMenuItem onClick={() => onEnviarArea(obrigacao)}>
            <BriefcaseIcon className="mr-2 h-4 w-4" />
            Enviar para área
          </DropdownMenuItem>
        )}
        {onExcluir && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onExcluir(obrigacao)}
              className="text-red-600 focus:text-red-600"
            >
              <TrashIcon className="mr-2 h-4 w-4" />
              Excluir
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

