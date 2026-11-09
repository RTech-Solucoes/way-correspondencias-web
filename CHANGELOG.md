# Histórico de alterações

## 09/11/2026 · Build do MVP de teste

Atualiza o OpenNext para 1.20.13 e usa pnpm no build Cloudflare de teste.

## 15/10/2026 · MVP na Cloudflare

O MVP passa a ter build próprio para Cloudflare Workers, com ambientes de
produção e desenvolvimento separados. A publicação identifica a versão
instalada. As páginas protegidas redirecionam acessos sem sessão para o login.
O fluxo de desenvolvimento também permite publicação manual pelo GitHub Actions.
