'use client'

import {createContext, ReactNode, useContext} from "react";
import {useHasPermissao} from "@/hooks/use-has-permissao";
import {Permissoes} from "@/constants/permissoes";

export interface PermissoesContextProps {
  canListarAnexo: boolean | null
  canInserirAnexo: boolean | null
  canAtualizarAnexo: boolean | null
  canDeletarAnexo: boolean | null
  canListarArea: boolean | null
  canInserirArea: boolean | null
  canAtualizarArea: boolean | null
  canDeletarArea: boolean | null
  canListarEmail: boolean | null
  canInserirEmail: boolean | null
  canAtualizarEmail: boolean | null
  canDeletarEmail: boolean | null
  canListarTema: boolean | null
  canInserirTema: boolean | null
  canAtualizarTema: boolean | null
  canDeletarTema: boolean | null
  canListarResponsavel: boolean | null
  canInserirResponsavel: boolean | null
  canAtualizarResponsavel: boolean | null
  canDeletarResponsavel: boolean | null
  canGerarSenhaResponsavel: boolean | null
  canListarSolicitacao: boolean | null
  canInserirSolicitacao: boolean | null
  canAtualizarSolicitacao: boolean | null
  canDeletarSolicitacao: boolean | null
  canAprovarSolicitacao: boolean | null
  canAssinarSolicitacao: boolean | null
  canExportarSolicitacao: boolean | null
  canAuditarSolicitacao: boolean | null
  canListarObrigacao: boolean | null
  canInserirObrigacao: boolean | null
  canDeletarObrigacao: boolean | null
  canVisualizarObrigacao: boolean | null
  canEnviarAreasObrigacao: boolean | null
  canAprovarConferenciaObrigacao: boolean | null
  canConcluirObrigacao: boolean | null
  canSolicitarAjustesObrigacao: boolean | null
  canTramitarObrigacao: boolean | null
  canNaoAplicavelSuspensaObrigacao: boolean | null
}

const PermissoesContext = createContext<PermissoesContextProps>({} as PermissoesContextProps);

