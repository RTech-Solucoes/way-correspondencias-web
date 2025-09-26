import {StickyTableCell, StickyTableRow} from "@/components/ui/sticky-table";
import React from "react";
import {repeat} from "@/utils/utils";

interface LoadingRowsProps {
  canAtualizarSolicitacao: boolean | null;
  canDeletarSolicitacao: boolean | null;
}

export default function LoadingRows({
  canAtualizarSolicitacao,
  canDeletarSolicitacao,
}: LoadingRowsProps) {
  return (
    repeat(15).map((_, index) => {
        return (
          <StickyTableRow key={index}>
          <StickyTableCell className="font-medium">
            <div className="w-full rounded h-9 bg-gray-300 animate-pulse" />
          </StickyTableCell>
          <StickyTableCell className="max-w-xs truncate">
            <div className="w-full rounded h-9 bg-gray-300 animate-pulse" />
          </StickyTableCell>
          <StickyTableCell>
            <div className="w-full rounded h-9 bg-gray-300 animate-pulse" />
          </StickyTableCell>
          <StickyTableCell>
            <div className="w-full rounded h-9 bg-gray-300 animate-pulse" />
          </StickyTableCell>
          <StickyTableCell>
            <div className="w-full rounded h-9 bg-gray-300 animate-pulse" />
          </StickyTableCell>
          <StickyTableCell className="text-right">
            <div className="flex items-center justify-end space-x-2">
              <div className="w-9 rounded-full h-9 bg-gray-300 animate-pulse" />
              <div className="w-9 rounded-full h-9 bg-gray-300 animate-pulse" />
              {canAtualizarSolicitacao &&
                <div className="w-9 rounded-full h-9 bg-gray-300 animate-pulse" />
              }
              {canDeletarSolicitacao &&
                <div className="w-9 rounded-full h-9 bg-gray-300 animate-pulse" />
              }
            </div>
          </StickyTableCell>
        </StickyTableRow>
        )
      }
    )
  )
}