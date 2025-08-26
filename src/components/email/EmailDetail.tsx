'use client';

import {useEffect, useState} from 'react';
import {ArrowLeftIcon, FileTextIcon} from '@phosphor-icons/react';
import {Button} from '@/components/ui/button';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {toast} from 'sonner';
import SolicitacaoModal from '@/components/solicitacoes/SolicitacaoModal';
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
      const [responsaveisResponse, temasResponse, areasResponse] = await Promise.all([
        responsaveisClient.buscarPorFiltro({ size: 100 }),
        temasClient.buscarPorFiltro({ size: 100 }),
        areasClient.buscarPorFiltro({ size: 100 })
      ]);

      setResponsaveis(responsaveisResponse.content);
      setTemas(temasResponse.content);
      setAreas(areasResponse.content);
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

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Buscando email...</p>
        </div>
      </div>
    );
  }

  if (!email) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Email não encontrado</p>
          <Button onClick={onBack} className="mt-4">
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-2"
          >
            <ArrowLeftIcon className="h-4 w-4"/>
          </Button>
        </div>

        <Button
          size="sm"
          onClick={handleCreateSolicitacao}
        >
          <FileTextIcon className="h-4 w-4 mr-2"/>
          Criar Solicitação
        </Button>
      </div>

      <div className="flex flex-col flex-1 overflow-y-auto gap-6 p-6">
        <span className="text-sm text-gray-500">{formatDate(email?.dtRecebimento)}</span>
        <h2 className="text-2xl font-semibold truncate">{email?.dsAssunto}</h2>
        <div className="flex items-start space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src='/images/avatar.svg' />
            <AvatarFallback>
              {getInitials(email?.dsRemetente)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{email?.dsRemetente}</h3>
            <p className="text-sm text-gray-600 mb-1">De: {email?.dsRemetente}</p>
            <p className="text-sm text-gray-600">Para: {email?.dsDestinatario}</p>
          </div>
        </div>

        <div className="prose max-w-none">
          <div className="whitespace-pre-wrap text-gray-900 leading-relaxed">
            {email?.dsCorpo}
          </div>
        </div>
      </div>

      <SolicitacaoModal
        solicitacao={null}
        open={showSolicitacaoModal}
        onClose={() => setShowSolicitacaoModal(false)}
        onSave={handleSaveSolicitacao}
        responsaveis={responsaveis}
        temas={temas}
        initialSubject={email?.dsAssunto}
        initialDescription={email?.dsCorpo}
      />
    </div>
  );
}
