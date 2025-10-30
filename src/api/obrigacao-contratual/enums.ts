export enum ClassificacaoEnum {
  PRINCIPAL = 'PRINCIPAL',
  CONDICIONADA = 'CONDICIONADA',
  SUPERVENIENTE = 'SUPERVENIENTE',
}

export const classificacaoLabels: Record<ClassificacaoEnum, string> = {
  [ClassificacaoEnum.PRINCIPAL]: 'Principal',
  [ClassificacaoEnum.CONDICIONADA]: 'Condicionada',
  [ClassificacaoEnum.SUPERVENIENTE]: 'Superveniente',
};

export enum PeriodicidadeEnum {
  SEMANAL = 'SEMANAL',
  MENSAL = 'MENSAL',
  ANUAL = 'ANUAL',
  SEMESTRAL = 'SEMESTRAL',
  BIMESTRAL = 'BIMESTRAL',
  TRIMESTRAL = 'TRIMESTRAL',
  UNICA = 'UNICA',
  EXTRAORDINARIA = 'EXTRAORDINARIA',
}

export const periodicidadeLabels: Record<PeriodicidadeEnum, string> = {
  [PeriodicidadeEnum.SEMANAL]: 'Semanal',
  [PeriodicidadeEnum.MENSAL]: 'Mensal',
  [PeriodicidadeEnum.ANUAL]: 'Anual',
  [PeriodicidadeEnum.SEMESTRAL]: 'Semestral',
  [PeriodicidadeEnum.BIMESTRAL]: 'Bimestral',
  [PeriodicidadeEnum.TRIMESTRAL]: 'Trimestral',
  [PeriodicidadeEnum.UNICA]: 'Única',
  [PeriodicidadeEnum.EXTRAORDINARIA]: 'Extraordinária',
};

export enum CriticidadeEnum {
  ALTA = 'ALTA',
  MEDIA = 'MEDIA',
  BAIXA = 'BAIXA',
}

export const criticidadeLabels: Record<CriticidadeEnum, string> = {
  [CriticidadeEnum.ALTA]: 'Alta',
  [CriticidadeEnum.MEDIA]: 'Média',
  [CriticidadeEnum.BAIXA]: 'Baixa',
};

export enum NaturezaEnum {
  CONTRATUAL = 'CONTRATUAL',
  REGULATORIA = 'REGULATORIA',
  AMBIENTAL = 'AMBIENTAL',
  ECONOMICO_FINANCEIRA = 'ECONOMICO_FINANCEIRA',
  JURIDICA_ADMINISTRATIVA = 'JURIDICA_ADMINISTRATIVA',
  TECNICA_OPERACIONAL = 'TECNICA_OPERACIONAL',
}

export const naturezaLabels: Record<NaturezaEnum, string> = {
  [NaturezaEnum.CONTRATUAL]: 'Contratual',
  [NaturezaEnum.REGULATORIA]: 'Regulatória',
  [NaturezaEnum.AMBIENTAL]: 'Ambiental',
  [NaturezaEnum.ECONOMICO_FINANCEIRA]: 'Econômico-financeira',
  [NaturezaEnum.JURIDICA_ADMINISTRATIVA]: 'Jurídica/Administrativa',
  [NaturezaEnum.TECNICA_OPERACIONAL]: 'Técnica-operacional',
};

export const classificacaoList = Object.values(ClassificacaoEnum).map((value) => ({
  value,
  label: classificacaoLabels[value],
}));

export const periodicidadeList = Object.values(PeriodicidadeEnum).map((value) => ({
  value,
  label: periodicidadeLabels[value],
}));

export const criticidadeList = Object.values(CriticidadeEnum).map((value) => ({
  value,
  label: criticidadeLabels[value],
}));

export const naturezaList = Object.values(NaturezaEnum).map((value) => ({
  value,
  label: naturezaLabels[value],
}));

