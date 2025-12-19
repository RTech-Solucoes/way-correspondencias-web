// Componentes
export { ConferenciaSidebar } from './ConferenciaSidebar';
export { AnexosTab } from './anexo/AnexosTab';
export { ComentariosTab } from './comentario/ComentariosTab';
export { CardComentario } from './comentario/CardComentario';
export { CardTramitacao } from './comentario/CardTramitacao';

// Hooks (re-exportando da pasta hooks)
export { 
  usePermissoesObrigacao, 
  useAnexosLogica, 
  useComentariosLogica, 
  useUserResponsavel 
} from './hooks';
