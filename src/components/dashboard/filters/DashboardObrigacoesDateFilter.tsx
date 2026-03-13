'use client';

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useUserGestao } from "@/hooks/use-user-gestao";
import { PERFIS_FILTRO_DEFAULT_DATA_LIMITE } from "@/api/obrigacao/types";

export interface ObrigacoesDateFilterValues {
  dtInicio: string;
  dtFim: string;
}

interface DashboardObrigacoesDateFilterProps {
  values: ObrigacoesDateFilterValues;
  onChange: (values: ObrigacoesDateFilterValues) => void;
  onApply: () => void;
  onClear: () => void;
}

export function DashboardObrigacoesDateFilter({
  values,
  onChange,
  onApply,
  onClear,
}: DashboardObrigacoesDateFilterProps) {
  const { idPerfil } = useUserGestao();

  const usaDataLimite = PERFIS_FILTRO_DEFAULT_DATA_LIMITE.includes(idPerfil ?? 0);

  const labelInicio = usaDataLimite ? "Data limite (início)" : "Data término (início)";
  const labelFim = usaDataLimite ? "Data limite (fim)" : "Data término (fim)";
  const subtitulo = usaDataLimite
    ? "Escolha o intervalo de datas limite para filtrar as obrigações exibidas no painel."
    : "Escolha o intervalo de datas de término para filtrar as obrigações exibidas no painel.";

  const handleChange = (key: "dtInicio" | "dtFim", value: string) => {
    onChange({
      ...values,
      [key]: value,
    });
  };

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-md">
      <div className="mb-4 flex flex-col gap-1">
        <h3 className="text-lg font-semibold text-gray-900">Filtrar por período</h3>
        <p className="text-sm text-gray-500">{subtitulo}</p>
      </div>
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-1 flex-wrap items-end gap-4">
          <div className="min-w-[200px] flex-1">
            <Label htmlFor="dtInicio">{labelInicio}</Label>
            <Input
              id="dtInicio"
              type="date"
              value={values.dtInicio}
              onChange={(e) => handleChange("dtInicio", e.target.value)}
            />
          </div>
          <div className="min-w-[200px] flex-1">
            <Label htmlFor="dtFim">{labelFim}</Label>
            <Input
              id="dtFim"
              type="date"
              value={values.dtFim}
              onChange={(e) => handleChange("dtFim", e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-2 md:pl-4">
          <Button size="sm" onClick={onApply}>
            Aplicar Filtros
          </Button>
          <Button size="sm" variant="outline" onClick={onClear}>
            Limpar Filtros
          </Button>
        </div>
      </div>
    </div>
  );
}
