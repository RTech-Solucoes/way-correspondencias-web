'use client';

import {useEffect, useState} from 'react';
import {ArrowLeftIcon, FileTextIcon} from '@phosphor-icons/react';
import {Button} from '@/components/ui/button';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {toast} from 'sonner';
import {ResponsavelResponse} from '@/api/responsaveis/types';
import {TemaResponse} from '@/api/temas/types';
import {AreaResponse} from '@/api/areas/types';
import {responsaveisClient} from '@/api/responsaveis/client';
import {temasClient} from '@/api/temas/client';
import {areasClient} from '@/api/areas/client';
import {emailClient} from '@/api/email/client';
import {EmailResponse} from "@/api/email/types";
import {getInitials} from "@/utils/utils";

interface EmailDetailProps {
  emailId: string;
  onBack(): void;
}

const formatDate = (dateString?: string): string => {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return 'Data inválida';
    }

    return date.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return 'Data inválida';
  }
};

export default function EmailDetail({
  emailId,
  onBack
}: EmailDetailProps) {
  const [email, setEmail] = useState<EmailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSolicitacaoModal, setShowSolicitacaoModal] = useState(false);
  const [responsaveis, setResponsaveis] = useState<ResponsavelResponse[]>([]);
  const [temas, setTemas] = useState<TemaResponse[]>([]);
  const [areas, setAreas] = useState<AreaResponse[]>([]);
  const [isDestinatarioExpanded, setIsDestinatarioExpanded] = useState(false);

  useEffect(() => {
    const loadEmail = async () => {
      try {
        setLoading(true);

        const numericId = parseInt(emailId);

        const emailData = await emailClient.buscarPorId(numericId);
        setEmail(emailData);
      } catch (error) {
        console.error('Erro ao carregar email:', error);
        toast.error("Erro ao carregar o email");
        onBack();
      } finally {
        setLoading(false);
      }
    };

    if (emailId) {
      loadEmail();
    }
  }, [emailId, onBack]);

  const loadModalData = async () => {
    try {
      const [responsaveisResponse, temasResponse, areaResponse] = await Promise.all([
        responsaveisClient.buscarPorFiltro({ size: 100 }),
        temasClient.buscarPorFiltro({ size: 400 }),
        areasClient.buscarPorFiltro({ size: 100 })
      ]);

      setResponsaveis(responsaveisResponse.content);
      setTemas(temasResponse.content);
      setAreas(areaResponse.content);
    } catch {
      toast.error("Erro ao carregar dados do formulário");
    }
  };

  useEffect(() => {
    if (showSolicitacaoModal) {
      loadModalData();
    }
  }, [showSolicitacaoModal]);

  const handleCreateSolicitacao = () => {
    setShowSolicitacaoModal(true);
  };

  const handleSaveSolicitacao = () => {
    toast.success("A solicitação foi criada com sucesso a partir do email");
    setShowSolicitacaoModal(false);
  };

  const toggleDestinatarioExpand = () => {
    setIsDestinatarioExpanded(prev => !prev);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="w-8 h-8 bg-gray-300 rounded-full mx-auto mb-4"></div>
            <div className="w-32 h-4 bg-gray-300 rounded mx-auto"></div>
          </div>
          <p className="text-gray-500 mt-2">Buscando email...</p>
        </div>
      </div>
    );
  }

  if (!email) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileTextIcon className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 text-lg mb-2">Email não encontrado</p>
          <p className="text-gray-400 text-sm mb-4">O email solicitado não existe ou foi removido</p>
          <Button onClick={onBack} variant="outline">
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Voltar para lista
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-2 hover:bg-gray-100"
          >
            <ArrowLeftIcon className="h-5 w-5"/>
          </Button>
          <div className="text-sm text-gray-500">
            Email
          </div>
        </div>
      </div>

      <div className="flex flex-col overflow-y-auto custom-scrollbar">
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="text-sm text-gray-500">
              {formatDate(email?.dtRecebimento)}
            </div>

            <h1 className="text-2xl font-bold text-gray-900 leading-tight">
              {email?.dsAssunto || 'Sem assunto'}
            </h1>
          </div>

          <div className="flex flex-col">
            <div className="flex items-start space-x-4">
              <Avatar className="h-12 w-12 flex-shrink-0">
                <AvatarImage src='/images/avatar.svg' />
                <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                  {getInitials(email?.dsRemetente)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {email?.dsRemetente || 'Remetente não informado'}
                </h3>

                <div className="space-y-2 text-sm">
                  <div className="flex items-start">
                    <span className="text-gray-500 font-medium mr-2 flex-shrink-0 w-10">De:</span>
                    <span className="text-gray-900 break-all">{email?.dsRemetente}</span>
                  </div>

                  <div className="flex items-start">
                    <span className="text-gray-500 font-medium mr-2 flex-shrink-0 w-10">Para:</span>
                    <div className="flex-1">
                      <div className={`flex flex-wrap gap-2 ${isDestinatarioExpanded ? '' : 'max-h-16 overflow-hidden'}`}>
                        {email?.dsDestinatario.split(';').filter(d => d.trim()).map((destinatario: string, index: number) => (
                          <span 
                            className="text-xs bg-gray-100 px-2 py-1 rounded inline-block" 
                            key={`${destinatario.trim()}-${index}`}
                          >
                            {destinatario.trim()}
                          </span>
                        ))}
                      </div>
                      {email?.dsDestinatario && email.dsDestinatario.split(';').filter(d => d.trim()).length > 1 && (
                        <Button
                          variant="link"
                          size="sm"
                          onClick={toggleDestinatarioExpand}
                          className="p-0 h-auto text-blue-600 hover:text-blue-800 mt-2 text-xs"
                        >
                          {isDestinatarioExpanded ? 'Ver menos' : `Ver todos (${email.dsDestinatario.split(';').filter(d => d.trim()).length} destinatários)`}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-lg p-6">
            <div className="prose prose-gray max-w-none">
              <div className="whitespace-pre-wrap text-gray-900 leading-relaxed text-base email-content">
                {email?.dsCorpo || 'Conteúdo do email não disponível'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
