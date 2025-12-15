'use client';

import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import dashboardClient from "@/api/dashboard/client";
import { AreaRankingDTO } from "@/api/dashboard/type";
import CardHeader from "../card-header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { statusObrigacaoList } from "@/api/status-obrigacao/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface ObrigacoesRankingAreasProps {
  refreshTrigger?: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: AreaRankingDTO & { nmAreaShort: string };
    value: number;
  }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900">{data.nmArea}</p>
        <p className="text-xs text-gray-500 mb-1">{data.cdArea}</p>
        <p className="text-sm font-bold text-blue-600">
          {data.totalObrigacoes} {data.totalObrigacoes === 1 ? 'obrigação' : 'obrigações'}
        </p>
        <p className="text-xs text-gray-500 mt-1">Posição: #{data.posicaoRanking}</p>
      </div>
    );
  }
  return null;
};

const colors = [
  '#3b82f6', // azul
  '#10b981', // verde
  '#ef4444', // vermelho
  '#eab308', // amarelo
  '#8b5cf6', // roxo
  '#f97316', // laranja
  '#06b6d4', // ciano
  '#ec4899', // rosa
  '#22c55e', // verde esmeralda
  '#6366f1', // índigo
  '#f59e0b', // amarelo dourado
  '#d946ef', // magenta
  '#14b8a6', // turquesa
  '#84cc16', // verde lima
  '#0ea5e9', // azul céu
  '#a855f7', // roxo claro
  '#64748b', // cinza azulado
  '#dc2626', // vermelho escuro
  '#16a34a', // verde escuro
  '#2563eb', // azul escuro
  '#ca8a04', // amarelo escuro
  '#9333ea', // roxo escuro
  '#c2410c', // laranja escuro
  '#0891b2', // ciano escuro
  '#be185d', // rosa escuro
  '#059669', // verde esmeralda escuro
  '#4f46e5', // índigo escuro
  '#d97706', // amarelo dourado escuro
  '#a21caf', // magenta escuro
  '#0d9488', // turquesa escuro
];

// Função para garantir cores únicas e bem distribuídas
const getBarColor = (posicao: number, totalAreas: number, index: number, idArea: number, allAreas: AreaRankingDTO[]) => {
  // Cria um mapa de IDs únicos para garantir cores distintas
  const uniqueIds = [...new Set(allAreas.map(a => a.idArea))].sort((a, b) => a - b);
  const colorIndex = uniqueIds.indexOf(idArea);
  return colors[colorIndex % colors.length];
};

export default function ObrigacoesRankingAreas({ refreshTrigger }: ObrigacoesRankingAreasProps) {
  const [data, setData] = useState<AreaRankingDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'ATRASADA' | 'PENDENTE'>('ATRASADA');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const statusAtrasada = statusObrigacaoList.find(s => s.nmStatus === 'ATRASADA');
        const statusPendente = statusObrigacaoList.find(s => s.nmStatus === 'PENDENTE');
        
        const idsStatus: number[] = [];
        if (selectedStatus === 'ATRASADA' && statusAtrasada) {
          idsStatus.push(statusAtrasada.id);
        } else if (selectedStatus === 'PENDENTE' && statusPendente) {
          idsStatus.push(statusPendente.id);
        }
        
        const response = await dashboardClient.buscarRankingAreas(idsStatus.length > 0 ? idsStatus : undefined);
        setData(response || []);
      } catch (error) {
        console.error("Erro ao buscar ranking de áreas:", error);
        toast.error("Não foi possível carregar o ranking de áreas.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [refreshTrigger, selectedStatus]);

  const chartData = useMemo(() => {
    return data
      .sort((a, b) => b.totalObrigacoes - a.totalObrigacoes)
      .map((area) => ({
        ...area,
        nmAreaShort: area.nmArea.length > 20 ? `${area.nmArea.substring(0, 20)}...` : area.nmArea,
      }));
  }, [data]);

  if (loading) {
    return (
      <Card className="flex flex-col w-full">
        <CardHeader title="Ranking de Obrigações por Área" />
        <CardContent className="flex-1 flex items-center justify-center h-[500px]">
          <div className="text-sm text-gray-500">Carregando dados...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col w-full">
      <div className="flex items-center justify-between px-6 pt-6 pb-4">
        <CardHeader 
          title="Ranking de Obrigações por Áreas Atribuídas"
          description={`Obrigações ${selectedStatus === 'ATRASADA' ? 'Atrasadas' : 'Pendentes'} por área`}
        />
        <Select
          value={selectedStatus}
          onValueChange={(value) => setSelectedStatus(value as 'ATRASADA' | 'PENDENTE')}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ATRASADA">Atrasada</SelectItem>
            <SelectItem value="PENDENTE">Pendente</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <CardContent className="flex-1 w-full pb-6 px-6 overflow-hidden">
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[450px]">
            <div className="text-sm text-gray-500 text-center">
              Nenhum dado disponível para o status selecionado.
            </div>
          </div>
        ) : (
          <div className="w-full">
            <div className="w-full h-[420px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 20, left: 10, bottom: 80 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    type="category" 
                    dataKey="nmAreaShort"
                    stroke="#6b7280"
                    fontSize={11}
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    tick={{ fill: '#374151' }}
                  />
                  <YAxis 
                    type="number" 
                    stroke="#6b7280"
                    fontSize={12}
                    tickFormatter={(value: number) => value.toString()}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="totalObrigacoes" 
                    radius={[8, 8, 0, 0]}
                    strokeWidth={0}
                  >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={getBarColor(entry.posicaoRanking, chartData.length, index, entry.idArea, chartData)}
                    />
                  ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Legenda de cores por área */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="text-xs font-semibold text-gray-700 mb-3 text-center">Cores por Área</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-40 overflow-y-auto">
                {chartData.map((area, index) => {
                  const barColor = getBarColor(area.posicaoRanking, chartData.length, index, area.idArea, chartData);
                  return (
                    <div key={area.idArea} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded flex-shrink-0" 
                        style={{ backgroundColor: barColor }}
                      ></div>
                      <span className="text-xs text-gray-600 truncate" title={area.nmArea}>
                        {area.nmArea}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
