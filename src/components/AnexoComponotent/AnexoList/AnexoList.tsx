import {DownloadSimpleIcon, XIcon} from "@phosphor-icons/react";
import {Button} from "@/components/ui/button";
import React from "react";
import {usePermissoes} from "@/context/permissoes/PermissoesContext";

interface AnexoBackend {
  idAnexo?: number;
  idObjeto?: number;
  name: string;
  size?: number;
  nmArquivo?: string;
  dsCaminho?: string;
  tpObjeto?: string;
}

interface AnexoListProps {
  anexos: (File | AnexoBackend)[];
  onRemove?: (index: number) => void;
  onDownload?: (anexo: AnexoBackend) => void | Promise<void>;
}

export default function AnexoList({
  anexos,
  onRemove,
  onDownload,
}: AnexoListProps) {
  const { canListarAnexo } = usePermissoes();

  if (!canListarAnexo) {
    return (
      <div className="flex flex-col gap-2 w-full">
        <span className="w-full text-gray-500 text-sm">Sem permissão para visualizar anexos</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      {anexos.length === 0 ? (
        <span className="w-full text-foreground text-sm">Anexar Documento</span>
      ) : (
        anexos.map((file, index) => {
          const isBackend = (file as AnexoBackend).idAnexo !== undefined;
          return (
            <div
              key={index}
              className="flex w-full rounded-2xl border items-center justify-between bg-gray-50 px-4 py-2 text-sm cursor-pointer"
              onClick={() => {
                if (isBackend && onDownload) {
                  onDownload(file as AnexoBackend);
                } else {
                  const fileURL = URL.createObjectURL(file as File);
                  window.open(fileURL, "_blank");
                }
              }}
            >
              <span className="truncate w-full">
                {file.name || (file as AnexoBackend).nmArquivo}
              </span>
              <span className="text-gray-400 text-xs whitespace-nowrap mr-4">
                {file.size
                  ? ((file.size / 1024).toFixed(1) + " KB")
                  : ""}
              </span>
              {isBackend &&
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onDownload) onDownload(file as AnexoBackend);
                  }}
                >
                  <DownloadSimpleIcon size={18}/>
                </Button>
              }
              {onRemove && (!isBackend) &&
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(index)
                  }}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <XIcon className="h-4 w-4"/>
                </Button>
              }
            </div>
          );
        })
      )}
    </div>
  );
}
