import {PaperclipIcon} from "@phosphor-icons/react";
import {Input} from "../ui/input";

interface AnexoProps {
  onAddAnexos: (files: FileList | null) => void;
}

export default function AnexoComponent({onAddAnexos}: AnexoProps) {
  return (
    <div className="flex flex-col items-center">
      <label
        htmlFor="file-upload"
        className="flex gap-2 cursor-pointer border border-color-border bg-transparent px-4 py-2 rounded-xl text-sm text-center text-black h-10"
      >
        <PaperclipIcon size={20} weight="bold"/>
        <span>Anexar Documento</span>
      </label>
      <Input
        id="file-upload"
        type="file"
        className="hidden"
        multiple
        onChange={(e) => onAddAnexos(e.target.files)}
      />
    </div>
  );
}
