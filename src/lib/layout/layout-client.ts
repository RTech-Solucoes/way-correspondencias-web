import { 
  ClienteEnum, 
  ClienteConfig, 
  getClienteAtual, 
  getClienteConfig 
} from './layout-client.enum';

export function getLayoutClient(): ClienteEnum {
  return getClienteAtual();
}

export function getLabelTitle(clienteId?: ClienteEnum): string {
  const config = getClienteConfig(clienteId);
  return config.nome;
}

export function getLogoPath(clienteId?: ClienteEnum): string {
  const config = getClienteConfig(clienteId);
  return config.logo;
}

export function getBackgroundLoginPath(clienteId?: ClienteEnum): string {
  const config = getClienteConfig(clienteId);
  return config.backgroundLogin;
}

export function getFaviconPath(clienteId?: ClienteEnum): string {
  const config = getClienteConfig(clienteId);
  return config.favicon;
}

export function getClienteConfigCompleta(clienteId?: ClienteEnum): ClienteConfig {
  return getClienteConfig(clienteId);
}

export function getNomeSistema(clienteId?: ClienteEnum): string {
  const config = getClienteConfig(clienteId);
  return config.nomeSistema || 'Software Regulatório';
}

export type { ClienteEnum, ClienteConfig } from './layout-client.enum';

