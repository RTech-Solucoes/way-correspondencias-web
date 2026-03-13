import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { AnexoResponse, TipoObjetoAnexoEnum } from '@/api/anexos/type';
import anexosClient from '@/api/anexos/client';
import { base64ToUint8Array, saveBlob } from '@/utils/utils';

interface UseConferenciaAnexosProps {
  obrigacaoId?: number;
}

export function useConferenciaAnexos({ obrigacaoId }: UseConferenciaAnexosProps) {
  const [downloading, setDownloading] = useState<number | null>(null);

  const handleDownloadAnexo = useCallback(
    async (anexo: AnexoResponse) => {
      if (!obrigacaoId) {
        toast.error('Dados da obrigação incompletos.');
        return;
      }

      try {
        setDownloading(anexo.idAnexo);
        
        if (!anexo.nmArquivo) {
          toast.error('Nome do arquivo não informado.');
          return;
        }
        
        const idObjeto = anexo.idObjeto || obrigacaoId;
        const tpObjeto = (anexo.tpObjeto as TipoObjetoAnexoEnum) || TipoObjetoAnexoEnum.O;
        
        const arquivos = await anexosClient.download(idObjeto, tpObjeto, anexo.nmArquivo);
        
        const arquivosArray = Array.isArray(arquivos) 
          ? arquivos 
          : arquivos && typeof arquivos === 'object' && Object.keys(arquivos).length > 0
          ? [arquivos]
          : [];
        
        if (arquivosArray.length === 0) {
          toast.error('Não foi possível baixar o anexo. Arquivo não encontrado.');
          return;
        }
        
        arquivosArray.forEach((arquivo) => {
          if (!arquivo.conteudoArquivo) {
            console.warn('Arquivo sem conteúdo:', arquivo);
            return;
          }
          const bytes = base64ToUint8Array(arquivo.conteudoArquivo);
          const filename = arquivo.nomeArquivo || anexo.nmArquivo;
          const mime = arquivo.tipoConteudo || 'application/octet-stream';
          saveBlob(bytes, mime, filename);
        });

        toast.success('Download iniciado com sucesso.');
      } catch (error) {
        console.error('Erro ao baixar anexo:', error);
        const errorObj = error as { status?: number; message?: string };
        const errorMessage = errorObj?.status === 204 
          ? 'Arquivo não encontrado (204). Verifique o idObjeto.'
          : errorObj?.message || 'Erro ao baixar o anexo. Verifique se o arquivo existe.';
        toast.error(errorMessage);
      } finally {
        setDownloading(null);
      }
    },
    [obrigacaoId],
  );

  return {
    downloading,
    handleDownloadAnexo,
  };
}

