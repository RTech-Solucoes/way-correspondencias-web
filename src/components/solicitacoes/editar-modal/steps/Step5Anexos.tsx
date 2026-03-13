'use client';

import { Label } from '@/components/ui/label';
import AnexoComponent from '@/components/AnexoComponotent/AnexoComponent';
import AnexoList from '@/components/AnexoComponotent/AnexoList/AnexoList';
import { Step5Props } from '../types';

export function Step5Anexos({
  disabled = false,
  anexos,
  anexosBackend,
  anexosTypeE,
  onAddAnexos,
  onRemoveAnexo,
  onRemoveAnexoBackend,
  onDownloadAnexoBackend,
  onDownloadAnexoEmail,
  canListarAnexo,
  canInserirAnexo,
}: Step5Props) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        {canInserirAnexo && <AnexoComponent onAddAnexos={onAddAnexos} disabled={disabled} />}

        {canListarAnexo && anexos.length > 0 && (
          <div>
            <Label className="text-sm font-medium mb-2 block">Anexos:</Label>
            <AnexoList anexos={anexos} onRemove={onRemoveAnexo} />
          </div>
        )}

        {canListarAnexo && anexosBackend.length > 0 && (
          <div>
            <Label className="text-sm font-medium mb-2 block">Documentos já anexados:</Label>
            <AnexoList
              anexos={anexosBackend.map(a => ({
                idAnexo: a.idAnexo,
                idObjeto: a.idObjeto,
                name: a.nmArquivo,
                nmArquivo: a.nmArquivo,
                dsCaminho: a.dsCaminho,
                tpObjeto: a.tpObjeto,
                size: 0,
              }))}
              onRemove={index => {
                const anexo = anexosBackend[index];
                if (anexo?.idAnexo) {
                  onRemoveAnexoBackend(anexo.idAnexo);
                }
              }}
              onDownload={onDownloadAnexoBackend}
            />
          </div>
        )}

        {canListarAnexo && anexosTypeE && anexosTypeE.length > 0 && (
          <div>
            <Label className="text-sm font-medium mb-2 block">Anexos do email</Label>
            <AnexoList
              anexos={anexosTypeE.map(a => ({
                idAnexo: a.idAnexo,
                idObjeto: a.idObjeto,
                name: a.nmArquivo,
                nmArquivo: a.nmArquivo,
                dsCaminho: a.dsCaminho,
                tpObjeto: a.tpObjeto,
                size: 0,
              }))}
              onDownload={async anexoListItem => {
                const anexoOriginal = anexosTypeE.find(a => a.idAnexo === anexoListItem.idAnexo);
                if (anexoOriginal) {
                  await onDownloadAnexoEmail(anexoOriginal);
                }
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
