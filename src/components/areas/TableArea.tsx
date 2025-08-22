import { ArrowsDownUpIcon, BuildingIcon, PencilSimpleIcon, SpinnerIcon, TrashIcon } from "@phosphor-icons/react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
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
    <div className="flex flex-1 overflow-auto bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="cursor-pointer" onClick={() => props.handleSort('cdArea')}>
              <div className="flex items-center">
                Código
                <ArrowsDownUpIcon className="ml-2 h-4 w-4" />
              </div>
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => props.handleSort('nmArea')}>
              <div className="flex items-center">
                Nome
                <ArrowsDownUpIcon className="ml-2 h-4 w-4" />
              </div>
            </TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead className="cursor-pointer" onClick={() => props.handleSort('flAtivo')}>
              <div className="flex items-center">
                Status
                <ArrowsDownUpIcon className="ml-2 h-4 w-4" />
              </div>
            </TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {props.loading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8">
                <div className="flex flex-1 items-center justify-center py-8">
                  <SpinnerIcon className="h-6 w-6 animate-spin text-gray-400" />
                  <span className="ml-2 text-gray-500">Buscando áreas...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : props.areas.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8">
                <div className="flex flex-col items-center space-y-2">
                  <BuildingIcon className="h-8 w-8 text-gray-400" />
                  <p className="text-sm text-gray-500">Nenhuma área encontrada</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            props.areas.map((area) => (
              <TableRow key={area.idArea}>
                <TableCell className="font-medium">{area.cdArea}</TableCell>
                <TableCell>{area.nmArea}</TableCell>
                <TableCell>{area.dsArea}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${area.flAtivo === 'S'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                    }`}>
                    {getStatusText(area.flAtivo)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
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
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}