'use client';

import { ArquivoDTO, TipoResponsavelAnexo } from '@/api/anexos/type';
import { areaUtil } from '@/api/areas/types';
import authClient from '@/api/auth/client';
import { computeTpResponsavel, perfilUtil } from '@/api/perfis/types';
import { responsaveisClient } from '@/api/responsaveis/client';
import { ResponsavelResponse } from '@/api/responsaveis/types';
import { solicitacaoParecerClient } from '@/api/solicitacao-parecer/client';
import { SolicitacaoParecerResponse } from '@/api/solicitacao-parecer/types';
import { solicitacoesClient } from '@/api/solicitacoes';
import { SolicitacaoDetalheResponse, SolicitacaoPrazoResponse } from '@/api/solicitacoes/types';
import statusSolicitacaoClient, { StatusSolicitacaoResponse } from '@/api/status-solicitacao/client';
import { statusList } from '@/api/status-solicitacao/types';
import tramitacoesClient from '@/api/tramitacoes/client';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Pill } from '@/components/ui/pill';
import { Textarea } from '@/components/ui/textarea';
import { usePermissoes } from '@/context/permissoes/PermissoesContext';
import { AnaliseGerenteDiretor, getTipoAprovacaoLabel } from '@/types/solicitacoes/types';
import { fileToArquivoDTO, hoursToDaysAndHours } from '@/utils/utils';
import { ClockIcon, PaperclipIcon, X as XIcon } from '@phosphor-icons/react';
import { ChangeEvent, CSSProperties, FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import AnexoModalTramitacao from './AnexoModalTramitacao';
import { HistoricoRespostasModalButton } from './HistoricoRespostasModal';
import InformaçaoStatusEmAnaliseGerReg from './InformaçaoStatusEmAnaliseGerReg';

import type { AnexoResponse } from '@/api/anexos/type';


type DetalhesSolicitacaoModalProps = {
  open: boolean;
  onClose(): void;
  solicitacao: SolicitacaoDetalheResponse | null;
  anexos?: AnexoResponse[];
  onHistoricoRespostas?(): void;
  onAbrirEmailOriginal?(): void;
  onEnviarDevolutiva?(mensagem: string, arquivos: ArquivoDTO[], flAprovado?: 'S' | 'N'): Promise<void> | void;
  statusLabel?: string;
};

const formatDateTime = (iso?: string | null) => {
  if (!iso) return '—';
  const d = new Date(iso);
  const date = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false });
  return `${date} às ${time}`;
};

const MAX_DESC_LINES = 6;

/** Apenas para DESCRIÇÃO: remove \r e transforma \n em <br/> */
function renderDescricaoWithBreaks(text?: string | null) {
  if (!text) return '—';
  const cleaned = text.replace(/\r/g, '');
  const parts = cleaned.split('\n');
  return parts.map((line, i) => (
    <span key={i}>
      {line}
      {i < parts.length - 1 && <br />}
    </span>
  ));
}

