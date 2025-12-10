'use client';

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import dashboardClient from "@/api/dashboard/client";
import { ObrigacaoPrazoResponse } from "@/api/dashboard/type";
import CardHeader from "../card-header";
import { CheckCircle2, XCircle, TrendingUp } from "lucide-react";

interface ObrigacoesPrazoMetricsProps {
  refreshTrigger?: number;
}

export default function ObrigacoesPrazoMetrics({ refreshTrigger }: ObrigacoesPrazoMetricsProps) {
  const [data, setData] = useState<ObrigacaoPrazoResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await dashboardClient.getObrigacoesPorPrazo();
        setData(response);
      } catch (error) {
        console.error("Erro ao buscar métricas de prazo de obrigações:", error);
        toast.error("Não foi possível carregar as métricas de prazo.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <Card className="flex flex-col h-full">
        <CardHeader title="Obrigações por Prazo" />
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-sm text-gray-500">Carregando métricas...</div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="flex flex-col h-full">
        <CardHeader title="Obrigações por Prazo" />
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-sm text-gray-500">Nenhum dado disponível.</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-full">
      <CardHeader 
        title="Obrigações por Prazo"
        description="Volume e percentual de obrigações atendidas dentro e fora do prazo"
      />
      <CardContent className="flex-1 flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-4">
          {/* Dentro do Prazo */}
          <div className="flex flex-col space-y-3 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-sm text-gray-700">Dentro do Prazo</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-green-700">
                {data.quantidadeDentroPrazo}
              </div>
              <div className="text-sm text-gray-600">
                {data.percentualDentroPrazo.toFixed(1)}% do total
              </div>
            </div>
            <div className="h-2 bg-green-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all"
                style={{ width: `${data.percentualDentroPrazo}%` }}
              />
            </div>
          </div>

          {/* Fora do Prazo */}
          <div className="flex flex-col space-y-3 p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="font-semibold text-sm text-gray-700">Fora do Prazo</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-red-700">
                {data.quantidadeForaPrazo}
              </div>
              <div className="text-sm text-gray-600">
                {data.percentualForaPrazo.toFixed(1)}% do total
              </div>
            </div>
            <div className="h-2 bg-red-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 rounded-full transition-all"
                style={{ width: `${data.percentualForaPrazo}%` }}
              />
            </div>
          </div>
        </div>

        {/* Total */}
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-sm text-gray-700">Total de Obrigações</span>
          </div>
          <div className="text-2xl font-bold text-blue-700">
            {data.total}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

