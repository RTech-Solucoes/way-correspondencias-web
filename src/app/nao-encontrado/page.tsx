import NotFoundView from '@/components/ui/not-found-view';

/** Rota interna usada pelo middleware (rewrite) para entregar 404 sem piscar a página. */
export default function NaoEncontradoPage() {
  return <NotFoundView />;
}
