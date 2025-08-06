import { Area, Responsavel, Solicitacao, Tema, TipoContagem } from './types';
import { v4 as uuidv4 } from 'uuid';

// Mock Areas
export const mockAreas: Area[] = [
  {
    id_area: uuidv4(),
    cd_area: 1001,
    nm_area: 'Jurídico',
    ds_area: 'Departamento Jurídico',
    dt_cadastro: '2025-01-15',
    nr_cpf_cadastro: '12345678901',
    vs_versao: 1,
    dt_alteracao: '2025-01-15',
    nr_cpf_alteracao: '12345678901'
  },
  {
    id_area: uuidv4(),
    cd_area: 1002,
    nm_area: 'Financeiro',
    ds_area: 'Departamento Financeiro',
    dt_cadastro: '2025-01-15',
    nr_cpf_cadastro: '12345678901',
    vs_versao: 1,
    dt_alteracao: '2025-01-15',
    nr_cpf_alteracao: '12345678901'
  },
  {
    id_area: uuidv4(),
    cd_area: 1003,
    nm_area: 'Recursos Humanos',
    ds_area: 'Departamento de Recursos Humanos',
    dt_cadastro: '2025-01-15',
    nr_cpf_cadastro: '12345678901',
    vs_versao: 1,
    dt_alteracao: '2025-01-15',
    nr_cpf_alteracao: '12345678901'
  },
  {
    id_area: uuidv4(),
    cd_area: 1004,
    nm_area: 'TI',
    ds_area: 'Departamento de Tecnologia da Informação',
    dt_cadastro: '2025-01-15',
    nr_cpf_cadastro: '12345678901',
    vs_versao: 1,
    dt_alteracao: '2025-01-15',
    nr_cpf_alteracao: '12345678901'
  },
  {
    id_area: uuidv4(),
    cd_area: 1005,
    nm_area: 'Operações',
    ds_area: 'Departamento de Operações',
    dt_cadastro: '2025-01-15',
    nr_cpf_cadastro: '12345678901',
    vs_versao: 1,
    dt_alteracao: '2025-01-15',
    nr_cpf_alteracao: '12345678901'
  }
];

// Mock Responsaveis
export const mockResponsaveis: Responsavel[] = [
  {
    id_responsavel: uuidv4(),
    ds_nome: 'João Silva',
    ds_email: 'joao.silva@empresa.com',
    nm_telefone: '(11) 98765-4321'
  },
  {
    id_responsavel: uuidv4(),
    ds_nome: 'Maria Oliveira',
    ds_email: 'maria.oliveira@empresa.com',
    nm_telefone: '(21) 99876-5432'
  },
  {
    id_responsavel: uuidv4(),
    ds_nome: 'Carlos Santos',
    ds_email: 'carlos.santos@empresa.com',
    nm_telefone: '(31) 97654-3210'
  },
  {
    id_responsavel: uuidv4(),
    ds_nome: 'Ana Pereira',
    ds_email: 'ana.pereira@empresa.com',
    nm_telefone: '(41) 96543-2109'
  },
  {
    id_responsavel: uuidv4(),
    ds_nome: 'Lucas Costa',
    ds_email: 'lucas.costa@empresa.com',
    nm_telefone: '(51) 95432-1098'
  }
];

// Mock Temas
export const mockTemas: Tema[] = [
  {
    id_tema: uuidv4(),
    nm_tema: 1,
    ds_tema: 'Contratos Jurídicos',
    id_area: mockAreas[0].id_area,
    nr_dias_prazo: 30,
    tp_contagem: TipoContagem.UTEIS,
    dt_cadastro: '2025-01-20',
    nr_cpf_cadastro: '12345678901',
    vs_versao: 1,
    dt_alteracao: '2025-01-20',
    nr_cpf_alteracao: '12345678901'
  },
  {
    id_tema: uuidv4(),
    nm_tema: 2,
    ds_tema: 'Relatórios Financeiros',
    id_area: mockAreas[1].id_area,
    nr_dias_prazo: 15,
    tp_contagem: TipoContagem.CORRIDOS,
    dt_cadastro: '2025-01-20',
    nr_cpf_cadastro: '12345678901',
    vs_versao: 1,
    dt_alteracao: '2025-01-20',
    nr_cpf_alteracao: '12345678901'
  },
  {
    id_tema: uuidv4(),
    nm_tema: 3,
    ds_tema: 'Processos de RH',
    id_area: mockAreas[2].id_area,
    nr_dias_prazo: 10,
    tp_contagem: TipoContagem.UTEIS,
    dt_cadastro: '2025-01-20',
    nr_cpf_cadastro: '12345678901',
    vs_versao: 1,
    dt_alteracao: '2025-01-20',
    nr_cpf_alteracao: '12345678901'
  },
  {
    id_tema: uuidv4(),
    nm_tema: 4,
    ds_tema: 'Infraestrutura de TI',
    id_area: mockAreas[3].id_area,
    nr_dias_prazo: 20,
    tp_contagem: TipoContagem.CORRIDOS,
    dt_cadastro: '2025-01-20',
    nr_cpf_cadastro: '12345678901',
    vs_versao: 1,
    dt_alteracao: '2025-01-20',
    nr_cpf_alteracao: '12345678901'
  },
  {
    id_tema: uuidv4(),
    nm_tema: 5,
    ds_tema: 'Processos Operacionais',
    id_area: mockAreas[4].id_area,
    nr_dias_prazo: 25,
    tp_contagem: TipoContagem.UTEIS,
    dt_cadastro: '2025-01-20',
    nr_cpf_cadastro: '12345678901',
    vs_versao: 1,
    dt_alteracao: '2025-01-20',
    nr_cpf_alteracao: '12345678901'
  }
];

