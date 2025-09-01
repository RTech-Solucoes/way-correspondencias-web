'use client';

import authClient from '@/api/auth/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { TextField } from '@/components/ui/text-field';
import { PAGES_DEF } from '@/constants/pages';
import { cn } from '@/utils/utils';
import { User as UserIcon, Lock as LockIcon, Eye, EyeSlash } from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';
import React, { FormEvent, useState } from 'react';
import { toast } from 'sonner';

/* =========================================================
   LOGIN PAGE
   ========================================================= */
export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setUsernameError('');
    setPasswordError('');

    let hasErrors = false;
    if (!username) { setUsernameError('Username é obrigatório'); hasErrors = true; }
    if (!password) { setPasswordError('Senha é obrigatória'); hasErrors = true; }
    else if (password.length < 6) { setPasswordError('Senha deve ter pelo menos 6 caracteres'); hasErrors = true; }

    if (!hasErrors) {
      setIsLoading(true);
      try {
        await authClient.login({ username, password });
        toast.success('Login Realizado com Sucesso.');
        router.push(PAGES_DEF[0].path);
        setUsername(''); setPassword('');
      } catch {
        toast.warning('Nome de usuário ou senha inválidos');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // imagem placeholder (troque quando quiser)
  const bgImage =
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2400&q=80';

  return (
    <div className="min-h-screen w-full bg-white">
      {/* aumentei a coluna do mosaico para 660px */}
      <div className="mx-auto grid max-w-[1240px] grid-cols-1 items-start gap-10 px-6 py-10 md:grid-cols-[1fr_660px]">
        {/* COLUNA ESQUERDA — formulário */}
        <div className="pt-6 md:pt-2">
          {/* Logo (texto) */}
          <div className="mb-14 md:mb-20">
            <div className="inline-flex items-end gap-1">
              <span className="text-[42px] leading-none font-black tracking-tight text-[#2563EB]">
                WAY
              </span>
              <span className="mb-[2px] text-[11px] font-semibold text-[#98A2B3]">262</span>
            </div>
          </div>

          {/* Título */}
          <h1 className="mb-8 text-[24px] font-semibold text-[#111827]">
            Software Regulatório{' '}
            <span className="font-bold text-[#2563EB]">Way 262</span>
          </h1>

          {/* Form */}
          <form onSubmit={handleSubmit} className="max-w-[460px] space-y-5">
            {/* Usuário */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-[15px] text-[#111827]">Usuário</Label>
              <TextField
                id="username"
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); if (usernameError) setUsernameError(''); }}
                startIcon={UserIcon}
                placeholder="Usuário"
                error={usernameError}
                disabled={isLoading}
                inputClassName={cn(
                  'h-[54px] rounded-[28px] border border-[#E5E7EB] bg-white pl-10 pr-4 text-[15px] text-[#111827]',
                  'placeholder-[#9CA3AF] focus-visible:border-[#A7C0FF] focus-visible:ring-0'
                )}
              />
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[15px] text-[#111827]">Senha</Label>
              <div className="relative">
                <TextField
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if (passwordError) setPasswordError(''); }}
                  placeholder="Senha"
                  error={passwordError}
                  startIcon={LockIcon}
                  disabled={isLoading}
                  inputClassName={cn(
                    'h-[54px] rounded-[28px] border border-[#E5E7EB] bg-white pl-10 pr-12 text-[15px] text-[#111827]',
                    'placeholder-[#9CA3AF] focus-visible:border-[#A7C0FF] focus-visible:ring-0'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#374151]"
                  aria-label={showPass ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPass ? <EyeSlash size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Botão */}
            <Button
              label="Entrar"
              type="submit"
              className="h-[56px] w-full rounded-[999px] bg-[#2563EB] text-[15px] font-semibold text-white hover:bg-[#1F4FCC]"
              disabled={isLoading}
              isLoading={isLoading}
            />
          </form>
        </div>

        {/* COLUNA DIREITA — mosaico em 3 colunas (4 / 3 / 5) */}
        <Mosaic
          width={660}                      // painel mais largo
          height={620}
          bgImage={bgImage}
          overlay={0.2}                   // overlay só nos tiles com blur
          colWidths={['35%', '30%', '35%']} // meio mais estreito
          gap={10}                        // gutters menores
          padding={12}                    // borda interna menor
          radius={22}
          // 4 blocos (esquerda)
          left={[
            { h: 140, blur: false },
            {
              h: 190,
              blur: true,
              content: (
                <p className="text-[22px] font-semibold leading-[1.15]">
                  Compromisso<br />com a gestão<br />das rodovias<br />concedidas.
                </p>
              ),
            },
            { h: 160, blur: false },
            { h: 50,  blur: false },
          ]}
          // 3 blocos (meio)
          middle={[
            { h: 230, blur: false },
            { h: 170, blur: false },
            { h: 210, blur: false },
          ]}
          // 5 blocos (direita)
          right={[
            { h: 170, blur: false },
            { h: 170, blur: false },
            {
              h: 180,
              blur: true,
              content: (
                <p className="text-[20px] font-semibold leading-[1.15]">
                  438,9 km de<br />concessão<br />federal, de<br />Betim à<br />Uberaba.
                </p>
              ),
            },
            { h: 230, blur: false },
            { h: 'fill', blur: false },          // encosta até o final
          ]}
        />
      </div>
    </div>
  );
}

/* =========================================================
   MOSAIC (3 colunas com alturas configuráveis + blur opcional)
   - Gaps mostram o fundo branco (gutterColor).
   - Tiles com blur exibem texto; sem blur mostram o recorte da imagem.
   ========================================================= */

type TileSpec = {
  /** altura em px (ex.: 160) ou "fill" para preencher até o rodapé da coluna */
  h: number | string;
  blur?: boolean;
  content?: React.ReactNode;
  className?: string;
};

type MosaicProps = {
  bgImage: string;
  width?: number;
  height?: number;
  colWidths?: [string | number, string | number, string | number];
  gap?: number;
  padding?: number;
  radius?: number;
  left: TileSpec[];
  middle: TileSpec[];
  right: TileSpec[];
  gutterColor?: string;
  blurAmountPx?: number;
  overlay?: number;
};

function Mosaic({
  bgImage,
  width = 620,
  height = 620,
  colWidths = ['36%', '28%', '36%'],
  gap = 12,
  padding = 14,
  radius = 22,
  left,
  middle,
  right,
  gutterColor = '#ffffff',
  blurAmountPx = 4,
  overlay = 0.25,
}: MosaicProps) {
  const innerW = width - padding * 2 - gap * 2;

  const toPx = (v: string | number) =>
    typeof v === 'number' ? v : (parseFloat(String(v)) / 100) * innerW;

  const colW0 = toPx(colWidths[0]);
  const colW1 = toPx(colWidths[1]);
  const colW2 = innerW - colW0 - colW1;

  const x0 = padding;
  const x1 = padding + colW0 + gap;
  const x2 = padding + colW0 + gap + colW1 + gap;

  type RenderTile = {
    key: string;
    x: number;
    y: number;
    w: number;
    h: number;
    blur: boolean;
    content?: React.ReactNode;
    className?: string;
  };

  // suporta "fill" no último tile da coluna
  const buildCol = (x: number, w: number, specs: TileSpec[], prefix: string): RenderTile[] => {
    let y = padding;
    const out: RenderTile[] = [];
    specs.forEach((t, i) => {
      const isLast = i === specs.length - 1;
      let h: number;

      if (String(t.h).toLowerCase() === 'fill') {
        h = Math.max(0, height - padding - y);
      } else {
        h = typeof t.h === 'number' ? t.h : parseFloat(String(t.h));
      }

      out.push({
        key: `${prefix}-${i}`,
        x, y, w, h,
        blur: !!t.blur,
        content: t.content,
        className: t.className,
      });

      if (!(isLast && String(t.h).toLowerCase() === 'fill')) {
        y += h + gap;
      } else {
        y += h;
      }
    });
    return out;
  };

  const tiles: RenderTile[] = [
    ...buildCol(x0, colW0, left, 'L'),
    ...buildCol(x1, colW1, middle, 'M'),
    ...buildCol(x2, colW2, right, 'R'),
  ];

  return (
    <div
      className="relative overflow-hidden rounded-[26px]"
      style={{ width, height, background: gutterColor }}
    >
      <div className="absolute inset-0">
        {tiles.map((t) => (
          <TileSlice
            key={t.key}
            {...t}
            panelW={width}
            panelH={height}
            radius={radius}
            bgImage={bgImage}
            blurAmountPx={blurAmountPx}
            overlay={overlay}
          />
        ))}
      </div>
    </div>
  );
}

function TileSlice({
  x, y, w, h, blur, content, className,
  radius, bgImage, panelW, panelH, blurAmountPx, overlay,
}: {
  x: number; y: number; w: number; h: number;
  blur: boolean; content?: React.ReactNode; className?: string;
  radius: number; bgImage: string; panelW: number; panelH: number;
  blurAmountPx: number; overlay: number;
}) {
  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    left: x,
    top: y,
    width: w,
    height: h,
    borderRadius: `${radius}px`,
    overflow: 'hidden',
    isolation: 'isolate',
  };

  const sliceStyle: React.CSSProperties = {
    backgroundImage: `url(${bgImage})`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: `${panelW}px ${panelH}px`,
    backgroundPosition: `-${x}px -${y}px`,
    width: '100%',
    height: '100%',
  };

  if (!blur) {
    return (
      <div style={baseStyle} className={className}>
        <div style={sliceStyle} />
      </div>
    );
  }

  return (
    <div style={baseStyle} className={className}>
      <div
        style={{
          ...sliceStyle,
          filter: `blur(${blurAmountPx}px) saturate(0.95)`,
          transform: 'translateZ(0)',
        }}
      />
      <div className="absolute inset-0 bg-white/6" />
      <div className="absolute inset-0 bg-[radial-gradient(160px_160px_at_60px_60px,rgba(41,115,255,0.25)_0%,rgba(41,115,255,0)_60%)]" />
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, rgba(0,0,0,${Math.min(
            overlay + 0.1, 0.5
          )}) 0%, rgba(0,0,0,${overlay}) 55%, rgba(0,0,0,${Math.max(
            overlay - 0.1, 0.05
          )}) 100%)`,
        }}
      />
      {content && (
        <div className="absolute inset-0 z-10 flex items-center px-6 py-6 text-white">
          {content}
        </div>
      )}
    </div>
  );
}
