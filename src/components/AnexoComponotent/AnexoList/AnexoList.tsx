import { Paperclip, Trash } from "@phosphor-icons/react";

interface AnexoListProps {
  anexos: File[];
  onRemove: (index: number) => void;
}

export default function AnexoList({ anexos, onRemove }: AnexoListProps) {
  return (
    <div className="flex gap-2 w-full flex-wrap">
      {anexos.length === 0 ? (
        <span className="text-neutral-400 text-sm">Anexar Documento</span>
      ) : (
        anexos.map((file, idx) => (
          <div className="flex border rounded-md justify-between">
            <div
              key={idx}
              className="flex justify-between p-2 items-center text-sm max-w-[220px] cursor-pointer"
              onClick={() => {
                const fileURL = URL.createObjectURL(file);
                window.open(fileURL, "_blank");
              }}
            >
              <span className="truncate w-4/6">{file.name}</span>
              <span className="text-gray-400 text-xs">
                {(file.size / 1024).toFixed(1)} KB
              </span>
            </div>
            <button
              onClick={() => onRemove(idx)}
              className=" text-white bg-red-500 w-10 h-full rounded-l-full flex justify-center items-center"
            >
              <Trash size={18} weight="bold" />
            </button>
          </div>
        ))
      )}
    </div>
  );
}
