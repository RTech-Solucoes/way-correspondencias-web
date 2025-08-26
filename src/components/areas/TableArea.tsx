import { ArrowsDownUpIcon, BuildingIcon, PencilSimpleIcon, SpinnerIcon, TrashIcon } from "@phosphor-icons/react";
import {
  StickyTable,
  StickyTableBody,
  StickyTableCell,
  StickyTableHead,
  StickyTableHeader,
  StickyTableRow
} from "../ui/sticky-table";
import { Button } from "../ui/button";
import { AreaResponse } from "@/api/areas/types";
import { getStatusText } from "@/utils/utils";

interface ITableArea {
  handleSort: (field: keyof AreaResponse) => void;
  loading: boolean;
  areas: AreaResponse[];
  handleEdit: (area: AreaResponse) => void;
  handleDelete: (areaId: number) => void;
}

export default function TableArea(props: ITableArea) {
  return (
    <div className="flex flex-1 overflow-hidden bg-white">
      <StickyTable>
        <StickyTableHeader>
          <StickyTableRow>
            <StickyTableHead className="cursor-pointer" onClick={() => props.handleSort('cdArea')}>
              <div className="flex items-center">
                Código
                <ArrowsDownUpIcon className="ml-2 h-4 w-4" />
              </div>
            </StickyTableHead>
            <StickyTableHead className="cursor-pointer" onClick={() => props.handleSort('nmArea')}>
              <div className="flex items-center">
                Nome
                <ArrowsDownUpIcon className="ml-2 h-4 w-4" />
              </div>
            </StickyTableHead>
            <StickyTableHead>Descrição</StickyTableHead>
            <StickyTableHead className="cursor-pointer" onClick={() => props.handleSort('flAtivo')}>
              <div className="flex items-center">
                Status
                <ArrowsDownUpIcon className="ml-2 h-4 w-4" />
              </div>
            </StickyTableHead>
            <StickyTableHead className="text-right">Ações</StickyTableHead>
          </StickyTableRow>
        </StickyTableHeader>
        <StickyTableBody>
          {props.loading ? (
            <StickyTableRow>
              <StickyTableCell colSpan={5} className="text-center py-8">
                <div className="flex flex-1 items-center justify-center py-8">
                  <SpinnerIcon className="h-6 w-6 animate-spin text-gray-400" />
                  <span className="ml-2 text-gray-500">Buscando áreas...</span>
                </div>
              </StickyTableCell>
            </StickyTableRow>
          ) : props.areas.length === 0 ? (
            <StickyTableRow>
              <StickyTableCell colSpan={5} className="text-center py-8">
                <div className="flex flex-col items-center space-y-2">
                  <BuildingIcon className="h-8 w-8 text-gray-400" />
                  <p className="text-sm text-gray-500">Nenhuma área encontrada</p>
                </div>
              </StickyTableCell>
            </StickyTableRow>
          ) : (
            props.areas.map((area) => (
              <StickyTableRow key={area.idArea}>
                <StickyTableCell className="font-medium">{area.cdArea}</StickyTableCell>
                <StickyTableCell>{area.nmArea}</StickyTableCell>
                <StickyTableCell>{area.dsArea}</StickyTableCell>
                <StickyTableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${area.flAtivo === 'S'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                    }`}>
                    {getStatusText(area.flAtivo)}
                  </span>
                </StickyTableCell>
                <StickyTableCell className="text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => props.handleEdit(area)}
                    >
                      <PencilSimpleIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => props.handleDelete(area.idArea)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </StickyTableCell>
              </StickyTableRow>
            ))
          )}
        </StickyTableBody>
      </StickyTable>
    </div>
  );
}