'use client';

import { useState, useEffect, useMemo } from "react";
import { AreaResponse } from "@/api/areas/types";
import { TemaResponse } from "@/api/temas/types";
import { TipoResponse } from "@/api/tipos/types";
import areasClient from "@/api/areas/client";
import temasClient from "@/api/temas/client";
import tiposClient from "@/api/tipos/client";
import { CategoriaEnum, TipoEnum } from "@/api/tipos/types";
import statusSolicitacaoClient, { StatusSolicitacaoResponse } from "@/api/status-solicitacao/client";
import { formatDateBr } from "@/utils/utils";
import { ObrigacaoFiltroRequest } from "@/api/obrigacao/types";
import { FiltersState } from "@/context/obrigacoes/ObrigacoesContext";
import { Dispatch, SetStateAction } from "react";

interface UseObrigacoesFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filters: FiltersState;
  setFilters: Dispatch<SetStateAction<FiltersState>>;
}

export function useObrigacoesFilters({
  searchQuery,
  setSearchQuery,
  filters,
  setFilters,
}: UseObrigacoesFiltersProps) {
  const [areas, setAreas] = useState<AreaResponse[]>([]);
  const [temas, setTemas] = useState<TemaResponse[]>([]);
  const [classificacoes, setClassificacoes] = useState<TipoResponse[]>([]);
  const [periodicidades, setPeriodicidades] = useState<TipoResponse[]>([]);
  const [statusObrigacao, setStatusObrigacao] = useState<StatusSolicitacaoResponse[]>([]);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const [areasResponse, temasResponse, tiposResponse, statusesResponse] = await Promise.all([
          areasClient.buscarPorFiltro({ size: 1000 }),
          temasClient.buscarPorFiltro({ size: 1000 }),
          tiposClient.buscarPorCategorias([CategoriaEnum.OBRIG_CLASSIFICACAO, CategoriaEnum.OBRIG_PERIODICIDADE]),
          statusSolicitacaoClient.listarTodos(CategoriaEnum.CLASSIFICACAO_STATUS_SOLICITACAO, [TipoEnum.TODOS, TipoEnum.OBRIGACAO])
        ]);

        setAreas(areasResponse.content || []);
        setTemas(temasResponse.content || []);
        
        const classif = tiposResponse.filter(t => t.nmCategoria === CategoriaEnum.OBRIG_CLASSIFICACAO);
        const periodic = tiposResponse.filter(t => t.nmCategoria === CategoriaEnum.OBRIG_PERIODICIDADE);
        
        setClassificacoes(classif);
        setPeriodicidades(periodic);
        setStatusObrigacao(statusesResponse || []);
      } catch (error) {
        console.error('Erro ao carregar dados dos filtros:', error);
      }
    };

    carregarDados();
  }, []);

  const hasActiveFilters = useMemo(() => {
    return !!(
      searchQuery ||
      filters.idStatusObrigacao ||
      filters.idAreaAtribuida ||
      filters.dtLimiteInicio ||
      filters.dtLimiteFim ||
      filters.dtInicioInicio ||
      filters.dtInicioFim ||
      filters.idTema ||
      filters.idTipoClassificacao ||
      filters.idTipoPeriodicidade
    );
  }, [searchQuery, filters]);

  const filtrosAplicados = useMemo(() => {
    return [
      ...(searchQuery ? [{
        key: 'search',
        label: 'Busca',
        value: searchQuery,
        color: 'blue' as const,
        onRemove: () => setSearchQuery('')
      }] : []),
      ...(filters.idStatusObrigacao ? [{
        key: 'status',
        label: 'Status',
        value: statusObrigacao.find(s => s.idStatusSolicitacao.toString() === filters.idStatusObrigacao)?.nmStatus || filters.idStatusObrigacao,
        color: 'purple' as const,
        onRemove: () => setFilters({ ...filters, idStatusObrigacao: '' })
      }] : []),
      ...(filters.idAreaAtribuida ? [{
        key: 'area',
        label: 'Área Atribuída',
        value: areas.find(a => a.idArea.toString() === filters.idAreaAtribuida)?.nmArea || filters.idAreaAtribuida,
        color: 'green' as const,
        onRemove: () => setFilters({ ...filters, idAreaAtribuida: '' })
      }] : []),
      ...(filters.dtLimiteInicio ? [{
        key: 'dtLimiteInicio',
        label: 'Data Limite Início',
        value: formatDateBr(filters.dtLimiteInicio),
        color: 'indigo' as const,
        onRemove: () => setFilters({ ...filters, dtLimiteInicio: '' })
      }] : []),
      ...(filters.dtLimiteFim ? [{
        key: 'dtLimiteFim',
        label: 'Data Limite Fim',
        value: formatDateBr(filters.dtLimiteFim),
        color: 'indigo' as const,
        onRemove: () => setFilters({ ...filters, dtLimiteFim: '' })
      }] : []),
      ...(filters.dtInicioInicio ? [{
        key: 'dtInicioInicio',
        label: 'Data de Início (Início)',
        value: formatDateBr(filters.dtInicioInicio),
        color: 'pink' as const,
        onRemove: () => setFilters({ ...filters, dtInicioInicio: '' })
      }] : []),
      ...(filters.dtInicioFim ? [{
        key: 'dtInicioFim',
        label: 'Data de Início (Fim)',
        value: formatDateBr(filters.dtInicioFim),
        color: 'pink' as const,
        onRemove: () => setFilters({ ...filters, dtInicioFim: '' })
      }] : []),
      ...(filters.idTema ? [{
        key: 'tema',
        label: 'Tema',
        value: temas.find(t => t.idTema.toString() === filters.idTema)?.nmTema || filters.idTema,
        color: 'indigo' as const,
        onRemove: () => setFilters({ ...filters, idTema: '' })
      }] : []),
      ...(filters.idTipoClassificacao ? [{
        key: 'classificacao',
        label: 'Classificação',
        value: classificacoes.find(c => c.idTipo.toString() === filters.idTipoClassificacao)?.dsTipo || filters.idTipoClassificacao,
        color: 'orange' as const,
        onRemove: () => setFilters({ ...filters, idTipoClassificacao: '' })
      }] : []),
      ...(filters.idTipoPeriodicidade ? [{
        key: 'periodicidade',
        label: 'Periodicidade',
        value: periodicidades.find(p => p.idTipo.toString() === filters.idTipoPeriodicidade)?.dsTipo || filters.idTipoPeriodicidade,
        color: 'yellow' as const,
        onRemove: () => setFilters({ ...filters, idTipoPeriodicidade: '' })
      }] : [])
    ];
  }, [searchQuery, filters, areas, temas, classificacoes, periodicidades, statusObrigacao, setSearchQuery, setFilters]);

  const handleClearAllFilters = () => {
    setSearchQuery('');
    setFilters({
      ...filters,
      idStatusObrigacao: '',
      idAreaAtribuida: '',
      dtLimiteInicio: '',
      dtLimiteFim: '',
      dtInicioInicio: '',
      dtInicioFim: '',
      idTema: '',
      idTipoClassificacao: '',
      idTipoPeriodicidade: '',
    });
  };

  const filterParamsForExport = useMemo((): Omit<ObrigacaoFiltroRequest, 'page' | 'size' | 'sort'> => {
    return {
      filtro: searchQuery || null,
      idStatusSolicitacao: filters.idStatusObrigacao ? parseInt(filters.idStatusObrigacao) : null,
      idAreaAtribuida: filters.idAreaAtribuida ? parseInt(filters.idAreaAtribuida) : null,
      dtLimiteInicio: filters.dtLimiteInicio || null,
      dtLimiteFim: filters.dtLimiteFim || null,
      dtInicioInicio: filters.dtInicioInicio || null,
      dtInicioFim: filters.dtInicioFim || null,
      idTema: filters.idTema ? parseInt(filters.idTema) : null,
      idTipoClassificacao: filters.idTipoClassificacao ? parseInt(filters.idTipoClassificacao) : null,
      idTipoPeriodicidade: filters.idTipoPeriodicidade ? parseInt(filters.idTipoPeriodicidade) : null,
    };
  }, [searchQuery, filters]);

  return {
    areas,
    temas,
    classificacoes,
    periodicidades,
    hasActiveFilters,
    filtrosAplicados,
    handleClearAllFilters,
    filterParamsForExport,
  };
}

