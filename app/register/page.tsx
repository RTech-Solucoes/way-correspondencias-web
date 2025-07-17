'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Building2, CheckCircle, Users, ArrowLeft } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import RegisterForm from '@/components/auth/RegisterForm';

const BENEFITS = [
  {
    icon: Shield,
    title: 'Segurança Empresarial',
    description: 'Proteção avançada de dados corporativos com criptografia de nível bancário'
  },
  {
    icon: Building2,
    title: 'Compliance Automatizado',
    description: 'Automatize processos regulatórios e mantenha-se sempre em conformidade'
  },
  {
    icon: Users,
    title: 'Colaboração em Equipe',
    description: 'Gerencie equipes e permissões com controle granular de acesso'
  },
  {
    icon: CheckCircle,
    title: 'Auditoria Completa',
    description: 'Rastree todas as ações e mantenha histórico completo para auditorias'
  }
];

const COMPANIES = [
  'Petrobras', 'Vale', 'Itaú', 'Bradesco', 'Ambev', 'JBS'
];

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  company: string;
  phone: string;
  role: string;
  acceptTerms: boolean;
}

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleRegister = async (userData: RegisterData) => {
    setIsLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock registration - in real app, this would be an API call
      console.log('Registering user:', userData);
      
      // Simulate success
      setSuccess(true);
      
      // Redirect to login after success message
      setTimeout(() => {
        router.push('/login?registered=true');
      }, 2000);
      
    } catch (err) {
      setError('Erro ao criar conta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-8">
        <div className="w-full max-w-md text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Conta criada com sucesso!
          </h1>
          <p className="text-gray-600 mb-6">
            Sua conta foi criada com sucesso. Você será redirecionado para a página de login em instantes.
          </p>
          <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex">
      {/* Left Side - Register Form */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-lg">
          {/* Back to Login */}
          <div className="mb-6">
            <Link href="/login">
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Login
              </Button>
            </Link>
          </div>

          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-blue-600 text-white text-xl font-bold">
                  W
                </AvatarFallback>
              </Avatar>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Way Brasil
            </h1>
            <p className="text-gray-600">
              Software Regulatório
            </p>
          </div>

          {/* Welcome Message */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Crie sua conta
            </h2>
            <p className="text-gray-600">
              Junte-se a centenas de empresas que confiam no Way Brasil
            </p>
          </div>

          {/* Register Form */}
          <RegisterForm
            onRegister={handleRegister}
            isLoading={isLoading}
            error={error}
          />

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{' '}
              <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Faça login
              </Link>
            </p>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>© 2025 Way Brasil. Todos os direitos reservados.</p>
          </div>
        </div>
      </div>

      {/* Right Side - Benefits and Social Proof */}
      <div className="hidden lg:flex flex-1 bg-blue-600 text-white p-12 items-center">
        <div className="max-w-lg">
          <h2 className="text-4xl font-bold mb-6">
            Junte-se às empresas líderes
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Mais de 500 empresas já confiam no Way Brasil para sua gestão regulatória.
          </p>

          {/* Trusted Companies */}
          <div className="mb-12">
            <p className="text-blue-200 text-sm mb-4 uppercase tracking-wide">
              Empresas que confiam em nós
            </p>
            <div className="grid grid-cols-3 gap-4">
              {COMPANIES.map((company, index) => (
                <div key={index} className="bg-blue-500 bg-opacity-50 rounded-lg p-3 text-center">
                  <span className="text-sm font-medium">{company}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-6">
            {BENEFITS.map((benefit, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                    <benefit.icon className="h-6 w-6" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-blue-100 text-sm">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="flex w-full justify-between mt-12">
            <div className="text-center">
              <div className="text-4xl font-bold">100%</div>
              <div className="text-blue-200 text-sm">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold">150%+</div>
              <div className="text-blue-200 text-sm">Empresas</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold">24/7</div>
              <div className="text-blue-200 text-sm">Suporte</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}