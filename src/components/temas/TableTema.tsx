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
import { Checkbox } from '@/components/ui/checkbox';
import { TemaResponse } from '@/api/temas/types';
import { TipoResponse } from '@/api/tipos/types';
import { usePermissoes } from '@/context/permissoes/PermissoesContext';
import { getLayoutClient, ClienteEnum } from '@/lib/layout/layout-client';

interface TableTemaProps {
  handleSort: (field: keyof TemaResponse) => void;
  loading: boolean;
  temas: TemaResponse[];
  criticidades: TipoResponse[];
  handleEdit: (tema: TemaResponse) => void;
  handleDelete: (tema: TemaResponse) => void;
  allSelected: boolean;
  someSelected: boolean;
  isSelected: (id: number) => boolean;
  toggleSelect: (id: number) => void;
  toggleSelectAll: () => void;
}

export default function TableTema(props: TableTemaProps) {
  const isMvp = getLayoutClient() === ClienteEnum.RTECH;
  const { canAtualizarTema, canDeletarTema } = usePermissoes();

  const colSpan = 3 + (isMvp ? 1 : 0) + (canAtualizarTema || canDeletarTema ? 1 : 0);

  const getCriticidadeNome = (tema: TemaResponse) => {
    if (tema.tipoCriticidade?.dsTipo) return tema.tipoCriticidade.dsTipo;

    const id = tema.idTipoCriticidade ?? tema.tipoCriticidade?.idTipo;
    if (!id) return '-';

    return props.criticidades.find((tipo) => tipo.idTipo === id)?.dsTipo || '-';
  };

  return (
    <div className="flex flex-1 overflow-hidden bg-white">
      <StickyTable>
        <StickyTableHeader>
          <StickyTableRow>
            <StickyTableHead>
              <Checkbox
                checked={props.allSelected ? true : props.someSelected ? 'indeterminate' : false}
                onCheckedChange={props.toggleSelectAll}
              />
            </StickyTableHead>
            <StickyTableHead className="cursor-pointer" onClick={() => props.handleSort('nmTema')}>
              <div className="flex items-center">
                Nome
                <ArrowsDownUpIcon className="ml-2 h-4 w-4" />
              </div>
            </StickyTableHead>
            <StickyTableHead>Descrição</StickyTableHead>
            {isMvp && <StickyTableHead>Criticidade</StickyTableHead>}
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
                <StickyTableCell>
                  <Checkbox
                    checked={props.isSelected(tema.idTema)}
                    onCheckedChange={() => props.toggleSelect(tema.idTema)}
                  />
                </StickyTableCell>
                <StickyTableCell className="font-medium">{tema.nmTema}</StickyTableCell>
                <StickyTableCell className="max-w-xs truncate" title={tema.dsTema}>
                  {tema.dsTema || '-'}
                </StickyTableCell>
                {isMvp && <StickyTableCell>
                  {getCriticidadeNome(tema)}
                </StickyTableCell>}
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
