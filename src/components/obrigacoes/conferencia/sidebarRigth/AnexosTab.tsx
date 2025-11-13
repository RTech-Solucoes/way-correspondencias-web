'use client';

import { useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';
import { ItemAnexo, ItemAnexoLink } from '../ItensAnexos';
import type { AnexoResponse } from '@/api/anexos/type';
import { TipoDocumentoAnexoEnum } from '@/api/anexos/type';

interface AnexosTabProps {
  anexos: AnexoResponse[];
  evidenceLinks: Array<{ link: string; data: string; responsavel: string }>;
  mockEvidenceLinks: Array<{ link: string; data: string; responsavel: string }>;
  downloadingId: number | null;
  onDeleteAnexo: (anexo: AnexoResponse) => Promise<void>;
  onDownloadAnexo: (anexo: AnexoResponse) => Promise<void>;
  onEvidenceLinkRemove: (link: string) => void;
  onEvidenceLinkAdd?: (link: string) => void;
}

export function AnexosTab({
  anexos,
  evidenceLinks,
  mockEvidenceLinks,
  downloadingId,
  onDeleteAnexo,
  onDownloadAnexo,
  onEvidenceLinkRemove,
  onEvidenceLinkAdd,
}: AnexosTabProps) {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [evidenceLinkValue, setEvidenceLinkValue] = useState('');

  const evidenceAnexos = useMemo(() => {
    // Filtrar por tpDocumento === "E" (Evidência de cumprimento)
    return anexos.filter((anexo) => {
      return anexo.tpDocumento === TipoDocumentoAnexoEnum.E;
    });
  }, [anexos]);

  const evidenceLinksAnexos = useMemo(() => {
    // Filtrar por tpDocumento === "L" (Links de evidência)
    return anexos.filter((anexo) => {
      return anexo.tpDocumento === TipoDocumentoAnexoEnum.L;
    });
  }, [anexos]);

  const correspondenciaAnexos = useMemo(() => {
    // Filtrar por tpDocumento === "R" (Correspondência)
    return anexos.filter((anexo) => {
      return anexo.tpDocumento === TipoDocumentoAnexoEnum.R;
    });
  }, [anexos]);

  const outrosAnexos = useMemo(() => {
    // Filtrar por tpDocumento === "O" (Outros anexos)
    return anexos.filter((anexo) => {
      return anexo.tpDocumento === TipoDocumentoAnexoEnum.O;
    });
  }, [anexos]);

  const handleToggleLinkInput = useCallback(() => {
    setShowLinkInput(true);
  }, []);

  const handleEvidenceLinkValueChange = useCallback((value: string) => {
    setEvidenceLinkValue(value);
  }, []);

  const handleEvidenceLinkSave = useCallback(() => {
    const trimmed = evidenceLinkValue.trim();
    if (!trimmed) {
      toast.warning('Informe um link válido.');
      return;
    }

    if (onEvidenceLinkAdd) {
      onEvidenceLinkAdd(trimmed);
    }
    
    toast.success('Link adicionado com sucesso.');
    setEvidenceLinkValue('');
    setShowLinkInput(false);
  }, [evidenceLinkValue, onEvidenceLinkAdd]);

  const handleEvidenceLinkCancel = useCallback(() => {
    setShowLinkInput(false);
    setEvidenceLinkValue('');
  }, []);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-900">Evidência de cumprimento</span>
          <span className="text-xs font-semibold text-gray-400">
            {evidenceAnexos.length + evidenceLinksAnexos.length + (evidenceLinks.length > 0 ? evidenceLinks.length : mockEvidenceLinks.length)}
          </span>
        </div>

        {evidenceAnexos.length === 0 && evidenceLinksAnexos.length === 0 && evidenceLinks.length === 0 && mockEvidenceLinks.length === 0 ? (
          <p className="text-sm text-gray-400">Ainda não há evidências anexadas.</p>
        ) : (
          <>
            {evidenceAnexos.length > 0 && (
              <ul className="space-y-2">
                {evidenceAnexos.map((anexo) => (
                  <ItemAnexo
                    key={anexo.idAnexo}
                    anexo={anexo}
                    onDownload={onDownloadAnexo}
                    onDelete={onDeleteAnexo}
                    downloadingId={downloadingId}
                    tone="subtle"
                    dense
                    dataUpload="2025-10-10T00:00:00.000Z"
                  />
                ))}
              </ul>
            )}

            {(evidenceLinksAnexos.length > 0 || evidenceLinks.length > 0 || mockEvidenceLinks.length > 0) && (
              <div className="space-y-3">
                <span className="text-xs font-semibold text-gray-500">Link da evidência de cumprimento</span>
                <ul className="space-y-2">
                  {evidenceLinksAnexos.map((anexo) => {
                    const linkUrl = anexo.dsCaminho || anexo.nmArquivo;
                    return (
                      <ItemAnexoLink
                        key={anexo.idAnexo}
                        link={linkUrl}
                        onRemove={(link) => {
                          onEvidenceLinkRemove(link);
                        }}
                        dense
                        dataUpload="2025-10-10T00:00:00.000Z"
                        responsavel={anexo.tpResponsavel ? String(anexo.tpResponsavel) : null}
                      />
                    );
                  })}
                  {(evidenceLinks.length > 0 ? evidenceLinks : mockEvidenceLinks).map((item) => (
                    <ItemAnexoLink 
                      key={item.link}
                      link={item.link} 
                      onRemove={onEvidenceLinkRemove} 
                      dense
                      dataUpload={item.data}
                      responsavel={item.responsavel}
                    />
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="link"
            className="flex items-center gap-2 justify-start px-0 text-blue-600 hover:text-blue-700"
            onClick={() => toast.info('Fluxo de anexar arquivo de evidência de cumprimento em desenvolvimento.')}
          >
            <Plus className="h-4 w-4" />
            Anexar arquivo de evidência de cumprimento
          </Button>

          {showLinkInput ? (
            <div className="space-y-3 rounded-2xl border border-gray-200 bg-white px-4 py-4">
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Insira a link do arquivo..."
                  value={evidenceLinkValue}
                  onChange={(event) => handleEvidenceLinkValueChange(event.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="ghost" onClick={handleEvidenceLinkCancel} className="text-gray-600">
                  Cancelar
                </Button>
                <Button onClick={handleEvidenceLinkSave} className="bg-blue-600 hover:bg-blue-700">
                  Salvar
                </Button>
              </div>
            </div>
          ) : (
            <Button
              type="button"
              variant="link"
              className="flex items-center gap-2 justify-start px-0 text-blue-600 hover:text-blue-700"
              onClick={handleToggleLinkInput}
            >
              <LinkIcon className="h-4 w-4" />
              Inserir link de evidência de cumprimento
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-900">Correspondência</span>
          <span className="text-xs font-semibold text-gray-400">{correspondenciaAnexos.length}</span>
        </div>
        {correspondenciaAnexos.length === 0 ? (
          <p className="text-sm text-gray-400">Nenhuma correspondência anexada.</p>
        ) : (
          <ul className="space-y-2">
            {correspondenciaAnexos.map((anexo) => (
              <ItemAnexo
                key={anexo.idAnexo}
                anexo={anexo}
                onDownload={onDownloadAnexo}
                onDelete={onDeleteAnexo}
                downloadingId={downloadingId}
                tone="subtle"
                dense
                dataUpload="2025-10-10T00:00:00.000Z"
              />
            ))}
          </ul>
        )}
        <Button
          type="button"
          variant="link"
          className="flex items-center gap-2 justify-start px-0 text-blue-600 hover:text-blue-700"
          onClick={() => toast.info('Fluxo de anexar arquivo de correspondência em desenvolvimento.')}
        >
          <Plus className="h-4 w-4" />
          Anexar arquivo de correspondência
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-900">Outros anexos</span>
          <span className="text-xs font-semibold text-gray-400">{outrosAnexos.length}</span>
        </div>
        {outrosAnexos.length === 0 ? (
          <p className="text-sm text-gray-400">Nenhum outro anexo encontrado.</p>
        ) : (
          <ul className="space-y-2">
            {outrosAnexos.map((anexo) => (
              <ItemAnexo
                key={anexo.idAnexo}
                anexo={anexo}
                onDownload={onDownloadAnexo}
                onDelete={onDeleteAnexo}
                downloadingId={downloadingId}
                tone="subtle"
                dense
                dataUpload="2025-10-10T00:00:00.000Z"
              />
            ))}
          </ul>
        )}
      </div>

      <Button
        type="button"
        variant="link"
        className="flex items-center justify-start gap-2 px-0 text-blue-600"
        onClick={() => toast.info('Fluxo de anexar documento em desenvolvimento.')}
      >
        <Plus className="h-4 w-4" />
        Anexar novo documento
      </Button>
    </div>
  );
}