export default function DetalhesSolicitacaoModal({
  open,
  onClose,
  solicitacao,
  onEnviarDevolutiva,
  statusLabel = 'Status',
}: DetalhesSolicitacaoModalProps) {
  const [resposta, setResposta] = useState('');
  const [dsDarecer, setDsDarecer] = useState('');
  const [arquivos, setArquivos] = useState<File[]>([]);
  const [expandDescricao, setExpandDescricao] = useState(false);
  const [sending, setSending] = useState(false);
  const [flAprovado, setFlAprovado] = useState<'S' | 'N' | ''>('');
  const [tpResponsavelUpload, setTpResponsavelUpload] = useState<TipoResponsavelAnexo>(TipoResponsavelAnexo.A);
  const [hasAreaInicial, setHasAreaInicial] = useState(false);
  const [userResponsavel, setUserResponsavel] = useState<ResponsavelResponse | null>(null);
  const [idProximoStatusAnaliseRegulatoria, setIdProximoStatusAnaliseRegulatoria] = useState<number | null>(null);
  const [, setParecerAtual] = useState<SolicitacaoParecerResponse | null>(null);
  const descRef = useRef<HTMLParagraphElement | null>(null);
  const [canToggleDescricao, setCanToggleDescricao] = useState(false);
  const [lineHeightPx, setLineHeightPx] = useState<number | null>(null);
  const { canListarAnexo, canDeletarAnexo, canAprovarSolicitacao } = usePermissoes();
  const [responsaveis, setResponsaveis] = useState<ResponsavelResponse[]>([]);
  const [statusListPrazos, setStatusListPrazos] = useState<StatusSolicitacaoResponse[]>([]);
  const [prazosSolicitacaoPorStatus, setPrazosSolicitacaoPorStatus] = useState<SolicitacaoPrazoResponse[]>([]);
  
 // solicitacao!.statusSolicitacao!.nmStatus = statusList.EM_ANALISE_GERENTE_REGULATORIO.label;
  const sol = solicitacao ?? null;

  const identificador = useMemo(
    () => (sol?.solicitacao?.cdIdentificacao ? `#${sol.solicitacao.cdIdentificacao}` : ''),
    [sol?.solicitacao?.cdIdentificacao]
  );

  const statusText = sol?.statusSolicitacao?.nmStatus ?? statusLabel;
 // const statusText = statusList.EM_ANALISE_GERENTE_REGULATORIO.label;

  const flAnaliseGerenteDiretor = sol?.solicitacao?.flAnaliseGerenteDiretor as AnaliseGerenteDiretor;
  const isExisteCienciaGerenteRegul =
    (sol?.solicitacao?.flExigeCienciaGerenteRegul !== undefined &&
      sol?.solicitacao?.flExigeCienciaGerenteRegul === 'S') ? true : false;

  const criadorLine = useMemo(() => formatDateTime(sol?.dtCriacao), [sol?.dtCriacao]);
  const prazoLine = useMemo(() => {
    const prazoAtual = sol?.solcitacaoPrazos?.find(
      (p) => +(p?.idStatusSolicitacao) === (sol?.statusSolicitacao?.idStatusSolicitacao) &&
        p?.nrPrazoInterno > 0
    );

    if (sol?.statusSolicitacao?.nmStatus === statusList.VENCIDO_AREA_TECNICA.label ) {
      const prazoAtualVencido = sol?.solcitacaoPrazos?.find(
        (p) => +(p?.idStatusSolicitacao) === (statusList.EM_ANALISE_AREA_TECNICA.id)
      );
      return formatDateTime(prazoAtualVencido?.dtPrazoLimite);
    }

    if (sol?.statusSolicitacao?.nmStatus === statusList.VENCIDO_REGULATORIO.label ) {
      const prazoAtualVencido = sol?.solcitacaoPrazos?.find(
        (p) => +(p?.idStatusSolicitacao) === (statusList.ANALISE_REGULATORIA.id)
      );
      return formatDateTime(prazoAtualVencido?.dtPrazoLimite);
    }
    if (prazoAtual?.dtPrazoLimite) {
      return formatDateTime(prazoAtual?.dtPrazoLimite);
    }

    return '—';
  }, [sol?.statusSolicitacao?.idStatusSolicitacao, sol?.solcitacaoPrazos, sol?.statusSolicitacao?.nmStatus]);

  useEffect(() => {
    const loadResponsaveis = async () => {
      const resp = await responsaveisClient.buscarPorFiltro({ size: 1000 });
      setResponsaveis(resp.content);
    };
    loadResponsaveis();
  }, []);

  useEffect(() => {
    const loadStatusList = async () => {
      try {
        const status = await statusSolicitacaoClient.listarTodos();
        setStatusListPrazos(status);
      } catch (error) {
        console.error('Erro ao carregar lista de status:', error);
      }
    };

    if (open) {
      loadStatusList();
    }
  }, [open]);

  useEffect(() => {
    const loadPrazos = async () => {
      const prazosSolicitacaoPorStatus = await solicitacoesClient.listarPrazos(solicitacao?.solicitacao?.idSolicitacao || 0);
      setPrazosSolicitacaoPorStatus(prazosSolicitacaoPorStatus || []);
    };
    if (solicitacao?.solicitacao?.idSolicitacao) {
      loadPrazos();
    }
  }, [solicitacao?.solicitacao?.idSolicitacao]);

  const isPrazoVencido = useMemo(() => {
    const dataAtual = new Date();
    
    if (sol?.statusSolicitacao?.nmStatus === statusList.VENCIDO_AREA_TECNICA.label) {
      const prazoAtualVencido = sol?.solcitacaoPrazos?.find(
        (p) => +(p?.idStatusSolicitacao) === (statusList.EM_ANALISE_AREA_TECNICA.id)
      );
      if (prazoAtualVencido?.dtPrazoLimite) {
        const dataPrazo = new Date(prazoAtualVencido.dtPrazoLimite);
        return dataAtual > dataPrazo;
      }
      return true; 
    }
    
    if (sol?.statusSolicitacao?.nmStatus === statusList.VENCIDO_REGULATORIO.label) {
      const prazoAtualVencido = sol?.solcitacaoPrazos?.find(
        (p) => +(p?.idStatusSolicitacao) === (statusList.ANALISE_REGULATORIA.id)
      );
      if (prazoAtualVencido?.dtPrazoLimite) {
        const dataPrazo = new Date(prazoAtualVencido.dtPrazoLimite);
        return dataAtual > dataPrazo;
      }
      return true; 
    }
    
    const prazoAtual = sol?.solcitacaoPrazos?.find(
      (p) => +(p?.idStatusSolicitacao) === (sol?.statusSolicitacao?.idStatusSolicitacao)
    );
    
    if (prazoAtual?.dtPrazoLimite) {
      const dataPrazo = new Date(prazoAtual.dtPrazoLimite);
      const isPrazoVencidoPorData = dataAtual > dataPrazo;      
      return isPrazoVencidoPorData;
    }
    
    return false;
  }, [sol?.statusSolicitacao?.nmStatus, sol?.statusSolicitacao?.idStatusSolicitacao, sol?.solcitacaoPrazos]);

  const assunto = sol?.solicitacao?.dsAssunto ?? '';
  const descricao = sol?.solicitacao?.dsSolicitacao ?? '';
  const observacao = sol?.solicitacao?.dsObservacao && sol?.solicitacao?.dsObservacao.trim().length > 0 ? sol?.solicitacao?.dsObservacao : null;
  const areas = Array.isArray(sol?.solicitacao?.area)
    ? (sol!.solicitacao!.area! as Array<{ nmArea: string; idArea?: number; cdArea?: string }>)
    : [];

  const temaLabel = sol?.solicitacao?.tema?.nmTema ?? sol?.solicitacao?.nmTema ?? '—';


  const isAprovacao = sol?.statusSolicitacao?.idStatusSolicitacao ===  statusList.EM_APROVACAO.id; 
  const isDiretoria = sol?.statusSolicitacao?.idStatusSolicitacao ===  statusList.EM_ASSINATURA_DIRETORIA.id; 
  const isAnaliseRegulatoriaAprovarDevolutiva =
    sol?.statusSolicitacao?.idStatusSolicitacao ===  statusList.ANALISE_REGULATORIA.id &&
    idProximoStatusAnaliseRegulatoria === statusList.EM_APROVACAO.id; 
  
  const isConcluido = sol?.statusSolicitacao?.idStatusSolicitacao === statusList.CONCLUIDO.id;
  const isAnaliseGerenteRegulatorio = statusText === statusList.EM_ANALISE_GERENTE_REGULATORIO.label;

  const isFlagVisivel =
    isAprovacao ||
    isDiretoria ||
    isAnaliseRegulatoriaAprovarDevolutiva ||
    isConcluido ||
    (isAnaliseGerenteRegulatorio && isExisteCienciaGerenteRegul);

  const isPermissaoEnviandoDevolutiva = (isFlagVisivel && !canAprovarSolicitacao);

  useEffect(() => {
    const checkResponsavelInicial = async () => {
      try {
        const userName = authClient.getUserName();
        if (!userName) {
          setTpResponsavelUpload(TipoResponsavelAnexo.A);
          setHasAreaInicial(false);
          return;
        }
        const resp = await responsaveisClient.buscarPorNmUsuarioLogin(userName);
        setUserResponsavel(resp);
        const idPerfil = resp?.idPerfil;

        const idAreaInicial = sol?.solicitacao?.idAreaInicial;
        const userAreaIds = (resp?.areas || [])
          .map((a: { area?: { idArea?: number | string; nmArea?: string } } | null | undefined) => a?.area?.idArea)
          .map((id) => +((id as unknown) as number))
          .filter((id) => !Number.isNaN(id));

        let isInSolicAreas = false;
        if (idAreaInicial) {
          const areaInicialNum = +idAreaInicial;
          isInSolicAreas = !Number.isNaN(areaInicialNum) && userAreaIds.includes(areaInicialNum);
        } else {
          const areasSolic = Array.isArray(sol?.solicitacao?.area)
            ? (sol!.solicitacao!.area as Array<{ idArea?: number; nmArea?: string }>)
            : [];
          const solicitacaoAreaIds = areasSolic
            .map(a => +((a?.idArea as unknown) as number))
            .filter((id) => !Number.isNaN(id));
          isInSolicAreas = userAreaIds.some(id => solicitacaoAreaIds.includes(id));
        }
        
        const tp = computeTpResponsavel(idPerfil);

        setTpResponsavelUpload(tp);
        setHasAreaInicial(isInSolicAreas);
      } catch {
        setTpResponsavelUpload(TipoResponsavelAnexo.A);
        setHasAreaInicial(false);
      }
    };

    if (open && sol?.solicitacao?.idSolicitacao) {
      checkResponsavelInicial();
    }
  }, [open, sol?.solicitacao?.idSolicitacao, sol?.solicitacao?.area, sol]);

  const measureDescricao = useCallback(() => {
    const el = descRef.current;
    if (!el) {
      setCanToggleDescricao(false);
      return;
    }
    const styles = window.getComputedStyle(el);
    const lh = parseFloat(styles.lineHeight || '0');
    if (!Number.isNaN(lh) && lh > 0) setLineHeightPx(lh);

    const prevMaxHeight = el.style.maxHeight;
    const prevOverflow = el.style.overflow;
    el.style.maxHeight = 'none';
    el.style.overflow = 'visible';

    const fullHeight = el.scrollHeight;
    const maxAllowed = (lh || 0) * MAX_DESC_LINES;

    el.style.maxHeight = prevMaxHeight;
    el.style.overflow = prevOverflow;

    setCanToggleDescricao(fullHeight > maxAllowed + 1);
  }, []);

  useEffect(() => {
    measureDescricao();
  }, [open, descricao, measureDescricao]);

  useEffect(() => {
    const el = descRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => measureDescricao());
    ro.observe(el);
    return () => ro.disconnect();
  }, [measureDescricao]);

  const handleUploadChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setArquivos((prev) => [...prev, ...Array.from(files)]);
    e.currentTarget.value = '';
  }, []);

  const handleRemoveArquivo = useCallback((index: number) => {
    setArquivos((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleEnviar = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!onEnviarDevolutiva) return;

      if (statusText === statusList.EM_ANALISE_GERENTE_REGULATORIO.label) {
        if (isFlagVisivel && !flAprovado) {
          toast.error('É obrigatório aprovar ou reprovar a solicitação (Sim/Não).');
          return;
        }
        
        if (flAprovado === null || flAprovado === '' || flAprovado === 'N') {
          toast.error('É obrigatório marcar a opção "Declaro estar ciente da solicitação e de seu conteúdo".');
          return;
        }

        if (isExisteCienciaGerenteRegul && !resposta.trim()) {
          toast.error('É obrigatório escrever uma justificativa na caixa de texto.');
          return;
        }
      }

      if (statusText === statusList.CONCLUIDO.label) {
        if (isFlagVisivel && !flAprovado) {
          toast.error('É obrigatório escolher uma opção (Sim/Não) para arquivar a solicitação.');
          return;
        }
        if (flAprovado === 'S' && arquivos.length === 0) {
          toast.error('É obrigatório fazer o upload de pelo menos um documento.');
          return;
        }
        if (flAprovado === 'N' && !resposta.trim()) {
          toast.error('É obrigatório escrever uma justificativa na caixa de texto.');
          return;
        }
      }
      
      if (!resposta.trim() && arquivos.length === 0) {
        toast.error('Escreva uma devolutiva ou anexe um arquivo.');
        return;
      }

      if (isFlagVisivel && !flAprovado) {
        toast.error('Selecione se a devolutiva está aprovada (Sim/Não).');
        return;
      }

      if (!sol?.solicitacao?.idSolicitacao) {
        toast.error('ID da solicitação não encontrado.');
        return;
      }

      try {
        setSending(true);

        const arquivosDTO: ArquivoDTO[] = arquivos.length > 0
          ? await Promise.all(
              arquivos.map((file) => fileToArquivoDTO(file, tpResponsavelUpload))
            )
          : [];

        await onEnviarDevolutiva(resposta.trim(), arquivosDTO, flAprovado || undefined);

        toast.success('Resposta enviada com sucesso!');
        setResposta('');
        setArquivos([]);
        onClose();
      } catch (err) {
        console.error(err);
        const msg = err instanceof Error && err.message ? err.message : 'Não foi possível enviar a resposta.';
        toast.error(msg);
      } finally {
        setSending(false);
      }
    },
    [onEnviarDevolutiva, resposta, arquivos, sol?.solicitacao?.idSolicitacao, onClose, flAprovado, isFlagVisivel, tpResponsavelUpload, statusText]
  );

  const handleSalvarParecer = useCallback(async () => {
    try {
      if (!sol?.solicitacao?.idSolicitacao || !sol?.statusSolicitacao?.idStatusSolicitacao) {
        toast.error('Dados da solicitação incompletos.');
        return;
      }
      if (!dsDarecer.trim()) {
        toast.error('Escreva o parecer.');
        return;
      }
      
      setSending(true);

      const req = {
        idSolicitacao: sol.solicitacao.idSolicitacao,
        idStatusSolicitacao: sol.statusSolicitacao.idStatusSolicitacao,
        dsDarecer: dsDarecer.trim(),
      };
      const ultimoNivel = Number(sol?.tramitacoes?.[0]?.tramitacao?.nrNivel ?? 0);
      const nextNivel = ultimoNivel + 1;

      const existingParecer = sol?.solicitacaoPareceres?.find(
        (p) =>
          p?.idStatusSolicitacao === sol.statusSolicitacao.idStatusSolicitacao &&
          Number(p?.nrNivel) === Number(nextNivel) &&
          p?.responsavel?.idResponsavel === (userResponsavel?.idResponsavel ?? 0) 
      );

      const isArquivado = sol.statusSolicitacao.idStatusSolicitacao === statusList.ARQUIVADO.id;
      const canUpdate = Boolean(existingParecer?.idSolicitacaoParecer) && !isArquivado;

      if (canUpdate) {
        const atualizado = await solicitacaoParecerClient.atualizar(existingParecer?.idSolicitacaoParecer ?? 0, req);
        setParecerAtual(atualizado);
        toast.success('Parecer atualizado com sucesso.');
        onClose();
      } else {
        const criado = await solicitacaoParecerClient.criar(req);
        setParecerAtual(criado);
        toast.success('Parecer salvo com sucesso.');
        onClose();
      }
    } catch (err) {
      console.error(err);
      toast.error('Não foi possível salvar o parecer.');
    } finally {
      setSending(false);
    }
  }, [dsDarecer, onClose, sol?.solicitacao?.idSolicitacao,sol?.tramitacoes, sol?.statusSolicitacao?.idStatusSolicitacao, sol?.solicitacaoPareceres, userResponsavel?.idResponsavel]);


  const descricaoCollapsedStyle: CSSProperties =
    !expandDescricao && lineHeightPx
      ? { maxHeight: `${lineHeightPx * MAX_DESC_LINES}px`, overflow: 'hidden' }
      : {};

  const quantidadeDevolutivas = (() => {
    const qtdTramitacoes = solicitacao?.tramitacoes?.filter(t => !!t?.tramitacao?.dsObservacao)?.length ?? 0;
    const qtdPareceres = sol?.solicitacaoPareceres?.length ?? 0;
    return qtdTramitacoes + qtdPareceres;
  })();

  useEffect(() => {
    const loadIdProximoStatusAnaliseRegulatoria = async () => {
      if (!sol?.solicitacao?.idSolicitacao || !sol?.statusSolicitacao?.idStatusSolicitacao) {
        setIdProximoStatusAnaliseRegulatoria(null);
        return;
      }
      const response = await tramitacoesClient.buscarProximoStatusPorIdSolicitacaoEIdStatusSolicitacao({
        idSolicitacao: sol.solicitacao.idSolicitacao,
        idStatusSolicitacao: sol.statusSolicitacao.idStatusSolicitacao,
      });
      setIdProximoStatusAnaliseRegulatoria(response ?? null);
    };
    loadIdProximoStatusAnaliseRegulatoria();
  }, [sol?.solicitacao?.idSolicitacao, sol?.statusSolicitacao?.idStatusSolicitacao]);

  const devolutivaReprovadaUmavezDiretoria = sol?.tramitacoes?.some(
    t => t.tramitacao.idStatusSolicitacao === statusList.EM_ASSINATURA_DIRETORIA.id && t.tramitacao.flAprovado === 'N'
  );

  const devolutivaReprovadaPelaDiretoriaSegundaVez = (() => {
    const reprovacoesCount = sol?.tramitacoes?.filter(
      t => t.tramitacao.idStatusSolicitacao === statusList.EM_ASSINATURA_DIRETORIA.id && t.tramitacao.flAprovado === 'N'
    )?.length || 0;
    return reprovacoesCount >= 2;
  })();

  const labelStatusAnaliseRegulatoria = idProximoStatusAnaliseRegulatoria === statusList.EM_APROVACAO.id
    ? 'Enviar Minuta de Resposta para aprovação'
    : idProximoStatusAnaliseRegulatoria === statusList.EM_CHANCELA.id
      ? 'Escrever resposta ao Gerente do Regulatório'
      : 'Enviar devolutiva';
                                                                                
  const btnLabelStatusAnaliseRegulatoria = isAnaliseRegulatoriaAprovarDevolutiva && flAprovado === 'S'
    ? 'Encaminhar para os Gerentes das Áreas'
    : isAnaliseRegulatoriaAprovarDevolutiva && flAprovado === 'N'
      ? 'Encaminhar para Área Técnica'
        : idProximoStatusAnaliseRegulatoria === statusList.EM_CHANCELA.id
          ? 'Encaminhar para o Gerente do Regulatório'
          : 'Enviar Resposta';
                                            
  const btnStatusEmAssinaturaDiretoria = (isDiretoria && flAprovado === 'S')
    ? 'Aprovar Solicitação' 
    : (devolutivaReprovadaUmavezDiretoria && flAprovado === 'N')
      ? 'Encaminhar para o Regulatório'
      : 'Encaminhar Parecer para Gerente da Área'

  const labelFragEmDiretoria = (isDiretoria && !devolutivaReprovadaUmavezDiretoria)
    ? 'Aprovar Minuta de Resposta?'
    : (devolutivaReprovadaUmavezDiretoria && !devolutivaReprovadaPelaDiretoriaSegundaVez)
      ? 'Em acordo com o Parecer do Gerente da Área?'
      : 'Aprovar Minuta de Resposta?'
  
  const btnTextareaEmAprovacao = (devolutivaReprovadaUmavezDiretoria && flAprovado === 'N')
    ? 'Encaminhar parecer para Diretoria'
    : 'Encaminhar parecer para o Regulatório';
  
  const btnEncaminharParaGestorSistema = (flAprovado === 'N' && isExisteCienciaGerenteRegul)
    ? 'Encaminhar para Analista do Regulatório'
    : 'Encaminhar para Área Técnica';

  const labelTextareaDevolutiva = {
    [statusList.ANALISE_REGULATORIA.label]: labelStatusAnaliseRegulatoria,
    [statusList.EM_APROVACAO.label]: 'Escrever parecer',
    [statusList.EM_CHANCELA.label]: 'Escrever resposta à Diretoria',
    [statusList.EM_ASSINATURA_DIRETORIA.label]: 'Escrever Parecer',
    [statusList.CONCLUIDO.label]: 'Informações do arquivamento',
    [statusList.EM_ANALISE_GERENTE_REGULATORIO.label]: 'Parecer do Gerente do Regulatório',
    default: 'Enviar devolutiva ao Regulatório'
  }

  const btnEnviarDevolutiva = {
    [statusList.EM_CHANCELA.label]: 'Enviar para assinatura da Diretoria',
    [statusList.EM_APROVACAO.label]: btnTextareaEmAprovacao,
    [statusList.ANALISE_REGULATORIA.label]: btnLabelStatusAnaliseRegulatoria,
    [statusList.EM_ASSINATURA_DIRETORIA.label]: flAprovado !== '' ? btnStatusEmAssinaturaDiretoria : 'Aprovar Solicitação',
    [statusList.CONCLUIDO.label]: 'Arquivar Solicitação',
    [statusList.EM_ANALISE_GERENTE_REGULATORIO.label]: btnEncaminharParaGestorSistema,
    default: 'Enviar Resposta'
  }
  
  const labelFragEmAprovacao = devolutivaReprovadaUmavezDiretoria
    ? 'Em acordo com o Parecer da Diretoria?'
    : 'Aprovar devolutiva?';
  
  const labelFragAnaliseRegulatoria = isAnaliseRegulatoriaAprovarDevolutiva ? 'Aprovar devolutiva da(s) Área(s)' : '';

  const textlabelFlag = {
    [statusList.ANALISE_REGULATORIA.label]: labelFragAnaliseRegulatoria,
    [statusList.EM_ASSINATURA_DIRETORIA.label]: labelFragEmDiretoria,
    [statusList.EM_APROVACAO.label]: labelFragEmAprovacao,
    [statusList.CONCLUIDO.label]: 'Incluir Protocolo ANTT ?',
    [statusList.EM_ANALISE_GERENTE_REGULATORIO.label]: 'Aprovar Solicitação?',
    default: 'Aprovar devolutiva?'
  }

  const labelStatusTextarea = labelTextareaDevolutiva[sol?.statusSolicitacao?.nmStatus as keyof typeof labelTextareaDevolutiva] ?? labelTextareaDevolutiva.default;
  const btnEnviarDevolutivaLabel = btnEnviarDevolutiva[sol?.statusSolicitacao?.nmStatus as keyof typeof btnEnviarDevolutiva] ?? btnEnviarDevolutiva.default;
  const labelFlAprovacao = textlabelFlag[sol?.statusSolicitacao?.nmStatus as keyof typeof textlabelFlag] ?? textlabelFlag.default;

  const nrNivelUltimaTramitacao = sol?.tramitacoes[0]?.tramitacao?.nrNivel;

  const isDiretorJaAprovou = sol?.tramitacoes?.some(t =>
    t?.tramitacao?.nrNivel === nrNivelUltimaTramitacao &&
    t?.tramitacao?.idStatusSolicitacao === sol?.statusSolicitacao?.idStatusSolicitacao &&
    t?.tramitacao?.flAprovado === 'S' &&
    (t?.tramitacao?.tramitacaoAcao?.some(ta =>
      ta?.responsavelArea?.responsavel?.idResponsavel === userResponsavel?.idResponsavel
    ) ?? false)
  );
  
  const isRolePermitidoAnaliseAreaTecnicaFlA = (
    userResponsavel?.idPerfil === perfilUtil.VALIDADOR_ASSINANTE ||
    userResponsavel?.idPerfil === perfilUtil.EXECUTOR_AVANCADO 
  );

  const isRolePermitidoAnaliseAreaTecnicaFlD = (
    userResponsavel?.idPerfil === perfilUtil.VALIDADOR_ASSINANTE ||
    userResponsavel?.idPerfil === perfilUtil.EXECUTOR_AVANCADO ||
    userResponsavel?.idPerfil === perfilUtil.EXECUTOR 
  );

  const idsResponsaveisAssinates: number[] = sol?.solicitacoesAssinantes?.filter(
    a => a.idSolicitacao === sol?.solicitacao?.idSolicitacao &&
    a.idStatusSolicitacao === statusList.EM_ASSINATURA_DIRETORIA.id
  ).map(a => a.idResponsavel) ?? [];

  const isAssinanteAutorizado = userResponsavel?.idResponsavel && 
  idsResponsaveisAssinates.includes(userResponsavel.idResponsavel);

  const enableEnviarDevolutiva = (() => {
    const tramitacaoExecutada = sol?.tramitacoes?.filter(t =>
      t?.tramitacao?.nrNivel === nrNivelUltimaTramitacao &&
      t?.tramitacao?.idStatusSolicitacao === sol?.statusSolicitacao?.idStatusSolicitacao &&
      t?.tramitacao?.tramitacaoAcao?.some(ta =>
        ta?.responsavelArea?.responsavel?.idResponsavel === userResponsavel?.idResponsavel &&
        ta.flAcao === 'T' ));

    const isAreaRespondeu = sol?.tramitacoes?.filter(t =>
      t?.tramitacao?.nrNivel === nrNivelUltimaTramitacao &&
      sol?.statusSolicitacao?.idStatusSolicitacao !== statusList.EM_ASSINATURA_DIRETORIA.id &&
      t?.tramitacao?.idStatusSolicitacao === sol?.statusSolicitacao?.idStatusSolicitacao &&
      !((sol?.statusSolicitacao?.nmStatus === statusList.EM_ANALISE_AREA_TECNICA.label || 
        sol?.statusSolicitacao?.nmStatus === statusList.VENCIDO_AREA_TECNICA.label) &&
        (flAnaliseGerenteDiretor === AnaliseGerenteDiretor.D ||
            flAnaliseGerenteDiretor === AnaliseGerenteDiretor.A)
      ) &&
      userResponsavel?.areas?.some(a => a?.area?.idArea === t?.tramitacao?.areaOrigem?.idArea)
    );

    if (sending) return false;

    if (sol?.statusSolicitacao?.nmStatus === statusList.EM_ASSINATURA_DIRETORIA.label) {

      const isRolePermitido = (
        userResponsavel?.idPerfil === perfilUtil.ADMINISTRADOR ||
        userResponsavel?.idPerfil === perfilUtil.VALIDADOR_ASSINANTE ||
        userResponsavel?.areas?.some(a => a?.area?.idArea === areaUtil.DIRETORIA) 
      );

      return isRolePermitido && isAssinanteAutorizado && !isDiretorJaAprovou;
    }

    if (sol?.statusSolicitacao?.nmStatus === statusList.ARQUIVADO.label) return false;

    if (sol?.statusSolicitacao?.nmStatus === statusList.EM_ANALISE_GERENTE_REGULATORIO.label) {
      if (userResponsavel?.idPerfil === perfilUtil.ADMINISTRADOR) return true;
      return false;
    }

    if (tramitacaoExecutada != null && tramitacaoExecutada?.length > 0) return false;

    if (isAreaRespondeu != null && isAreaRespondeu?.length > 0) return false;

    if (sol?.statusSolicitacao?.nmStatus === statusList.EM_ANALISE_AREA_TECNICA.label 
      || sol?.statusSolicitacao?.nmStatus === statusList.VENCIDO_AREA_TECNICA.label
    ) {

      if (flAnaliseGerenteDiretor === AnaliseGerenteDiretor.G) {
        return userResponsavel?.idPerfil === perfilUtil.EXECUTOR_AVANCADO;
      }

      if (flAnaliseGerenteDiretor === AnaliseGerenteDiretor.D) {
        return isRolePermitidoAnaliseAreaTecnicaFlD;
      }

      if (flAnaliseGerenteDiretor === AnaliseGerenteDiretor.A) {
        return isRolePermitidoAnaliseAreaTecnicaFlA;
      }

      if (flAnaliseGerenteDiretor === AnaliseGerenteDiretor.N || !flAnaliseGerenteDiretor) {
        return (
          userResponsavel?.idPerfil === perfilUtil.EXECUTOR_AVANCADO ||
          userResponsavel?.idPerfil === perfilUtil.EXECUTOR ||
          userResponsavel?.idPerfil === perfilUtil.EXECUTOR_RESTRITO
        );
      }

      if (!hasAreaInicial) return true;

      return false;
    }

    if (sol?.statusSolicitacao?.nmStatus === statusList.ANALISE_REGULATORIA.label ||
      sol?.statusSolicitacao?.nmStatus === statusList.VENCIDO_REGULATORIO.label) {
        if (userResponsavel?.idPerfil === perfilUtil.ADMINISTRADOR) return true;
        if (hasAreaInicial && userResponsavel?.idPerfil === perfilUtil.GESTOR_DO_SISTEMA) return true;
      return false;
    }
    
    if (sol?.statusSolicitacao?.nmStatus === statusList.EM_APROVACAO.label) {
      if (userResponsavel?.idPerfil === perfilUtil.EXECUTOR_AVANCADO) return true;
      return false;
    }

    if (!hasAreaInicial && !isPermissaoEnviandoDevolutiva) return true;

    if (sol?.statusSolicitacao?.nmStatus === statusList.EM_CHANCELA.label) {
      if (userResponsavel?.idPerfil === perfilUtil.ADMINISTRADOR) return true;
      return false;
    }

    if (sol?.statusSolicitacao?.nmStatus === statusList.CONCLUIDO.label) {
      if (
        userResponsavel?.idPerfil === perfilUtil.ADMINISTRADOR ||
        userResponsavel?.idPerfil === perfilUtil.GESTOR_DO_SISTEMA
      ) return true;
      return false;
    }

    return false;
  })();

  const btnTooltip = (() => {
    const isAreaTecnica = statusText === statusList.EM_ANALISE_AREA_TECNICA.label;
    
    if(statusText === statusList.EM_CHANCELA.label && !(userResponsavel?.idPerfil === perfilUtil.ADMINISTRADOR)) return 'Apenas o Administrador pode responder.';

    if (statusText === statusList.EM_ASSINATURA_DIRETORIA.label) {
      if (!isAssinanteAutorizado) return 'Apenas os validadores/assinantes selecionados podem aprovar esta solicitação.';
      if (isDiretorJaAprovou) return 'Já aprovado por um diretor. É necessário outro diretor aprovar.';
    }
    
    if (isAreaTecnica) {
      if (flAnaliseGerenteDiretor === AnaliseGerenteDiretor.G) return 'Apenas Executor Avançado (Gerente) de cada área pode responder.';
      if (flAnaliseGerenteDiretor === AnaliseGerenteDiretor.D) return 'Diretor, Executor Avançado ou Executor podem responder; é necessária a resposta do Diretor.';
      if (flAnaliseGerenteDiretor === AnaliseGerenteDiretor.A) return 'Precisa do parecer do Executor Avançado (Gerente) e Validador/Assinante (Diretor). Você já respondeu ou não tem o perfil necessário.';

      return 'Podem responder: Executor ou Executor Avançado (Gerente) de cada área.'; // N ou vazio
    }
    return isPermissaoEnviandoDevolutiva
      ? 'Apenas gerente/diretores da área pode enviar resposta da devolutiva'
      : '';
  })();

  const diretorPermitidoDsParecer = (() => {
    const isDiretoriaPerfil = userResponsavel?.idPerfil === perfilUtil.VALIDADOR_ASSINANTE;

  if (statusText === statusList.ARQUIVADO.label) {
      if (
        (userResponsavel?.idPerfil === perfilUtil.ADMINISTRADOR) ||
        (userResponsavel?.idPerfil === perfilUtil.GESTOR_DO_SISTEMA) ||
        isDiretoriaPerfil
      )
      return true;
    }

    if (!isDiretoriaPerfil) return false;
    if (
      (statusText === statusList.EM_ANALISE_AREA_TECNICA.label || 
        statusText === statusList.VENCIDO_AREA_TECNICA.label) &&
      (
        flAnaliseGerenteDiretor !== AnaliseGerenteDiretor.N &&
        flAnaliseGerenteDiretor !== AnaliseGerenteDiretor.G
      )
    ) return false;
    if (statusText === statusList.CONCLUIDO.label) return false;
    if (statusText === statusList.EM_ASSINATURA_DIRETORIA.label) return false;
    return true;
  })();

  const currentPrazoTotal = useMemo(() => {
    const total = sol?.solcitacaoPrazos?.reduce((acc, curr) => acc + curr.nrPrazoInterno, 0);
    return total;
  }, [sol?.solcitacaoPrazos]);

  return (
    <>
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl md:max-w-4xl lg:max-w-5xl p-0 flex flex-col max-h-[85vh] overflow-hidden">
        <div className="px-6 pt-6">
          <DialogHeader className="p-0">
            <div className="flex items-start justify-between gap-4">
              <div className="w-full">
                <DialogTitle className="text-[20px] font-semibold">
                  Solicitação {identificador || ''}
                </DialogTitle>

                <div className="mt-1 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">{`Criado em: ${criadorLine}`}</div>
                  <span className="inline-flex items-center rounded-full bg-orange-500/10 text-orange-600 px-3 py-1 text-xs font-medium">
                    {statusText}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-2 text-sm">
                  <ClockIcon className="h-4 w-4" />
                  <span className="text-muted-foreground">Prazo para resposta:</span>
                  <span className={`font-medium ${isPrazoVencido && prazoLine !== '—' ? 'text-red-600' : ''}`}>{prazoLine}</span>
                </div>
              </div>
            </div>
          </DialogHeader>
        </div>

        <form
          id="detalhes-form"
          onSubmit={handleEnviar}
          className="pl-6 pr-2 pb-6 space-y-8 overflow-y-auto overflow-x-hidden flex-1"
        >
          <section className="space-y-2">
            <h3 className="text-sm font-semibold">Assunto</h3>
            <div className="rounded-md border bg-muted/30 p-4">
              <p className="text-sm whitespace-pre-wrap break-words">
                {assunto || '—'}
              </p>
            </div>
          </section>

          <section className="space-y-2">
          <h3 className="text-sm font-semibold">Resumo da Solicitação</h3>
            <div className="rounded-md border bg-muted/30">
              <div className="grid grid-cols-12 gap-0">
                <div className="col-span-3 px-4 py-3 text-xs text-muted-foreground">Áreas:</div>
                <div className="col-span-9 px-4 py-3 text-sm">
                  {areas.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {areas.map((a, idx) => (
                        <Pill
                          key={a.idArea ?? a.cdArea ?? `${a.nmArea}-${idx}`}
                          title={a.nmArea}
                        >
                          {a.nmArea}
                        </Pill>
                      ))}
                    </div>
                  ) : (
                    '—'
                  )}
                </div>
              </div>
              <div className="h-px bg-border" />
              <div className="grid grid-cols-12 gap-0">
                <div className="col-span-3 px-4 py-3 text-xs text-muted-foreground">Tema:</div>
                <div className="col-span-9 px-4 py-3 text-sm">{temaLabel}</div>
              </div>
              <div className="h-px bg-border" />
              <div className="grid grid-cols-12">
                <div className="col-span-3 px-4 py-3 text-xs text-muted-foreground">Nº do ofício:</div>
                <div className="col-span-9 px-4 py-3 text-sm">{sol?.solicitacao?.nrOficio || '—'}</div>
              </div>
              <div className="h-px bg-border" />
              <div className="grid grid-cols-12">
                <div className="col-span-3 px-4 py-3 text-xs text-muted-foreground">Nº do processo:</div>
                <div className="col-span-9 px-4 py-3 text-sm">{sol?.solicitacao?.nrProcesso || '—'}</div>
                </div>
              <div className="h-px bg-border" />
                <div className="grid grid-cols-12">
                <div className="col-span-3 px-4 py-3 text-xs text-muted-foreground">Exige aprovação especial:</div>
                <div className="col-span-9 px-4 py-3 text-sm">
                  {getTipoAprovacaoLabel(sol?.solicitacao?.flAnaliseGerenteDiretor ?? '')}
                </div>
              </div>
              {isAnaliseGerenteRegulatorio && (
                <>
                  <div className="h-px bg-border" />
                    <div className="grid grid-cols-12">
                    <div className="col-span-3 px-4 py-3 text-xs text-muted-foreground">Prazo Principal:</div>
                    <div className="col-span-9 px-4 py-3 text-sm">
                      {hoursToDaysAndHours(currentPrazoTotal ?? 0)}
                      {sol?.solicitacao?.flExcepcional === 'S' ? (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                          Excepcional
                        </span>
                      ) : null}
                    </div>
                  </div>
                </>
                )}
            </div>
          </section>

          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Observação</h3>
            </div>

            <div className="rounded-md border bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">
                { observacao ?? '—'}
              </p>
            </div>
          </section>

          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Descrição</h3>
            </div>

            <div className="rounded-md border bg-muted/30 p-4">
              <p
                ref={descRef}
                className="text-sm text-muted-foreground"
                style={descricaoCollapsedStyle}
              >
                {descricao ? renderDescricaoWithBreaks(descricao) : '—'}
              </p>

              {descricao && descricao.length > 0 && canToggleDescricao && (
                <button
                  type="button"
                  className="mt-2 text-sm font-medium text-primary hover:underline"
                  onClick={() => setExpandDescricao((v) => !v)}
                >
                  {expandDescricao ? 'Ver menos' : 'Ver mais'}
                </button>
              )}
            </div>
          </section>

          {isAnaliseGerenteRegulatorio && (
            <InformaçaoStatusEmAnaliseGerReg 
              solicitacao={solicitacao}
              statusListPrazos={statusListPrazos}
              prazosSolicitacaoPorStatus={prazosSolicitacaoPorStatus}
              responsaveis={responsaveis}
              isAnaliseGerenteRegulatorio={isAnaliseGerenteRegulatorio}
            />
          )}
            
          <AnexoModalTramitacao 
            solicitacao={solicitacao}
            canListarAnexo={canListarAnexo}
            isAnaliseGerenteRegulatorio={isAnaliseGerenteRegulatorio}
          />
            
          {(isAnaliseGerenteRegulatorio && !isExisteCienciaGerenteRegul) && (
              <section className="space-y-3">
              <div className="flex items-center justify-between gap-4 mt-2">
                <div className="flex items-center gap-2">
                    <Checkbox
                      checked={flAprovado === 'S'}
                      onCheckedChange={() => setFlAprovado(prev => prev === 'S' ? 'N' : 'S')}
                      id="flAprovado"
                    />
                    <Label htmlFor="flAprovado" className="text-sm font-medium">
                    Declaro estar ciente da solicitação e de seu conteúdo
                    </Label>
                  </div>
                </div>
              </section>
            )}
            
          {(isFlagVisivel  && !diretorPermitidoDsParecer) && (
            <section className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="aprovarDevolutiva" className="text-sm font-medium">
                  { labelFlAprovacao } *
                </Label>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={flAprovado === 'S'}
                      onCheckedChange={() => setFlAprovado('S')}
                      id="aprovarDevolutiva-s"
                    />
                    <Label htmlFor="aprovarDevolutiva-s" className="text-sm font-light">Sim</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={flAprovado === 'N'}
                      onCheckedChange={() => setFlAprovado('N')}
                      id="aprovarDevolutiva-n"
                    />
                    <Label htmlFor="aprovarDevolutiva-n" className="text-sm font-light ">Não</Label>
                  </div>
                </div>
              </div>
            </section>
          )}

          <section className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">
                  {diretorPermitidoDsParecer ? 'Escrever Parecer' : labelStatusTextarea}
                </h3>

              <HistoricoRespostasModalButton
                idSolicitacao={sol?.solicitacao?.idSolicitacao ?? null}
                showButton={quantidadeDevolutivas > 0}
                quantidadeDevolutivas={quantidadeDevolutivas}
              />
            </div>

            <div className="rounded-md border bg-muted/30 p-4">
              <Label htmlFor="resposta" className="sr-only">
                Escreva aqui …
                </Label>

                {!diretorPermitidoDsParecer && (
                  <Textarea
                    id="resposta"
                    placeholder="Escreva aqui..."
                    value={resposta}
                    onChange={(e) => setResposta(e.target.value)}
                    rows={5}
                    disabled={!enableEnviarDevolutiva}
                  />
                )}

                {diretorPermitidoDsParecer && ( 
                  <Textarea
                    id="resposta"
                    placeholder="Escreva aqui..."
                    value={dsDarecer}
                    onChange={(e) => setDsDarecer(e.target.value)}
                    rows={5}                
                  />
                )}

              <div className="mt-3 flex items-center gap-3">
                  <label className="inline-flex items-center gap-2 text-sm text-primary hover:underline cursor-pointer aria-disabled:opacity-50 aria-disabled:cursor-not-allowed">
                    <PaperclipIcon className="h-4 w-4" />
                    Fazer upload de arquivo
                      <input
                        type="file"
                        className="hidden"
                        multiple
                        onChange={handleUploadChange}
                        disabled={!enableEnviarDevolutiva}
                    />
                  </label>

                {arquivos.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {arquivos.length} arquivo(s) selecionado(s)
                  </span>
                )}
              </div>

              {arquivos.length > 0 && (
                <ul className="mt-3 flex flex-col gap-2">
                  {arquivos.map((f, idx) => (
                    <li
                      key={`${f.name}-${idx}`}
                      className="flex items-center justify-between rounded-md border bg-white px-3 py-2"
                    >
                      <span className="truncate text-sm">{f.name}</span>
                      {canDeletarAnexo && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleRemoveArquivo(idx)}
                          title="Remover"
                          disabled={sending}
                        >
                          <XIcon className="h-4 w-4" />
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            </section>
        </form>

        <DialogFooter className="flex gap-3 px-6 pb-6">
          <Button type="button" variant="outline" onClick={onClose} disabled={sending}>
            Cancelar
          </Button>
          {diretorPermitidoDsParecer && (
            <Button
              type="button"
              onClick={handleSalvarParecer}
              disabled={sending}
            >
              {sending ? 'Salvando...' : 'Salvar Parecer'}
            </Button>
          )}
            
          {!diretorPermitidoDsParecer && (
            <Button
              type="submit"
              form="detalhes-form"
              disabled={!enableEnviarDevolutiva}
              tooltip={!enableEnviarDevolutiva ? btnTooltip : ''}
            >
            {sending ? 'Enviando...' : btnEnviarDevolutivaLabel}
          </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
