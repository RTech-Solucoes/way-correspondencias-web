export interface CreateResponsavelRequest {
  nmResponsavel: string;
  email: string;
  senha: string;
  tp_perfil: 'VISUALIZADOR' | 'EDITOR' | 'APROVADOR';
}