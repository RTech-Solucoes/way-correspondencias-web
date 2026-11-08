import ApiClient from '../client';

export interface ResponsavelMencionavel {
  idResponsavel: number;
  nmResponsavel: string;
  /** Áreas da pessoa na obrigação ou, sem área, o perfil. */
  dsVinculo: string;
}

export interface MencaoNaoLida {
  idMencao: number;
  idObrigacao: number;
  cdIdentificacao: string;
  nmAutor: string;
  dsComentario: string;
  dtCriacao: string;
}

export interface MencoesNaoLidas {
  total: number;
  itens: MencaoNaoLida[];
}

class MencoesClient {
  private client = new ApiClient('');

  listarMencionaveis(idObrigacao: number): Promise<ResponsavelMencionavel[]> {
    return this.client.request<ResponsavelMencionavel[]>(`/obrigacoes/${idObrigacao}/mencionaveis`);
  }

  registrar(idObrigacao: number, idsResponsaveis: number[], dsComentario: string): Promise<void> {
    return this.client.request<void>(`/obrigacoes/${idObrigacao}/mencoes`, {
      method: 'POST',
      body: JSON.stringify({ idsResponsaveis, dsComentario }),
    });
  }

  listarNaoLidas(): Promise<MencoesNaoLidas> {
    return this.client.request<MencoesNaoLidas>('/mencoes/nao-lidas');
  }

  marcarComoLida(idMencao: number): Promise<void> {
    return this.client.request<void>(`/mencoes/${idMencao}/lida`, { method: 'PUT' });
  }

  marcarTodasComoLidas(): Promise<void> {
    return this.client.request<void>('/mencoes/lidas', { method: 'PUT' });
  }
}

export const mencoesClient = new MencoesClient();
export default mencoesClient;
