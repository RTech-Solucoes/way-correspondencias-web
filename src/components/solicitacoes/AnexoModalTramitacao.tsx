'use client';

import { useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import { SolicitacaoDetalheResponse } from '@/api/solicitacoes/types';
import type { AnexoResponse, TipoObjetoAnexoEnum } from '@/api/anexos/type';
import { TipoResponsavelAnexoEnum, ArquivoDTO } from '@/api/anexos/type';
import { anexosClient } from '@/api/anexos/client';
import { base64ToUint8Array, saveBlob } from '@/utils/utils';
import { DownloadIcon } from 'lucide-react';
import { Button } from '../ui/button';

type AnexoItemShape = {
  idAnexo: number;
  idObjeto: number;
  nmArquivo: string;
  tpObjeto: TipoObjetoAnexoEnum;
  tpResponsavel?: TipoResponsavelAnexoEnum;
};

interface AnexoModalTramitacaoProps {
  solicitacao: SolicitacaoDetalheResponse | null;
  canListarAnexo: boolean | null;
  isAnaliseGerenteRegulatorio: boolean;
}

function AnexoItem({
  anexos,
  onBaixar,
}: {
  anexos: AnexoItemShape[];
  onBaixar?: (a: AnexoItemShape) => void | Promise<void>;
}) {
  if (!anexos || anexos.length === 0) {
    return <span className="text-sm text-muted-foreground">Nenhum documento</span>;
  }
  return (
    <ul className="flex flex-col gap-2">
      {anexos.map((a) => (
        <li
          key={`${a.idAnexo}-${a.nmArquivo}`}
          className="flex items-center justify-between rounded-md border bg-white px-3 py-2"
        >
          <span className="truncate text-sm">{a.nmArquivo}</span>
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onBaixar?.(a)}
                title="Baixar"
          >
            <DownloadIcon className="h-4 w-4" />
            </Button>
        </li>
      ))}
    </ul>
  );
}

