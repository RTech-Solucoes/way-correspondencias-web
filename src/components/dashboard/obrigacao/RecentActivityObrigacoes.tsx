'use client';

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import dashboardClient from "@/api/dashboard/client";
import { ObrigacaoRecentActivityDTO } from "@/api/dashboard/type";
import CardHeader from "../card-header";
import PaginationRecentActivity from "../RecentActivity/PaginationRecentActivity";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface RecentActivityObrigacoesProps {
  refreshTrigger?: number;
}

const getActivityIcon = (tipoAtividade: string) => {
  if (tipoAtividade === 'TRAMITACAO') {
    return (
      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      </div>
    );
  }
  
  return (
    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    </div>
  );
};

const getActivityLabel = (tipoAtividade: string) => {
  return tipoAtividade === 'TRAMITACAO' ? 'Tramitação' : 'Parecer';
};

const formatTempoDecorrido = (dtCriacao: string): string => {
  try {
    const date = new Date(dtCriacao);
    return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
  } catch {
    return 'Data inválida';
  }
};

export default function RecentActivityObrigacoes({ refreshTrigger }: RecentActivityObrigacoesProps) {
  const [listActivity, setListActivity] = useState<ObrigacaoRecentActivityDTO[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await dashboardClient.getObrigacoesRecentActivity(currentPage, 10);
        setListActivity(response.content);
        setTotalPages(response.totalPages);
        setTotalElements(response.totalElements);
      } catch (error) {
        console.error("Erro ao buscar atividades recentes de obrigações:", error);
        toast.error("Não foi possível carregar as atividades recentes.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [refreshTrigger, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <Card className="flex flex-col h-full">
      <div className="flex justify-between items-center pr-4">
        <CardHeader title="Atividades Recentes - Obrigações" />
        {totalPages > 1 && (
          <PaginationRecentActivity
            currentPage={currentPage}
            totalPages={totalPages}
            totalElements={totalElements}
            onPageChange={handlePageChange}
            loading={loading}
          />
        )}
      </div>

      <CardContent className="flex-1">
        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-gray-500">Carregando atividades...</div>
            </div>
          ) : listActivity.length === 0 ? (
            <div className="text-sm text-gray-500 py-4 text-center">
              Nenhuma atividade recente encontrada.
            </div>
          ) : (
            listActivity.map((activity, index) => (
              <div 
                key={`activity-${index}-${activity.cdIdentificacao}`} 
                className="flex items-start space-x-3 bg-gray-50 hover:bg-gray-100 rounded-lg p-4 transition-colors"
              >
                {getActivityIcon(activity.tipoAtividade)}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900 text-sm">
                          {activity.nmResponsavel}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {getActivityLabel(activity.tipoAtividade)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-1 line-clamp-2">
                        {activity.dsAssunto}
                      </p>
                      
                      {activity.dsParecer && activity.tipoAtividade === 'PARECER' && (
                        <p className="text-xs text-gray-500 italic line-clamp-1 mt-1">
                          "{activity.dsParecer}"
                        </p>
                      )}
                    </div>
                    
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="text-xs font-medium text-gray-900">
                        {activity.cdIdentificacao}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTempoDecorrido(activity.dtCriacao)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

