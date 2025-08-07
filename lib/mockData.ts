import { Area, Responsavel, Solicitacao, Tema, TipoContagem } from './types';
import { v4 as uuidv4 } from 'uuid';

// Mock Areas
export const mockAreas: Area[] = [
  {
    idArea: uuidv4(),
    cdArea: 1001,
    nmArea: 'Jurídico',
    dsArea: 'Departamento Jurídico',
    dtCadastro: '2025-01-15',
    nrCpfCadastro: '12345678901',
    vsVersao: 1,
    dtAlteracao: '2025-01-15',
    nrCpfAlteracao: '12345678901'
  },
  {
    idArea: uuidv4(),
    cdArea: 1002,
    nmArea: 'Financeiro',
    dsArea: 'Departamento Financeiro',
    dtCadastro: '2025-01-15',
    nrCpfCadastro: '12345678901',
    vsVersao: 1,
    dtAlteracao: '2025-01-15',
    nrCpfAlteracao: '12345678901'
  },
  {
    idArea: uuidv4(),
    cdArea: 1003,
    nmArea: 'Recursos Humanos',
    dsArea: 'Departamento de Recursos Humanos',
    dtCadastro: '2025-01-15',
    nrCpfCadastro: '12345678901',
    vsVersao: 1,
    dtAlteracao: '2025-01-15',
    nrCpfAlteracao: '12345678901'
  },
  {
    idArea: uuidv4(),
    cdArea: 1004,
    nmArea: 'TI',
    dsArea: 'Departamento de Tecnologia da Informação',
    dtCadastro: '2025-01-15',
    nrCpfCadastro: '12345678901',
    vsVersao: 1,
    dtAlteracao: '2025-01-15',
    nrCpfAlteracao: '12345678901'
  },
  {
    idArea: uuidv4(),
    cdArea: 1005,
    nmArea: 'Operações',
    dsArea: 'Departamento de Operações',
    dtCadastro: '2025-01-15',
    nrCpfCadastro: '12345678901',
    vsVersao: 1,
    dtAlteracao: '2025-01-15',
    nrCpfAlteracao: '12345678901'
  }
];

// Mock Responsaveis
export const mockResponsaveis: Responsavel[] = [
  {
    idResponsavel: uuidv4(),
    dsNome: 'João Silva',
    dsEmail: 'joao.silva@empresa.com',
    nmTelefone: '(11) 98765-4321'
  },
  {
    idResponsavel: uuidv4(),
    dsNome: 'Maria Oliveira',
    dsEmail: 'maria.oliveira@empresa.com',
    nmTelefone: '(21) 99876-5432'
  },
  {
    idResponsavel: uuidv4(),
    dsNome: 'Carlos Santos',
    dsEmail: 'carlos.santos@empresa.com',
    nmTelefone: '(31) 97654-3210'
  },
  {
    idResponsavel: uuidv4(),
    dsNome: 'Ana Pereira',
    dsEmail: 'ana.pereira@empresa.com',
    nmTelefone: '(41) 96543-2109'
  },
  {
    idResponsavel: uuidv4(),
    dsNome: 'Lucas Costa',
    dsEmail: 'lucas.costa@empresa.com',
    nmTelefone: '(51) 95432-1098'
  }
];

// Mock Temas
export const mockTemas: Tema[] = [
  {
    idTema: uuidv4(),
    nmTema: 'Jurídico',
    dsTema: 'Contratos Jurídicos',
    idAreas: [mockAreas[0].idArea, mockAreas[1].idArea], // Múltiplas áreas
    nrDiasPrazo: 30,
    tpContagem: TipoContagem.UTEIS,
    dtCadastro: '2025-01-20',
    nrCpfCadastro: '12345678901',
    vsVersao: 1,
    dtAlteracao: '2025-01-20',
    nrCpfAlteracao: '12345678901'
  },
  {
    idTema: uuidv4(),
    nmTema: 'Financeiro',
    dsTema: 'Relatórios Financeiros',
    idAreas: [mockAreas[1].idArea, mockAreas[3].idArea, mockAreas[4].idArea], // Múltiplas áreas
    nrDiasPrazo: 15,
    tpContagem: TipoContagem.CORRIDOS,
    dtCadastro: '2025-01-20',
    nrCpfCadastro: '12345678901',
    vsVersao: 1,
    dtAlteracao: '2025-01-20',
    nrCpfAlteracao: '12345678901'
  },
  {
    idTema: uuidv4(),
    nmTema: 'Recursos Humanos',
    dsTema: 'Processos de RH',
    idAreas: [mockAreas[2].idArea],
    nrDiasPrazo: 10,
    tpContagem: TipoContagem.UTEIS,
    dtCadastro: '2025-01-20',
    nrCpfCadastro: '12345678901',
    vsVersao: 1,
    dtAlteracao: '2025-01-20',
    nrCpfAlteracao: '12345678901'
  },
  {
    idTema: uuidv4(),
    nmTema: 'TI',
    dsTema: 'Infraestrutura de TI',
    idAreas: [mockAreas[3].idArea, mockAreas[0].idArea], // Múltiplas áreas
    nrDiasPrazo: 20,
    tpContagem: TipoContagem.CORRIDOS,
    dtCadastro: '2025-01-20',
    nrCpfCadastro: '12345678901',
    vsVersao: 1,
    dtAlteracao: '2025-01-20',
    nrCpfAlteracao: '12345678901'
  },
  {
    idTema: uuidv4(),
    nmTema: 'Operações',
    dsTema: 'Processos Operacionais',
    idAreas: [mockAreas[4].idArea, mockAreas[2].idArea, mockAreas[1].idArea], // Múltiplas áreas
    nrDiasPrazo: 25,
    tpContagem: TipoContagem.UTEIS,
    dtCadastro: '2025-01-20',
    nrCpfCadastro: '12345678901',
    vsVersao: 1,
    dtAlteracao: '2025-01-20',
    nrCpfAlteracao: '12345678901'
  }
];

