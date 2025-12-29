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
import { BriefcaseIcon, FileTextIcon, BanIcon } from "lucide-react";
import { statusList } from "@/api/status-solicitacao/types";
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
  onNaoAplicavelSuspenso?: (obrigacao: ObrigacaoResponse) => void;
  onExcluir?: (obrigacao: ObrigacaoResponse) => void;
}

export function ObrigacaoAcoesMenu({
  obrigacao,
  onVisualizar,
  onEditar,
  onAnexarProtocolo,
  onEncaminharTramitacao,
  onEnviarArea,
  onNaoAplicavelSuspenso,
  onExcluir,
}: ObrigacaoAcoesMenuProps) {
  const { idPerfil } = useUserGestao();

  const [isExisteAnexoCorrespondencia, setIsExisteAnexoCorrespondencia] = useState<boolean>(false);

  const { 
    canInserirObrigacao, 
    canDeletarObrigacao, 
    canConcluirObrigacao, 
    canEnviarAreasObrigacao,
    canNaoAplicavelSuspensaObrigacao,
    canVisualizarObrigacao,
    canTramitarObrigacao
  } = usePermissoes();
  
  
  const isStatusConcluido = obrigacao.statusSolicitacao?.idStatusSolicitacao === statusList.CONCLUIDO.id;

  const isStatusNaoAplicavelSuspenso = useMemo(() => {
    return obrigacao.statusSolicitacao?.idStatusSolicitacao === statusList.NAO_APLICAVEL_SUSPENSA.id;
  }, [obrigacao.statusSolicitacao]);

  const isStatusEmValidacao = useMemo(() => {
    return obrigacao.statusSolicitacao?.idStatusSolicitacao === statusList.EM_VALIDACAO_REGULATORIO.id;
  }, [obrigacao.statusSolicitacao]);

  const isStatusAprovacaoTramitacao = useMemo(() => {
    return obrigacao.statusSolicitacao?.idStatusSolicitacao === statusList.APROVACAO_TRAMITACAO.id;
  }, [obrigacao.statusSolicitacao]);

  const isStatusDesabilitadoTramitacao = useMemo(() => {
    const idStatus = obrigacao.statusSolicitacao?.idStatusSolicitacao;
    
    return (
      idStatus === statusList.NAO_INICIADO.id ||
      idStatus === statusList.PENDENTE.id ||
      idStatus === statusList.EM_ANDAMENTO.id ||
      idStatus === statusList.ATRASADA.id ||
      idStatus === statusList.NAO_APLICAVEL_SUSPENSA.id
    );
  }, [obrigacao.statusSolicitacao]);

  const conferenciaAprovada = useMemo(() => {
    return obrigacao.flAprovarConferencia === 'S';
  }, [obrigacao.flAprovarConferencia]);

  const podeTramitar = useMemo(() => {
    return canTramitarObrigacao && !isStatusDesabilitadoTramitacao && conferenciaAprovada && isExisteAnexoCorrespondencia;
  }, [canTramitarObrigacao, isStatusDesabilitadoTramitacao, conferenciaAprovada, isExisteAnexoCorrespondencia]);

  const tooltipOpçãoEnviarTramitacao = useMemo(() => {
    if (!canTramitarObrigacao) {
      return 'Você não tem permissão para encaminhar obrigações para tramitação.';
    }
    if (!conferenciaAprovada) {
      return 'A conferência não foi aprovada. Não é possível encaminhar para tramitação.';
    }
    if (isStatusDesabilitadoTramitacao) {
      const statusLabel = obrigacao.statusSolicitacao?.nmStatus || 'este status';
      return `Não é possível encaminhar para tramitação quando a obrigação está com status "${statusLabel}".`;
    }
    if (!isExisteAnexoCorrespondencia) {
      return 'É necessário anexar a correspondência antes de encaminhar para tramitação.';
    }
    return '';
  }, [canTramitarObrigacao, conferenciaAprovada, isStatusDesabilitadoTramitacao, obrigacao.statusSolicitacao?.nmStatus, isExisteAnexoCorrespondencia]);

  const isAdminOrGestor = useMemo(() => {
    return idPerfil === perfilUtil.ADMINISTRADOR ||
      idPerfil === perfilUtil.GESTOR_DO_SISTEMA;
  }, [idPerfil]);

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
    return isAdminOrGestor && (isStatusEmValidacao || isStatusAprovacaoTramitacao) && !isStatusConcluido && isExisteAnexoCorrespondencia;
  }, [isAdminOrGestor, isStatusEmValidacao, isStatusAprovacaoTramitacao, isStatusConcluido, isExisteAnexoCorrespondencia]);

  const tooltipAnexarProtocolo = useMemo(() => {
    if (isStatusConcluido) {
      return 'Esta obrigação já está concluída. Não é possível anexar protocolo.';
    }
    if (!isStatusEmValidacao && !isStatusAprovacaoTramitacao) {
      return 'Apenas é possível anexar protocolo quando a obrigação estiver em "Em Validação (Regulatório)" ou "Aprovação Tramitação".';
    }

    if (!isExisteAnexoCorrespondencia) {
      return 'Apenas é possível anexar protocolo quando houver anexo de correspondência.';
    }

    if (!isAdminOrGestor) {
      return 'Apenas administradores e gestores do sistema podem anexar protocolo.';
    }
    return '';
  }, [isStatusConcluido, isStatusEmValidacao, isStatusAprovacaoTramitacao, isAdminOrGestor, isExisteAnexoCorrespondencia]);

  const jaEnviadoParaArea = obrigacao.flEnviandoArea === 'S';
  const isNaoPermitidoEditar = conferenciaAprovada || isStatusNaoAplicavelSuspenso;

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
                    onClick={() => !isNaoPermitidoEditar && onEditar(obrigacao)}
                    disabled={isNaoPermitidoEditar}
                    className={isNaoPermitidoEditar ? 'opacity-50 cursor-not-allowed' : ''}
                  >
                    <PencilSimpleIcon className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                </div>
              </TooltipTrigger>
              {isNaoPermitidoEditar && (
                <TooltipContent>
                  <p>
                    {isStatusNaoAplicavelSuspenso 
                      ? 'Esta obrigação está com status não aplicável/suspenso.' 
                      : 'A conferência já foi aprovada. Não é possível editar a obrigação.'}
                  </p>
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
        {onEncaminharTramitacao && canVisualizarObrigacao && canTramitarObrigacao && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-full">
                  <DropdownMenuItem 
                    onClick={() => podeTramitar && onEncaminharTramitacao(obrigacao)}
                    disabled={!podeTramitar}
                    className={!podeTramitar ? 'opacity-50 cursor-not-allowed' : ''}
                  >
                    <PaperPlaneRightIcon className="mr-2 h-4 w-4" />
                    Encaminhar para tramitação
                  </DropdownMenuItem>
                </div>
              </TooltipTrigger>
              {!podeTramitar && tooltipOpçãoEnviarTramitacao && (
                <TooltipContent>
                  <p>{tooltipOpçãoEnviarTramitacao}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
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
        {onNaoAplicavelSuspenso && canNaoAplicavelSuspensaObrigacao && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-full">
                  <DropdownMenuItem 
                    onClick={() => !isStatusNaoAplicavelSuspenso && !isStatusConcluido && onNaoAplicavelSuspenso(obrigacao)}
                    disabled={isStatusNaoAplicavelSuspenso || isStatusConcluido}
                    className={isStatusNaoAplicavelSuspenso || isStatusConcluido ? 'opacity-50 cursor-not-allowed' : ''}
                  >
                    <BanIcon className="mr-2 h-4 w-4" />
                    Não Aplicável/Suspenso
                  </DropdownMenuItem>
                </div>
              </TooltipTrigger>
              {(isStatusNaoAplicavelSuspenso || isStatusConcluido) && (
                <TooltipContent>
                  <p>
                    {isStatusNaoAplicavelSuspenso 
                      ? 'Esta obrigação já está com status não aplicável/suspenso.' 
                      : 'Não é possível alterar o status de uma obrigação concluída.'}
                  </p>
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

