'use client';

import { KeyboardEvent, TextareaHTMLAttributes, useEffect, useMemo, useRef, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/utils/utils';
import { useIdResponsavelLogado } from '@/hooks/use-id-responsavel-logado';
import type { ResponsavelMencionavel } from '@/api/obrigacao/mencoes-client';
import { detectarMencaoAtiva, filtrarMencionaveis, inserirMencao, MencaoAtiva } from './mencoes';
import { useMencionaveis } from './use-mencoes';

interface MencaoTextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange'> {
  idObrigacao: number;
  value: string;
  onValueChange: (value: string) => void;
}

/** Campo de comentário que sugere as pessoas da obrigação ao digitar "@". */
export function MencaoTextarea({ idObrigacao, value, onValueChange, className, ...props }: MencaoTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const opcaoAtivaRef = useRef<HTMLLIElement>(null);
  const [mencao, setMencao] = useState<MencaoAtiva | null>(null);
  const [indiceAtivo, setIndiceAtivo] = useState(0);
  const { data: mencionaveis = [], isLoading, isError } = useMencionaveis(idObrigacao, mencao !== null);
  const idResponsavelLogado = useIdResponsavelLogado();

  const sugestoes = useMemo(() => {
    if (!mencao) return [];
    const outrasPessoas = mencionaveis.filter((pessoa) => pessoa.idResponsavel !== idResponsavelLogado);
    return filtrarMencionaveis(outrasPessoas, mencao.termo);
  }, [mencionaveis, mencao, idResponsavelLogado]);

  // Depois de um nome completo o texto segue normal: sem sugestão, não há aviso de "não encontrado".
  const semResultado = !!mencao && !isLoading && !isError && sugestoes.length === 0 && !mencao.termo.includes(' ');
  const aberto = !!mencao && (isLoading || isError || sugestoes.length > 0 || semResultado);

  // A lista rola: mantém visível a pessoa selecionada pelo teclado.
  useEffect(() => {
    if (aberto) opcaoAtivaRef.current?.scrollIntoView({ block: 'nearest' });
  }, [aberto, indiceAtivo]);

  const atualizarMencao = (texto: string, cursor: number) => {
    const proxima = detectarMencaoAtiva(texto, cursor);
    setMencao(proxima);
    if (proxima?.termo !== mencao?.termo) setIndiceAtivo(0);
  };

  const selecionar = (pessoa: ResponsavelMencionavel) => {
    const textarea = textareaRef.current;
    if (!mencao || !textarea) return;

    const resultado = inserirMencao(value, mencao, textarea.selectionStart, pessoa.nmResponsavel);
    onValueChange(resultado.texto);
    setMencao(null);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(resultado.cursor, resultado.cursor);
    });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!aberto) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      setMencao(null);
      return;
    }
    if (sugestoes.length === 0) return;

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const passo = event.key === 'ArrowDown' ? 1 : -1;
      setIndiceAtivo((atual) => (atual + passo + sugestoes.length) % sugestoes.length);
    } else if (event.key === 'Enter' || event.key === 'Tab') {
      event.preventDefault();
      selecionar(sugestoes[Math.min(indiceAtivo, sugestoes.length - 1)]);
    }
  };

  return (
    <div className="relative min-w-0 flex-1">
      {aberto && (
        <div className="absolute bottom-full left-0 z-30 mb-1 max-h-56 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
          {isLoading && <p className="px-3 py-2 text-sm text-gray-500">Carregando pessoas...</p>}
          {isError && <p className="px-3 py-2 text-sm text-red-600">Não foi possível carregar as pessoas.</p>}
          {semResultado && <p className="px-3 py-2 text-sm text-gray-500">Nenhuma pessoa encontrada.</p>}
          {sugestoes.length > 0 && (
            <ul role="listbox" aria-label="Pessoas para mencionar">
              {sugestoes.map((pessoa, indice) => (
                <li
                  key={pessoa.idResponsavel}
                  ref={indice === indiceAtivo ? opcaoAtivaRef : undefined}
                  role="option"
                  aria-selected={indice === indiceAtivo}
                >
                  <button
                    type="button"
                    // Mantém o foco no campo para não perder a posição do cursor.
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => selecionar(pessoa)}
                    onMouseEnter={() => setIndiceAtivo(indice)}
                    className={cn('block w-full px-3 py-2 text-left', indice === indiceAtivo && 'bg-blue-50')}
                  >
                    <span className="block truncate text-sm font-medium text-gray-900">{pessoa.nmResponsavel}</span>
                    <span className="block truncate text-xs text-gray-500">{pessoa.dsVinculo}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <Textarea
        {...props}
        ref={textareaRef}
        value={value}
        className={className}
        onChange={(event) => {
          onValueChange(event.target.value);
          atualizarMencao(event.target.value, event.target.selectionStart);
        }}
        onSelect={(event) => atualizarMencao(event.currentTarget.value, event.currentTarget.selectionStart)}
        onKeyDown={handleKeyDown}
        onBlur={() => setMencao(null)}
      />
    </div>
  );
}
