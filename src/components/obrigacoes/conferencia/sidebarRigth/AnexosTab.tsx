'use client';

import { useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Link as LinkIcon, FileText, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ItemAnexo, ItemAnexoLink } from '../ItensAnexos';
import type { AnexoResponse, ArquivoDTO } from '@/api/anexos/type';
import { TipoDocumentoAnexoEnum, TipoObjetoAnexoEnum } from '@/api/anexos/type';
import { AnexoObrigacaoModal } from '../AnexoObrigacaoModal';
import { perfilUtil } from '@/api/perfis/types';
import { TramitacaoComAnexosResponse } from '@/api/solicitacoes/types';

interface AnexosTabProps {
  anexos: AnexoResponse[];
  tramitacoes?: TramitacaoComAnexosResponse[];
  downloadingId: number | null;
  onDeleteAnexo: (anexo: AnexoResponse) => void | Promise<void>;
  onDownloadAnexo: (anexo: AnexoResponse) => Promise<void>;
  onEvidenceLinkRemove: (link: string) => void;
  onEvidenceLinkAdd?: (link: string) => void;
  idObrigacao: number;
  idPerfil?: number;
  onRefreshAnexos?: () => void;
  isStatusEmAndamento?: boolean;
  isStatusAtrasada?: boolean;
  isStatusEmValidacaoRegulatorio?: boolean;
  isStatusPendente?: boolean;
  isStatusNaoIniciado?: boolean;
  isStatusConcluido?: boolean;
  isStatusNaoAplicavelSuspensa?: boolean;
  isStatusPreAnalise?: boolean;
  isDaAreaAtribuida?: boolean;
  isStatusDesabilitadoParaTramitacao?: boolean;
  arquivosTramitacaoPendentes?: ArquivoDTO[];
  onAddArquivosTramitacao?: (files: ArquivoDTO[]) => void;
  onRemoveArquivoTramitacao?: (index: number) => void;
}