export default function AnexoModalTramitacao({
  solicitacao,
  canListarAnexo,
  isAnaliseGerenteRegulatorio
}: AnexoModalTramitacaoProps) {
  
  const handleBaixarAnexo = useCallback(
    async (anexo: AnexoItemShape) => {
      try {
        if (!anexo?.idObjeto || !anexo?.tpObjeto) {
          toast.error('Dados do anexo inválidos.');
          return;
        }
        const arquivos = await anexosClient.download(anexo.idObjeto, anexo.tpObjeto, anexo.nmArquivo);
        if (!arquivos || arquivos.length === 0) {
          toast.error('Nenhum arquivo retornado.');
          return;
        }
        arquivos.forEach((arq: ArquivoDTO) => {
          const bytes = base64ToUint8Array(arq.conteudoArquivo);
          const name = arq.nomeArquivo || anexo.nmArquivo || 'arquivo';
          const mime = arq.tipoConteudo || 'application/octet-stream';
          saveBlob(bytes, mime, name);
        });
        toast.success('Download iniciado.');
      } catch (e) {
        console.error(e);
        toast.error('Não foi possível baixar o anexo.');
      }
    },
    []
  );
  
  const anexosData = useMemo(() => {
    if (!solicitacao) return null;

    const anexosTramitacoes: AnexoResponse[] = (solicitacao?.tramitacoes ?? []).flatMap((t) => t?.anexos ?? []);
    const anexosSolic: AnexoResponse[] = solicitacao?.anexosSolicitacao ?? [];
    const anexosEmail: AnexoResponse[] = solicitacao?.email?.anexos ?? [];

    const mapToItem = (
      a: Partial<AnexoResponse> & { idAnexo: number; idObjeto: number; nmArquivo: string; tpObjeto?: string }
    ): AnexoItemShape => ({
      idAnexo: a.idAnexo,
      idObjeto: (a as AnexoResponse).idObjeto,
      nmArquivo: a.nmArquivo,
      tpObjeto: (((a as AnexoResponse).tpObjeto as unknown) as TipoObjetoAnexoEnum),
      tpResponsavel: (a as { tpResponsavel?: TipoResponsavelAnexoEnum })?.tpResponsavel,
    });

    const anexosAnalista: AnexoItemShape[] = anexosTramitacoes
      .filter((a: AnexoResponse) => a.tpResponsavel === TipoResponsavelAnexoEnum.A)
      .map(mapToItem);

    const anexosGerente: AnexoItemShape[] = anexosTramitacoes
      .filter((a: AnexoResponse) => a.tpResponsavel === TipoResponsavelAnexoEnum.G)
      .map(mapToItem);

    const anexosDiretor: AnexoItemShape[] = anexosTramitacoes
      .filter((a: AnexoResponse) => a.tpResponsavel === TipoResponsavelAnexoEnum.D)
      .map(mapToItem);

    const anexosRegulatorio: AnexoItemShape[] = anexosTramitacoes 
      .filter((a: AnexoResponse) => a.tpResponsavel === TipoResponsavelAnexoEnum.R)
      .map(mapToItem);
    
    const itensSolicitacao: AnexoItemShape[] = anexosSolic.map(mapToItem);
    const itensEmail: AnexoItemShape[] = anexosEmail.map(mapToItem);

    return {
      itensEmail,
      itensSolicitacao,
      anexosAnalista,
      anexosGerente,
      anexosDiretor,
      anexosRegulatorio
    };
  }, [solicitacao]);

  if (!canListarAnexo || !anexosData) {
    return null;
  }

  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold">Anexos</h3>
      
      {/* Anexos do E-mail */}
      <div className="rounded-md border">
        <div className="grid grid-cols-12 items-center">
          <div className="col-span-3 px-4 py-3 text-sm text-muted-foreground">
            Anexos do E-mail
          </div>
          <div className="col-span-9 px-4 py-3">
            <AnexoItem anexos={anexosData.itensEmail} onBaixar={handleBaixarAnexo} />
          </div>
        </div>
      </div>

      {/* Anexos da Solicitação */}
      <div className="rounded-md border">
        <div className="grid grid-cols-12 items-center">
          <div className="col-span-3 px-4 py-3 text-sm text-muted-foreground">
            Anexos da Solicitação
          </div>
          <div className="col-span-9 px-4 py-3">
            <AnexoItem anexos={anexosData.itensSolicitacao} onBaixar={handleBaixarAnexo} />
          </div>
        </div>
      </div>

      {/* Anexos por tipo de responsável - só mostra se não for análise gerente regulatório */}
      {!isAnaliseGerenteRegulatorio && (
        <div className="space-y-2">
          <div className="rounded-md border">
            <div className="grid grid-cols-12 items-center">
              <div className="col-span-3 px-4 py-3 text-sm text-muted-foreground">
                Anexado pelo Analista
              </div>
              <div className="col-span-9 px-4 py-3">
                <AnexoItem anexos={anexosData.anexosAnalista} onBaixar={handleBaixarAnexo} />
              </div>
            </div>
          </div>

          <div className="rounded-md border">
            <div className="grid grid-cols-12 items-center">
              <div className="col-span-3 px-4 py-3 text-sm text-muted-foreground">
                Anexado pelo Gerente
              </div>
              <div className="col-span-9 px-4 py-3">
                <AnexoItem anexos={anexosData.anexosGerente} onBaixar={handleBaixarAnexo} />
              </div>
            </div>
          </div>

          <div className="rounded-md border">
            <div className="grid grid-cols-12 items-center">
              <div className="col-span-3 px-4 py-3 text-sm text-muted-foreground">
                Anexado pelos Diretores
              </div>
              <div className="col-span-9 px-4 py-3">
                <AnexoItem anexos={anexosData.anexosDiretor} onBaixar={handleBaixarAnexo} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Anexos do Regulatório - sempre mostra */}
      <div className="rounded-md border">
        <div className="grid grid-cols-12 items-center">
          <div className="col-span-3 px-4 py-3 text-sm text-muted-foreground">
            Enviado pelo Regulatório
          </div>
          <div className="col-span-9 px-4 py-3">
            <AnexoItem anexos={anexosData.anexosRegulatorio} onBaixar={handleBaixarAnexo} />
          </div>
        </div>
      </div>
    </section>
  );
}
