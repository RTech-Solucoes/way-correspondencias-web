'use client';

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import dashboardClient from "@/api/dashboard/client";
import { ObrigacaoPrazoResponse, ObrigacaoTempoMedioResponse } from "@/api/dashboard/type";
import CardHeader from "../card-header";
import { CheckCircle2, XCircle, TrendingUp, Clock } from "lucide-react";

interface ObrigacoesPrazoMetricsProps {
  refreshTrigger?: number;
}

const formatarTempoMedio = (minutos: number | null | undefined): string => {
  if (!minutos || minutos === 0) return '0 minutos';
  
  const minutosNum = Math.round(minutos);
  
  const dias = Math.floor(minutosNum / (24 * 60));
  const horas = Math.floor((minutosNum % (24 * 60)) / 60);
  const mins = minutosNum % 60;
  
  const partes: string[] = [];
  if (dias > 0) partes.push(`${dias} ${dias === 1 ? 'dia' : 'dias'}`);
  if (horas > 0) partes.push(`${horas} ${horas === 1 ? 'hora' : 'horas'}`);
  if (mins > 0) partes.push(`${mins} ${mins === 1 ? 'minuto' : 'minutos'}`);
  
  return partes.length > 0 ? partes.join(', ') : '0 minutos';
};

export default function ObrigacoesPrazoMetrics({ refreshTrigger }: ObrigacoesPrazoMetricsProps) {
  const [data, setData] = useState<ObrigacaoPrazoResponse | null>(null);
  const [tempoMedioData, setTempoMedioData] = useState<ObrigacaoTempoMedioResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [prazoResponse, tempoMedioResponse] = await Promise.all([
          dashboardClient.getObrigacoesPorPrazo(),
          dashboardClient.getObrigacoesTempoMedio(),
        ]);
        setData(prazoResponse);
        setTempoMedioData(tempoMedioResponse);
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
        <div className="grid grid-cols-2 gap-4">
          {/* Dentro do Prazo */}
          <div className="flex flex-col justify-between space-y-4 p-5 bg-green-50 rounded-lg border border-green-200 min-h-[140px]">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <span className="font-semibold text-base text-gray-800">Dentro do Prazo</span>
            </div>
            
            <div className="flex flex-col space-y-2 flex-1">
              <div className="text-3xl font-bold text-green-700 leading-tight">
                {data.quantidadeDentroPrazo}
              </div>
              <div className="text-lg font-bold text-green-800">
                {data.percentualDentroPrazo.toFixed(1)}% do total
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>Progresso</span>
                <span className="font-medium">{data.percentualDentroPrazo.toFixed(1)}%</span>
              </div>
              <div className="h-3 bg-green-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all"
                  style={{ width: `${data.percentualDentroPrazo}%` }}
                />
              </div>
            </div>
          </div>

          {/* Fora do Prazo */}
          <div className="flex flex-col justify-between space-y-4 p-5 bg-red-50 rounded-lg border border-red-200 min-h-[140px]">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <span className="font-semibold text-base text-gray-800">Fora do Prazo</span>
            </div>
            
            <div className="flex flex-col space-y-2 flex-1">
              <div className="text-3xl font-bold text-red-700 leading-tight">
                {data.quantidadeForaPrazo}
              </div>
              <div className="text-lg font-bold text-red-800">
                {data.percentualForaPrazo.toFixed(1)}% do total
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>Progresso</span>
                <span className="font-medium">{data.percentualForaPrazo.toFixed(1)}%</span>
              </div>
              <div className="h-3 bg-red-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 rounded-full transition-all"
                  style={{ width: `${data.percentualForaPrazo}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tempo Médio */}
        <div className="w-full flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <CardTitle  className="mt-5">Tempo Médio até Conclusão de Obrigações</CardTitle>
            <CardDescription className="mb-5">
              Tempo médio desde &quot;Em Andamento&quot; até &quot;Concluído&quot;
            </CardDescription>
          </div>
        
          {tempoMedioData ? (
            <div className="flex flex-col space-y-4 p-5 bg-purple-50 rounded-lg border border-purple-200 w-full">
              <div className="flex items-center gap-2">
                <Clock className="w-6 h-6 text-purple-600" />
                <span className="font-semibold text-base text-gray-800">Tempo Médio de Conclusão</span>
              </div>
              
              <div className="flex flex-col space-y-3 w-full">
                <div className="text-3xl font-bold text-purple-700 leading-tight">
                  {formatarTempoMedio(tempoMedioData.tempoMedioMinutos)}
                </div>
                
                <div className="pt-2 border-t border-purple-200">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium text-gray-700">Baseado em</span>
                      <span className="text-base font-semibold text-gray-900">
                        {tempoMedioData.quantidadeObrigacoes} {tempoMedioData.quantidadeObrigacoes === 1 ? 'obrigação concluída' : 'obrigações concluídas'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-gray-600 bg-purple-100/50 p-2 rounded">
                  <span className="font-medium">Cálculo:</span> Média do tempo de respostas de todas as obrigações concluídas, medido desde a mudança de status para &quot;Em Andamento&quot; até a conclusão.
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500 p-5 bg-gray-50 rounded-lg border border-gray-200 text-center">
              Nenhum dado de tempo médio disponível.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


