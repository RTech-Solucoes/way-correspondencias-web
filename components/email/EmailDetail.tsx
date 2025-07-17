'use client';

import { Star, Archive, Trash2, Reply, ReplyAll, Forward, MoreHorizontal, Paperclip, Download, Maximize, Maximize2, Minimize2, StretchVertical } from 'lucide-react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {LayoutMode} from "@/components/email/EmailClient";

interface EmailDetailProps {
  emailId: string;
  onClose(): void;
  layoutMode?: LayoutMode;
  onLayoutChange?: (mode: LayoutMode) => void;
}

// Mock email data - in a real app, this would come from props or API
const MOCK_EMAILS = [
  {
    id: '1',
    from: 'Maria Silva',
    fromEmail: 'maria.silva@waybrasil.com',
    to: 'john.doe@waybrasil.com',
    subject: 'Relatório mensal de compliance',
    date: 'December 16, 2024 at 10:30 AM',
    content: `
      <p>Prezado João,</p>
      
      <p>Segue em anexo o relatório mensal de compliance referente ao mês de dezembro de 2024.</p>
      
      <p>Principais destaques do período:</p>
      <ul>
        <li>100% de conformidade com as normas regulatórias</li>
        <li>Implementação de 3 novos processos de auditoria</li>
        <li>Redução de 15% no tempo de processamento de documentos</li>
        <li>Capacitação de 25 colaboradores em compliance</li>
      </ul>
      
      <p>Caso tenha alguma dúvida ou precise de esclarecimentos adicionais, fico à disposição.</p>
      
      <p>Atenciosamente,<br>
      Maria Silva<br>
      Gerente de Compliance<br>
      Way Brasil</p>
    `,
    attachments: [
      { name: 'relatorio_compliance_dezembro_2024.pdf', size: '2.4 MB' },
      { name: 'anexo_auditoria.xlsx', size: '1.2 MB' },
    ],
    isStarred: true,
  },
  {
    id: '2',
    from: 'João Santos',
    fromEmail: 'joao.santos@waybrasil.com',
    to: 'john.doe@waybrasil.com',
    subject: 'Aprovação de novo processo regulatório',
    date: 'December 16, 2024 at 9:15 AM',
    content: `
      <p>Prezado time,</p>
      
      <p>Preciso da aprovação de vocês para implementar o novo processo regulatório que desenvolvemos.</p>
      
      <p>O processo inclui:</p>
      <ul>
        <li>Validação automática de documentos</li>
        <li>Workflow de aprovação em 3 etapas</li>
        <li>Notificações em tempo real</li>
        <li>Relatórios de conformidade</li>
      </ul>
      
      <p>Por favor, revisem e me informem se podemos prosseguir com a implementação.</p>
      
      <p>Obrigado,<br>
      João Santos</p>
    `,
    attachments: [],
    isStarred: false,
  },
  {
    id: '3',
    from: 'Ana Costa',
    fromEmail: 'ana.costa@waybrasil.com',
    to: 'john.doe@waybrasil.com',
    subject: 'Reunião de alinhamento - Projeto Way Brasil',
    date: 'December 15, 2024 at 2:30 PM',
    content: `
      <p>Olá pessoal,</p>
      
      <p>Vamos marcar uma reunião para alinhar os próximos passos do projeto Way Brasil.</p>
      
      <p>Agenda proposta:</p>
      <ul>
        <li>Review do progresso atual</li>
        <li>Definição de prioridades para o próximo sprint</li>
        <li>Discussão sobre recursos necessários</li>
        <li>Planejamento de testes</li>
      </ul>
      
      <p>Estou disponível na próxima terça-feira às 14h. Confirmem a disponibilidade de vocês.</p>
      
      <p>Abraços,<br>
      Ana Costa</p>
    `,
    attachments: [
      { name: 'agenda_reuniao.pdf', size: '156 KB' },
    ],
    isStarred: false,
  },
  {
    id: '4',
    from: 'Carlos Oliveira',
    fromEmail: 'carlos.oliveira@waybrasil.com',
    to: 'john.doe@waybrasil.com',
    subject: 'Documentação atualizada - Sistema de gestão',
    date: 'December 15, 2024 at 11:45 AM',
    content: `
      <p>Prezados,</p>
      
      <p>A documentação do sistema de gestão foi atualizada com as novas funcionalidades implementadas no último sprint.</p>
      
      <p>Principais atualizações:</p>
      <ul>
        <li>Guia de instalação revisado</li>
        <li>Documentação da nova API de relatórios</li>
        <li>Exemplos de integração atualizados</li>
        <li>FAQ expandido com casos de uso comuns</li>
      </ul>
      
      <p>A documentação está disponível no portal interno. Qualquer dúvida, estou à disposição.</p>
      
      <p>Atenciosamente,<br>
      Carlos Oliveira<br>
      Analista de Sistemas</p>
    `,
    attachments: [],
    labels: ['work'],
    isStarred: true,
  },
  {
    id: '5',
    from: 'Fernanda Lima',
    fromEmail: 'fernanda.lima@waybrasil.com',
    to: 'john.doe@waybrasil.com',
    subject: 'Feedback sobre implementação da nova funcionalidade',
    date: 'December 14, 2024 at 4:20 PM',
    content: `
      <p>Olá,</p>
      
      <p>Gostaria de compartilhar algumas observações sobre a nova funcionalidade implementada.</p>
      
      <p>Pontos positivos:</p>
      <ul>
        <li>Interface intuitiva e fácil de usar</li>
        <li>Performance excelente</li>
        <li>Integração perfeita com o sistema existente</li>
      </ul>
      
      <p>Sugestões de melhoria:</p>
      <ul>
        <li>Adicionar mais opções de filtro</li>
        <li>Melhorar a responsividade em dispositivos móveis</li>
        <li>Incluir tooltips explicativos</li>
      </ul>
      
      <p>No geral, ficou muito bom! Parabéns à equipe.</p>
      
      <p>Abraços,<br>
      Fernanda Lima</p>
    `,
    attachments: [],
    isStarred: false,
  },
];
export default function EmailDetail({
  emailId,
  onClose,
  layoutMode = 'split',
  onLayoutChange
}: EmailDetailProps) {
  const email = MOCK_EMAILS.find(e => e.id === emailId);

  if (!email) {
    return (
      <div className="flex-1 bg-white flex items-center justify-center">
        <p className="text-gray-500">Email não encontrado</p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white flex flex-col overflow-y-auto max-h-full">
      {/* Email Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            </Button>
            <Button variant="ghost" size="sm">
              <Archive className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Trash2 className="h-4 w-4" />
            </Button>
            {onLayoutChange && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onLayoutChange(layoutMode === 'split' ? 'full' : 'split')}
                title={layoutMode === 'split' ? 'Expandir' : 'Dividir'}
              >
                {layoutMode === 'split' ? (
                  <Maximize className="h-4 w-4" />
                ) : (
                  <StretchVertical className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Marcar como não lido</DropdownMenuItem>
                <DropdownMenuItem>Adicionar etiqueta</DropdownMenuItem>
                <DropdownMenuItem>Imprimir</DropdownMenuItem>
                <DropdownMenuItem>Reportar spam</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">{email.subject}</h1>

        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder-avatar.jpg" alt={email.from} />
              <AvatarFallback>MS</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-gray-900">{email.from}</div>
              <div className="text-gray-500">{email.fromEmail}</div>
            </div>
          </div>
          <div className="text-gray-500">•</div>
          <div>{email.date}</div>
        </div>

        <div className="flex items-center space-x-2 mb-4">
          <span className="text-sm text-gray-600">To:</span>
          <span className="text-sm text-gray-900">{email.to}</span>
        </div>
      </div>

      {/* Email Content */}
      <div className="flex-1 p-6">
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: email.content }}
        />

        {/* Attachments */}
        {email.attachments.length > 0 && (
          <div className="mt-8 p-4 bg-gray-50 rounded-3xl">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Paperclip className="h-4 w-4 mr-2" />
              Anexos ({email.attachments.length})
            </h3>
            <div className="space-y-2">
              {email.attachments.map((attachment, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                      <Paperclip className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{attachment.name}</div>
                      <div className="text-xs text-gray-500">{attachment.size}</div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Email Actions */}
      <div className="p-6 border-t border-gray-200">
        <div className="flex items-center gap-2 w-full">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Reply className="h-4 w-4 mr-2" />
            Reply
          </Button>
          <Button variant="secondary">
            <ReplyAll className="h-4 w-4 mr-2" />
            Reply All
          </Button>
          <Button variant="secondary" className="ml-auto">
            <Forward className="h-4 w-4 mr-2" />
            Forward
          </Button>
        </div>
      </div>
    </div>
  );
}