'use client';

import { useMemo } from 'react';
import { TipoDocumentoAnexoEnum, type AnexoResponse } from '@/api/anexos/type';
import { ItemAnexo, ItemAnexoLink } from '../../sidebarRigth/anexo/ItensAnexos';
import { useAnexosFiltrados } from '../../sidebarRigth/anexo/hooks/useAnexosFiltrados';

interface ConferenciaStepAnexosProps {
  anexos: AnexoResponse[];
  downloadingId: number | null;
  onDownloadAnexo: (anexo: AnexoResponse) => void;
}

interface GrupoAnexos {
  titulo: string;
  anexos: AnexoResponse[];
  links?: AnexoResponse[];
}

export function ConferenciaStepAnexos({
  anexos,
  downloadingId,
  onDownloadAnexo,
}: ConferenciaStepAnexosProps) {
  const { protocoloAnexos, evidenceAnexos, evidenceLinksAnexos, correspondenciaAnexos, outrosAnexos } =
    useAnexosFiltrados({ anexos });

  const grupos = useMemo<GrupoAnexos[]>(() => [
    { titulo: 'Anexos da obrigação', anexos: anexos.filter((anexo) => anexo.tpDocumento === TipoDocumentoAnexoEnum.C) },
    { titulo: 'Protocolo', anexos: protocoloAnexos },
    { titulo: 'Evidência de cumprimento', anexos: evidenceAnexos, links: evidenceLinksAnexos },
    { titulo: 'Correspondência', anexos: correspondenciaAnexos },
    { titulo: 'Outros anexos', anexos: outrosAnexos },
  ], [anexos, protocoloAnexos, evidenceAnexos, evidenceLinksAnexos, correspondenciaAnexos, outrosAnexos]);

  const quantidade = (grupo: GrupoAnexos) => grupo.anexos.length + (grupo.links?.length ?? 0);
  const total = grupos.reduce((soma, grupo) => soma + quantidade(grupo), 0);

  return (
    <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-4 px-8 py-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Anexos</h2>
          <p className="text-sm text-gray-500">Documentos e arquivos relacionados à obrigação.</p>
        </div>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
          {total} {total === 1 ? 'item' : 'itens'}
        </span>
      </div>

      <div className="space-y-6 px-8 pb-8">
        {grupos.map((grupo) => (
          <section key={grupo.titulo} className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800">{grupo.titulo}</h3>
              <span className="text-xs text-gray-500">{quantidade(grupo)}</span>
            </div>
            {quantidade(grupo) === 0 ? (
              <p className="rounded-lg border border-dashed border-gray-200 py-4 text-center text-sm text-gray-400">
                Nenhum arquivo nesta categoria.
              </p>
            ) : (
              <ul className="space-y-2">
                {grupo.anexos.map((anexo) => (
                  <ItemAnexo
                    key={anexo.idAnexo}
                    anexo={anexo}
                    onDownload={onDownloadAnexo}
                    downloadingId={downloadingId}
                  />
                ))}
                {grupo.links?.map((anexo) => (
                  <ItemAnexoLink
                    key={anexo.idAnexo}
                    link={anexo.dsCaminho || anexo.nmArquivo}
                    dataUpload={anexo.dtCriacao || null}
                    responsavel={anexo.responsavel?.nmResponsavel || anexo.nmUsuario || null}
                    anexo={anexo}
                  />
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
