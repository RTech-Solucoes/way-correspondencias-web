import Image from "next/image";

export default function ImageLogin() {
  return (
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
      <div className="pointer-events-none absolute inset-0 bg-[#0f0f0f74] z-10 rounded-4xl" />

      {/* Overlay GRID (sem gap!) */}
      {/* Overlay GRID */}
      <div className="absolute inset-0 z-20 grid gap-2 [grid-template-columns:32%_36%_32%] isolate">
        {/* COL 1 */}
        <div className="grid grid-rows-[.66fr_1fr_1fr_.25fr] gap-2 min-w-0">
          <div className="rounded-br-[calc(var(--gap)/2)] bg-transparent ... [box-shadow:0_0_0_calc(var(--gap)/4)_white]" />
          <div
            className="
                  relative overflow-hidden
                  rounded-tr-[calc(var(--gap)/2)] rounded-br-[calc(var(--gap)/2)]
                  bg-[#6D6D6D] backdrop-brightness-75
                  [box-shadow:0_0_0_calc(var(--gap)/2+1px)_white]  /* anel branco (com +1px anti-serrilhado) */
                "
          >
            {/* overlay de cor/gradiente (não bloqueia clique) */}
            <div
              className="
                  pointer-events-none absolute inset-0
                  rounded-tr-[calc(var(--gap)/2)] rounded-br-[calc(var(--gap)/2)]
                  bg-[linear-gradient(135deg,rgba(0,0,0,0.55)_0%,rgba(0,0,0,0.35)_60%,rgba(0,0,0,0.30)_100%),radial-gradient(420px_circle_at_18%_82%,rgba(46,89,243,0.35)_0%,rgba(46,89,243,0.0)_60%)]
                "
            />

            {/* conteúdo */}
            <div className="relative z-10 p-6 md:p-8 mt-20">
              <p className="text-white font-semibold leading-tight text-xl md:text-2xl lg:text-[26px] tracking-tight max-w-[22ch] drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]">
                Compromisso
                <br />com a gestão
                <br />das rodovias
                <br />concedidas.
              </p>
            </div>
          </div>
          <div className="rounded-tr-[calc(var(--gap)/2)] rounded-br-[calc(var(--gap)/2)] bg-transparent ... [box-shadow:0_0_0_calc(var(--gap)/2)_white]" />
          <div className="rounded-tr-[calc(var(--gap)/2)] bg-transparent ... [box-shadow:0_0_0_calc(var(--gap)/2)_white]" />
        </div>

        {/* COL 2 */}
        <div className="grid grid-rows-3 gap-2 min-w-0">
          <div className="rounded-bl-[calc(var(--gap)/2)] rounded-br-[calc(var(--gap)/2)] bg-transparent ... [box-shadow:0_0_0_calc(var(--gap)/2)_white]" />
          <div className="rounded-[calc(var(--gap)/2)] bg-transparent ... [box-shadow:0_0_0_calc(var(--gap)/2)_white]" />
          <div
            className="
                relative overflow-hidden
                rounded-tl-[calc(var(--gap)/2)] rounded-tr-[calc(var(--gap)/2)]
                bg-[#6D6D6D] backdrop-brightness-75
                [box-shadow:0_0_0_calc(var(--gap)/2+1px)_white]  /* anel branco (anti-serrilhado +1px) */
              "
          >
            {/* overlay/gradiente para dar contraste ao texto */}
            <div
              className="
                  pointer-events-none absolute inset-0
                  rounded-tl-[calc(var(--gap)/2)] rounded-tr-[calc(var(--gap)/2)]
                  bg-[linear-gradient(135deg,rgba(0,0,0,0.55)_0%,rgba(0,0,0,0.35)_60%,rgba(0,0,0,0.30)_100%),radial-gradient(300px_circle_at_75%_50%,#276EEB66_0%,#276EEB00_46%)]
                "
            />


            {/* conteúdo */}
            <div className="relative z-10 p-6 md:p-8 mt-10">
              <p className="text-white font-semibold leading-tight text-xl md:text-2xl lg:text-[26px] tracking-tight max-w-[24ch] drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]">
                438,9 km de<br /> concessão<br />
                federal, de <br /> Betim à <br /> Uberaba.
              </p>
            </div>
          </div>

        </div>

        {/* COL 3 */}
        <div className="grid grid-rows-[.5fr_1fr_1fr_1fr_.5fr] gap-2 min-w-0">
          <div className="rounded-bl-[calc(var(--gap)/2)] bg-transparent ... [box-shadow:0_0_0_calc(var(--gap)/2)_white]" />
          <div className="rounded-tl-[calc(var(--gap)/2)] rounded-bl-[calc(var(--gap)/2)] bg-transparent ... [box-shadow:0_0_0_calc(var(--gap)/2)_white]" />
          <div className="rounded-tl-[calc(var(--gap)/2)] rounded-bl-[calc(var(--gap)/2)] bg-transparent ... [box-shadow:0_0_0_calc(var(--gap)/2)_white]" />
          <div className="rounded-tl-[calc(var(--gap)/2)] rounded-bl-[calc(var(--gap)/2)] bg-transparent ... [box-shadow:0_0_0_calc(var(--gap)/2)_white]" />
          <div className="rounded-tl-[calc(var(--gap)/2)] bg-transparent ... [box-shadow:0_0_0_calc(var(--gap)/2)_white]" />
        </div>
      </div>

    </div>
  )
}