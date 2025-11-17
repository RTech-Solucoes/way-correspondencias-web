'use client';

import { useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';
import { ItemAnexo, ItemAnexoLink } from '../ItensAnexos';
import type { AnexoResponse } from '@/api/anexos/type';
import { TipoDocumentoAnexoEnum } from '@/api/anexos/type';
import { AnexoObrigacaoModal } from '../AnexoObrigacaoModal';

interface AnexosTabProps {
  anexos: AnexoResponse[];
  downloadingId: number | null;
  onDeleteAnexo: (anexo: AnexoResponse) => Promise<void>;
  onDownloadAnexo: (anexo: AnexoResponse) => Promise<void>;
  onEvidenceLinkRemove: (link: string) => void;
  onEvidenceLinkAdd?: (link: string) => void;
  idObrigacao: number;
  idPerfil?: number;
  onRefreshAnexos?: () => void;
}

export function AnexosTab({
  anexos,
  downloadingId,
  onDeleteAnexo,
  onDownloadAnexo,
  onEvidenceLinkRemove,
  onEvidenceLinkAdd,
  idObrigacao,
  idPerfil,
  onRefreshAnexos,
}: AnexosTabProps) {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [evidenceLinkValue, setEvidenceLinkValue] = useState('');
  const [linkError, setLinkError] = useState<string | null>(null);
  const [showAnexarEvidenciaModal, setShowAnexarEvidenciaModal] = useState(false);
  const [showAnexarOutrosModal, setShowAnexarOutrosModal] = useState(false);

  // Evidência de cumprimento
  const evidenceAnexos = useMemo(() => {
    return anexos.filter((anexo) => anexo.tpDocumento === TipoDocumentoAnexoEnum.E);
  }, [anexos]);

  // Link 
  const evidenceLinksAnexos = useMemo(() => {
    return anexos.filter((anexo) => anexo.tpDocumento === TipoDocumentoAnexoEnum.L);
  }, [anexos]);

  // Correspondência
  const correspondenciaAnexos = useMemo(() => {
    return anexos.filter((anexo) => anexo.tpDocumento === TipoDocumentoAnexoEnum.R);
  }, [anexos]);

  // Outros anexos - Auxiliar
  const outrosAnexos = useMemo(() => {
    return anexos.filter((anexo) => anexo.tpDocumento === TipoDocumentoAnexoEnum.A);
  }, [anexos]);

  const handleToggleLinkInput = useCallback(() => {
    setShowLinkInput(true);
  }, []);

  const validateUrl = useCallback((url: string): boolean => {
    if (!url.trim()) {
      return false;
    }
    
    try {
      const urlWithProtocol = url.startsWith('http://') || url.startsWith('https://') 
        ? url 
        : `https://${url}`;
      
      const urlObj = new URL(urlWithProtocol);
      
      return urlObj.hostname.length > 0 && urlObj.hostname.includes('.');
    } catch {
      return false;
    }
  }, []);

  const handleEvidenceLinkValueChange = useCallback((value: string) => {
    setEvidenceLinkValue(value);
    
    if (value.trim()) {
      const isValid = validateUrl(value);
      if (!isValid) {
        setLinkError('Formato do link inválido');
      } else {
        setLinkError(null);
      }
    } else {
      setLinkError(null);
    }
  }, [validateUrl]);

  const handleEvidenceLinkSave = useCallback(() => {
    const trimmed = evidenceLinkValue.trim();
    if (!trimmed) {
      toast.warning('Informe um link válido.');
      return;
    }

    if (!validateUrl(trimmed)) {
      setLinkError('Formato do link inválido');
      return;
    }

    if (onEvidenceLinkAdd) {
      onEvidenceLinkAdd(trimmed);
    }
    
    setEvidenceLinkValue('');
    setLinkError(null);
    setShowLinkInput(false);
  }, [evidenceLinkValue, onEvidenceLinkAdd, validateUrl]);

  const handleEvidenceLinkCancel = useCallback(() => {
    setShowLinkInput(false);
    setEvidenceLinkValue('');
    setLinkError(null);
  }, []);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-900">Evidência de cumprimento</span>
          <span className="text-xs font-semibold text-gray-400">
            {evidenceAnexos.length + evidenceLinksAnexos.length}
          </span>
        </div>

        <Button
            type="button"
            variant="link"
            className="flex items-center gap-2 justify-start px-0 text-blue-600 hover:text-blue-700"
            onClick={() => setShowAnexarEvidenciaModal(true)}
          >
            <Plus className="h-4 w-4" />
            Anexar arquivo de evidência de cumprimento
        </Button>
        
        {evidenceAnexos.length === 0 && evidenceLinksAnexos.length === 0 ? (
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
                        onRemove={(link) => {
                          onEvidenceLinkRemove(link);
                        }}
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

        <div className="flex flex-col gap-2">
          {showLinkInput ? (
            <div className="space-y-3 rounded-2xl border border-gray-200 bg-white px-4 py-4">
              <div className="space-y-1">
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Insira o link do arquivo..."
                    value={evidenceLinkValue}
                    onChange={(event) => handleEvidenceLinkValueChange(event.target.value)}
                    className={`pl-10 ${linkError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  />
                </div>
                {linkError && (
                  <p className="text-xs text-red-600 font-medium ml-1">
                    {linkError}
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="ghost" onClick={handleEvidenceLinkCancel} className="text-gray-600">
                  Cancelar
                </Button>
                <Button 
                  onClick={handleEvidenceLinkSave} 
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={!!linkError}
                >
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
                dataUpload={anexo.dtCriacao || null}
                responsavel={anexo.responsavel?.nmResponsavel || anexo.nmUsuario || null}
              />
            ))}
          </ul>
        )}

      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-900">Outros anexos</span>
          <span className="text-xs font-semibold text-gray-400">{outrosAnexos.length}</span>
        </div>

        <Button
          type="button"
          variant="link"
          className="flex items-center gap-2 justify-start px-0 text-blue-600 hover:text-blue-700"
          onClick={() => setShowAnexarOutrosModal(true)}
        >
          <Plus className="h-4 w-4" />
          Anexar outros anexos
        </Button>

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
                dataUpload={anexo.dtCriacao || null}
                responsavel={anexo.responsavel?.nmResponsavel || anexo.nmUsuario || null}
              />
            ))}
          </ul>
        )}
      </div>

      <AnexoObrigacaoModal
        open={showAnexarEvidenciaModal}
        onClose={() => setShowAnexarEvidenciaModal(false)}
        title="Anexar arquivo de evidência de cumprimento"
        tpDocumento={TipoDocumentoAnexoEnum.E}
        idObrigacao={idObrigacao}
        idPerfil={idPerfil}
        onSuccess={() => {
          if (onRefreshAnexos) {
            onRefreshAnexos();
          }
        }}
      />

      <AnexoObrigacaoModal
        open={showAnexarOutrosModal}
        onClose={() => setShowAnexarOutrosModal(false)}
        title="Anexar outros anexos"
        tpDocumento={TipoDocumentoAnexoEnum.A}
        idObrigacao={idObrigacao}
        idPerfil={idPerfil}
        onSuccess={() => {
          if (onRefreshAnexos) {
            onRefreshAnexos();
          }
        }}
      />
    </div>
  );
}

