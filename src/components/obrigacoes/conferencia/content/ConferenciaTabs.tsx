'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConferenciaStepDados } from './tabs-steps/ConferenciaStepDados';
import { ConferenciaStepAreasETemas } from './tabs-steps/ConferenciaStepAreasETemas';
import { ConferenciaStepPrazos } from './tabs-steps/ConferenciaStepPrazos';
import { ConferenciaStepAnexos } from './tabs-steps/ConferenciaStepAnexos';
import { ConferenciaStepVinculos } from './tabs-steps/ConferenciaStepVinculos';
import { ObrigacaoDetalheResponse } from '@/api/obrigacao/types';
import { statusList } from '@/api/status-solicitacao/types';
import { getObrigacaoStatusStyle } from '@/utils/obrigacoes/status';
import { TipoEnum } from '@/api/tipos/types';
import { AnexoResponse } from '@/api/anexos/type';

type TabKey = 'dados' | 'temas' | 'prazos' | 'anexos' | 'vinculos';

interface TabDefinition {
  key: TabKey;
  label: string;
}

const tabs: TabDefinition[] = [
  { key: 'dados', label: 'Dados' },
  { key: 'temas', label: 'Temas e áreas' },
  { key: 'prazos', label: 'Prazos' },
  { key: 'anexos', label: 'Anexos' },
  { key: 'vinculos', label: 'Vínculos' },
];

interface ConferenciaTabsProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  obrigacao: ObrigacaoDetalheResponse['obrigacao'];
  anexos: ObrigacaoDetalheResponse['anexos'];
  downloadingId: number | null;
  onDownloadAnexo: (anexo: AnexoResponse) => void;
}

export function ConferenciaTabs({
  activeTab,
  onTabChange,
  obrigacao,
  anexos,
  downloadingId,
  onDownloadAnexo,
}: ConferenciaTabsProps) {
  const areaAtribuida = obrigacao?.areas?.find((area) => area.tipoArea?.cdTipo === TipoEnum.ATRIBUIDA);
  const areasCondicionantes = obrigacao?.areas?.filter((area) => area.tipoArea?.cdTipo === TipoEnum.CONDICIONANTE) ?? [];

  const statusLabel = obrigacao?.statusSolicitacao?.nmStatus ?? '-';

  const statusStyle = getObrigacaoStatusStyle(
    obrigacao?.statusSolicitacao?.idStatusSolicitacao,
    obrigacao?.statusSolicitacao?.nmStatus,
  );

  return (
    <div className="flex flex-1 flex-col gap-6">
      <Tabs
        value={activeTab}
        onValueChange={(value) => onTabChange(value as TabKey)}
        className="flex flex-1 flex-col gap-6"
      >
        <div className="px-6">
          <div className="flex w-full items-center justify-between gap-2 rounded-full border border-gray-200 bg-white px-2 py-2 shadow-sm">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => onTabChange(tab.key)}
                  className={`flex-1 rounded-full px-6 py-3 text-center text-base font-semibold transition-all ${
                    isActive ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <TabsList className="hidden">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.key}
              value={tab.key}
              className="sr-only"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="flex-1">
          <TabsContent value="dados" className="p-0">
            <ConferenciaStepDados
              obrigacao={obrigacao}
              statusLabel={statusLabel}
              statusStyle={statusStyle}
            />
          </TabsContent>

          <TabsContent value="temas" className="p-0">
            <ConferenciaStepAreasETemas
              obrigacao={obrigacao}
              areaAtribuida={areaAtribuida}
              areasCondicionantes={areasCondicionantes}
            />
          </TabsContent>

          <TabsContent value="prazos" className="p-0">
            <ConferenciaStepPrazos obrigacao={obrigacao} />
          </TabsContent>

          <TabsContent value="anexos" className="p-0">
            <ConferenciaStepAnexos
              anexos={anexos}
              downloadingId={downloadingId}
              onDownloadAnexo={onDownloadAnexo}
            />
          </TabsContent>

          <TabsContent value="vinculos" className="p-0">
            <ConferenciaStepVinculos obrigacao={obrigacao} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

