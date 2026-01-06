'use client';

import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {obrigacaoAnexosClient} from '@/api/obrigacao/anexos-client';
import anexosClient from '@/api/anexos/client';
import { base64ToUint8Array, saveBlob } from '@/utils/utils';
import type { AnexoResponse } from '@/api/anexos/type';
import { TipoObjetoAnexoEnum, TipoDocumentoAnexoEnum, TipoResponsavelAnexoEnum } from '@/api/anexos/type';
import type { ObrigacaoDetalheResponse } from '@/api/obrigacao/types';
import { computeTpResponsavel } from '@/api/perfis/types';

interface UseAnexosLogicaParams {
  detalhe: ObrigacaoDetalheResponse;
  idPerfil?: number | null;
  onRefreshAnexos?: () => void;
}

export function useAnexosLogica({
  detalhe,
  idPerfil,
  onRefreshAnexos,
}: UseAnexosLogicaParams) {
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [showDeleteAnexoDialog, setShowDeleteAnexoDialog] = useState(false);
  const [anexoToDelete, setAnexoToDelete] = useState<AnexoResponse | null>(null);
  const [showDeleteLinkDialog, setShowDeleteLinkDialog] = useState(false);
  const [linkToDelete, setLinkToDelete] = useState<string | null>(null);

  // Anexos da obrigação
  const anexos = useMemo(() => detalhe.anexos || [], [detalhe.anexos]);

  // Informação do responsável para anexos
  const responsavelInfo = useMemo(() => {
    const tpResponsavel = idPerfil ? computeTpResponsavel(idPerfil) : TipoResponsavelAnexoEnum.A;
    const responsavelMap: Record<TipoResponsavelAnexoEnum, string> = {
      [TipoResponsavelAnexoEnum.A]: 'Analista',
      [TipoResponsavelAnexoEnum.G]: 'Gestor',
      [TipoResponsavelAnexoEnum.D]: 'Diretor',
      [TipoResponsavelAnexoEnum.R]: 'Regulatório',
    };
    const responsavelNome = responsavelMap[tpResponsavel] || 'Analista';
    
    return {
      tpResponsavel,
      responsavelNome,
    };
  }, [idPerfil]);

  // Handler para abrir dialog de deletar anexo
  const handleDeleteAnexoClick = useCallback((anexo: AnexoResponse) => {
    setAnexoToDelete(anexo);
    setShowDeleteAnexoDialog(true);
  }, []);

  // Handler para confirmar deleção de anexo
  const confirmDeleteAnexo = useCallback(async () => {
    if (!anexoToDelete || !detalhe?.obrigacao?.idSolicitacao) return;

    setLoadingAction(true);
    try {
      await obrigacaoAnexosClient.deletar(detalhe.obrigacao.idSolicitacao, anexoToDelete.idAnexo);
      toast.success('Anexo removido com sucesso.');
      
      if (onRefreshAnexos) {
        await onRefreshAnexos();
      }
    } catch (error) {
      console.error('Erro ao deletar anexo:', error);
      toast.error('Erro ao deletar o anexo.');
    } finally {
      setLoadingAction(false);
      setAnexoToDelete(null);
    }
  }, [anexoToDelete, detalhe?.obrigacao?.idSolicitacao, onRefreshAnexos]);

  // Handler para fechar dialog de deletar anexo
  const handleCloseDeleteAnexoDialog = useCallback((open: boolean) => {
    setShowDeleteAnexoDialog(open);
    if (!open) {
      setAnexoToDelete(null);
    }
  }, []);

  // Handler para download de anexo
  const handleDownloadAnexo = useCallback(
    async (anexo: AnexoResponse) => {
      try {
        setDownloadingId(anexo.idAnexo);
        const tpObjeto = (anexo.tpObjeto as TipoObjetoAnexoEnum) || TipoObjetoAnexoEnum.O;
        const arquivos = await anexosClient.download(anexo.idObjeto, tpObjeto, anexo.nmArquivo);

        if (!arquivos || arquivos.length === 0) {
          toast.error('Não foi possível baixar o anexo.');
          return;
        }

        arquivos.forEach((arquivo) => {
          const bytes = base64ToUint8Array(arquivo.conteudoArquivo);
          const filename = arquivo.nomeArquivo || anexo.nmArquivo;
          const mime = arquivo.tipoConteudo || 'application/octet-stream';
          saveBlob(bytes, mime, filename);
        });
      } catch (error) {
        console.error('Erro ao baixar anexo:', error);
        toast.error('Erro ao baixar o anexo.');
      } finally {
        setDownloadingId(null);
      }
    },
    [],
  );

  // Handler para clicar em remover link
  const handleEvidenceLinkRemoveClick = useCallback((link: string) => {
    setLinkToDelete(link);
    setShowDeleteLinkDialog(true);
  }, []);

  // Handler para confirmar deleção de link
  const confirmDeleteLink = useCallback(async () => {
    if (!linkToDelete) return;

    const anexoLink = anexos.find(
      (anexo) => anexo.tpDocumento === TipoDocumentoAnexoEnum.L && 
                 (anexo.dsCaminho === linkToDelete || anexo.nmArquivo === linkToDelete)
    );

    if (anexoLink && detalhe?.obrigacao?.idSolicitacao) {
      setLoadingAction(true);
      try {
        await obrigacaoAnexosClient.deletar(detalhe.obrigacao.idSolicitacao, anexoLink.idAnexo);
        toast.success('Link removido com sucesso.');
        
        if (onRefreshAnexos) {
          await onRefreshAnexos();
        }
      } catch (error) {
        console.error('Erro ao deletar link:', error);
        toast.error('Erro ao remover o link.');
      } finally {
        setLoadingAction(false);
      }
    } else {
      toast.error('Link não encontrado.');
    }
    
    setLinkToDelete(null);
  }, [linkToDelete, anexos, detalhe?.obrigacao?.idSolicitacao, onRefreshAnexos]);

  // Handler para fechar dialog de deletar link
  const handleCloseDeleteLinkDialog = useCallback((open: boolean) => {
    setShowDeleteLinkDialog(open);
    if (!open) {
      setLinkToDelete(null);
    }
  }, []);

  // Handler para adicionar link de evidência
  const handleEvidenceLinkAdd = useCallback(async (link: string) => {
    if (!detalhe?.obrigacao?.idSolicitacao) {
      toast.error('ID da obrigação não encontrado.');
      return;
    }

    setLoadingAction(true);
    try {
      await obrigacaoAnexosClient.inserirLink(detalhe.obrigacao.idSolicitacao, {
        dsCaminho: link,
        tpResponsavel: responsavelInfo.tpResponsavel,
      });

      toast.success('Link adicionado com sucesso.');
      
      if (onRefreshAnexos) {
        await onRefreshAnexos();
      }
    } catch (error) {
      console.error('Erro ao adicionar link:', error);
      toast.error('Erro ao adicionar link. Tente novamente.');
    } finally {
      setLoadingAction(false);
    }
  }, [detalhe?.obrigacao?.idSolicitacao, responsavelInfo, onRefreshAnexos]);

  return {
    // Estados
    anexos,
    downloadingId,
    loadingAction,
    showDeleteAnexoDialog,
    anexoToDelete,
    showDeleteLinkDialog,
    linkToDelete,
    responsavelInfo,
    // Handlers
    handleDeleteAnexoClick,
    confirmDeleteAnexo,
    handleCloseDeleteAnexoDialog,
    handleDownloadAnexo,
    handleEvidenceLinkRemoveClick,
    confirmDeleteLink,
    handleCloseDeleteLinkDialog,
    handleEvidenceLinkAdd,
    // Setters para loading
    setLoadingAction,
  };
}

