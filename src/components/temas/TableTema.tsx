import { ArrowsDownUpIcon, PencilSimpleIcon, SpinnerIcon, TagIcon, TrashIcon } from '@phosphor-icons/react';
import {
  StickyTable,
  StickyTableBody,
  StickyTableCell,
  StickyTableHead,
  StickyTableHeader,
  StickyTableRow
} from '@/components/ui/sticky-table';
import { Button } from '@/components/ui/button';
import { TemaResponse } from '@/api/temas/types';
import { usePermissoes } from '@/context/permissoes/PermissoesContext';

interface TableTemaProps {
  handleSort: (field: keyof TemaResponse) => void;
  loading: boolean;
  temas: TemaResponse[];
  handleEdit: (tema: TemaResponse) => void;
  handleDelete: (tema: TemaResponse) => void;
}

export default function TableTema(props: TableTemaProps) {
  const { canAtualizarTema, canDeletarTema } = usePermissoes();

  const colSpan = (canAtualizarTema || canDeletarTema) ? 4 : 3;

  return (
    <div className="flex flex-1 overflow-hidden bg-white">
      <StickyTable>
        <StickyTableHeader>
          <StickyTableRow>
            <StickyTableHead className="cursor-pointer" onClick={() => props.handleSort('nmTema')}>
              <div className="flex items-center">
                Nome
                <ArrowsDownUpIcon className="ml-2 h-4 w-4" />
              </div>
            </StickyTableHead>
            <StickyTableHead>Descrição</StickyTableHead>
            {(canAtualizarTema || canDeletarTema) && (
              <StickyTableHead className="text-right">Ações</StickyTableHead>
            )}
          </StickyTableRow>
        </StickyTableHeader>
        <StickyTableBody>
          {props.loading ? (
            <StickyTableRow>
              <StickyTableCell colSpan={colSpan} className="text-center py-8">
                <div className="flex flex-1 items-center justify-center py-8">
                  <SpinnerIcon className="h-6 w-6 animate-spin text-gray-400" />
                  <span className="ml-2 text-gray-500">Buscando temas...</span>
                </div>
              </StickyTableCell>
            </StickyTableRow>
          ) : props.temas.length === 0 ? (
            <StickyTableRow>
              <StickyTableCell colSpan={colSpan} className="text-center py-8">
                <div className="flex flex-col items-center space-y-2">
                  <TagIcon className="h-8 w-8 text-gray-400" />
                  <p className="text-sm text-gray-500">Nenhum tema encontrado</p>
                </div>
              </StickyTableCell>
            </StickyTableRow>
          ) : (
            props.temas.map((tema) => (
              <StickyTableRow key={tema.idTema}>
                <StickyTableCell className="font-medium">{tema.nmTema}</StickyTableCell>
                <StickyTableCell className="max-w-xs truncate" title={tema.dsTema}>
                  {tema.dsTema || '-'}
                </StickyTableCell>
                {(canAtualizarTema || canDeletarTema) && (
                  <StickyTableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {canAtualizarTema && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => props.handleEdit(tema)}
                        >
                          <PencilSimpleIcon className="h-4 w-4" />
                        </Button>
                      )}
                      {canDeletarTema && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => props.handleDelete(tema)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </StickyTableCell>
                )}
              </StickyTableRow>
            ))
          )}
        </StickyTableBody>
      </StickyTable>
    </div>
  );
}
