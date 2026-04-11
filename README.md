# Sistema de Gestão de Correspondências

Sistema web completo para gerenciamento de correspondências, solicitações, emails e tramitações desenvolvido com Next.js 15 e TypeScript. O sistema permite gerenciar todo o fluxo de trabalho de correspondências entre concessionárias e órgãos reguladores.

## 📋 Sobre o Projeto

Este é uma plataforma de gestão de correspondências que facilita o controle e acompanhamento de solicitações, emails, tramitações e responsáveis. O sistema oferece funcionalidades completas de gestão, relatórios em PDF e Excel, controle de prazos, e muito mais. O sistema suporta múltiplos clientes com branding personalizado.

### Características Principais

- ✅ **Multi-tenant**: Suporta múltiplas concessionárias com isolamento de dados
- ✅ **Gestão completa de solicitações** com tramitações e histórico
- ✅ **Sistema de permissões** granular por perfil de usuário
- ✅ **Relatórios exportáveis** em PDF e Excel
- ✅ **Interface responsiva** e moderna
- ✅ **Sistema de notificações** em tempo real
- ✅ **Gestão de anexos** e documentos
- ✅ **Dashboard interativo** com métricas e prazos

## 🚀 Tecnologias Utilizadas

### Frontend
- **Next.js 15.4.6** - Framework React para aplicações full-stack com App Router
- **React 19.1.1** - Biblioteca JavaScript para construção de interfaces
- **TypeScript 5.6.2** - Superset JavaScript com tipagem estática
- **Tailwind CSS 4** - Framework CSS utility-first
- **Radix UI** - Componentes UI acessíveis e customizáveis
- **Framer Motion** - Biblioteca de animações
- **React Hook Form** - Gerenciamento eficiente de formulários
- **Zod** - Validação de schemas TypeScript-first
- **TanStack Query** - Gerenciamento de estado do servidor
- **@react-pdf/renderer** - Geração de relatórios PDF
- **Sonner** - Sistema de notificações toast
- **Phosphor Icons** - Biblioteca de ícones moderna

### Backend Integration
- **REST API** - Comunicação com backend Java
- **JWT Authentication** - Autenticação baseada em tokens
- **Axios/Fetch** - Cliente HTTP para requisições

## 📦 Instalação e Configuração

### Pré-requisitos

- **Node.js** 18+ ou **Bun** (recomendado)
- **npm**, **yarn** ou **bun** como gerenciador de pacotes
- **API backend** em execução e acessível (por padrão `http://localhost:8080/api`; ajuste `NEXT_PUBLIC_API_URL` se for outro host/porta)

### Passos de Instalação

1. **Clone o repositório**
   ```bash
   git clone <url-do-repositorio>
   cd way-correspondencias-web
   ```

2. **Instale as dependências**
   ```bash
   # Usando Bun (recomendado)
   bun install
   
   # Ou usando npm
   npm install
   
   # Ou usando yarn
   yarn install
   ```

3. **Configure as variáveis de ambiente**
   
   Na raiz do projeto, crie o arquivo **`.env.local`** (nome usado pelo Next.js). Não use `.env-local` — esse nome não é carregado automaticamente.
   
   Variáveis utilizadas pelo frontend (todas com prefixo `NEXT_PUBLIC_`):
   ```bash
   # URL base da API (REST)
   NEXT_PUBLIC_API_URL=http://localhost:8080/api

   # Tema/branding: "way" (Way Brasil) ou "mvp" (RTech / testes)
   NEXT_PUBLIC_LAYOUT_CLIENT=way

   # Integração LDAP: "true" ou "false" (deve estar alinhado ao backend)
   NEXT_PUBLIC_LDAP_ENABLED=false
   ```

4. **Execute o projeto em modo de desenvolvimento**
   ```bash
   bun dev
   # ou
   npm run dev
   # ou
   yarn dev
   ```

