/**
 * Sistema de Layout e Branding por Cliente
 * 
 * Para adicionar um novo cliente:
 * 1. Adicione o enum em ClienteEnum (ex: NOVO_CLIENTE = 'novo-cliente')
 * 2. Adicione a configuração em CLIENTES_CONFIG com todos os assets
 * 3. Atualize getClienteAtual() para suportar o novo cliente
 * 
 * Clientes atuais:
 * - WAY_BRASIL: Sistema da Way (262, 306, 112, etc.)
 * - RTECH: MVP (teste)
 */

export enum ClienteEnum {
  WAY_BRASIL = 'way',
  RTECH = 'mvp',
}

export interface ClienteConfig {
  id: ClienteEnum;
  nome: string;
  nomeSistema?: string;
  logo: string;
  favicon: string;
  backgroundLogin: string;
}

export const CLIENTES_CONFIG: Record<ClienteEnum, ClienteConfig> = {
  [ClienteEnum.WAY_BRASIL]: {
    id: ClienteEnum.WAY_BRASIL,
    nome: 'Way Brasil',
    nomeSistema: 'Software Regulatório',
    logo: '/images/way/way-brasil-logo.png',
    favicon: '/images/way/way-brasil-logo.png',
    backgroundLogin: '/images/way/way-background-login.png',
  },
  [ClienteEnum.RTECH]: {
    id: ClienteEnum.RTECH,
    nome: 'RTech',
    nomeSistema: 'Software Regulatório',
    logo: '/images/mvp/mvp-logo.png',
    favicon: '/images/mvp/mvp-logo.png',
    backgroundLogin: '/images/mvp/mvp-background-login.png',
  },
};

//IMPORTANTE: Ao adicionar novo cliente, adicione a verificação aqui
export function getClienteAtual(): ClienteEnum {
  const clienteEnv = process.env.NEXT_PUBLIC_LAYOUT_CLIENT;
  
  if (clienteEnv === ClienteEnum.WAY_BRASIL) {
    return ClienteEnum.WAY_BRASIL;
  }
  
  return ClienteEnum.RTECH;
}

export function getClienteConfig(idCliente?: ClienteEnum): ClienteConfig {
  const cliente = idCliente || getClienteAtual();
  return CLIENTES_CONFIG[cliente] || CLIENTES_CONFIG[ClienteEnum.WAY_BRASIL];
}
