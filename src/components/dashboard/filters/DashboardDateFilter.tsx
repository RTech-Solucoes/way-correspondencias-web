'use client';

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface DashboardDateFilterProps {
  values: {
    dtCriacaoInicio: string;
    dtCriacaoFim: string;
  };
  onChange: (values: { dtCriacaoInicio: string; dtCriacaoFim: string }) => void;
  onApply: () => void;
  onClear: () => void;
}

export function DashboardDateFilter({
  values,
  onChange,
  onApply,
  onClear,
}: DashboardDateFilterProps) {
  const handleChange = (key: "dtCriacaoInicio" | "dtCriacaoFim", value: string) => {
    onChange({
      ...values,
      [key]: value,
    });
  };

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-md">
      <div className="mb-4 flex flex-col gap-1">
        <h3 className="text-lg font-semibold text-gray-900">Filtrar por período</h3>
        <p className="text-sm text-gray-500">
          Escolha o intervalo de datas para filtrar dados das solicitações exibidas no painel.
        </p>
      </div>
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-1 flex-wrap items-end gap-4">
          <div className="min-w-[200px] flex-1">
            <Label htmlFor="dtCriacaoInicio">Data criação (início)</Label>
            <Input
              id="dtCriacaoInicio"
              type="date"
              value={values.dtCriacaoInicio}
              onChange={(e) => handleChange("dtCriacaoInicio", e.target.value)}
            />
          </div>
          <div className="min-w-[200px] flex-1">
            <Label htmlFor="dtCriacaoFim">Data criação (fim)</Label>
            <Input
              id="dtCriacaoFim"
              type="date"
              value={values.dtCriacaoFim}
              onChange={(e) => handleChange("dtCriacaoFim", e.target.value)}
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
