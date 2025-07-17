'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, FileText, ArrowUpDown, User, Clock, Search, Filter, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

interface Movement {
  id: string;
  type: string;
  name: string;
  situation: string;
  date: string;
  time: string;
}

interface Document {
  id: string;
  systemId: string;
  ourId: string;
  title: string;
  status: 'active' | 'pending' | 'completed' | 'archived';
  lastUpdate: string;
  movements: Movement[];
}

const MOCK_DOCUMENTS: Document[] = [
  {
    id: '1',
    systemId: '2025104618IDR',
    ourId: '373/2025/DR/SMF',
    title: 'Tramitação do Documento - Sistema Regulatório',
    status: 'active',
    lastUpdate: '23/04/2025 09:14:56',
    movements: [
      {
        id: '1',
        type: 'RESPONSÁVEL DOC.',
        name: 'Neile Feliciano de Queiroz',
        situation: 'Doc. em montagem',
        date: '16/04/2025',
        time: '16:04:26'
      },
      {
        id: '2',
        type: 'RESPONSÁVEL DOC.',
        name: 'Neile Feliciano de Queiroz',
        situation: 'Doc. enviado para Assinatura',
        date: '16/04/2025',
        time: '16:24:29'
      },
      {
        id: '3',
        type: 'ASSINANTE',
        name: 'Neile Feliciano de Queiroz',
        situation: 'Recebido',
        date: '16/04/2025',
        time: '16:24:29'
      },
      {
        id: '4',
        type: 'ASSISTENTE',
        name: 'Neile Feliciano de Queiroz',
        situation: 'Cliente',
        date: '16/04/2025',
        time: '16:24:48'
      },
      {
        id: '5',
        type: 'ASSISTENTE',
        name: 'Neile Feliciano de Queiroz',
        situation: 'Enviado para Assinante',
        date: '16/04/2025',
        time: '16:24:49'
      },
      {
        id: '6',
        type: 'ASSISTENTE',
        name: 'ROSEMEIRE MARIA DE JESUS',
        situation: 'Recebido',
        date: '16/04/2025',
        time: '18:34:40'
      },
      {
        id: '7',
        type: 'ASSISTENTE',
        name: 'NOEMI DA SILVA GONÇALVES',
        situation: 'Recebido',
        date: '16/04/2025',
        time: '18:34:40'
      },
      {
        id: '8',
        type: 'ASSISTENTE',
        name: 'VERA ALICE MENEZES SIMÕES',
        situation: 'Recebido',
        date: '16/04/2025',
        time: '18:34:40'
      },
      {
        id: '9',
        type: 'ASSISTENTE',
        name: 'Rosemeire Maria de Jesus',
        situation: 'Cliente',
        date: '22/04/2025',
        time: '12:45:22'
      },
      {
        id: '10',
        type: 'ASSISTENTE',
        name: 'Rosemeire Maria de Jesus',
        situation: 'Enviado para Assinante',
        date: '22/04/2025',
        time: '12:45:49'
      }
    ]
  },
  {
    id: '2',
    systemId: '2025104619IDR',
    ourId: '374/2025/DR/SMF',
    title: 'Processo de Compliance Regulatório',
    status: 'pending',
    lastUpdate: '22/04/2025 15:30:12',
    movements: [
      {
        id: '1',
        type: 'RESPONSÁVEL DOC.',
        name: 'Maria Silva Santos',
        situation: 'Doc. em análise',
        date: '20/04/2025',
        time: '09:15:30'
      },
      {
        id: '2',
        type: 'ASSISTENTE',
        name: 'João Carlos Oliveira',
        situation: 'Recebido',
        date: '21/04/2025',
        time: '14:22:15'
      },
      {
        id: '3',
        type: 'ASSISTENTE',
        name: 'João Carlos Oliveira',
        situation: 'Em revisão',
        date: '22/04/2025',
        time: '10:45:30'
      }
    ]
  },
  {
    id: '3',
    systemId: '2025104620IDR',
    ourId: '375/2025/DR/SMF',
    title: 'Auditoria de Conformidade',
    status: 'completed',
    lastUpdate: '18/04/2025 11:20:45',
    movements: [
      {
        id: '1',
        type: 'RESPONSÁVEL DOC.',
        name: 'Ana Paula Costa',
        situation: 'Documento finalizado',
        date: '18/04/2025',
        time: '11:20:45'
      },
      {
        id: '2',
        type: 'ASSINANTE',
        name: 'Carlos Roberto Lima',
        situation: 'Assinado',
        date: '18/04/2025',
        time: '11:15:30'
      }
    ]
  }
];

const statusColors = {
  active: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  pending: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
  completed: 'bg-green-100 text-green-800 hover:bg-green-100',
  archived: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
};

const statusLabels = {
  active: 'Ativo',
  pending: 'Pendente',
  completed: 'Concluído',
  archived: 'Arquivado',
};

export default function DocumentsList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedDocuments, setExpandedDocuments] = useState<string[]>([]);

  const filteredDocuments = MOCK_DOCUMENTS.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.systemId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.ourId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleDocument = (documentId: string) => {
    setExpandedDocuments(prev =>
      prev.includes(documentId)
        ? prev.filter(id => id !== documentId)
        : [...prev, documentId]
    );
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <FileText className="h-7 w-7 mr-3" />
            Documentos
          </h1>
          <div className="flex items-center space-x-2">
            <Button variant="secondary">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Pesquisar documentos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
            />
          </div>
          <Button variant="secondary" className="h-10 px-4">
            <Filter className="h-4 w-4 mr-2" />
            Filtrar
          </Button>
        </div>
      </div>

      {/* Documents List */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4">
          {filteredDocuments.map((document) => (
            <Card key={document.id} className="overflow-hidden">
              <Collapsible
                open={expandedDocuments.includes(document.id)}
                onOpenChange={() => toggleDocument(document.id)}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          {expandedDocuments.includes(document.id) ? (
                            <ChevronDown className="h-5 w-5 text-gray-500" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-gray-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                            {document.title}
                          </CardTitle>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">ID Sistema:</span>
                              <span className="font-mono">{document.systemId}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">Nossa ID:</span>
                              <span className="font-mono">{document.ourId}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4" />
                              <span>{document.lastUpdate}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge className={cn("text-xs", statusColors[document.status])}>
                          {statusLabels[document.status]}
                        </Badge>
                        <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="border-t border-gray-200 pt-4">
                      <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                        <ArrowUpDown className="h-4 w-4 mr-2" />
                        Movimentações do Documento
                      </h3>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="text-left py-3 px-4 font-medium text-gray-700 rounded-tl-lg">#</th>
                              <th className="text-left py-3 px-4 font-medium text-gray-700">Tipo</th>
                              <th className="text-left py-3 px-4 font-medium text-gray-700">Nome</th>
                              <th className="text-left py-3 px-4 font-medium text-gray-700">Situação</th>
                              <th className="text-left py-3 px-4 font-medium text-gray-700 rounded-tr-lg">Data</th>
                            </tr>
                          </thead>
                          <tbody>
                            {document.movements.map((movement, index) => (
                              <tr key={movement.id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-4 text-gray-600">{index + 1}.</td>
                                <td className="py-3 px-4">
                                  <Badge variant="secondary" className="text-xs">
                                    {movement.type}
                                  </Badge>
                                </td>
                                <td className="py-3 px-4 font-medium text-gray-900">
                                  {movement.name}
                                </td>
                                <td className="py-3 px-4 text-gray-700">
                                  {movement.situation}
                                </td>
                                <td className="py-3 px-4 text-gray-600 font-mono">
                                  {movement.date} {movement.time}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}