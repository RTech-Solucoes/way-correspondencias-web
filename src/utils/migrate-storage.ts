// Função para migrar dados do localStorage para cookies (executar uma vez)
import { setCookie, getCookie } from './cookies';

const MIGRATION_FLAG = 'storage-migrated-to-cookies';

export function migrateLocalStorageToCookies(): void {
  if (typeof window === 'undefined') return;

  // Verifica se já foi migrado (flag em cookie)
  if (getCookie(MIGRATION_FLAG)) {
    return; // Já migrado, não executa novamente - ZERO processamento
  }

  // Lista de chaves para migrar
  const keysToMigrate = [
    'authToken',
    'tokenType',
    'userName',
    'concessionaria-selecionada',
    'selectedModule',
  ];

  let hasDataToMigrate = false;

  keysToMigrate.forEach(key => {
    // Se já existe em cookies, não migra (evita sobrescrever)
    if (getCookie(key)) {
      return;
    }

    // Se existe em localStorage, migra para cookies
    const value = localStorage.getItem(key);
    if (value) {
      setCookie(key, value);
      hasDataToMigrate = true;
    }
  });

  // Migrar permissoes-storage (JSON)
  const permissoesStorage = localStorage.getItem('permissoes-storage');
  if (permissoesStorage && !getCookie('permissoes-storage')) {
    try {
      // Verificar se é JSON válido antes de migrar
      JSON.parse(permissoesStorage);
      setCookie('permissoes-storage', permissoesStorage);
      hasDataToMigrate = true;
    } catch {
      // Se não for JSON válido, ignora
    }
  }

  // Se migrou dados, limpa o localStorage
  if (hasDataToMigrate) {
    keysToMigrate.forEach(key => {
      localStorage.removeItem(key);
    });
    localStorage.removeItem('permissoes-storage');
    sessionStorage.removeItem('permissoes-storage');
  }

  // SEMPRE cria a flag, mesmo se não migrou nada
  // Isso garante que a função nunca execute novamente
  setCookie(MIGRATION_FLAG, 'true', 365); // Flag válida por 1 ano
}
