'use client';

import authClient from "@/api/auth/client";
import concessionariaClient from "@/api/concessionaria/client";
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { PAGES_DEF } from "@/constants/pages";
import { cn } from '@/utils/utils';
import { LockIcon, UserIcon } from '@phosphor-icons/react';
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from 'react';
import { toast } from 'sonner';

import { jwtDecode } from "jwt-decode";
import { useSetPermissoes } from "@/stores/permissoes-store";
import { getLayoutClient, getLabelTitle, getLogoPath, getBackgroundLoginPath, getNomeSistema } from "@/lib/layout/layout-client";

interface TokenPayload {
  sub: string;
  exp: number;
  permissoes: string[];
}

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const setPermissoes = useSetPermissoes()

  const router = useRouter();

  const layoutClient = getLayoutClient();
  const labelTitle = getLabelTitle(layoutClient);
  const nomeSistema = getNomeSistema(layoutClient);
  const logoPath = getLogoPath(layoutClient);
  const backgroundPath = getBackgroundLoginPath(layoutClient);

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
    } else if (password?.length < 6) {
      setPasswordError('Senha deve ter pelo menos 6 caracteres');
      hasErrors = true;
    }

    if (!hasErrors) {
      setIsLoading(true);
      try {
        await authClient.login({
          username: username.trim(),
          password: password.trim()
        });

        const token = localStorage.getItem("authToken");

        if (token) {
          const decoded = jwtDecode<TokenPayload>(token);
          setPermissoes(decoded.permissoes);
          
          // Validar se o usuário tem concessionárias associadas
          const idsConcessionarias = authClient.getIdsConcessionariasFromToken();
          
          if (!idsConcessionarias || idsConcessionarias.length === 0) {
            // Remover token e limpar dados
            localStorage.removeItem('authToken');
            localStorage.removeItem('tokenType');
            localStorage.removeItem('userName');
            localStorage.removeItem('permissoes-storage');
            sessionStorage.removeItem('permissoes-storage');
            
            toast.error("Seu usuário não possui concessionárias associadas. Entre em contato com o administrador do sistema.");
            setIsLoading(false);
            return;
          }

          // Verificar se realmente existem concessionárias disponíveis para o responsável
          try {
            const concessionariasDoResponsavel = await concessionariaClient.buscarPorIdResponsavelLogado();
            
            if (!concessionariasDoResponsavel || concessionariasDoResponsavel.length === 0) {
              // Remover token e limpar dados
              localStorage.removeItem('authToken');
              localStorage.removeItem('tokenType');
              localStorage.removeItem('userName');
              localStorage.removeItem('permissoes-storage');
              sessionStorage.removeItem('permissoes-storage');
              
              toast.error("Você foi deslogado pois não possui concessionária associada ao seu usuário. Entre em contato com o administrador do sistema.");
              setIsLoading(false);
              return;
            }
          } catch {
            // Se der erro ao buscar, verificar se tem IDs no token como fallback
            if (idsConcessionarias.length === 0) {
              localStorage.removeItem('authToken');
              localStorage.removeItem('tokenType');
              localStorage.removeItem('userName');
              localStorage.removeItem('permissoes-storage');
              sessionStorage.removeItem('permissoes-storage');
              
              toast.error("Você foi deslogado pois não possui concessionária associada ao seu usuário. Entre em contato com o administrador do sistema.");
              setIsLoading(false);
              return;
            }
          }
        }

        await new Promise(resolve => setTimeout(resolve, 400));
        toast.success("Login Realizado com Sucesso.");
        
        router.push(PAGES_DEF[0].path);
        setUsername('');
        setPassword('');
      } catch {
        toast.warning("Nome de usuário ou senha inválidos")
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-row justify-center min-h-screen overflow-hidden gap-16 max-[1024px]:gap-0 px-12">
      <form onSubmit={handleSubmit} className="flex flex-col w-[45%] max-md:w-full gap-12 p-8 max-[1024px]:p-2 rounded-4xl max-[1460px]:w-[40%] min-[1440px]:max-w-[30%] justify-center mb-32">
        <div>
          <Image
            src={logoPath}
            alt="Logo"
            width={400}
            height={221}
            className="h-auto max-w-1/5 mx-auto"
          />
        </div>

        <div className="flex flex-col justify-center items-center gap-8 w-full ">
          <div className="flex gap-6 items-center">
            <h2 className="text-[#101A2D] font-semibold text-2xl text-center">{nomeSistema} <span className="text-[#276EEB]">{labelTitle}</span></h2>
          </div>

          <div className="flex flex-col gap-6 w-full">
            <TextField
              id="username"
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (usernameError) setUsernameError('');
              }}
              startIcon={UserIcon}
              placeholder="Usuário"
              error={usernameError}
              disabled={isLoading}
              inputClassName={cn(
                "py-6 px-12 h-[58px] rounded-full border border-[#E9E9E9] placeholder-[#A3A3A3]"
              )}
            />

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
              startIcon={LockIcon}
              disabled={isLoading}
              inputClassName={cn(
                "py-6 px-12 h-[58px] rounded-full border border-[#E9E9E9] placeholder-[#A3A3A3]"
              )}
            />

            <Button
              label='Entrar'
              type="submit"
              className="py-6 w-full h-[58px] text-white text-md font-medium transition-colors bg-[#276EEB]"
              disabled={isLoading}
              isLoading={isLoading}
            />
          </div>
        </div>

      </form>

      <div className="relative w-[55%] h-[90vh] m-auto rounded-4xl overflow-hidden max-[1460px]:w-[60%] hidden md:block">
        <Image
          src={backgroundPath}
          alt="Rodovia"
          fill
          className="object-center"
          priority
        />
      </div>
    </div>
  );
}