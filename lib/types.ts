export enum TipoContagem {
  CORRIDOS = "CORRIDOS",
  UTEIS = "UTEIS"
}

export interface Tema {
  idTema: string;
  nmTema: string;
  dsTema: string;
  idAreas: string[];
  nrDiasPrazo: number;
  tpContagem: TipoContagem;
  dtCadastro: string;
  nrCpfCadastro: string;
  vsVersao: number;
  dtAlteracao: string;
  nrCpfAlteracao: string;
}

export interface Area {
  idArea: string;
  cdArea: number;
  nmArea: string;
  dsArea: string;
  dtCadastro: string;
  nrCpfCadastro: string;
  vsVersao: number;
  dtAlteracao: string;
  nrCpfAlteracao: string;
}

export interface Responsavel {
  idResponsavel: string;
  dsNome: string;
  dsEmail: string;
  nmTelefone: string;
  dsPerfil: string;
}

export interface Solicitacao {
  idSolicitacao: string;
  cdSolicitante: string[];
  dsAssunto: string;
  cdIdentificacao: string;
  dsDescricao: string;
  dsAnexos: string[];
  status: 'pendente' | 'em_andamento' | 'concluido' | 'atrasado';
  dtCriacao: string;
  idResponsavel?: string;
}
