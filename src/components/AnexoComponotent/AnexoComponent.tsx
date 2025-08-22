import { Paperclip } from "@phosphor-icons/react";
import { Input } from "../ui/input";

interface IAnexoProps {
    componentStyle?: string;
    onAddAnexos: (files: FileList | null) => void;
}

export default function AnexoComponent({ componentStyle, onAddAnexos }: IAnexoProps) {
    return (
        <div className={`flex flex-col ${componentStyle} max-w-[250px] items-center`}>
            <label
                htmlFor="file-upload"
                className="flex gap-2 cursor-pointer border border-color-border bg-transparent px-4 py-2 rounded-xl text-sm text-center text-black h-10"
            >
                <Paperclip size={20} weight="bold" />
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
