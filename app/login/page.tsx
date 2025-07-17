'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Building2, CheckCircle } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import LoginForm from '@/components/auth/LoginForm';
import { useLogin } from '@/lib/api/hooks';

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

export default function LoginPage() {
  const [error, setError] = useState('');
  const router = useRouter();
  const { login, loading: isLoading, error: apiError } = useLogin();

  // Check for registration success message
  const [showRegistrationSuccess, setShowRegistrationSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('registered') === 'true') {
        setShowRegistrationSuccess(true);
        // Remove the parameter from URL
        // window.history.replaceState({}, '', '/login');
      }
    }
  }, []);

  // Update error state when API error changes
  useEffect(() => {
    if (apiError) {
      setError(apiError);
    }
  }, [apiError]);

  const handleLogin = async (email: string, password: string, rememberMe: boolean) => {
    setError('');

    try {
      await login(email, password);
      
      // Store remember me preference if checked
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }
      
      // Redirect to home page
      router.push('/');
    } catch (err) {
      // Error is already set by the useLogin hook
      console.error('Login failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
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
            {showRegistrationSuccess && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-medium">
                  Conta criada com sucesso! Faça login para continuar.
                </p>
              </div>
            )}
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Bem-vindo de volta
            </h2>
            <p className="text-gray-600">
              Entre com suas credenciais para acessar o sistema
            </p>
          </div>

          {/* Login Form */}
          <LoginForm
            onLogin={handleLogin}
            isLoading={isLoading}
            error={error}
          />

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Não tem uma conta?{' '}
              <Link href="/register" className="text-blue-600 hover:text-blue-700 font-medium">
                Criar conta
              </Link>
            </p>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>© 2025 Way Brasil. Todos os direitos reservados.</p>
          </div>
        </div>
      </div>

      {/* Right Side - Features */}
      <div className="hidden lg:flex flex-1 bg-blue-600 text-white p-12 items-center">
        <div className="max-w-lg">
          <h2 className="text-4xl font-bold mb-6">
            Transforme sua gestão regulatória
          </h2>
          <p className="text-xl text-blue-100 mb-12">
            Uma solução completa para compliance, documentação e gestão de processos regulatórios.
          </p>

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