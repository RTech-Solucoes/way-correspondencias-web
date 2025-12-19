'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import type { AnexoResponse } from '@/api/anexos/type';
import { ItemAnexo, ItemAnexoLink } from '../ItensAnexos';
import { EvidenceLinkInput } from './EvidenceLinkInput';

interface EvidenciaSectionProps {
  evidenceAnexos: AnexoResponse[];
  evidenceLinksAnexos: AnexoResponse[];
  downloadingId: number | null;
  onDownloadAnexo: (anexo: AnexoResponse) => Promise<void>;
  onDeleteAnexo?: (anexo: AnexoResponse) => void | Promise<void>;
  onEvidenceLinkRemove: (link: string) => void;
  podeExcluirAnexo: (anexo: AnexoResponse) => boolean;
  podeAnexarEvidencia: boolean;
  statusPermiteAnexarEvidencia: boolean;
  tooltipEvidencia: string;
  onOpenAnexarEvidenciaModal: () => void;
  // EvidenceLinkInput props
  showLinkInput: boolean;
  evidenceLinkValue: string;
  linkError: string | null;
  onEvidenceLinkValueChange: (value: string) => void;
  onEvidenceLinkSave: () => void;
  onEvidenceLinkCancel: () => void;
  onToggleLinkInput: () => void;
}

export function EvidenciaSection({
  evidenceAnexos,
  evidenceLinksAnexos,
  downloadingId,
  onDownloadAnexo,
  onDeleteAnexo,
  onEvidenceLinkRemove,
  podeExcluirAnexo,
  podeAnexarEvidencia,
  statusPermiteAnexarEvidencia,
  tooltipEvidencia,
  onOpenAnexarEvidenciaModal,
  showLinkInput,
  evidenceLinkValue,
  linkError,
  onEvidenceLinkValueChange,
  onEvidenceLinkSave,
  onEvidenceLinkCancel,
  onToggleLinkInput,
}: EvidenciaSectionProps) {
  const totalEvidencias = evidenceAnexos.length + evidenceLinksAnexos.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-900">Evidência de cumprimento</span>
        <span className="text-xs font-semibold text-gray-400">{totalEvidencias}</span>
      </div>

      <Button
        type="button"
        variant="link"
        className="flex items-center gap-2 justify-start px-0 text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={onOpenAnexarEvidenciaModal}
        disabled={!podeAnexarEvidencia || !statusPermiteAnexarEvidencia}
        tooltip={tooltipEvidencia}
      >
        <Plus className="h-4 w-4" />
        Anexar arquivo de evidência de cumprimento
      </Button>
      
      {totalEvidencias === 0 ? (
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
                  onDelete={podeExcluirAnexo(anexo) ? onDeleteAnexo : undefined}
                  downloadingId={downloadingId}
                  tone="subtle"
                  dense
                  dataUpload={anexo.dtCriacao || null}
                  responsavel={anexo.responsavel?.nmResponsavel || anexo.nmUsuario || null}
                />
              ))}
            </ul>
          )}
          {evidenceLinksAnexos.length > 0 && (
            <div className="space-y-3">
              <span className="text-xs font-semibold text-gray-500">Link da evidência de cumprimento</span>
              <ul className="space-y-2">
                {evidenceLinksAnexos.map((anexo) => {
                  const linkUrl = anexo.dsCaminho || anexo.nmArquivo;
                  return (
                    <ItemAnexoLink
                      key={anexo.idAnexo}
                      link={linkUrl}
                      onRemove={podeExcluirAnexo(anexo) ? (link) => onEvidenceLinkRemove(link) : undefined}
                      dense
                      dataUpload={anexo.dtCriacao || null}
                      responsavel={anexo.responsavel?.nmResponsavel || anexo.nmUsuario || null}
                      anexo={anexo}
                    />
                  );
                })}
              </ul>
            </div>
          )}
        </>
      )}

      <EvidenceLinkInput
        showInput={showLinkInput}
        value={evidenceLinkValue}
        error={linkError}
        disabled={!podeAnexarEvidencia || !statusPermiteAnexarEvidencia}
        tooltip={tooltipEvidencia}
        onChange={onEvidenceLinkValueChange}
        onSave={onEvidenceLinkSave}
        onCancel={onEvidenceLinkCancel}
        onToggle={onToggleLinkInput}
      />
    </div>
  );
}

