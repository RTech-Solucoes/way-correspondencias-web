'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PaperclipIcon, X as XIcon } from '@phosphor-icons/react';
import { ChangeEvent } from 'react';
import { AreaSelectionButtons } from './AreaSelectionButtons';
import { HistoricoRespostasModalButton } from '../HistoricoRespostasModal';

type Area = {
  idArea: number;
  nmArea: string;
};

type DetalhesSolicitacaoDevolutivaProps = {
  // Form state
  resposta: string;
  setResposta: (value: string) => void;
  dsDarecer: string;
  setDsDarecer: (value: string) => void;
  arquivos: File[];
  sending: boolean;
  flAprovado: 'S' | 'N' | '';
  setFlAprovado: (value: 'S' | 'N' | '') => void;
  areaSelecionadaParaResposta: number | null;
  setAreaSelecionadaParaResposta: (value: number | null) => void;

  // Handlers
  handleUploadChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleRemoveArquivo: (index: number) => void;

  // Labels
  labelStatusTextarea: string;
  labelFlAprovacao: string;

  // Flags
  isFlagVisivel: boolean;
  diretorPermitidoDsParecer: boolean;
  enableEnviarDevolutiva: boolean;
  isResponsavelPossuiMaisUmaAreaIgualSolicitacao: boolean;
  isAnaliseGerenteRegulatorio: boolean;
  isExisteCienciaGerenteRegul: boolean;
  canDeletarAnexo: boolean;

  // Data
  idSolicitacao: number | null;
  quantidadeDevolutivas: number;
  areasCorrespondentesParaSelecao: Area[];
};

export function DetalhesSolicitacaoDevolutiva({
  resposta,
  setResposta,
  dsDarecer,
  setDsDarecer,
  arquivos,
  sending,
  flAprovado,
  setFlAprovado,
  areaSelecionadaParaResposta,
  setAreaSelecionadaParaResposta,
  handleUploadChange,
  handleRemoveArquivo,
  labelStatusTextarea,
  labelFlAprovacao,
  isFlagVisivel,
  diretorPermitidoDsParecer,
  enableEnviarDevolutiva,
  isResponsavelPossuiMaisUmaAreaIgualSolicitacao,
  isAnaliseGerenteRegulatorio,
  isExisteCienciaGerenteRegul,
  canDeletarAnexo,
  idSolicitacao,
  quantidadeDevolutivas,
  areasCorrespondentesParaSelecao,
}: DetalhesSolicitacaoDevolutivaProps) {
  return (
    <>
      {/* Checkbox de ciência para Gerente Regulatório */}
      {isAnaliseGerenteRegulatorio && !isExisteCienciaGerenteRegul && (
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-4 mt-2">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={flAprovado === 'S'}
                onCheckedChange={() => setFlAprovado(flAprovado === 'S' ? 'N' : 'S')}
                id="flAprovado"
              />
              <Label htmlFor="flAprovado" className="text-sm font-medium">
                Declaro estar ciente da solicitação e de seu conteúdo
              </Label>
            </div>
          </div>
        </section>
      )}

      {/* Flag de aprovação */}
      {isFlagVisivel && !diretorPermitidoDsParecer && (
        <section className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="aprovarDevolutiva" className="text-sm font-medium">
              {labelFlAprovacao} *
            </Label>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={flAprovado === 'S'}
                  onCheckedChange={() => setFlAprovado('S')}
                  id="aprovarDevolutiva-s"
                />
                <Label htmlFor="aprovarDevolutiva-s" className="text-sm font-light">Sim</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={flAprovado === 'N'}
                  onCheckedChange={() => setFlAprovado('N')}
                  id="aprovarDevolutiva-n"
                />
                <Label htmlFor="aprovarDevolutiva-n" className="text-sm font-light">Não</Label>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Área de resposta/parecer */}
      <section className="space-y-3">
        {/* Seleção de área */}
        {isResponsavelPossuiMaisUmaAreaIgualSolicitacao && (
          <AreaSelectionButtons
            areas={areasCorrespondentesParaSelecao}
            selectedAreaId={areaSelecionadaParaResposta}
            onAreaSelect={setAreaSelecionadaParaResposta}
            disabled={!enableEnviarDevolutiva}
            label="Selecione para qual área você está respondendo?"
            required
          />
        )}

        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">
            {diretorPermitidoDsParecer ? 'Escrever Parecer' : labelStatusTextarea}
          </h3>

          <HistoricoRespostasModalButton
            idSolicitacao={idSolicitacao}
            showButton={quantidadeDevolutivas > 0}
            quantidadeDevolutivas={quantidadeDevolutivas}
          />
        </div>

        <div className="rounded-md border bg-muted/30 p-4">
          <Label htmlFor="resposta" className="sr-only">
            Escreva aqui …
          </Label>

          {!diretorPermitidoDsParecer && (
            <Textarea
              id="resposta"
              placeholder="Escreva aqui..."
              value={resposta}
              onChange={(e) => setResposta(e.target.value)}
              rows={5}
              disabled={!enableEnviarDevolutiva}
            />
          )}

          {diretorPermitidoDsParecer && (
            <Textarea
              id="resposta"
              placeholder="Escreva aqui..."
              value={dsDarecer}
              onChange={(e) => setDsDarecer(e.target.value)}
              rows={5}
            />
          )}

          {/* Upload de arquivos */}
          <div className="mt-3 flex items-center gap-3">
            <label className="inline-flex items-center gap-2 text-sm text-primary hover:underline cursor-pointer aria-disabled:opacity-50 aria-disabled:cursor-not-allowed">
              <PaperclipIcon className="h-4 w-4" />
              Fazer upload de arquivo
              <input
                type="file"
                className="hidden"
                multiple
                onChange={handleUploadChange}
                disabled={!enableEnviarDevolutiva}
              />
            </label>

            {arquivos.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {arquivos.length} arquivo(s) selecionado(s)
              </span>
            )}
          </div>

          {/* Lista de arquivos */}
          {arquivos.length > 0 && (
            <ul className="mt-3 flex flex-col gap-2">
              {arquivos.map((f, idx) => (
                <li
                  key={`${f.name}-${idx}`}
                  className="flex items-center justify-between rounded-md border bg-white px-3 py-2"
                >
                  <span className="truncate text-sm">{f.name}</span>
                  {canDeletarAnexo && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleRemoveArquivo(idx)}
                      title="Remover"
                      disabled={sending}
                    >
                      <XIcon className="h-4 w-4" />
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
