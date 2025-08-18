'use client';

import {FormEvent, useState} from 'react';
import {LockIcon, EnvelopeSimpleIcon} from '@phosphor-icons/react';
import {Button} from '@/components/ui/button';
import {TextField} from '@/components/ui/text-field';
import {Checkbox} from '@/components/ui/checkbox';
import {Label} from '@/components/ui/label';
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
import {PAGES_DEF} from "@/constants/pages";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  const handleSubmit = async (e: FormEvent) => {
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

        router.push(PAGES_DEF[0].path);
        setEmail('');
        setPassword('');
        setRememberMe(false);
      } catch (error) {
        setDialog({
          open: true,
          title: 'Erro de Login',
          description: 'CPF ou senha inválidos'
        });
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
            <span className="flex-1 h-0.5 rounded-full bg-gray-200/20"/>
            <h2 className="text-white font-semibold text-3xl">Log In</h2>
            <span className="flex-1 h-0.5 rounded-full bg-gray-200/20"/>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-md font-medium text-white">
              Email
            </Label>
            <div className="relative">
              <EnvelopeSimpleIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <TextField
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError('');
                }}
                placeholder="seu.email@waybrasil.com"
                error={emailError}
                disabled={isLoading}
                className={cn(
                  "h-12 border-none pl-10 text-white placeholder-gray-400",
                  "bg-gradient-to-r from-gray-200/20 via-gray-200/20 to-gray-200/20",
                  "focus-visible:via-blue-200/50 focus-visible:to-blue-300/20",
                  "transition-colors duration-200"
                )}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-md font-medium text-white">
              Senha
            </Label>
            <div className="relative">
              <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <TextField
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError('');
                }}
                placeholder="Digite sua senha"
                error={passwordError}
                disabled={isLoading}
                className={cn(
                  "h-12 border-none pl-10 pr-10 text-white placeholder-gray-400",
                  "bg-gradient-to-r from-gray-200/20 via-gray-200/20 to-gray-200/20",
                  "focus-visible:via-blue-200/50 focus-visible:to-blue-300/20",
                  "transition-colors duration-200"
                )}
              />
            </div>
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
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-white text-md font-medium transition-colors"
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