export const PermissoesProvider = ({ children }: { children: ReactNode }) => {
  const canListarAnexo = useHasPermissao(Permissoes.ANEXO_LISTAR)
  const canInserirAnexo = useHasPermissao(Permissoes.ANEXO_INSERIR)
  const canAtualizarAnexo = useHasPermissao(Permissoes.ANEXO_ATUALIZAR)
  const canDeletarAnexo = useHasPermissao(Permissoes.ANEXO_DELETAR)
  const canListarArea = useHasPermissao(Permissoes.AREA_LISTAR)
  const canInserirArea = useHasPermissao(Permissoes.AREA_INSERIR)
  const canAtualizarArea = useHasPermissao(Permissoes.AREA_ATUALIZAR)
  const canDeletarArea = useHasPermissao(Permissoes.AREA_DELETAR)
  const canListarEmail = useHasPermissao(Permissoes.EMAIL_LISTAR)
  const canInserirEmail = useHasPermissao(Permissoes.EMAIL_INSERIR)
  const canAtualizarEmail = useHasPermissao(Permissoes.EMAIL_ATUALIZAR)
  const canDeletarEmail = useHasPermissao(Permissoes.EMAIL_DELETAR)
  const canListarTema = useHasPermissao(Permissoes.TEMA_LISTAR)
  const canInserirTema = useHasPermissao(Permissoes.TEMA_INSERIR)
  const canAtualizarTema = useHasPermissao(Permissoes.TEMA_ATUALIZAR)
  const canDeletarTema = useHasPermissao(Permissoes.TEMA_DELETAR)
  const canListarResponsavel = useHasPermissao(Permissoes.RESPONSAVEL_LISTAR)
  const canInserirResponsavel = useHasPermissao(Permissoes.RESPONSAVEL_INSERIR)
  const canAtualizarResponsavel = useHasPermissao(Permissoes.RESPONSAVEL_ATUALIZAR)
  const canDeletarResponsavel = useHasPermissao(Permissoes.RESPONSAVEL_DELETAR)
  const canGerarSenhaResponsavel = useHasPermissao(Permissoes.RESPONSAVEL_GERAR_SENHA)
  const canListarSolicitacao = useHasPermissao(Permissoes.SOLICITACAO_LISTAR)
  const canInserirSolicitacao = useHasPermissao(Permissoes.SOLICITACAO_INSERIR)
  const canAtualizarSolicitacao = useHasPermissao(Permissoes.SOLICITACAO_ATUALIZAR)
  const canDeletarSolicitacao = useHasPermissao(Permissoes.SOLICITACAO_DELETAR)
  const canAprovarSolicitacao = useHasPermissao(Permissoes.SOLICITACAO_APROVAR)
  const canAssinarSolicitacao = useHasPermissao(Permissoes.SOLICITACAO_ASSINAR)
  const canExportarSolicitacao = useHasPermissao(Permissoes.SOLICITACAO_EXPORTAR)
  const canAuditarSolicitacao = useHasPermissao(Permissoes.SOLICITACAO_AUDITAR)
  const canListarObrigacao = useHasPermissao(Permissoes.OBRIGACAO_LISTAR)
  const canInserirObrigacao = useHasPermissao(Permissoes.OBRIGACAO_INSERIR)
  const canDeletarObrigacao = useHasPermissao(Permissoes.OBRIGACAO_DELETAR)
  const canVisualizarObrigacao = useHasPermissao(Permissoes.OBRIGACAO_VISUALIZAR)
  const canEnviarAreasObrigacao = useHasPermissao(Permissoes.OBRIGACAO_ENVIAR_AREAS)
  const canAprovarConferenciaObrigacao = useHasPermissao(Permissoes.OBRIGACAO_APROVAR_CONFERENCIA)
  const canConcluirObrigacao = useHasPermissao(Permissoes.OBRIGACAO_CONCLUIR)
  const canSolicitarAjustesObrigacao = useHasPermissao(Permissoes.OBRIGACAO_SOLICITAR_AJUSTES)
  const canTramitarObrigacao = useHasPermissao(Permissoes.OBRIGACAO_TRAMITAR)
  const canNaoAplicavelSuspensaObrigacao = useHasPermissao(Permissoes.OBRIGACAO_NAO_APLICAVEL_SUSPENSA)

  return (
    <PermissoesContext.Provider
      value={{
        canListarAnexo,
        canInserirAnexo,
        canAtualizarAnexo,
        canDeletarAnexo,
        canListarArea,
        canInserirArea,
        canAtualizarArea,
        canDeletarArea,
        canListarEmail,
        canInserirEmail,
        canAtualizarEmail,
        canDeletarEmail,
        canListarTema,
        canInserirTema,
        canAtualizarTema,
        canDeletarTema,
        canListarResponsavel,
        canInserirResponsavel,
        canAtualizarResponsavel,
        canDeletarResponsavel,
        canGerarSenhaResponsavel,
        canListarSolicitacao,
        canInserirSolicitacao,
        canAtualizarSolicitacao,
        canDeletarSolicitacao,
        canAprovarSolicitacao,
        canAssinarSolicitacao,
        canExportarSolicitacao,
        canAuditarSolicitacao,
        canListarObrigacao,
        canInserirObrigacao,
        canDeletarObrigacao,
        canVisualizarObrigacao,
        canEnviarAreasObrigacao,
        canAprovarConferenciaObrigacao,
        canConcluirObrigacao,
        canSolicitarAjustesObrigacao,
        canTramitarObrigacao,
        canNaoAplicavelSuspensaObrigacao
      }}
    >
      {children}
    </PermissoesContext.Provider>
  );
};

export const usePermissoes = () => {
  const context = useContext(PermissoesContext);
  if (!context) {
    throw new Error('usePermissoes must be used within an PermissoesProvider');
  }
  return context;
};
