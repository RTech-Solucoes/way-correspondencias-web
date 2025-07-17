'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Building2, CheckCircle, Users, ArrowLeft } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import RegisterForm from '@/components/auth/RegisterForm';
import { useRegister } from '@/lib/api/hooks';

const FEATURES = [
  {
    icon: Shield,
    title: 'Segurança Avançada',
    description: 'Proteção de dados com criptografia de ponta'
  },
  {
    icon: Building2,
    title: 'Compliance Regulatório',
    description: 'Conformidade com todas as normas brasileiras'
  },
  {
    icon: CheckCircle,
    title: 'Gestão Eficiente',
    description: 'Automatize processos e aumente a produtividade'
  }
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
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const { register, loading: isLoading, error: apiError } = useRegister();
  const [error, setError] = useState('');

  // Update error state when API error changes
  useEffect(() => {
    if (apiError) {
      setError(apiError);
    }
  }, [apiError]);

  const handleRegister = async (userData: RegisterData) => {
    setError('');

    try {
      // Call the register API with the raw form data
      // The API client will handle mapping to the required format
      await register(userData);
      
      // Show success message
      setSuccess(true);
      
      // Redirect to login after success message
      setTimeout(() => {
        router.push('/login?registered=true');
      }, 2000);
      
    } catch (err) {
      // Error is already set by the useRegister hook
      console.error('Registration failed:', err);
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
              Digite suas credencias para se registrar na plataforma
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
            Transforme sua gestão regulatória
          </h2>
          <p className="text-xl text-blue-100 mb-12">
            Uma solução completa para compliance, documentação e gestão de processos regulatórios.
          </p>

          {/* FEATURES */}
          <div className="space-y-8">
            {FEATURES.map((feature, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                    <feature.icon className="h-6 w-6" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-blue-100">{feature.description}</p>
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