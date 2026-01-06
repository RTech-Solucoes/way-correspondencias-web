'use client';

import { useState } from 'react';
import { Info, FileSpreadsheet, X, ZoomIn } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import Image from 'next/image';
import { useConcessionaria } from '@/context/concessionaria/ConcessionariaContext';

export function InfoImportacaoPlanilha() {
  const { concessionariaSelecionada } = useConcessionaria();
  const nomeConcessionaria = concessionariaSelecionada?.nmConcessionaria || '';
  const [showImageModal, setShowImageModal] = useState(false);

  return (
    <>
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50/50 to-white shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold text-blue-900 flex items-center gap-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Info className="h-5 w-5 text-blue-600" />
          </div>
          <span>Padrão da Planilha para Importação</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 text-sm">
     
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <FileSpreadsheet className="h-5 w-5 text-blue-600" />
            <p className="font-bold text-lg text-gray-900">Verifique se sua planilha está no nosso padrão de importação</p>
          </div>
          
          <div className="space-y-3">
            <div className="bg-white rounded-lg border-l-4 border-blue-500 p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 mb-2">Verificar se arquivo da planilha tem outras abas, além da aba &quot;Cronograma Obrigações&quot;:</p>
                  <div className="ml-6 space-y-2 text-gray-700 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="text-gray-400">•</span>
                      <span>
                        <strong className="text-gray-900">Se tiver abas:</strong> A aba deve ter o nome exato:{' '}
                        <code className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-mono">
                          &quot;Cronograma Obrigações&quot;
                        </code>
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-gray-400">•</span>
                      <span>
                        <strong className="text-gray-900">Se não tiver várias abas:</strong> Pule para o Passo 2
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border-l-4 border-green-500 p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 mb-2">Estrutura das linhas da planilha:</p>
                  <div className="ml-6 space-y-2 text-gray-700 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="text-gray-400">•</span>
                      <span>
                        <strong className="text-gray-900">Linha 1:</strong> Título da planilha
                        <span className="text-xs text-gray-600 italic ml-2">
                          (Ex: &quot;Cronograma Obrigações Contratuais {nomeConcessionaria} - ANO 01&quot;)
                        </span>
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-gray-400">•</span>
                      <span>
                        <strong className="text-gray-900">Linha 2:</strong> Nomes das colunas (cabeçalho) - <span className="text-red-600 font-semibold">OBRIGATÓRIO</span>
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-gray-400">•</span>
                      <span>
                        <strong className="text-gray-900">Linha 3 em diante:</strong> Dados das obrigações
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Passo 3 */}
            <div className="bg-white rounded-lg border-l-4 border-purple-500 p-4 shadow-sm">
              <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 mb-2">Preencher os dados:</p>
                  <p className="text-gray-700 text-sm mb-2">
                    Use os <strong className="text-red-600">nomes exatos</strong> que já estão cadastrados no sistema, por exemplo:
                  </p>
                  <div className="ml-6 space-y-1 text-gray-700 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="text-gray-400">•</span>
                      <span><strong>Item (nome Tema):</strong> Ex: &quot;Autorizações Governamentais&quot;, &quot;Bens da Concessão&quot;</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-gray-400">•</span>
                      <span><strong>Áreas:</strong> Ex: &quot;Meio Ambiente&quot;, &quot;Jurídico&quot;, &quot;Engenharia&quot;</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-gray-400">•</span>
                      <span><strong>Status:</strong> Ex: &quot;Pendente&quot;, &quot;Em andamento&quot;, &quot;Concluído&quot;</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-gray-400">•</span>
                      <span><strong>Periodicidade:</strong> Ex: &quot;Semanal&quot;, &quot;Mensal&quot;, &quot;Anual&quot;, &quot;Semestral&quot;</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 bg-blue-500 rounded"></div>
            <p className="font-bold text-lg text-gray-900">Colunas Obrigatórias (Linha 2 - Cabeçalho)</p>
          </div>
          <p className="text-sm text-gray-600 ml-3 mb-3">
            ⚠️ <strong>ATENÇÃO:</strong> Ordem exata e nomes exatos na <strong>Linha 2</strong>:
          </p>
          <div className="bg-white border-2 border-blue-200 rounded-lg p-4 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-bold min-w-[20px]">1.</span>
                <span className="font-mono text-gray-800">NOME DA TAREFA</span>
                <span className="text-gray-500 text-[10px]">(texto livre)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-bold min-w-[20px]">2.</span>
                <span className="font-mono text-gray-800">ITEM</span>
                <span className="text-gray-500 text-[10px]">(Nome do Tema)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-bold min-w-[20px]">3.</span>
                <span className="font-mono text-gray-800">STATUS</span>
                <span className="text-gray-500 text-[10px]">(Pendente, Em andamento, Concluído, etc.)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-bold min-w-[20px]">4.</span>
                <span className="font-mono text-gray-800">ATRIBUIDO A</span>
                <span className="text-gray-500 text-[10px]">(Nome da área atribuída, etc.)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-bold min-w-[20px]">5.</span>
                <span className="font-mono text-gray-800">ÁREA CONDICIONANTE</span>
                <span className="text-gray-500 text-[10px]">(Nome da área condicionante)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-bold min-w-[20px]">6.</span>
                <span className="font-mono text-gray-800">PERIODICIDADE</span>
                <span className="text-gray-500 text-[10px]">(Semanal, Mensal, Anual, Semestral, etc.)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-bold min-w-[20px]">7.</span>
                <span className="font-mono text-gray-800">DATA DE INÍCIO</span>
                <span className="text-gray-500 text-[10px]">(dd/mm/aaaa)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-bold min-w-[20px]">8.</span>
                <span className="font-mono text-gray-800">DATA DE TÉRMINO</span>
                <span className="text-gray-500 text-[10px]">(dd/mm/aaaa)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-bold min-w-[20px]">9.</span>
                <span className="font-mono text-gray-800">DURAÇÃO em dia</span>
                <span className="text-gray-500 text-[10px]">(aceita apenas números)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-bold min-w-[20px]">10.</span>
                <span className="font-mono text-gray-800">DATA Limite</span>
                <span className="text-gray-500 text-[10px]">(dd/mm/aaaa)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-bold min-w-[20px]">11.</span>
                <span className="font-mono text-gray-800">COMENTÁRIOS</span>
                <span className="text-gray-500 text-[10px]">(texto livre)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-6 bg-amber-500 rounded"></div>
              <p className="font-bold text-lg text-gray-900">Exemplo Visual e Observações Importantes</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
              <div className="text-xs text-amber-900 leading-relaxed space-y-2">
                <p className="font-semibold mb-2">⚠️ Observações Importantes:</p>
                <ul className="list-disc list-inside ml-3 space-y-1">
                  <li>As cores na imagem são apenas ilustrativas - você pode usar qualquer esquema de cores</li>
                  <li>Dados com nomes divergentes serão ignorados na importação (podem ser editados depois)</li>
                </ul>
              </div>
            </div>
          </div>
          <div 
            className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-2 overflow-hidden cursor-pointer hover:border-blue-400 transition-all group relative"
            onClick={() => setShowImageModal(true)}
          >
            <div className="relative w-full aspect-video bg-gray-50 rounded overflow-hidden">
              <Image 
                src="/images/importacao-planilha-obrigacoes.png" 
                alt="Exemplo de planilha para importação" 
                width={800} 
                height={450}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-3 shadow-lg">
                  <ZoomIn className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">Clique para ampliar e ver os detalhes</p>
          </div>
        </div>
      </CardContent>
    </Card>

    <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 bg-black/95">
        <DialogTitle className="sr-only">Visualização ampliada da planilha de exemplo</DialogTitle>
        <div className="relative w-full h-full flex items-center justify-center p-4">
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm"
            aria-label="Fechar"
          >
            <X className="h-6 w-6 text-white" />
          </button>
          <div className="relative w-full h-full flex items-center justify-center">
            <Image 
              src="/images/importacao-planilha-obrigacoes.png" 
              alt="Exemplo de planilha para importação - Ampliado" 
              width={1600} 
              height={900}
              className="max-w-full max-h-full object-contain"
              priority
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}