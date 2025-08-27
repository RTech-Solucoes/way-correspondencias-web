'use client';

import { Label } from '@/components/ui/label';
import type { AnexoFromBackend, AnexoListItem } from '../SolicitacaoModalWizard';
import AnexoComponent from '@/components/AnexoComponotent/AnexoComponent';
import AnexoList from '@/components/AnexoComponotent/AnexoList/AnexoList';

interface Step4AnexosProps {
  anexos: File[];
  anexosBackend: AnexoFromBackend[];
  onAddAnexos: (files: FileList | null) => void;
  onRemoveAnexo: (index: number) => void;
  onRemoveAnexoBackend: (idAnexo: number) => void;
  onDownloadAnexoBackend: (anexo: AnexoListItem) => void;
}

export default function Step4Anexos({
  anexos,
  anexosBackend,
  onAddAnexos,
  onRemoveAnexo,
  onRemoveAnexoBackend,
  onDownloadAnexoBackend,
}: Step4AnexosProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <AnexoComponent onAddAnexos={onAddAnexos} />

        {anexos.length > 0 && (
          <div>
            <Label className="text-sm font-medium mb-2 block">Anexos:</Label>
            <AnexoList anexos={anexos} onRemove={onRemoveAnexo} />
          </div>
        )}

        {anexosBackend.length > 0 && (
          <div>
            <Label className="text-sm font-medium mb-2 block">Documentos já anexados:</Label>
            <AnexoList
              anexos={anexosBackend.map((a) => ({ idAnexo: a.idAnexo, idObjeto: a.idObjeto, name: a.nmArquivo, nmArquivo: a.nmArquivo, dsCaminho: a.dsCaminho, tpObjeto: a.tpObjeto, size: 0 }))}
              onRemove={(index) => {
                const anexo = anexosBackend[index];
                if (anexo?.idAnexo) onRemoveAnexoBackend(anexo.idAnexo);
              }}
              onDownload={onDownloadAnexoBackend}
            />
          </div>
        )}
      </div>
    </div>
  );
}

