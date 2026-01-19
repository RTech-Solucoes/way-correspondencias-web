import { ArrowsDownUpIcon, LockIcon, PencilSimpleIcon, SpinnerIcon, TrashIcon, UsersIcon } from '@phosphor-icons/react';
import {
  StickyTable,
  StickyTableBody,
  StickyTableCell,
  StickyTableHead,
  StickyTableHeader,
  StickyTableRow
} from '@/components/ui/sticky-table';
import { Button } from '@/components/ui/button';
import { ResponsavelResponse } from '@/api/responsaveis/types';
import { formatCPF, getStatusText } from "@/utils/utils";
import { usePermissoes } from '@/context/permissoes/PermissoesContext';
import { useUserGestao } from "@/hooks/use-user-gestao";
import { useIdResponsavelLogado } from '@/hooks/use-id-responsavel-logado';

interface ResponsaveisTableProps {
  responsaveis: ResponsavelResponse[];
  loading: boolean;
  sortField: keyof ResponsavelResponse | null;
  sortDirection: 'asc' | 'desc';
  handleSort: (field: keyof ResponsavelResponse) => void;
  handleEdit: (responsavel: ResponsavelResponse) => void;
  handleDelete: (responsavel: ResponsavelResponse) => void;
  handleGerarSenhaClick: (responsavel: ResponsavelResponse) => void;
  gerandoSenha: number | null;
  ldapEnabled: boolean;
}

