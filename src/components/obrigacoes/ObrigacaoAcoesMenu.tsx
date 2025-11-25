'use client';

import { useMemo, useState, useEffect } from "react";
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
import { StatusObrigacao, statusListObrigacao } from "@/api/status-obrigacao/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useUserGestao } from "@/hooks/use-user-gestao";
import { perfilUtil } from "@/api/perfis/types";
import { usePermissoes } from "@/context/permissoes/PermissoesContext";
import anexosClient from "@/api/anexos/client";
import { TipoDocumentoAnexoEnum, TipoObjetoAnexoEnum } from "@/api/anexos/type";

interface ObrigacaoAcoesMenuProps {
  obrigacao: ObrigacaoResponse;
  onVisualizar?: (obrigacao: ObrigacaoResponse) => void;
  onEditar?: (obrigacao: ObrigacaoResponse) => void;
  onAnexarProtocolo?: (obrigacao: ObrigacaoResponse) => void;
  onEncaminharTramitacao?: (obrigacao: ObrigacaoResponse) => void;
  onEnviarArea?: (obrigacao: ObrigacaoResponse) => void;
  onExcluir?: (obrigacao: ObrigacaoResponse) => void;
  canVisualizarObrigacao?: boolean;
}

export function ObrigacaoAcoesMenu({
  obrigacao,
  onVisualizar,
  onEditar,
  onAnexarProtocolo,
  onEncaminharTramitacao,
  onEnviarArea,
  onExcluir,
  canVisualizarObrigacao: canVisualizarObrigacaoProp,
}: ObrigacaoAcoesMenuProps) {
  const { idPerfil } = useUserGestao();
  const { 
    canInserirObrigacao, 
    canDeletarObrigacao, 
    canConcluirObrigacao, 
    canEnviarAreasObrigacao,
    canVisualizarObrigacao: canVisualizarObrigacaoPermissao 
  } = usePermissoes();
  
  const canVisualizarObrigacao = canVisualizarObrigacaoProp ?? canVisualizarObrigacaoPermissao;
  
  const isStatusConcluido = obrigacao.statusSolicitacao?.idStatusSolicitacao === statusListObrigacao.CONCLUIDO.id ||
    obrigacao.statusSolicitacao?.nmStatus === StatusObrigacao.CONCLUIDO;

  const isStatusEmValidacao = useMemo(() => {
    return obrigacao.statusSolicitacao?.idStatusSolicitacao === statusListObrigacao.EM_VALIDACAO_REGULATORIO.id ||
      obrigacao.statusSolicitacao?.nmStatus === StatusObrigacao.EM_VALIDACAO_REGULATORIO;
  }, [obrigacao.statusSolicitacao]);

  const isAdminOrGestor = useMemo(() => {
    return idPerfil === perfilUtil.ADMINISTRADOR ||
      idPerfil === perfilUtil.GESTOR_DO_SISTEMA;
  }, [idPerfil]);

  const [isExisteAnexoCorrespondencia, setIsExisteAnexoCorrespondencia] = useState<boolean>(false);

  useEffect(() => {
    const verificarAnexoCorrespondencia = async () => {
      const anexos = await anexosClient.buscarPorIdObjetoETipoObjeto(
        obrigacao.idSolicitacao,
        TipoObjetoAnexoEnum.O
      );
      const existe = anexos.some(anexo => anexo.tpDocumento === TipoDocumentoAnexoEnum.R);
      setIsExisteAnexoCorrespondencia(existe);
    };
    verificarAnexoCorrespondencia();
  }, [obrigacao.idSolicitacao]);

  const podeAnexarProtocolo = useMemo(() => {
    return isAdminOrGestor && isStatusEmValidacao && !isStatusConcluido && isExisteAnexoCorrespondencia;
  }, [isAdminOrGestor, isStatusEmValidacao, isStatusConcluido, isExisteAnexoCorrespondencia]);

  const tooltipAnexarProtocolo = useMemo(() => {
    if (isStatusConcluido) {
      return 'Esta obrigação já está concluída. Não é possível anexar protocolo.';
    }
    if (!isStatusEmValidacao) {
      return 'Apenas é possível anexar protocolo quando a obrigação estiver em "Em Validação (Regulatório)".';
    }

    if (!isExisteAnexoCorrespondencia) {
      return 'Apenas é possível anexar protocolo quando houver anexo de correspondência.';
    }

    if (!isAdminOrGestor) {
      return 'Apenas administradores e gestores do sistema podem anexar protocolo.';
    }
    return '';
  }, [isStatusConcluido, isStatusEmValidacao, isAdminOrGestor, isExisteAnexoCorrespondencia]);

  const jaEnviadoParaArea = obrigacao.flEnviandoArea === 'S';
  const conferenciaAprovada = obrigacao.flAprovarConferencia === 'S';

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
        {onVisualizar && canVisualizarObrigacao && (
          <DropdownMenuItem onClick={() => onVisualizar(obrigacao)}>
            <EyeIcon className="mr-2 h-4 w-4" />
            Visualizar
          </DropdownMenuItem>
        )}
        {onEditar && canInserirObrigacao && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-full">
                  <DropdownMenuItem 
                    onClick={() => !conferenciaAprovada && onEditar(obrigacao)}
                    disabled={conferenciaAprovada}
                    className={conferenciaAprovada ? 'opacity-50 cursor-not-allowed' : ''}
                  >
                    <PencilSimpleIcon className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                </div>
              </TooltipTrigger>
              {conferenciaAprovada && (
                <TooltipContent>
                  <p>A conferência já foi aprovada. Não é possível editar a obrigação.</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        )}
        {onAnexarProtocolo && canConcluirObrigacao && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-full">
                  <DropdownMenuItem 
                    onClick={() => podeAnexarProtocolo && onAnexarProtocolo(obrigacao)}
                    disabled={!podeAnexarProtocolo}
                    className={!podeAnexarProtocolo ? 'opacity-50 cursor-not-allowed' : ''}
                  >
                    <FileTextIcon className="mr-2 h-4 w-4" />
                    Anexar Protocolo
                  </DropdownMenuItem>
                </div>
              </TooltipTrigger>
              {!podeAnexarProtocolo && tooltipAnexarProtocolo && (
                <TooltipContent>
                  <p>{tooltipAnexarProtocolo}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        )}
        {onEncaminharTramitacao && (
          <DropdownMenuItem onClick={() => onEncaminharTramitacao(obrigacao)}>
            <PaperPlaneRightIcon className="mr-2 h-4 w-4" />
            Encaminhar para tramitação
          </DropdownMenuItem>
        )}
        {onEnviarArea && canEnviarAreasObrigacao && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-full">
                  <DropdownMenuItem 
                    onClick={() => !jaEnviadoParaArea && onEnviarArea(obrigacao)}
                    disabled={jaEnviadoParaArea}
                    className={jaEnviadoParaArea ? 'opacity-50 cursor-not-allowed' : ''}
                  >
                    <BriefcaseIcon className="mr-2 h-4 w-4" />
                    Enviar para área
                  </DropdownMenuItem>
                </div>
              </TooltipTrigger>
              {jaEnviadoParaArea && (
                <TooltipContent>
                  <p>Obrigação já enviada para área</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        )}
        {onExcluir && canDeletarObrigacao && (
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

