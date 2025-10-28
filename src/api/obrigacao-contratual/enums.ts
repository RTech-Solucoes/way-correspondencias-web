export enum Classificacao {
  PRINCIPAL = 'PRINCIPAL',
  CONDICIONADA = 'CONDICIONADA',
  DERIVADA = 'DERIVADA',
  SUPERVENIENTE = 'SUPERVENIENTE',
}

export const classificacaoLabels: Record<Classificacao, string> = {
  [Classificacao.PRINCIPAL]: 'Principal',
  [Classificacao.CONDICIONADA]: 'Condicionada',
  [Classificacao.DERIVADA]: 'Derivada',
  [Classificacao.SUPERVENIENTE]: 'Superveniente',
};

export enum Periodicidade {
  SEMANAL = 'SEMANAL',
  MENSAL = 'MENSAL',
  ANUAL = 'ANUAL',
  SEMESTRAL = 'SEMESTRAL',
  BIMESTRAL = 'BIMESTRAL',
  TRIMESTRAL = 'TRIMESTRAL',
  UNICA = 'UNICA',
  EXTRAORDINARIA = 'EXTRAORDINARIA',
}

export const periodicidadeLabels: Record<Periodicidade, string> = {
  [Periodicidade.SEMANAL]: 'Semanal',
  [Periodicidade.MENSAL]: 'Mensal',
  [Periodicidade.ANUAL]: 'Anual',
  [Periodicidade.SEMESTRAL]: 'Semestral',
  [Periodicidade.BIMESTRAL]: 'Bimestral',
  [Periodicidade.TRIMESTRAL]: 'Trimestral',
  [Periodicidade.UNICA]: 'Única',
  [Periodicidade.EXTRAORDINARIA]: 'Extraordinária',
};

export enum Criticidade {
  ALTA = 'ALTA',
  MEDIA = 'MEDIA',
  BAIXA = 'BAIXA',
}

export const criticidadeLabels: Record<Criticidade, string> = {
  [Criticidade.ALTA]: 'Alta',
  [Criticidade.MEDIA]: 'Média',
  [Criticidade.BAIXA]: 'Baixa',
};

export enum Natureza {
  CONTRATUAL = 'CONTRATUAL',
  REGULATORIA = 'REGULATORIA',
  AMBIENTAL = 'AMBIENTAL',
  ECONOMICO_FINANCEIRA = 'ECONOMICO_FINANCEIRA',
  JURIDICA_ADMINISTRATIVA = 'JURIDICA_ADMINISTRATIVA',
  TECNICA_OPERACIONAL = 'TECNICA_OPERACIONAL',
}

export const naturezaLabels: Record<Natureza, string> = {
  [Natureza.CONTRATUAL]: 'Contratual',
  [Natureza.REGULATORIA]: 'Regulatória',
  [Natureza.AMBIENTAL]: 'Ambiental',
  [Natureza.ECONOMICO_FINANCEIRA]: 'Econômico-financeira',
  [Natureza.JURIDICA_ADMINISTRATIVA]: 'Jurídica/Administrativa',
  [Natureza.TECNICA_OPERACIONAL]: 'Técnica-operacional',
};

export const classificacaoList = Object.values(Classificacao).map((value) => ({
  value,
  label: classificacaoLabels[value],
}));

export const periodicidadeList = Object.values(Periodicidade).map((value) => ({
  value,
  label: periodicidadeLabels[value],
}));

export const criticidadeList = Object.values(Criticidade).map((value) => ({
  value,
  label: criticidadeLabels[value],
}));

export const naturezaList = Object.values(Natureza).map((value) => ({
  value,
  label: naturezaLabels[value],
}));

