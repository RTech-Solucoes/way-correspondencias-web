export function handleAddAnexos(
    files: FileList | null,
    setAnexos: React.Dispatch<React.SetStateAction<File[]>>
) {
    if (!files) return;
    setAnexos((prev) => [...prev, ...Array.from(files)]);
}

export function handleRemoveAnexo(
    index: number,
    setAnexos: React.Dispatch<React.SetStateAction<File[]>>
) {
    setAnexos((prev) => prev.filter((_, i) => i !== index));
}
