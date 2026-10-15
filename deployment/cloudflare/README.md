# MVP na Cloudflare

| Ambiente | Frontend | API |
| --- | --- | --- |
| Produção | `correspondencias.rtechsolution.com.br` | `api.correspondencias.rtechsolution.com.br` |
| Desenvolvimento | `develop.correspondencias.rtechsolution.com.br` | `develop.api.correspondencias.rtechsolution.com.br` |

Requer Node.js 22 ou superior e Yarn 1.22.22. Execute na raiz da aplicação:

```bash
(
  set -eu
  GITHUB_SHA="$(git rev-parse HEAD)"
  export GITHUB_SHA
  MVP_WEB_DIR="$(node deployment/cloudflare/prepare.mjs prd)"
  cd "$MVP_WEB_DIR"
  yarn install --frozen-lockfile --ignore-scripts --non-interactive
  yarn cf:build
  yarn wrangler deploy --dry-run --config wrangler.jsonc
)
```

Use `dev` no lugar de `prd` para gerar o ambiente de desenvolvimento. A preparação copia a fonte atual para um diretório temporário novo e escreve o caminho na saída padrão. Não instala dependências nem publica recursos.

Para publicar, entre no diretório gerado, confira a conta com `yarn wrangler whoami --json`
e execute `yarn wrangler deploy --config wrangler.jsonc`. A conta RTech tem ID
`3ca9471dadca9766b3dc5de098577052`. O `wrangler.jsonc` fixa a conta, o Worker e
o domínio do ambiente escolhido. O acesso à conta precisa permitir essa publicação.

O domínio deve abrir a tela de login. Depois de entrar, confira o dashboard e
abra uma correspondência com anexo. O primeiro acesso à API pode levar alguns
minutos enquanto a instância Render Free retoma a execução.

O build usa configuração pública própria do MVP e um lockfile separado. Alterações em `src/`, `public/` e nas configurações da aplicação entram na próxima preparação. Alterações de dependências exigem revisar e atualizar o `yarn.lock` deste diretório antes de repetir a instalação congelada.

O manifesto `.mvp-source-manifest.json` registra os arquivos copiados e seus hashes. O build bloqueia requisições externas, exceto o download das fontes Google.

O `middleware.ts` da raiz é copiado para `src/middleware.ts` quando a aplicação usa `src/app/` e não possui middleware nesse diretório. A fonte original é preservada.

No GitHub Actions, a preparação usa `GITHUB_SHA` para acrescentar `X-App-Revision` à resposta da página inicial. O workflow compara esse header com a revisão publicada. A configuração gerada preserva os headers originais. Sem `GITHUB_SHA`, o preview local não recebe esse header. Valores inválidos interrompem a preparação.
