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
import path from "path";
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
    } else if (password?.length < 6) {
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
        toast.warning("Nome de usuário ou senha inválidos")
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-row items-center justify-center min-h-screen overflow-hidden gap-16 px-12">
      <form onSubmit={handleSubmit} className="flex flex-col items-center w-[45%] max-w-xl gap-28 p-8 rounded-4xl m-auto mb-80">
        <div>
          <Image
            src="/images/way-logo.png"
            alt="Logo"
            width={400}
            height={221}
            className="h-auto max-w-1/5 mx-auto"
          />
        </div>

        <div className="flex flex-col justify-center items-center gap-8 w-full ">
          <div className="flex gap-6 items-center">
            <h2 className="text-[#101A2D] font-semibold text-2xl">Software Regulatório <span className="text-[#276EEB]">Way 262</span></h2>
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
                "py-6 px-12 rounded-full border border-[#E9E9E9] placeholder-[#A3A3A3]"
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
                "py-6 px-12 rounded-full border border-[#E9E9E9] placeholder-[#A3A3A3]"
              )}
            />

            <Button
              label='Entrar'
              type="submit"
              className="py-6 w-full h-12 text-white text-md font-medium transition-colors bg-[#276EEB]"
              disabled={isLoading}
              isLoading={isLoading}
            />
          </div>
        </div>

      </form>

      <div className="relative w-[55%] h-[90vh] rounded-4xl overflow-hidden [--gap:16px]">
        {/* Imagem de fundo */}
        <Image
          src="/images/rodovia-login.jpg"
          alt="Rodovia"
          fill
          className="object-cover"
          priority
        />

        {/* Borda branca externa = metade do gap */}
        <div className="pointer-events-none absolute inset-0 z-10 rounded-4xl" />

        {/* Overlay GRID (sem gap!) */}
        {/* Overlay GRID */}
        <div className="absolute inset-0 z-20 grid gap-2 [grid-template-columns:30%_40%_30%]">
          {/* COL 1 */}
          <div className="grid grid-rows-[.66fr_1fr_1fr_.25fr] gap-2 min-w-0">
            <div
              className="
                relative
                rounded-br-4xl bg-transparent backdrop-brightness-75
                [box-shadow:0_0_0_calc(var(--gap)/2)_white]
                [--extra-br:20px]
              "
            />
            <div className="border-r-4xl bg-transparent backdrop-brightness-75 [box-shadow:0_0_0_calc(var(--gap)/2)_white]" />
            <div className="border-r-4xl bg-transparent backdrop-brightness-75 [box-shadow:0_0_0_calc(var(--gap)/2)_white]" />
            <div className="border-r-4xl bg-transparent backdrop-brightness-75 [box-shadow:0_0_0_calc(var(--gap)/2)_white]" />
          </div>

          {/* COL 2 */}
          <div className="grid grid-rows-3 gap-2 min-w-0">
            <div className=" bg-transparent backdrop-brightness-75 [box-shadow:0_0_0_calc(var(--gap)/2)_white]" />
            <div className=" bg-transparent backdrop-brightness-75 [box-shadow:0_0_0_calc(var(--gap)/2)_white]" />
            <div className=" bg-transparent backdrop-brightness-75 [box-shadow:0_0_0_calc(var(--gap)/2)_white]" />
          </div>

          {/* COL 3 */}
          <div className="grid grid-rows-5 gap-2 min-w-0">
            <div className=" bg-transparent backdrop-brightness-75 [box-shadow:0_0_0_calc(var(--gap)/2)_white]" />
            <div className=" bg-transparent backdrop-brightness-75 [box-shadow:0_0_0_calc(var(--gap)/2)_white]" />
            <div className=" bg-transparent backdrop-brightness-75 [box-shadow:0_0_0_calc(var(--gap)/2)_white]" />
            <div className=" bg-transparent backdrop-brightness-75 [box-shadow:0_0_0_calc(var(--gap)/2)_white]" />
            <div className=" bg-transparent backdrop-brightness-75 [box-shadow:0_0_0_calc(var(--gap)/2)_white]" />
          </div>
        </div>

      </div>
    </div>
  );
}