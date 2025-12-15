'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import obrigacaoClient from '@/api/obrigacao/client';
import { ObrigacaoDetalheResponse, ObrigacaoRequest } from '@/api/obrigacao/types';
import { ObrigacaoFormData } from '@/components/obrigacoes/criar/ObrigacaoModal';
import { Step1Obrigacao } from '@/components/obrigacoes/criar/steps/Step1Obrigacao';
import { Step2Obrigacao } from '@/components/obrigacoes/criar/steps/Step2Obrigacao';
import { Step3Obrigacao } from '@/components/obrigacoes/criar/steps/Step3Obrigacao';
import { Step4Obrigacao } from '@/components/obrigacoes/criar/steps/Step4Obrigacao';
import { Step5Obrigacao } from '@/components/obrigacoes/criar/steps/Step5Obrigacao';
import { toast } from 'sonner';
import { ArrowLeft, ChevronRight, Loader2, Save } from 'lucide-react';
import { TipoEnum, CategoriaEnum } from '@/api/tipos/types';
import tiposClient from '@/api/tipos/client';
import { AnexoResponse, ArquivoDTO, TipoObjetoAnexoEnum, TipoResponsavelAnexoEnum, TipoDocumentoAnexoEnum } from '@/api/anexos/type';
import { computeTpResponsavel } from '@/api/perfis/types';
import { useUserGestao } from '@/hooks/use-user-gestao';
import anexosClient from '@/api/anexos/client';
import { base64ToUint8Array, saveBlob } from '@/utils/utils';
import Link from 'next/link';
import statusSolicitacaoClient, { StatusSolicitacaoResponse } from '@/api/status-solicitacao/client';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { statusListObrigacao } from '@/api/status-obrigacao/types';

type TabKey = 'dados' | 'temas' | 'prazos' | 'anexos' | 'vinculos';

interface TabDefinition {
  key: TabKey;
  label: string;
}

const tabs: TabDefinition[] = [
  { key: 'dados', label: 'Dados' },
  { key: 'temas', label: 'Temas e áreas' },
  { key: 'prazos', label: 'Prazos' },
  { key: 'anexos', label: 'Anexos' },
  { key: 'vinculos', label: 'Vínculos' },
];

const normalizeDate = (value?: string | null): string | null => {
  if (!value) return null;
  if (value.includes('T')) {
    return value.split('T')[0];
  }
  return value;
};

