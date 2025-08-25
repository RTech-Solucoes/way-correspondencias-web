import {DownloadSimpleIcon, TrashIcon} from "@phosphor-icons/react";

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
  onRemove: (index: number) => void;
  onDownload?: (anexo: AnexoBackend) => void | Promise<void>;
}

export default function AnexoList({
  anexos,
  onRemove,
  onDownload,
}: AnexoListProps) {
  return (
    <div className="flex gap-2 w-full flex-wrap">
      {anexos.length === 0 ? (
        <span className="text-neutral-400 text-sm">Anexar Documento</span>
      ) : (
        anexos.map((file, idx) => {
          const isBackend = (file as AnexoBackend).idAnexo !== undefined;
          return (
            <div className="flex border rounded-md justify-between" key={idx}>
              <div
                className="flex justify-between p-2 items-center text-sm max-w-[220px] cursor-pointer"
                onClick={() => {
                  if (isBackend && onDownload) {
                    onDownload(file as AnexoBackend);
                  } else {
                    const fileURL = URL.createObjectURL(file as File);
                    window.open(fileURL, "_blank");
                  }
                }}
              >
                <span className="truncate w-4/6">
                  {file.name || (file as AnexoBackend).nmArquivo}
                </span>
                <span className="text-gray-400 text-xs">
                  {file.size
                    ? ((file.size / 1024).toFixed(1) + " KB")
                    : ""}
                </span>
                {isBackend && (
                  <button
                    type="button"
                    className="ml-2 text-blue-500"
                    title="Baixar"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onDownload) onDownload(file as AnexoBackend);
                    }}
                  >
                    <DownloadSimpleIcon size={18} />
                  </button>
                )}
              </div>
              <button
                onClick={() => onRemove(idx)}
                className=" text-white bg-red-500 w-10 h-full rounded-l-full flex justify-center items-center"
              >
                <TrashIcon size={18} weight="bold" />
              </button>
            </div>
          );
        })
      )}
    </div>
  );
}
