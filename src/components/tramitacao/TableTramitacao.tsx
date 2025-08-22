import { ArrowsDownUpIcon, SpinnerIcon, ArrowsLeftRightIcon } from "@phosphor-icons/react";
import {
  StickyTable,
  StickyTableBody,
  StickyTableCell,
  StickyTableHead,
  StickyTableHeader,
  StickyTableRow
} from "../ui/sticky-table";
import { TramitacaoResponse } from "@/api/tramitacao/types";
import { getStatusText } from "@/utils/utils";

interface ITableTramitacao {
  handleSort: (field: keyof TramitacaoResponse) => void;
  loading: boolean;
  tramitacoes: TramitacaoResponse[];
}

export default function TableTramitacao(props: ITableTramitacao) {
  return (
    <div className="flex flex-1 overflow-hidden bg-white">
      <StickyTable>
        <StickyTableHeader>
          <StickyTableRow>
            <StickyTableHead className="cursor-pointer" onClick={() => props.handleSort('idSolicitacao')}>
              <div className="flex items-center">
                Solicitação
                <ArrowsDownUpIcon className="ml-2 h-4 w-4" />
              </div>
            </StickyTableHead>
            <StickyTableHead>Origem</StickyTableHead>
            <StickyTableHead>Destino</StickyTableHead>
            <StickyTableHead className="cursor-pointer" onClick={() => props.handleSort('flAtivo')}>
              <div className="flex items-center">
                Status
                <ArrowsDownUpIcon className="ml-2 h-4 w-4" />
              </div>
            </StickyTableHead>
          </StickyTableRow>
        </StickyTableHeader>
        <StickyTableBody>
          {props.loading ? (
            <StickyTableRow>
              <StickyTableCell colSpan={5} className="text-center py-8">
                <div className="flex flex-1 items-center justify-center py-8">
                  <SpinnerIcon className="h-6 w-6 animate-spin text-gray-400" />
                  <span className="ml-2 text-gray-500">Buscando tramitações...</span>
                </div>
              </StickyTableCell>
            </StickyTableRow>
          ) : props.tramitacoes.length === 0 ? (
            <StickyTableRow>
              <StickyTableCell colSpan={5} className="text-center py-8">
                <div className="flex flex-col items-center space-y-2">
                  <ArrowsLeftRightIcon className="h-8 w-8 text-gray-400" />
                  <p className="text-sm text-gray-500">Nenhuma tramitação encontrada</p>
                </div>
              </StickyTableCell>
            </StickyTableRow>
          ) : (
            props.tramitacoes.map((tramitacao) => (
              <StickyTableRow key={tramitacao.idTramitacao}>
                <StickyTableCell>
                  {tramitacao.solicitacao ? (
                    <div>
                      <div className="font-medium">{tramitacao.solicitacao.numero}</div>
                      <div className="text-sm text-gray-500">{tramitacao.solicitacao.assunto}</div>
                    </div>
                  ) : (
                    tramitacao.idSolicitacao
                  )}
                </StickyTableCell>
                <StickyTableCell>
                  {tramitacao.responsavelAreaOrigem ? (
                    <div>
                      <div className="font-medium">{tramitacao.responsavelAreaOrigem.nome}</div>
                      <div className="text-sm text-gray-500">{tramitacao.responsavelAreaOrigem.area}</div>
                    </div>
                  ) : (
                    tramitacao.idResponsavelAreaOrigem
                  )}
                </StickyTableCell>
                <StickyTableCell>
                  {tramitacao.responsavelAreaDestino ? (
                    <div>
                      <div className="font-medium">{tramitacao.responsavelAreaDestino.nome}</div>
                      <div className="text-sm text-gray-500">{tramitacao.responsavelAreaDestino.area}</div>
                    </div>
                  ) : (
                    tramitacao.idResponsavelAreaDestino
                  )}
                </StickyTableCell>
                <StickyTableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${tramitacao.flAtivo === 'S'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                    }`}>
                    {getStatusText(tramitacao.flAtivo)}
                  </span>
                </StickyTableCell>
              </StickyTableRow>
            ))
          )}
        </StickyTableBody>
      </StickyTable>
    </div>
  );
}