export default function ResponsaveisTable({
  responsaveis,
  loading,
  sortField,
  sortDirection,
  handleSort,
  handleEdit,
  handleDelete,
  handleGerarSenhaClick,
  gerandoSenha,
  ldapEnabled,
}: ResponsaveisTableProps) {
  const { canAtualizarResponsavel, canDeletarResponsavel, canGerarSenhaResponsavel } = usePermissoes();
  const { isAdminOrGestor } = useUserGestao();
  
  const idResponsavelLogado = useIdResponsavelLogado();

  const sortedResponsaveis = () => {
    const sorted = [...responsaveis];
    if (sortField) {
      sorted.sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];

        if (aValue === bValue) return 0;

        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return 1;
        if (bValue == null) return -1;

        const comparison = aValue < bValue ? -1 : 1;
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }
    return sorted;
  };

  const colSpan = isAdminOrGestor ? 8 : 7;

  return (
    <div className="flex flex-1 overflow-hidden bg-white rounded-lg shadow-sm border border-gray-200">
      <StickyTable>
        <StickyTableHeader>
          <StickyTableRow>
            <StickyTableHead className="cursor-pointer" onClick={() => handleSort('nmResponsavel')}>
              <div className="flex items-center">
                Nome
                <ArrowsDownUpIcon className="ml-2 h-4 w-4" />
              </div>
            </StickyTableHead>
            <StickyTableHead className="cursor-pointer" onClick={() => handleSort('nmUsuarioLogin')}>
              <div className="flex items-center">
                Usuário
                <ArrowsDownUpIcon className="ml-2 h-4 w-4" />
              </div>
            </StickyTableHead>
            <StickyTableHead className="cursor-pointer" onClick={() => handleSort('dsEmail')}>
              <div className="flex items-center">
                Email
                <ArrowsDownUpIcon className="ml-2 h-4 w-4" />
              </div>
            </StickyTableHead>
            <StickyTableHead>Perfil</StickyTableHead>
            <StickyTableHead>Áreas</StickyTableHead>
            <StickyTableHead className="cursor-pointer" onClick={() => handleSort('nmCargo')}>
              <div className="flex items-center">
                Nome do Cargo
                <ArrowsDownUpIcon className="ml-2 h-4 w-4" />
              </div>
            </StickyTableHead>
            <StickyTableHead className="cursor-pointer" onClick={() => handleSort('flAtivo')}>
              <div className="flex items-center">
                Status
                <ArrowsDownUpIcon className="ml-2 h-4 w-4" />
              </div>
            </StickyTableHead>
            {isAdminOrGestor && (
              <StickyTableHead className="cursor-pointer w-36" onClick={() => handleSort('nrCpf')}>
                <div className="flex items-center">
                  CPF
                  <ArrowsDownUpIcon className="ml-2 h-4 w-4" />
                </div>
              </StickyTableHead>
            )}
            {(canDeletarResponsavel || canAtualizarResponsavel || (ldapEnabled && canGerarSenhaResponsavel)) && (
              <StickyTableHead className="text-right">Ações</StickyTableHead>
            )}
          </StickyTableRow>
        </StickyTableHeader>
        <StickyTableBody>
          {loading ? (
            <StickyTableRow>
              <StickyTableCell colSpan={colSpan} className="text-center py-8">
                <div className="flex flex-1 items-center justify-center py-8">
                  <SpinnerIcon className="h-6 w-6 animate-spin text-gray-400" />
                  <span className="ml-2 text-gray-500">Buscando responsáveis...</span>
                </div>
              </StickyTableCell>
            </StickyTableRow>
          ) : responsaveis?.length === 0 ? (
            <StickyTableRow>
              <StickyTableCell colSpan={colSpan} className="text-center py-8">
                <div className="flex flex-col items-center space-y-2">
                  <UsersIcon className="h-8 w-8 text-gray-400"/>
                  <p className="text-sm text-gray-500">Nenhum responsável encontrado</p>
                </div>
              </StickyTableCell>
            </StickyTableRow>
          ) : (
            sortedResponsaveis().map((responsavel) => {
              const isUsuarioLogado = idResponsavelLogado === responsavel.idResponsavel;
              const isDisabled = gerandoSenha === responsavel.idResponsavel || isUsuarioLogado;

              return (
                <StickyTableRow key={responsavel.idResponsavel}>
                  <StickyTableCell className="font-medium">{responsavel.nmResponsavel}</StickyTableCell>
                  <StickyTableCell>{responsavel.nmUsuarioLogin}</StickyTableCell>
                  <StickyTableCell>{responsavel.dsEmail}</StickyTableCell>
                  <StickyTableCell>{responsavel.nmPerfil || 'N/A'}</StickyTableCell>
                  <StickyTableCell>
                    {responsavel.areas && responsavel.areas?.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {responsavel.areas.slice(0, 2).map((area, index) => (
                          <span key={index} className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                            {area.area.nmArea}
                          </span>
                        ))}
                        {responsavel.areas?.length > 2 && (
                          <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                            +{responsavel.areas?.length - 2}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">Nenhuma área</span>
                    )}
                  </StickyTableCell>
                  <StickyTableCell>{responsavel.nmCargo}</StickyTableCell>
                  <StickyTableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      responsavel.flAtivo === 'S'
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {getStatusText(responsavel.flAtivo)}
                    </span>
                  </StickyTableCell>
                  {isAdminOrGestor && (
                    <StickyTableCell className="w-36">{formatCPF(responsavel.nrCpf)}</StickyTableCell>
                  )}
                  <StickyTableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {ldapEnabled && canGerarSenhaResponsavel && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleGerarSenhaClick(responsavel)}
                          disabled={isDisabled}
                          title={isUsuarioLogado ? 'Você não pode gerar senha para você mesmo.' : 'Gerar Senha'}
                        >
                          {gerandoSenha === responsavel.idResponsavel ? (
                            <SpinnerIcon className="h-4 w-4 animate-spin"/>
                          ) : (
                            <LockIcon className="h-4 w-4"/>
                          )}
                        </Button>
                      )}
                      {canAtualizarResponsavel && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(responsavel)}
                        >
                          <PencilSimpleIcon className="h-4 w-4"/>
                        </Button>
                      )}
                      {canDeletarResponsavel && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(responsavel)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <TrashIcon className="h-4 w-4"/>
                        </Button>
                      )}
                    </div>
                  </StickyTableCell>
                </StickyTableRow>
              );
            })
          )}
        </StickyTableBody>
      </StickyTable>
    </div>
  );
}