const createFileToArquivoDto = (idPerfil: number | null) => {
  return (file: File): Promise<ArquivoDTO> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const commaIndex = result.indexOf(',');
        const content = commaIndex >= 0 ? result.substring(commaIndex + 1) : result;
        
        const tpResponsavel = idPerfil 
          ? computeTpResponsavel(idPerfil) 
          : TipoResponsavelAnexoEnum.A;
        
        resolve({
          nomeArquivo: file.name,
          tipoConteudo: file.type,
          tpResponsavel,
          conteudoArquivo: content,
          tpDocumento: TipoDocumentoAnexoEnum.C, 
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };
};

const mapDetalheToFormData = (detalhe: ObrigacaoDetalheResponse): ObrigacaoFormData => {
  const { obrigacao } = detalhe;
  const areaAtribuida = obrigacao.areas?.find((area) => area.tipoArea?.cdTipo === TipoEnum.ATRIBUIDA);
  const areasCondicionantes = obrigacao.areas
    ?.filter((area) => area.tipoArea?.cdTipo === TipoEnum.CONDICIONANTE)
    .map((area) => area.idArea) || [];

  return {
    idSolicitacao: obrigacao.idSolicitacao,
    cdIdentificador: obrigacao.cdIdentificacao,
    dsTarefa: obrigacao.dsTarefa || '',
    idStatusSolicitacao: obrigacao.statusSolicitacao?.idStatusSolicitacao || null,
    idTipoClassificacao: obrigacao.tipoClassificacao?.idTipo || null,
    idTipoPeriodicidade: obrigacao.tipoPeriodicidade?.idTipo || null,
    idTipoCriticidade: obrigacao.tipoCriticidade?.idTipo || null,
    idTipoNatureza: obrigacao.tipoNatureza?.idTipo || null,
    dsObservacao: obrigacao.dsObservacao || '',
    idObrigacaoPrincipal: obrigacao.obrigacaoPrincipal?.idSolicitacao || null,
    idsAreasCondicionantes: areasCondicionantes,
    idAreaAtribuida: areaAtribuida?.idArea || null,
    idTema: obrigacao.tema?.idTema || null,
    dtInicio: normalizeDate(obrigacao.dtInicio),
    dtTermino: normalizeDate(obrigacao.dtTermino),
    dtLimite: normalizeDate(obrigacao.dtLimite),
    nrDuracaoDias: obrigacao.nrDuracaoDias || null,
    idSolicitacaoCorrespondencia: obrigacao.correspondencia?.idSolicitacao || null,
    dsAntt: obrigacao.dsAntt || '',
    dsProtocoloExterno: obrigacao.dsProtocoloExterno || '',
    idObrigacaoRecusada: obrigacao.obrigacaoRecusada?.idSolicitacao || null,
    dsTac: obrigacao.dsTac || '',
  };
};

export default function EditarObrigacaoPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { idPerfil } = useUserGestao();

  const [activeTab, setActiveTab] = useState<TabKey>('dados');
  const [formData, setFormData] = useState<ObrigacaoFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existingAnexos, setExistingAnexos] = useState<AnexoResponse[]>([]);
  const [anexosLoading, setAnexosLoading] = useState(true);
  const [novosAnexos, setNovosAnexos] = useState<File[]>([]);
  const [idClassificacaoCondicionada, setIdClassificacaoCondicionada] = useState<number | null>(null);
  const [statusOptions, setStatusOptions] = useState<StatusSolicitacaoResponse[]>([]);
  const [showDeleteAnexoDialog, setShowDeleteAnexoDialog] = useState(false);
  const [anexoToDelete, setAnexoToDelete] = useState<AnexoResponse | null>(null);
  const [isNaoPermitidoEditar, setIsNaoPermitidoEditar] = useState(false);

  useEffect(() => {
    tiposClient.buscarPorCategorias([CategoriaEnum.OBRIG_CLASSIFICACAO])
      .then((tipos) => {
        const condicionada = tipos.find((tipo) => tipo.cdTipo === TipoEnum.CONDICIONADA);
        if (condicionada) {
          setIdClassificacaoCondicionada(condicionada.idTipo);
        }
      })
      .catch((error) => {
        console.error('Erro ao carregar tipos de classificação:', error);
      });
  }, []);

  const carregarDetalhes = useCallback(async () => {
    const parsedId = Number(id);
    if (!id || Number.isNaN(parsedId)) {
      toast.error('Identificador da obrigação inválido.');
      router.push('/obrigacao');
      return;
    }

    try {
      setLoading(true);
      setAnexosLoading(true);
      const detalhe = await obrigacaoClient.buscarDetalhePorId(parsedId);
      setFormData(mapDetalheToFormData(detalhe));
      setExistingAnexos(detalhe.anexos || []);
      if (detalhe?.obrigacao?.flAprovarConferencia === 'S' || detalhe?.obrigacao?.statusSolicitacao?.idStatusSolicitacao === statusListObrigacao.NAO_APLICAVEL_SUSPENSA.id) {
        setIsNaoPermitidoEditar(true);
      } else {
        setIsNaoPermitidoEditar(false);
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes da obrigação:', error);
      toast.error('Não foi possível carregar a obrigação.');
      router.push('/obrigacao');
    } finally {
      setLoading(false);
      setAnexosLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    carregarDetalhes();
  }, [carregarDetalhes]);

  useEffect(() => {
    statusSolicitacaoClient
      .listarTodos(CategoriaEnum.CLASSIFICACAO_STATUS_SOLICITACAO, [TipoEnum.TODOS, TipoEnum.OBRIGACAO])
      .then(setStatusOptions)
      .catch((error) => {
        console.error('Erro ao carregar status de solicitação:', error);
      });
  }, []);

  const updateFormData = useCallback((data: Partial<ObrigacaoFormData>) => {
    setFormData((prev) => {
      if (!prev) return prev;

      const updated = { ...prev, ...data };

      if (updated.dtInicio && updated.dtTermino) {
        const dataInicio = new Date(updated.dtInicio);
        const dataTermino = new Date(updated.dtTermino);

        if (dataTermino > dataInicio) {
          const diferencaEmMs = dataTermino.getTime() - dataInicio.getTime();
          const diferencaEmDias = Math.round(diferencaEmMs / (1000 * 60 * 60 * 24));

          if (diferencaEmDias !== updated.nrDuracaoDias) {
            updated.nrDuracaoDias = diferencaEmDias;
          }
        }
      }

      return updated;
    });
  }, []);

  const validateStep = useCallback((step: number): boolean => {
    if (!formData) {
      return false;
    }

    switch (step) {
      case 1:
        if (!formData.dsTarefa?.trim()) return false;
        if (!formData.idTipoClassificacao) return false;
        if (!formData.idTipoCriticidade) return false;
        if (!formData.idTipoNatureza) return false;

        const isCondicionada = formData.idTipoClassificacao === idClassificacaoCondicionada;
        if (isCondicionada && !formData.idObrigacaoPrincipal) return false;

        return true;
      case 2:
        if (!formData.idTema) return false;
        if (!formData.idAreaAtribuida) return false;
        return true;
      case 3:
        if (!formData.dtInicio) return false;
        if (!formData.dtTermino) return false;
        if (!formData.dtLimite) return false;
        if (!formData.idTipoPeriodicidade) return false;

        if (formData.dtInicio && formData.dtTermino) {
          const dataInicio = new Date(formData.dtInicio);
          const dataTermino = new Date(formData.dtTermino);
          if (dataTermino <= dataInicio) return false;
        }

        return true;
      default:
        return true;
    }
  }, [formData, idClassificacaoCondicionada]);

  const requiredStepsForTab = useMemo(() => {
    switch (activeTab) {
      case 'dados':
        return [1];
      case 'temas':
        return [1, 2];
      case 'prazos':
        return [1, 2, 3];
      default:
        return [1, 2, 3];
    }
  }, [activeTab]);

  const tabValido = useMemo(() => {
    return requiredStepsForTab.every((step) => validateStep(step));
  }, [requiredStepsForTab, validateStep]);

  const handleDownloadAnexo = useCallback(async (anexo: AnexoResponse) => {
    try {
      const arquivos = await anexosClient.download(anexo.idObjeto, TipoObjetoAnexoEnum.O, anexo.nmArquivo);
      if (arquivos.length === 0) {
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
    }
  }, []);

  const handleRemoveAnexoClick = useCallback((anexo: AnexoResponse) => {
    setAnexoToDelete(anexo);
    setShowDeleteAnexoDialog(true);
  }, []);

  const handleConfirmDeleteAnexo = useCallback(async () => {
    if (!anexoToDelete) return;

    try {
      await anexosClient.deletar(anexoToDelete.idAnexo);
      toast.success('Anexo removido com sucesso.');
      // Recarrega os dados após a exclusão
      await carregarDetalhes();
    } catch (error) {
      console.error('Erro ao remover anexo:', error);
      toast.error('Não foi possível remover o anexo.');
    } finally {
      setAnexoToDelete(null);
    }
  }, [anexoToDelete, carregarDetalhes]);

  const handleSave = useCallback(async () => {
    if (!formData?.idSolicitacao) {
      toast.error('Dados incompletos da obrigação.');
      return;
    }

    const invalidStep = requiredStepsForTab.find((step) => !validateStep(step));
    if (invalidStep !== undefined) {
      const stepToTab: Record<number, TabKey> = {
        1: 'dados',
        2: 'temas',
        3: 'prazos',
      };

      const tab = stepToTab[invalidStep];
      if (tab) {
        setActiveTab(tab);
      }

      toast.error('Verifique as informações obrigatórias antes de salvar.');
      return;
    }

    try {
      setSaving(true);

      let arquivosExistentes: ArquivoDTO[] = [];
      if (existingAnexos.length > 0) {
        try {
          const downloads = await Promise.all(
            existingAnexos.map(async (anexo) => {
              const arquivos = await anexosClient.download(
                anexo.idObjeto,
                TipoObjetoAnexoEnum.O,
                anexo.nmArquivo,
              );

              const arquivosArray = Array.isArray(arquivos) ? arquivos : arquivos ? [arquivos] : [];
              return arquivosArray.map((arquivo) => ({
                nomeArquivo: arquivo.nomeArquivo || anexo.nmArquivo,
                tipoConteudo: arquivo.tipoConteudo || 'application/octet-stream',
                tpResponsavel: arquivo.tpResponsavel ?? TipoResponsavelAnexoEnum.A,
                conteudoArquivo: arquivo.conteudoArquivo,
                tpDocumento: TipoDocumentoAnexoEnum.C,
              }));
            }),
          );
          arquivosExistentes = downloads.flat();
        } catch (error) {
          console.error('Erro ao preparar anexos existentes:', error);
          toast.error('Não foi possível preparar os anexos existentes para o envio.');
          setSaving(false);
          return;
        }
      }

      const fileToArquivoDto = createFileToArquivoDto(idPerfil);
      const arquivosNovos: ArquivoDTO[] = novosAnexos.length > 0
        ? await Promise.all(novosAnexos.map(fileToArquivoDto))
        : [];

      const arquivos: ArquivoDTO[] = [...arquivosExistentes, ...arquivosNovos];

      // Verificar se a classificação é Condicionada
      const tipos = await tiposClient.buscarPorCategorias([CategoriaEnum.OBRIG_CLASSIFICACAO]);
      const condicionada = tipos.find((tipo) => tipo.cdTipo === TipoEnum.CONDICIONADA);
      const isCondicionada = formData.idTipoClassificacao === condicionada?.idTipo;

      const payload: ObrigacaoRequest = {
        idSolicitacao: formData.idSolicitacao,
        dsTarefa: formData.dsTarefa || '',
        idStatusSolicitacao: formData.idStatusSolicitacao || null,
        idTipoClassificacao: formData.idTipoClassificacao || null,
        idTipoPeriodicidade: formData.idTipoPeriodicidade || null,
        idTipoCriticidade: formData.idTipoCriticidade || null,
        idTipoNatureza: formData.idTipoNatureza || null,
        dsObservacao: formData.dsObservacao || null,
        idObrigacaoPrincipal: isCondicionada ? (formData.idObrigacaoPrincipal || null) : null,
        idsAreasCondicionantes: formData.idsAreasCondicionantes || [],
        idAreaAtribuida: formData.idAreaAtribuida || null,
        idTema: formData.idTema || null,
        dtInicio: formData.dtInicio || null,
        dtTermino: formData.dtTermino || null,
        dtLimite: formData.dtLimite || null,
        nrDuracaoDias: formData.nrDuracaoDias || null,
        idSolicitacaoCorrespondencia: formData.idSolicitacaoCorrespondencia || null,
        dsAntt: formData.dsAntt || null,
        dsProtocoloExterno: formData.dsProtocoloExterno || null,
        idObrigacaoRecusada: formData.idObrigacaoRecusada || null,
        dsTac: formData.dsTac || null,
        arquivos: arquivos.length > 0 ? arquivos : undefined,
      };

      await obrigacaoClient.atualizar(formData.idSolicitacao, payload);
      toast.success('Obrigação atualizada com sucesso.');
      setNovosAnexos([]);
      await carregarDetalhes();
    } catch (error) {
      console.error('Erro ao salvar obrigação:', error);
      toast.error('Não foi possível salvar a obrigação.');
    } finally {
      setSaving(false);
    }
  }, [carregarDetalhes, existingAnexos, formData, novosAnexos, requiredStepsForTab, validateStep, idPerfil]);

  const renderTabContent = () => {
    if (!formData) {
      return null;
    }

    switch (activeTab) {
      case 'dados':
        return (
          <Step1Obrigacao
            formData={formData}
            updateFormData={updateFormData}
            statusOptions={statusOptions}
            disabled={isNaoPermitidoEditar}
          />
        );
      case 'temas':
        return (
          <Step2Obrigacao
            formData={formData}
            updateFormData={updateFormData}
            disabled={isNaoPermitidoEditar}
          />
        );
      case 'prazos':
        return (
          <Step3Obrigacao
            formData={formData}
            updateFormData={updateFormData}
            disabled={isNaoPermitidoEditar}
          />
        );
      case 'anexos':
        return (
          <Step4Obrigacao
            formData={formData}
            updateFormData={updateFormData}
            anexos={novosAnexos}
            onAnexosChange={setNovosAnexos}
            existingAnexos={existingAnexos}
            onDownloadExisting={handleDownloadAnexo}
            onRemoveExisting={handleRemoveAnexoClick}
            existingAnexosLoading={anexosLoading}
            disabled={isNaoPermitidoEditar}
          />
        );
      case 'vinculos':
        return (
          <Step5Obrigacao
            formData={formData}
            updateFormData={updateFormData}
            disabled={isNaoPermitidoEditar}
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 py-24">
        <p className="text-lg font-medium text-gray-600">Não foi possível carregar a obrigação.</p>
        <Button onClick={() => router.push('/obrigacao')}>Voltar para a lista</Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <main className="flex flex-1 flex-col gap-6 px-8 py-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/obrigacao" className="hover:text-gray-700">
              <button
                type="button"
                onClick={() => router.push('/obrigacao')}
                className="flex items-center gap-3 text-gray-600 transition-colors hover:text-gray-900"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white">
                  <ArrowLeft className="h-4 w-4" />
                </span>
                <span className="text-base font-medium">Obrigações</span>
              </button>
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-black" />
            <span className="font-medium text-gray-700">{formData?.cdIdentificador?.toString() || 'Não identificado'}</span>
          </div>
            <h1 className="text-2xl font-semibold text-gray-900">Editar obrigação</h1>
        </div>

        {isNaoPermitidoEditar && (
          <div className="mb-4 rounded-lg bg-yellow-50 border border-yellow-200 px-4 py-3 text-center">
            <p className="text-sm text-yellow-800">
              <strong>Atenção:</strong> Não é possível editar esta obrigação.
            </p>
          </div>
        )}

        <div className="px-6">
          <div className="flex w-full items-center justify-between gap-2 rounded-full border border-gray-200 bg-white px-2 py-2 shadow-sm">
            {tabs.map((tab: TabDefinition) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 rounded-full px-6 py-3 text-center text-base font-semibold transition-all ${
                    isActive ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-1">
          <div className="flex flex-1 flex-col rounded-2xl border border-gray-200 bg-white shadow-sm h-[40hv] mb-16">
            <div className="flex-1 px-6 py-6 pb-24">{renderTabContent()}</div>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-gray-200 bg-white px-8 py-4">
        <div className="flex w-full items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/obrigacao')}
            className="px-6"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !tabValido || isNaoPermitidoEditar}
            className="flex items-center gap-2 px-6"
            tooltip={isNaoPermitidoEditar ? 'A conferência já foi aprovada. Não é possível editar a obrigação.' : ''}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? 'Salvando...' : 'Salvar alterações'}
          </Button>
        </div>
      </div>

      <ConfirmationDialog
        open={showDeleteAnexoDialog}
        onOpenChange={(open) => {
          setShowDeleteAnexoDialog(open);
          if (!open) {
            setAnexoToDelete(null);
          }
        }}
        title="Excluir arquivo"
        description="Deseja excluir arquivo?"
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={handleConfirmDeleteAnexo}
        variant="destructive"
      />
    </div>
  );
}