export function AnexosTab({
  anexos,
  tramitacoes = [],
  downloadingId,
  onDeleteAnexo,
  onDownloadAnexo,
  onEvidenceLinkRemove,
  onEvidenceLinkAdd,
  idObrigacao,
  idPerfil,
  onRefreshAnexos,
  isStatusEmAndamento = false,
  isStatusAtrasada = false,
  isStatusEmValidacaoRegulatorio = false,
  isStatusPendente = false,
  isStatusNaoIniciado = false,
  isStatusConcluido = false,
  isStatusNaoAplicavelSuspensa = false,
  isStatusPreAnalise = false,
  isDaAreaAtribuida = false,
  isStatusDesabilitadoParaTramitacao = false,
  arquivosTramitacaoPendentes = [],
  onAddArquivosTramitacao,
  onRemoveArquivoTramitacao,
}: AnexosTabProps) {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [evidenceLinkValue, setEvidenceLinkValue] = useState('');
  const [linkError, setLinkError] = useState<string | null>(null);
  const [showAnexarEvidenciaModal, setShowAnexarEvidenciaModal] = useState(false);
  const [showAnexarOutrosModal, setShowAnexarOutrosModal] = useState(false);
  const [showAnexarTramitacaoModal, setShowAnexarTramitacaoModal] = useState(false);

  // Protocolo
  const protocoloAnexos = useMemo(() => {
    return anexos.filter((anexo) => anexo.tpDocumento === TipoDocumentoAnexoEnum.P);
  }, [anexos]);

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


  // Documentos de Tramitação
  const tramitacaoAnexos = useMemo(() => {
    const anexosPrincipais = (anexos || []).filter((anexo) => 
      anexo.tpObjeto === TipoObjetoAnexoEnum.T || 
      anexo.tpDocumento === TipoDocumentoAnexoEnum.C
    );

    const anexosDasTramitacoes = (tramitacoes || []).flatMap(t => t.anexos || []);

    // 3. Combinar e remover duplicados por ID para evitar repetição na lista
    const todosAnexos = [...anexosPrincipais, ...anexosDasTramitacoes];
    const uniqueAnexos = Array.from(new Map(todosAnexos.map(a => [a.idAnexo, a])).values());

    return uniqueAnexos;
  }, [anexos, tramitacoes]);

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
      const hostname = urlObj.hostname;
      
      if (!hostname || hostname.length === 0) {
        return false;
      }
      
      if (/^\d+$/.test(hostname)) {
        return false;
      }
      
      if (!hostname.includes('.')) {
        return false;
      }
      
      const parts = hostname.split('.');
      if (parts.length < 2) {
        return false;
      }
      
      const tld = parts[parts.length - 1];
      if (!tld || tld.length < 2) {
        return false;
      }
      
      const domain = parts[0];
      if (!domain || /^\d+$/.test(domain)) {
        return false;
      }
      
      return true;
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

  const podeAnexarEvidencia = useMemo(() => {
    return isDaAreaAtribuida;
  }, [isDaAreaAtribuida]);

  const statusPermiteAnexarEvidencia = useMemo(() => {
    if (isStatusNaoIniciado && isDaAreaAtribuida) {
      return true;
    }
    return isStatusEmAndamento || isStatusAtrasada;
  }, [isStatusEmAndamento, isStatusAtrasada, isStatusNaoIniciado, isDaAreaAtribuida]);

  const tooltipEvidencia = useMemo(() => {
    if (!statusPermiteAnexarEvidencia) {
      if (isStatusNaoIniciado && !isDaAreaAtribuida) {
        return 'Apenas usuários da área atribuída podem anexar evidência de cumprimento quando o status é "Não Iniciado".';
      }
      return 'Apenas é possível anexar evidência de cumprimento quando o status for "Em Andamento" ou "Atrasada".';
    }
    if (!podeAnexarEvidencia) {
      return 'Apenas usuários da área atribuída podem anexar evidência de cumprimento.';
    }
    return '';
  }, [podeAnexarEvidencia, statusPermiteAnexarEvidencia, isStatusNaoIniciado, isDaAreaAtribuida]);

  const podeExcluirAnexo = useCallback((anexo: AnexoResponse): boolean => {
    if (anexo.tpDocumento === TipoDocumentoAnexoEnum.E || anexo.tpDocumento === TipoDocumentoAnexoEnum.L) {
      if (isStatusNaoIniciado && isDaAreaAtribuida) {
        return true;
      }
      return isStatusEmAndamento || isStatusAtrasada || isStatusPendente;
    }
    
    if (anexo.tpDocumento === TipoDocumentoAnexoEnum.R) {
      return isStatusEmValidacaoRegulatorio;
    }
    
    if (anexo.tpDocumento === TipoDocumentoAnexoEnum.A) {
      return isStatusEmAndamento || isStatusAtrasada;
    }
    
    return false;
  }, [isStatusEmAndamento, isStatusAtrasada, isStatusPendente, isStatusEmValidacaoRegulatorio, isStatusNaoIniciado, isDaAreaAtribuida]);

  const statusPermiteAnexarOutros = useMemo(() => {
    if (isStatusConcluido) {
      return idPerfil === perfilUtil.GESTOR_DO_SISTEMA || 
             idPerfil === perfilUtil.ADMINISTRADOR || 
             idPerfil === perfilUtil.VALIDADOR_ASSINANTE;
    }
    
    if (isStatusNaoAplicavelSuspensa) {
      return idPerfil === perfilUtil.GESTOR_DO_SISTEMA || 
             idPerfil === perfilUtil.ADMINISTRADOR || 
             idPerfil === perfilUtil.VALIDADOR_ASSINANTE;
    }
    
    return isStatusEmAndamento || isStatusAtrasada || isStatusNaoIniciado || isStatusEmValidacaoRegulatorio || isStatusPendente;
  }, [isStatusEmAndamento, isStatusAtrasada, isStatusNaoIniciado, isStatusEmValidacaoRegulatorio, isStatusPendente, isStatusConcluido, isStatusNaoAplicavelSuspensa, idPerfil]);

  const tooltipOutrosAnexos = useMemo(() => {
    if (!statusPermiteAnexarOutros) {
      if (isStatusConcluido) {
        return 'Apenas Gestor do Sistema, Administrador ou Diretoria podem anexar outros anexos quando o status é "Concluído".';
      }
      if (isStatusNaoAplicavelSuspensa) {
        return 'Apenas Gestor do Sistema, Administrador ou Diretoria podem anexar outros anexos quando o status é "Não Aplicável/Suspensa".';
      }
      return 'Status não permitido para anexar outros anexos.';
    }
    
    return '';
  }, [statusPermiteAnexarOutros, isStatusConcluido, isStatusNaoAplicavelSuspensa]);

  return (
    <div className="space-y-6 mb-5">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900">Protocolo</span>
            <span className="text-xs font-semibold text-gray-400">
              {protocoloAnexos.length}
            </span>
          </div>
        <ul className="space-y-2">
        {protocoloAnexos.length > 0 && (
          <>
            {protocoloAnexos.map((anexo) => (
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
            </>
          )}
          {protocoloAnexos.length === 0 && (
            <p className="text-sm text-gray-400">Nenhum protocolo anexado.</p>
          )}
          </ul>
        </div>

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
            className="flex items-center gap-2 justify-start px-0 text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setShowAnexarEvidenciaModal(true)}
            disabled={!podeAnexarEvidencia || !statusPermiteAnexarEvidencia}
            tooltip={tooltipEvidencia}
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
                        onRemove={podeExcluirAnexo(anexo) ? (link) => {
                          onEvidenceLinkRemove(link);
                        } : undefined}
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
                    disabled={!podeAnexarEvidencia || !statusPermiteAnexarEvidencia}
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
                  disabled={!!linkError || !podeAnexarEvidencia || !statusPermiteAnexarEvidencia}
                >
                  Salvar
                </Button>
              </div>
            </div>
          ) : (
            <Button
              type="button"
              variant="link"
              className="flex items-center gap-2 justify-start px-0 text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleToggleLinkInput}
              disabled={!podeAnexarEvidencia || !statusPermiteAnexarEvidencia}
              tooltip={tooltipEvidencia}
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
      </div>

    
      <div className="space-y-4 mb-5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-900">Outros anexos</span>
          <span className="text-xs font-semibold text-gray-400">{outrosAnexos.length}</span>
        </div>

        <Button
          type="button"
          variant="link"
          className="flex items-center gap-2 justify-start px-0 text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => setShowAnexarOutrosModal(true)}
          disabled={!statusPermiteAnexarOutros}
          tooltip={tooltipOutrosAnexos}
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
      </div>
      {!isStatusDesabilitadoParaTramitacao && !isStatusEmValidacaoRegulatorio && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900">Tramitação</span>
            <span className="text-xs font-semibold text-gray-400">{tramitacaoAnexos.length}</span>
          </div>

          <Button
            type="button"
            variant="link"
            className="flex items-center gap-2 justify-start px-0 text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setShowAnexarTramitacaoModal(true)}
            disabled={isStatusConcluido || isStatusPreAnalise}
            tooltip="Apenas é possível selecionar anexos da tramitação durante o andamento da tramitação."
          >
            <Plus className="h-4 w-4" />
            Selecionar anexos da tramitação
          </Button>

          {tramitacaoAnexos.length === 0 ? (
            <p className="text-sm text-gray-400">Nenhum documento de tramitação anexado.</p>
          ) : (
            <ul className="space-y-2">
              {tramitacaoAnexos.map((anexo) => (
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
        </div>
      )}

      {arquivosTramitacaoPendentes.length > 0 && (
        <div className="space-y-4 border-t border-gray-100 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-blue-700">Novos anexos a enviar</span>
            <span className="text-xs font-semibold text-blue-400">{arquivosTramitacaoPendentes.length}</span>
          </div>
          <ul className="space-y-2">
            {arquivosTramitacaoPendentes.map((arquivo, idx) => (
              <li key={idx} className="flex items-center justify-between gap-3 rounded-xl bg-blue-50 px-3 py-2 text-sm">
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileText className="h-4 w-4 shrink-0 text-blue-500" />
                  <span className="truncate text-blue-900 font-medium">{arquivo.nomeArquivo}</span>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveArquivoTramitacao?.(idx)}
                  className="text-blue-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
          <p className="text-[10px] text-blue-500 italic">
            * Estes arquivos serão anexados ao enviar tramitação.
          </p>
        </div>
      )}

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

      <AnexoObrigacaoModal
        open={showAnexarTramitacaoModal}
        onClose={() => setShowAnexarTramitacaoModal(false)}
        title="Selecionar documentos de tramitação"
        tpDocumento={TipoDocumentoAnexoEnum.C}
        idObrigacao={idObrigacao}
        idPerfil={idPerfil}
        isTramitacao={true}
        onFilesSelected={onAddArquivosTramitacao}
        onSuccess={() => {
          if (onRefreshAnexos) {
            onRefreshAnexos();
          }
        }}
      />
    </div>
  );
}

