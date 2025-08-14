'use client';

import {useState} from 'react';
import {EyeIcon, EyeClosedIcon, LockIcon, EnvelopeIcon, WarningCircleIcon} from '@phosphor-icons/react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Checkbox} from '@/components/ui/checkbox';
import {cn} from '@/utils/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import authClient from "@/api/auth/client";
import {useRouter} from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dialog, setDialog] = useState<{ open: boolean; title: string; description: string }>({
    open: false,
    title: '',
    description: ''
  });

  const router = useRouter();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setEmailError('');
    setPasswordError('');

    let hasErrors = false;

    if (!email) {
      setEmailError('Email é obrigatório');
      hasErrors = true;
    } else if (!validateEmail(email)) {
      setEmailError('Email inválido');
      hasErrors = true;
    }

    if (!password) {
      setPasswordError('Senha é obrigatória');
      hasErrors = true;
    } else if (password.length < 6) {
      setPasswordError('Senha deve ter pelo menos 6 caracteres');
      hasErrors = true;
    }

    if (!hasErrors) {
      setIsLoading(true);
      try {
        await authClient.login({
          username: email,
          password: password
        });

        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
          localStorage.setItem('userEmail', email);
        }

        router.push('/');
        setEmail('');
        setPassword('');
        setRememberMe(false);
      } catch (error) {
        console.error('Erro no login:', error);
        setDialog({open: true, title: 'Erro', description: 'Erro ao realizar login. Tente novamente.'});
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <>
      <AlertDialog open={dialog.open} onOpenChange={(open) => setDialog(prev => ({...prev, open}))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dialog.title}</AlertDialogTitle>
            <AlertDialogDescription>{dialog.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setDialog(prev => ({...prev, open: false}))}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex flex-col items-center justify-center min-h-screen bg-landscape">
        <form onSubmit={handleSubmit} className="flex flex-col w-full max-w-xl gap-6 p-8 rounded-4xl m-auto glass pop-in">
          <Image
            src="/images/logo.png"
            alt="Logo"
            width={400}
            height={221}
            className="h-auto max-w-1/5 mx-auto [filter:brightness(0)_invert(1)]"
          />
          <div className="flex gap-6 items-center ">
            <hr className="flex-1 border-1 border-gray-300/50"/>
            <h2 className="text-white font-semibold text-3xl">Log In</h2>
            <hr className="flex-1 border-1 border-gray-300/50"/>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email" className="text-md font-medium text-white">
              Email
            </Label>
            <div className="relative">
              <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white"/>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError('');
                }}
                placeholder="seu.email@waybrasil.com"
                className={cn(
                  "pl-10 h-12 border-none",
                  "bg-gradient-to-r from-gray-200/20 via-gray-200/20 to-gray-200/20",
                  "focus-visible:via-blue-200/50 focus-visible:to-blue-300/20",
                  "transition-colors duration-200",
                  emailError && "border-red-200"
                )}
                disabled={isLoading}
              />
            </div>
            {emailError && (
              <div className="flex items-center gap-2">
                <WarningCircleIcon className="h-4 w-4 text-red-200"/>
                <p className="text-sm text-red-200">{emailError}</p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="password" className="text-md font-medium text-white">
              Senha
            </Label>
            <div className="relative">
              <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white"/>
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError('');
                }}
                placeholder="Digite sua senha"
                className={cn(
                  "pl-10 pr-10 h-12 border-none",
                  "bg-gradient-to-r from-gray-200/20 via--gray-200/20 to-gray-200/20",
                  "focus-visible:via-blue-200/50 focus-visible:to-blue-300/20",
                  "transition-colors duration-200",
                  passwordError && "border-red-200"
                )}
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeIcon className="h-4 w-4 text-white"/>
                ) : (
                  <EyeClosedIcon className="h-4 w-4 text-white"/>
                )}
              </Button>
            </div>
            {passwordError && (
              <div className="flex items-center gap-2">
                <WarningCircleIcon className="h-4 w-4 text-red-200"/>
                <p className="text-sm text-red-200">{passwordError}</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                disabled={isLoading}
              />
              <Label
                htmlFor="remember"
                className="text-sm text-white cursor-pointer"
              >
                Lembrar de mim
              </Label>
            </div>
            <Button
              type="button"
              variant="link"
              className="text-sm text-white p-0 h-auto"
              disabled={isLoading}
            >
              Esqueceu a senha?
            </Button>
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white text-md font-medium transition-colors"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                <span>Entrando...</span>
              </div>
            ) : (
              'Entrar'
            )}
          </Button>
        </form>
      </div>
    </>
  );
}