// Mock Solicitacoes
export const mockSolicitacoes: Solicitacao[] = [
  {
    id_solicitacao: uuidv4(),
    cd_solicitante: ['SOL001', 'SOL002'],
    ds_assunto: 'Revisão de contrato',
    cd_identificacao: 'REV001',
    ds_descricao: 'Necessidade de revisão do contrato com fornecedor X',
    ds_anexos: ['contrato.pdf', 'anexo1.pdf'],
    status: 'pendente',
    dt_criacao: '2025-03-01',
    id_responsavel: mockResponsaveis[0].id_responsavel
  },
  {
    id_solicitacao: uuidv4(),
    cd_solicitante: ['SOL003'],
    ds_assunto: 'Análise de relatório financeiro',
    cd_identificacao: 'FIN002',
    ds_descricao: 'Análise do relatório financeiro do primeiro trimestre',
    ds_anexos: ['relatorio.xlsx'],
    status: 'em_andamento',
    dt_criacao: '2025-03-05',
    id_responsavel: mockResponsaveis[1].id_responsavel
  },
  {
    id_solicitacao: uuidv4(),
    cd_solicitante: ['SOL004', 'SOL005'],
    ds_assunto: 'Processo seletivo',
    cd_identificacao: 'RH003',
    ds_descricao: 'Abertura de processo seletivo para desenvolvedor',
    ds_anexos: ['requisitos.docx'],
    status: 'concluido',
    dt_criacao: '2025-02-20',
    id_responsavel: mockResponsaveis[2].id_responsavel
  },
  {
    id_solicitacao: uuidv4(),
    cd_solicitante: ['SOL006'],
    ds_assunto: 'Atualização de infraestrutura',
    cd_identificacao: 'TI004',
    ds_descricao: 'Atualização dos servidores da empresa',
    ds_anexos: ['planejamento.pdf', 'orcamento.xlsx'],
    status: 'atrasado',
    dt_criacao: '2025-02-10',
    id_responsavel: mockResponsaveis[3].id_responsavel
  },
  {
    id_solicitacao: uuidv4(),
    cd_solicitante: ['SOL007', 'SOL008'],
    ds_assunto: 'Otimização de processos',
    cd_identificacao: 'OP005',
    ds_descricao: 'Análise e otimização dos processos operacionais',
    ds_anexos: ['processos.pptx'],
    status: 'pendente',
    dt_criacao: '2025-03-10',
    id_responsavel: mockResponsaveis[4].id_responsavel
  }
];

// Helper function to get area name by id
export const getAreaNameById = (id: string): string => {
  const area = mockAreas.find(area => area.id_area === id);
  return area ? area.nm_area : 'Área não encontrada';
};

// Helper function to get responsavel name by id
export const getResponsavelNameById = (id: string): string => {
  const responsavel = mockResponsaveis.find(resp => resp.id_responsavel === id);
  return responsavel ? responsavel.ds_nome : 'Responsável não encontrado';
};

// Helper function to get responsavel email by id
export const getResponsavelEmailById = (id: string): string => {
  const responsavel = mockResponsaveis.find(resp => resp.id_responsavel === id);
  return responsavel ? responsavel.ds_email : '';
};

// Helper function to get responsavel phone number by id
export const getResponsavelTelefoneById = (id: string): string => {
  const responsavel = mockResponsaveis.find(resp => resp.id_responsavel === id);
  return responsavel ? responsavel.nm_telefone : '';
};