// Mock Solicitacoes
export const mockSolicitacoes: Solicitacao[] = [
  {
    idSolicitacao: uuidv4(),
    cdSolicitante: ['SOL001', 'SOL002'],
    dsAssunto: 'Revisão de contrato',
    cdIdentificacao: 'REV001',
    dsDescricao: 'Necessidade de revisão do contrato com fornecedor X',
    dsAnexos: ['contrato.pdf', 'anexo1.pdf'],
    status: 'pendente',
    dtCriacao: '2025-03-01',
    idResponsavel: mockResponsaveis[0].idResponsavel
  },
  {
    idSolicitacao: uuidv4(),
    cdSolicitante: ['SOL003'],
    dsAssunto: 'Análise de relatório financeiro',
    cdIdentificacao: 'FIN002',
    dsDescricao: 'Análise do relatório financeiro do primeiro trimestre',
    dsAnexos: ['relatorio.xlsx'],
    status: 'em_andamento',
    dtCriacao: '2025-03-05',
    idResponsavel: mockResponsaveis[1].idResponsavel
  },
  {
    idSolicitacao: uuidv4(),
    cdSolicitante: ['SOL004', 'SOL005'],
    dsAssunto: 'Processo seletivo',
    cdIdentificacao: 'RH003',
    dsDescricao: 'Abertura de processo seletivo para desenvolvedor',
    dsAnexos: ['requisitos.docx'],
    status: 'concluido',
    dtCriacao: '2025-02-20',
    idResponsavel: mockResponsaveis[2].idResponsavel
  },
  {
    idSolicitacao: uuidv4(),
    cdSolicitante: ['SOL006'],
    dsAssunto: 'Atualização de infraestrutura',
    cdIdentificacao: 'TI004',
    dsDescricao: 'Atualização dos servidores da empresa',
    dsAnexos: ['planejamento.pdf', 'orcamento.xlsx'],
    status: 'atrasado',
    dtCriacao: '2025-02-10',
    idResponsavel: mockResponsaveis[3].idResponsavel
  },
  {
    idSolicitacao: uuidv4(),
    cdSolicitante: ['SOL007', 'SOL008'],
    dsAssunto: 'Otimização de processos',
    cdIdentificacao: 'OP005',
    dsDescricao: 'Análise e otimização dos processos operacionais',
    dsAnexos: ['processos.pptx'],
    status: 'pendente',
    dtCriacao: '2025-03-10',
    idResponsavel: mockResponsaveis[4].idResponsavel
  }
];

// Helper function to get area name by id
export const getAreaNameById = (id: string): string => {
  const area = mockAreas.find(area => area.idArea === id);
  return area ? area.nmArea : 'Área não encontrada';
};

// Helper function to get responsavel name by id
export const getResponsavelNameById = (id: string): string => {
  const responsavel = mockResponsaveis.find(resp => resp.idResponsavel === id);
  return responsavel ? responsavel.dsNome : 'Responsável não encontrado';
};

// Helper function to get responsavel email by id
export const getResponsavelEmailById = (id: string): string => {
  const responsavel = mockResponsaveis.find(resp => resp.idResponsavel === id);
  return responsavel ? responsavel.dsEmail : '';
};

// Helper function to get responsavel phone number by id
export const getResponsavelTelefoneById = (id: string): string => {
  const responsavel = mockResponsaveis.find(resp => resp.idResponsavel === id);
  return responsavel ? responsavel.nmTelefone : '';
};