5. **Acesse a aplicação**
   
   Abra o navegador em [http://localhost:3000](http://localhost:3000). Sem o backend na URL configurada em `NEXT_PUBLIC_API_URL`, login e demais chamadas à API falharão.

## ⚙️ Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `bun dev` | Executa o projeto em modo de desenvolvimento com hot-reload |
| `bun build` | Gera build otimizado de produção |
| `bun start` | Executa o projeto em modo de produção |
| `bun lint` | Executa o ESLint para verificar qualidade do código |

## 🏗️ Estrutura do Projeto

```
src/
├── api/                          # Clients da API e tipos
│   ├── areas/                   # API de áreas organizacionais
│   ├── auth/                    # API de autenticação
│   ├── concessionaria/          # API de concessionárias
│   ├── email/                   # API de emails
│   ├── perfis/                  # API de perfis de usuário
│   ├── responsaveis/            # API de responsáveis
│   ├── solicitacoes/            # API de solicitações
│   ├── temas/                   # API de temas
│   ├── tramitacoes/             # API de tramitações
│   └── client.ts                # Cliente HTTP base
│
├── app/                          # Páginas da aplicação (App Router)
│   ├── areas/                   # Página de gestão de áreas
│   ├── dashboard-correspondencia/ # Dashboard de correspondências
│   ├── dashboard-obrigacoes/    # Dashboard de obrigações
│   ├── obrigacao/               # Fluxo de obrigações (lista, edição, conferência)
│   ├── email/                   # Página de gestão de emails
│   ├── responsaveis/            # Página de gestão de responsáveis
│   ├── solicitacoes/            # Página de gestão de solicitações
│   ├── temas/                   # Página de gestão de temas
│   ├── layout.tsx               # Layout raiz da aplicação
│   └── page.tsx                 # Página de login
│
├── components/                   # Componentes reutilizáveis
│   ├── areas/                   # Componentes específicos de áreas
│   ├── dashboard/               # Componentes do dashboard
│   ├── email/                   # Componentes específicos de emails
│   ├── layout/                  # Componentes de layout (Header, Sidebar)
│   ├── responsaveis/           # Componentes específicos de responsáveis
│   ├── solicitacoes/            # Componentes de solicitações e relatórios
│   ├── temas/                   # Componentes específicos de temas
│   └── ui/                      # Componentes de interface base
│
├── context/                      # Context API para estado global
│   ├── areas/                   # Context de áreas
│   ├── concessionaria/          # Context de concessionárias
│   ├── email/                   # Context de emails
│   ├── permissoes/              # Context de permissões
│   ├── responsaveis/             # Context de responsáveis
│   ├── solicitacoes/             # Context de solicitações
│   └── temas/                   # Context de temas
│
├── hooks/                        # Hooks customizados
│   ├── use-debounce.ts          # Hook para debounce
│   ├── use-has-permissao.ts     # Hook para verificar permissões
│   └── use-user-gestao.ts       # Hook para dados do usuário
│
├── providers/                    # Providers React
│   ├── ApiProvider.tsx          # Provider da API
│   ├── AuthGuard.tsx            # Guard de autenticação
│   └── Providers.tsx            # Provider raiz
│
├── stores/                       # Zustand stores
│   └── permissoes-store.tsx     # Store de permissões
│
├── types/                        # Tipos TypeScript globais
│   ├── auth/                    # Tipos de autenticação
│   ├── areas/                   # Tipos de áreas
│   └── ...
│
└── utils/                        # Funções utilitárias
    ├── layout-client.ts         # Helpers para layout do cliente
    ├── utils.ts                 # Utilitários gerais
    └── FormattDate.ts           # Formatação de datas
```

## 🔐 Autenticação e Segurança

O sistema utiliza autenticação baseada em **JWT (JSON Web Tokens)**:

- Tokens armazenados no `localStorage`
- Renovação automática de tokens
- Proteção de rotas com `AuthGuard`
- Sistema de permissões granular por perfil

### Como fazer login:

1. Acesse a página inicial (`/`)
2. Insira email e senha
3. O token será armazenado automaticamente
4. Você será redirecionado para o dashboard

## 📊 Funcionalidades Principais

### 1. Dashboard

O dashboard oferece uma visão geral do sistema com:
- **Métricas principais** (solicitações pendentes, em análise, etc.)
- **Calendário de prazos** com visualização mensal
- **Próximos prazos** destacados
- **Atividades recentes**
- **Board de status** de solicitações

### 2. Gestão de Solicitações

Sistema completo de gestão de solicitações com:

- ✅ **Criação e edição** de solicitações
- ✅ **Filtros avançados** (status, área, tema, datas, etc.)
- ✅ **Tramitações** com histórico completo
- ✅ **Anexos** e documentos
- ✅ **Controle de prazos** e alertas
- ✅ **Exportação** em PDF e Excel
- ✅ **Histórico de respostas** e pareceres
- ✅ **Status em tempo real**

### 3. Gestão de Emails

- Visualização de emails recebidos
- Filtros por remetente, destinatário, status
- Associação com solicitações
- Histórico completo

### 4. Gestão de Áreas

- Cadastro de áreas organizacionais
- Códigos de área padronizados (CdAreaEnum)
- Associação com concessionárias
- Filtros e busca

### 5. Gestão de Temas

- Organização por temas/categorias
- Associação com áreas
- Filtros e busca

### 6. Gestão de Responsáveis

- Cadastro completo de responsáveis
- **Obrigatório selecionar concessionárias** ao criar
- Associação com áreas e temas
- Upload de foto de perfil
- Controle de perfis e permissões

### 7. Relatórios

#### Exportação PDF
- Relatório completo de solicitações
- Layout otimizado para impressão
- Colunas ajustadas automaticamente
- Logo e branding dinâmicos por cliente

#### Exportação Excel
- Tabela formatada
- Colunas com largura ajustada
- Pronto para análise

### 8. Sistema de Concessionárias

- Seleção de concessionária no header
- Filtragem automática de dados
- Multi-seleção em formulários
- Context global para gerenciamento

## 🎨 Personalização por Cliente

O sistema suporta múltiplos clientes com branding personalizado:

### Variável de Ambiente
```bash
NEXT_PUBLIC_LAYOUT_CLIENT=way  # ou "mvp"
```

### Assets por Cliente
Os assets (logos, backgrounds, favicons) são organizados em:
- `public/images/way/` - Assets do cliente Way Brasil
- `public/images/mvp/` - Assets do cliente RTech

### Funcionalidades
- Logo dinâmico no header e login
- Background personalizado na tela de login
- Favicon específico por cliente
- Títulos e labels customizados

## 📋 Roteiro de Implantação (Novo Cliente)

### 2.1 Variáveis de Ambiente

| Variável | Descrição |
|----------|-----------|
| `NEXT_PUBLIC_LAYOUT_CLIENT` | Identificador do cliente (ex: `nome_novo_cliente`) |
| `NEXT_PUBLIC_API_URL` | DNS/URL do back-end |
| `NEXT_PUBLIC_LDAP_ENABLED` | Habilita/desabilita integração LDAP (`"true"` ou `"false"`) |

**Exemplo de configuração:**
```bash
NEXT_PUBLIC_LAYOUT_CLIENT=way
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_LDAP_ENABLED=false
```

### 2.2 Alterações no Código

#### Configurar layout do cliente

Editar o arquivo `src/lib/layout/layout-client.enum.ts` e adicionar um novo objeto JSON com os textos e imagens personalizados do cliente.

#### Adicionar assets do cliente

Criar a pasta `public/images/nome_novo_cliente/` e adicionar os arquivos de imagem.

**Assets obrigatórios:**

| Arquivo | Descrição |
|---------|-----------|
| `logo.png` | Logotipo principal do cliente |
| `favicon.ico` | Ícone da aba do navegador |
| `login-bg.png` | Imagem de fundo da tela de login |

### 2.3 Configuração LDAP

A variável `NEXT_PUBLIC_LDAP_ENABLED` controla a integração com LDAP. Use os valores literais `"true"` ou `"false"` (string), alinhados ao backend:

```bash
NEXT_PUBLIC_LDAP_ENABLED=true   # Habilita LDAP
NEXT_PUBLIC_LDAP_ENABLED=false  # Desabilita LDAP (padrão local)
```

**Importante:** Deve possuir o mesmo valor no frontend e no backend.

Quando habilitado (`"true"`):
- O botão "Gerar Senha" aparece no menu de ações dos responsáveis
- Requer a permissão `RESPONSAVEL_GERAR_SENHA` para usar a funcionalidade
- O usuário logado não pode gerar senha para si mesmo

### 2.4 Envio de senha por e-mail

O responsável com perfil **Admin** possui a opção de enviar a senha do usuário por e-mail através do botão "Gerar Senha" no menu de ações dos responsáveis.

**Requisitos:**
- `NEXT_PUBLIC_LDAP_ENABLED="true"`
- Permissão `RESPONSAVEL_GERAR_SENHA`
- Endpoint: `POST /responsaveis/{id}/gerar-senha`

### 2.5 Senha padrão para Admin (Seed – quando NÃO for LDAP)

Quando o sistema **não** está configurado com LDAP, a senha padrão para o usuário Admin é:

- **Senha padrão:** `Rtech1234`
- **Hash (bcrypt):** `$10$acPyxdXF7pqD0Ul27hrAbeyPf4yH0CfvqkpjWkaVmsO17yUp9UZ6C`

> **Nota:** Esta senha é usada apenas durante a configuração inicial ou quando LDAP está desabilitado. Em produção com LDAP, as senhas são gerenciadas pelo servidor LDAP.

## 🔧 Configuração de Desenvolvimento

### Variáveis de Ambiente

Use `.env.local` na raiz (ver passos em **Instalação e Configuração**). Resumo:

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `NEXT_PUBLIC_API_URL` | Sim | URL base da API |
| `NEXT_PUBLIC_LAYOUT_CLIENT` | Sim | `way` ou `mvp` |
| `NEXT_PUBLIC_LDAP_ENABLED` | Recomendada | `true` ou `false` |

### Estrutura da API

O sistema espera uma API REST com os seguintes endpoints:

#### Autenticação
- `POST /auth/login` - Login
- `POST /auth/logout` - Logout
- `GET /auth/me` - Dados do usuário logado

#### Solicitações
- `GET /solicitacoes` - Listar solicitações
- `POST /solicitacoes` - Criar solicitação
- `PUT /solicitacoes/:id` - Atualizar solicitação
- `GET /solicitacoes/:id` - Detalhes da solicitação

#### Outros Endpoints
- `/areas` - Gestão de áreas
- `/temas` - Gestão de temas
- `/responsaveis` - Gestão de responsáveis
- `/email` - Gestão de emails
- `/concessionarias` - Gestão de concessionárias
- `/tramitacoes` - Gestão de tramitações

## 📱 Interface e UX

### Design System
- **Componentes acessíveis** seguindo padrões WCAG
- **Tema responsivo** para desktop e mobile
- **Animações suaves** com Framer Motion
- **Loading states** com spinners e overlays
- **Feedback visual** com toasts e notificações

### Componentes UI Principais
- Dialog/Modal
- Button
- Input/TextField
- Select
- Table
- Toast/Notifications
- Loading Overlay
- Multi-select (Áreas, Concessionárias)

## 🚀 Deploy

### Build de Produção

```bash
bun build
```

### Executar em Produção

```bash
bun start
```

### Docker

O projeto inclui um `Dockerfile` para containerização:

```bash
docker build -t way-correspondencias-web .
docker run -p 3000:3000 way-correspondencias-web
```

## 🔄 CI/CD Pipeline

### Ativar Pipeline com Variáveis de Ambiente

Para ativar a pipeline de CI/CD, é necessário configurar as variáveis de ambiente no sistema de pipeline (GitHub Actions, GitLab CI, Azure DevOps, etc.).

#### Variáveis de Ambiente Obrigatórias

Configure as seguintes variáveis de ambiente na pipeline:

```bash
# URL da API backend (produção/staging)
NEXT_PUBLIC_API_URL=https://api.exemplo.com/api

# Layout do cliente (way ou mvp)
NEXT_PUBLIC_LAYOUT_CLIENT=way

NEXT_PUBLIC_LDAP_ENABLED=false

# Variáveis adicionais (se necessário)
NODE_ENV=production
```

#### Passos para Ativar a Pipeline

1. **Acesse as configurações da Pipeline**
   - No GitHub Actions: Settings → Secrets and variables → Actions
   - No GitLab CI: Settings → CI/CD → Variables
   - No Azure DevOps: Pipelines → Library → Variable groups

2. **Adicione as variáveis de ambiente**
   - Adicione cada variável como uma variável secreta ou de ambiente
   - Certifique-se de que os valores estão corretos para o ambiente de destino

3. **Atualize o arquivo de pipeline** (se necessário)
   - Verifique se o arquivo `.github/workflows/*.yml` ou similar está configurado
   - Garanta que as variáveis estão sendo passadas corretamente para o build

4. **Execute a Pipeline**
   - Faça push para a branch configurada (geralmente `main`)
   - Ou dispare manualmente a pipeline através da interface

#### Exemplo de Configuração no GitHub Actions

```yaml
env:
  NEXT_PUBLIC_API_URL: ${{ secrets.NEXT_PUBLIC_API_URL }}
  NEXT_PUBLIC_LAYOUT_CLIENT: ${{ secrets.NEXT_PUBLIC_LAYOUT_CLIENT }}
  NEXT_PUBLIC_LDAP_ENABLED: ${{ secrets.NEXT_PUBLIC_LDAP_ENABLED }}
  NODE_ENV: production
```

#### Verificação

Após configurar as variáveis:
1. Execute a pipeline
2. Verifique os logs do build
3. Confirme que as variáveis estão sendo carregadas corretamente
4. Valide o deploy em ambiente de staging/produção

> **Importante:** Nunca commite valores de produção diretamente no código. Sempre use variáveis de ambiente ou secrets do sistema de CI/CD.

## 📝 Convenções de Código

### TypeScript
- Tipagem estrita habilitada
- Interfaces para todos os tipos de API
- Enums para valores constantes

### Componentes
- Componentes funcionais com hooks
- Props tipadas com TypeScript
- Nomenclatura em PascalCase

### Estrutura de Arquivos
- Um componente por arquivo
- Pastas organizadas por feature
- Barrels exports quando necessário

## 🤝 Contribuindo

1. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
2. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
3. Push para a branch (`git push origin feature/nova-feature`)
4. Abra um Pull Request

## 📄 Licença

Este projeto é privado e proprietário.

## 👥 Equipe

Desenvolvido pela equipe RTech Solution.

> **Nota:** Este sistema suporta múltiplos clientes. Todas as referências a nomes de clientes, logos e branding são configuráveis através do sistema de layout em `src/lib/layout/layout-client.enum.ts`.

---

**Versão:** 0.1.0  
**Última atualização:** 2026
