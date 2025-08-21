'use client';

import authClient from "@/api/auth/client";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { TextField } from '@/components/ui/text-field';
import { PAGES_DEF } from "@/constants/pages";
import { cn } from '@/utils/utils';
import { UserIcon, LockIcon } from '@phosphor-icons/react';
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from 'react';
import { toast } from 'sonner';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setUsernameError('');
    setPasswordError('');

    let hasErrors = false;

    if (!username) {
      setUsernameError('Username é obrigatório');
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
          username: username,
          password: password
        });


        toast.success("Login Realizado com Sucesso.")
        router.push(PAGES_DEF[0].path);
        setUsername('');
        setPassword('');
      } catch {
        toast.warning("Username ou senha inválidos")
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-landscape overflow-hidden">
      <form onSubmit={handleSubmit} className="flex flex-col w-full max-w-xl gap-6 p-8 rounded-4xl m-auto glass pop-in">
        <Image
          src="/images/logo.png"
          alt="Logo"
          width={400}
          height={221}
          className="h-auto max-w-1/5 mx-auto [filter:brightness(0)_invert(1)]"
        />
        <div className="flex gap-6 items-center ">
          <span className="flex-1 h-0.5 rounded-full bg-gray-200/20" />
          <h2 className="text-white font-semibold text-3xl">Log In</h2>
          <span className="flex-1 h-0.5 rounded-full bg-gray-200/20" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="username" className="text-md font-medium text-white">
            Nome de usuário
          </Label>
          <TextField
            id="username"
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              if (usernameError) setUsernameError('');
            }}
            leftIcon={<UserIcon className="h-5 w-5 text-gray-300" />}
            placeholder="Digite seu nome de usuário"
            error={usernameError}
            disabled={isLoading}
            className={cn(
              "h-12 border-none pl-10 text-white",
              "bg-gradient-to-r from-gray-200/20 via-gray-200/20 to-gray-200/20",
              "focus-visible:via-blue-200/50 focus-visible:to-blue-300/20",
              "transition-colors duration-200"
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-md font-medium text-white">
            Senha
          </Label>
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
            leftIcon={<LockIcon className="h-5 w-5 text-gray-300" />}
            disabled={isLoading}
            className={cn(
              "h-12 border-none pl-10 pr-10 text-white placeholder-gray-400",
              "bg-gradient-to-r from-gray-200/20 via-gray-200/20 to-gray-200/20",
              "focus-visible:via-blue-200/50 focus-visible:to-blue-300/20",
              "transition-colors duration-200"
            )}
          />
        </div>

        <Button
          label='Entrar'
          type="submit"
          className="w-full h-12 text-white text-md font-medium transition-colors"
          disabled={isLoading}
          isLoading={isLoading}
        />
      </form>
    </div>
  );
}