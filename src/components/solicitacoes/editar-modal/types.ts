import { AnexoResponse } from '@/api/anexos/type';
import { AreaResponse } from '@/api/areas/types';
import { CorrespondenciaRequest, CorrespondenciaResponse } from '@/api/correspondencia/types';
import { ResponsavelResponse } from '@/api/responsaveis/types';
import { SolicitacaoPrazoResponse } from '@/api/solicitacoes/types';
import { StatusSolicPrazoTemaForUI } from '@/api/status-prazo-tema/types';
import { StatusSolicitacaoResponse } from '@/api/status-solicitacao/client';
import { statusList } from '@/api/status-solicitacao/types';
import { TemaResponse } from '@/api/temas/types';
import { PrazosFormData } from '@/components/obrigacoes/tramitacao/steps/Step3Prazos';

export interface SolicitacaoFormData extends CorrespondenciaRequest, PrazosFormData {
  idsResponsaveisAssinates?: number[];
}

export interface AnexoListItem {
  idAnexo?: number;
  idObjeto?: number;
  name: string;
  size?: number;
  nmArquivo?: string;
  dsCaminho?: string;
  tpObjeto?: string;
}

export interface SolicitacaoModalProps {
  correspondencia: CorrespondenciaResponse | null;
  open: boolean;
  onClose(): void;
  onSave(): void;
  responsaveis: ResponsavelResponse[];
  temas: TemaResponse[];
  initialSubject?: string;
  initialDescription?: string;
}

export interface StepProps {
  formData: SolicitacaoFormData;
  updateFormData: (data: Partial<SolicitacaoFormData>) => void;
  disabled?: boolean;
}

export interface Step1Props extends StepProps {
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export interface Step2Props extends StepProps {
  temas: TemaResponse[];
  correspondencia: CorrespondenciaResponse | null;
  onAreasSelectionChange: (selectedIds: number[]) => void;
  getResponsavelFromTema: (temaId: number) => number;
}

export interface Step5Props extends StepProps {
  anexos: File[];
  anexosBackend: AnexoResponse[];
  anexosTypeE: AnexoResponse[];
  onAddAnexos: (files: FileList | null) => void;
  onRemoveAnexo: (index: number) => void;
  onRemoveAnexoBackend: (idAnexo: number) => void;
  onDownloadAnexoBackend: (anexo: AnexoListItem) => void;
  onDownloadAnexoEmail: (anexo: AnexoResponse) => void;
  canListarAnexo: boolean;
  canInserirAnexo: boolean;
}

export interface Step6Props extends StepProps {
  correspondencia: CorrespondenciaResponse | null;
  responsaveis: ResponsavelResponse[];
  getSelectedTema: () => TemaResponse | undefined;
  getResponsavelByArea: (areaId: number) => ResponsavelResponse | undefined;
  allAreas: AreaResponse[];
  statusPrazos: StatusSolicPrazoTemaForUI[];
  prazoExcepcional: boolean;
  prazosSolicitacaoPorStatus: SolicitacaoPrazoResponse[];
  statusList: StatusSolicitacaoResponse[];
  anexos: File[];
  anexosBackend: AnexoResponse[];
  anexosTypeE: AnexoResponse[];
  canListarAnexo: boolean;
  currentPrazoTotal: number;
  onDownloadAnexoBackend: (anexo: AnexoListItem) => void;
  onDownloadAnexoEmail: (anexo: AnexoResponse) => void;
}

export const STEPS_CONFIG = [
  { title: 'Dados da Solicitação', description: 'Informações básicas' },
  { title: 'Tema e Áreas', description: 'Configuração' },
  { title: 'Status e Prazos', description: 'Definições de tempo' },
  { title: 'Assinantes', description: 'Validador / Assinante' },
  { title: 'Anexos', description: 'Documentos' },
  { title: 'Resumo', description: 'Finalização' },
];

export const INITIAL_FORM_DATA: SolicitacaoFormData = {
  cdIdentificacao: '',
  dsAssunto: '',
  dsSolicitacao: '',
  dsObservacao: '',
  flStatus: 'P',
  idResponsavel: 0,
  idTema: 0,
  idsAreas: [],
  nrPrazo: undefined,
  tpPrazo: '',
  nrOficio: '',
  nrProcesso: '',
  flAnaliseGerenteDiretor: '',
  flExcepcional: 'N',
  idsResponsaveisAssinates: [],
  flExigeCienciaGerenteRegul: '',
};

export const STATUS_OCULTOS_CORRESPONDENCIA = [
  statusList.PRE_ANALISE.id,
  statusList.VENCIDO_REGULATORIO.id,
  statusList.VENCIDO_AREA_TECNICA.id,
  statusList.ARQUIVADO.id,
];
